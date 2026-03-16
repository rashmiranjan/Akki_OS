---
name: keith-step-4-network-mapping
description: Map and prioritize ecosystem relationships from unique interaction history and account signals. Use to convert conversation engagement into a structured relationship graph.
---

# keith-step-4-network-mapping

## Goal
Map key ecosystem actors and relationship strength.

## Inputs
- Unique account records from step 1 (`x-post-search` user-search flow)
- Engagement outcomes from step 3
- Historical memory records from `memory-db`

## Categories
- founders
- investors
- operators
- journalists
- creators
- analysts

## Required flow
1. Build/update actor list from deduped account records only.
2. Tag each actor: role, relevance, audience overlap, engagement priority.
3. Score relationship stage: new, aware, warm, active.
4. Track interaction evidence (last touchpoint, response signal, momentum).
5. Flag next best action per priority actor.

## Output
- `founders/<slug>/step-04-network-mapping.md`
- `founders/<slug>/step-04-priority-actors.md`

## Guardrails
- Do not create duplicate actor entries.
- Always include handle/profile URL and evidence for score changes.
- Prefer focused top-tier map over exhaustive low-quality lists.
