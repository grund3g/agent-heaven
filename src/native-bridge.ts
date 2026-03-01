import * as fs from "node:fs";
import * as http from "node:http";
import * as os from "node:os";
import * as path from "node:path";
import { Store } from "./store";
import { JobHistory } from "./job-history";
import { newId } from "./core/id";
import { needsAttentionHeuristic } from "./needs-attention";
import { runCodexExec, runCodexResume } from "./codex-runner";
import { runClaudeExec, runClaudeResume } from "./claude-runner";
import { runGeminiExec, runGeminiResume } from "./gemini-runner";
import { JobsManager } from "./electron/jobs-manager";
import { detectDefaultBranch } from "./electron/git";

const DEFAULT_PORT = 7788;
const MAX_BODY_BYTES = 1_000_000;

type JsonRecord = Record<string, any>;
type SseClient = { id: string; res: http.ServerResponse };

type NativeBridgeState = {
  userDataPath: string;
  storePath: string;
  jobsDir: string;
  checkoutsDir: string;
  store: Store;
  jobsManager: JobsManager;
  sseClients: Set<SseClient>;
};

function parsePort(raw: string | undefined): number {
  const n = Number(raw || "");
  if (!Number.isFinite(n)) return DEFAULT_PORT;
  const p = Math.trunc(n);
  if (p < 1 || p > 65535) return DEFAULT_PORT;
  return p;
}

function firstExistingPath(candidates: string[]): string {
  for (const candidate of candidates) {
    try {
      if (candidate && fs.existsSync(candidate)) return candidate;
    } catch {
      // ignore
    }
  }
  return candidates[0] || process.cwd();
}

function resolveUserDataPath(): string {
  const fromEnv = String(process.env.AH_USER_DATA_PATH || "").trim();
  if (fromEnv) return path.resolve(fromEnv);

  const home = os.homedir();
  const candidates = [
    path.join(home, "Library", "Application Support", "agent-heaven"),
    path.join(home, "Library", "Application Support", "Agent Heaven")
  ];
  return firstExistingPath(candidates);
}

function nowIso() {
  return new Date().toISOString();
}

function uniqueId() {
  return newId();
}

function withCors(res: http.ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function respondJson(res: http.ServerResponse, status: number, payload: unknown) {
  withCors(res);
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function safeJsonParse(s: string): any | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function readJsonBody(req: http.IncomingMessage): Promise<JsonRecord> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;

    req.on("data", (chunk) => {
      const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      total += b.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error("Request body too large"));
        return;
      }
      chunks.push(b);
    });

    req.on("end", () => {
      if (total === 0) {
        resolve({});
        return;
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      const parsed = safeJsonParse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        reject(new Error("Invalid JSON body"));
        return;
      }
      resolve(parsed as JsonRecord);
    });

    req.on("error", (err) => reject(err));
  });
}

