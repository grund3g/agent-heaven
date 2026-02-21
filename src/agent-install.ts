import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawn } from "node:child_process";

import type { AgentBinaryKey } from "./agent-binaries";

export type AgentInstallMethod = "auto" | "npm" | "native";

export type AgentInstallResult = {
  startedAt: string;
  finishedAt: string;
  agent: AgentBinaryKey;
  method: AgentInstallMethod;
  command: string;

  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;

  stdout: string;
  stderr: string;
  truncated: boolean;

  detectedPath: string;
  error: string;
};

type RunShellResult = {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
  stdout: string;
  stderr: string;
  truncated: boolean;
};

const inFlight = new Set<AgentBinaryKey>();

function safeErrorString(err: any): string {
  try {
    const msg = err && typeof err.message === "string" ? err.message : "";
    if (msg) return msg;
    return String(err);
  } catch {
    return "Unknown error";
  }
}

function appendLimited(cur: string, chunk: any, maxChars: number): { next: string; truncated: boolean } {
  const add = typeof chunk === "string" ? chunk : chunk == null ? "" : String(chunk);
  if (!add) return { next: cur, truncated: false };

  const next = cur + add;
  if (next.length <= maxChars) return { next, truncated: false };
  return { next: next.slice(next.length - maxChars), truncated: true };
}

function shellForPlatform(): { bin: string; argsPrefix: string[] } {
  if (process.platform === "win32") return { bin: "powershell.exe", argsPrefix: ["-NoProfile", "-Command"] };
  if (process.platform === "darwin") return { bin: "/bin/zsh", argsPrefix: ["-lc"] };
  return { bin: "/bin/bash", argsPrefix: ["-lc"] };
}

async function runShell(command: string, opts?: { timeoutMs?: number; maxOutputChars?: number }): Promise<RunShellResult> {
  const timeoutMs = typeof opts?.timeoutMs === "number" ? opts!.timeoutMs : 10 * 60_000;
  const maxOutputChars = typeof opts?.maxOutputChars === "number" ? opts!.maxOutputChars : 200_000;

  const { bin, argsPrefix } = shellForPlatform();
  const args = [...argsPrefix, command];

  return await new Promise((resolve) => {
    let done = false;
    let timedOut = false;
    let exitCode: number | null = null;
    let signal: NodeJS.Signals | null = null;
    let stdout = "";
    let stderr = "";
    let truncated = false;

    const finish = () => {
      if (done) return;
      done = true;
      resolve({ exitCode, signal, timedOut, stdout, stderr, truncated });
    };

    let child: ReturnType<typeof spawn> | null = null;
    try {
      child = spawn(bin, args, {
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        env: process.env
      });
    } catch (err) {
      stderr = safeErrorString(err);
      finish();
      return;
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child && child.kill();
      } catch {
        // ignore
      }
      finish();
    }, Math.max(2_000, timeoutMs));

    const cleanup = () => {
      clearTimeout(timer);
    };

    if (child.stdout) {
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        const res = appendLimited(stdout, chunk, maxOutputChars);
        stdout = res.next;
        truncated = truncated || res.truncated;
      });
    }
    if (child.stderr) {
      child.stderr.setEncoding("utf8");
      child.stderr.on("data", (chunk) => {
        const res = appendLimited(stderr, chunk, maxOutputChars);
        stderr = res.next;
        truncated = truncated || res.truncated;
      });
    }

    child.on("error", (err: any) => {
      cleanup();
      const res = appendLimited(stderr, safeErrorString(err), maxOutputChars);
      stderr = res.next;
      truncated = truncated || res.truncated;
      finish();
    });

    child.on("close", (code, sig) => {
      cleanup();
      exitCode = typeof code === "number" ? code : null;
      signal = (sig as any) || null;
      finish();
    });
  });
}

