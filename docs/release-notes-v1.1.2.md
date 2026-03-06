# Release Notes v1.1.2

## Release Date
- 2026-03-06

## Summary
v1.1.2 stabilizes upgrade behavior for existing installs by fixing host/IP env generation and improving installer reliability across Linux and Windows.

## Key Fixes

### 1) Host/IP env values no longer go blank
- Fixed Linux installer host resolution flow so `PUBLIC_HOST`, `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, and `BETTER_AUTH_URL` are always derived safely.
- Added sanitization fallback to `localhost` for empty/invalid host values.
- Re-resolves host immediately before writing `mission_control/.env`.

### 2) Windows Convex deploy reliability
- Added `npm install` check in `mission_control/backend` before `npx convex deploy` when dependencies are missing.

### 3) Windows `.env` parsing reliability
- Updated `.env` parser from `tokens=1,2` to `tokens=1,*` so values containing `=` are not truncated.

### 4) Installer cleanup
- Removed runtime `mission_control` clone step from installers, since `mission_control/` is vendored in this repo.

## Upgrade Steps

### Linux / macOS
```bash
git fetch --all --tags
git checkout upgrade
git pull --ff-only
bash install.sh --upgrade
```

### Windows
```bat
git fetch --all --tags
git checkout upgrade
git pull --ff-only
install.bat --upgrade
```

## Post-Upgrade Verification

### Env checks
```bash
grep -E "CORS_ORIGIN|NEXT_PUBLIC_API_URL|BETTER_AUTH_URL" mission_control/.env
```

### Backend health
```bash
curl -s http://localhost:8000/healthz
```

### Expected
- `mission_control/.env` host URLs are non-empty.
- Mission Control frontend and backend containers rebuild/start successfully.

## Rollback
- Restore from latest backup in `~/.akki/state/backups/<timestamp>/` (or repo `.akki/state/backups/<timestamp>/` fallback).
- Re-run `install.sh --upgrade --non-interactive` after restore.

## Tag
- `v1.1.2`
