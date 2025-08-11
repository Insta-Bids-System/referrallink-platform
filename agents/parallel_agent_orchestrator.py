#!/usr/bin/env python3
"""
Parallel Agent Orchestrator - IndyDevDan's Multi-Agent System
Using Git worktrees for true parallel agent execution
"""

import os
import sys
import json
import subprocess
import threading
import queue
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, as_completed

@dataclass
class AgentTask:
    """Represents a task for an agent"""
    id: str
    agent_type: str
    task: str
    worktree_path: str
    dependencies: List[str] = None
    context: Dict[str, Any] = None
    status: str = "pending"
    result: Any = None

class ParallelAgentOrchestrator:
    """
    Orchestrates multiple agents running in parallel using Git worktrees
    Following IndyDevDan's approach for multi-agent systems
    """
    
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.worktrees_dir = self.base_path / ".agent_worktrees"
        self.tasks: Dict[str, AgentTask] = {}
        self.results_queue = queue.Queue()
        self.max_parallel_agents = 10  # Claude Code supports up to 10 concurrent agents
        
    def setup_worktrees(self, num_agents: int = 5):
        """Create Git worktrees for parallel agent execution"""
        
        # Initialize git if not already
        if not (self.base_path / ".git").exists():
            print("Initializing Git repository...")
            subprocess.run(["git", "init"], cwd=self.base_path, check=True)
            subprocess.run(["git", "add", "."], cwd=self.base_path, check=True)
            subprocess.run(["git", "commit", "-m", "Initial commit for agent worktrees"], 
                         cwd=self.base_path, check=True)
        
        # Create worktrees directory
        self.worktrees_dir.mkdir(exist_ok=True)
        
        # Create worktrees for each agent
        for i in range(num_agents):
            worktree_path = self.worktrees_dir / f"agent_{i}"
            
            if not worktree_path.exists():
                print(f"Creating worktree for agent {i}...")
                subprocess.run([
                    "git", "worktree", "add", 
                    str(worktree_path), 
                    "HEAD"
                ], cwd=self.base_path, check=True)
                
        print(f"✅ {num_agents} worktrees ready for parallel execution")
        
    def add_task(self, task_id: str, agent_type: str, task: str, 
                 dependencies: List[str] = None, context: Dict[str, Any] = None):
        """Add a task to the orchestration queue"""
        
        # Assign to next available worktree
        worktree_idx = len(self.tasks) % self.max_parallel_agents
        worktree_path = str(self.worktrees_dir / f"agent_{worktree_idx}")
        
        agent_task = AgentTask(
            id=task_id,
            agent_type=agent_type,
            task=task,
            worktree_path=worktree_path,
            dependencies=dependencies or [],
            context=context or {}
        )
        
        self.tasks[task_id] = agent_task
        print(f"📋 Added task {task_id} for {agent_type} agent")
        
    def execute_task(self, task: AgentTask) -> Any:
        """Execute a single agent task in its worktree"""
        
        print(f"🚀 Starting {task.id} in {task.worktree_path}")
        task.status = "running"
        
        # Change to worktree directory
        original_dir = os.getcwd()
        
        try:
            os.chdir(task.worktree_path)
            
            # Import and run the appropriate agent
            sys.path.insert(0, str(Path(task.worktree_path) / "agents"))
            
            if task.agent_type == "spec":
                from spec_agent import SpecAgent
                agent = SpecAgent()
            elif task.agent_type == "code":
                from code_agent import CodeAgent
                agent = CodeAgent()
            else:
                raise ValueError(f"Unknown agent type: {task.agent_type}")
            
            # Process the task
            result = agent.process_task(task.task, task.context)
            
            task.status = "completed"
            task.result = result
            
            print(f"✅ Completed {task.id}")
            return result
            
        except Exception as e:
            task.status = "failed"
            task.result = str(e)
            print(f"❌ Failed {task.id}: {e}")
            raise
            
        finally:
            os.chdir(original_dir)
            
    def can_execute(self, task: AgentTask) -> bool:
        """Check if a task's dependencies are completed"""
        
        for dep_id in task.dependencies:
            if dep_id in self.tasks:
                dep_task = self.tasks[dep_id]
                if dep_task.status != "completed":
                    return False
        return True
        
    def execute_parallel(self) -> Dict[str, Any]:
        """Execute all tasks in parallel, respecting dependencies"""
        
        print(f"\n🔄 Starting parallel execution of {len(self.tasks)} tasks")
        
        with ThreadPoolExecutor(max_workers=self.max_parallel_agents) as executor:
            futures = {}
            pending_tasks = list(self.tasks.values())
            running_tasks = []
            completed_tasks = []
            
            while pending_tasks or running_tasks:
                # Submit tasks that are ready
                for task in pending_tasks[:]:
                    if self.can_execute(task):
                        future = executor.submit(self.execute_task, task)
                        futures[future] = task
                        running_tasks.append(task)
                        pending_tasks.remove(task)
                        
                # Check for completed tasks
                if futures:
                    done, not_done = as_completed(futures, timeout=1), futures
                    
                    for future in done:
                        task = futures[future]
                        try:
                            result = future.result()
                            completed_tasks.append(task)
                            running_tasks.remove(task)
                            
                            # Update context for dependent tasks
                            for pending_task in pending_tasks:
                                if task.id in pending_task.dependencies:
                                    if pending_task.context is None:
                                        pending_task.context = {}
                                    pending_task.context[f"{task.id}_result"] = result
                                    
                        except Exception as e:
                            print(f"Task {task.id} failed: {e}")
                            running_tasks.remove(task)
                            
                        del futures[future]
                        
                time.sleep(0.1)  # Small delay to prevent CPU spinning
                
        print(f"\n✅ Parallel execution complete!")
        print(f"  - Completed: {len(completed_tasks)}")
        print(f"  - Failed: {len([t for t in self.tasks.values() if t.status == 'failed'])}")
        
        # Return all results
        return {
            task_id: task.result 
            for task_id, task in self.tasks.items()
        }
        
    def visualize_execution_plan(self):
        """Visualize the execution plan with dependencies"""
        
        print("\n📊 Execution Plan:")
        print("-" * 50)
        
        for task_id, task in self.tasks.items():
            deps = f" (depends on: {', '.join(task.dependencies)})" if task.dependencies else ""
            print(f"  {task_id}: {task.agent_type} agent{deps}")
            print(f"    └─ {task.task[:50]}...")
            
        print("-" * 50)

