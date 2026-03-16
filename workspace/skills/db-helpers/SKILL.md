---
name: db-helpers
description: convex via webhook ke saath easily interact karna
---

# DB Helpers Skill

## Purpose
convex via webhook ke saath easily interact karna

## Setup
convex via webhook_URL aur convex via webhook_SERVICE_KEY .env mein daalo

## Functions
- saveUser(userData)
- getUser(userId)
- saveDraft(draftData)
- getDrafts(userId)
- logActivity(agent, action, message)

## Usage
const db = require('./db-helpers');
await db.logActivity('oracle', 'research', 'Found pain points');
await db.saveDraft({content, platform, user_id});
