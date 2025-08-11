"""
Base Agent Framework - IndyDevDan Style Single File Agent
Following the principles of powerful, single-purpose AI agents
"""

import os
import json
import sys
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

class AgentRole(Enum):
    """Define agent roles for different tasks"""
    ARCHITECT = "architect"
    DEVELOPER = "developer"
    REVIEWER = "reviewer"
    TESTER = "tester"
    DEBUGGER = "debugger"
    REFACTOR = "refactor"

@dataclass
class AgentConfig:
    """Configuration for AI agents"""
    name: str
    role: AgentRole
    model: str = "gpt-4o"
    temperature: float = 0.7
    max_tokens: int = 4000
    system_prompt: str = ""

class BaseAgent:
    """Base class for all AI agents"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.conversation_history: List[Dict[str, str]] = []
        self.setup_agent()
    
    def setup_agent(self):
        """Initialize agent with role-specific settings"""
        role_prompts = {
            AgentRole.ARCHITECT: """You are an expert software architect. Your role is to:
- Design system architecture
- Create technical specifications
- Define component interfaces
- Establish best practices and patterns
- Ensure scalability and maintainability""",
            
            AgentRole.DEVELOPER: """You are an expert developer. Your role is to:
- Write clean, efficient code
- Implement features following specifications
- Follow established patterns and conventions
- Write comprehensive documentation
- Ensure code quality and performance""",
            
            AgentRole.REVIEWER: """You are an expert code reviewer. Your role is to:
- Review code for quality and correctness
- Identify bugs and potential issues
- Suggest improvements and optimizations
- Ensure adherence to coding standards
- Provide constructive feedback""",
            
            AgentRole.TESTER: """You are an expert QA engineer. Your role is to:
- Write comprehensive test cases
- Identify edge cases and scenarios
- Create unit and integration tests
- Perform thorough testing
- Document test results and issues""",
            
            AgentRole.DEBUGGER: """You are an expert debugger. Your role is to:
- Identify and fix bugs
- Analyze error messages and stack traces
- Use debugging tools effectively
- Find root causes of issues
- Implement robust fixes""",
            
            AgentRole.REFACTOR: """You are an expert at code refactoring. Your role is to:
- Improve code structure and readability
- Eliminate code duplication
- Optimize performance
- Apply design patterns appropriately
- Maintain backward compatibility"""
        }
        
        if not self.config.system_prompt:
            self.config.system_prompt = role_prompts.get(
                self.config.role, 
                "You are a helpful AI assistant."
            )
    
    def add_message(self, role: str, content: str):
        """Add a message to conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content
        })
    
    def get_context(self, max_messages: int = 10) -> List[Dict[str, str]]:
        """Get recent conversation context"""
        return self.conversation_history[-max_messages:]
    
    def process_task(self, task: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Process a task - to be implemented by specific agents"""
        raise NotImplementedError("Subclasses must implement process_task")
    
    def save_session(self, filepath: str):
        """Save agent session to file"""
        session_data = {
            "config": {
                "name": self.config.name,
                "role": self.config.role.value,
                "model": self.config.model,
                "temperature": self.config.temperature,
                "max_tokens": self.config.max_tokens
            },
            "conversation_history": self.conversation_history
        }
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump(session_data, f, indent=2)
    
    def load_session(self, filepath: str):
        """Load agent session from file"""
        with open(filepath, 'r') as f:
            session_data = json.load(f)
        
        self.conversation_history = session_data.get("conversation_history", [])
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def __str__(self):
        return f"{self.config.name} ({self.config.role.value})"