class MultiAgentWorkflow:
    """
    Predefined multi-agent workflows following IndyDevDan's patterns
    """
    
    @staticmethod
    def feature_development_workflow(feature_description: str) -> ParallelAgentOrchestrator:
        """
        Complete feature development with parallel agents
        """
        
        orchestrator = ParallelAgentOrchestrator()
        orchestrator.setup_worktrees(5)
        
        # Define the workflow tasks
        orchestrator.add_task(
            "spec",
            "spec",
            f"Create detailed specification for: {feature_description}",
            dependencies=[],
            context={"spec_type": "feature"}
        )
        
        orchestrator.add_task(
            "backend_impl",
            "code",
            "Implement backend based on specification",
            dependencies=["spec"],
            context={"language": "python", "component": "backend"}
        )
        
        orchestrator.add_task(
            "frontend_impl",
            "code",
            "Implement frontend based on specification",
            dependencies=["spec"],
            context={"language": "typescript", "component": "frontend"}
        )
        
        orchestrator.add_task(
            "api_impl",
            "code",
            "Implement API layer based on specification",
            dependencies=["spec"],
            context={"language": "python", "component": "api"}
        )
        
        orchestrator.add_task(
            "backend_tests",
            "code",
            "Generate backend tests",
            dependencies=["backend_impl"],
            context={"test_framework": "pytest"}
        )
        
        orchestrator.add_task(
            "frontend_tests",
            "code",
            "Generate frontend tests",
            dependencies=["frontend_impl"],
            context={"test_framework": "jest"}
        )
        
        orchestrator.add_task(
            "integration_tests",
            "code",
            "Generate integration tests",
            dependencies=["backend_impl", "frontend_impl", "api_impl"],
            context={"test_framework": "playwright"}
        )
        
        orchestrator.add_task(
            "documentation",
            "spec",
            "Generate comprehensive documentation",
            dependencies=["backend_impl", "frontend_impl", "api_impl"],
            context={"spec_type": "documentation"}
        )
        
        return orchestrator
    
    @staticmethod
    def microservice_workflow(service_description: str) -> ParallelAgentOrchestrator:
        """
        Create a complete microservice with parallel agents
        """
        
        orchestrator = ParallelAgentOrchestrator()
        orchestrator.setup_worktrees(6)
        
        # Architecture specification
        orchestrator.add_task(
            "architecture",
            "spec",
            f"Design microservice architecture for: {service_description}",
            dependencies=[],
            context={"spec_type": "architecture"}
        )
        
        # Database design
        orchestrator.add_task(
            "database",
            "spec",
            "Design database schema",
            dependencies=["architecture"],
            context={"spec_type": "database"}
        )
        
        # API specification
        orchestrator.add_task(
            "api_spec",
            "spec",
            "Create API specification",
            dependencies=["architecture"],
            context={"spec_type": "api"}
        )
        
        # Parallel implementation
        orchestrator.add_task(
            "service_impl",
            "code",
            "Implement microservice",
            dependencies=["architecture", "database", "api_spec"],
            context={"language": "python", "framework": "fastapi"}
        )
        
        orchestrator.add_task(
            "docker_config",
            "code",
            "Create Docker configuration",
            dependencies=["service_impl"],
            context={"type": "dockerfile"}
        )
        
        orchestrator.add_task(
            "k8s_config",
            "code",
            "Create Kubernetes manifests",
            dependencies=["docker_config"],
            context={"type": "kubernetes"}
        )
        
        return orchestrator

def main():
    """Example usage of parallel agent orchestration"""
    
    print("""
╔════════════════════════════════════════════╗
║   Parallel Agent Orchestration System      ║
║   IndyDevDan's Multi-Agent Approach        ║
╚════════════════════════════════════════════╝
    """)
    
    # Example 1: Feature development with parallel agents
    print("\n📦 Example: Feature Development Workflow")
    print("-" * 50)
    
    workflow = MultiAgentWorkflow.feature_development_workflow(
        "Real-time chat system with message history and user presence"
    )
    
    # Visualize the plan
    workflow.visualize_execution_plan()
    
    # Execute in parallel
    results = workflow.execute_parallel()
    
    # Save results
    output_dir = Path("outputs/parallel_execution")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for task_id, result in results.items():
        output_file = output_dir / f"{task_id}_result.txt"
        with open(output_file, 'w') as f:
            f.write(str(result))
            
    print(f"\n📁 Results saved to {output_dir}")
    
if __name__ == "__main__":
    main()