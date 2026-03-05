# Two-Layer Monorepo Architecture

## Layer 1: Bootstrap
- Repo area: `platform/bootstrap`
- Source owner: Akki OS root scripts and agent provisioning
- Purpose: install OpenClaw and bring the full template up

## Layer 2: Operations
- Repo area: `platform/operations`
- Source owner: `mission_control/`
- Purpose: manage OpenClaw operations after setup (chat, activity, drafts, memory)

## Bridge Contract
- Akki webhook receives skill/agent events on `http://localhost:3003`
- Webhook forwards normalized payload to `POST /api/v1/activity` on Mission Control backend
- Mission Control persists activity/drafts via its Convex contract