function claudeLocalInstallerPath(): string {
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

async function detectCliOnPath(name: string): Promise<string> {
  if (!name) return "";
  try {
    if (process.platform === "win32") {
      const res = await runShell(`(Get-Command ${name} -ErrorAction SilentlyContinue).Source`, {
        timeoutMs: 12_000,
        maxOutputChars: 50_000
      });
      const p = String(res.stdout || "").trim();
      return p;
    }

    const res = await runShell(`command -v ${name} 2>/dev/null || true`, { timeoutMs: 12_000, maxOutputChars: 50_000 });
    return String(res.stdout || "").trim().split("\n")[0].trim();
  } catch {
    return "";
  }
}

async function detectCodexPathViaNpmPrefix(): Promise<string> {
  return detectCliPathViaNpmPrefix("codex");
}

async function detectCliPathViaNpmPrefix(name: string): Promise<string> {
  const cmd = String(name || "").trim();
  if (!cmd) return "";
  try {
    const res = await runShell("npm prefix -g", { timeoutMs: 12_000, maxOutputChars: 50_000 });
    const prefix = String(res.stdout || "").trim().split("\n")[0].trim();
    if (!prefix) return "";

    if (process.platform === "win32") {
      const cmdShim = path.join(prefix, `${cmd}.cmd`);
      if (fs.existsSync(cmdShim)) return cmdShim;
      const exeShim = path.join(prefix, `${cmd}.exe`);
      if (fs.existsSync(exeShim)) return exeShim;
      const plain = path.join(prefix, cmd);
      if (fs.existsSync(plain)) return plain;
      return "";
    }

    const binPath = path.join(prefix, "bin", cmd);
    if (fs.existsSync(binPath)) return binPath;
    return "";
  } catch {
    return "";
  }
}

function normalizeMethod(agent: AgentBinaryKey, rawMethod: unknown): AgentInstallMethod {
  const s = typeof rawMethod === "string" ? rawMethod.trim() : "";
  const m: AgentInstallMethod = s === "npm" || s === "native" || s === "auto" ? (s as any) : "auto";

  if (m !== "auto") return m;
  if (agent === "codex") return "npm";
  if (agent === "gemini") return "npm";
  // Claude: prefer native installers by default.
  return "native";
}

function commandFor(agent: AgentBinaryKey, method: AgentInstallMethod): { method: AgentInstallMethod; command: string } {
  if (agent === "codex") {
    // Official: https://openai.com/index/codex-is-now-generally-available/
    return { method: "npm", command: "npm i -g @openai/codex" };
  }

  if (agent === "gemini") {
    // Gemini CLI (Google): https://github.com/google-gemini/gemini-cli
    return { method: "npm", command: "npm install -g @google/gemini-cli" };
  }

  // Claude Code: https://docs.anthropic.com/en/docs/claude-code/setup
  if (method === "npm") return { method: "npm", command: "npm install -g @anthropic-ai/claude-code" };

  // native installers
  if (process.platform === "win32") return { method: "native", command: "irm https://claude.ai/install.ps1 | iex" };
  return { method: "native", command: "curl -fsSL https://claude.ai/install.sh | bash" };
}

export async function installAgentCli(agent: unknown, opts?: { method?: unknown; timeoutMs?: unknown }): Promise<AgentInstallResult> {
  const startedAt = new Date().toISOString();
  const key: AgentBinaryKey | "" = agent === "codex" || agent === "claude" || agent === "gemini" ? agent : "";

  if (!key) {
    return {
      startedAt,
      finishedAt: new Date().toISOString(),
      agent: "codex",
      method: "auto",
      command: "",
      exitCode: null,
      signal: null,
      timedOut: false,
      stdout: "",
      stderr: "",
      truncated: false,
      detectedPath: "",
      error: "Unknown agent"
    };
  }

  if (inFlight.has(key)) {
    return {
      startedAt,
      finishedAt: new Date().toISOString(),
      agent: key,
      method: "auto",
      command: "",
      exitCode: null,
      signal: null,
      timedOut: false,
      stdout: "",
      stderr: "",
      truncated: false,
      detectedPath: "",
      error: "Install already running"
    };
  }

  inFlight.add(key);
  try {
    const timeoutMs =
      typeof opts?.timeoutMs === "number"
        ? opts!.timeoutMs
        : typeof opts?.timeoutMs === "string"
          ? Number(opts!.timeoutMs)
          : 10 * 60_000;

    const method = normalizeMethod(key, opts?.method);
    const plan = commandFor(key, method);

    const res = await runShell(plan.command, { timeoutMs: Number.isFinite(timeoutMs) ? Math.max(10_000, timeoutMs) : 10 * 60_000 });

    let detectedPath = "";
    try {
      if (key === "claude") {
        detectedPath = claudeLocalInstallerPath() || (await detectCliOnPath("claude"));
      } else if (key === "gemini") {
        detectedPath = (await detectCliOnPath("gemini")) || (await detectCliPathViaNpmPrefix("gemini"));
      } else {
        detectedPath = (await detectCliOnPath("codex")) || (await detectCodexPathViaNpmPrefix());
      }
    } catch {
      detectedPath = "";
    }

    const finishedAt = new Date().toISOString();
    let error = "";

    const ok = !res.timedOut && res.exitCode === 0;
    if (!ok) {
      const bits = [];
      if (res.timedOut) bits.push("timed out");
      if (typeof res.exitCode === "number") bits.push(`exitCode=${res.exitCode}`);
      if (res.signal) bits.push(`signal=${res.signal}`);
      error = `Install failed (${bits.join(" ") || "unknown"})`;
    }

    return {
      startedAt,
      finishedAt,
      agent: key,
      method: plan.method,
      command: plan.command,
      exitCode: res.exitCode,
      signal: res.signal,
      timedOut: res.timedOut,
      stdout: res.stdout,
      stderr: res.stderr,
      truncated: res.truncated,
      detectedPath,
      error
    };
  } catch (err: any) {
    return {
      startedAt,
      finishedAt: new Date().toISOString(),
      agent: key,
      method: "auto",
      command: "",
      exitCode: null,
      signal: null,
      timedOut: false,
      stdout: "",
      stderr: "",
      truncated: false,
      detectedPath: "",
      error: safeErrorString(err)
    };
  } finally {
    inFlight.delete(key);
  }
}
