import { spawnPlatform } from "./platform-spawn";

function nowIso() {
  return new Date().toISOString();
}

function looksLikeJsonObjectLine(line: string) {
  const s = String(line || "").trimStart();
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

function toPositiveInt(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  const i = Math.trunc(n);
  return i > 0 ? i : 0;
}

function toIntOrZero(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

function pushAppServerConfigArgs(args: string[], settings: any) {
  const s = settings && typeof settings === "object" ? settings : {};

  // Keep parity with exec-mode settings where feasible.
  if (s.skipGitRepoCheck) args.push("-c", "skip_git_repo_check=true");

  const color = typeof s.color === "string" ? s.color.trim() : "";
  if (color && color !== "auto") args.push("-c", `color=${JSON.stringify(color)}`);
}

function mapSandbox(settings: any): string | null {
  const s = settings && typeof settings === "object" ? settings : {};
  if (s.bypassApprovalsAndSandbox) return "danger-full-access";
  const raw = typeof s.sandboxMode === "string" ? s.sandboxMode.trim() : "";
  if (!raw) return null;
  if (raw === "read-only" || raw === "workspace-write" || raw === "danger-full-access") return raw;
  return null;
}

function mapApproval(settings: any): string | null {
  const s = settings && typeof settings === "object" ? settings : {};
  if (s.bypassApprovalsAndSandbox) return "never";
  return null;
}

function buildTurnInput(prompt: string, images: unknown): any[] {
  const out: any[] = [{ type: "text", text: String(prompt || ""), text_elements: [] }];
  const arr = Array.isArray(images) ? images : [];
  for (const img of arr) {
    const p = typeof img === "string" ? img.trim() : "";
    if (!p) continue;
    out.push({ type: "localImage", path: p });
  }
  return out;
}

function mapThreadItemToLegacy(item: any) {
  const it = item && typeof item === "object" ? item : {};
  const type = typeof it.type === "string" ? it.type : "";

  if (type === "agentMessage") {
    return {
      id: it.id || "",
      type: "agent_message",
      text: typeof it.text === "string" ? it.text : ""
    };
  }

  if (type === "commandExecution") {
    return {
      id: it.id || "",
      type: "command_execution",
      command: typeof it.command === "string" ? it.command : "",
      cwd: typeof it.cwd === "string" ? it.cwd : "",
      aggregated_output: typeof it.aggregatedOutput === "string" ? it.aggregatedOutput : "",
      exit_code: typeof it.exitCode === "number" ? it.exitCode : null,
      duration_ms: typeof it.durationMs === "number" ? it.durationMs : null,
      status: typeof it.status === "string" ? it.status : ""
    };
  }

  if (type === "reasoning") {
    return {
      id: it.id || "",
      type: "reasoning",
      text: Array.isArray(it.content) ? it.content.join("\n") : "",
      summary: Array.isArray(it.summary) ? it.summary : []
    };
  }

  if (type === "plan") {
    return {
      id: it.id || "",
      type: "plan",
      text: typeof it.text === "string" ? it.text : ""
    };
  }

  if (type === "webSearch") {
    return {
      id: it.id || "",
      type: "web_search",
      query: typeof it.query === "string" ? it.query : ""
    };
  }

  if (type === "contextCompaction") {
    return {
      id: it.id || "",
      type: "context_compaction"
    };
  }

  return {
    id: it.id || "",
    type: typeof type === "string" && type ? type : "unknown"
  };
}

function normalizeUsageBreakdown(raw: any) {
  const r = raw && typeof raw === "object" ? raw : {};
  return {
    input_tokens: toIntOrZero((r as any).inputTokens),
    cached_input_tokens: toIntOrZero((r as any).cachedInputTokens),
    output_tokens: toIntOrZero((r as any).outputTokens),
    reasoning_output_tokens: toIntOrZero((r as any).reasoningOutputTokens),
    total_tokens: toIntOrZero((r as any).totalTokens)
  };
}

function mapTurnStatus(status: unknown) {
  const s = typeof status === "string" ? status : "";
  if (s === "inProgress") return "in_progress";
  return s;
}

type Pending = { resolve: (value: any) => void; reject: (err: Error) => void };

type SharedOpts = {
  codexPath: string;
  settings: any;
  cwd: string;
  model: string;
  prompt: string;
  images: string[];
  onEvent: (ev: any) => void;
};

type ModeOpts =
  | ({ mode: "exec"; projectPath: string } & SharedOpts)
  | ({ mode: "resume"; threadId: string } & SharedOpts);

function runCodexViaAppServer(opts: ModeOpts) {
  const {
    codexPath,
    settings,
    cwd,
    model,
    prompt,
    images,
    onEvent,
    mode
  } = opts as ModeOpts;

  const args = ["app-server"];
  pushAppServerConfigArgs(args, settings);

  const child = spawnPlatform(codexPath, args, {
    cwd: cwd || process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env
  });

  let exited = false;
  let nextId = 1;
  const pendingById = new Map<string, Pending>();

  let currentThreadId = mode === "resume" ? String((opts as any).threadId || "") : "";
  const usageByTurnId = new Map<string, any>();
  let latestModelContextWindow = 0;

  function rejectAll(err: Error) {
    for (const p of pendingById.values()) p.reject(err);
    pendingById.clear();
  }

  function emitLog(stream: "stdout" | "stderr", text: string) {
    const t = String(text || "");
    if (!t.trim()) return;
    onEvent({ ts: nowIso(), stream, kind: "log", text: t });
  }

  function emitCodex(data: any, stream: "stdout" | "stderr" = "stdout") {
    onEvent({ ts: nowIso(), stream, kind: "codex", data });
  }

  child.on("exit", (code) => {
    exited = true;
    if (pendingById.size > 0) rejectAll(new Error(`codex app-server exited early (code=${typeof code === "number" ? code : "?"})`));
  });
  child.on("error", (err: any) => {
    rejectAll(new Error(String(err && err.message ? err.message : err)));
  });

  function request(method: string, params: any, timeoutMs = 25_000): Promise<any> {
    const id = String(nextId++);

    if (!child.stdin.writable) return Promise.reject(new Error("codex app-server stdin is not writable"));

    child.stdin.write(`${JSON.stringify({ id, method, params })}\n`);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingById.delete(id);
        reject(new Error(`Timed out waiting for ${method} response`));
      }, timeoutMs);

      pendingById.set(id, {
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

  function handleNotification(msg: any) {
    const method = typeof msg.method === "string" ? msg.method : "";
    const params = msg && typeof msg.params === "object" ? msg.params : {};

    if (method === "thread/started") {
      const thread = (params as any).thread && typeof (params as any).thread === "object" ? (params as any).thread : {};
      const tid = typeof thread.id === "string" ? thread.id : "";
      if (tid) currentThreadId = tid;
      emitCodex({ type: "thread.started", thread_id: tid || currentThreadId || "" });
      return;
    }

    if (method === "turn/started") {
      emitCodex({ type: "turn.started" });
      return;
    }

    if (method === "item/started") {
      const item = mapThreadItemToLegacy((params as any).item);
      emitCodex({ type: "item.started", item, thread_id: (params as any).threadId || currentThreadId || "", turn_id: (params as any).turnId || "" });
      return;
    }

    if (method === "item/completed") {
      const item = mapThreadItemToLegacy((params as any).item);
      emitCodex({ type: "item.completed", item, thread_id: (params as any).threadId || currentThreadId || "", turn_id: (params as any).turnId || "" });
      return;
    }

    if (method === "thread/tokenUsage/updated") {
      const tokenUsage = (params as any).tokenUsage && typeof (params as any).tokenUsage === "object" ? (params as any).tokenUsage : {};
      const threadId = typeof (params as any).threadId === "string" ? (params as any).threadId : currentThreadId || "";
      const turnId = typeof (params as any).turnId === "string" ? (params as any).turnId : "";

      const last = normalizeUsageBreakdown((tokenUsage as any).last);
      const total = normalizeUsageBreakdown((tokenUsage as any).total);
      const mcw = toPositiveInt((tokenUsage as any).modelContextWindow);
      if (turnId) usageByTurnId.set(turnId, last);
      if (mcw > 0) latestModelContextWindow = mcw;

      emitCodex({
        type: "token.usage.updated",
        thread_id: threadId,
        turn_id: turnId,
        usage: last,
        usage_total: total,
        model_context_window: mcw > 0 ? mcw : null
      });
      return;
    }

    if (method === "turn/completed") {
      const turn = (params as any).turn && typeof (params as any).turn === "object" ? (params as any).turn : {};
      const turnId = typeof turn.id === "string" ? turn.id : typeof (params as any).turnId === "string" ? (params as any).turnId : "";
      const usage = turnId ? usageByTurnId.get(turnId) || null : null;
      emitCodex({
        type: "turn.completed",
        thread_id: (params as any).threadId || currentThreadId || "",
        turn_id: turnId,
        status: mapTurnStatus((turn as any).status),
        error: (turn as any).error || null,
        usage,
        model_context_window: latestModelContextWindow > 0 ? latestModelContextWindow : null
      });
      return;
    }

    if (method === "error") {
      const errObj = (params as any).error && typeof (params as any).error === "object" ? (params as any).error : {};
      const message = typeof errObj.message === "string" ? errObj.message : "app-server error";
      emitCodex({ type: "error", message, error: errObj }, "stderr");
      return;
    }
  }

  function handleMessage(msg: any, stream: "stdout" | "stderr") {
    if (!msg || typeof msg !== "object") return;

    if (Object.prototype.hasOwnProperty.call(msg, "id")) {
      const id = String((msg as any).id || "");
      if (!id) return;
      const pending = pendingById.get(id);
      if (!pending) return;
      pendingById.delete(id);

      if (Object.prototype.hasOwnProperty.call(msg, "result")) {
        pending.resolve((msg as any).result);
        return;
      }

      if (Object.prototype.hasOwnProperty.call(msg, "error")) {
        const e = (msg as any).error || {};
        const m = typeof e.message === "string" && e.message.trim() ? e.message.trim() : "Request failed";
        pending.reject(new Error(m));
      }
      return;
    }

    if (Object.prototype.hasOwnProperty.call(msg, "method")) {
      handleNotification(msg);
      return;
    }

    emitLog(stream, JSON.stringify(msg));
  }

  attachLineStream(child.stdout, (line) => {
    const msg = parseJsonLine(line);
    if (!msg) {
      emitLog("stdout", line);
      return;
    }
    handleMessage(msg, "stdout");
  });
  attachLineStream(child.stderr, (line) => {
    const msg = parseJsonLine(line);
    if (!msg) {
      emitLog("stderr", line);
      return;
    }
    handleMessage(msg, "stderr");
  });

  (async () => {
    try {
      await request("initialize", {
        clientInfo: { name: "agent-heaven", version: process.env.npm_package_version || "0.0.0" },
        capabilities: { experimentalApi: true }
      });

      const sandbox = mapSandbox(settings);
      const approval = mapApproval(settings);

      if (mode === "exec") {
        const res = await request("thread/start", {
          model: model || null,
          cwd: (opts as any).projectPath || cwd || process.cwd(),
          approvalPolicy: approval,
          sandbox,
          experimentalRawEvents: false
        });
        const t = res && typeof res === "object" ? (res as any).thread : null;
        const threadId = t && typeof t === "object" && typeof (t as any).id === "string" ? (t as any).id : "";
        if (threadId) currentThreadId = threadId;

        await request("turn/start", {
          threadId: currentThreadId,
          input: buildTurnInput(prompt, images)
        });
      } else {
        await request("thread/resume", {
          threadId: (opts as any).threadId,
          model: model || null,
          cwd: cwd || process.cwd(),
          approvalPolicy: approval,
          sandbox
        });

        await request("turn/start", {
          threadId: (opts as any).threadId,
          input: buildTurnInput(prompt, images)
        });
      }
    } catch (err: any) {
      const msg = String(err && err.message ? err.message : err);
      emitLog("stderr", `codex app-server bootstrap failed: ${msg}`);
      emitCodex({ type: "runner.error", message: msg }, "stderr");
      try {
        if (!exited) child.kill("SIGTERM");
      } catch {
        // ignore
      }
    }
  })();

  return child;
}

export function runCodexAppServerExec(opts: {
  codexPath: string;
  settings: any;
  projectPath: string;
  model: string;
  prompt: string;
  images: string[];
  onEvent: (ev: any) => void;
}) {
  const projectPath = String(opts && opts.projectPath ? opts.projectPath : "");
  return runCodexViaAppServer({
    mode: "exec",
    codexPath: opts.codexPath,
    settings: opts.settings,
    projectPath,
    cwd: projectPath || process.cwd(),
    model: opts.model,
    prompt: opts.prompt,
    images: Array.isArray(opts.images) ? opts.images : [],
    onEvent: opts.onEvent
  });
}

export function runCodexAppServerResume(opts: {
  codexPath: string;
  settings: any;
  cwd: string;
  threadId: string;
  model: string;
  prompt: string;
  images: string[];
  onEvent: (ev: any) => void;
}) {
  const cwd = String(opts && opts.cwd ? opts.cwd : "");
  return runCodexViaAppServer({
    mode: "resume",
    codexPath: opts.codexPath,
    settings: opts.settings,
    threadId: String(opts && opts.threadId ? opts.threadId : ""),
    cwd: cwd || process.cwd(),
    model: opts.model,
    prompt: opts.prompt,
    images: Array.isArray(opts.images) ? opts.images : [],
    onEvent: opts.onEvent
  });
}
