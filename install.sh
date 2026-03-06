#!/bin/bash

echo ""
echo "==================================================="
echo "   Akki OS - Personal Branding Operating System"
echo "==================================================="
echo ""

# Detect OS for auto-install
detect_os() {
    case "$(uname -s)" in
        Linux*)   echo "linux";;
        Darwin*) echo "macos";;
        *)       echo "unknown";;
    esac
}
OS="$(detect_os)"
INSTALL_MODE="install"
NON_INTERACTIVE=false
DRY_RUN=false
FROM_VERSION=""
CUSTOM_BACKUP_DIR=""

while [ $# -gt 0 ]; do
    case "$1" in
        --upgrade)
            INSTALL_MODE="upgrade"
            ;;
        --mode)
            shift
            INSTALL_MODE="${1:-install}"
            ;;
        --non-interactive)
            NON_INTERACTIVE=true
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
        --from-version)
            shift
            FROM_VERSION="${1:-}"
            ;;
        --backup-dir)
            shift
            CUSTOM_BACKUP_DIR="${1:-}"
            ;;
        *)
            echo "WARN: Unknown option '$1' (ignored)"
            ;;
    esac
    shift
done

if [ "$INSTALL_MODE" != "install" ] && [ "$INSTALL_MODE" != "upgrade" ]; then
    echo "ERROR: --mode must be install or upgrade"
    exit 1
fi

echo "Mode: $INSTALL_MODE (dry-run=$DRY_RUN, non-interactive=$NON_INTERACTIVE)"

# [1/5] Node.js check + auto-install (Node 22+ required by OpenClaw)
echo "[1/5] Checking Node.js..."
NODE_MAJOR=""
if command -v node &> /dev/null; then
    NODE_MAJOR=$(node -v 2>/dev/null | sed 's/^v//; s/\..*//')
fi
if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 22 ] 2>/dev/null; then
    if [ "$DRY_RUN" = true ]; then
        echo "ERROR: Dry-run requires Node.js 22+ already installed."
        exit 1
    fi
    if [ -n "$NODE_MAJOR" ]; then
        echo "Node.js v$(node -v 2>/dev/null) found, upgrading to v22+..."
    else
        echo "Node.js not found. Installing Node 22+..."
    fi
    if [ "$OS" = "linux" ]; then
        if command -v curl &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y nodejs npm
        else
            echo "ERROR: Could not install Node.js. Install Node 22+ from https://nodejs.org"
            exit 1
        fi
    elif [ "$OS" = "macos" ]; then
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo "ERROR: Homebrew not found. Install Node 22+ from https://nodejs.org or run: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    else
        echo "ERROR: Unsupported OS. Install Node.js 22+ from https://nodejs.org"
        exit 1
    fi
    if ! command -v node &> /dev/null; then
        echo "ERROR: Node.js install failed. Install Node 22+ manually from https://nodejs.org"
        exit 1
    fi
    echo "OK: Node.js $(node -v) installed"
else
    echo "OK: Node.js $(node -v) ready"
fi

# [2/5] Docker check + auto-install
echo "[2/5] Checking Docker..."
if ! command -v docker &> /dev/null; then
    if [ "$DRY_RUN" = true ]; then
        echo "ERROR: Dry-run requires Docker already installed."
        exit 1
    fi
    echo "Docker not found. Installing automatically..."
    if [ "$OS" = "linux" ]; then
        if command -v curl &> /dev/null; then
            curl -fsSL https://get.docker.com | sudo sh
            sudo usermod -aG docker "$USER" 2>/dev/null || true
        else
            echo "ERROR: curl required to install Docker. Install Docker manually from https://docker.com"
            exit 1
        fi
    elif [ "$OS" = "macos" ]; then
        if command -v brew &> /dev/null; then
            brew install --cask docker
            echo "Docker Desktop installed. Please open Docker from Applications and start it, then re-run this script."
            exit 0
        else
            echo "ERROR: Install Docker Desktop from https://docker.com"
            exit 1
        fi
    else
        echo "ERROR: Install Docker from https://docker.com"
        exit 1
    fi
    echo "OK: Docker installed"
