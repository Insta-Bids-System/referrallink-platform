#!/usr/bin/env python3
"""
Multi-Agent Observability System
Following IndyDevDan's approach: Claude Agents → Hooks → HTTP → SQLite → WebSocket → Client
"""

import json
import sqlite3
import asyncio
import websockets
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from http.server import HTTPServer, BaseHTTPRequestHandler
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AgentEvent:
    """Represents an event from an agent"""
    timestamp: str
    agent_id: str
    session_id: str
    event_type: str  # tool_use, notification, prompt_submit, completion
    data: Dict[str, Any]
    status: str  # started, completed, failed
    duration_ms: Optional[int] = None

class ObservabilityDatabase:
    """SQLite database for storing agent events"""
    
    def __init__(self, db_path: str = "agent_events.db"):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """Initialize the database schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                data TEXT NOT NULL,
                status TEXT NOT NULL,
                duration_ms INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_session_id ON agent_events(session_id)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_agent_id ON agent_events(agent_id)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_timestamp ON agent_events(timestamp)
        """)
        
        conn.commit()
        conn.close()
        
    def insert_event(self, event: AgentEvent):
        """Insert an event into the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO agent_events 
            (timestamp, agent_id, session_id, event_type, data, status, duration_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            event.timestamp,
            event.agent_id,
            event.session_id,
            event.event_type,
            json.dumps(event.data),
            event.status,
            event.duration_ms
        ))
        
        conn.commit()
        conn.close()
        
    def get_events(self, session_id: Optional[str] = None, 
                   agent_id: Optional[str] = None,
                   limit: int = 100) -> List[Dict]:
        """Retrieve events from the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = "SELECT * FROM agent_events WHERE 1=1"
        params = []
        
        if session_id:
            query += " AND session_id = ?"
            params.append(session_id)
            
        if agent_id:
            query += " AND agent_id = ?"
            params.append(agent_id)
            
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        
        columns = [desc[0] for desc in cursor.description]
        events = []
        
        for row in cursor.fetchall():
            event = dict(zip(columns, row))
            event['data'] = json.loads(event['data'])
            events.append(event)
            
        conn.close()
        return events

class AgentEventHandler(BaseHTTPRequestHandler):
    """HTTP server to receive events from Claude Code hooks"""
    
    database = ObservabilityDatabase()
    websocket_clients = set()
    
    def do_POST(self):
        """Handle POST requests from Claude Code hooks"""
        
        if self.path == "/agent-event":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                event_data = json.loads(post_data.decode('utf-8'))
                
                # Create AgentEvent
                event = AgentEvent(
                    timestamp=event_data.get('timestamp', datetime.now().isoformat()),
                    agent_id=event_data.get('agent_id', 'unknown'),
                    session_id=event_data.get('session_id', 'default'),
                    event_type=event_data.get('event_type', 'unknown'),
                    data=event_data.get('data', {}),
                    status=event_data.get('status', 'unknown'),
                    duration_ms=event_data.get('duration_ms')
                )
                
                # Store in database
                self.database.insert_event(event)
                
                # Broadcast to WebSocket clients
                asyncio.run(self.broadcast_event(event))
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode())
                
                logger.info(f"Recorded event: {event.event_type} from {event.agent_id}")
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                logger.error(f"Error processing event: {e}")
        else:
            self.send_response(404)
            self.end_headers()
            
    async def broadcast_event(self, event: AgentEvent):
        """Broadcast event to all WebSocket clients"""
        if self.websocket_clients:
            message = json.dumps(asdict(event))
            disconnected = set()
            
            for client in self.websocket_clients:
                try:
                    await client.send(message)
                except:
                    disconnected.add(client)
                    
            # Remove disconnected clients
            self.websocket_clients -= disconnected

class WebSocketServer:
    """WebSocket server for real-time event streaming"""
    
    def __init__(self, host: str = "localhost", port: int = 8765):
        self.host = host
        self.port = port
        self.clients = set()
        
    async def handle_client(self, websocket, path):
        """Handle WebSocket client connections"""
        
        # Register client
        self.clients.add(websocket)
        AgentEventHandler.websocket_clients = self.clients
        
        logger.info(f"WebSocket client connected. Total clients: {len(self.clients)}")
        
        try:
            # Send initial data
            db = ObservabilityDatabase()
            recent_events = db.get_events(limit=50)
            await websocket.send(json.dumps({
                "type": "initial",
                "events": recent_events
            }))
            
            # Keep connection alive
            async for message in websocket:
                # Handle client messages if needed
                pass
                
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            # Unregister client
            self.clients.remove(websocket)
            AgentEventHandler.websocket_clients = self.clients
            logger.info(f"WebSocket client disconnected. Total clients: {len(self.clients)}")
            
    async def start(self):
        """Start the WebSocket server"""
        logger.info(f"Starting WebSocket server on ws://{self.host}:{self.port}")
        async with websockets.serve(self.handle_client, self.host, self.port):
            await asyncio.Future()  # Run forever

