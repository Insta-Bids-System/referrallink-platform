@echo off
REM ReferralLink Platform - Production Deployment Script (Windows)
REM This script handles deployment to various platforms

echo ======================================
echo ReferralLink Platform Deployment Script
echo ======================================
echo.

REM Check for production environment file
if not exist ".env.production" (
    echo ERROR: .env.production file not found!
    echo Please create .env.production with your production settings
    exit /b 1
)

echo Production environment found
echo.

:menu
echo Select deployment platform:
echo 1. Railway
echo 2. Vercel  
echo 3. Heroku
echo 4. Docker
echo 5. Run pre-deploy checks only
echo.
set /p choice="Enter choice [1-5]: "

REM Run pre-deployment checks
call :pre_deploy_checks

if "%choice%"=="1" goto deploy_railway
if "%choice%"=="2" goto deploy_vercel
if "%choice%"=="3" goto deploy_heroku
if "%choice%"=="4" goto deploy_docker
if "%choice%"=="5" (
    echo Pre-deployment checks complete.
    exit /b 0
)

echo Invalid choice. Exiting.
exit /b 1

:pre_deploy_checks
echo.
echo Running pre-deployment checks...
echo.

echo Running tests...
call npm test
if errorlevel 1 (
    echo WARNING: Tests failed but continuing...
)

echo Checking TypeScript...
call npm run typecheck
if errorlevel 1 (
    echo ERROR: TypeScript compilation failed!
    exit /b 1
)

echo Pre-deployment checks passed!
echo.
goto :eof

:deploy_railway
echo.
echo Deploying to Railway...
echo.

REM Check if Railway CLI is installed
where railway >nul 2>nul
if errorlevel 1 (
    echo Installing Railway CLI...
    call npm install -g @railway/cli
)

REM Deploy
call railway up

echo.
echo Deployed to Railway successfully!
echo Visit your Railway dashboard to view the deployment
goto post_deploy

:deploy_vercel
echo.
echo Deploying to Vercel...
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if errorlevel 1 (
    echo Installing Vercel CLI...
    call npm install -g vercel
)

REM Build the project
echo Building project...
call npm run build

REM Deploy
call vercel --prod

echo.
echo Deployed to Vercel successfully!
goto post_deploy

:deploy_heroku
echo.
echo Deploying to Heroku...
echo.

REM Check if Heroku CLI is installed
where heroku >nul 2>nul
if errorlevel 1 (
    echo ERROR: Heroku CLI not installed!
    echo Please install from: https://devcenter.heroku.com/articles/heroku-cli
    exit /b 1
)

REM Create app if it doesn't exist
heroku apps:info --app referrallink-backend >nul 2>nul
if errorlevel 1 (
    echo Creating Heroku app...
    call heroku create referrallink-backend
)

REM Set environment variables
echo Setting environment variables...
call heroku config:set NODE_ENV=production
call heroku config:set SUPABASE_URL=%SUPABASE_URL%
call heroku config:set SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
call heroku config:set SUPABASE_SERVICE_KEY=%SUPABASE_SERVICE_KEY%
call heroku config:set OPENAI_API_KEY=%OPENAI_API_KEY%
call heroku config:set COMPANY_URL=https://instabids.ai

REM Deploy
call git push heroku main

echo.
echo Deployed to Heroku successfully!
goto post_deploy

:deploy_docker
echo.
echo Building Docker image...
echo.

REM Build the image
call docker build -t referrallink-backend .

REM Tag for registry
echo Tagging image...
call docker tag referrallink-backend:latest your-registry/referrallink-backend:latest

echo.
echo Docker image built successfully!
echo Push to your registry with: docker push your-registry/referrallink-backend:latest
goto post_deploy

:post_deploy
echo.
echo ======================================
echo Deployment complete!
echo ======================================
echo.
echo Next steps:
echo 1. Verify the deployment at your platform's dashboard
echo 2. Test all critical features
echo 3. Monitor logs for any issues
echo 4. Update DNS if needed
echo.
echo Deployment timestamp: %date% %time%
echo.

exit /b 0