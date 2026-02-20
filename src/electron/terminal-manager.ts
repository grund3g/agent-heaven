import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { webContents } from "electron";
import type { IPty } from "node-pty";

type TermSession = {
  jobId: string;
  cwd: string;
  pty: IPty;
  buffer: string;
  seq: number;
  subscribers: Set<number>; // webContents.id
  noSubscriberTimer: NodeJS.Timeout | null;
  createdAtMs: number;
  lastActiveAtMs: number;
};

function clampInt(n: unknown, min: number, max: number, fallback: number): number {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(x)));
}

function defaultShellPath(): string {
  if (process.platform === "win32") {
    return "powershell.exe";
  }

  const envShell = typeof process.env.SHELL === "string" ? process.env.SHELL.trim() : "";
  if (envShell) return envShell;

  if (process.platform === "darwin") return "/bin/zsh";
  return "/bin/bash";
}

function defaultShellArgs(): string[] {
  if (process.platform === "win32") return ["-NoLogo"];
  return [];
}

function isDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function normalizeCwd(input: unknown): string {
  const raw = typeof input === "string" ? input.trim() : "";
  if (raw && path.isAbsolute(raw) && isDirectory(raw)) return raw;
  const home = os.homedir();
  if (home && isDirectory(home)) return home;
  return process.cwd();
}

function ensureExecBit(filePath: string): boolean {
  try {
    const st = fs.statSync(filePath);
    if (!st.isFile()) return false;
    const mode = st.mode & 0o777;
    // Already executable by someone.
    if ((mode & 0o111) !== 0) return true;
    fs.chmodSync(filePath, mode | 0o111);
    return true;
  } catch {
    return false;
  }
}

export class TerminalManager {
  private sessions = new Map<string, TermSession>();
  private readonly MAX_BUFFER_CHARS = 260_000;
  private readonly UNSUBSCRIBED_DESTROY_DELAY_MS = 45_000;
  private checkedNodePtyHelperPerms = false;

  private clearNoSubscriberTimer(session: TermSession | null) {
    if (!session || !session.noSubscriberTimer) return;
    try {
      clearTimeout(session.noSubscriberTimer);
    } catch {
      // ignore
    }
    session.noSubscriberTimer = null;
  }

  private scheduleDestroyIfUnsubscribed(jobId: string, session: TermSession | null) {
    if (!session) return;
    this.clearNoSubscriberTimer(session);
    if (session.subscribers.size > 0) return;

    session.noSubscriberTimer = setTimeout(() => {
      const live = this.sessions.get(jobId) || null;
      if (!live || live !== session) return;
      if (live.subscribers.size > 0) return;
      this.destroy(jobId);
    }, this.UNSUBSCRIBED_DESTROY_DELAY_MS);
  }

  private ensureNodePtySpawnHelperPerms() {
    if (this.checkedNodePtyHelperPerms) return;
    this.checkedNodePtyHelperPerms = true;
    if (process.platform === "win32") return;

    let pkgPath = "";
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      pkgPath = require.resolve("node-pty/package.json");
    } catch {
      return;
    }

    const root = path.dirname(pkgPath);
    const roots = new Set<string>();
    roots.add(root);
    roots.add(root.replace("app.asar", "app.asar.unpacked"));
    roots.add(root.replace("node_modules.asar", "node_modules.asar.unpacked"));

