#!/bin/bash

echo ""
echo "==================================================="
echo "   Akki OS - Personal Branding Operating System"
echo "==================================================="
echo ""

# [1/5] Node.js check
echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found! Install from: https://nodejs.org"
    exit 1
fi
echo "OK: Node.js ready"

# [2/5] Docker check
echo "[2/5] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker not found! Install from: https://docker.com"
    exit 1
fi
if ! docker info &> /dev/null; then
    echo "ERROR: Docker not running! Please start Docker first."
    exit 1
fi
echo "OK: Docker ready"

# [3/5] OpenClaw install
echo ""
echo "[3/5] Installing OpenClaw..."
if ! command -v openclaw &> /dev/null; then
    npm install -g openclaw
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
npx openclaw onboard \
    --workspace "$SCRIPT_DIR/workspace" \
    --gateway-bind loopback \
    --install-daemon \
    --gateway-token "$OPENCLAW_TOKEN"

# [4/5] Agents + Skills + Webhook + Mission Control
echo ""
echo "[4/5] Setting up Agents + Skills + Webhook + Mission Control..."

# Register agents
for agent in jarvis fury loki shuri atlas echo oracle pulse vision; do
    npx openclaw agents add $agent --workspace "$SCRIPT_DIR/agents/$agent" &> /dev/null || true
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
docker compose -f compose.yml --env-file .env up -d --build
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
