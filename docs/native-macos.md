# Native macOS Parallel Implementation

This repository now includes a parallel native macOS scaffold in `native-macos/`.

## What is implemented

- SwiftUI macOS app shell (`AgentHeavenNativeApp`)
- Board-oriented UI with:
  - Project sidebar
  - Prompt composer (agent/model + start job)
  - Status columns (Running / Needs Attention / Failed / Done / Cancelled / Unknown)
  - Job detail panel with prompts/messages/logs
  - Follow-up send and job actions (cancel/archive/trash/restore/delete)
- Two data modes:
  - Bridge mode (preferred): full runtime control through local Node bridge
  - Local mode fallback: read-only from `agent-heaven.store.json` and `jobs/*.json`
- Shared user-data discovery with override support (`AH_USER_DATA_PATH`)

## Bridge server

Bridge entrypoint: `src/native-bridge.ts`

Endpoints:

- `GET /health`
- `GET /state`
- `GET /settings`
- `PATCH /settings`
- `GET /projects`
- `POST /projects`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `GET /jobs?full=1&limit=500`
- `GET /jobs/search?q=<query>`
- `GET /jobs/:id`
- `POST /jobs/start`
- `POST /jobs/:id/send`
- `POST /jobs/:id/cancel`
- `POST /jobs/:id/archive`
- `POST /jobs/:id/trash`
- `POST /jobs/:id/restore`
- `DELETE /jobs/:id`
- `GET /events` (SSE)

Run:

```bash
npm run native:bridge
```

Environment:

- `AH_USER_DATA_PATH=/path/to/user-data`
- `AH_BRIDGE_PORT=7788`

## Native app

Open in Xcode:

- `native-macos/Package.swift`

Or run via CLI:

```bash
cd native-macos
swift run AgentHeavenNativeApp
```

Environment:

- `AH_USER_DATA_PATH=/path/to/user-data`
- `AH_BRIDGE_BASE_URL=http://127.0.0.1:7788`
- `AH_BRIDGE_DISABLED=1`

## Remaining parity gaps

1. Embedded terminal parity (`term:*` APIs, xterm-equivalent UX) in native UI.
2. Multi-window/multi-display controls (`open lane`, `open job`) from native shell.
3. Native tray/menu-bar mode + global hotkey + start-at-login.
4. Checkout tooling parity (integrate/commit flows, diff surfaces) in native UI.
5. Full settings surface and all advanced dialogs from Electron renderer.
