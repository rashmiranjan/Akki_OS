# SKILL: linkedin-post

## What This Skill Does
Publishes approved drafts on LinkedIn using saved browser session.

## Browser Profile
C:\Users\Lenovo\.openclaw\browser\openclaw\user-data

## Steps

### 1. Get approved draft
- Call webhook: GET http://127.0.0.1:3003?action=get_approved_drafts&platform=linkedin
- Pick first result with status=approved

### 2. Open LinkedIn
- Navigate to: https://www.linkedin.com/feed/
- Wait 3 seconds for feed to load
- If login page appears: STOP, report session_expired, do NOT continue

### 3. Create post
- Click "Start a post" button at top of feed
- Wait 2 seconds for composer to open
- Click inside text area
- Type the draft content exactly as written (do NOT modify)

### 4. Publish
- Click "Post" button
- Wait for success confirmation

### 5. Report completion
curl -X POST http://127.0.0.1:3003 -H "Content-Type: application/json" -d "{\"agent\": \"atlas\", \"action\": \"published\", \"platform\": \"linkedin\", \"message\": \"Post published successfully\"}"

## Rules
- NEVER post unapproved content
- NEVER modify Loki's content
- NEVER post if session expired — alert user instead
- Wait 3 seconds between every browser action
