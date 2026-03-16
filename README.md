# Akki OS

Akki OS is a repo-local Personal Branding OS built on top of OpenClaw. It packages a PB-OS domain model, a 7-agent cabinet, and Mission Control so a user can clone the repo, install once, and start from a coherent baseline.

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

## Runtime Model
- Repo root is the source of truth for Akki-owned assets.
- OpenClaw keeps its own config/state in `~/.openclaw`.
- PB-OS domains live in `./domains/pb-os`.
- Packaged skills live in `./workspace/skills`.
- Agents are provisioned from `./agents`.

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
├── agents/            # PB-OS agent workspaces
├── domains/           # Shared PB-OS domain assets
├── workspace/         # Repo-local OpenClaw workspace + packaged skills
├── mission_control/   # Backend + frontend control plane
├── platform/          # Bootstrap and operations docs
├── tools/             # Installer support scripts
└── install.sh         # Canonical install/upgrade entrypoint
```

## What The Installer Does
- Ensures Node.js, Docker, and OpenClaw are available
- Runs OpenClaw onboarding against the repo-local workspace
- Registers the PB-OS agents
- Validates packaged domains and skills
- Writes Mission Control environment values
- Deploys Convex if credentials are provided
- Starts Mission Control via Docker Compose

## Notes
- This repo now targets the PB-OS model, not the older 9-agent Akki layout.
- If a shared external skill is still required, treat it as an explicit dependency and package it before relying on it in automation.
