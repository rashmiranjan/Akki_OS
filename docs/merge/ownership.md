# Source of Truth Ownership

## Bootstrap (Akki OS)
- `install.sh`, `install.bat`, `start.bat`
- `agents/`, `skills/`, `workspace/`
- `skills/webhook-server/scripts/server.js`

## Operations (Mission Control)
- `mission_control/backend/`
- `mission_control/frontend/`
- `mission_control/backend/convex/`

## Contracts
- Ingest endpoint: `POST /api/v1/activity`
- Activity read: `GET /api/v1/activity`
- Draft queue: `GET/PATCH /api/v1/drafts`
- Chat ops: `POST /api/v1/chat/send`, `GET /api/v1/chat/history`
