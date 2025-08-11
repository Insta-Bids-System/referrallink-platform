@echo off
REM Setup script for AI-assisted development environment (Windows)
REM Based on IndyDevDan's approach

echo Setting up AI-assisted development environment...

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo Python 3 is required but not installed.
    exit /b 1
)

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is required but not installed.
    exit /b 1
)

REM Install Python dependencies
echo Installing Python dependencies...
pip install aider-chat openai anthropic langchain pytest black pylint

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

REM Install Aider if not already installed
aider --version >nul 2>&1
if errorlevel 1 (
    echo Installing Aider...
    pip install aider-chat
)

REM Create necessary directories
echo Creating project directories...
if not exist agent_sessions mkdir agent_sessions
if not exist prompts\library mkdir prompts\library
if not exist prompts\shared mkdir prompts\shared
if not exist prompts\personal mkdir prompts\personal
if not exist outputs mkdir outputs
if not exist tests mkdir tests

REM Create environment file template
if not exist .env (
    echo Creating .env template...
    (
        echo # API Keys
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo ANTHROPIC_API_KEY=your_anthropic_api_key_here
        echo.
        echo # Model Settings
        echo DEFAULT_MODEL=gpt-4o
        echo DEFAULT_TEMPERATURE=0.7
        echo.
        echo # Agent Settings
        echo AGENT_MAX_RETRIES=3
        echo AGENT_TIMEOUT=120
        echo.
        echo # Development Settings
        echo DEBUG=false
        echo LOG_LEVEL=info
    ) > .env
    echo Please update .env with your API keys
)

echo.
echo Setup complete!
echo.
echo Quick Start Guide:
echo   1. Update .env with your API keys
echo   2. Run 'npm run agent spec "Your feature description"' to create specifications
echo   3. Run 'npm run agent code "Implement feature"' to generate code
echo   4. Run 'aider' for interactive AI coding assistance
echo   5. Check prompts\PROMPT_ENGINEERING.md for prompt guidelines
echo.
echo Available Commands:
echo   - npm run aider         : Start Aider AI assistant
echo   - npm run agent         : Run AI agents
echo   - npm run dev           : Start development server
echo   - npm run test          : Run tests
echo   - npm run lint          : Run linter
echo.
echo Happy coding with AI!
pause