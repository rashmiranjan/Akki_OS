#!/bin/bash
set -e

echo ""
echo "================================================="
echo "   Akki OS - Personal Branding Operating System"
echo "================================================="
echo ""

# [1/5] Node.js check
echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "OK: Node.js $(node --version)"

# [2/5] Docker check
echo "[2/5] Checking Docker..."
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
fi
echo "OK: Docker ready"

# [3/5] OpenClaw install
echo ""
echo "[3/5] Installing OpenClaw..."
npm install -g openclaw
echo "OK: OpenClaw installed"

# Collect secrets
echo ""
echo "================================================="
echo "   SETUP - Your credentials needed"
echo "================================================="
echo ""

if [ ! -f .env ]; then
  read -p "Enter Gateway Password (e.g. akki2026): " OPENCLAW_TOKEN
  read -p "Enter Gemini API Key: " GEMINI_API_KEY
  read -p "Enter Telegram Bot Token: " TELEGRAM_BOT_TOKEN

  cat > .env << EOF
OPENCLAW_TOKEN=$OPENCLAW_TOKEN
GEMINI_API_KEY=$GEMINI_API_KEY
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
EOF
  echo "OK: .env saved"
else
  echo "OK: Found existing .env, loading..."
  source .env
fi

# OpenClaw onboard
echo ""
echo "Setting up OpenClaw..."
npx openclaw onboard \
  --workspace $(pwd)/workspace \
  --gateway-bind loopback \
  --install-daemon \
  --gateway-token "$OPENCLAW_TOKEN"

# [4/5] Agents + Skills + Webhook + Mission Control
echo ""
echo "[4/5] Setting up Agents + Skills + Webhook + Mission Control..."

# Register agents
for agent in jarvis fury loki shuri atlas echo oracle pulse vision; do
  npx openclaw agents add $agent --workspace $(pwd)/agents/$agent 2>/dev/null || true
  echo "  OK: $agent registered"
done

# Copy skills
mkdir -p workspace/skills
cp -r skills/* workspace/skills/ 2>/dev/null || true
echo "OK: Skills copied"

# Start webhook
echo "Starting webhook server..."
cd skills/webhook-server/scripts
npm init -y > /dev/null 2>&1
npm install convex dotenv > /dev/null 2>&1
nohup node server.js > /tmp/webhook.log 2>&1 &
cd ../../..
echo "OK: Webhook started on port 3003"

# Mission Control clone
if [ ! -d mission_control ]; then
  git clone https://github.com/Chiraggoyal120/mission_control.git mission_control
  echo "OK: Mission Control cloned"
fi

cd mission_control
if [ ! -f .env ]; then
  cat > .env << EOF
FRONTEND_PORT=3000
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000
AUTH_MODE=local
LOCAL_AUTH_TOKEN=$OPENCLAW_TOKEN
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
fi

docker compose -f compose.yml --env-file .env up -d --build
cd ..
echo "OK: Mission Control started!"

# [5/5] Convex Database
echo ""
echo "[5/5] Setting up Convex Database..."
echo "================================================="
echo "   FREE database for your AI agents"
echo "   Create account at: https://convex.dev"
echo "   Then: New Project > Settings > Deploy Keys"
echo "================================================="
echo ""

if [ -z "$CONVEX_URL" ]; then
  read -p "Enter Convex Cloud URL (https://xxx.convex.cloud): " CONVEX_URL
fi
if [ -z "$CONVEX_DEPLOY_KEY" ]; then
  read -p "Enter Convex Deploy Key (dev:xxx|yyy): " CONVEX_DEPLOY_KEY
fi

# Save to both .env files
echo "CONVEX_URL=$CONVEX_URL" >> .env
echo "CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY" >> .env
echo "CONVEX_URL=$CONVEX_URL" >> mission_control/.env
echo "CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY" >> mission_control/.env

# Deploy Convex schema
if [ ! -z "$CONVEX_URL" ] && [ ! -z "$CONVEX_DEPLOY_KEY" ]; then
  echo "Deploying Convex schema to cloud..."
  cd mission_control/backend
  CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY npx convex deploy
  cd ../..
  echo "OK: Convex deployed!"
else
  echo "SKIP: Convex setup skipped. Add CONVEX_URL to .env later."
fi

echo ""
echo "================================================="
echo "   Akki OS is LIVE!"
echo "================================================="
echo ""
echo "OpenClaw:        http://127.0.0.1:18789/?token=$OPENCLAW_TOKEN"
echo "Mission Control: http://localhost:3000  (Login: $OPENCLAW_TOKEN)"
echo "Convex DB:       $CONVEX_URL"
echo ""
echo "Next Step: Open Telegram and message your bot!"
echo "Your AI will guide you through the rest."
echo ""
