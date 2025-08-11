# 🔐 Environment Variables for Deployment

## Important: Keep Your API Keys Secret!

When deploying to Railway or any platform, add these environment variables in the dashboard, NOT in your code.

## Required Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Supabase Configuration (Your existing Supabase project)
SUPABASE_URL=https://zyxeshuhnzkltlatsmxn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDMzODQsImV4cCI6MjA3MDQ3OTM4NH0.wCsW4Q-F3Gf5IVbXA-sA_rTmUCHjWVx2fXtXShN2qIE
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkwMzM4NCwiZXhwIjoyMDcwNDc5Mzg0fQ.T8gNeeZcIyZjEKgvoJQm40fsDpqXK7jQxwfY0plQL2c

# OpenAI Configuration (Add your actual key in Railway dashboard)
OPENAI_API_KEY=<YOUR_ACTUAL_OPENAI_KEY>
OPENAI_MODEL=gpt-4-turbo-preview

# Company Configuration
COMPANY_URL=https://instabids.ai
LINK_EXPIRY_DAYS=10

# JWT Configuration (Generate random secrets)
JWT_SECRET=<GENERATE_RANDOM_32_CHAR_STRING>
JWT_REFRESH_SECRET=<GENERATE_ANOTHER_RANDOM_32_CHAR_STRING>

# CORS Configuration
CORS_ORIGIN=https://instabids.ai,https://app.instabids.ai,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## How to Add in Railway

1. Click on your deployed service
2. Go to "Variables" tab
3. Click "Add Variable"
4. Add each key-value pair
5. Railway will automatically restart with new variables

## Security Notes

- **NEVER** commit API keys to Git
- **ALWAYS** use environment variables in production
- **ROTATE** keys regularly
- **MONITOR** usage in OpenAI dashboard

## Your OpenAI Key

The actual OpenAI API key should be added directly in Railway's dashboard.
You have it saved in your local .env file.