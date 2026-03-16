# Workflow Governor (Mandatory)

This file enforces execution discipline for all PB-OS projects.

## Decision Primitive
Use **Intent × Stage × Role × Gate** for every major action.

- **Intent:** requested outcome
- **Stage:** current workflow phase
- **Role:** correct owner (Atlas vs specialist)
- **Gate:** required evidence/artifacts present

If any dimension fails, do not advance status.

## Stage-Gate Policy
No project may be marked `ready`, `approved`, or `publish` unless:
1. required stage artifacts are present,
2. specialist outputs are attached,
3. handoffs are recorded,
4. strategic decisions are logged in `08-memory/decisions-log.md`.

## Founder Discovery Policy
- Discovery is finite for first-pass initialization.
- Do not repeatedly ask founder for incremental details.
- Ask only true blocker questions.
- Prefer one high-value question at a time.
- Continue via assumptions + confidence labels where possible.

## Specialist Completion Contract
Each specialist task requires:
1. output artifact path,
2. handoff file in `07-operations/handoffs/`,
3. status move in ops board (`backlog` -> `in-progress` -> `done`).

## Fast-Track Throughput Policy (Default)
- Prefer staggered-parallel execution over strict serial sequencing.
- If upstream outputs are medium-confidence and risks are labeled, downstream owners may start draft artifacts in parallel.
- Use `DRAFT_WITH_ASSUMPTIONS` markers until upstream freeze is complete.
- Only freeze approvals/publishing, not exploratory draft progress.
- During active build windows: run hourly internal checks and post founder-visible updates every 2 hours (or on major R/A/G changes).

## Role Drift Control
When tactical drift or scope drift is detected:
- flag `ROLE_DRIFT`,
- freeze approval language,
- execute corrective reroute,
- resume only after gate compliance.

## Per-Update Format (Recommended)
For each significant update, include:
- Stage
- Owner
- Completed evidence
- Next action
- Blockers (if any)
