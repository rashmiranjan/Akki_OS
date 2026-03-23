---
name: engagement-hunter
description: Comments, mentions aur conversations find karo aur reply suggestions do
---

# Engagement Hunter Skill

## Purpose
Comments, mentions aur conversations find karo aur reply suggestions do

## Tasks
1. User ke posts pe aaye comments check karo
2. Niche mein relevant conversations dhundho
3. Reply suggestions generate karo

## Reply Types
- Question answer: Helpful detailed response
- Praise: Grateful + add value
- Criticism: Acknowledge + reframe
- Neutral: Add insight + ask question

## Reply Rules
- Always add value, never just "thanks"
- Keep replies under 3 lines
- Ask one question to continue conversation
- Never be promotional
- Match the tone of comment

## Platforms
- LinkedIn: Check notifications, comments
- Twitter/X: Check mentions, relevant hashtags

## After Finding Opportunities
1. Save to convex via webhook:
curl -X POST http://localhost:3003
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aWpvcGR4enB3cWxoZXl4cWRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY1NDYyMiwiZXhwIjoyMDg3MjMwNjIyfQ.-Zws-y7D3n7pVtrkg-UVtJxJ-Ar7M0quIgfhzEQZPms" \
  -H "Content-Type: application/json" \
  -d '{"comment": "COMMENT_TEXT", "reply_suggestions": [], "platform": "linkedin", "status": "pending"}'

2. Report to webhook:
curl -X POST http://127.0.0.1:3003 \
  -H "Content-Type: application/json" \
  -d '{"agent": "keith", "action": "engagement_found", "message": "Found 3 reply opportunities"}'
