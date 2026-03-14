import { jobDisplayTitle, promptSummary } from "./prompt";
import { addUsageTotals, toIntOrZero, type UsageTotals } from "./usage";

export type JobBox = "board" | "archive" | "trash";
export type JobStatus = "running" | "done" | "failed" | "cancelled" | "needs_attention" | "unknown";
export type JobRunMode = "single" | "war_room";

<<<<<<< HEAD
export type JobPrompt = { id?: string; ts: string; text: string; images?: string[]; preparedText?: string };
export type JobMessage = { ts: string; role: "assistant" | "user" | string; text: string; promptId?: string };
=======
export type JobPrompt = { ts: string; text: string; images?: string[]; preparedText?: string };
export type JobMessage = { ts: string; role: "assistant" | "user" | string; text: string; agent?: string };
>>>>>>> 9bce34b (fix(jobs): align renderer UI with jobs manager updates)
export type JobLogEntry =
  | { ts: string; stream: "stdout" | "stderr"; kind: "log"; text: string }
  | { ts: string; stream: "stdout" | "stderr"; kind: "codex"; data: any }
  | { ts: string; stream: "stdout" | "stderr"; kind: "claude"; data: any }
  | { ts: string; stream: "stdout" | "stderr"; kind: "gemini"; data: any };
export type JobAgentInspector = {
  id: string;
  agent: string;
  role: string;
  phase: string;
  status: string;
  model: string;
  threadId: string;
  startedAt: string;
  updatedAt: string;
  finishedAt: string;
  lastEvent: string;
  lastText: string;
  exitCode: number | null;
};
export type JobProcessBinding = {
  connectorId: string;
  capability: string;
  resourceType: string;
  resourceId: string;
  externalRef: string;
  url?: string;
  title?: string;
  metadata?: Record<string, any>;
};
export type JobProcessEvent = {
  ts: string;
  connectorId: string;
  level: "info" | "warning" | "error";
  text: string;
};

export type Job = {
  id: string;
  title: string;
  // Optional LLM-generated title (preferred for display if present).
  titleLlm?: string;
  mode?: JobRunMode;
  status: JobStatus;
  box: JobBox;
  archivedAt: string;
  archiveReason: string;
  trashedAt: string;
  integratedToDefaultAt: string;
  integratedToDefaultBranch: string;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
  projectId: string;
  projectPath: string;
  checkoutModePreference?: string;
  checkoutModeEffective?: string;
  agent: string;
  model: string;
  threadId: string;
  prompts: JobPrompt[];
  queuedPrompts: JobPrompt[];
  messages: JobMessage[];
  logs: JobLogEntry[];
  agentInspectors?: JobAgentInspector[];
  processBindings?: JobProcessBinding[];
  processEvents?: JobProcessEvent[];
  usage: any;
  usageTotal: UsageTotals;
  modelContextWindow?: number | null;
  exitCode: number | null;
};

function normalizeJobRunMode(value: unknown): JobRunMode {
  const s = String(value || "")
    .trim()
    .toLowerCase();
  if (s === "war_room" || s === "war-room" || s === "warroom") return "war_room";
  return "single";
}

function safeIso(s: unknown): string {
  const t = typeof s === "string" ? s : "";
  return t && t.length >= 10 ? t : "";
}

function normalizePrompt(value: unknown): JobPrompt {
  const raw = value && typeof value === "object" ? { ...(value as any) } : {};
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (id) raw.id = id;
  else delete raw.id;
  return raw as JobPrompt;
}

function normalizeMessage(value: unknown): JobMessage {
  const raw = value && typeof value === "object" ? { ...(value as any) } : {};
  const promptId = typeof raw.promptId === "string" ? raw.promptId.trim() : "";
  if (promptId) raw.promptId = promptId;
  else delete raw.promptId;
  return raw as JobMessage;
}

export function sanitizeJobModel(value: unknown): string {
  if (typeof value !== "string") return "";
  const t = value.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t === "synthetic" || /^<[^>\r\n]+>$/.test(t)) return "";
  return t.length > 160 ? t.slice(0, 160) : t;
}