fi
# Ensure Docker daemon is running (Linux); use DOCKER_CMD so we can fall back to sudo if needed
DOCKER_CMD="docker"
if ! docker info &> /dev/null; then
    if [ "$OS" = "linux" ]; then
        echo "Starting Docker service..."
        sudo systemctl enable docker 2>/dev/null || true
        sudo systemctl start docker 2>/dev/null || sudo service docker start 2>/dev/null || true
        for i in 1 2 3 4 5; do
            sleep 2
            if docker info &> /dev/null; then
                break
            fi
            if [ "$i" -eq 5 ]; then
                if sudo docker info &> /dev/null; then
                    DOCKER_CMD="sudo docker"
                    echo "OK: Docker is running (using sudo for this session; log out and back in to use docker without sudo)."
                else
                    echo "ERROR: Docker not running. Try: sudo systemctl start docker"
                    exit 1
                fi
            fi
        done
    else
        echo "ERROR: Docker not running. On macOS start Docker Desktop."
        exit 1
    fi
fi
if ! $DOCKER_CMD info &> /dev/null; then
    if [ "$OS" = "linux" ] && sudo docker info &> /dev/null; then
        DOCKER_CMD="sudo docker"
        echo "OK: Docker ready (using sudo for this session)."
    else
        echo "ERROR: Docker not running. On Linux run: sudo systemctl start docker. On macOS start Docker Desktop."
        exit 1
    fi
else
    echo "OK: Docker ready"
fi

# [3/5] OpenClaw install (global via sudo in standard system PATH)
echo ""
echo "[3/5] Installing OpenClaw..."
if ! command -v openclaw &> /dev/null; then
    if [ "$DRY_RUN" = true ]; then
        echo "ERROR: Dry-run requires OpenClaw already installed."
        exit 1
    fi
    echo "Installing OpenClaw globally with sudo npm (this will typically use /usr/local)..."
    if ! command -v npm &> /dev/null; then
        echo "ERROR: npm not found even though Node.js is installed. Install npm and re-run."
        exit 1
    fi
    sudo npm install -g openclaw@latest
fi
if ! command -v openclaw &> /dev/null; then
    GLOBAL_BIN="$(npm prefix -g 2>/dev/null)/bin"
    echo "ERROR: openclaw not found on PATH after global install."
    echo "Make sure your global npm bin dir is on PATH, then re-run. For example:"
    echo "  export PATH=\"$GLOBAL_BIN:\$PATH\""
    exit 1
fi
echo "OK: OpenClaw installed"

# Setup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPERATIONS_DIR="$SCRIPT_DIR/mission_control"
OPENCLAW_WORKSPACE_ROOT="$SCRIPT_DIR/workspace"
AGENTS_ROOT="$SCRIPT_DIR/agents"
OPENCLAW_CONFIG_PATH="${HOME}/.openclaw/openclaw.json"
OPENCLAW_WORKSPACE_CONFIG_TEMPLATE="${OPENCLAW_WORKSPACE_ROOT}/openclaw.json"
if [ -n "${OPENCLAW_GATEWAY_BIND:-}" ]; then
    DESIRED_GATEWAY_BIND="$OPENCLAW_GATEWAY_BIND"
elif [ "$OS" = "linux" ]; then
    DESIRED_GATEWAY_BIND="lan"
else
    DESIRED_GATEWAY_BIND="loopback"
fi

detect_public_host() {
    if [ -n "${OPENCLAW_PUBLIC_HOST:-}" ]; then
        echo "$OPENCLAW_PUBLIC_HOST"
        return
    fi
    local detected
    detected="$(hostname -I 2>/dev/null | awk '{for(i=1;i<=NF;i++) if ($i !~ /^127\./) {print $i; exit}}')"
    if [ -n "$detected" ]; then
        echo "$detected"
    else
        echo "localhost"
    fi
}

