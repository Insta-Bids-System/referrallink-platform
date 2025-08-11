#!/usr/bin/env python3
"""
Main Parallel Agent Execution Script
Following IndyDevDan's multi-agent orchestration approach
"""

import os
import sys
import asyncio
import argparse
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

# Add agents directory to path
sys.path.append(str(Path(__file__).parent / "agents"))
sys.path.append(str(Path(__file__).parent / "single_file_agents"))

from parallel_agent_orchestrator import ParallelAgentOrchestrator, MultiAgentWorkflow
from config_driven_orchestrator import ConfigDrivenOrchestrator

def print_banner():
    """Print welcome banner"""
    print("""
====================================================================
                                                                
     Multi-Agent Parallel Execution System                      
                                                                
     Following IndyDevDan's Agentic Engineering Approach       
     "Prompts are the new fundamental unit of programming"     
                                                                
====================================================================
    """)

async def run_parallel_workflow(workflow_type: str, description: str):
    """Run a parallel workflow using Git worktrees"""
    
    print(f"\nStarting Parallel Workflow: {workflow_type}")
    print("=" * 60)
    
    if workflow_type == "feature":
        orchestrator = MultiAgentWorkflow.feature_development_workflow(description)
    elif workflow_type == "microservice":
        orchestrator = MultiAgentWorkflow.microservice_workflow(description)
    else:
        print(f"ERROR: Unknown workflow type: {workflow_type}")
        return
    
    # Visualize execution plan
    orchestrator.visualize_execution_plan()
    
    # Execute in parallel
    print("\nExecuting agents in parallel...")
    results = orchestrator.execute_parallel()
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = Path("outputs") / "parallel_execution" / timestamp
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for task_id, result in results.items():
        output_file = output_dir / f"{task_id}.txt"
        with open(output_file, 'w') as f:
            f.write(str(result))
    
    print(f"\nResults saved to: {output_dir}")
    return results

async def run_config_driven_workflow(workflow_name: str, input_data: Dict):
    """Run a configuration-driven workflow"""
    
    print(f"\nStarting Config-Driven Workflow: {workflow_name}")
    print("=" * 60)
    
    try:
        orchestrator = ConfigDrivenOrchestrator("agents/agent_config.yaml")
        
        # Show workflow info
        info = orchestrator.get_workflow_info(workflow_name)
        print(f"\nWorkflow Details:")
        print(f"   Name: {info['name']}")
        print(f"   Description: {info['description']}")
        print(f"   Steps: {info['steps']}")
        print(f"   Agents: {', '.join(info['agents_used'])}")
        
        # Execute workflow
        results = await orchestrator.execute_workflow(workflow_name, input_data)
        
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = Path("outputs") / "config_driven" / f"{workflow_name}_{timestamp}.json"
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Convert to serializable format
        serializable_results = {
            k: v if isinstance(v, (str, int, float, bool, list, dict)) else str(v)
            for k, v in results.items()
        }
        
        with open(output_file, 'w') as f:
            json.dump(serializable_results, f, indent=2)
        
        print(f"\nResults saved to: {output_file}")
        return results
        
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def run_single_file_agent(agent_type: str, input_file: str, **kwargs):
    """Run a single-file agent"""
    
    print(f"\nRunning Single-File Agent: {agent_type}")
    print("=" * 60)
    
    if agent_type == "spec_writer":
        from spec_writer_agent import SpecWriterAgent
        
        with open(input_file, 'r') as f:
            requirements = f.read()
        
        agent = SpecWriterAgent()
        spec = agent.create_specification(requirements, kwargs.get('context', {}))
        
        output_file = kwargs.get('output', 'specification.md')
        with open(output_file, 'w') as f:
            f.write(spec)
        
        print(f"SUCCESS: Specification saved to: {output_file}")
        return spec
        
    elif agent_type == "code_improver":
        from code_improver_agent import CodeImproverAgent
        
        with open(input_file, 'r') as f:
            code = f.read()
        
        agent = CodeImproverAgent()
        result = agent.improve_code(
            code=code,
            language=kwargs.get('language', 'python'),
            focus_areas=kwargs.get('focus_areas', ['all'])
        )
        
        output_file = kwargs.get('output', 'improved_code.py')
        with open(output_file, 'w') as f:
            f.write(result.improved_code)
        
        print(f"SUCCESS: Improved code saved to: {output_file}")
        print(f"Issues found: {len(result.issues_found)}")
        print(f"Improvements: {', '.join(result.improvements_made)}")
        
        return result
        
    else:
        print(f"ERROR: Unknown agent type: {agent_type}")
        return None

