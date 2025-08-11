# AI-Powered Development Environment 🤖

*Built following IndyDevDan's Principled AI Coding approach*

This project implements a comprehensive AI-assisted development environment with autonomous agents, prompt engineering templates, and integrated workflows for modern software development.

## 🚀 Features

- **AI Agents**: Specialized agents for different development tasks
  - Specification Agent: Creates detailed technical specs
  - Code Agent: Generates implementation code
  - Review Agent: Performs code reviews
  - Test Agent: Generates comprehensive tests
  
- **Aider Integration**: Configured for optimal AI pair programming
- **Prompt Templates**: Pre-built prompts for common tasks
- **MCP Tools**: Multiple Model Context Protocol tools integrated
- **Workflow Automation**: Complete feature development workflows

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- Git
- API keys for OpenAI or Anthropic

## 🛠️ Installation

### Windows
```bash
cd scripts
setup.bat
```

### macOS/Linux
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## ⚙️ Configuration

1. **API Keys**: Update `.env` with your API keys:
```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

2. **Aider Settings**: Configured in `.aider.conf.yml`
3. **Agent Settings**: Modify agents behavior in `agents/` directory

## 🎯 Usage

### Running AI Agents

#### Create a Specification
```bash
python agents/run_agent.py agent spec "Create a user authentication system"
```

#### Generate Code
```bash
python agents/run_agent.py agent code "Implement login function" --context '{"language": "python"}'
```

#### Run Complete Workflow
```bash
python agents/run_agent.py workflow feature "User authentication system"
```

### Using Aider

Start interactive AI coding session:
```bash
aider
```

With specific files:
```bash
aider src/main.py tests/test_main.py
```

### Available NPM Scripts

```bash
npm run aider          # Start Aider
npm run agent          # Run agents
npm run dev            # Development server
npm run test           # Run tests
npm run lint           # Lint code
npm run format         # Format code
```

## 📁 Project Structure

```
.
├── agents/              # AI agent implementations
│   ├── base_agent.py    # Base agent class
│   ├── code_agent.py    # Code generation agent
│   ├── spec_agent.py    # Specification agent
│   └── run_agent.py     # Agent runner
├── prompts/             # Prompt engineering resources
│   ├── templates.json   # Prompt templates
│   ├── PROMPT_ENGINEERING.md # Guidelines
│   ├── library/         # Successful prompts
│   ├── shared/          # Team prompts
│   └── personal/        # Personal prompts
├── scripts/             # Setup and utility scripts
├── agent_sessions/      # Agent conversation history
├── outputs/             # Generated outputs
├── .aider.conf.yml      # Aider configuration
├── .env                 # Environment variables
└── package.json         # Node.js configuration
```

## 🔄 Workflows

### Feature Development Workflow

1. **Specification Phase**
   - Create detailed technical specification
   - Define requirements and constraints
   - Establish acceptance criteria

2. **Implementation Phase**
   - Generate code based on specification
   - Follow established patterns
   - Ensure production readiness

3. **Testing Phase**
   - Generate comprehensive tests
   - Include edge cases
   - Verify functionality

4. **Documentation Phase**
   - Generate API documentation
   - Add code comments
   - Create user guides

### Example: Complete Feature Implementation

```bash
# 1. Create specification
python agents/run_agent.py agent spec "E-commerce shopping cart" \
  --output outputs/cart_spec.md

# 2. Generate implementation
python agents/run_agent.py agent code "Implement based on spec" \
  --context '{"specifications": "outputs/cart_spec.md", "language": "python"}' \
  --output src/shopping_cart.py

# 3. Generate tests
python agents/run_agent.py agent code "Create tests" \
  --context '{"existing_code": "src/shopping_cart.py", "test_framework": "pytest"}' \
  --output tests/test_shopping_cart.py

# 4. Run complete workflow
python agents/run_agent.py workflow feature "E-commerce shopping cart"
```

## 🎨 Prompt Engineering

### Best Practices

1. **Be Specific**: Clear, detailed instructions
2. **Provide Context**: Include relevant background
3. **Set Constraints**: Define boundaries and requirements
4. **Include Examples**: Show desired output format
5. **Define Success**: Clear acceptance criteria

### Template Structure

```json
{
  "task": "Description of what needs to be done",
  "context": "Relevant background information",
  "requirements": ["Requirement 1", "Requirement 2"],
  "constraints": ["Constraint 1", "Constraint 2"],
  "examples": ["Example input/output"],
  "success_criteria": ["Criterion 1", "Criterion 2"]
}
```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run specific test:
```bash
pytest tests/test_agents.py
```

Generate test coverage:
```bash
pytest --cov=agents tests/
```

## 🔍 MCP Tools Available

- **Ref**: Reference tools for code navigation
- **Refactor**: Code refactoring assistance
- **Storybook**: UI component development
- **Frontend-preview**: Live preview for frontend
- **Playwright**: E2E testing automation
- **Semgrep**: Static analysis
- **ESLint**: JavaScript linting

List all MCP tools:
```bash
claude mcp list
```

## 📚 Documentation

- [Prompt Engineering Guide](prompts/PROMPT_ENGINEERING.md)
- [Agent Documentation](agents/README.md)
- [Workflow Patterns](docs/WORKFLOWS.md)
- [Best Practices](docs/BEST_PRACTICES.md)

## 🤝 Contributing

1. Use AI agents for specification before implementation
2. Follow prompt engineering guidelines
3. Generate tests with code
4. Document using AI assistance
5. Use Aider for complex changes

## 🐛 Troubleshooting

### Common Issues

**API Key Errors**
- Ensure `.env` file has valid API keys
- Check API quota and limits

**Agent Failures**
- Review agent_sessions/ for error logs
- Verify Python dependencies installed
- Check file permissions

**Aider Issues**
- Run `aider --help` for configuration options
- Check `.aider.conf.yml` for settings
- Ensure Git repository initialized

## 📈 Performance Tips

1. **Cache Responses**: Reuse agent sessions when possible
2. **Batch Operations**: Process multiple files together
3. **Optimize Prompts**: Refine prompts for efficiency
4. **Use Appropriate Models**: Balance cost vs. capability
5. **Parallel Processing**: Run independent agents concurrently

## 🎓 Learning Resources

- [IndyDevDan YouTube Channel](https://youtube.com/@IndyDevDan)
- [Aider Documentation](https://aider.chat)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/best-practices)
- [Anthropic Claude Guide](https://www.anthropic.com/claude)

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- IndyDevDan for the AI coding methodology
- Aider team for the excellent tool
- OpenAI and Anthropic for the AI models
- The open-source community

---

**Remember**: "Build faster, code smarter, and stay ahead in the Generative AI Age!" - IndyDevDan

Happy AI-Assisted Coding! 🚀🤖