import { spawn } from "node:child_process";

function getAgentHeavenVersion(): string {
  // Prefer Electron's app version when available (packaged app),
  // but keep this module usable in plain Node contexts (tests/tooling).
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const electron = require("electron") as typeof import("electron");
    const v = electron && electron.app && typeof electron.app.getVersion === "function" ? electron.app.getVersion() : "";
    if (typeof v === "string" && v.trim()) return v.trim();
  } catch {
    // ignore
  }

  const v = process.env.npm_package_version;
  return typeof v === "string" && v.trim() ? v.trim() : "0.0.0";
}

function attachLineStream(stream: NodeJS.ReadableStream, onLine: (line: string) => void) {
  let buf = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buf += chunk;
    while (true) {
      const idx = buf.indexOf("\n");
      if (idx === -1) break;
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      onLine(line);
    }
  });
  stream.on("end", () => {
    if (buf.length > 0) onLine(buf);
    buf = "";
  });
}

function safeJsonParseLine(line: string) {
  const s = String(line || "").trim();
  if (!s) return null;
  if (!s.startsWith("{") || !s.endsWith("}")) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

type Pending = { resolve: (value: any) => void; reject: (err: Error) => void };

export async function listCodexModels(opts: { codexPath: string; timeoutMs?: number }): Promise<any[]> {
  const codexPath = String(opts && opts.codexPath ? opts.codexPath : "").trim() || "codex";
  const timeoutMs = typeof opts.timeoutMs === "number" ? opts.timeoutMs : 12_000;

  const child = spawn(codexPath, ["app-server"], {
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env
  });

  let exited = false;
  let exitCode: number | null = null;
  const pendingById = new Map<string, Pending>();

  function rejectAll(err: Error) {
    for (const p of pendingById.values()) p.reject(err);
    pendingById.clear();
  }

  child.on("exit", (code) => {
    exited = true;
    exitCode = typeof code === "number" ? code : null;
    if (pendingById.size > 0) {
      rejectAll(new Error(`codex app-server exited early (code=${exitCode ?? "?"})`));
    }
  });
  child.on("error", (err: any) => {
    rejectAll(new Error(String(err && err.message ? err.message : err)));
  });

  attachLineStream(child.stdout, (line) => {
    const msg = safeJsonParseLine(line);
    if (!msg || typeof msg !== "object") return;
    const id = Object.prototype.hasOwnProperty.call(msg, "id") ? String((msg as any).id) : "";
    if (!id) return;

    const pending = pendingById.get(id);
    if (!pending) return;

    if (Object.prototype.hasOwnProperty.call(msg, "result")) {
      pendingById.delete(id);
      pending.resolve((msg as any).result);
      return;
    }
    if (Object.prototype.hasOwnProperty.call(msg, "error")) {
      pendingById.delete(id);
      const e = (msg as any).error || {};
      const m = typeof e.message === "string" && e.message.trim() ? e.message.trim() : "Request failed";
      pending.reject(new Error(m));
    }
  });

  // stderr can contain human logs; don't treat as fatal unless we time out / exit.
  attachLineStream(child.stderr, (_line) => {});

  function request(id: string, method: string, params: any) {
    const rid = String(id);
    if (!child.stdin.writable) return Promise.reject(new Error("codex app-server stdin is not writable"));

    const payload = { id: rid, method, params };
    child.stdin.write(`${JSON.stringify(payload)}\n`);

    return new Promise<any>((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingById.delete(rid);
        reject(new Error(`Timed out waiting for ${method} response`));
      }, timeoutMs);

      pendingById.set(rid, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        }
      });
    });
  }

  try {
    await request("1", "initialize", {
      clientInfo: { name: "agent-heaven", version: getAgentHeavenVersion() },
      capabilities: { experimentalApi: true }
    });

    const out: any[] = [];
    let cursor: string | null = null;
    let page = 0;
    while (true) {
      if (page > 20) break; // safety: prevent infinite pagination loops
      page += 1;
      const res = await request(String(100 + page), "model/list", { limit: 200, cursor });
      const data = res && Array.isArray(res.data) ? res.data : [];
      out.push(...data);
      cursor = typeof res.nextCursor === "string" && res.nextCursor.trim() ? res.nextCursor : null;
      if (!cursor) break;
    }

    return out;
  } finally {
    try {
      child.stdin.end();
    } catch {
      // ignore
    }
    try {
      if (!exited) child.kill("SIGTERM");
    } catch {
      // ignore
    }
  }
}
