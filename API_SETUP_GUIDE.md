# API Keys Setup Guide

## Step 1: Get Your API Keys

### OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Name your key (e.g., "Multi-Agent System")
5. Copy the key (starts with `sk-...`)

### Anthropic (Claude) API Key
1. Go to: https://console.anthropic.com/settings/keys
2. Sign in or create an account
3. Click "Create Key"
4. Name your key (e.g., "Multi-Agent System")
5. Copy the key (starts with `sk-ant-...`)

## Step 2: Add Keys to .env File

1. Open the `.env` file in this directory
2. Replace the placeholder values:

```env
# Replace these with your actual keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Verify Setup

Run this command to verify your keys are loaded:

```bash
python -c "from agents.load_env import load_api_keys; load_api_keys()"
```

You should see:
```
✓ OpenAI API key loaded
✓ Anthropic API key loaded
```

## Step 4: Set System Environment Variables (Optional)

### Windows (Command Prompt)
```cmd
setx OPENAI_API_KEY "your-key-here"
setx ANTHROPIC_API_KEY "your-key-here"
```

### Windows (PowerShell)
```powershell
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "your-key-here", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "your-key-here", "User")
```

### macOS/Linux
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export OPENAI_API_KEY="your-key-here"
export ANTHROPIC_API_KEY="your-key-here"
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env` file to version control
- Keep your API keys secret
- Regenerate keys if exposed
- Use different keys for different projects

## Troubleshooting

### "API key not found" error
- Check `.env` file exists in project root
- Verify keys are correctly formatted
- Ensure no extra spaces or quotes

### "Invalid API key" error
- Verify key is active in provider's dashboard
- Check you're using the correct key format
- Ensure billing is set up (if required)

## Cost Management

### OpenAI Pricing
- GPT-4: ~$0.03 per 1K tokens
- GPT-3.5: ~$0.002 per 1K tokens
- Set usage limits in OpenAI dashboard

### Anthropic Pricing
- Claude 3: Check current pricing at anthropic.com
- Set usage limits in Anthropic console

## Ready to Use!

Once your keys are configured, you can run:
```bash
python run_parallel_agents.py
```

The system will automatically use your API keys for all agent operations.