# SKILL: twitter-post

## What This Skill Does
Publishes approved drafts on Twitter/X using saved browser session.

## Steps

### 1. Get approved draft
- Call webhook: GET http://127.0.0.1:3003?action=get_approved_drafts&platform=twitter
- Pick first result with status=approved

### 2. Open Twitter/X
- Navigate to: https://x.com/home
- Wait 3 seconds for feed to load
- If login page appears: STOP, report session_expired, do NOT continue

### 3. Create tweet
- Click the "Post" compose button (left sidebar, blue button)
- Wait 2 seconds
- Click inside text area
- Type content

### 4. Thread handling (if content > 280 chars)
- Split content at paragraph breaks
- Type first part (max 280 chars)
- Click "+" button to add next tweet
- Type second part
- Repeat until all content is added
- Max 10 tweets in a thread

### 5. Publish
- Click "Post" button
- Wait for confirmation

### 6. Report completion
curl -X POST http://127.0.0.1:3003 -H "Content-Type: application/json" -d "{\"agent\": \"atlas\", \"action\": \"published\", \"platform\": \"twitter\", \"message\": \"Tweet published successfully\"}"

## Rules
- Max 280 chars per tweet
- NEVER modify content
- NEVER post if session expired — alert user instead
- Wait 3 seconds between every browser action
