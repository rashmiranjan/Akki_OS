@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "INSTALL_MODE=install"
set "EXPLICIT_MODE=false"
set "NON_INTERACTIVE=false"
set "DRY_RUN=false"
set "FROM_VERSION="
set "CUSTOM_BACKUP_DIR="
set "RESYNC_RUNTIME=false"

:parse_args
if "%~1"=="" goto args_done
if /I "%~1"=="--upgrade" (
  set "INSTALL_MODE=upgrade"
  shift
  goto parse_args
)
if /I "%~1"=="--mode" (
  set "INSTALL_MODE=%~2"
  set "EXPLICIT_MODE=true"
  shift
  shift
  goto parse_args
)
if /I "%~1"=="--non-interactive" (
  set "NON_INTERACTIVE=true"
  shift
  goto parse_args
)
if /I "%~1"=="--dry-run" (
  set "DRY_RUN=true"
  shift
  goto parse_args
)
if /I "%~1"=="--from-version" (
  set "FROM_VERSION=%~2"
  shift
  shift
  goto parse_args
)
if /I "%~1"=="--backup-dir" (
  set "CUSTOM_BACKUP_DIR=%~2"
  shift
  shift
  goto parse_args
)
if /I "%~1"=="--resync-runtime" (
  set "RESYNC_RUNTIME=true"
  shift
  goto parse_args
)
echo WARN: Unknown option %~1 (ignored)
shift
goto parse_args

:args_done
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
set "OPERATIONS_DIR=%SCRIPT_DIR%\mission_control"
set "BOOTSTRAP_WORKSPACE_ROOT=%SCRIPT_DIR%\workspace"
set "BOOTSTRAP_AGENTS_ROOT=%SCRIPT_DIR%\agents"
set "BOOTSTRAP_DOMAINS_ROOT=%SCRIPT_DIR%\domains"
set "PACKAGED_SKILLS_ROOT=%BOOTSTRAP_WORKSPACE_ROOT%\skills"
set "OPENCLAW_RUNTIME_ROOT=%USERPROFILE%\.openclaw\akki"
set "OPENCLAW_WORKSPACE_ROOT=%OPENCLAW_RUNTIME_ROOT%\workspace"
set "AGENTS_ROOT=%OPENCLAW_RUNTIME_ROOT%\agents"
set "DOMAINS_ROOT=%OPENCLAW_RUNTIME_ROOT%\domains"
set "SKILLS_ROOT=%OPENCLAW_WORKSPACE_ROOT%\skills"
set "OPENCLAW_GLOBAL_SKILLS_ROOT=%USERPROFILE%\.openclaw\skills"
set "OPENCLAW_CONFIG_PATH=%USERPROFILE%\.openclaw\openclaw.json"
set "OPENCLAW_WORKSPACE_CONFIG_TEMPLATE=%BOOTSTRAP_WORKSPACE_ROOT%\openclaw.json"
set "HOME_STATE_FILE=%USERPROFILE%\.akki\state\install-state.json"
set "REPO_STATE_FILE=%SCRIPT_DIR%\.akki\state\install-state.json"
set "OPERATIONS_ENV_FILE=%OPERATIONS_DIR%\.env"
set "RUNTIME_ENV_FILE=%SCRIPT_DIR%\.akki\runtime.env"
set "WINDOWS_RUNTIME_HELPER=%SCRIPT_DIR%\tools\windows_runtime_helper.js"
set "PBOS_AGENTS=atlas archivist oracle pulse scribe keith sentinel"

if /I not "%INSTALL_MODE%"=="install" if /I not "%INSTALL_MODE%"=="upgrade" (
  echo ERROR: --mode must be install or upgrade
  exit /b 1
)

