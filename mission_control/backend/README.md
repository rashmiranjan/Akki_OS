# AKKI OS Node Backend (`server/`)

This is the primary Node.js backend for AKKI OS, responsible for agent orchestration, gateway communication, and business logic.

## Tech Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express (or raw HTTP logic)
- **Database**: Supabase integration
- **Agent Protocol**: OpenClaw Gateway API

## Features
- **Gateway Service**: Intelligent WebSocket handling for OpenClaw.
- **Realtime Integration**: Hooks for Supabase realtime events.
- **Multitenancy**: Secure isolation of agent workloads.

## Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file based on the root `.env.example`.

### 3. Run in Development Mode
```bash
npm run dev
```

## Testing Gateway
You can test the connection to the OpenClaw gateway using:
```bash
npx ts-node test_gateway.ts
```

---
Built as part of the AKKI OS Core.