class ObservabilityServer:
    """Main observability server combining HTTP and WebSocket"""
    
    def __init__(self, http_port: int = 8080, ws_port: int = 8765):
        self.http_port = http_port
        self.ws_port = ws_port
        
    def run_http_server(self):
        """Run the HTTP server in a thread"""
        server = HTTPServer(('localhost', self.http_port), AgentEventHandler)
        logger.info(f"HTTP server listening on http://localhost:{self.http_port}")
        server.serve_forever()
        
    def run_websocket_server(self):
        """Run the WebSocket server"""
        ws_server = WebSocketServer(port=self.ws_port)
        asyncio.run(ws_server.start())
        
    def start(self):
        """Start both servers"""
        
        # Start HTTP server in a thread
        http_thread = threading.Thread(target=self.run_http_server)
        http_thread.daemon = True
        http_thread.start()
        
        # Start WebSocket server in main thread
        self.run_websocket_server()

class AgentMetrics:
    """Calculate metrics from agent events"""
    
    def __init__(self, db: ObservabilityDatabase):
        self.db = db
        
    def get_session_summary(self, session_id: str) -> Dict:
        """Get summary statistics for a session"""
        
        events = self.db.get_events(session_id=session_id, limit=1000)
        
        if not events:
            return {"error": "No events found"}
            
        summary = {
            "session_id": session_id,
            "total_events": len(events),
            "agents": list(set(e['agent_id'] for e in events)),
            "event_types": {},
            "status_counts": {},
            "total_duration_ms": 0,
            "start_time": None,
            "end_time": None
        }
        
        for event in events:
            # Count event types
            event_type = event['event_type']
            summary['event_types'][event_type] = summary['event_types'].get(event_type, 0) + 1
            
            # Count statuses
            status = event['status']
            summary['status_counts'][status] = summary['status_counts'].get(status, 0) + 1
            
            # Sum durations
            if event['duration_ms']:
                summary['total_duration_ms'] += event['duration_ms']
                
            # Track time range
            timestamp = event['timestamp']
            if not summary['start_time'] or timestamp < summary['start_time']:
                summary['start_time'] = timestamp
            if not summary['end_time'] or timestamp > summary['end_time']:
                summary['end_time'] = timestamp
                
        return summary
        
    def get_agent_performance(self, agent_id: str) -> Dict:
        """Get performance metrics for a specific agent"""
        
        events = self.db.get_events(agent_id=agent_id, limit=1000)
        
        if not events:
            return {"error": "No events found"}
            
        performance = {
            "agent_id": agent_id,
            "total_tasks": len([e for e in events if e['event_type'] == 'task']),
            "success_rate": 0,
            "avg_duration_ms": 0,
            "event_breakdown": {}
        }
        
        completed = len([e for e in events if e['status'] == 'completed'])
        failed = len([e for e in events if e['status'] == 'failed'])
        
        if completed + failed > 0:
            performance['success_rate'] = completed / (completed + failed)
            
        durations = [e['duration_ms'] for e in events if e['duration_ms']]
        if durations:
            performance['avg_duration_ms'] = sum(durations) / len(durations)
            
        return performance

def main():
    """Main entry point for the observability system"""
    
    print("""
====================================================
   Multi-Agent Observability System
   Real-time monitoring for Claude agents
====================================================
    """)
    
    print("\n[*] Starting observability server...")
    print("  HTTP endpoint: http://localhost:8080/agent-event")
    print("  WebSocket: ws://localhost:8765")
    print("\nConfigure Claude Code hooks to POST events to the HTTP endpoint")
    print("Connect monitoring dashboard to WebSocket for real-time updates")
    print("\nPress Ctrl+C to stop the server")
    
    server = ObservabilityServer()
    
    try:
        server.start()
    except KeyboardInterrupt:
        print("\n\n[*] Shutting down observability server...")

if __name__ == "__main__":
    main()