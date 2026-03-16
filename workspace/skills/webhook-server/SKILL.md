---
name: webhook-server
description: Mission Control ko real-time notifications bhejne ke liye local server
---

# Webhook Server Skill

## Purpose
Mission Control ko real-time notifications bhejne ke liye local server

## Setup
cd workspace/skills/webhook-server
npm init -y
npm install @convex via webhook/convex via webhook-js
node server.js &

## Port
3003

## Usage
curl -X POST http://127.0.0.1:3003 \
  -H "Content-Type: application/json" \
  -d '{"agent": "fury", "action": "research_complete", "message": "summary"}'

## Auto-start
Add to install.sh - starts automatically on setup
