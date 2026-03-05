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

# [1/5] Node.js check + auto-install (Node 22+ required by OpenClaw)
echo "[1/5] Checking Node.js..."
NODE_MAJOR=""
if command -v node &> /dev/null; then
    NODE_MAJOR=$(node -v 2>/dev/null | sed 's/^v//; s/\..*//')
fi
if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 22 ] 2>/dev/null; then
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

echo ""
echo "==================================================="
echo "   SETUP - One thing needed!"
echo "==================================================="
echo ""

if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "--- Gateway Password ---"
    echo "This will be your dashboard login password."
    echo ""
    read -p "Enter Gateway Password (e.g. akki2026): " OPENCLAW_TOKEN
    echo "OPENCLAW_TOKEN=$OPENCLAW_TOKEN" > "$SCRIPT_DIR/.env"
    echo "OK: Saved!"
else
    echo "OK: Found existing .env, loading..."
    source "$SCRIPT_DIR/.env"
fi

# OpenClaw onboard
echo ""
echo "OpenClaw will now guide you through full setup..."
echo ""
openclaw onboard \
    --workspace "$SCRIPT_DIR/workspace" \
    --gateway-bind loopback \
    --install-daemon \
    --gateway-token "$OPENCLAW_TOKEN"

# [4/5] Agents + Skills + Webhook + Mission Control
echo ""
echo "[4/5] Setting up Agents + Skills + Webhook + Mission Control..."

# Register agents
for agent in jarvis fury loki shuri atlas echo oracle pulse vision; do
    openclaw agents add $agent --workspace "$SCRIPT_DIR/agents/$agent" &> /dev/null || true
    echo "  OK: $agent registered"
done

# Copy skills
mkdir -p "$SCRIPT_DIR/workspace/skills"
cp -r "$SCRIPT_DIR/skills/"* "$SCRIPT_DIR/workspace/skills/" 2>/dev/null || true
echo "OK: Skills copied"

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

# Mission Control clone
if [ ! -d "$SCRIPT_DIR/mission_control" ]; then
    git clone https://github.com/Chiraggoyal120/mission_control.git "$SCRIPT_DIR/mission_control"
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
    read -p "Enter Convex Cloud URL (https://xxx.convex.cloud): " CONVEX_URL
    echo "CONVEX_URL=$CONVEX_URL" >> "$SCRIPT_DIR/.env"
fi
if [ -z "$CONVEX_DEPLOY_KEY" ]; then
    read -p "Enter Convex Deploy Key (dev:xxx|yyy): " CONVEX_DEPLOY_KEY
    echo "CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY" >> "$SCRIPT_DIR/.env"
fi

# Mission Control .env — sab values ek saath
if [ ! -f "$SCRIPT_DIR/mission_control/.env" ]; then
    cat > "$SCRIPT_DIR/mission_control/.env" << EOF
FRONTEND_PORT=3000
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
AUTH_MODE=local
LOCAL_AUTH_TOKEN=$OPENCLAW_TOKEN
OPENCLAW_TOKEN=$OPENCLAW_TOKEN
OPENCLAW_GATEWAY_URL=ws://host.docker.internal:18789
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_URL=http://localhost:8000
CONVEX_URL=$CONVEX_URL
CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY
EOF
    echo "OK: Mission Control .env created"
else
    echo "CONVEX_URL=$CONVEX_URL" >> "$SCRIPT_DIR/mission_control/.env"
    echo "CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY" >> "$SCRIPT_DIR/mission_control/.env"
fi

# Deploy Convex schema — Docker se PEHLE
if [ -n "$CONVEX_URL" ] && [ -n "$CONVEX_DEPLOY_KEY" ]; then
    echo ""
    echo "Deploying Convex schema to cloud..."
    cd "$SCRIPT_DIR/mission_control/backend"
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
cd "$SCRIPT_DIR/mission_control"
$DOCKER_CMD compose -f compose.yml --env-file .env up -d --build
cd "$SCRIPT_DIR"
echo "OK: Mission Control started!"

echo ""
echo "==================================================="
echo "   Akki OS is LIVE!"
echo "==================================================="
echo ""
echo "   OpenClaw:        http://127.0.0.1:18789/?token=$OPENCLAW_TOKEN"
echo "   Mission Control: http://localhost:3000  (Login: $OPENCLAW_TOKEN)"
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
