# ReferralLink Platform - Quick Start Guide

## Prerequisites

Before running the project, ensure you have the following installed:
- **Node.js** (v18+ recommended)
- **PostgreSQL** (v14+ recommended)
- **Redis** (optional, for caching)
- **npm** or **yarn**

## Method 1: Running with Docker (Easiest)

### Step 1: Start all services with Docker Compose
```bash
# From the project root directory
docker-compose up -d
```

This will start:
- Backend API (port 5000)
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Web frontend (port 3000)
- Admin panel (port 3001)

### Step 2: Run database migrations
```bash
docker-compose exec backend npm run migrate
```

### Step 3: Access the applications
- Backend API: http://localhost:5000
- Web App: http://localhost:3000
- Admin Panel: http://localhost:3001
- API Documentation: http://localhost:5000/api/docs

## Method 2: Running Locally (Without Docker)

### Step 1: Set up PostgreSQL Database
```bash
# Create the database
createdb referrallink

# Or using psql
psql -U postgres
CREATE DATABASE referrallink;
\q
```

### Step 2: Configure the Backend

#### Navigate to backend directory
```bash
cd ReferralLinkPlatform/backend
```

#### Install dependencies
```bash
npm install
```

#### Set up environment variables
```bash
# Copy the example file (if not already done)
cp .env.example .env

# Edit .env with your actual values
# At minimum, update these:
# - DB_PASSWORD (your PostgreSQL password)
# - JWT_SECRET (generate a random string)
# - JWT_REFRESH_SECRET (generate another random string)
```

#### Run database migrations
```bash
npm run migrate
```

#### Start the backend server
```bash
npm run dev
```

The backend API will be available at http://localhost:5000

### Step 3: Run the Web Frontend (Optional)

#### Open a new terminal and navigate to web directory
```bash
cd ReferralLinkPlatform/web
```

#### Install dependencies
```bash
npm install
```

#### Start the development server
```bash
npm start
```

The web app will be available at http://localhost:3000

### Step 4: Run the Admin Panel (Optional)

#### Open a new terminal and navigate to admin directory
```bash
cd ReferralLinkPlatform/admin
```

#### Install dependencies
```bash
npm install
```

#### Start the development server
```bash
npm start
```

The admin panel will be available at http://localhost:3001

### Step 5: Run the Mobile App (Optional)

#### Navigate to mobile directory
```bash
cd ReferralLinkPlatform/mobile
```

#### Install dependencies
```bash
npm install
```

#### Start Expo
```bash
npx expo start
```

Follow the Expo instructions to run on iOS/Android simulator or device.

## Method 3: Quick Backend-Only Setup

If you just want to test the API:

```bash
# From project root
cd ReferralLinkPlatform/backend
npm install
npm run dev
```

The API will start with an in-memory SQLite database if PostgreSQL is not configured.

## Testing the API

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

Save the returned token for authenticated requests.

### 4. Create a Referral Link
```bash
curl -X POST http://localhost:5000/api/referrals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://example.com/product",
    "customMessage": "Check out this amazing product!"
  }'
```

## Observability Dashboard

To monitor the system in real-time:

### Start the monitoring server
```bash
# From project root
python observability/agent_monitor.py
```

### Open the dashboard
Open `observability/dashboard.html` in your browser or:
```bash
start observability/dashboard.html
```

## Common Issues & Solutions

### Issue: PostgreSQL connection failed
**Solution**: 
- Ensure PostgreSQL is running: `pg_ctl status`
- Check credentials in `.env` file
- Try connecting manually: `psql -U postgres -d referrallink`

### Issue: Port already in use
**Solution**:
- Change the PORT in `.env` file
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Issue: Missing dependencies
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database migrations fail
**Solution**:
```bash
# Reset database and re-run migrations
psql -U postgres -c "DROP DATABASE IF EXISTS referrallink;"
psql -U postgres -c "CREATE DATABASE referrallink;"
cd ReferralLinkPlatform/backend
npm run migrate
```

## Environment Variables Reference

### Required Variables
- `DB_PASSWORD` - PostgreSQL password
- `JWT_SECRET` - Secret for JWT tokens (generate a random string)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

### Optional but Recommended
- `OPENAI_API_KEY` - For AI message personalization
- `SENDGRID_API_KEY` - For sending emails
- `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN` - For SMS
- `STRIPE_SECRET_KEY` - For payment processing

## Next Steps

1. **Create test data**: Use the API endpoints to create sample referral links
2. **Test the redirect**: Visit http://localhost:5000/r/[SHORT_CODE]
3. **View analytics**: Check the analytics endpoints
4. **Explore the API**: Visit http://localhost:5000/api/docs for Swagger documentation

## Support

For issues or questions:
- Check the logs: `ReferralLinkPlatform/backend/logs/`
- Review the documentation: `CLAUDE.md`
- API specification: `docs/FULL_SPECIFICATION.md`