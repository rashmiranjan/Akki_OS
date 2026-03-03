# Convex Save Skill

## Purpose
Save generated ideas to Convex database.

## Table Schema: ideas
```json
{
  "id": "uuid (auto-generated)",
  "title": "string",
  "problem": "string (pain point)",
  "solution": "string",
  "audience": "string (ICP)",
  "angle": "string (unique differentiator)",
  "validation": "string (why this is real)",
  "category": "content/product/marketing/growth",
  "priority": "critical/high/medium/low",
  "trend_signals": "array of strings",
  "created_at": "timestamp",
  "status": "new/evaluated/in-progress/completed"
}
```

## API Details
- Base URL: http://localhost:3003 or Convex webhook
- Endpoint: POST /api/ideas
- Headers: Content-Type: application/json
- Body: Array of idea objects

## Batch Operations
- Save multiple ideas in one request
- Return success count + errors (if any)