echo.
echo ===================================================
echo    Akki OS - Personal Branding Operating System
echo ===================================================
echo.
echo Mode: %INSTALL_MODE% (dry-run=%DRY_RUN%, non-interactive=%NON_INTERACTIVE%, resync-runtime=%RESYNC_RUNTIME%)

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
  if /I "%DRY_RUN%"=="true" (
    echo ERROR: Dry-run requires Node.js 22+ already installed.
    exit /b 1
  )
  echo ERROR: Node.js not found. Install Node.js 22+ from https://nodejs.org
  pause
  exit /b 1
)
for /f %%v in ('node -p "process.versions.node.split('.')[0]"') do set "NODE_MAJOR=%%v"
if not defined NODE_MAJOR (
  echo ERROR: Could not determine Node.js version.
  exit /b 1
)
if %NODE_MAJOR% LSS 22 (
  echo ERROR: Node.js 22+ is required. Found Node.js major version %NODE_MAJOR%.
  pause
  exit /b 1
)
echo OK: Node.js ready

echo [2/5] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
  if /I "%DRY_RUN%"=="true" (
    echo ERROR: Dry-run requires Docker already installed.
    exit /b 1
  )
  echo ERROR: Docker not found. Install Docker Desktop from https://docker.com
  start https://docker.com
  pause
  exit /b 1
)
docker compose version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Docker Compose v2 is required. Ensure "docker compose" works in this shell.
  pause
  exit /b 1
)
docker info >nul 2>&1
if errorlevel 1 (
  echo ERROR: Docker Desktop is not running. Start Docker Desktop and re-run install.bat.
  pause
  exit /b 1
)
echo OK: Docker ready

echo.
echo [3/5] Installing OpenClaw...
if /I "%DRY_RUN%"=="true" (
  where openclaw >nul 2>&1
  if errorlevel 1 (
    echo ERROR: Dry-run requires OpenClaw already installed.
    exit /b 1
  )
  openclaw --version >nul 2>&1
  if errorlevel 1 (
    echo ERROR: OpenClaw is on PATH but failed to run.
    exit /b 1
  )
  echo OK: OpenClaw ready
) else (
  where openclaw >nul 2>&1
  if errorlevel 1 (
    call npm install -g openclaw@latest
    if errorlevel 1 (
      echo ERROR: Failed to install OpenClaw globally with npm.
      pause
      exit /b 1
    )
  )
  where openclaw >nul 2>&1
  if errorlevel 1 (
    echo ERROR: OpenClaw install completed but the openclaw command is not on PATH.
    pause
    exit /b 1
  )
  openclaw --version >nul 2>&1
  if errorlevel 1 (
    echo ERROR: OpenClaw command exists but failed to run after install.
    pause
    exit /b 1
  )
  echo OK: OpenClaw installed
)

if not exist "%SCRIPT_DIR%\.env" type nul > "%SCRIPT_DIR%\.env"

echo.
echo ===================================================
echo    SETUP - One thing needed!
echo ===================================================
echo.
echo OK: Loading existing .env values...
for /f "usebackq tokens=1,* delims==" %%a in ("%SCRIPT_DIR%\.env") do (
  if "%%a"=="OPENCLAW_TOKEN" set "OPENCLAW_TOKEN=%%b"
  if "%%a"=="CONVEX_URL" set "CONVEX_URL=%%b"
  if "%%a"=="CONVEX_DEPLOY_KEY" set "CONVEX_DEPLOY_KEY=%%b"
  if "%%a"=="OPENCLAW_GATEWAY_BIND" set "OPENCLAW_GATEWAY_BIND=%%b"
  if "%%a"=="OPENCLAW_PUBLIC_HOST" set "OPENCLAW_PUBLIC_HOST=%%b"
  if "%%a"=="OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS" set "OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS=%%b"
)

set "EXISTING_INSTALL=false"
if exist "%OPENCLAW_CONFIG_PATH%" set "EXISTING_INSTALL=true"
if exist "%OPERATIONS_ENV_FILE%" set "EXISTING_INSTALL=true"
if exist "%HOME_STATE_FILE%" set "EXISTING_INSTALL=true"
if exist "%REPO_STATE_FILE%" set "EXISTING_INSTALL=true"