upsert_env() {
    local key="$1"
    local value="$2"
    local env_file="$SCRIPT_DIR/.env"
    if [ ! -f "$env_file" ]; then
        touch "$env_file"
    fi
    if grep -q "^${key}=" "$env_file"; then
        sed -i.bak "s|^${key}=.*$|${key}=${value}|" "$env_file" && rm -f "$env_file.bak"
    else
        echo "${key}=${value}" >> "$env_file"
    fi
}

sync_openclaw_token() {
    if [ ! -f "$OPENCLAW_CONFIG_PATH" ]; then
        echo ""
        echo "ERROR: Could not find OpenClaw config at $OPENCLAW_CONFIG_PATH"
        echo "Run onboarding once and re-run install.sh."
        exit 1
    fi

    ACTUAL_OPENCLAW_TOKEN="$(node -e "
      try {
        const fs = require('fs');
        const cfg = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
        const token = cfg?.gateway?.auth?.token || '';
        process.stdout.write(token);
      } catch (_) {
        process.stdout.write('');
      }
    " "$OPENCLAW_CONFIG_PATH")"

    if [ -z "$ACTUAL_OPENCLAW_TOKEN" ]; then
        echo ""
        echo "ERROR: OpenClaw token not found in $OPENCLAW_CONFIG_PATH"
        echo "Please run: openclaw doctor"
        exit 1
    fi

    OPENCLAW_TOKEN="$ACTUAL_OPENCLAW_TOKEN"
    upsert_env "OPENCLAW_TOKEN" "$OPENCLAW_TOKEN"
    echo "OK: Synced OpenClaw gateway token"
}

configure_npm_user_prefix() {
    # Prevent EACCES when OpenClaw installs missing skill deps (e.g. clawhub).
    if command -v npm &> /dev/null; then
        mkdir -p "$HOME/.npm-global"
        export NPM_CONFIG_PREFIX="$HOME/.npm-global"
        npm config set prefix "$NPM_CONFIG_PREFIX" >/dev/null 2>&1 || true
        case ":$PATH:" in
            *":$HOME/.npm-global/bin:"*) ;;
            *) export PATH="$HOME/.npm-global/bin:$PATH" ;;
        esac
        echo "OK: npm user prefix set to $NPM_CONFIG_PREFIX"
    fi
}

apply_workspace_openclaw_template() {
    if [ ! -f "$OPENCLAW_WORKSPACE_CONFIG_TEMPLATE" ]; then
        return 0
    fi
    if [ ! -f "$OPENCLAW_CONFIG_PATH" ]; then
        return 0
    fi

    node - "$OPENCLAW_CONFIG_PATH" "$OPENCLAW_WORKSPACE_CONFIG_TEMPLATE" <<'NODE'
const fs = require("fs");
const runtimePath = process.argv[2];
const templatePath = process.argv[3];

const deepMerge = (target, source) => {
  if (!source || typeof source !== "object" || Array.isArray(source)) return target;
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== "object" || Array.isArray(target[k])) {
        target[k] = {};
      }
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
};

try {
  const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
  const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));
  const merged = deepMerge(runtime, template);
  fs.writeFileSync(runtimePath, JSON.stringify(merged, null, 2));
  process.stdout.write("OK: Applied workspace/openclaw.json template\n");
} catch (err) {
  process.stderr.write(`WARN: Could not apply workspace OpenClaw template: ${err.message}\n`);
}
NODE
}