function normalizeMethod(value: unknown): string {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function isDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function normalizeProjectInput(body: JsonRecord): { ok: boolean; error?: string; project?: any } {
  const name = String(body.name || "").trim();
  const projectPath = String(body.path || "").trim();
  if (!name) return { ok: false, error: "Project name is required" };
  if (!projectPath) return { ok: false, error: "Project path is required" };

  const resolvedPath = path.resolve(projectPath);
  if (!isDirectory(resolvedPath)) return { ok: false, error: `Project path is not a directory: ${resolvedPath}` };

  const p: any = {
    id: uniqueId(),
    name,
    path: resolvedPath,
    checkoutMode: typeof body.checkoutMode === "string" ? String(body.checkoutMode) : "inplace"
  };

  if (typeof body.shortName === "string") p.shortName = body.shortName;
  if (typeof body.color === "string") p.color = body.color;
  if (typeof body.defaultBranch === "string") p.defaultBranch = body.defaultBranch;

  return { ok: true, project: p };
}

function normalizeJobsQuery(items: any[], query: URLSearchParams): any[] {
  let out = items;
  const projectId = String(query.get("projectId") || "").trim();
  const status = String(query.get("status") || "").trim();
  const box = String(query.get("box") || "").trim();

  if (projectId) out = out.filter((j: any) => String(j.projectId || "") === projectId);
  if (status) out = out.filter((j: any) => String(j.status || "") === status);
  if (box) out = out.filter((j: any) => String(j.box || "") === box);

  const limitRaw = Number(query.get("limit") || "");
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(1000, Math.trunc(limitRaw)) : 300;
  if (out.length > limit) out = out.slice(0, limit);

  return out;
}

function routeMatch(pathname: string, re: RegExp): string[] | null {
  const m = pathname.match(re);
  if (!m) return null;
  return m.slice(1);
}

function isOkResult(value: any): boolean {
  return !!(value && typeof value === "object" && (value as any).ok === true);
}

function isErrResult(value: any): boolean {
  return !!(value && typeof value === "object" && (value as any).ok === false);
}

function sendSse(res: http.ServerResponse, event: string, payload: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcastToClients(clients: Set<SseClient>, event: string, payload: unknown) {
  for (const client of Array.from(clients)) {
    try {
      sendSse(client.res, event, payload);
    } catch {
      try {
        client.res.end();
      } catch {
        // ignore
      }
      clients.delete(client);
    }
  }
}

function createState(): NativeBridgeState {
  const userDataPath = resolveUserDataPath();
  const storePath = path.join(userDataPath, "agent-heaven.store.json");
  const jobsDir = path.join(userDataPath, "jobs");
  const checkoutsDir = path.join(userDataPath, "checkouts");

  const store = new Store(storePath);
  store.load();

  const history = new JobHistory(jobsDir);
  const sseClients = new Set<SseClient>();

  const jobsManager = new JobsManager({
    store,
    history,
    checkoutsDir,
    sendJobEvent: (payload) => {
      broadcastToClients(sseClients, "job:event", payload);
    },
    runCodexExec,
    runCodexResume,
    runClaudeExec,
    runClaudeResume,
    runGeminiExec,
    runGeminiResume,
    needsAttentionHeuristic
  });

  const state: NativeBridgeState = {
    userDataPath,
    storePath,
    jobsDir,
    checkoutsDir,
    store,
    jobsManager,
    sseClients
  };

  return state;
}

async function handleProjects(state: NativeBridgeState, req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
  const method = normalizeMethod(req.method);
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/projects") {
    respondJson(res, 200, { projects: state.store.listProjects() });
    return;
  }

  if (method === "POST" && pathname === "/projects") {
    const body = await readJsonBody(req);
    const normalized = normalizeProjectInput(body);
    if (!normalized.ok) {
      respondJson(res, 400, { ok: false, error: normalized.error || "Invalid project input" });
      return;
    }

    const project = normalized.project;
    try {
      if (!project.defaultBranch) {
        project.defaultBranch = await detectDefaultBranch(project.path);
      }
    } catch {
      // keep empty default branch
    }

    const created = state.store.addProject(project);
    respondJson(res, 200, { ok: true, project: created });
    return;
  }

  const patchMatch = routeMatch(pathname, /^\/projects\/([^/]+)$/);
  if (patchMatch && method === "PATCH") {
    const id = decodeURIComponent(patchMatch[0]);
    const body = await readJsonBody(req);
    const updated = state.store.updateProject(id, body || {});
    if (!updated) {
      respondJson(res, 404, { ok: false, error: "Project not found" });
      return;
    }
    respondJson(res, 200, { ok: true, project: updated });
    return;
  }

  if (patchMatch && method === "DELETE") {
    const id = decodeURIComponent(patchMatch[0]);
    const removed = state.store.removeProject(id);
    if (!removed) {
      respondJson(res, 404, { ok: false, error: "Project not found" });
      return;
    }
    respondJson(res, 200, { ok: true });
    return;
  }

  respondJson(res, 404, { error: "Not found" });
}

async function handleSettings(state: NativeBridgeState, req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
  const method = normalizeMethod(req.method);
  const pathname = url.pathname;

  if (pathname !== "/settings") {
    respondJson(res, 404, { error: "Not found" });
    return;
  }

  if (method === "GET") {
    respondJson(res, 200, { settings: state.store.getSettings() });
    return;
  }

  if (method === "PATCH") {
    const body = await readJsonBody(req);
    const updated = state.store.updateSettings(body || {});
    respondJson(res, 200, { ok: true, settings: updated });
    return;
  }

  respondJson(res, 405, { error: "Method not allowed" });
}

async function handleJobs(state: NativeBridgeState, req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
  const method = normalizeMethod(req.method);
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/jobs") {
    const full = String(url.searchParams.get("full") || "") === "1";
    let metas = state.jobsManager.listJobMetas();
    metas = normalizeJobsQuery(metas, url.searchParams);

    if (!full) {
      respondJson(res, 200, { count: metas.length, jobs: metas });
      return;
    }

    const jobs = metas
      .map((m: any) => state.jobsManager.getJob(m && m.id))
      .filter((r: any) => isOkResult(r))
      .map((r: any) => r.job);

    respondJson(res, 200, { count: jobs.length, jobs });
    return;
  }

  const searchMatch = routeMatch(pathname, /^\/jobs\/search$/);
  if (searchMatch && method === "GET") {
    const query = String(url.searchParams.get("q") || "");
    const found = state.jobsManager.search(query, {});
    respondJson(res, 200, found);
    return;
  }

  if (method === "POST" && pathname === "/jobs/start") {
    const body = await readJsonBody(req);
    const result = await state.jobsManager.start(body || {});
    if (isErrResult(result)) {
      respondJson(res, 400, result);
      return;
    }
    respondJson(res, 200, result);
    return;
  }

  const jobMatch = routeMatch(pathname, /^\/jobs\/([^/]+)$/);
  if (jobMatch && method === "GET") {
    const id = decodeURIComponent(jobMatch[0]);
    const got = state.jobsManager.getJob(id);
    if (isErrResult(got)) {
      respondJson(res, 404, got);
      return;
    }
    respondJson(res, 200, got);
    return;
  }

  if (jobMatch && method === "DELETE") {
    const id = decodeURIComponent(jobMatch[0]);
    const removed = state.jobsManager.delete(id);
    if (isErrResult(removed)) {
      respondJson(res, 404, removed);
      return;
    }
    respondJson(res, 200, removed);
    return;
  }

  const sendMatch = routeMatch(pathname, /^\/jobs\/([^/]+)\/send$/);
  if (sendMatch && method === "POST") {
    const id = decodeURIComponent(sendMatch[0]);
    const body = await readJsonBody(req);
    const result = await state.jobsManager.send({
      jobId: id,
      prompt: typeof body.prompt === "string" ? body.prompt : "",
      images: Array.isArray(body.images) ? body.images : [],
      missingCheckoutAction: body.missingCheckoutAction
    });
    if (isErrResult(result)) {
      respondJson(res, 400, result);
      return;
    }
    respondJson(res, 200, result);
    return;
  }

  const cancelMatch = routeMatch(pathname, /^\/jobs\/([^/]+)\/cancel$/);
  if (cancelMatch && method === "POST") {
    const id = decodeURIComponent(cancelMatch[0]);
    const ok = state.jobsManager.cancel(id);
    respondJson(res, ok ? 200 : 404, ok ? { ok: true } : { ok: false, error: "Unknown or non-running job" });
    return;
  }

  const archiveMatch = routeMatch(pathname, /^\/jobs\/([^/]+)\/archive$/);
  if (archiveMatch && method === "POST") {
    const id = decodeURIComponent(archiveMatch[0]);
    const body: JsonRecord = await readJsonBody(req).catch(() => ({} as JsonRecord));
    const reason = typeof body.reason === "string" ? String(body.reason) : "";
    const result = state.jobsManager.archive({ jobId: id, reason });
    if (isErrResult(result)) {
      respondJson(res, 400, result);
      return;
    }
    respondJson(res, 200, result);
    return;
  }

  const trashMatch = routeMatch(pathname, /^\/jobs\/([^/]+)\/trash$/);
  if (trashMatch && method === "POST") {
    const id = decodeURIComponent(trashMatch[0]);
    const result = state.jobsManager.trash(id);
    if (isErrResult(result)) {
      respondJson(res, 400, result);
      return;
    }
    respondJson(res, 200, result);
    return;
  }

  const restoreMatch = routeMatch(pathname, /^\/jobs\/([^/]+)\/restore$/);
  if (restoreMatch && method === "POST") {
    const id = decodeURIComponent(restoreMatch[0]);
    const result = state.jobsManager.restore(id);
    if (isErrResult(result)) {
      respondJson(res, 400, result);
      return;
    }
    respondJson(res, 200, result);
    return;
  }

  respondJson(res, 404, { error: "Not found" });
}

