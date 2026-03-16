---
name: keith-step-2-opportunity-filtering
description: Rank detected conversations for strategic engagement using relevance, audience fit, and visibility potential. Use after step-1 unique ingestion so only deduped opportunities are scored.
---

# keith-step-2-opportunity-filtering

## Goal
Filter deduped conversations for strategic relevance.

## Inputs
- Unique records from step 1 (already deduped through `memory-db`)
- Account-level context from `x-post-search` user-search outputs

## Criteria
- positioning relevance
- audience alignment
- participant influence
- potential visibility
- timeliness (conversation still active)

## Required flow
1. Pull only unique candidate records produced by step 1.
2. Score each candidate (high/medium/low) with one-line rationale.
3. Keep only high-confidence opportunities for execution handoff.
4. Write actions and next-step recommendation for each selected item.

## Output
- `founders/<slug>/step-02-opportunity-filtering.md`
- `founders/<slug>/step-02-action-queue.md` (selected opportunities + recommended action type)

## Guardrails
- Reject stale or duplicate opportunities.
- Include evidence for every keep/drop decision.
- Keep action queue concise and execution-ready.