if /I "!EXISTING_INSTALL!"=="true" (
  if /I "%INSTALL_MODE%"=="install" (
    if /I "%EXPLICIT_MODE%"=="false" (
      set "INSTALL_MODE=upgrade"
      echo WARN: Existing install detected; auto-switching mode to upgrade.
    ) else (
      echo WARN: Explicit --mode install on an existing setup.
      if /I "%NON_INTERACTIVE%"=="true" (
        echo ERROR: Refusing explicit install mode in non-interactive run on existing setup. Use --upgrade.
        exit /b 1
      )
      set /p CONFIRM_INSTALL_MODE="Proceed with install mode anyway? [y/N]: "
      if /I not "!CONFIRM_INSTALL_MODE!"=="y" if /I not "!CONFIRM_INSTALL_MODE!"=="yes" (
        echo Aborted. Re-run with --upgrade.
        exit /b 1
      )
    )
  )
)
echo Effective mode: %INSTALL_MODE%

if "!OPENCLAW_GATEWAY_BIND!"=="" (
  set "DESIRED_GATEWAY_BIND=loopback"
) else (
  set "DESIRED_GATEWAY_BIND=!OPENCLAW_GATEWAY_BIND!"
)

if not "!OPENCLAW_PUBLIC_HOST!"=="" (
  set "PUBLIC_HOST=!OPENCLAW_PUBLIC_HOST!"
) else (
  for /f %%h in ('node -e "const os=require('os');const n=os.networkInterfaces();let ip='';for(const k of Object.keys(n)){for(const i of (n[k]||[])){if(i.family==='IPv4'&&!i.internal){ip=i.address;break;}}if(ip)break;}console.log(ip||'localhost');"') do set "PUBLIC_HOST=%%h"
)
if "!PUBLIC_HOST!"=="" set "PUBLIC_HOST=localhost"
if /I "!PUBLIC_HOST!"=="undefined" set "PUBLIC_HOST=localhost"
if /I "!PUBLIC_HOST!"=="null" set "PUBLIC_HOST=localhost"
set "FRONTEND_ORIGIN=http://!PUBLIC_HOST!:3000"
set "API_BASE_URL=http://!PUBLIC_HOST!:8000"
echo OK: Host resolved as !PUBLIC_HOST!

set "MSYNC_FROM="
set "MSYNC_BACKUP="
if not "%FROM_VERSION%"=="" set "MSYNC_FROM= --from-version \"%FROM_VERSION%\""
if not "%CUSTOM_BACKUP_DIR%"=="" set "MSYNC_BACKUP= --backup-dir \"%CUSTOM_BACKUP_DIR%\""

if /I "%DRY_RUN%"=="true" (
  echo DRY-RUN: Skipping mutating operations
  call node "%SCRIPT_DIR%\tools\managed_sync.js" --repo-root "%SCRIPT_DIR%" --openclaw-config "%OPENCLAW_CONFIG_PATH%" --manifest "%SCRIPT_DIR%\releases\manifest.json" --state-file "%USERPROFILE%\.akki\state\install-state.json" --mode "%INSTALL_MODE%" --action check %MSYNC_FROM% %MSYNC_BACKUP%
  call node "%SCRIPT_DIR%\tools\managed_sync.js" --repo-root "%SCRIPT_DIR%" --openclaw-config "%OPENCLAW_CONFIG_PATH%" --manifest "%SCRIPT_DIR%\releases\manifest.json" --state-file "%USERPROFILE%\.akki\state\install-state.json" --mode "%INSTALL_MODE%" --action sync --dry-run %MSYNC_FROM% %MSYNC_BACKUP%
  exit /b 0
)

if /I "%INSTALL_MODE%"=="install" (
  set "RUNTIME_COPY_MODE=overwrite"
) else (
  set "RUNTIME_COPY_MODE=missing"
)
if /I "%RESYNC_RUNTIME%"=="true" set "RUNTIME_COPY_MODE=overwrite"
echo OpenClaw runtime seed mode: !RUNTIME_COPY_MODE!

