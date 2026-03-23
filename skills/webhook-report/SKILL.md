---
name: webhook-report
description: Har task complete hone ke baad Mission Control ko notify karo
---

# Webhook Report Skill

## Purpose
Har task complete hone ke baad Mission Control ko notify karo

## Usage
curl -X POST http://127.0.0.1:3003 \
  -H "Content-Type: application/json" \
  -d '{"agent": "YOUR_AGENT_NAME", "action": "YOUR_ACTION", "message": "YOUR_SUMMARY"}'

## Examples
# Oracle research complete
curl -X POST http://127.0.0.1:3003 \
  -H "Content-Type: application/json" \
  -d '{"agent": "oracle", "action": "research_complete", "message": "Found 5 pain points"}'

# Scribe draft created
curl -X POST http://127.0.0.1:3003 \
  -H "Content-Type: application/json" \
  -d '{"agent": "scribe", "action": "draft_created", "message": "LinkedIn post ready"}'

## MANDATORY
Always run this after completing ANY task!
