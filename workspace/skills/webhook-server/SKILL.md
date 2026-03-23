---
name: webhook-server
description: Mission Control aur Convex ke beech compatibility bridge server
---

# Webhook Server Skill

## Purpose
Older skills aur agents ke webhook payloads ko Mission Control ke canonical Convex-backed ingest path par forward karna.

## Setup
cd workspace/skills/webhook-server
node server.js &

## Port
3003

## Usage
curl -X POST http://127.0.0.1:3003 \
  -H "Content-Type: application/json" \
  -d '{"agent": "oracle", "action": "research_complete", "message": "summary"}'

## Auto-start
Add to install.sh - starts automatically on setup
