---
name: keith-step-1-conversation-detection
description: Detect high-value X conversations and relevant accounts for founder engagement. Use when Keith needs to source fresh opportunities from X and persist only unique records for downstream ranking.
---

# keith-step-1-conversation-detection

## Canonical skill names (use exact names)
- `x-post-search` (single skill for both post search and user search flows; do not use a separate `x-user-search` skill name)
- `memory-db`

## Goal
Continuously detect conversations where founder input can add value.

## Required collection flow
1. Query X posts using `x-post-search` post-search flow.
2. Query X accounts using `x-post-search` user-search flow.
3. Normalize records into canonical memory envelope (post/user entity with source metadata).
4. Run `memory-db.uniqueResultFetch` before publish/write.
5. Ingest only unseen records via `memory-db.ingestRecords`.
6. Pass forward only new unique records.

## Track
- viral posts in domain
- ICP discussions
- influencer debates
- emerging/trending topics
- relevant accounts to monitor or engage

## Output
- `founders/<slug>/step-01-conversation-detection.md` (new unique opportunities only)
- `founders/<slug>/step-01-detection-log.md` (search terms, time window, counts: fetched/new/duplicate)

## Guardrails
- Never forward duplicates to downstream steps.
- Always preserve source URL, author handle, timestamp, and query used.
- Prefer fewer, higher-signal batches over noisy dumps.
