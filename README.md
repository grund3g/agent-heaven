# Agent Heaven

<p align="center">
  <strong>Run, monitor, and control parallel agent jobs.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License"></a>
</p>

Agent Heaven is a local Electron desktop app that spawns AI coding agents (OpenAI Codex and Anthropic Claude Code) as "cards" on a Kanban board and streams their output in real time.

[Releases](https://github.com/simonschnabl/agent-heaven/releases/latest) · [From Source](#from-source-development) · [License](LICENSE)

## Highlights

- Kanban board (Running / Needs Attention / Done)
- Live streaming output (terminal view + raw JSON logs)
- Multi-project: each run is tied to a project folder
- Image attachments: drag & drop images into prompts / follow-ups
- Persistent history (incl. Codex thread IDs / Claude session IDs for resume)
- Multi-window / multi-display support
- Themes, sounds, and global hotkey (optional)

## Install (recommended)

- macOS: download the latest `.dmg` from Releases.
- Other platforms: run from source (Electron).

### Requirements

- `codex` (OpenAI Codex CLI) and/or `claude` (Claude Code CLI) installed and authenticated.
- For running from source: Node.js 22 + npm.

## Quick start

1. Add a project folder (the agent runs in that folder).
2. Start a job with a prompt (choose Codex or Claude).
3. Watch streaming output; send follow-ups; attach images if needed.

## From source (development)

```bash
npm install
npm run dev
```

`npm run dev` runs `tsc -w` and Electron together. Live reload is enabled by default for `renderer/*` and the preload script (compiled to `build/preload.js`).

## Tests

```bash
npm test
```

## Build / Distribution (macOS)

Create a normal `.app` bundle (and a `.dmg`/`.zip`) so others can run it without `npm`:

```bash
npm install
npm run dist
```

Build artifacts land in `dist/`.

Notes:

- If you distribute unsigned builds, macOS Gatekeeper will likely block the first launch. Recipients can right-click the app -> Open (or allow it via System Settings -> Privacy & Security).
- For smooth distribution to others, you typically need code signing + notarization (Apple Developer ID).
- If the app can't find `codex` or `claude` (common when launching packaged apps from Finder), set Settings -> Codex path / Claude path to the full binary path (Claude local installer is typically `~/.claude/local/claude`).

## How it works (short)

Agent Heaven spawns a non-interactive agent process per card and parses the streamed JSONL:

- Codex: `codex exec --json` (and `codex exec resume --json`)
- Claude Code: `claude --print --output-format stream-json --verbose` (and `--resume <session-id>`)

Projects + settings are persisted; job history is persisted on disk (including IDs for resume).

## Safety / sandboxing

Agent Heaven runs `codex` / `claude` as normal child processes with your user permissions.

- Prefer using sandboxed modes and normal approval/permission flows.
- Avoid "dangerous" bypass flags unless you explicitly need them.

## License

MIT. See `LICENSE`.
