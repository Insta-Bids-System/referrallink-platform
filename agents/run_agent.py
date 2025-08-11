#!/usr/bin/env python3
"""
Agent Runner - Execute AI agents for various tasks
Following IndyDevDan's approach to autonomous agent execution
"""

import sys
import json
import argparse
from typing import Dict, Any, Optional
from pathlib import Path

# Import agents
from base_agent import AgentRole
from code_agent import CodeAgent
from spec_agent import SpecAgent

class AgentRunner:
    """Orchestrates agent execution"""
    
    def __init__(self):
        self.agents = {
            "code": CodeAgent(),
            "spec": SpecAgent()
        }
        self.session_dir = Path("agent_sessions")
        self.session_dir.mkdir(exist_ok=True)
    
    def run_agent(self, agent_type: str, task: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Run a specific agent with a task"""
        
        if agent_type not in self.agents:
            raise ValueError(f"Unknown agent type: {agent_type}")
        
        agent = self.agents[agent_type]
        print(f"\n[AGENT] Running {agent.config.name} ({agent.config.role.value})")
        print(f"[TASK] Task: {task}\n")
        
        # Process the task
        result = agent.process_task(task, context)
        
        # Save session
        session_file = self.session_dir / f"{agent_type}_session.json"
        agent.save_session(str(session_file))
        
        return result
    
    def run_workflow(self, workflow: str, initial_input: str) -> Dict[str, Any]:
        """Run a predefined workflow"""
        
        workflows = {
            "feature": self._feature_workflow,
            "api": self._api_workflow,
            "refactor": self._refactor_workflow,
            "debug": self._debug_workflow,
            "test": self._test_workflow
        }
        
        if workflow not in workflows:
            raise ValueError(f"Unknown workflow: {workflow}")
        
        print(f"\n🔄 Running workflow: {workflow}")
        return workflows[workflow](initial_input)
    
    def _feature_workflow(self, feature_description: str) -> Dict[str, Any]:
        """Complete feature implementation workflow"""
        
        results = {}
        
        # Step 1: Create specification
        print("\n📝 Step 1: Creating specification...")
        spec = self.run_agent("spec", feature_description, {
            "spec_type": "feature"
        })
        results["specification"] = spec
        
        # Step 2: Generate implementation code
        print("\n💻 Step 2: Generating implementation...")
        code = self.run_agent("code", feature_description, {
            "specifications": spec,
            "language": "python"
        })
        results["implementation"] = code
        
        # Step 3: Generate tests
        print("\n🧪 Step 3: Generating tests...")
        tests = self.agents["code"].add_tests(code, "python")
        results["tests"] = tests
        
        # Step 4: Generate documentation
        print("\n📚 Step 4: Generating documentation...")
        docs = self.agents["code"].document_code(code, "python")
        results["documentation"] = docs
        
        return results
    
    def _api_workflow(self, api_description: str) -> Dict[str, Any]:
        """API development workflow"""
        
        results = {}
        
        # Create API specification
        spec = self.run_agent("spec", api_description, {
            "spec_type": "api"
        })
        results["api_spec"] = spec
        
        # Generate API implementation
        implementation = self.run_agent("code", f"Implement API based on specification", {
            "specifications": spec,
            "language": "python",
            "requirements": ["Use FastAPI", "Include validation", "Add error handling"]
        })
        results["implementation"] = implementation
        
        return results
    
    def _refactor_workflow(self, code: str) -> Dict[str, Any]:
        """Code refactoring workflow"""
        
        results = {}
        
        # Analyze and refactor
        improvements = [
            "Improve code structure",
            "Remove duplication",
            "Enhance readability",
            "Optimize performance"
        ]
        
        refactored = self.agents["code"].refactor_code(code, "python", improvements)
        results["refactored_code"] = refactored
        
        # Add tests for refactored code
        tests = self.agents["code"].add_tests(refactored, "python")
        results["tests"] = tests
        
        return results
    
    def _debug_workflow(self, error_description: str) -> Dict[str, Any]:
        """Debugging workflow"""
        
        results = {}
        
        # Analyze error
        analysis = self.run_agent("code", f"Analyze and fix error: {error_description}", {
            "task_type": "debug"
        })
        results["analysis"] = analysis
        
        return results
    
    def _test_workflow(self, code: str) -> Dict[str, Any]:
        """Testing workflow"""
        
        results = {}
        
        # Generate comprehensive tests
        tests = self.agents["code"].add_tests(code, "python", "pytest")
        results["unit_tests"] = tests
        
        # Generate integration tests
        integration_tests = self.run_agent("code", "Generate integration tests", {
            "existing_code": code,
            "test_type": "integration"
        })
        results["integration_tests"] = integration_tests
        
        return results

def main():
    """Main entry point"""
    
    parser = argparse.ArgumentParser(description="Run AI agents for development tasks")
    parser.add_argument("command", choices=["agent", "workflow"], help="Run mode")
    parser.add_argument("type", help="Agent type or workflow name")
    parser.add_argument("input", help="Task description or input file")
    parser.add_argument("--context", help="Additional context (JSON)", default="{}")
    parser.add_argument("--output", help="Output file path")
    
    args = parser.parse_args()
    
    runner = AgentRunner()
    
    # Parse context
    context = json.loads(args.context)
    
    # Get input
    if Path(args.input).exists():
        with open(args.input, 'r') as f:
            input_data = f.read()
    else:
        input_data = args.input
    
    # Run command
    if args.command == "agent":
        result = runner.run_agent(args.type, input_data, context)
    else:  # workflow
        result = runner.run_workflow(args.type, input_data)
    
    # Output results
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        if isinstance(result, dict):
            with open(output_path, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\n[OK] Results saved to {output_path}")
        else:
            with open(output_path, 'w') as f:
                f.write(result)
            print(f"\n[OK] Results saved to {output_path}")
    else:
        print("\n[RESULTS]:")
        print("-" * 50)
        if isinstance(result, dict):
            print(json.dumps(result, indent=2))
        else:
            print(result)

if __name__ == "__main__":
    main()