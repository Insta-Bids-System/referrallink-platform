@echo off
echo ========================================
echo Starting ReferralLink Backend (Production)
echo ========================================
echo.

REM Set production environment
set NODE_ENV=production

REM Load production environment variables
if exist .env.production (
    echo Loading production environment...
    for /f "delims=" %%x in (.env.production) do (
        set "%%x"
    )
) else (
    echo WARNING: .env.production not found, using .env
)

echo.
echo Starting server on port %PORT%...
echo Server will be available at: http://localhost:%PORT%
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the production server
node dist/server.js