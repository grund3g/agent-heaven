import type { ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import { spawnPlatform } from "./platform-spawn";
import { runCodexAppServerExec, runCodexAppServerResume } from "./codex-app-server-runner";

function nowIso() {
  return new Date().toISOString();
}

function pushImageArgs(args: string[], images: unknown) {
  const arr = Array.isArray(images) ? images : [];
  for (const img of arr) {
    const p = typeof img === "string" ? img.trim() : "";
    if (!p) continue;
    args.push("--image", p);
  }
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

function buildExecArgs({ settings, model, projectPath, images }: { settings: any; model: string; projectPath: string; images: string[] }) {
  const args = ["exec", "--json"];

  if (settings.color && settings.color !== "auto") {
    args.push("--color", settings.color);
  }
  if (settings.skipGitRepoCheck) {
    args.push("--skip-git-repo-check");
  }
  if (model) {
    args.push("-m", model);
  }

  pushImageArgs(args, images);

  // Note: `--dangerously-bypass-approvals-and-sandbox` overrides sandboxing.
  if (settings.bypassApprovalsAndSandbox) {
    args.push("--dangerously-bypass-approvals-and-sandbox");
  } else if (settings.sandboxMode) {
    args.push("--sandbox", settings.sandboxMode);
  }

  // Keep both `cwd` (spawn option) and `-C` for Codex; helps with trust checks and path resolution.
  if (projectPath) {
    args.push("-C", projectPath);
  }

  // Read prompt from stdin to avoid command-line length/escaping problems.
  args.push("-");

  return args;
}

function buildResumeArgs({ settings, model, threadId, images }: { settings: any; model: string; threadId: string; images: string[] }) {
  const args = ["exec", "resume", "--json"];

  if (settings.skipGitRepoCheck) {
    args.push("--skip-git-repo-check");
  }
  if (model) {
    args.push("-m", model);
  }
  if (settings.bypassApprovalsAndSandbox) {
    args.push("--dangerously-bypass-approvals-and-sandbox");
  }

  pushImageArgs(args, images);

  args.push(threadId);
  args.push("-");
  return args;
}

function spawnCodex({ codexPath, cwd, args, prompt }: { codexPath: string; cwd: string; args: string[]; prompt: string }) {
  const child = spawnPlatform(codexPath, args, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env
  });

  child.stdin.setDefaultEncoding("utf8");
  child.stdin.write(prompt);
  child.stdin.end();

  return child;
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

function runCodexExecJson({ codexPath, settings, projectPath, model, prompt, images, onEvent }: any) {
  const args = buildExecArgs({ settings, model, projectPath, images });
  const child = spawnCodex({ codexPath, cwd: projectPath || process.cwd(), args, prompt });

  attachLineStream(child.stdout, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stdout", kind: "codex", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stdout", kind: "log", text: line });
  });
  attachLineStream(child.stderr, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stderr", kind: "codex", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stderr", kind: "log", text: line });
  });

  return child;
}

function runCodexResumeJson({ codexPath, settings, cwd, threadId, model, prompt, images, onEvent }: any) {
  const args = buildResumeArgs({ settings, model, threadId, images });
  const child = spawnCodex({ codexPath, cwd: cwd || process.cwd(), args, prompt });

  attachLineStream(child.stdout, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stdout", kind: "codex", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stdout", kind: "log", text: line });
  });
  attachLineStream(child.stderr, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stderr", kind: "codex", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stderr", kind: "log", text: line });
  });

  return child;
}

function normalizeCodexTransport(value: unknown): "exec_json" | "app_server" {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "app_server" || raw === "app-server" || raw === "appserver") return "app_server";
  return "exec_json";
}

class ChildSupervisor extends EventEmitter {
  killed = false;
  pid: number | undefined;
  private child: ChildProcess | null = null;

  setChild(next: ChildProcess | null) {
    this.child = next;
    this.pid = next && typeof (next as any).pid === "number" ? (next as any).pid : undefined;
    if (this.killed && this.child) {
      try {
        this.child.kill("SIGTERM");
      } catch {
        // ignore
      }
    }
  }

  kill(signal?: NodeJS.Signals | number) {
    this.killed = true;
    if (!this.child || typeof this.child.kill !== "function") return false;
    try {
      return this.child.kill(signal as any);
    } catch {
      return false;
    }
  }
}

function mapAppServerTurnCompletionToClose(data: any): { code: number | null; signal: NodeJS.Signals | null } {
  const status = typeof (data && data.status) === "string" ? String(data.status).trim().toLowerCase() : "";

  if (status === "cancelled" || status === "canceled" || status === "aborted" || status === "interrupted") {
    return { code: null, signal: "SIGTERM" };
  }
  if (status === "failed" || status === "error") {
    return { code: 1, signal: null };
  }
  if (data && data.error) {
    return { code: 1, signal: null };
  }
  return { code: 0, signal: null };
}