async def interactive_mode():
    """Interactive mode for selecting and running workflows"""
    
    while True:
        print("\n" + "=" * 60)
        print("Select Operation Mode:")
        print("=" * 60)
        print("1. Parallel Workflow (Git Worktrees)")
        print("2. Config-Driven Workflow (YAML)")
        print("3. Single-File Agent")
        print("4. Start Observability Dashboard")
        print("5. View Documentation")
        print("6. Exit")
        
        choice = input("\nEnter choice (1-6): ").strip()
        
        if choice == "1":
            print("\nAvailable Parallel Workflows:")
            print("   - feature: Complete feature development")
            print("   - microservice: Microservice creation")
            
            workflow = input("\nEnter workflow type: ").strip()
            description = input("Enter description: ").strip()
            
            await run_parallel_workflow(workflow, description)
            
        elif choice == "2":
            orchestrator = ConfigDrivenOrchestrator("agents/agent_config.yaml")
            workflows = orchestrator.list_workflows()
            
            print("\nAvailable Config-Driven Workflows:")
            for wf in workflows:
                info = orchestrator.get_workflow_info(wf)
                print(f"   - {wf}: {info['description']}")
            
            workflow = input("\nEnter workflow name: ").strip()
            
            # Get input data
            print("\nEnter input data (JSON format):")
            input_str = input().strip()
            input_data = json.loads(input_str) if input_str else {}
            
            await run_config_driven_workflow(workflow, input_data)
            
        elif choice == "3":
            print("\nAvailable Single-File Agents:")
            print("   - spec_writer: Create technical specifications")
            print("   - code_improver: Improve existing code")
            
            agent = input("\nEnter agent type: ").strip()
            input_file = input("Enter input file path: ").strip()
            output_file = input("Enter output file path (optional): ").strip()
            
            kwargs = {'output': output_file} if output_file else {}
            
            run_single_file_agent(agent, input_file, **kwargs)
            
        elif choice == "4":
            print("\nStarting Observability Dashboard...")
            print("   HTTP Server: http://localhost:8080")
            print("   WebSocket: ws://localhost:8765")
            print("   Dashboard: Open observability/dashboard.html in browser")
            
            # Start observability server
            os.system("python observability/agent_monitor.py")
            
        elif choice == "5":
            print("\nDocumentation:")
            print("   - README.md: Project overview")
            print("   - prompts/PROMPT_ENGINEERING.md: Prompt guidelines")
            print("   - agents/agent_config.yaml: Workflow configuration")
            print("\nLearn more:")
            print("   - YouTube: @IndyDevDan")
            print("   - Principle: 'Prompts are the new fundamental unit of programming'")
            
        elif choice == "6":
            print("\nGoodbye! Happy AI-Assisted Coding!")
            break
        
        else:
            print("Invalid choice. Please try again.")

async def main():
    """Main entry point"""
    
    parser = argparse.ArgumentParser(
        description="Multi-Agent Parallel Execution System - IndyDevDan Style"
    )
    
    parser.add_argument(
        "--mode",
        choices=["parallel", "config", "single", "interactive"],
        default="interactive",
        help="Execution mode"
    )
    
    parser.add_argument(
        "--workflow",
        help="Workflow name or type"
    )
    
    parser.add_argument(
        "--input",
        help="Input data or file path"
    )
    
    parser.add_argument(
        "--output",
        help="Output directory or file"
    )
    
    parser.add_argument(
        "--config",
        default="agents/agent_config.yaml",
        help="Configuration file for config-driven mode"
    )
    
    args = parser.parse_args()
    
    print_banner()
    
    if args.mode == "interactive" or not args.workflow:
        await interactive_mode()
        
    elif args.mode == "parallel":
        if not args.workflow or not args.input:
            print("ERROR: Parallel mode requires --workflow and --input")
            sys.exit(1)
        
        await run_parallel_workflow(args.workflow, args.input)
        
    elif args.mode == "config":
        if not args.workflow:
            print("ERROR: Config mode requires --workflow")
            sys.exit(1)
        
        input_data = json.loads(args.input) if args.input else {}
        await run_config_driven_workflow(args.workflow, input_data)
        
    elif args.mode == "single":
        if not args.workflow or not args.input:
            print("ERROR: Single mode requires --workflow and --input")
            sys.exit(1)
        
        run_single_file_agent(args.workflow, args.input, output=args.output)
    
    print("\nExecution complete!")

if __name__ == "__main__":
    asyncio.run(main())