if not exist "%OPENCLAW_RUNTIME_ROOT%" mkdir "%OPENCLAW_RUNTIME_ROOT%"
if not exist "%OPENCLAW_WORKSPACE_ROOT%" mkdir "%OPENCLAW_WORKSPACE_ROOT%"
if not exist "%AGENTS_ROOT%" mkdir "%AGENTS_ROOT%"
if not exist "%DOMAINS_ROOT%" mkdir "%DOMAINS_ROOT%"
if not exist "%SKILLS_ROOT%" mkdir "%SKILLS_ROOT%"
if not exist "%OPENCLAW_GLOBAL_SKILLS_ROOT%" mkdir "%OPENCLAW_GLOBAL_SKILLS_ROOT%"

call node "%WINDOWS_RUNTIME_HELPER%" copy-tree --src "%BOOTSTRAP_WORKSPACE_ROOT%" --dst "%OPENCLAW_WORKSPACE_ROOT%" --mode "!RUNTIME_COPY_MODE!" --label "shared workspace"
if errorlevel 1 exit /b 1
call node "%WINDOWS_RUNTIME_HELPER%" copy-tree --src "%BOOTSTRAP_DOMAINS_ROOT%" --dst "%DOMAINS_ROOT%" --mode "!RUNTIME_COPY_MODE!" --label "domains"
if errorlevel 1 exit /b 1
call node "%WINDOWS_RUNTIME_HELPER%" copy-tree --src "%PACKAGED_SKILLS_ROOT%" --dst "%SKILLS_ROOT%" --mode "!RUNTIME_COPY_MODE!" --label "workspace skills"
if errorlevel 1 exit /b 1
call node "%WINDOWS_RUNTIME_HELPER%" copy-tree --src "%PACKAGED_SKILLS_ROOT%" --dst "%OPENCLAW_GLOBAL_SKILLS_ROOT%" --mode "!RUNTIME_COPY_MODE!" --label "global skills"
if errorlevel 1 exit /b 1

for %%a in (%PBOS_AGENTS%) do (
  call node "%WINDOWS_RUNTIME_HELPER%" copy-tree --src "%BOOTSTRAP_AGENTS_ROOT%\%%a" --dst "%AGENTS_ROOT%\%%a" --mode "!RUNTIME_COPY_MODE!" --label "agent workspace (%%a)"
  if errorlevel 1 exit /b 1
)

if /I "%INSTALL_MODE%"=="install" (
  echo.
  echo OpenClaw will now guide you through full setup...
  echo.
  call openclaw onboard --workspace "%OPENCLAW_WORKSPACE_ROOT%" --gateway-bind "!DESIRED_GATEWAY_BIND!" --install-daemon
  if errorlevel 1 (
    echo ERROR: OpenClaw onboarding failed.
    pause
    exit /b 1
  )
) else (
  if not exist "%OPENCLAW_CONFIG_PATH%" (
    echo ERROR: Upgrade mode requires existing OpenClaw config at %OPENCLAW_CONFIG_PATH%
    pause
    exit /b 1
  )
  echo OK: Upgrade mode detected existing OpenClaw config; onboarding skipped.
)

echo.
echo Syncing OpenClaw gateway token...
for /f %%t in ('node -e "try{const fs=require('fs');const p=(process.env.USERPROFILE||'')+'\\\\.openclaw\\\\openclaw.json';const c=JSON.parse(fs.readFileSync(p,'utf8'));console.log((c.gateway&&c.gateway.auth&&c.gateway.auth.token)||'')}catch(e){console.log('')}"') do set "ACTUAL_TOKEN=%%t"
if not "!ACTUAL_TOKEN!"=="" (
  set "OPENCLAW_TOKEN=!ACTUAL_TOKEN!"
  echo OK: Gateway token synced
) else (
  if "!OPENCLAW_TOKEN!"=="" (
    echo ERROR: Could not read OpenClaw token from %%USERPROFILE%%\.openclaw\openclaw.json
    pause
    exit /b 1
  )
  echo WARN: Could not read token from OpenClaw config, using existing token from .env
)

