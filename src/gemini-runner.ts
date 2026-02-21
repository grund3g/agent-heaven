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

function normalizeSandboxMode(value: unknown): string {
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
  if (sandbox) args.push("--sandbox", sandbox);

  return args;
}

function buildResumeArgs({ settings, model, sessionId }: { settings: any; model: string; sessionId: string }) {
  const args = buildExecArgs({ settings, model });
  args.push("--resume", sessionId || "latest");
  return args;
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
  const child = spawnPlatform(geminiPath, args, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env
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
