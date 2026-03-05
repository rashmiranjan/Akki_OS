# Platform Bootstrap Layer

This layer owns installation and provisioning.

Responsibilities:
- Install/check prerequisites (Node, Docker, OpenClaw)
- Run OpenClaw onboarding
- Register agents and copy skills/workspace assets
- Provision operations environment values
- Start webhook bridge and operations stack

Entrypoints:
- `../../install.sh`
- `../../install.bat`
- `../../start.bat`