call node "%WINDOWS_RUNTIME_HELPER%" upsert-env --file "%SCRIPT_DIR%\.env" --key OPENCLAW_TOKEN --value "!OPENCLAW_TOKEN!"
if errorlevel 1 exit /b 1

if exist "%OPENCLAW_WORKSPACE_CONFIG_TEMPLATE%" (
  call node "%WINDOWS_RUNTIME_HELPER%" deep-merge-json --runtime "%OPENCLAW_CONFIG_PATH%" --template "%OPENCLAW_WORKSPACE_CONFIG_TEMPLATE%"
)

set "DEFAULT_ALLOWED_ORIGINS=!FRONTEND_ORIGIN!,http://localhost:3000,http://127.0.0.1:3000"
if not "!OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS!"=="" (
  set "EFFECTIVE_ALLOWED_ORIGINS=!OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS!"
) else (
  set "EFFECTIVE_ALLOWED_ORIGINS=!DEFAULT_ALLOWED_ORIGINS!"
)
call node "%WINDOWS_RUNTIME_HELPER%" patch-gateway-config --config "%OPENCLAW_CONFIG_PATH%" --bind "!DESIRED_GATEWAY_BIND!" --origins "!EFFECTIVE_ALLOWED_ORIGINS!"
if errorlevel 1 exit /b 1

call node "%WINDOWS_RUNTIME_HELPER%" configure-runtime-layout --config "%OPENCLAW_CONFIG_PATH%" --workspace-root "%OPENCLAW_WORKSPACE_ROOT%" --agents-root "%AGENTS_ROOT%" --agent-dir-root "%USERPROFILE%\.openclaw\agents" --agents "atlas,archivist,oracle,pulse,scribe,keith,sentinel"
if errorlevel 1 exit /b 1

if not exist "%SCRIPT_DIR%\.akki" mkdir "%SCRIPT_DIR%\.akki"
(
  echo AKKI_REPO_ROOT=%SCRIPT_DIR%
  echo AKKI_OPENCLAW_HOME=%USERPROFILE%\.openclaw
  echo AKKI_OPENCLAW_CONFIG_PATH=%OPENCLAW_CONFIG_PATH%
  echo AKKI_OPENCLAW_RUNTIME_ROOT=%OPENCLAW_RUNTIME_ROOT%
  echo AKKI_WORKSPACE_ROOT=%OPENCLAW_WORKSPACE_ROOT%
  echo AKKI_AGENTS_ROOT=%AGENTS_ROOT%
  echo AKKI_DOMAINS_ROOT=%DOMAINS_ROOT%
  echo AKKI_SKILLS_ROOT=%SKILLS_ROOT%
  echo AKKI_GLOBAL_SKILLS_ROOT=%OPENCLAW_GLOBAL_SKILLS_ROOT%
  echo AKKI_BOOTSTRAP_WORKSPACE_ROOT=%BOOTSTRAP_WORKSPACE_ROOT%
  echo AKKI_BOOTSTRAP_AGENTS_ROOT=%BOOTSTRAP_AGENTS_ROOT%
  echo AKKI_BOOTSTRAP_DOMAINS_ROOT=%BOOTSTRAP_DOMAINS_ROOT%
  echo AKKI_PACKAGED_SKILLS_ROOT=%PACKAGED_SKILLS_ROOT%
  echo AKKI_OPERATIONS_ROOT=%OPERATIONS_DIR%
  echo AKKI_AGENT_IDS=%PBOS_AGENTS%
) > "%RUNTIME_ENV_FILE%"
echo OK: Runtime contract written to %RUNTIME_ENV_FILE%

