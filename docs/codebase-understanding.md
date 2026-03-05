# Akki_OS Codebase Understanding

## What this project is
Akki_OS is an AI-agent orchestration scaffold for personal-brand automation on LinkedIn and X/Twitter. It combines:
- OpenClaw agent runtime
- A local webhook bridge (`localhost:3003`)
- Convex as the primary activity/drafts store
- Playwright automation scripts for posting/engagement
- A separate `mission_control` app (cloned during install) for UI/API

The intent is a 24x7 system where specialized agents research, write, publish, engage, and report.

## How it is structured
Top-level directories and roles:
- `agents/`: 9 agent workspaces (`jarvis`, `fury`, `loki`, `shuri`, `atlas`, `echo`, `oracle`, `pulse`, `vision`) with role docs (`SOUL.md`, `AGENTS.md`, etc.).
- `skills/`: reusable skill definitions and helper scripts (posting, scraping, DB helpers, webhook server).
- `workspace/`: shared orchestrator workspace (identity, memory protocol, skills mirror, helper scripts).
- `convex/`: Convex schema/functions used by webhook logging.
- `install.sh` / `install.bat`: bootstrap scripts that install dependencies, onboard OpenClaw, register agents, start webhook, clone/start Mission Control, and deploy Convex.

## Runtime architecture (as implemented)
1. User runs `install.sh`/`install.bat`.
2. Script ensures Node + Docker + OpenClaw, then runs `openclaw onboard`.
3. Agents are registered with OpenClaw using local `agents/*` folders.
4. `skills/*` are copied into `workspace/skills`.
5. Webhook server (`skills/webhook-server/scripts/server.js`) is started on port `3003`.
6. `mission_control` is cloned and started with Docker Compose.
7. Convex env values are collected and deploy is attempted from `mission_control/backend`.
8. During operation, agents/skills send POST payloads to webhook; webhook writes to Convex and forwards activity to Mission Control API (`localhost:8000/api/v1/activity`).

## Data model in Convex
Defined in `convex/schema.ts`:
- `activity`: `agent`, `action`, `message`, optional `user_id`, `timestamp`
- `config`: key/value config entries
- `drafts`: `agent`, `content`, optional `platform`, `status`, `timestamp`

Main function in `convex/activity.ts`:
- `log` mutation inserts activity events.
- `getRecent` query returns latest 50 events.

## Skill and automation behavior
- Writing/strategy/engagement/research skills are mostly instruction-driven (`SKILL.md`) and rely on agent prompts + webhook reporting.
- Executable scripts exist for:
- Posting to LinkedIn/X via Playwright (`skills/linkedin-post/scripts/run.js`, `skills/twitter-post/scripts/run.js`).
- Browser session setup and engagement helpers (`skills/browser-automation/scripts/*`).
- Apify research launchers (`skills/apify-research/scripts/run.js`, `skills/apify-scripts/scripts/*`).
- Webhook-based logging/config updates (`skills/db-helpers/scripts/db-helpers.js`).

## Important observations about current code quality
This repo is a functional starter, but several parts are template-level or inconsistent:
- Many scripts hardcode Windows paths (`C:\Users\Lenovo\...`), while installer also supports Linux/macOS.
- Multiple files include hardcoded secrets/tokens in plain text (Apify token and service-style keys in scripts/docs).
- `workspace/upload_drafts.js` is syntactically broken (unterminated string) and appears non-functional.
- `convex-save` and `supabase-save` scripts are duplicates and use mismatched env naming (`convex_URL`, `convex_SERVICE_KEY`) that do not match common Convex SDK usage.
- `start.bat` is effectively another full installer flow, not just a lightweight start script.
- There is heavy duplication between `skills/` and `workspace/skills/` trees.
- Some docs still say “supabase” while implementation intent is Convex + webhook.

## Practical interpretation
The codebase is best understood as:
- A deployment/bootstrap shell around OpenClaw + Mission Control,
- A set of agent prompt contracts (who does what),
- A webhook-centered integration point,
- And a collection of early automation scripts for posting/scraping.

It is usable as a foundation, but production-hardening would require path normalization, secret cleanup, script validation, and reducing duplicate/conflicting skill implementations.