configure_openclaw_gateway_defaults() {
    if [ ! -f "$OPENCLAW_CONFIG_PATH" ]; then
        return 0
    fi

    LOCAL_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
    AUTO_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
    if [ -n "$AUTO_IP" ]; then
        LOCAL_ORIGINS="${LOCAL_ORIGINS},http://${AUTO_IP}:3000"
    fi
    EFFECTIVE_ORIGINS="${OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS:-$LOCAL_ORIGINS}"

    node - "$OPENCLAW_CONFIG_PATH" "$DESIRED_GATEWAY_BIND" "$EFFECTIVE_ORIGINS" <<'NODE'
const fs = require("fs");
const configPath = process.argv[2];
const bindMode = process.argv[3];
const originsCsv = process.argv[4] || "";

try {
  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  cfg.gateway = cfg.gateway || {};
  cfg.gateway.bind = bindMode || cfg.gateway.bind || "loopback";
  cfg.gateway.controlUi = cfg.gateway.controlUi || {};

  const origins = originsCsv
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const deduped = [...new Set(origins)];

  if (deduped.length) {
    cfg.gateway.controlUi.allowedOrigins = deduped;
  }

  if (cfg.gateway.bind !== "loopback") {
    cfg.gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback = true;
  }

  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  process.stdout.write(`OK: OpenClaw gateway config updated (bind=${cfg.gateway.bind})\n`);
} catch (err) {
  process.stderr.write(`WARN: Failed to patch OpenClaw gateway config: ${err.message}\n`);
}

PUBLIC_HOST="$(detect_public_host)"
FRONTEND_ORIGIN="http://${PUBLIC_HOST}:3000"
API_BASE_URL="http://${PUBLIC_HOST}:8000"
NODE
}

echo ""
echo "==================================================="
echo "   SETUP - One thing needed!"
echo "==================================================="
echo ""

if [ ! -f "$SCRIPT_DIR/.env" ]; then
    touch "$SCRIPT_DIR/.env"
    echo "OK: Created .env"
fi
echo "OK: Loading .env"
source "$SCRIPT_DIR/.env"
configure_npm_user_prefix

run_managed_sync() {
    local action="$1"
    local cmd=(node "$SCRIPT_DIR/tools/managed_sync.js"
      --action "$action"
      --mode "$INSTALL_MODE"
      --repo-root "$SCRIPT_DIR"
      --openclaw-config "$OPENCLAW_CONFIG_PATH"
      --manifest "$SCRIPT_DIR/releases/manifest.json"
      --state-file "$HOME/.akki/state/install-state.json")
    if [ -n "$FROM_VERSION" ]; then
      cmd+=(--from-version "$FROM_VERSION")
    fi
    if [ -n "$CUSTOM_BACKUP_DIR" ]; then
      cmd+=(--backup-dir "$CUSTOM_BACKUP_DIR")
    fi
    if [ "$DRY_RUN" = true ]; then
      cmd+=(--dry-run)
    fi
    "${cmd[@]}"
}

if [ "$DRY_RUN" = true ]; then
    echo "DRY-RUN: Skipping mutating operations; showing planned sync/report only."
    run_managed_sync check
    run_managed_sync sync
    exit 0
fi

# OpenClaw onboard (install mode only; upgrade mode must not re-onboard)
if [ "$INSTALL_MODE" = "install" ]; then
    echo ""
    echo "OpenClaw will now guide you through full setup."
    echo ""
    openclaw onboard \
        --workspace "$SCRIPT_DIR/workspace" \
        --gateway-bind "$DESIRED_GATEWAY_BIND"
else
    if [ ! -f "$OPENCLAW_CONFIG_PATH" ]; then
        echo "ERROR: Upgrade mode requires existing OpenClaw config at $OPENCLAW_CONFIG_PATH"
        exit 1
    fi
    echo "OK: Upgrade mode detected existing OpenClaw config; onboarding skipped."
fi

echo ""
echo "Syncing OpenClaw gateway token..."
sync_openclaw_token
apply_workspace_openclaw_template
configure_openclaw_gateway_defaults
echo "Running managed sync preflight..."
run_managed_sync sync > "$SCRIPT_DIR/.last-managed-sync.json"
echo "OK: Managed sync report written to $SCRIPT_DIR/.last-managed-sync.json"

