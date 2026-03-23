---
name: db-helpers
description: Mission Control aur Convex-backed PB-OS data ko helper functions se access karo
---

# DB Helpers Skill

## Purpose
Mission Control ke canonical Convex path ke through PB-OS memory, drafts, activity, aur mirrored project docs ko access karna.

## Setup
- `OPENCLAW_TOKEN` ya `LOCAL_AUTH_TOKEN`
- Optional: `MISSION_CONTROL_API_URL` (default `http://localhost:8000`)
- Optional: `WEBHOOK_BASE_URL` (default `http://localhost:3003`)

## Functions
- `getUser()`
- `logActivity(agent, action, message, user_id?)`
- `saveDraft({ agent, content, platform, user_id })`
- `saveMemory({ agent, type, data, user_id })`
- `getDrafts()`
- `getMemory({ agent?, type? })`
- `getProjectDocuments(slug, category?)`
- `saveConfig(key, value)`

## Usage
const db = require('./db-helpers');
await db.logActivity('oracle', 'research', 'Found pain points');
await db.saveDraft({ agent: 'scribe', content, platform: 'linkedin' });
await db.saveMemory({ agent: 'atlas', type: 'UserProfile', data: profile });
await db.getProjectDocuments('my-project', 'operations');