call node "%SCRIPT_DIR%\tools\managed_sync.js" --repo-root "%SCRIPT_DIR%" --openclaw-config "%OPENCLAW_CONFIG_PATH%" --manifest "%SCRIPT_DIR%\releases\manifest.json" --state-file "%USERPROFILE%\.akki\state\install-state.json" --mode "%INSTALL_MODE%" --action sync %MSYNC_FROM% %MSYNC_BACKUP% > "%SCRIPT_DIR%\.last-managed-sync.json"
if errorlevel 1 (
  echo ERROR: Managed sync failed.
  exit /b 1
)
echo OK: Managed sync report written to %SCRIPT_DIR%\.last-managed-sync.json

echo.
echo [4/5] Setting up Agents + Skills + Mission Control...

if not exist "%SCRIPT_DIR%\.akki" mkdir "%SCRIPT_DIR%\.akki"
type nul > "%SCRIPT_DIR%\.akki\agent-conflicts.log"
for %%a in (%PBOS_AGENTS%) do (
  call openclaw agents add %%a --workspace "%AGENTS_ROOT%\%%a" > "%temp%\akki-agent-add.out" 2>&1
  if !errorlevel! equ 0 (
    echo   OK: %%a registered
  ) else (
    findstr /I "already exists already" "%temp%\akki-agent-add.out" >nul 2>&1
    if !errorlevel! equ 0 (
      echo   OK: %%a already exists ^(preserved^)
    ) else (
      echo   WARN: %%a registration issue
      echo [%%date%% %%time%%] %%a>> "%SCRIPT_DIR%\.akki\agent-conflicts.log"
      type "%temp%\akki-agent-add.out" >> "%SCRIPT_DIR%\.akki\agent-conflicts.log"
    )
  )
  call node "%WINDOWS_RUNTIME_HELPER%" seed-agent-definition --src-root "%BOOTSTRAP_AGENTS_ROOT%\%%a" --dst-root "%USERPROFILE%\.openclaw\agents\%%a\agent" --mode "!RUNTIME_COPY_MODE!" --agent "%%a"
  if errorlevel 1 exit /b 1
)

call node "%WINDOWS_RUNTIME_HELPER%" configure-runtime-layout --config "%OPENCLAW_CONFIG_PATH%" --workspace-root "%OPENCLAW_WORKSPACE_ROOT%" --agents-root "%AGENTS_ROOT%" --agent-dir-root "%USERPROFILE%\.openclaw\agents" --agents "atlas,archivist,oracle,pulse,scribe,keith,sentinel"
if errorlevel 1 exit /b 1
call node "%WINDOWS_RUNTIME_HELPER%" validate-runtime --config "%OPENCLAW_CONFIG_PATH%" --agents-root "%AGENTS_ROOT%" --domains-root "%DOMAINS_ROOT%" --skills-root "%SKILLS_ROOT%" --global-skills-root "%OPENCLAW_GLOBAL_SKILLS_ROOT%" --agent-dir-root "%USERPROFILE%\.openclaw\agents" --agents "atlas,archivist,oracle,pulse,scribe,keith,sentinel"
if errorlevel 1 exit /b 1

echo OK: Shared skills seeded at %SKILLS_ROOT%
echo OK: Global skills seeded at %OPENCLAW_GLOBAL_SKILLS_ROOT%
if not exist "%DOMAINS_ROOT%\pb-os" (
  echo ERROR: Expected PB-OS domain at %DOMAINS_ROOT%\pb-os
  exit /b 1
)
echo OK: PB-OS domain available at %DOMAINS_ROOT%\pb-os

set "WEBHOOK_SCRIPT_DIR="
if exist "%SCRIPT_DIR%\skills\webhook-server\scripts\server.js" (
  set "WEBHOOK_SCRIPT_DIR=%SCRIPT_DIR%\skills\webhook-server\scripts"
)
if not defined WEBHOOK_SCRIPT_DIR (
  if exist "%SCRIPT_DIR%\workspace\skills\webhook-server\scripts\server.js" (
    set "WEBHOOK_SCRIPT_DIR=%SCRIPT_DIR%\workspace\skills\webhook-server\scripts"
  )
)