# Install OpenClaw gateway as a systemd service (system scope) for 24/7 uptime
if command -v systemctl &> /dev/null; then
    echo ""
    echo "Setting up OpenClaw Gateway as a systemd service (requires sudo)..."
    SERVICE_NAME="openclaw"
    SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
    sudo bash -c "cat > \"$SERVICE_FILE\" << EOF
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=$(command -v openclaw) gateway --port 18789
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF"
    sudo systemctl daemon-reload
    sudo systemctl enable --now "$SERVICE_NAME"
    echo "OK: OpenClaw Gateway service installed and started (systemd unit: $SERVICE_NAME)."
else
    echo "WARN: systemd not available; OpenClaw Gateway will not auto-restart. Start manually with: openclaw gateway --port 18789"
fi

# [4/5] Agents + Skills + Webhook + Mission Control
echo ""
echo "[4/5] Setting up Agents + Skills + Webhook + Mission Control..."

# Register agents
AGENT_CONFLICT_LOG="$SCRIPT_DIR/.akki-agent-conflicts.log"
mkdir -p "$SCRIPT_DIR/.akki"
: > "$AGENT_CONFLICT_LOG"
for agent in jarvis fury loki shuri atlas echo oracle pulse vision; do
    AGENT_OUTPUT="$(openclaw agents add "$agent" --workspace "$SCRIPT_DIR/agents/$agent" 2>&1)"
    AGENT_EXIT=$?
    if [ $AGENT_EXIT -eq 0 ]; then
      echo "  OK: $agent registered"
    elif echo "$AGENT_OUTPUT" | grep -qi "already"; then
      echo "  OK: $agent already exists (preserved)"
    else
      echo "  WARN: $agent registration issue"
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $agent :: $AGENT_OUTPUT" >> "$AGENT_CONFLICT_LOG"
    fi
done

# Copy skills
echo "OK: Skills sync managed by tools/managed_sync.js (local edits preserved)"

# Start webhook — port check pehle
if ! lsof -i :3003 &> /dev/null; then
    cd "$SCRIPT_DIR/skills/webhook-server/scripts"
    echo "CONVEX_URL=$CONVEX_URL" > .env
    echo "OPENCLAW_TOKEN=$OPENCLAW_TOKEN" >> .env
    npm init -y &> /dev/null
    npm install convex dotenv &> /dev/null
    nohup node server.js > "$SCRIPT_DIR/webhook.log" 2>&1 &
    cd "$SCRIPT_DIR"
    sleep 2
    echo "OK: Webhook started on port 3003"
else
    echo "OK: Webhook already running on port 3003"
fi

# Start host updater service (local-only, token-protected)
if ! lsof -i :3010 &> /dev/null; then
    mkdir -p "$HOME/.akki/state"
    UPDATER_TOKEN_VALUE="${UPDATER_TOKEN:-$OPENCLAW_TOKEN}"
    nohup env UPDATER_TOKEN="$UPDATER_TOKEN_VALUE" UPDATER_REPO_ROOT="$SCRIPT_DIR" node "$SCRIPT_DIR/host_updater/server.js" > "$HOME/.akki/state/host-updater.log" 2>&1 &
    sleep 1
    echo "OK: Host updater started on port 3010"
else
    echo "OK: Host updater already running on port 3010"
fi

# Mission Control clone
if [ ! -d "$OPERATIONS_DIR" ]; then
    git clone https://github.com/Chiraggoyal120/mission_control.git "$OPERATIONS_DIR"
    echo "OK: Mission Control cloned"
fi

# [5/5] Convex setup
echo ""
echo "[5/5] Setting up Convex Database..."
echo "==================================================="
echo "   FREE database for your AI agents"
echo "   Create account at: https://convex.dev"
echo "   Then: New Project > Settings > Deploy Keys"
echo "==================================================="
echo ""

