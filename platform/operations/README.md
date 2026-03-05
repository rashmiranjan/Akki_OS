# Platform Operations Layer

This layer owns post-setup runtime operations and control plane.

Responsibilities:
- Mission Control backend/frontend runtime
- Chat and agent operations UX
- Activity, draft, strategy, memory APIs
- OpenClaw gateway session management

Implementation:
- Source directory: `../../mission_control/`
- Compose entry: `../../mission_control/compose.yml`
- Backend API: `http://localhost:8000`
- Frontend UI: `http://localhost:3000`