function handleEvents(state: NativeBridgeState, req: http.IncomingMessage, res: http.ServerResponse) {
  withCors(res);
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-store",
    Connection: "keep-alive"
  });

  const client: SseClient = { id: uniqueId(), res };
  state.sseClients.add(client);

  sendSse(res, "hello", {
    ok: true,
    ts: nowIso(),
    jobs: state.jobsManager.listJobMetas().length
  });

  const heartbeat = setInterval(() => {
    try {
      res.write(`event: ping\ndata: ${JSON.stringify({ ts: nowIso() })}\n\n`);
    } catch {
      // closed; handled below
    }
  }, 10_000);

  const cleanup = () => {
    clearInterval(heartbeat);
    state.sseClients.delete(client);
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);
  res.on("close", cleanup);
}

function runServer() {
  const state = createState();
  const port = parsePort(process.env.AH_BRIDGE_PORT);

  const server = http.createServer(async (req, res) => {
    const method = normalizeMethod(req.method);
    if (method === "OPTIONS") {
      withCors(res);
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", "http://127.0.0.1");
    const pathname = url.pathname;

    try {
      if (method === "GET" && pathname === "/health") {
        respondJson(res, 200, {
          ok: true,
          now: nowIso(),
          userDataPath: state.userDataPath,
          storePath: state.storePath,
          jobsDir: state.jobsDir,
          checkoutsDir: state.checkoutsDir,
          runningJobs: state.jobsManager.hasRunningJobs(),
          jobCount: state.jobsManager.listJobMetas().length
        });
        return;
      }

      if (method === "GET" && pathname === "/state") {
        respondJson(res, 200, {
          settings: state.store.getSettings(),
          projects: state.store.listProjects(),
          jobs: state.jobsManager.listJobMetas(),
          userDataPath: state.userDataPath
        });
        return;
      }

      if (pathname === "/events") {
        if (method !== "GET") {
          respondJson(res, 405, { error: "Method not allowed" });
          return;
        }
        handleEvents(state, req, res);
        return;
      }

      if (pathname.startsWith("/settings")) {
        await handleSettings(state, req, res, url);
        return;
      }

      if (pathname.startsWith("/projects")) {
        await handleProjects(state, req, res, url);
        return;
      }

      if (pathname.startsWith("/jobs")) {
        await handleJobs(state, req, res, url);
        return;
      }

      respondJson(res, 404, { error: "Not found" });
    } catch (err: any) {
      respondJson(res, 500, {
        ok: false,
        error: "Internal error",
        message: err && typeof err.message === "string" ? err.message : String(err || "unknown")
      });
    }
  });

  server.listen(port, "127.0.0.1", () => {
    process.stdout.write(`native-bridge listening on http://127.0.0.1:${port}\n`);
    process.stdout.write(`userDataPath: ${state.userDataPath}\n`);
  });
}

runServer();
