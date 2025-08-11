#!/bin/bash

# Setup script for AI-assisted development environment
# Based on IndyDevDan's approach

echo "🚀 Setting up AI-assisted development environment..."

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install aider-chat openai anthropic langchain pytest black pylint

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Aider if not already installed
if ! command -v aider &> /dev/null; then
    echo "🤖 Installing Aider..."
    pip install aider-chat
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p agent_sessions
mkdir -p prompts/library
mkdir -p prompts/shared
mkdir -p prompts/personal
mkdir -p outputs
mkdir -p tests

# Set up Git hooks for AI-assisted commits
echo "🪝 Setting up Git hooks..."
cat > .git/hooks/prepare-commit-msg << 'EOF'
#!/bin/bash
# Enhance commit messages with AI
if [ -z "$2" ]; then
    echo "# AI-assisted commit" >> "$1"
    echo "# Run 'aider --commit' for AI-generated commit message" >> "$1"
fi
EOF
chmod +x .git/hooks/prepare-commit-msg 2>/dev/null || true

# Create environment file template
if [ ! -f .env ]; then
    echo "🔐 Creating .env template..."
    cat > .env << 'EOF'
# API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Model Settings
DEFAULT_MODEL=gpt-4o
DEFAULT_TEMPERATURE=0.7

# Agent Settings
AGENT_MAX_RETRIES=3
AGENT_TIMEOUT=120

# Development Settings
DEBUG=false
LOG_LEVEL=info
EOF
    echo "⚠️  Please update .env with your API keys"
fi

echo "✅ Setup complete!"
echo ""
echo "📖 Quick Start Guide:"
echo "  1. Update .env with your API keys"
echo "  2. Run 'npm run agent spec \"Your feature description\"' to create specifications"
echo "  3. Run 'npm run agent code \"Implement feature\"' to generate code"
echo "  4. Run 'aider' for interactive AI coding assistance"
echo "  5. Check prompts/PROMPT_ENGINEERING.md for prompt guidelines"
echo ""
echo "🎯 Available Commands:"
echo "  - npm run aider         : Start Aider AI assistant"
echo "  - npm run agent         : Run AI agents"
echo "  - npm run dev           : Start development server"
echo "  - npm run test          : Run tests"
echo "  - npm run lint          : Run linter"
echo ""
echo "Happy coding with AI! 🤖✨"