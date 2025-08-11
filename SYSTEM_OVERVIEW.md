# Multi-Agent System - Clean Installation

## System Structure

### Core Components

1. **Agents** (`agents/`)
   - `base_agent.py` - Base agent class
   - `code_agent.py` - Code generation agent
   - `spec_agent.py` - Specification agent
   - `run_agent.py` - Agent runner
   - `parallel_agent_orchestrator.py` - Parallel execution with Git worktrees
   - `config_driven_orchestrator.py` - YAML-based workflows
   - `agent_config.yaml` - Workflow configurations

2. **Single-File Agents** (`single_file_agents/`)
   - `spec_writer_agent.py` - Standalone specification generator
   - `code_improver_agent.py` - Code analysis and improvement

3. **Observability** (`observability/`)
   - `agent_monitor.py` - Monitoring server
   - `dashboard.html` - Real-time dashboard

4. **Prompts** (`prompts/`)
   - `templates.json` - Prompt templates
   - `PROMPT_ENGINEERING.md` - Guidelines

5. **Main Entry Point**
   - `run_parallel_agents.py` - Interactive system launcher

## Quick Start

### 1. Start the System
```bash
python run_parallel_agents.py
```

### 2. Available Workflows
- **feature_development** - Complete feature with specs, code, tests
- **api_development** - API design and implementation
- **refactoring_workflow** - Code improvement

### 3. Example Usage
```bash
# Generate a specification
python single_file_agents/spec_writer_agent.py "Your requirements" --output spec.md

# Run a workflow
python run_parallel_agents.py --mode config --workflow feature_development \
  --input '{"feature_description": "Your feature"}'
```

## Configuration Files
- `.aider.conf.yml` - Aider AI assistant settings
- `package.json` - Node.js dependencies
- `agent_config.yaml` - Agent workflows and settings

## Ready for Your Project
The system is now clean and ready to build your application. All test files and examples have been removed. Use the workflows to generate specifications, code, tests, and documentation for your project.