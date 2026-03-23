# Platform Bootstrap Layer

This layer owns installation and provisioning.

Responsibilities:
- Install/check prerequisites (Node, Docker, OpenClaw)
- Run OpenClaw onboarding
- Register PB-OS agents from the repo
- Validate packaged domains and skills
- Provision operations environment values
- Start the Mission Control stack

Entrypoints:
- `../../install.sh`
- `../../install.bat`
- `../../start.bat`
