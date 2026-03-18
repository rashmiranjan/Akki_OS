# Akki OS

Akki OS is a Personal Branding OS built on top of OpenClaw. The repo packages the PB-OS domain model, a 7-agent cabinet, and Mission Control, then seeds a self-contained OpenClaw runtime for VPS use.

## Install
```bash
git clone https://github.com/rashmiranjan/Akki_OS
cd Akki_OS
bash install.sh
```

Upgrade an existing local install:
```bash
bash install.sh --upgrade --non-interactive
```

Explicitly resync the live OpenClaw runtime from repo seed files:
```bash
bash install.sh --upgrade --resync-runtime
```

## Runtime Model
- The repo is the bootstrap source for agents, shared skills, and PB-OS domains.
- OpenClaw keeps the live runtime in `~/.openclaw`.
- VPS installs are seeded into `~/.openclaw/akki` so the running system does not depend on the repo checkout.
- Shared global skills are mirrored into `~/.openclaw/skills`.
- Normal upgrades preserve live OpenClaw state and only fill missing runtime pieces.

Installer-managed runtime values are written to `.akki/runtime.env`.

## PB-OS Agent Cabinet
- Atlas: orchestration and project setup
- Archivist: founder and product memory
- Oracle: audience and market intelligence
- Pulse: analytics and iteration
- Scribe: narrative and draft production
- Keith: distribution and network expansion
- Sentinel: signal monitoring and resonance tracking

## Repo Layout
```text
Akki_OS/
├── agents/            # Bootstrap source for PB-OS agent workspaces
├── domains/           # Bootstrap source for shared PB-OS domain assets
├── workspace/         # Bootstrap source for shared OpenClaw workspace + packaged skills
├── mission_control/   # Backend + frontend control plane
├── platform/          # Bootstrap and operations docs
├── tools/             # Installer support scripts
└── install.sh         # Canonical install/upgrade entrypoint
```

## What The Installer Does
- Ensures Node.js, Docker, and OpenClaw are available
- Seeds a self-contained OpenClaw runtime under `~/.openclaw/akki`
- Runs OpenClaw onboarding against the self-contained shared workspace
- Registers the PB-OS agents against self-contained runtime workspaces
- Seeds agent souls/identity files into OpenClaw-managed agent directories
- Seeds shared/global skills and PB-OS domains into the self-contained runtime
- Validates runtime provisioning, not just repo asset presence
- Writes Mission Control environment values
- Deploys Convex if credentials are provided
- Starts Mission Control via Docker Compose

## Notes
- This repo now targets the PB-OS model, not the older 9-agent Akki layout.
- If a shared external skill is still required, treat it as an explicit dependency and package it before relying on it in automation.