export function normalizeLoadedJob(job: unknown, nowIso: string): Job | null {
  if (!job || typeof job !== "object") return null;
  const id = typeof (job as any).id === "string" ? (job as any).id : "";
  if (!id) return null;

  const out: any = { ...(job as any), id };

  out.title = typeof out.title === "string" ? out.title : "";
  out.titleLlm = typeof out.titleLlm === "string" ? out.titleLlm : "";
  out.mode = normalizeJobRunMode(out.mode);
  out.status = typeof out.status === "string" ? out.status : "unknown";

  out.box = typeof out.box === "string" ? out.box : "board";
  if (out.box !== "board" && out.box !== "archive" && out.box !== "trash") out.box = "board";
  out.archivedAt = safeIso(out.archivedAt) || "";
  // Migration: older builds used archiveReason="dismissed" for "Not needed".
  // The UI no longer distinguishes this, so treat all archived jobs uniformly.
  out.archiveReason = out.box === "archive" ? "archived" : "";
  out.trashedAt = safeIso(out.trashedAt) || "";
  out.integratedToDefaultAt = safeIso(out.integratedToDefaultAt) || "";
  out.integratedToDefaultBranch = typeof out.integratedToDefaultBranch === "string" ? out.integratedToDefaultBranch : "";
  if (!out.integratedToDefaultAt) out.integratedToDefaultBranch = "";

  out.createdAt = safeIso(out.createdAt) || nowIso;
  out.startedAt = safeIso(out.startedAt) || out.createdAt;
  out.finishedAt = safeIso(out.finishedAt) || "";

  out.projectId = typeof out.projectId === "string" ? out.projectId : "";
  out.projectPath = typeof out.projectPath === "string" ? out.projectPath : "";
  out.checkoutModePreference = typeof out.checkoutModePreference === "string" ? out.checkoutModePreference : "";
  out.checkoutModeEffective = typeof out.checkoutModeEffective === "string" ? out.checkoutModeEffective : "";
  // Migration/default: historical jobs were Codex-only.
  out.agent = typeof out.agent === "string" ? out.agent : "codex";
  out.model = sanitizeJobModel(out.model);
  out.threadId = typeof out.threadId === "string" ? out.threadId : "";

  out.prompts = Array.isArray(out.prompts) ? out.prompts.map(normalizePrompt) : [];
  out.queuedPrompts = Array.isArray(out.queuedPrompts) ? out.queuedPrompts.map(normalizePrompt) : [];
  out.messages = Array.isArray(out.messages) ? out.messages.map(normalizeMessage) : [];
  out.logs = Array.isArray(out.logs) ? out.logs : [];
  out.agentInspectors = Array.isArray(out.agentInspectors) ? out.agentInspectors : [];
  out.processBindings = Array.isArray(out.processBindings) ? out.processBindings : [];
  out.processEvents = Array.isArray(out.processEvents) ? out.processEvents : [];
  if (!out.title) out.title = jobTitleFromPrompts(out.prompts);

  out.usage = out.usage && typeof out.usage === "object" ? out.usage : null;
  {
    const ut = out.usageTotal && typeof out.usageTotal === "object" ? out.usageTotal : {};
    out.usageTotal = {
      input_tokens: toIntOrZero((ut as any).input_tokens),
      output_tokens: toIntOrZero((ut as any).output_tokens),
      turns: toIntOrZero((ut as any).turns)
    };
  }
  {
    const mcw = toIntOrZero((out as any).modelContextWindow);
    out.modelContextWindow = mcw > 0 ? mcw : null;
  }
  out.exitCode = typeof out.exitCode === "number" || out.exitCode === null ? out.exitCode : null;

  // If the app died/restarted mid-run, there is no process to attach to anymore.
  if (out.status === "running") {
    out.status = "cancelled";
    if (!out.finishedAt) out.finishedAt = nowIso;
    out.logs.push({
      ts: nowIso,
      stream: "stderr",
      kind: "log",
      text: "NOTE: App restarted while this job was running; marked as cancelled."
    });
  }

  // Keep caps consistent with in-memory logic.
  if (out.logs.length > 2000) out.logs.splice(0, out.logs.length - 2000);
  if (out.agentInspectors.length > 12) out.agentInspectors.splice(0, out.agentInspectors.length - 12);
  if (out.messages.length > 200) out.messages.splice(0, out.messages.length - 200);
  if (out.queuedPrompts.length > 50) out.queuedPrompts.splice(0, out.queuedPrompts.length - 50);
  if (out.processBindings.length > 200) out.processBindings.splice(0, out.processBindings.length - 200);
  if (out.processEvents.length > 500) out.processEvents.splice(0, out.processEvents.length - 500);

  return out as Job;
}

