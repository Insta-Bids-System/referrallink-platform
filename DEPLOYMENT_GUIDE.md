# 🚀 ReferralLink Platform - Deployment Guide

## Production Deployment - Complete Setup

### Prerequisites
- Node.js 18+ installed
- Git installed
- Supabase project configured (✅ Already done)
- OpenAI API key configured (✅ Already done)
- Domain for production deployment

## 🔧 Environment Setup

### 1. Production Environment Variables

Create a `.env.production` file in the backend folder:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
BASE_URL=https://your-domain.com

# Supabase Configuration (Already configured)
SUPABASE_URL=https://zyxeshuhnzkltlatsmxn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDMzODQsImV4cCI6MjA3MDQ3OTM4NH0.wCsW4Q-F3Gf5IVbXA-sA_rTmUCHjWVx2fXtXShN2qIE
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkwMzM4NCwiZXhwIjoyMDcwNDc5Mzg0fQ.T8gNeeZcIyZjEKgvoJQm40fsDpqXK7jQxwfY0plQL2c

# Company Configuration
COMPANY_URL=https://instabids.ai
LINK_EXPIRY_DAYS=10

# OpenAI Configuration (Already configured)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# JWT Configuration
JWT_SECRET=your-production-secret-key-change-this
JWT_REFRESH_SECRET=your-production-refresh-secret-change-this

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📱 Mobile App Deployment

### For Expo (Managed Workflow)

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Login to Expo**:
```bash
eas login
```

3. **Configure EAS Build**:
```bash
cd ReferralLinkPlatform/mobile
eas build:configure
```

4. **Update app.json**:
```json
{
  "expo": {
    "name": "ReferralLink",
    "slug": "referrallink",
    "version": "1.0.0",
    "owner": "your-expo-username",
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      },
      "API_URL": "https://your-backend-domain.com"
    }
  }
}
```

5. **Build for iOS**:
```bash
eas build --platform ios
```

6. **Build for Android**:
```bash
eas build --platform android
```

7. **Submit to App Stores**:
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## 🌐 Backend Deployment Options

### Option 1: Deploy to Railway (Recommended)

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Login and Initialize**:
```bash
railway login
railway init
```

3. **Deploy**:
```bash
cd ReferralLinkPlatform/backend
railway up
```

4. **Set Environment Variables**:
```bash
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=https://zyxeshuhnzkltlatsmxn.supabase.co
# Set all other variables from .env.production
```

### Option 2: Deploy to Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Create vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

3. **Deploy**:
```bash
cd ReferralLinkPlatform/backend
vercel --prod
```

### Option 3: Deploy to Heroku

1. **Create Heroku app**:
```bash
heroku create referrallink-backend
```

2. **Set buildpack**:
```bash
heroku buildpacks:set heroku/nodejs
```

3. **Deploy**:
```bash
git push heroku main
```

4. **Set environment variables**:
```bash
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://zyxeshuhnzkltlatsmxn.supabase.co
# Set all other variables
```

### Option 4: Deploy to AWS EC2

1. **Launch EC2 Instance**:
   - Use Ubuntu 22.04 LTS
   - Open ports 80, 443, 5000

2. **SSH into instance and setup**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-repo/referrallink.git
cd referrallink/ReferralLinkPlatform/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Paste production environment variables

# Start with PM2
pm2 start src/index.js --name referrallink-backend
pm2 save
pm2 startup
```

3. **Setup Nginx**:
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/referrallink

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

sudo ln -s /etc/nginx/sites-available/referrallink /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

4. **Setup SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🐳 Docker Deployment

### 1. Build Docker Image

```bash
cd ReferralLinkPlatform/backend
docker build -t referrallink-backend .
```

### 2. Run with Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: referrallink-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - COMPANY_URL=https://instabids.ai
    restart: unless-stopped
```

Run:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## ☸️ Kubernetes Deployment

### 1. Create Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: referrallink-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: referrallink-backend
  template:
    metadata:
      labels:
        app: referrallink-backend
    spec:
      containers:
      - name: backend
        image: referrallink-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: referrallink-secrets
              key: supabase-url
```

### 2. Apply Configuration

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## 📊 Monitoring Setup

### 1. Health Check Endpoints

The backend provides these endpoints for monitoring:
- `GET /health` - Basic health check
- `GET /api/metrics` - Application metrics
- `GET /api/admin/health` - Detailed system health

### 2. Setup Monitoring with Datadog

```bash
# Install Datadog agent
DD_AGENT_MAJOR_VERSION=7 DD_API_KEY=your-api-key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

### 3. Setup Alerts

Configure alerts for:
- API response time > 500ms
- Error rate > 1%
- Database connection failures
- OpenAI API failures

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS everywhere
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Enable audit logging
- [ ] Review CORS settings
- [ ] Rotate API keys regularly

## 🚦 Post-Deployment Testing

### 1. Test API Endpoints

```bash
# Health check
curl https://your-domain.com/health

# Create test user
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test AI generation
curl -X POST https://your-domain.com/api/ai/generate-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platform":"sms","referralLink":"test"}'
```

### 2. Test Mobile App

1. Download from TestFlight (iOS) or Google Play Console (Android)
2. Test all features:
   - User registration/login
   - Link creation (should use instabids.ai)
   - AI message generation
   - Sharing functionality

## 🔄 Continuous Deployment

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd ReferralLinkPlatform/backend
        npm ci
    
    - name: Run tests
      run: |
        cd ReferralLinkPlatform/backend
        npm test
    
    - name: Deploy to Railway
      run: |
        npm install -g @railway/cli
        railway up
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📈 Scaling Considerations

### When to Scale

- API response time > 200ms (p95)
- CPU usage > 70%
- Memory usage > 80%
- Request queue > 100

### Scaling Strategy

1. **Horizontal Scaling**: Add more server instances
2. **Database Optimization**: 
   - Already using Supabase (auto-scales)
   - Enable connection pooling
3. **Caching**: Implement Redis for frequently accessed data
4. **CDN**: Use Cloudflare for static assets
5. **Rate Limiting**: Already configured

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check Supabase status page
   - Verify connection string
   - Check network connectivity

2. **OpenAI API Errors**
   - Check API key validity
   - Monitor rate limits
   - Check billing status

3. **Mobile App Not Connecting**
   - Verify API URL in app config
   - Check CORS settings
   - Verify SSL certificate

## 📞 Support Contacts

- **Supabase Support**: https://supabase.com/support
- **OpenAI Support**: https://help.openai.com
- **Expo Support**: https://expo.dev/contact

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Error tracking setup
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] API documentation updated
- [ ] Mobile app deployed
- [ ] Post-deployment tests passed

## 🎉 Congratulations!

Your ReferralLink platform with AI-powered messaging is now deployed and ready for production use!

### What's Already Working:
- ✅ Supabase database with instabids.ai integration
- ✅ 10-day auto-expiring links
- ✅ One link per user system
- ✅ OpenAI GPT-4 message generation
- ✅ Multi-platform message support
- ✅ Writing style analysis
- ✅ Mobile app with Expo SDK 53

### Next Steps:
1. Configure your domain
2. Deploy backend to your preferred platform
3. Build and submit mobile apps to stores
4. Monitor usage and costs
5. Gather user feedback