# Agent Heaven Native (macOS)

Parallel native macOS app scaffold for Agent Heaven.

## Current scope

- SwiftUI desktop shell with board + detail workflow
- Prompt composer to start jobs (`codex` / `claude` / `gemini`)
- Follow-up prompt send from detail panel
- Job actions: cancel, archive, trash, restore, delete
- Optional bridge mode (`http://127.0.0.1:7788`) for runtime control
- Local fallback mode for read-only browsing from persisted files

## Run bridge (recommended)

From repo root:

```bash
npm run native:bridge
```

## Run native app

Option 1 (Xcode):

1. Open `native-macos/Package.swift` in Xcode.
2. Select target `AgentHeavenNativeApp`.
3. Run.

Option 2 (CLI):

```bash
cd native-macos
swift run AgentHeavenNativeApp
```

## Environment variables

- `AH_USER_DATA_PATH`: override Agent Heaven user data directory.
- `AH_BRIDGE_BASE_URL`: override native bridge base URL (default `http://127.0.0.1:7788`).
- `AH_BRIDGE_DISABLED=1`: force local file mode and skip bridge requests.

## Notes

This is an incremental migration path toward full parity with Electron.
