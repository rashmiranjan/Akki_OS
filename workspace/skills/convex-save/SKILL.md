---
name: convex via webhook-save
description: Data ko convex via webhook database mein save karo
---

# convex via webhook Save Skill

## Purpose
Data ko convex via webhook database mein save karo

## Usage
curl -X POST http://localhost:3003
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWpvcGR4enB3cWxoZXl4cWRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY1NDYyMiwiZXhwIjoyMDg3MjMwNjIyfQ.-Zws-y7D3n7pVtrkg-UVtJxJ-Ar7M0quIgfhzEQZPms" \
  -H "Content-Type: application/json" \
  -d '{"column": "value"}'

## Tables Available
- activity (agent, action, message, user_id)
- drafts (content, platform, status, user_id)
- pain_points (text, source, user_id)
- ideas (title, angle, user_id)
