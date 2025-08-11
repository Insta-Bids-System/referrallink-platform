# 🔑 Add Your OpenAI API Key - Quick Instructions

## Step 1: Get Your OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

## Step 2: Add Key to Project

1. Open this file in a text editor:
   ```
   ReferralLinkPlatform\backend\.env
   ```

2. Find this line (around line 53):
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Replace with your actual key:
   ```
   OPENAI_API_KEY=sk-proj-[your-actual-key]
   ```

## Step 3: Test It

Run this command:
```bash
cd ReferralLinkPlatform/backend
node scripts/test-real-ai.js
```

## That's it! 🎉

The test will:
- Verify your API key works
- Analyze real writing styles
- Generate actual AI messages
- Show you the results

## Troubleshooting

### If you get "Invalid API key":
- Make sure you copied the entire key
- Check for extra spaces or quotes
- Ensure the key starts with `sk-`

### If you get "Insufficient quota":
- Add billing to your OpenAI account
- Visit: https://platform.openai.com/account/billing

### Want cheaper testing?
Change the model in .env to:
```
OPENAI_MODEL=gpt-3.5-turbo
```

## Ready to see real AI in action! 🚀