if defined WEBHOOK_SCRIPT_DIR (
  netstat -ano | find ":3003" >nul 2>&1
  if errorlevel 1 (
    cd /d "%WEBHOOK_SCRIPT_DIR%"
    call npm install convex dotenv
    if errorlevel 1 (
      echo ERROR: Failed to install webhook bridge dependencies.
      exit /b 1
    )
    start "Akki Webhook" /MIN cmd /c "set CONVEX_URL=!CONVEX_URL!&& set OPENCLAW_TOKEN=!OPENCLAW_TOKEN!&& set LOCAL_AUTH_TOKEN=!OPENCLAW_TOKEN!&& set MISSION_CONTROL_API_URL=http://localhost:8000&& node server.js"
    cd /d "%SCRIPT_DIR%"
    timeout /t 1 >nul
    echo OK: Webhook bridge started on port 3003
  ) else (
    echo OK: Webhook bridge already running on port 3003
  )
) else (
  echo WARN: No packaged webhook bridge found under skills\ or workspace\skills
)

netstat -ano | find ":3010" >nul 2>&1
if errorlevel 1 (
  if "!UPDATER_TOKEN!"=="" set "UPDATER_TOKEN=!OPENCLAW_TOKEN!"
  start "Akki Updater" /MIN cmd /c "set UPDATER_TOKEN=!UPDATER_TOKEN!&& set UPDATER_REPO_ROOT=%SCRIPT_DIR%&& node \"%SCRIPT_DIR%\host_updater\server.js\""
  timeout /t 1 >nul
  echo OK: Host updater started on port 3010
) else (
  echo OK: Host updater already running on port 3010
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
  if /I "!NON_INTERACTIVE!"=="true" (
    echo ERROR: CONVEX_URL missing in non-interactive mode
    pause
    exit /b 1
  )
  set /p CONVEX_URL="Enter Convex Cloud URL (https://xxx.convex.cloud): "
)
if "!CONVEX_DEPLOY_KEY!"=="" (
  if /I "!NON_INTERACTIVE!"=="true" (
    echo ERROR: CONVEX_DEPLOY_KEY missing in non-interactive mode
    pause
    exit /b 1
  )
  set /p CONVEX_DEPLOY_KEY="Enter Convex Deploy Key (dev:xxx|yyy): "
)

call node "%WINDOWS_RUNTIME_HELPER%" upsert-env --file "%SCRIPT_DIR%\.env" --key CONVEX_URL --value "!CONVEX_URL!"
if errorlevel 1 exit /b 1
call node "%WINDOWS_RUNTIME_HELPER%" upsert-env --file "%SCRIPT_DIR%\.env" --key CONVEX_DEPLOY_KEY --value "!CONVEX_DEPLOY_KEY!"
if errorlevel 1 exit /b 1

