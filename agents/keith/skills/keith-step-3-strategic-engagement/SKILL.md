---
name: keith-step-3-strategic-engagement
description: Build engagement actions from ranked unique opportunities so founder replies are timely, high-signal, and positioning-aligned. Use after step-2 filtering.
---

# keith-step-3-strategic-engagement

## Goal
Design founder participation that adds value and strengthens positioning.

## Inputs
- `step-02-action-queue.md` (deduped, ranked opportunities)
- Source context linked from step 1 (`x-post-search` outputs persisted through `memory-db`)

## Actions
- comments
- influencer replies
- quote posts
- debate commentary

## Required flow
1. Select top opportunities by confidence + timeliness.
2. Draft one primary response per opportunity, plus one backup variation.
3. Anchor each draft to founder positioning + ICP pain language.
4. Include risk check (tone, factual certainty, controversy level).
5. Define CTA intent (educate, invite dialogue, relationship open).

## Output
- `founders/<slug>/step-03-strategic-engagement.md`
- `founders/<slug>/step-03-reply-drafts.md` (ready-to-post drafts)

## Guardrails
- Do not draft on stale or duplicate threads.
- No generic comments; each reply must reference specific thread context.
- Keep drafts concise, clear, and non-combative.