export function snapshotJob(job: Job): Job {
  // Ensure we don't accidentally serialize huge objects or child process handles.
  const {
    id,
    title,
    titleLlm,
    mode,
    status,
    box,
    archivedAt,
    archiveReason,
    trashedAt,
    integratedToDefaultAt,
    integratedToDefaultBranch,
    createdAt,
    startedAt,
    finishedAt,
    projectId,
    projectPath,
    checkoutModePreference,
    checkoutModeEffective,
    agent,
    model,
    threadId,
    prompts,
    queuedPrompts,
    messages,
    logs,
    agentInspectors,
    processBindings,
    processEvents,
    usage,
    usageTotal,
    modelContextWindow,
    exitCode
  } = job;
  return {
    id,
    title,
    titleLlm,
    mode,
    status,
    box,
    archivedAt,
    archiveReason,
    trashedAt,
    integratedToDefaultAt,
    integratedToDefaultBranch,
    createdAt,
    startedAt,
    finishedAt,
    projectId,
    projectPath,
    checkoutModePreference,
    checkoutModeEffective,
    agent,
    model: sanitizeJobModel(model),
    threadId,
    prompts,
    queuedPrompts,
    messages,
    logs,
    agentInspectors,
    processBindings,
    processEvents,
    usage,
    usageTotal,
    modelContextWindow,
    exitCode
  };
}

function truncatePreviewText(value: unknown, maxChars: unknown): string {
  const s = typeof value === "string" ? value.trimEnd() : "";
  if (!s) return "";
  const max = Math.max(0, Number(maxChars) || 0);
  if (!max || s.length <= max) return s;
  return `${s.slice(0, max).trimEnd()}...`;
}

function jobPreviewText(job: Job): string {
  if (!job || typeof job !== "object") return "";

  const msgs = Array.isArray(job.messages) ? job.messages : [];
  const msgStart = Math.max(0, msgs.length - 50);
  for (let i = msgs.length - 1; i >= msgStart; i -= 1) {
    const m: any = msgs[i];
    if (!m || m.role !== "assistant") continue;
    const t = typeof m.text === "string" ? m.text.trim() : "";
    if (t) return truncatePreviewText(t, 900);
  }

  const logs = Array.isArray(job.logs) ? job.logs : [];
  const logStart = Math.max(0, logs.length - 80);
  for (let i = logs.length - 1; i >= logStart; i -= 1) {
    const l: any = logs[i];
    if (!l || l.kind !== "log") continue;
    const t = typeof l.text === "string" ? l.text.trim() : "";
    if (t) return truncatePreviewText(t, 300);
  }

  return "";
}

function jobPromptPreview(job: Job): string {
  if (!job || typeof job !== "object") return "";
  const prompts = Array.isArray(job.prompts) ? job.prompts : [];
  for (let i = prompts.length - 1; i >= 0; i -= 1) {
    const p: any = prompts[i];
    const t = p && typeof p.text === "string" ? p.text.trimEnd() : "";
    if (t) return truncatePreviewText(t, 900);
  }
  return "";
}

export function snapshotJobMeta(job: Job): any {
  const {
    id,
    status,
    box,
    archivedAt,
    archiveReason,
    trashedAt,
    integratedToDefaultAt,
    integratedToDefaultBranch,
    createdAt,
    startedAt,
    finishedAt,
    projectId,
    projectPath,
    mode,
    agent,
    model,
    threadId,
    usage,
    usageTotal,
    modelContextWindow,
    exitCode
  } = job;

  return {
    id,
    title: jobDisplayTitle(job),
    promptPreview: jobPromptPreview(job),
    status,
    box,
    archivedAt,
    archiveReason,
    trashedAt,
    integratedToDefaultAt,
    integratedToDefaultBranch,
    createdAt,
    startedAt,
    finishedAt,
    projectId,
    projectPath,
    mode,
    agent,
    model,
    threadId,
    agentInspectors: Array.isArray(job.agentInspectors) ? job.agentInspectors : [],
    processBindingCount: Array.isArray(job.processBindings) ? job.processBindings.length : 0,
    queuedCount: Array.isArray(job.queuedPrompts) ? job.queuedPrompts.length : 0,
    usage,
    usageTotal,
    modelContextWindow,
    exitCode,
    previewText: jobPreviewText(job)
  };
}

export function jobTitleFromPrompts(prompts: unknown): string {
  const arr = Array.isArray(prompts) ? prompts : [];
  for (const p of arr) {
    const text = p && typeof p === "object" && typeof (p as any).text === "string" ? (p as any).text : "";
    const s = promptSummary(text);
    if (s) return s;
  }
  return "";
}

export { addUsageTotals };
