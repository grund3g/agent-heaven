import { spawn } from "node:child_process";

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

function buildExecArgs({ settings, model, sessionId }: { settings: any; model: string; sessionId: string }) {
  const s = settings && typeof settings === "object" ? settings : {};
  const args: string[] = ["--print", "--output-format", "stream-json", "--verbose"];

  const perm = typeof (s as any).permissionMode === "string" ? String((s as any).permissionMode).trim() : "";
  args.push("--permission-mode", perm || "acceptEdits");

  if ((s as any).dangerouslySkipPermissions) {
    args.push("--dangerously-skip-permissions");
  }

  if (model) args.push("--model", model);

  if (sessionId) {
    args.push("--session-id", sessionId);
  }

  return args;
}

function buildResumeArgs({ settings, model, sessionId }: { settings: any; model: string; sessionId: string }) {
  const s = settings && typeof settings === "object" ? settings : {};
  const args: string[] = ["--print", "--output-format", "stream-json", "--verbose"];

  const perm = typeof (s as any).permissionMode === "string" ? String((s as any).permissionMode).trim() : "";
  args.push("--permission-mode", perm || "acceptEdits");

  if ((s as any).dangerouslySkipPermissions) {
    args.push("--dangerously-skip-permissions");
  }

  if (model) args.push("--model", model);

  if (sessionId) args.push("--resume", sessionId);

  return args;
}

function spawnClaude({ claudePath, cwd, args, prompt }: { claudePath: string; cwd: string; args: string[]; prompt: string }) {
  const child = spawn(claudePath, args, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env
  });

  child.stdin.setDefaultEncoding("utf8");
  child.stdin.write(prompt);
  child.stdin.end();

  return child;
}

export function runClaudeExec({
  claudePath,
  settings,
  projectPath,
  model,
  sessionId,
  prompt,
  onEvent
}: {
  claudePath: string;
  settings: any;
  projectPath: string;
  model: string;
  sessionId: string;
  prompt: string;
  onEvent: (ev: any) => void;
}) {
  const args = buildExecArgs({ settings, model, sessionId });
  const child = spawnClaude({ claudePath, cwd: projectPath || process.cwd(), args, prompt });

  attachLineStream(child.stdout, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stdout", kind: "claude", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stdout", kind: "log", text: line });
  });
  attachLineStream(child.stderr, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stderr", kind: "claude", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stderr", kind: "log", text: line });
  });

  return child;
}

export function runClaudeResume({
  claudePath,
  settings,
  cwd,
  sessionId,
  model,
  prompt,
  onEvent
}: {
  claudePath: string;
  settings: any;
  cwd: string;
  sessionId: string;
  model: string;
  prompt: string;
  onEvent: (ev: any) => void;
}) {
  const args = buildResumeArgs({ settings, model, sessionId });
  const child = spawnClaude({ claudePath, cwd: cwd || process.cwd(), args, prompt });

  attachLineStream(child.stdout, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stdout", kind: "claude", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stdout", kind: "log", text: line });
  });
  attachLineStream(child.stderr, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stderr", kind: "claude", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stderr", kind: "log", text: line });
  });

  return child;
}
