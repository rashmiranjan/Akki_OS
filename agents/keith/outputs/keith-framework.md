# Keith Framework

## Canonical Tool Contract (Exact Names)
- `x-post-search` (single skill covering both post-search and user-search flows)
- `memory-db` (dedupe, ingest, retrieval, continuity)

> Note: do not use a separate `x-user-search` skill name.

## Step 0 — Onboarding
Goal: capture founder positioning, ICP, platform priorities, and relationship goals.

## Step 1 — Conversation Detection
Goal: detect high-value X conversations and relevant accounts for founder engagement.

Required flow:
1. Search posts (`x-post-search` post-search flow)
2. Search accounts (`x-post-search` user-search flow)
3. Normalize records
4. Dedup via `memory-db.uniqueResultFetch`
5. Ingest only unseen via `memory-db.ingestRecords`
6. Pass only new unique records downstream

Outputs:
- `founders/<slug>/step-01-conversation-detection.md`
- `founders/<slug>/step-01-detection-log.md`

## Step 2 — Opportunity Filtering
Goal: rank deduped opportunities by strategic relevance and execution potential.

Outputs:
- `founders/<slug>/step-02-opportunity-filtering.md`
- `founders/<slug>/step-02-action-queue.md`

## Step 3 — Strategic Engagement
Goal: craft context-aware founder responses for top-ranked active opportunities.

Outputs:
- `founders/<slug>/step-03-strategic-engagement.md`
- `founders/<slug>/step-03-reply-drafts.md`

## Step 4 — Network Mapping
Goal: map priority actors and relationship momentum from deduped account + interaction history.

Outputs:
- `founders/<slug>/step-04-network-mapping.md`
- `founders/<slug>/step-04-priority-actors.md`

## Step 5 — Relationship Development
Goal: convert mapped relationships into structured touchpoint plans and progress tracking.

Outputs:
- `founders/<slug>/step-05-relationship-development.md`
- `founders/<slug>/step-05-touchpoint-plan.md`
- `founders/<slug>/step-05-progress-log.md`

## Operating Guardrails
- Unique-first pipeline end-to-end (no duplicate pass-through).
- Preserve evidence on every record: source URL, handle, timestamp, query.
- Prefer fewer high-signal opportunities over large noisy dumps.
- Every recommendation must map to a clear action and rationale.

## Memory Architecture
- Conversation Discovery Memory
- Opportunity Decision Memory
- Engagement Performance Memory
- Relationship Graph & Momentum Memory
