@echo off
setlocal enabledelayedexpansion
set "OPERATIONS_DIR=%~dp0mission_control"
set "OPENCLAW_WORKSPACE_ROOT=%~dp0workspace"
set "AGENTS_ROOT=%~dp0agents"
echo.
echo ===================================================
echo    Akki OS - Personal Branding Operating System
echo ===================================================
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Install from: https://nodejs.org
    pause
    exit /b 1
)
echo OK: Node.js ready

echo [2/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not found! Install from: https://docker.com
    start https://docker.com
    pause
    exit /b 1
)
echo OK: Docker ready

echo.
echo [3/5] Installing OpenClaw...
call npm install -g openclaw >nul 2>&1
echo OK: OpenClaw installed

echo.
echo ===================================================
echo    SETUP - One thing needed!
echo ===================================================
echo.

if not exist "%~dp0.env" (
    type nul > "%~dp0.env"
)
echo OK: Loading existing .env values...
for /f "usebackq tokens=1,2 delims==" %%a in ("%~dp0.env") do (
    if "%%a"=="OPENCLAW_TOKEN"    set OPENCLAW_TOKEN=%%b
    if "%%a"=="CONVEX_URL"        set CONVEX_URL=%%b
    if "%%a"=="CONVEX_DEPLOY_KEY" set CONVEX_DEPLOY_KEY=%%b
)

echo.
echo OpenClaw will now guide you through full setup...
echo.
call npx openclaw onboard --workspace "%~dp0workspace" --gateway-bind loopback --install-daemon

echo.
echo Syncing gateway token...
for /f %%t in ('node -e "try{const fs=require('fs');const p=(process.env.USERPROFILE||'')+'\\\\.openclaw\\\\openclaw.json';const c=JSON.parse(fs.readFileSync(p,'utf8'));console.log((c.gateway&&c.gateway.auth&&c.gateway.auth.token)||'')}catch(e){console.log('')}"') do set ACTUAL_TOKEN=%%t
if not "!ACTUAL_TOKEN!"=="" (
    set OPENCLAW_TOKEN=!ACTUAL_TOKEN!
    echo OK: Gateway token synced
) else (
    if "!OPENCLAW_TOKEN!"=="" (
        echo ERROR: Could not read OpenClaw token from %%USERPROFILE%%\.openclaw\openclaw.json
        pause
        exit /b 1
    )
    echo WARN: Could not read token from OpenClaw config, using existing token from .env
)

findstr /v /b "OPENCLAW_TOKEN=" "%~dp0.env" > "%~dp0.env.tmp"
move /y "%~dp0.env.tmp" "%~dp0.env" >nul
echo OPENCLAW_TOKEN=!OPENCLAW_TOKEN!>> "%~dp0.env"

echo.
echo [4/5] Setting up Agents + Skills + Webhook + Mission Control...

REM Register agents
for %%a in (jarvis fury loki shuri atlas echo oracle pulse vision) do (
    call npx openclaw agents add %%a --workspace "%~dp0agents\%%a" >nul 2>&1
    echo   OK: %%a registered
)

REM Copy skills
if not exist "%~dp0workspace\skills" mkdir "%~dp0workspace\skills"
xcopy /E /I /Y "%~dp0skills\*" "%~dp0workspace\skills\" >nul 2>&1
echo OK: Skills copied

REM Start webhook — port check pehle
netstat -ano | find ":3003" >nul 2>&1
if %errorlevel% neq 0 (
    cd "%~dp0skills\webhook-server\scripts"
    (echo CONVEX_URL=!CONVEX_URL!) > .env
    (echo OPENCLAW_TOKEN=!OPENCLAW_TOKEN!) >> .env
    call npm init -y >nul 2>&1
    call npm install convex dotenv >nul 2>&1
    start "Akki Webhook" /MIN cmd /k "node server.js"
    cd "%~dp0"
    timeout /t 2 >nul
    echo OK: Webhook started on port 3003
) else (
    echo OK: Webhook already running on port 3003
)

REM Mission Control clone
if not exist "%OPERATIONS_DIR%" (
    git clone https://github.com/Chiraggoyal120/mission_control.git "%OPERATIONS_DIR%"
    echo OK: Mission Control cloned
)

echo.
echo [5/5] Setting up Convex Database...
echo ===================================================
echo    FREE database for your AI agents
echo    Create account at: https://convex.dev
echo    Then: New Project ^> Settings ^> Deploy Keys
echo ===================================================
echo.

if "!CONVEX_URL!"=="" (
    set /p CONVEX_URL="Enter Convex Cloud URL (https://xxx.convex.cloud): "
)
if "!CONVEX_DEPLOY_KEY!"=="" (
    set /p CONVEX_DEPLOY_KEY="Enter Convex Deploy Key (dev:xxx|yyy): "
)

REM Save to root .env
echo CONVEX_URL=!CONVEX_URL!>> "%~dp0.env"
echo CONVEX_DEPLOY_KEY=!CONVEX_DEPLOY_KEY!>> "%~dp0.env"

REM Mission Control .env — always rebuild so token stays synced with OpenClaw
(
    echo FRONTEND_PORT=3000
    echo BACKEND_PORT=8000
    echo CORS_ORIGINS=http://localhost:3000
    echo CORS_ORIGIN=http://localhost:3000
    echo AUTH_MODE=local
    echo LOCAL_AUTH_TOKEN=!OPENCLAW_TOKEN!
    echo OPENCLAW_TOKEN=!OPENCLAW_TOKEN!
    echo OPENCLAW_GATEWAY_URL=ws://host.docker.internal:18789
    echo OPENCLAW_WORKSPACE_ROOT=!OPENCLAW_WORKSPACE_ROOT!
    echo AGENTS_ROOT=!AGENTS_ROOT!
    echo NEXT_PUBLIC_API_URL=http://localhost:8000
    echo BETTER_AUTH_URL=http://localhost:8000
    echo CONVEX_URL=!CONVEX_URL!
    echo CONVEX_DEPLOY_KEY=!CONVEX_DEPLOY_KEY!
) > "%OPERATIONS_DIR%\.env"
echo OK: Mission Control .env synced

REM Deploy Convex schema — Docker se PEHLE
if not "!CONVEX_URL!"=="" (
    if not "!CONVEX_DEPLOY_KEY!"=="" (
        echo.
        echo Deploying Convex schema to cloud...
        cd "%OPERATIONS_DIR%\backend"
        set CONVEX_DEPLOY_KEY=!CONVEX_DEPLOY_KEY!
        call npx convex deploy
        if %errorlevel% neq 0 (
            echo WARN: Convex deploy failed. Run manually later:
            echo       cd mission_control\backend ^&^& npx convex deploy
        ) else (
            echo OK: Convex deployed!
        )
        cd "%~dp0"
    )
) else (
    echo SKIP: Convex setup skipped. Add CONVEX_URL to .env later.
)

REM Start Docker — Convex ready hone ke baad
cd "%OPERATIONS_DIR%"
docker compose -f compose.yml --env-file .env up -d --build
cd "%~dp0"
echo OK: Mission Control started!

echo.
echo ===================================================
echo    Akki OS is LIVE!
echo ===================================================
echo.
echo    OpenClaw:        http://127.0.0.1:18789/?token=!OPENCLAW_TOKEN!
echo    Mission Control: http://localhost:3000  (Login: !OPENCLAW_TOKEN!)
echo    Convex DB:       !CONVEX_URL!
echo    Webhook:         http://localhost:3003
echo.
echo Next Step: Open Mission Control and chat with your agents!
echo.
timeout /t 3 >nul
start http://localhost:3000
echo.
pause