    for (const base of roots) {
      // Common locations.
      ensureExecBit(path.join(base, "build", "Release", "spawn-helper"));
      ensureExecBit(path.join(base, "build", "Debug", "spawn-helper"));

      const prebuildsDir = path.join(base, "prebuilds");
      let ents: fs.Dirent[] = [];
      try {
        ents = fs.readdirSync(prebuildsDir, { withFileTypes: true });
      } catch {
        ents = [];
      }
      for (const ent of ents) {
        if (!ent || !ent.isDirectory()) continue;
        ensureExecBit(path.join(prebuildsDir, ent.name, "spawn-helper"));
      }
    }
  }

  ensure(jobId: unknown, opts: { cwd: unknown; cols?: unknown; rows?: unknown; webContentsId: number }) {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false as const, error: "Missing jobId" };

    const wcId = opts && typeof opts.webContentsId === "number" ? opts.webContentsId : 0;
    if (!wcId) return { ok: false as const, error: "Unknown window" };

    const cwd = normalizeCwd(opts ? opts.cwd : "");
    const cols = clampInt(opts ? opts.cols : 0, 2, 320, 110);
    const rows = clampInt(opts ? opts.rows : 0, 2, 160, 34);

    let session = this.sessions.get(id) || null;
    if (!session) {
      try {
        // Lazy-load native module so the app can still run even if the addon
        // needs an Electron rebuild on the current machine.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pty: any = require("node-pty");

        // node-pty's prebuilt `spawn-helper` sometimes ships without the executable bit set,
        // causing `posix_spawnp failed.` on macOS/Linux. Fix it best-effort.
        this.ensureNodePtySpawnHelperPerms();

        const shell = defaultShellPath();
        const args = defaultShellArgs();
        const env: Record<string, string> = {};
        for (const [k, v] of Object.entries(process.env)) {
          if (typeof v === "string") env[k] = v;
        }
        env.TERM = "xterm-256color";

        const child: IPty = pty.spawn(shell, args, {
          name: "xterm-256color",
          cols,
          rows,
          cwd,
          env
        });

        session = {
          jobId: id,
          cwd,
          pty: child,
          buffer: "",
          seq: 0,
          subscribers: new Set<number>(),
          noSubscriberTimer: null,
          createdAtMs: Date.now(),
          lastActiveAtMs: Date.now()
        };
        this.sessions.set(id, session);

        child.onData((data) => this.onData(id, data));
        child.onExit(({ exitCode, signal }) => this.onExit(id, exitCode, signal));
      } catch (err: any) {
        const msg = String(err && err.message ? err.message : err);
        let hint = msg;
        if (msg.includes("NODE_MODULE_VERSION") || msg.includes("was compiled against a different Node.js version")) {
          hint = `${msg}\n\nHint: node-pty is a native module. If you're running from source, rebuild native deps for Electron (e.g. \`npx electron-builder install-app-deps\`).`;
        } else if (msg.includes("posix_spawnp failed")) {
          const prebuildDir = `${process.platform}-${process.arch}`;
          hint = `${msg}\n\nHint: node-pty's prebuilt \`spawn-helper\` must be executable (+x). If you're running from source, run:\n\n  node scripts/fix-node-pty-perms.js\n\n(or chmod \`node_modules/node-pty/prebuilds/${prebuildDir}/spawn-helper\`).`;
        }
        return { ok: false as const, error: hint };
      }
    }

    this.clearNoSubscriberTimer(session);
    session.subscribers.add(wcId);
    session.lastActiveAtMs = Date.now();

    // Best-effort resize to match the current UI (in case the terminal was created earlier).
    try {
      session.pty.resize(cols, rows);
    } catch {
      // ignore
    }

    return { ok: true as const, buffer: session.buffer, seq: session.seq };
  }

  write(jobId: unknown, data: unknown) {
    const id = String(jobId || "").trim();
    const session = this.sessions.get(id) || null;
    if (!session) return { ok: false as const, error: "Terminal not running" };
    const s = typeof data === "string" ? data : data == null ? "" : String(data);
    if (!s) return { ok: true as const };
    try {
      session.pty.write(s);
      session.lastActiveAtMs = Date.now();
      return { ok: true as const };
    } catch (err: any) {
      return { ok: false as const, error: String(err && err.message ? err.message : err) };
    }
  }

  resize(jobId: unknown, cols: unknown, rows: unknown) {
    const id = String(jobId || "").trim();
    const session = this.sessions.get(id) || null;
    if (!session) return { ok: false as const, error: "Terminal not running" };
    const c = clampInt(cols, 2, 320, 110);
    const r = clampInt(rows, 2, 160, 34);
    try {
      session.pty.resize(c, r);
      session.lastActiveAtMs = Date.now();
      return { ok: true as const };
    } catch (err: any) {
      return { ok: false as const, error: String(err && err.message ? err.message : err) };
    }
  }

  detach(jobId: unknown, webContentsId: unknown) {
    const id = String(jobId || "").trim();
    const wcId = typeof webContentsId === "number" ? webContentsId : Number(webContentsId);
    const session = this.sessions.get(id) || null;
    if (!session) return { ok: true as const };
    if (Number.isFinite(wcId)) session.subscribers.delete(wcId);
    this.scheduleDestroyIfUnsubscribed(id, session);
    return { ok: true as const };
  }

  detachAllByWebContentsId(webContentsId: unknown) {
    const wcId = typeof webContentsId === "number" ? webContentsId : Number(webContentsId);
    if (!Number.isFinite(wcId)) return;
    for (const [jobId, session] of this.sessions.entries()) {
      session.subscribers.delete(wcId);
      this.scheduleDestroyIfUnsubscribed(jobId, session);
    }
  }

  destroy(jobId: unknown) {
    const id = String(jobId || "").trim();
    const session = this.sessions.get(id) || null;
    if (!session) return { ok: true as const };
    this.sessions.delete(id);
    this.clearNoSubscriberTimer(session);
    try {
      session.pty.kill();
    } catch {
      // ignore
    }
    return { ok: true as const };
  }

  shutdown() {
    for (const id of Array.from(this.sessions.keys())) {
      this.destroy(id);
    }
  }

  private onData(jobId: string, data: string) {
    const session = this.sessions.get(jobId) || null;
    if (!session) return;

    session.lastActiveAtMs = Date.now();
    session.seq += 1;
    if (typeof data === "string" && data) {
      session.buffer += data;
      if (session.buffer.length > this.MAX_BUFFER_CHARS) {
        session.buffer = session.buffer.slice(session.buffer.length - this.MAX_BUFFER_CHARS);
      }
    }

    const payload = { jobId, kind: "data", data, seq: session.seq };
    for (const wcId of Array.from(session.subscribers)) {
      const wc = webContents.fromId(wcId);
      if (!wc || wc.isDestroyed()) {
        session.subscribers.delete(wcId);
        continue;
      }
      try {
        wc.send("term:event", payload);
      } catch {
        session.subscribers.delete(wcId);
      }
    }
  }

  private onExit(jobId: string, exitCode: number, signal: number) {
    const session = this.sessions.get(jobId) || null;
    if (!session) return;

    const payload = { jobId, kind: "exit", exitCode, signal };
    for (const wcId of Array.from(session.subscribers)) {
      const wc = webContents.fromId(wcId);
      if (!wc || wc.isDestroyed()) continue;
      try {
        wc.send("term:event", payload);
      } catch {
        // ignore
      }
    }

    // Drop the session after exit; the next `ensure()` will create a fresh PTY.
    this.clearNoSubscriberTimer(session);
    this.sessions.delete(jobId);
  }
}
