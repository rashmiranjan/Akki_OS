require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MC_ENV_PATH = path.join(__dirname, '../../../mission_control/.env');
const AKKI_ENV_PATH = path.join(__dirname, '../../../.env');

// Dynamic Convex client
let convexClient = null;
let convexApi = null;

async function getConvex() {
  const url = process.env.CONVEX_URL;
  if (!url) return null;
  try {
    if (!convexClient) {
      const { ConvexHttpClient } = require('convex/browser');
      convexClient = new ConvexHttpClient(url);
      convexApi = require('../../../convex/_generated/api');
    }
    return { client: convexClient, api: convexApi.api };
  } catch (e) {
    console.log('Convex init error:', e.message);
    return null;
  }
}

function updateEnvFile(filePath, key, value) {
  try {
    let env = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(env)) {
      env = env.replace(regex, `${key}=${value}`);
    } else {
      env += `\n${key}=${value}`;
    }
    fs.writeFileSync(filePath, env);
    console.log(`Updated ${key}`);
    return true;
  } catch (e) {
    console.log(`Error updating env:`, e.message);
    return false;
  }
}

async function forwardToMissionControl(data) {
  try {
    const token = process.env.OPENCLAW_TOKEN;
    await fetch('http://localhost:8000/api/v1/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.log('Mission Control error:', e.message);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        console.log('Received:', data.action || data.agent);

        // Config update from agent
        if (data.action === 'config_update') {
          const { key, value } = data;

          // Update .env files
          updateEnvFile(AKKI_ENV_PATH, key, value);
          process.env[key] = value;

          // Reset convex client if URL changed
          if (key === 'CONVEX_URL') {
            convexClient = null;
            convexApi = null;
            console.log('Convex client reset with new URL:', value);
          }

          // Update Mission Control .env
          if (fs.existsSync(MC_ENV_PATH)) {
            updateEnvFile(MC_ENV_PATH, key, value);
            if (key === 'CONVEX_URL' || key === 'APIFY_TOKEN') {
              try {
                execSync('docker compose -f ' + path.join(__dirname, '../../../mission_control/compose.yml') + ' --env-file ' + MC_ENV_PATH + ' up -d', { stdio: 'inherit' });
              } catch (e) {
                console.log('Docker restart error:', e.message);
              }
            }
          }

          res.writeHead(200);
          res.end(JSON.stringify({ success: true, key }));
          return;
        }

        // Log activity to Convex
        const convex = await getConvex();
        if (convex) {
          if (data.table === 'drafts') {
            await convex.client.mutation(convex.api.drafts.create, {
              content: data.content || body,
              platform: data.platform || 'linkedin',
              userId: data.user_id || 'system',
              agent: data.agent || 'system'
            });
          } else {
            // default to activity
            await convex.client.mutation(convex.api.activity.log, {
              agent: data.agent || 'main',
              action: data.action || 'message',
              message: data.message || body,
              user_id: data.user_id || 'system',
            });
          }
        }

        await forwardToMissionControl(data);

        res.writeHead(200);
        res.end('OK');
      } catch (e) {
        console.log('Error:', e.message);
        res.writeHead(500);
        res.end(e.message);
      }
    });
  } else {
    res.writeHead(200);
    res.end('Webhook server running');
  }
});

server.listen(3003, () => {
  console.log('Webhook server on port 3003');
});
