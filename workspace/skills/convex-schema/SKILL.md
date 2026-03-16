# Convex Schema

Database URL: from user's CONVEX_URL env variable

## Tables
- activity: agent, action, message, user_id, timestamp
- config: key, value
- drafts: agent, content, platform, status, timestamp

## Usage
All agents report via webhook:
POST http://localhost:3003
{"agent": "scribe", "action": "draft", "message": "content here"}

## Setup
User creates free account at https://convex.dev
Agent collects CONVEX_URL during onboarding