function runWithAppServerFallback(opts: any, runAppServer: (nextOpts: any) => ChildProcess, runExecJson: (nextOpts: any) => ChildProcess) {
  const supervisor = new ChildSupervisor();

  let startedTurn = false;
  let finished = false;
  let fallbackActive = false;
  let primary: ChildProcess | null = null;

  const onEventFallback = typeof opts.onEvent === "function" ? opts.onEvent : () => {};

  function stopPrimaryAfterCompletion() {
    const child = primary;
    if (!child) return;

    // app-server is long-lived; each run should end after one turn in Agent Heaven.
    setTimeout(() => {
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore
      }
      setTimeout(() => {
        try {
          if (!child.killed) child.kill("SIGKILL");
        } catch {
          // ignore
        }
      }, 1500);
    }, 0);
  }

  function finishFromTurnCompleted(data: any) {
    if (finished || fallbackActive) return;
    finished = true;
    const close = mapAppServerTurnCompletionToClose(data);
    supervisor.emit("close", close.code, close.signal);
    stopPrimaryAfterCompletion();
  }

  function startFallback(reason: string) {
    if (finished || fallbackActive) return;
    fallbackActive = true;

    onEventFallback({
      ts: nowIso(),
      stream: "stderr",
      kind: "log",
      text: `[codex] app-server unavailable (${reason}); falling back to exec --json`
    });

    let child: ChildProcess;
    try {
      child = runExecJson({ ...opts, onEvent: onEventFallback });
    } catch (err: any) {
      finished = true;
      supervisor.emit("error", err);
      return;
    }

    supervisor.setChild(child);

    child.on("error", (err: any) => {
      if (finished) return;
      finished = true;
      supervisor.emit("error", err);
    });

    child.on("close", (code: any, signal: any) => {
      if (finished) return;
      finished = true;
      supervisor.emit("close", code, signal);
    });
  }

  const onPrimaryEvent = (ev: any) => {
    if (fallbackActive) return;
    if (!ev || typeof ev !== "object") return;

    if (ev.kind === "codex" && ev.data && typeof ev.data === "object") {
      const data = ev.data as any;
      if (data.type === "turn.started") startedTurn = true;

      if (!startedTurn && data.type === "runner.error") {
        const reason = typeof data.message === "string" && data.message.trim() ? data.message.trim() : "bootstrap error";
        startFallback(reason);
        return;
      }
    }

    onEventFallback(ev);

    if (ev.kind === "codex" && ev.data && typeof ev.data === "object") {
      const data = ev.data as any;
      if (data.type === "turn.completed") finishFromTurnCompleted(data);
    }
  };

  try {
    primary = runAppServer({ ...opts, onEvent: onPrimaryEvent });
  } catch (err: any) {
    startFallback(String(err && err.message ? err.message : err));
    return supervisor as unknown as ChildProcess;
  }

  supervisor.setChild(primary);

  primary.on("error", (err: any) => {
    if (finished) return;
    if (fallbackActive) return;

    if (supervisor.killed) {
      finished = true;
      supervisor.emit("error", err);
      return;
    }

    if (!startedTurn) {
      startFallback(String(err && err.message ? err.message : err));
      return;
    }

    finished = true;
    supervisor.emit("error", err);
  });

  primary.on("close", (code: any, signal: any) => {
    if (finished) return;
    if (fallbackActive) return;

    if (supervisor.killed) {
      finished = true;
      supervisor.emit("close", code, signal);
      return;
    }

    if (!startedTurn && !fallbackActive) {
      const numericCode = typeof code === "number" ? code : null;
      if (numericCode !== 0) {
        startFallback(`exit code ${numericCode}`);
        return;
      }
    }

    finished = true;
    supervisor.emit("close", code, signal);
  });

  return supervisor as unknown as ChildProcess;
}

export function runCodexExec(opts: {
  codexPath: string;
  settings: any;
  projectPath: string;
  model: string;
  prompt: string;
  images: string[];
  onEvent: (ev: any) => void;
}) {
  const transport = normalizeCodexTransport(opts && opts.settings && (opts.settings as any).transport);
  if (transport !== "app_server") return runCodexExecJson(opts);

  return runWithAppServerFallback(
    opts,
    (nextOpts) => runCodexAppServerExec(nextOpts),
    (nextOpts) => runCodexExecJson(nextOpts)
  );
}

export function runCodexResume(opts: {
  codexPath: string;
  settings: any;
  cwd: string;
  threadId: string;
  model: string;
  prompt: string;
  images: string[];
  onEvent: (ev: any) => void;
}) {
  const transport = normalizeCodexTransport(opts && opts.settings && (opts.settings as any).transport);
  if (transport !== "app_server") return runCodexResumeJson(opts);

  return runWithAppServerFallback(
    opts,
    (nextOpts) => runCodexAppServerResume(nextOpts),
    (nextOpts) => runCodexResumeJson(nextOpts)
  );
}