if [ -z "$CONVEX_URL" ]; then
    if [ "$NON_INTERACTIVE" = true ]; then
      echo "ERROR: CONVEX_URL missing in non-interactive mode"
      exit 1
    fi
    read -p "Enter Convex Cloud URL (https://xxx.convex.cloud): " CONVEX_URL
fi
if [ -z "$CONVEX_DEPLOY_KEY" ]; then
    if [ "$NON_INTERACTIVE" = true ]; then
      echo "ERROR: CONVEX_DEPLOY_KEY missing in non-interactive mode"
      exit 1
    fi
    read -p "Enter Convex Deploy Key (dev:xxx|yyy): " CONVEX_DEPLOY_KEY
fi
upsert_env "CONVEX_URL" "$CONVEX_URL"
upsert_env "CONVEX_DEPLOY_KEY" "$CONVEX_DEPLOY_KEY"

# Mission Control .env — always refresh so token stays in sync with OpenClaw
cat > "$OPERATIONS_DIR/.env" << EOF
FRONTEND_PORT=3000
BACKEND_PORT=8000
CORS_ORIGINS=${FRONTEND_ORIGIN},http://localhost:3000,http://127.0.0.1:3000
CORS_ORIGIN=${FRONTEND_ORIGIN}
AUTH_MODE=local
LOCAL_AUTH_TOKEN=$OPENCLAW_TOKEN
OPENCLAW_TOKEN=$OPENCLAW_TOKEN
OPENCLAW_GATEWAY_URL=ws://host.docker.internal:18789
OPENCLAW_WORKSPACE_ROOT=$OPENCLAW_WORKSPACE_ROOT
AGENTS_ROOT=$AGENTS_ROOT
NEXT_PUBLIC_API_URL=${API_BASE_URL}
BETTER_AUTH_URL=${API_BASE_URL}
CONVEX_URL=$CONVEX_URL
CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY
UPDATER_URL=${UPDATER_URL:-http://host.docker.internal:3010}
UPDATER_TOKEN=${UPDATER_TOKEN:-$OPENCLAW_TOKEN}
EOF
echo "OK: Mission Control .env synced"

# Deploy Convex schema — Docker se PEHLE
if [ -n "$CONVEX_URL" ] && [ -n "$CONVEX_DEPLOY_KEY" ]; then
    echo ""
    echo "Deploying Convex schema to cloud..."
    cd "$OPERATIONS_DIR/backend"
    # Ensure backend dependencies (including convex) are installed before deploy
    if [ ! -d "node_modules" ]; then
        echo "Installing Mission Control backend dependencies (npm install)..."
        npm install
    fi
    CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY npx convex deploy
    if [ $? -ne 0 ]; then
        echo "WARN: Convex deploy failed. Run manually later:"
        echo "      cd mission_control/backend && npx convex deploy"
    else
        echo "OK: Convex deployed!"
    fi
    cd "$SCRIPT_DIR"
else
    echo "SKIP: Convex setup skipped. Add CONVEX_URL to .env later."
fi

# Start Docker — Convex ready hone ke baad
cd "$OPERATIONS_DIR"
$DOCKER_CMD compose -f compose.yml --env-file .env up -d --build
cd "$SCRIPT_DIR"
echo "OK: Mission Control started!"

echo ""
echo "==================================================="
echo "   Akki OS is LIVE!"
echo "==================================================="
echo ""
echo "   OpenClaw:        http://127.0.0.1:18789/?token=$OPENCLAW_TOKEN"
echo "   Mission Control: $FRONTEND_ORIGIN  (Login: $OPENCLAW_TOKEN)"
echo "   Convex DB:       $CONVEX_URL"
echo "   Webhook:         http://localhost:3003"
echo ""
echo "Next Step: Open Mission Control and chat with your agents!"
echo ""

# Auto open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi
