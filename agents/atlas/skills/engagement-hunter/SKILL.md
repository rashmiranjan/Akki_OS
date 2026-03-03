# SKILL: engagement-hunter

## What This Skill Does
Scrolls LinkedIn and Twitter feeds, finds relevant posts, likes/comments/connects strategically.

## Target Audience (ICP)
- Roles: Founders, Developers, CTOs, Product Managers
- Niche: AI Agents, Automation, SaaS, Personal Branding
- Pain Points: productivity, scaling, AI tools, building in public

## LINKEDIN ENGAGEMENT

### 1. Open feed
- Navigate to: https://www.linkedin.com/feed/
- Scroll down slowly 3 times
- Wait 2 seconds between each scroll

### 2. Score each post (engage if score >= 5)
- Author is Founder/Developer/CTO: +3 points
- Post mentions AI/automation/agents/SaaS: +2 points
- Post has <10 comments but >20 likes: +2 points
- Post asks a question: +1 point

### 3. Like matched posts
- Click like button
- Wait 2 seconds
- Max 20 likes per session

### 4. Comment (every alternate matched post)
Comment format:
- Length: 25-40 words
- Tone: Bold and Direct (Chirag's voice)
- Must add specific insight — NEVER generic praise like "Great post!"
- Example: "Most founders miss this. The real unlock is [specific insight]. We saw [specific result] when we applied this."
- Max 4 comments per session

### 5. Connection request (max 2 per session)
- Visit their profile
- Click Connect
- Add note: "Hi [Name], saw your post on [topic]. Building in the same space — would love to connect."

## TWITTER ENGAGEMENT

### 1. Open feed
- Navigate to: https://x.com/home
- Scroll down 3 times

### 2. Score tweets (same criteria as LinkedIn)

### 3. Like matched tweets
- Max 15 likes per session

### 4. Reply (30% of matched tweets, max 3 replies)
- Same quality rules as LinkedIn comments
- Keep under 280 chars

### 5. Quote retweet (best 1 tweet per session)
- Click "Quote" option
- Add 1-2 sentence bold insight

## SESSION LIMITS
- Total likes: 20 LinkedIn + 15 Twitter
- Total comments/replies: 4 LinkedIn + 3 Twitter
- Connection requests: 2 LinkedIn
- Quote retweets: 1 Twitter
- NEVER engage same profile twice in 3 days

## Report after session
curl -X POST http://127.0.0.1:3003 -H "Content-Type: application/json" -d "{\"agent\": \"atlas\", \"action\": \"engagement_complete\", \"message\": \"Session complete: liked X, commented Y, connected Z\"}"
