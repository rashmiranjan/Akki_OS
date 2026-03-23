---
name: convex-save
description: Mission Control bridge ke through Convex-backed app data save karo
---

# Convex Save Skill

## Purpose
Mission Control ke supported webhook/API bridge ke through Convex-backed PB-OS data save karna.

## Usage
node scripts/run.js drafts '{"agent":"scribe","content":"LinkedIn post body","platform":"linkedin"}'
node scripts/run.js activity '{"agent":"oracle","action":"research_complete","message":"Competitive scan ready"}'
node scripts/run.js memory '{"agent":"atlas","type":"UserProfile","data":{"name":"Akki"}}'

## Supported Targets
- `drafts`
- `activity`
- `memory`

## Notes
- `memory` writes go to `POST /api/v1/memory`
- other targets go through the webhook bridge at `http://localhost:3003`
- direct `rest/v1` SQL-style writes are not part of the supported runtime
