# AkkiOS NPM CLI Packaging Plan (Reference)

## Goal
Move from repo-based install (`git clone` + installer scripts) to a package-based UX similar to OpenClaw:
- `npm install -g akkios` + `akkios install`
- or `npx akkios install`

Note:
- `npm akkios install` is not valid npm command syntax.

## What It Takes

## 1) Build an NPM CLI package
- Create package (for example `@yourorg/akkios` or `akkios`).
- Add `bin` mapping in `package.json`:
  - `"akkios": "dist/cli.js"`
- CLI commands to implement:
  - `akkios install`
  - `akkios upgrade`
  - `akkios doctor`

## 2) Port installer logic to Node modules
- Move logic from `install.sh` / `install.bat` into cross-platform JS/TS code.
- Keep shell/bat scripts as wrappers during migration for compatibility.

## 3) Artifact delivery model
Two options:
1. Embedded templates in npm package:
- package contains `agents/`, `skills/`, `workspace/`, `mission_control` baseline.

2. Remote release artifacts:
- CLI downloads versioned tarball/release bundle from GitHub Releases.
- Uses `releases/manifest.json` for integrity/version checks.

## 4) Upgrade strategy
- Keep state in `~/.akki/state/install-state.json`.
- `akkios upgrade` compares installed version vs latest.
- Reuse managed sync behavior:
  - preserve local skill edits
  - stage incoming conflicts under `_incoming`
  - backup + rollback metadata

## 5) Runtime/config handling
- Preserve OpenClaw onboarding/token sync behavior.
- Preserve Convex + env setup flow (`interactive` and `--non-interactive`).
- Keep host updater integration for Mission Control-triggered upgrades.

## 6) Release pipeline
- Automated version bump + changelog + git tag.
- `npm publish` workflow.
- Recommended: signed release artifacts and checksum verification.

## Recommended MVP Path

## Phase A (fastest)
- Create `akkios` CLI that wraps existing installers:
  - Linux/macOS -> `install.sh`
  - Windows -> `install.bat`
- Benefit: immediate new UX, minimal risk.

## Phase B
- Move core flows into native Node implementation:
  - prerequisites
  - env generation
  - agent/skill sync
  - service bootstrap

## Phase C
- Full package-native install/upgrade (scripts become fallback only).

## Suggested Future Commands
- `akkios install [--mode install|upgrade] [--non-interactive] [--dry-run]`
- `akkios upgrade [--non-interactive] [--from-version <x.y.z>]`
- `akkios doctor`
- `akkios version`

## Risks / Considerations
- Shipping large assets in npm package can increase install size.
- Remote artifact model requires robust download + checksum + retry logic.
- Must ensure parity between Linux/macOS/Windows behavior during migration.

## Decision Summary (for later implementation)
- Start with wrapper CLI MVP.
- Keep existing managed-sync/manifest/state architecture.
- Gradually replace shell/bat internals with Node modules.
