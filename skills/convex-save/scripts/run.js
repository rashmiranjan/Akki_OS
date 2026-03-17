const API_BASE = process.env.MISSION_CONTROL_API_URL || 'http://localhost:8000';
const WEBHOOK_BASE = process.env.WEBHOOK_BASE_URL || 'http://localhost:3003';
const AUTH_TOKEN = process.env.OPENCLAW_TOKEN || process.env.LOCAL_AUTH_TOKEN || '';

async function save(table, data) {
  const target = String(table || '').toLowerCase();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (AUTH_TOKEN) {
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }

  let response;
  if (target === 'memory') {
    response = await fetch(`${API_BASE}/api/v1/memory`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  } else {
    response = await fetch(WEBHOOK_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: target, ...data }),
    });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Failed to save ${target}: HTTP ${response.status} ${text}`.trim());
  }

  console.log(`Saved to ${target} via Mission Control bridge`);
}

const [table, ...rest] = process.argv.slice(2);

save(table, JSON.parse(rest.join(' '))).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
