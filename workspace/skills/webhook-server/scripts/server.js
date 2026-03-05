require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MC_ENV_PATH = path.join(__dirname, '../../../mission_control/.env');
const AKKI_ENV_PATH = path.join(__dirname, '../../../.env');

// Fallback path can be enabled via env if Mission Control is temporarily unavailable.
const ENABLE_DIRECT_CONVEX_FALLBACK = process.env.WEBHOOK_FALLBACK_DIRECT_CONVEX === 'true';

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
    console.log('Error updating env:', e.message);
    return false;
  }
}

async function forwardToMissionControl(data) {
  const token = process.env.OPENCLAW_TOKEN || process.env.LOCAL_AUTH_TOKEN || '';
  try {
    const response = await fetch('http://localhost:8000/api/v1/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} ${text}`.trim());
    }

    return true;
  } catch (e) {
    console.log('Mission Control error:', e.message);
    return false;
  }
}

async function saveDirectToConvex(data, rawBody) {
  const convex = await getConvex();
  if (!convex) {
    return false;
  }

  try {
    if (data.table === 'drafts' || data.content) {
      await convex.client.mutation(convex.api.drafts.create, {
        content: data.content || data.message || rawBody,
        platform: data.platform || 'linkedin',
        userId: data.user_id || 'local-user',
        agent: data.agent || 'system',
      });
    } else {
      await convex.client.mutation(convex.api.activity.log, {
        agent: data.agent || 'main',
        action: data.action || 'message',
        message: data.message || rawBody,
        user_id: data.user_id || 'local-user',
      });
    }
    return true;
  } catch (e) {
    console.log('Direct Convex fallback error:', e.message);
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(200);
    res.end('Webhook server running');
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      console.log('Received:', data.action || data.agent);

      if (data.action === 'config_update') {
        const { key, value } = data;

        updateEnvFile(AKKI_ENV_PATH, key, value);
        process.env[key] = value;

        if (key === 'CONVEX_URL') {
          convexClient = null;
          convexApi = null;
          console.log('Convex client reset with new URL:', value);
        }

        if (fs.existsSync(MC_ENV_PATH)) {
          updateEnvFile(MC_ENV_PATH, key, value);
          if (key === 'CONVEX_URL' || key === 'APIFY_TOKEN') {
            try {
              execSync(
                'docker compose -f ' +
                  path.join(__dirname, '../../../mission_control/compose.yml') +
                  ' --env-file ' +
                  MC_ENV_PATH +
                  ' up -d',
                { stdio: 'inherit' }
              );
            } catch (e) {
              console.log('Docker restart error:', e.message);
            }
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, key }));
        return;
      }

      const forwarded = await forwardToMissionControl(data);
      if (!forwarded && ENABLE_DIRECT_CONVEX_FALLBACK) {
        const fallbackSaved = await saveDirectToConvex(data, body);
        if (!fallbackSaved) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Mission Control and fallback writes failed' }));
          return;
        }
      } else if (!forwarded) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Mission Control ingest failed' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      console.log('Error:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  });
});

server.listen(3003, () => {
  console.log('Webhook server on port 3003');
});
