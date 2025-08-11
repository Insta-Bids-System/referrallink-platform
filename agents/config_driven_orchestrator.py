#!/usr/bin/env python3
"""
Configuration-Driven Agent Orchestrator
Following IndyDevDan's approach to declarative agent workflows
"""

import os
import yaml
import json
import asyncio
import aiohttp
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from string import Template
import time
from datetime import datetime

@dataclass
class AgentConfig:
    """Configuration for an individual agent"""
    name: str
    model: str
    temperature: float
    max_tokens: int
    role: str
    system_prompt: str
    capabilities: List[str]

@dataclass
class WorkflowStep:
    """A single step in a workflow"""
    agent: str
    task: str
    input: str
    output: str
    parallel: bool = False
    dependencies: List[str] = None

class ConfigDrivenOrchestrator:
    """
    Orchestrates agents based on YAML configuration
    Following IndyDevDan's configuration-driven approach
    """
    
    def __init__(self, config_path: str = "agent_config.yaml"):
        self.config_path = Path(config_path)
        self.config = self._load_config()
        self.agents = self._initialize_agents()
        self.prompts = self.config.get('prompts', {})
        self.variables = self.config.get('variables', {})
        self.context = {}  # Workflow context for variable storage
        self.monitoring_enabled = self.config.get('monitoring', {}).get('enabled', False)
        
    def _load_config(self) -> Dict:
        """Load configuration from YAML file"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
            
        with open(self.config_path, 'r') as f:
            config = yaml.safe_load(f)
            
        # Expand environment variables
        self._expand_env_vars(config)
        
        return config
        
    def _expand_env_vars(self, config: Dict):
        """Expand environment variables in configuration"""
        
        def expand_value(value):
            if isinstance(value, str) and value.startswith('${') and value.endswith('}'):
                env_var = value[2:-1]
                return os.environ.get(env_var, value)
            elif isinstance(value, dict):
                for k, v in value.items():
                    value[k] = expand_value(v)
            elif isinstance(value, list):
                value = [expand_value(item) for item in value]
            return value
            
        for key, value in config.items():
            config[key] = expand_value(value)
            
    def _initialize_agents(self) -> Dict[str, AgentConfig]:
        """Initialize agents from configuration"""
        agents = {}
        
        for agent_id, agent_data in self.config.get('agents', {}).items():
            agents[agent_id] = AgentConfig(
                name=agent_data['name'],
                model=agent_data['model'],
                temperature=agent_data['temperature'],
                max_tokens=agent_data['max_tokens'],
                role=agent_data['role'],
                system_prompt=agent_data['system_prompt'],
                capabilities=agent_data.get('capabilities', [])
            )
            
        return agents
        
    def _parse_workflow(self, workflow_name: str) -> List[WorkflowStep]:
        """Parse workflow steps from configuration"""
        
        workflow = self.config['workflows'].get(workflow_name)
        if not workflow:
            raise ValueError(f"Workflow '{workflow_name}' not found in configuration")
            
        steps = []
        for step_data in workflow['steps']:
            step = WorkflowStep(
                agent=step_data['agent'],
                task=step_data['task'],
                input=step_data['input'],
                output=step_data['output'],
                parallel=step_data.get('parallel', False),
                dependencies=step_data.get('dependencies', [])
            )
            steps.append(step)
            
        return steps
        
    def _resolve_variables(self, text: str) -> str:
        """Resolve variables in text using context"""
        
        # First, apply default variables
        merged_context = {**self.variables, **self.context}
        
        # Use Template for variable substitution
        template = Template(text)
        
        # Safe substitute to avoid KeyError for missing variables
        resolved = template.safe_substitute(merged_context)
        
        # Handle nested references like {specification}
        import re
        pattern = r'\{([^}]+)\}'
        
        def replace_match(match):
            var_name = match.group(1)
            if var_name in merged_context:
                return str(merged_context[var_name])
            return match.group(0)
            
        resolved = re.sub(pattern, replace_match, resolved)
        
        return resolved
        
    async def _execute_agent_task(self, agent_config: AgentConfig, task: str, input_data: str) -> str:
        """Execute a single agent task"""
        
        start_time = time.time()
        
        # Get prompt template if available
        prompt_template = self.prompts.get(task, {}).get('template', '')
        
        if prompt_template:
            # Use template and replace {input} with actual input
            prompt = prompt_template.replace('{input}', input_data)
        else:
            prompt = f"Task: {task}\n\nInput:\n{input_data}"
            
        # Resolve any variables in the prompt
        prompt = self._resolve_variables(prompt)
        
        # Log the execution
        print(f"\n[AGENT] {agent_config.name} executing: {task}")
        print(f"   Model: {agent_config.model} | Temp: {agent_config.temperature}")
        
        # Send monitoring event if enabled
        if self.monitoring_enabled:
            await self._send_monitoring_event({
                "event_type": "task_start",
                "agent_id": agent_config.name,
                "task": task,
                "timestamp": datetime.now().isoformat()
            })
        
        # Simulate agent execution (replace with actual API call)
        result = await self._call_llm_api(agent_config, prompt)
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        # Send completion event
        if self.monitoring_enabled:
            await self._send_monitoring_event({
                "event_type": "task_complete",
                "agent_id": agent_config.name,
                "task": task,
                "duration_ms": duration_ms,
                "timestamp": datetime.now().isoformat()
            })
        
        print(f"   [OK] Completed in {duration_ms}ms")
        
        return result
        
    async def _call_llm_api(self, agent_config: AgentConfig, prompt: str) -> str:
        """Call the LLM API (placeholder - implement actual API calls)"""
        
        # This is a placeholder - implement actual API calls here
        # For now, return a simulated response
        
        await asyncio.sleep(0.5)  # Simulate API latency
        
        return f"""[{agent_config.name} Response]
