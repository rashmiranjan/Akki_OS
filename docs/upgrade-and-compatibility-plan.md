# Upgrade And Compatibility Plan

## Scope
This document defines how Akki_OS installs on top of existing OpenClaw setups, how upgrades are delivered, and how local edits are preserved.

## Compatibility Matrix

| Scenario | Command | Expected Behavior |
|---|---|---|
| Fresh machine | `bash install.sh --mode install` | Runs full onboarding, config sync, managed sync, Mission Control bootstrap |
| Existing OpenClaw, first Akki install | `bash install.sh --mode install` | Reuses OpenClaw runtime/config, applies Akki workspace template, registers managed agents |
| Existing Akki installation upgrade | `bash install.sh --upgrade` | Skips onboarding, backs up state, applies managed sync with conflict preservation |
| Windows upgrade | `install.bat --upgrade` | Same policy as Linux/macOS; skips onboarding and preserves local skill edits |

## CLI Upgrade Flow

```text
git pull --ff-only
  -> install.sh --upgrade --non-interactive
    -> read releases/manifest.json
    -> backup OpenClaw config + workspace skills snapshot
    -> run managed sync (skills)
       - unchanged managed skill: no-op
       - missing skill: copy in
       - user-modified skill: preserve current, place new version in workspace/skills/_incoming/<skill>
    -> register/update managed agents
    -> rebuild Mission Control env + services
    -> write ~/.akki/state/install-state.json + sync report
```

## Mission Control Upgrade Flow

```text
Admin clicks "Check for updates"
  -> POST /api/v1/system/upgrade/check (backend)
  -> backend calls host_updater (localhost-only, token-protected)
  -> host_updater runs tools/managed_sync.js --action check

Admin clicks "Upgrade now"
  -> POST /api/v1/system/upgrade/run
  -> backend calls host_updater
  -> host_updater runs allowlisted commands only:
       [optional] git pull --ff-only
       install.sh --upgrade --non-interactive
  -> GET /api/v1/system/upgrade/status/:id for streaming status/logs
```

## Conflict Handling Policy

Default policy is **preserve local edits**.

- Managed source of truth: `agents/`, `skills/`, `mission_control/`, workspace templates.
- User-customized destination skills that differ from managed source are **not overwritten**.
- Incoming managed update for conflicting skill is staged under `workspace/skills/_incoming/<skill>`.
- Conflict details are recorded in sync report logs.

## State And Metadata

- Release metadata: `releases/manifest.json`
- Install state: `~/.akki/state/install-state.json`
- Sync log: `~/.akki/state/logs/last-sync-report.json`
- Job history (host updater): `~/.akki/state/upgrade-jobs.json`

## Rollback Runbook

1. Locate latest backup from `~/.akki/state/backups/<timestamp>/`.
2. Restore OpenClaw config from backup `openclaw.json`.
3. Restore workspace skills from backup `workspace-skills/`.
4. Re-run `install.sh --upgrade --non-interactive`.
5. If required, restart services:
   - `docker compose -f mission_control/compose.yml --env-file mission_control/.env up -d --build`

## Operator Commands

- Dry-run check: `node tools/managed_sync.js --action check --mode upgrade --repo-root .`
- Dry-run upgrade sync: `node tools/managed_sync.js --action sync --mode upgrade --repo-root . --dry-run`
- Full upgrade (Linux/macOS): `bash install.sh --upgrade`
- Full upgrade (Windows): `install.bat --upgrade`

## Troubleshooting

- `401 unauthorized` from upgrade APIs:
  - verify `UPDATER_TOKEN` in host updater process and `mission_control/.env` match.
- Upgrade check works but run fails:
  - ensure host updater is running on `127.0.0.1:3010` and backend can reach `host.docker.internal:3010`.
- Local skill edits not updated:
  - expected by policy; review staged updates in `workspace/skills/_incoming/` and merge manually.
