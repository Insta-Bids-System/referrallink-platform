@echo off
cls
echo ========================================
echo    REFERRALLINK QUICK DEPLOY WIZARD
echo ========================================
echo.
echo Your platform is READY to deploy!
echo.
echo Choose deployment method:
echo.
echo [1] Deploy to Railway (Recommended - Easiest)
echo [2] Deploy to Render (Free tier available)
echo [3] Run locally in production mode
echo [4] Create GitHub repo for deployment
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto railway
if "%choice%"=="2" goto render
if "%choice%"=="3" goto local
if "%choice%"=="4" goto github
goto end

:railway
echo.
echo ========================================
echo    DEPLOYING TO RAILWAY
echo ========================================
echo.
echo Step 1: Opening Railway website...
start https://railway.app
echo.
echo Step 2: Sign up/Login to Railway
echo Step 3: Click "New Project" then "Deploy from GitHub"
echo.
echo Your environment variables are saved in:
echo ReferralLinkPlatform\backend\.env.production
echo.
echo Copy these to Railway's environment variables:
echo.
type ReferralLinkPlatform\backend\.env.production | findstr /V "^#" | findstr "="
echo.
pause
goto end

:render
echo.
echo ========================================
echo    DEPLOYING TO RENDER
echo ========================================
echo.
echo Step 1: Opening Render website...
start https://render.com
echo.
echo Step 2: Sign up/Login to Render
echo Step 3: Create new Web Service
echo Step 4: Use these settings:
echo    - Build Command: npm install && npm run build
echo    - Start Command: node dist/server.js
echo.
echo Your environment variables are in:
echo ReferralLinkPlatform\backend\.env.production
echo.
pause
goto end

:local
echo.
echo ========================================
echo    STARTING LOCAL PRODUCTION SERVER
echo ========================================
echo.
cd ReferralLinkPlatform\backend
echo Building production bundle...
call npm run build
echo.
echo Starting server...
call start-production.bat
goto end

:github
echo.
echo ========================================
echo    CREATING GITHUB REPOSITORY
echo ========================================
echo.
echo Initializing git repository...
git init
echo.
echo Adding all files...
git add .
echo.
echo Creating initial commit...
git commit -m "Initial commit - ReferralLink Platform with AI"
echo.
echo Now:
echo 1. Go to https://github.com/new
echo 2. Create a new repository called 'referrallink'
echo 3. Run these commands:
echo.
echo git remote add origin https://github.com/YOUR_USERNAME/referrallink.git
echo git push -u origin main
echo.
start https://github.com/new
pause
goto end

:end
echo.
echo ========================================
echo    DEPLOYMENT GUIDE COMPLETE
echo ========================================
echo.
echo For detailed instructions, see: DEPLOY_NOW.md
echo.
echo Your platform features:
echo - AI-powered message generation (OpenAI GPT-4)
echo - Instabids.ai integration
echo - 10-day auto-expiring links
echo - Supabase cloud database
echo - Production-ready code
echo.
echo Questions? Check DEPLOYMENT_GUIDE.md
echo.
pause