Task completed successfully.

Based on the input provided, here's the generated output:
- Processed the request using {agent_config.model}
- Applied temperature: {agent_config.temperature}
- Role: {agent_config.role}

[Actual implementation would call OpenAI/Anthropic API here]

Input received: {prompt[:200]}...
"""
        
    async def _send_monitoring_event(self, event_data: Dict):
        """Send event to monitoring system"""
        
        monitoring_config = self.config.get('monitoring', {})
        endpoint = monitoring_config.get('endpoint')
        
        if not endpoint:
            return
            
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(endpoint, json=event_data) as response:
                    if response.status != 200:
                        print(f"Warning: Monitoring event failed: {response.status}")
        except Exception as e:
            print(f"Warning: Could not send monitoring event: {e}")
            
    async def execute_workflow(self, workflow_name: str, initial_input: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a complete workflow"""
        
        print(f"\n[WORKFLOW] Starting workflow: {workflow_name}")
        print("=" * 60)
        
        # Initialize context with initial input
        self.context = initial_input.copy()
        
        # Parse workflow steps
        steps = self._parse_workflow(workflow_name)
        
        # Group steps for parallel execution
        execution_groups = self._group_steps_for_parallel_execution(steps)
        
        # Execute each group
        for group_idx, group in enumerate(execution_groups):
            print(f"\n[GROUP] Execution Group {group_idx + 1}/{len(execution_groups)}")
            
            if len(group) > 1:
                print(f"   Running {len(group)} tasks in parallel...")
                
                # Execute parallel tasks
                tasks = []
                for step in group:
                    agent_config = self.agents[step.agent]
                    input_data = self._resolve_variables(step.input)
                    task = asyncio.create_task(
                        self._execute_agent_task(agent_config, step.task, input_data)
                    )
                    tasks.append((step, task))
                    
                # Wait for all parallel tasks
                for step, task in tasks:
                    result = await task
                    self.context[step.output] = result
                    
            else:
                # Execute single task
                step = group[0]
                agent_config = self.agents[step.agent]
                input_data = self._resolve_variables(step.input)
                result = await self._execute_agent_task(agent_config, step.task, input_data)
                self.context[step.output] = result
                
        print("\n" + "=" * 60)
        print(f"[SUCCESS] Workflow '{workflow_name}' completed successfully!")
        
        return self.context
        
    def _group_steps_for_parallel_execution(self, steps: List[WorkflowStep]) -> List[List[WorkflowStep]]:
        """Group steps that can be executed in parallel"""
        
        groups = []
        current_group = []
        
        for i, step in enumerate(steps):
            if i == 0 or not step.parallel:
                # Start new group
                if current_group:
                    groups.append(current_group)
                current_group = [step]
            else:
                # Add to current group if parallel
                current_group.append(step)
                
        if current_group:
            groups.append(current_group)
            
        return groups
        
    def list_workflows(self) -> List[str]:
        """List available workflows"""
        return list(self.config.get('workflows', {}).keys())
        
    def list_agents(self) -> List[str]:
        """List available agents"""
        return list(self.agents.keys())
        
    def get_workflow_info(self, workflow_name: str) -> Dict:
        """Get information about a workflow"""
        
        workflow = self.config['workflows'].get(workflow_name)
        if not workflow:
            return {"error": f"Workflow '{workflow_name}' not found"}
            
        return {
            "name": workflow['name'],
            "description": workflow['description'],
            "steps": len(workflow['steps']),
            "agents_used": list(set(step['agent'] for step in workflow['steps']))
        }

async def main():
    """Example usage of configuration-driven orchestrator"""
    
    print("""
╔════════════════════════════════════════════╗
║   Configuration-Driven Agent Orchestrator  ║
║   IndyDevDan's Declarative Approach        ║
╚════════════════════════════════════════════╝
    """)
    
    # Initialize orchestrator
    orchestrator = ConfigDrivenOrchestrator("agent_config.yaml")
    
    # List available workflows
    print("\n📚 Available Workflows:")
    for workflow in orchestrator.list_workflows():
        info = orchestrator.get_workflow_info(workflow)
        print(f"   - {workflow}: {info['description']}")
        print(f"     Steps: {info['steps']} | Agents: {', '.join(info['agents_used'])}")
    
    # Example: Execute feature development workflow
    print("\n" + "=" * 60)
    print("🚀 Executing Feature Development Workflow")
    print("=" * 60)
    
    initial_input = {
        "feature_description": "User authentication system with OAuth2 support",
        "language": "python",
        "test_framework": "pytest"
    }
    
    results = await orchestrator.execute_workflow("feature_development", initial_input)
    
    # Save results
    output_dir = Path("outputs/workflow_results")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"feature_development_{timestamp}.json"
    
    with open(output_file, 'w') as f:
        # Convert context to serializable format
        serializable_results = {
            k: v if isinstance(v, (str, int, float, bool, list, dict)) else str(v)
            for k, v in results.items()
        }
        json.dump(serializable_results, f, indent=2)
        
    print(f"\n📁 Results saved to: {output_file}")
    
    # Display summary
    print("\n📊 Workflow Summary:")
    print(f"   - Total outputs generated: {len(results)}")
    print(f"   - Outputs: {', '.join(results.keys())}")

if __name__ == "__main__":
    asyncio.run(main())