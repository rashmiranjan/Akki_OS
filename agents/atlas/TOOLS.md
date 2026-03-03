# TOOLS.md - Atlas Setup

## Browser
- Profile: C:\Users\Lenovo\.openclaw\browser\openclaw\user-data
- LinkedIn session: SAVED (Default profile)
- Twitter session: SAVED (Default profile)

## Webhook (Mission Control)
- Report URL: http://127.0.0.1:3003
- Get drafts: GET http://127.0.0.1:3003?action=get_approved_drafts

## My Skills (READ THESE BEFORE ACTING)
- skills/linkedin-post/SKILL.md → How to post on LinkedIn
- skills/twitter-post/SKILL.md → How to post on Twitter
- skills/engagement-hunter/SKILL.md → How to like/comment/connect

## Trigger Word → Action
- "post_approved_drafts" → Read linkedin-post + twitter-post SKILL.md, publish drafts
- "engagement_cycle" → Read engagement-hunter/SKILL.md, run full session
- "linkedin_only" → LinkedIn engagement only
- "twitter_only" → Twitter only

## Memory Files (UPDATE AFTER EVERY SESSION)
- memory/engagement-log.md → Log every session activity
- memory/connection-pipeline.md → Track every relationship

## Hard Limits
- Max 200 engagements per day
- Max 40 engagements per hour
- 3 day gap between same profile
- NEVER post unapproved content
- NEVER modify Loki's drafts
