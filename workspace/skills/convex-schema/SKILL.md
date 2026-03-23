# Convex Schema

The canonical Convex schema for Akki PB-OS lives in:

- `mission_control/backend/convex/schema.ts`
- `mission_control/backend/convex/activity.ts`
- `mission_control/backend/convex/drafts.ts`
- `mission_control/backend/convex/memory.ts`
- `mission_control/backend/convex/projectDocuments.ts`
- `mission_control/backend/convex/strategy.ts`

## Runtime Contract
- Mission Control backend owns the supported Convex API path.
- Skills should write through Mission Control endpoints or the webhook bridge.
- SQL schema files and direct `rest/v1` patterns are legacy references, not active runtime behavior.
