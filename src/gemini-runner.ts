import * as fs from "node:fs";
import * as path from "node:path";
import { spawnPlatform } from "./platform-spawn";

function nowIso() {
  return new Date().toISOString();
}

function looksLikeJsonObjectLine(line: string) {
  const s = line.trimStart();
  return s.startsWith("{") && s.endsWith("}");
}

function parseJsonLine(line: string) {
  if (!looksLikeJsonObjectLine(line)) return null;
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
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

function normalizeSandboxMode(value: unknown): "read-only" | "workspace-write" | "danger-full-access" | "" {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  // Keep a small allow-list to avoid passing unsupported values.
  if (raw === "read-only" || raw === "workspace-write" || raw === "danger-full-access") return raw;
  return "";
}

function buildExecArgs({ settings, model }: { settings: any; model: string }) {
  const s = settings && typeof settings === "object" ? settings : {};
  const args: string[] = ["--output-format", "stream-json"];

  if (model) args.push("--model", model);

  const sandbox = normalizeSandboxMode((s as any).sandboxMode);
  // Gemini CLI expects --sandbox as a boolean. Our internal modes are mapped to
  // supported flags so mode values never end up as accidental positional prompts.
  if (sandbox === "read-only") {
    args.push("--sandbox");
  } else if (sandbox === "workspace-write") {
    args.push("--sandbox", "--approval-mode", "auto_edit");
  } else if (sandbox === "danger-full-access") {
    args.push("--approval-mode", "yolo");
  }

  return args;
}

function buildResumeArgs({ settings, model, sessionId }: { settings: any; model: string; sessionId: string }) {
  const args = buildExecArgs({ settings, model });
  args.push("--resume", sessionId || "latest");
  return args;
}

function isBareCommand(p: string): boolean {
  const s = String(p || "").trim();
  if (!s) return true;
  return !s.includes("/") && !s.includes("\\");
}

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function resolveOnPath(command: string, envPath: string): string {
  const cmd = String(command || "").trim();
  if (!cmd) return "";
  if (!isBareCommand(cmd)) return cmd;

  const dirs = String(envPath || "")
    .split(path.delimiter)
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  if (process.platform === "win32") {
    const ext = path.extname(cmd).toLowerCase();
    const pathext = String(process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD")
      .split(";")
      .map((x) => String(x || "").trim().toLowerCase())
      .filter(Boolean);
    const suffixes = ext ? [""] : pathext;

    for (const dir of dirs) {
      for (const suffix of suffixes) {
        const candidate = path.join(dir, `${cmd}${suffix}`);
        if (fileExists(candidate)) return candidate;
      }
    }
    return cmd;
  }

  for (const dir of dirs) {
    const candidate = path.join(dir, cmd);
    if (fileExists(candidate)) return candidate;
  }
  return cmd;
}

function resolveForInspection(command: string, cwd: string, envPath: string): string {
  const cmd = String(command || "").trim();
  if (!cmd) return "";
  if (isBareCommand(cmd)) return resolveOnPath(cmd, envPath);
  if (path.isAbsolute(cmd)) return cmd;
  return path.resolve(cwd || process.cwd(), cmd);
}

function readShebangLine(filePath: string): string {
  if (!filePath || !fileExists(filePath)) return "";
  let fd = -1;
  try {
    fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(256);
    const read = fs.readSync(fd, buf, 0, buf.length, 0);
    if (read <= 0) return "";
    const text = buf.toString("utf8", 0, read);
    const first = (text.split(/\r?\n/, 1)[0] || "").trim();
    return first;
  } catch {
    return "";
  } finally {
    if (fd >= 0) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
    }
  }
}

function shebangUsesNode(line: string): boolean {
  const s = String(line || "").trim();
  if (!s.startsWith("#!")) return false;
  return /\bnode(?:\.exe)?\b/i.test(s);
}

function buildGeminiLaunch(
  geminiPath: string,
  args: string[],
  cwd: string
): { command: string; args: string[]; env: NodeJS.ProcessEnv } {
  const env = process.env;
  const envPath = String(env.PATH || "");
  const inspectPath = resolveForInspection(geminiPath, cwd, envPath);
  const shebang = readShebangLine(inspectPath);

  // Some global npm installs resolve `gemini` via `#!/usr/bin/env node`.
  // In GUI apps this can pick an older PATH node (e.g. Node 18) that can't run newer Gemini deps.
  // Running the script with our current runtime avoids that mismatch.
  if (inspectPath && shebangUsesNode(shebang)) {
    return {
      command: process.execPath,
      args: [inspectPath, ...args],
      env: { ...env, ELECTRON_RUN_AS_NODE: "1" }
    };
  }

  return { command: geminiPath, args, env };
}

function spawnGemini({
  geminiPath,
  cwd,
  args,
  prompt
}: {
  geminiPath: string;
  cwd: string;
  args: string[];
  prompt: string;
}) {
  const launch = buildGeminiLaunch(geminiPath, args, cwd);
  const child = spawnPlatform(launch.command, launch.args, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    env: launch.env
  });

  child.stdin.setDefaultEncoding("utf8");
  child.stdin.write(prompt);
  child.stdin.end();

  return child;
}

export function runGeminiExec({
  geminiPath,
  settings,
  projectPath,
  model,
  prompt,
  onEvent
}: {
  geminiPath: string;
  settings: any;
  projectPath: string;
  model: string;
  prompt: string;
  onEvent: (ev: any) => void;
}) {
  const args = buildExecArgs({ settings, model });
  const child = spawnGemini({ geminiPath, cwd: projectPath || process.cwd(), args, prompt });

  attachLineStream(child.stdout, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stdout", kind: "gemini", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stdout", kind: "log", text: line });
  });
  attachLineStream(child.stderr, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stderr", kind: "gemini", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stderr", kind: "log", text: line });
  });

  return child;
}

export function runGeminiResume({
  geminiPath,
  settings,
  cwd,
  sessionId,
  model,
  prompt,
  onEvent
}: {
  geminiPath: string;
  settings: any;
  cwd: string;
  sessionId: string;
  model: string;
  prompt: string;
  onEvent: (ev: any) => void;
}) {
  const args = buildResumeArgs({ settings, model, sessionId });
  const child = spawnGemini({ geminiPath, cwd: cwd || process.cwd(), args, prompt });

  attachLineStream(child.stdout, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stdout", kind: "gemini", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stdout", kind: "log", text: line });
  });
  attachLineStream(child.stderr, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stderr", kind: "gemini", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stderr", kind: "log", text: line });
  });

  return child;
}
