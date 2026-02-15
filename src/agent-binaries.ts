import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawn } from "node:child_process";
import { spawnPlatform } from "./platform-spawn";

export type AgentBinaryKey = "codex" | "claude";

export type AgentBinaryCheck = {
  agent: AgentBinaryKey;
  path: string;
  found: boolean;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
  error: string;
  // Useful when the binary isn't on PATH (common for packaged apps on macOS).
  candidates: string[];
};

function isPlainObject(x: any): x is Record<string, any> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function normalizeCliPath(p: unknown): string {
  const s = String(p || "").trim();
  if (!s) return "";

  // Users often paste quoted paths; strip a single pair of wrapping quotes.
  const unquoted =
    (s.startsWith("\"") && s.endsWith("\"")) || (s.startsWith("'") && s.endsWith("'")) ? s.slice(1, -1).trim() : s;

  // Expand "~/" for convenience.
  if (unquoted === "~") return os.homedir();
  if (unquoted.startsWith("~/") || unquoted.startsWith("~\\")) {
    const home = os.homedir();
    if (!home) return unquoted;
    return path.join(home, unquoted.slice(2));
  }

  return unquoted;
}

function getAgentsFromSettings(settings: any): any {
  const s = isPlainObject(settings) ? settings : {};
  return isPlainObject((s as any).agents) ? (s as any).agents : {};
}

function firstExistingCandidateCliPath(name: AgentBinaryKey): string {
  try {
    for (const c of candidateCliPaths(name)) {
      try {
        const st = fs.statSync(c);
        if (st && st.isFile()) return c;
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }
  return "";
}

export function resolveCodexCliPathFromSettings(settings: any): string {
  const s = isPlainObject(settings) ? settings : {};
  const agents = getAgentsFromSettings(s);
  const codex = isPlainObject((agents as any).codex) ? (agents as any).codex : {};
  const p = normalizeCliPath((codex as any).path || (s as any).codexPath || "");
  if (p) return p;

  // Packaged apps on macOS commonly start with a minimal PATH (no /usr/local/bin).
  // Prefer a stable absolute candidate if we can find one.
  const detected = firstExistingCandidateCliPath("codex");
  return detected || "codex";
}

function defaultClaudeLocalInstallerPath(): string {
  try {
    const home = os.homedir();
    if (!home) return "";
    const p =
      process.platform === "win32"
        ? path.join(home, ".claude", "local", "claude.exe")
        : path.join(home, ".claude", "local", "claude");
    return fs.existsSync(p) ? p : "";
  } catch {
    return "";
  }
}

export function resolveClaudeCliPathFromSettings(settings: any): string {
  const s = isPlainObject(settings) ? settings : {};
  const agents = getAgentsFromSettings(s);
  const claude = isPlainObject((agents as any).claude) ? (agents as any).claude : {};
  const p = normalizeCliPath((claude as any).path || "");
  if (p) return p;

  const local = defaultClaudeLocalInstallerPath();
  if (local) return local;

  const detected = firstExistingCandidateCliPath("claude");
  return detected || "claude";
}

function safeErrorString(err: any): string {
  try {
    const msg = err && typeof err.message === "string" ? err.message : "";
    if (msg) return msg;
    return String(err);
  } catch {
    return "Unknown error";
  }
}

async function checkSpawnableBinary(binPath: string, args: string[], timeoutMs: number): Promise<Omit<AgentBinaryCheck, "agent">> {
  const p = normalizeCliPath(binPath);

  return await new Promise((resolve) => {
    let done = false;
    let timedOut = false;
    let exitCode: number | null = null;
    let signal: NodeJS.Signals | null = null;
    let error = "";

    const finish = (found: boolean) => {
      if (done) return;
      done = true;
      resolve({
        path: p,
        found,
        exitCode,
        signal,
        timedOut,
        error,
        candidates: []
      });
    };

    let child: ReturnType<typeof spawn> | null = null;
    try {
      child = spawnPlatform(p, args, { stdio: ["ignore", "ignore", "ignore"], windowsHide: true } as any);
    } catch (err: any) {
      error = safeErrorString(err);
      finish(false);
      return;
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child && child.kill();
      } catch {
        // ignore
      }
      // Treat "spawned but didn't exit" as "found".
      finish(true);
    }, Math.max(250, timeoutMs || 2500));

    const cleanup = () => {
      clearTimeout(timer);
    };

    child.on("error", (err: any) => {
      cleanup();
      error = safeErrorString(err);
      finish(false);
    });

    child.on("close", (code, sig) => {
      cleanup();
      exitCode = typeof code === "number" ? code : null;
      signal = (sig as any) || null;
      finish(true);
    });
  });
}

function candidateCliPaths(name: AgentBinaryKey): string[] {
  const out: string[] = [];
  const home = os.homedir();

  if (process.platform === "darwin") {
    out.push(`/opt/homebrew/bin/${name}`);
    out.push(`/usr/local/bin/${name}`);
  }

  if (process.platform !== "win32") {
    out.push(`/usr/local/bin/${name}`);
    out.push(`/usr/bin/${name}`);
    if (home) out.push(path.join(home, ".local", "bin", name));
    if (home) out.push(path.join(home, "bin", name));
  }

  // Claude has a common local installer path.
  if (name === "claude") {
    const local = defaultClaudeLocalInstallerPath();
    if (local) out.unshift(local);
  }

  // De-dupe while preserving order.
  const seen = new Set<string>();
  const uniq: string[] = [];
  for (const p of out) {
    const s = String(p || "").trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    uniq.push(s);
  }
  return uniq;
}

function isBareCommand(p: string): boolean {
  const s = String(p || "").trim();
  if (!s) return true;
  return !s.includes("/") && !s.includes("\\");
}

export async function checkAgentBinaries(
  settings: any,
  opts?: { timeoutMs?: number }
): Promise<{ checkedAt: string; codex: AgentBinaryCheck; claude: AgentBinaryCheck }> {
  const timeoutMs = typeof opts?.timeoutMs === "number" ? opts!.timeoutMs : 2500;

  const codexPath = resolveCodexCliPathFromSettings(settings);
  const claudePath = resolveClaudeCliPathFromSettings(settings);

  const [codexRes, claudeRes] = await Promise.all([
    checkSpawnableBinary(codexPath, ["--version"], timeoutMs),
    checkSpawnableBinary(claudePath, ["--version"], timeoutMs)
  ]);

  const codexCandidates: string[] = [];
  if (!codexRes.found && isBareCommand(codexPath)) {
    for (const c of candidateCliPaths("codex")) {
      try {
        if (fs.existsSync(c)) codexCandidates.push(c);
      } catch {
        // ignore
      }
    }
  }

  const claudeCandidates: string[] = [];
  if (!claudeRes.found && isBareCommand(claudePath)) {
    for (const c of candidateCliPaths("claude")) {
      try {
        if (fs.existsSync(c)) claudeCandidates.push(c);
      } catch {
        // ignore
      }
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    codex: { agent: "codex", ...codexRes, candidates: codexCandidates },
    claude: { agent: "claude", ...claudeRes, candidates: claudeCandidates }
  };
}