set "MC_DEFAULTS_FILE=%temp%\akki-mc-defaults-%random%%random%.env"
(
  echo FRONTEND_PORT=3000
  echo BACKEND_PORT=8000
  echo CORS_ORIGINS=!FRONTEND_ORIGIN!,http://localhost:3000,http://127.0.0.1:3000
  echo CORS_ORIGIN=!FRONTEND_ORIGIN!
  echo AUTH_MODE=local
  echo LOCAL_AUTH_TOKEN=!OPENCLAW_TOKEN!
  echo OPENCLAW_TOKEN=!OPENCLAW_TOKEN!
  echo OPENCLAW_GATEWAY_URL=ws://host.docker.internal:18789
  echo OPENCLAW_WORKSPACE_ROOT=%OPENCLAW_WORKSPACE_ROOT%
  echo AGENTS_ROOT=%AGENTS_ROOT%
  echo DOMAINS_ROOT=%DOMAINS_ROOT%
  echo OPENCLAW_GLOBAL_SKILLS_ROOT=%OPENCLAW_GLOBAL_SKILLS_ROOT%
  echo AKKI_REPO_ROOT=%SCRIPT_DIR%
  echo AKKI_SKILLS_ROOT=%SKILLS_ROOT%
  echo AKKI_RUNTIME_ENV=%RUNTIME_ENV_FILE%
  echo NEXT_PUBLIC_API_URL=!API_BASE_URL!
  echo NEXT_PUBLIC_AUTH_MODE=local
  echo BETTER_AUTH_URL=!API_BASE_URL!
  echo CONVEX_URL=!CONVEX_URL!
  echo CONVEX_DEPLOY_KEY=!CONVEX_DEPLOY_KEY!
  echo UPDATER_URL=http://host.docker.internal:3010
  echo UPDATER_TOKEN=!OPENCLAW_TOKEN!
) > "!MC_DEFAULTS_FILE!"

if not exist "%OPERATIONS_ENV_FILE%" type nul > "%OPERATIONS_ENV_FILE%"
for /f "usebackq tokens=1,* delims==" %%k in ("!MC_DEFAULTS_FILE!") do (
  findstr /b /c:"%%k=" "%OPERATIONS_ENV_FILE%" >nul 2>&1
  if errorlevel 1 (
    echo %%k=%%l>> "%OPERATIONS_ENV_FILE%"
  )
)
del /f /q "!MC_DEFAULTS_FILE!" >nul 2>&1
echo OK: Mission Control .env synced (preserve-first: existing keys kept, missing keys appended)

if not "!CONVEX_URL!"=="" if not "!CONVEX_DEPLOY_KEY!"=="" (
  echo.
  echo Deploying Convex schema to cloud...
  cd /d "%OPERATIONS_DIR%\backend"
  if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
      echo ERROR: Failed to install Mission Control backend dependencies.
      exit /b 1
    )
  )
  set "CONVEX_DEPLOY_KEY=!CONVEX_DEPLOY_KEY!"
  call npx convex deploy
  if errorlevel 1 (
    echo WARN: Convex deploy failed. Run manually later:
    echo       cd mission_control\backend ^&^& npx convex deploy
  ) else (
    echo OK: Convex deployed!
  )
  cd /d "%SCRIPT_DIR%"
) else (
  echo SKIP: Convex setup skipped. Add CONVEX_URL to .env later.
)

cd /d "%OPERATIONS_DIR%"
docker compose -f compose.yml --env-file .env up -d --build
set "COMPOSE_EXIT=%errorlevel%"
cd /d "%SCRIPT_DIR%"
if not "%COMPOSE_EXIT%"=="0" (
  echo ERROR: Mission Control Docker startup failed ^(docker compose exit code: %COMPOSE_EXIT%^)
  echo Run from %OPERATIONS_DIR%:
  echo   docker compose -f compose.yml --env-file .env up --build
  pause
  exit /b %COMPOSE_EXIT%
)
echo OK: Mission Control started!

echo.
echo ===================================================
echo    Akki OS is LIVE!
echo ===================================================
echo.
echo    OpenClaw:        http://127.0.0.1:18789/?token=!OPENCLAW_TOKEN!
echo    Mission Control: !FRONTEND_ORIGIN!  (Login: !OPENCLAW_TOKEN!)
echo    Convex DB:       !CONVEX_URL!
echo    Webhook Bridge:  http://127.0.0.1:3003
echo    Runtime Root:    %OPENCLAW_RUNTIME_ROOT%
echo    Agent Root:      %AGENTS_ROOT%
echo    Domain Root:     %DOMAINS_ROOT%\pb-os
echo.
echo Next Step: Open Mission Control and chat with your agents!
echo.
timeout /t 3 >nul
start !FRONTEND_ORIGIN!
pause
