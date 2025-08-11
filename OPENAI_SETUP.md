# OpenAI API Setup Guide

## How to Get Your OpenAI API Key

1. **Create OpenAI Account**:
   - Go to https://platform.openai.com/signup
   - Sign up or log in to your account

2. **Get API Key**:
   - Navigate to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name (e.g., "ReferralLink Platform")
   - Copy the key (starts with `sk-`)
   - **IMPORTANT**: Save this key securely - you won't be able to see it again!

3. **Add Billing** (Required for GPT-4):
   - Go to https://platform.openai.com/account/billing
   - Add a payment method
   - Set usage limits if desired

## Add Key to Your Project

1. **Edit the .env file**:
   ```bash
   # Open the file at:
   ReferralLinkPlatform/backend/.env
   ```

2. **Replace the placeholder**:
   ```env
   # Change this line:
   OPENAI_API_KEY=sk-your-actual-api-key-here
   
   # To your actual key:
   OPENAI_API_KEY=sk-proj-abcdef123456...
   ```

3. **Choose Your Model** (Optional):
   ```env
   # Options:
   OPENAI_MODEL=gpt-3.5-turbo        # Cheapest, fast, good for basic tasks
   OPENAI_MODEL=gpt-4-turbo-preview  # Best balance of cost and quality
   OPENAI_MODEL=gpt-4                # Most accurate but expensive
   ```

## Pricing Estimates

### GPT-3.5-turbo (Recommended for testing)
- **Input**: $0.0005 per 1K tokens
- **Output**: $0.0015 per 1K tokens
- **Cost per user analysis**: ~$0.01
- **Cost per 5 messages**: ~$0.005

### GPT-4-turbo
- **Input**: $0.01 per 1K tokens
- **Output**: $0.03 per 1K tokens
- **Cost per user analysis**: ~$0.03
- **Cost per 5 messages**: ~$0.02

### GPT-4
- **Input**: $0.03 per 1K tokens
- **Output**: $0.06 per 1K tokens
- **Cost per user analysis**: ~$0.06
- **Cost per 5 messages**: ~$0.04

## Test Your Setup

After adding your API key:

1. **Restart the backend**:
   ```bash
   cd ReferralLinkPlatform/backend
   npm run dev
   ```

2. **Run the real AI test**:
   ```bash
   node scripts/test-real-ai.js
   ```

## Security Best Practices

1. **Never commit your API key**:
   - The `.env` file should be in `.gitignore`
   - Never share your key publicly

2. **Set usage limits**:
   - Go to OpenAI dashboard
   - Set monthly spending limits
   - Monitor usage regularly

3. **Use environment variables**:
   - Always use `process.env.OPENAI_API_KEY`
   - Never hardcode keys in source code

4. **Rotate keys regularly**:
   - Generate new keys periodically
   - Delete old keys after rotation

## Troubleshooting

### "Invalid API Key" Error
- Check that key starts with `sk-`
- Ensure no extra spaces or quotes
- Verify key hasn't been revoked

### "Insufficient Quota" Error
- Add billing information to OpenAI account
- Check usage limits haven't been exceeded
- Upgrade to paid plan if on free tier

### "Model Not Found" Error
- Ensure you have access to GPT-4 (requires payment history)
- Try using `gpt-3.5-turbo` instead
- Check model name spelling

### Rate Limiting
- OpenAI has rate limits per minute
- Implement retry logic with delays
- Consider caching responses

## Example API Key Format

```env
# Correct format (example - not a real key):
OPENAI_API_KEY=sk-proj-K7x9mN3pQ2rS5tU8vW1yZ4aB6cD9eF2gH3jK5mN7pQ9rS3tU6vW8yZ1

# Common mistakes:
OPENAI_API_KEY="sk-proj-..."  # Don't use quotes
OPENAI_API_KEY= sk-proj-...    # Don't have spaces
OPENAI_API_KEY=your-key-here   # Must be actual key
```

## Ready to Test!

Once you've added your key, the AI features will:
- Analyze writing styles from real text
- Generate personalized messages
- Adapt to different platforms
- Provide intelligent suggestions

Run `node scripts/test-real-ai.js` to see it in action!