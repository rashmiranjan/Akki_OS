# Akki_OS Codebase Understanding

## What this project is
Akki_OS is an OpenClaw-based agent operations repo for personal-brand workflows. It combines:
- OpenClaw runtime + agent workspaces
- A webhook bridge (`localhost:3003`)
- Mission Control (backend + frontend)
- Convex-backed activity/draft/memory flows
- An upgrade system with manifest/state tracking and host-side updater execution

## How it is structured
Top-level directories and roles:
- `agents/`: managed OpenClaw agent workspaces (`jarvis`, `fury`, `loki`, `shuri`, `atlas`, `echo`, `oracle`, `pulse`, `vision`).
- `skills/`: managed skill packs and scripts.
- `workspace/`: shared orchestrator workspace and mirrored skill destination.
- `mission_control/`: vendored operations app (backend/frontend + compose).
- `host_updater/`: local token-protected HTTP service for controlled upgrades.
- `tools/managed_sync.js`: managed sync + backup + conflict-report logic.
- `releases/manifest.json`: current release metadata/checksums/migrations.

## Installer behavior (current)
`install.sh` / `install.bat` support:
- `--mode install|upgrade`
- `--upgrade`
- `--non-interactive`
- `--dry-run`
- `--from-version`
- `--backup-dir`

Install mode:
- runs `openclaw onboard` for first-time setup.
- if existing install is detected and no explicit mode override is provided, installer auto-switches to upgrade.

Upgrade mode:
- must skip onboarding.
- requires existing OpenClaw runtime config.
- runs managed sync and preserves local skill edits.

## Runtime architecture
1. Installer provisions dependencies and OpenClaw runtime config.
2. Managed agents are registered from `agents/*`.
3. Managed skills are synced using `tools/managed_sync.js`.
4. Webhook server runs on `3003` and forwards events to Mission Control.
5. Mission Control backend runs on `8000`, frontend on `3000`.
6. Host updater runs on `3010` and executes allowlisted upgrade commands.

## Upgrade architecture
### Metadata and state
- `releases/manifest.json`: release version + component checksums + migrations.
- `~/.akki/state/install-state.json`: last installed version and sync metadata.
- `~/.akki/state/logs/last-sync-report.json`: sync result report.
- `workspace/skills/_incoming/*`: staged updates when local skill edits conflict.

### Conflict behavior
- Existing modified skill in `workspace/skills/<skill>` is preserved.
- Incoming managed update for that skill is staged into `_incoming`.

### Mission Control upgrade API
Backend routes:
- `POST /api/v1/system/upgrade/check`
- `POST /api/v1/system/upgrade/run`
- `GET /api/v1/system/upgrade/status/:id`

These proxy to host updater with token auth (`UPDATER_URL` + `UPDATER_TOKEN`).

## Important operational fixes now in code
- Mission Control runtime is no longer cloned during install; it is expected in-repo.
- Windows installer ensures `npm install` in `mission_control/backend` before `npx convex deploy`.
- Host/IP resolution is sanitized and cannot write blank URL fields into env files.
- `.env` parsing in Windows uses `tokens=1,*` to avoid truncating values containing `=`.
- Mission Control env handling is preserve-first (existing managed values are not rewritten; only missing keys are appended).

## Practical interpretation
This repo is now a single deployable/upgradeable unit:
- Bootstrap scripts provide reproducible install + upgrade behavior.
- Mission Control provides runtime control plane + upgrade UI triggers.
- Managed sync/state/manifest provide deterministic release upgrades with non-destructive defaults.

## Read-first files for onboarding
1. `install.sh`
2. `tools/managed_sync.js`
3. `host_updater/server.js`
4. `releases/manifest.json`
5. `mission_control/backend/src/index.ts`
6. `mission_control/backend/src/controllers/systemController.ts`
7. `mission_control/frontend/src/app/admin/page.tsx`
8. `docs/upgrade-and-compatibility-plan.md`
