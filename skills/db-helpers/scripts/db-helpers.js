const API_BASE = process.env.MISSION_CONTROL_API_URL || 'http://localhost:8000';
const WEBHOOK_BASE = process.env.WEBHOOK_BASE_URL || 'http://localhost:3003';
const AUTH_TOKEN = process.env.OPENCLAW_TOKEN || process.env.LOCAL_AUTH_TOKEN || '';

function authHeaders() {
  return AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {};
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} ${text}`.trim());
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function webhookRequest(payload) {
  const response = await fetch(WEBHOOK_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} ${text}`.trim());
  }

  return response.json().catch(() => ({ success: true }));
}

async function getUser() {
  return apiRequest('/api/v1/users/me', { method: 'GET' });
}

async function logActivity(agent, action, message, user_id = null) {
  return webhookRequest({ agent, action, message, user_id });
}

async function saveDraft({ agent = 'scribe', content, platform = 'linkedin', user_id = null }) {
  return webhookRequest({
    table: 'drafts',
    agent,
    content,
    platform,
    user_id,
  });
}

async function saveMemory({ agent = 'atlas', type = 'Generic', data = {}, user_id = null }) {
  return apiRequest('/api/v1/memory', {
    method: 'POST',
    body: JSON.stringify({ agent, type, data, user_id }),
  });
}

async function getDrafts() {
  return apiRequest('/api/v1/drafts', { method: 'GET' });
}

async function getMemory({ agent, type } = {}) {
  const params = new URLSearchParams();
  if (agent) params.set('agent', agent);
  if (type) params.set('type', type);
  const query = params.toString();
  return apiRequest(`/api/v1/memory${query ? `?${query}` : ''}`, { method: 'GET' });
}

async function getProjectDocuments(slug, category) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  const query = params.toString();
  return apiRequest(`/api/v1/projects/${encodeURIComponent(slug)}/documents${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
}

async function saveConfig(key, value) {
  return webhookRequest({ action: 'config_update', key, value });
}

module.exports = {
  getUser,
  logActivity,
  saveDraft,
  saveMemory,
  getDrafts,
  getMemory,
  getProjectDocuments,
  saveConfig,
};
