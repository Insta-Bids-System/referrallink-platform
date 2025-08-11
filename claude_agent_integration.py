#!/usr/bin/env python3
"""
Claude CLI Integration for Multi-Agent System
This allows you to use the multi-agent system directly from Claude CLI
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional

# Add agents directory to path
sys.path.append(str(Path(__file__).parent / "agents"))
sys.path.append(str(Path(__file__).parent / "single_file_agents"))

from config_driven_orchestrator import ConfigDrivenOrchestrator
from spec_agent import SpecAgent
from code_agent import CodeAgent
from load_env import load_api_keys

class ClaudeAgentInterface:
    """Interface for Claude CLI to interact with the multi-agent system"""
    
    def __init__(self):
        # Load API keys
        self.keys = load_api_keys()
        if not self.keys:
            raise ValueError("API keys not configured. Please set up .env file")
        
        # Initialize orchestrator
        self.orchestrator = ConfigDrivenOrchestrator("agents/agent_config.yaml")
        
    async def execute_task(self, task_description: str, workflow: str = "feature_development") -> Dict[str, Any]:
        """
        Execute a task using the multi-agent system
        
        Args:
            task_description: What you want to build
            workflow: Type of workflow to use
        
        Returns:
            Dictionary with all generated outputs
        """
        
        print(f"\n[SYSTEM] Claude Multi-Agent System Activated")
        print(f"[TASK] {task_description}")
        print(f"[WORKFLOW] {workflow}")
        print("-" * 50)
        
        # Prepare input based on workflow
        if workflow == "feature_development":
            input_data = {
                "feature_description": task_description,
                "language": "python",
                "test_framework": "pytest"
            }
        elif workflow == "api_development":
            input_data = {
                "api_requirements": task_description
            }
        elif workflow == "refactoring_workflow":
            input_data = {
                "existing_code": task_description
            }
        else:
            input_data = {
                "description": task_description
            }
        
        # Execute workflow
        try:
            results = await self.orchestrator.execute_workflow(workflow, input_data)
            
            # Save outputs
            self._save_outputs(results, workflow)
            
            return results
            
        except Exception as e:
            print(f"[ERROR] Error executing workflow: {e}")
            return {"error": str(e)}
    
    def generate_spec(self, requirements: str) -> str:
        """Generate a specification using the spec agent"""
        
        print(f"\n[SPEC] Generating Specification...")
        
        spec_agent = SpecAgent()
        spec = spec_agent.process_task(requirements, {
            "spec_type": "feature"
        })
        
        # Save spec
        output_file = Path("generated_spec.md")
        with open(output_file, 'w') as f:
            f.write(spec)
        
        print(f"[SUCCESS] Specification saved to: {output_file}")
        return spec
    
    def generate_code(self, specification: str, language: str = "python") -> str:
        """Generate code from a specification"""
        
        print(f"\n[CODE] Generating Code...")
        
        code_agent = CodeAgent()
        code = code_agent.process_task(
            "Generate implementation based on specification",
            {
                "specifications": specification,
                "language": language
            }
        )
        
        # Save code
        extension = "py" if language == "python" else "js"
        output_file = Path(f"generated_code.{extension}")
        with open(output_file, 'w') as f:
            f.write(code)
        
        print(f"[SUCCESS] Code saved to: {output_file}")
        return code
    
    def _save_outputs(self, results: Dict[str, Any], workflow: str):
        """Save workflow outputs to files"""
        
        output_dir = Path("claude_agent_outputs") / workflow
        output_dir.mkdir(parents=True, exist_ok=True)
        
        for key, value in results.items():
            if isinstance(value, str):
                # Determine file extension
                if "spec" in key:
                    ext = ".md"
                elif "code" in key or "implementation" in key:
                    ext = ".py"
                elif "test" in key:
                    ext = "_test.py"
                elif "review" in key:
                    ext = "_review.md"
                else:
                    ext = ".txt"
                
                output_file = output_dir / f"{key}{ext}"
                with open(output_file, 'w') as f:
                    f.write(value)
                
                print(f"[SAVED] {key} to: {output_file}")

# CLI Command Functions for Claude to use

async def run_agent_workflow(task: str, workflow: str = "feature_development"):
    """Run a complete agent workflow"""
    interface = ClaudeAgentInterface()
    return await interface.execute_task(task, workflow)

def generate_specification(requirements: str):
    """Generate a technical specification"""
    interface = ClaudeAgentInterface()
    return interface.generate_spec(requirements)

def generate_implementation(spec_or_requirements: str, language: str = "python"):
    """Generate code implementation"""
    interface = ClaudeAgentInterface()
    return interface.generate_code(spec_or_requirements, language)

# Main function for direct execution
def main():
    """Main entry point for Claude CLI integration"""
    
    import argparse
    
    parser = argparse.ArgumentParser(description="Claude Multi-Agent System")
    parser.add_argument("command", choices=["workflow", "spec", "code"], 
                       help="Command to execute")
    parser.add_argument("input", help="Input description or requirements")
    parser.add_argument("--workflow", default="feature_development",
                       help="Workflow type for 'workflow' command")
    parser.add_argument("--language", default="python",
                       help="Programming language for code generation")
    
    args = parser.parse_args()
    
    if args.command == "workflow":
        asyncio.run(run_agent_workflow(args.input, args.workflow))
    elif args.command == "spec":
        generate_specification(args.input)
    elif args.command == "code":
        generate_implementation(args.input, args.language)

if __name__ == "__main__":
    main()