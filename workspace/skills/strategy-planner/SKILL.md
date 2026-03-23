---
name: strategy-planner
description: 7-day content calendar banana aur brand strategy plan karna
---

# Strategy Planner Skill

## Purpose
7-day content calendar banana aur brand strategy plan karna

## Weekly Calendar Template
Monday: LinkedIn - Pain Story
Tuesday: Twitter - Hot Take Thread
Wednesday: LinkedIn - Tactical Post
Thursday: Newsletter/LinkedIn - Case Study
Friday: Twitter - Results Thread
Saturday: Engagement only (no post)
Sunday: Plan next week strategy

## Strategy Rules
- Platform mix: 60% LinkedIn, 40% Twitter
- Content mix: 40% educational, 30% personal, 30% promotional
- Post timing: LinkedIn 8am-10am, Twitter 12pm-2pm
- Minimum 5 posts per week

## Input Needed
- User profile from convex via webhook
- Last week performance from Pulse
- Current ideas from Oracle
- Pain points from Fury

## After Planning
1. Save strategy to convex via webhook:
curl -X POST http://localhost:3003
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWpvcGR4enB3cWxoZXl4cWRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY1NDYyMiwiZXhwIjoyMDg3MjMwNjIyfQ.-Zws-y7D3n7pVtrkg-UVtJxJ-Ar7M0quIgfhzEQZPms" \
  -H "Content-Type: application/json" \
  -d '{"calendar": {}, "week_start": "DATE"}'

2. Report to webhook:
curl -X POST http://127.0.0.1:3003 \
  -H "Content-Type: application/json" \
  -d '{"agent": "atlas", "action": "strategy_updated", "message": "7-day calendar ready"}'
