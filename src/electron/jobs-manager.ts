import type { ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { normalizeImagePaths, validateImagePaths } from "../core/images";
import { guessTitleFromPrompt, promptSummary } from "../core/prompt";
import { addUsageTotals } from "../core/usage";
import { newId } from "../core/id";
import { normalizeLoadedJob, snapshotJob, snapshotJobMeta, type Job } from "../core/jobs";
import { searchJobs, type JobSearchOpts } from "../core/job-search";
import { promptNeedsAttentionHeuristic } from "../needs-attention";
import { readCodexDefaultModelFromConfigToml } from "../codex-config";

type SendJobEvent = (payload: any) => void;

type RunCodexExec = (opts: any) => ChildProcess;
type RunCodexResume = (opts: any) => ChildProcess;
type RunClaudeExec = (opts: any) => ChildProcess;
type RunClaudeResume = (opts: any) => ChildProcess;
type NeedsAttentionHeuristic = (text: unknown) => boolean;

export class JobsManager {
  private store: any;
  private history: any;
  private sendJobEvent: SendJobEvent;
  private runCodexExec: RunCodexExec;
  private runCodexResume: RunCodexResume;
  private runClaudeExec: RunClaudeExec | null;
  private runClaudeResume: RunClaudeResume | null;
  private needsAttentionHeuristic: NeedsAttentionHeuristic;
  private createId: () => string;

  private jobs = new Map<string, Job>(); // jobId -> job
  private procs = new Map<string, ChildProcess>(); // jobId -> child process

  // Persist jobs (incl. threadId) so sessions can be viewed/resumed across restarts.
  private dirtyJobIds = new Set<string>();
  private persistTimer: NodeJS.Timeout | null = null;
  private readonly PERSIST_DELAY_MS = 650;

  constructor(opts: {
    store: any;
    history: any;
    sendJobEvent: SendJobEvent;
    runCodexExec: RunCodexExec;
    runCodexResume: RunCodexResume;
    runClaudeExec?: RunClaudeExec;
    runClaudeResume?: RunClaudeResume;
    needsAttentionHeuristic: NeedsAttentionHeuristic;
    createId?: () => string;
  }) {
    this.store = opts.store;
    this.history = opts.history;
    this.sendJobEvent = opts.sendJobEvent;
    this.runCodexExec = opts.runCodexExec;
    this.runCodexResume = opts.runCodexResume;
    this.runClaudeExec = typeof opts.runClaudeExec === "function" ? opts.runClaudeExec : null;
    this.runClaudeResume = typeof opts.runClaudeResume === "function" ? opts.runClaudeResume : null;
    this.needsAttentionHeuristic = opts.needsAttentionHeuristic;
    this.createId = typeof opts.createId === "function" ? opts.createId : newId;

    this.loadPersistedJobs();
  }

  private flushPersist() {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }

    if (this.dirtyJobIds.size === 0) return;
    const ids = Array.from(this.dirtyJobIds);
    this.dirtyJobIds.clear();

    for (const jobId of ids) {
      const job = this.jobs.get(jobId);
      if (!job) continue;
      try {
        this.history.save(snapshotJob(job));
      } catch {
        // ignore; UI should keep working even if disk is temporarily unhappy
      }
    }
  }

  shutdown() {
    this.flushPersist();
  }

  private markJobDirty(jobId: string) {
    if (!jobId) return;
    this.dirtyJobIds.add(jobId);
    if (this.persistTimer) return;
    this.persistTimer = setTimeout(() => this.flushPersist(), this.PERSIST_DELAY_MS);
  }

  private loadPersistedJobs() {
    // Load persisted jobs into memory (so renderer can list history).
    const now = new Date().toISOString();
    const fallbackModel = readCodexDefaultModelFromConfigToml();
    const loaded = this.history.loadAll();
    for (const raw of loaded) {
      const j = normalizeLoadedJob(raw, now);
      if (!j) continue;
      if (!j.model && j.agent === "codex" && fallbackModel) {
        j.model = fallbackModel;
      }
      this.jobs.set(j.id, j);
      // If we normalized a running job -> cancelled, persist the change.
      if (raw && typeof raw === "object" && (raw as any).status === "running") {
        try {
          this.history.save(snapshotJob(j));
        } catch {
          // ignore
        }
      }
    }
  }

  hasJob(jobId: string): boolean {
    const id = String(jobId || "").trim();
    if (!id) return false;
    return this.jobs.has(id);
  }

  hasRunningJobs(): boolean {
    for (const job of this.jobs.values()) {
      if (job && typeof job === "object" && job.status === "running") return true;
    }
    return false;
  }

  listJobMetas(): any[] {
    const arr = Array.from(this.jobs.values()).map(snapshotJobMeta);
    // Newest first (stable for ISO timestamps).
    arr.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return arr;
  }

  search(query: unknown, opts?: JobSearchOpts) {
    return searchJobs(this.jobs.values(), query, opts);
  }

  getJob(jobId: unknown) {
    const id = String(jobId || "");
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };
    return { ok: true, job: snapshotJob(job) };
  }

  private getCodexSettingsFrom(settings: any) {
    const s = settings && typeof settings === "object" ? settings : {};
    const agents = s.agents && typeof s.agents === "object" ? s.agents : null;
    const codex = agents && agents.codex && typeof agents.codex === "object" ? agents.codex : null;
    return codex && typeof codex === "object" ? codex : {};
  }

  private getCodexPath() {
    const settings = this.store.getSettings();
    const codex = this.getCodexSettingsFrom(settings);
    const p = (codex.path || settings.codexPath || "").trim();
    return p.length > 0 ? p : "codex";
  }

  private getClaudeSettingsFrom(settings: any) {
    const s = settings && typeof settings === "object" ? settings : {};
    const agents = s.agents && typeof s.agents === "object" ? s.agents : null;
    const claude = agents && (agents as any).claude && typeof (agents as any).claude === "object" ? (agents as any).claude : null;
    return claude && typeof claude === "object" ? claude : {};
  }

  private getClaudePath() {
    const settings = this.store.getSettings();
    const claude = this.getClaudeSettingsFrom(settings);
    const p = String((claude as any).path || "").trim();
    if (p.length > 0) return p;

    // Prefer the Claude Code local installer path if present.
    // This avoids PATH issues on macOS (Finder-launched apps) and dodges stale global npm installs.
    const local = this.getDefaultClaudeLocalInstallerPath();
    if (local) return local;

    return "claude";
  }

  private getDefaultClaudeLocalInstallerPath(): string {
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

  private normalizeAgentKey(value: unknown): "codex" | "claude" {
    const s = String(value || "")
      .trim()
      .toLowerCase();
    if (s === "claude" || s === "anthropic") return "claude";
    return "codex";
  }

  private appendLog(job: Job, entry: any) {
    job.logs.push(entry);
    // Cap memory: keep last N log entries.
    const MAX = 2000;
    if (job.logs.length > MAX) {
      job.logs.splice(0, job.logs.length - MAX);
    }
    this.markJobDirty(job.id);
  }

  private appendMessage(job: Job, msg: any) {
    job.messages.push(msg);
    const MAX = 200;
    if (job.messages.length > MAX) {
      job.messages.splice(0, job.messages.length - MAX);
    }
    this.markJobDirty(job.id);
  }

  private onCodexEvent(jobId: string, ev: any) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    if (ev.kind === "log") {
      this.appendLog(job, ev);
      this.sendJobEvent({ jobId, kind: "log", entry: ev });
      return;
    }

    if (ev.kind === "codex") {
      const data = ev.data || {};
      this.appendLog(job, ev);
      this.sendJobEvent({ jobId, kind: "codex", entry: ev });

      if (data.type === "thread.started" && data.thread_id) {
        job.threadId = data.thread_id;
        this.sendJobEvent({ jobId, kind: "meta", patch: { threadId: job.threadId } });
        this.markJobDirty(jobId);
        try {
          this.history.save(snapshotJob(job));
          this.dirtyJobIds.delete(jobId);
        } catch {
          // ignore
        }
      }

      if (data.type === "item.completed" && data.item && data.item.type === "agent_message") {
        const text = data.item.text || "";
        this.appendMessage(job, { ts: ev.ts, role: "assistant", text });
        this.sendJobEvent({ jobId, kind: "message", message: { ts: ev.ts, role: "assistant", text } });
      }

      if (data.type === "turn.completed" && data.usage) {
        job.usage = data.usage;
        job.usageTotal = addUsageTotals(job.usageTotal, data.usage);
        this.sendJobEvent({ jobId, kind: "meta", patch: { usage: job.usage, usageTotal: job.usageTotal } });
        this.markJobDirty(jobId);
      }
    }
  }

  private claudeMessageToText(message: any): string {
    if (!message || typeof message !== "object") return "";
    const content = (message as any).content;
    if (typeof content === "string") return content;
    const blocks = Array.isArray(content) ? content : [];
    const parts: string[] = [];
    for (const b of blocks) {
      if (!b || typeof b !== "object") continue;
      if ((b as any).type === "text" && typeof (b as any).text === "string") parts.push((b as any).text);
    }
    return parts.join("");
  }

  private onClaudeEvent(jobId: string, ev: any) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    if (ev.kind === "log") {
      this.appendLog(job, ev);
      this.sendJobEvent({ jobId, kind: "log", entry: ev });
      return;
    }

    if (ev.kind === "claude") {
      const data = ev.data || {};
      this.appendLog(job, ev);
      this.sendJobEvent({ jobId, kind: "claude", entry: ev });

      if (data.type === "system" && data.subtype === "init" && typeof data.session_id === "string" && data.session_id) {
        if (job.threadId !== data.session_id) {
          job.threadId = data.session_id;
          this.sendJobEvent({ jobId, kind: "meta", patch: { threadId: job.threadId } });
          this.markJobDirty(jobId);
          try {
            this.history.save(snapshotJob(job));
            this.dirtyJobIds.delete(jobId);
          } catch {
            // ignore
          }
        }
      }

      if (data.type === "assistant" && !data.parent_tool_use_id && data.message) {
        const text = this.claudeMessageToText(data.message);
        if (text) {
          this.appendMessage(job, { ts: ev.ts, role: "assistant", text });
          this.sendJobEvent({ jobId, kind: "message", message: { ts: ev.ts, role: "assistant", text } });
        }
      }

      if (data.type === "result" && data.usage) {
        job.usage = data.usage;
        job.usageTotal = addUsageTotals(job.usageTotal, data.usage);
        this.sendJobEvent({ jobId, kind: "meta", patch: { usage: job.usage, usageTotal: job.usageTotal } });
        this.markJobDirty(jobId);
      }
    }
  }

  private setJobStatus(jobId: string, status: any, extraPatch: any = {}) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.status = status;
    Object.assign(job, extraPatch);
    this.sendJobEvent({ jobId, kind: "status", patch: { status, ...extraPatch } });
    this.markJobDirty(jobId);
  }

  private wantsAttentionOnSuccess(job: Job): boolean {
    const lastAssistant = [...job.messages].reverse().find((m: any) => m.role === "assistant");
    if (this.needsAttentionHeuristic(lastAssistant ? lastAssistant.text : "")) return true;

    const settings = this.store && typeof this.store.getSettings === "function" ? this.store.getSettings() : {};
    const s = settings && typeof settings === "object" ? settings : {};
    if (!(s as any).attentionOnQuestionPrompts) return false;

    const lastPrompt = Array.isArray(job.prompts) && job.prompts.length > 0 ? job.prompts[job.prompts.length - 1] : null;
    const promptText = lastPrompt && typeof (lastPrompt as any).text === "string" ? (lastPrompt as any).text : "";
    const summary = promptSummary(promptText);
    return promptNeedsAttentionHeuristic(summary || promptText);
  }

  start(params: any) {
    const settings = this.store.getSettings();
    const codexSettings = this.getCodexSettingsFrom(settings);
    const claudeSettings = this.getClaudeSettingsFrom(settings);
    const projects = this.store.listProjects();
    const agent = this.normalizeAgentKey(params && params.agent ? params.agent : "");

    const prompt = (params && params.prompt ? String(params.prompt) : "").trim();
    if (!prompt) return { ok: false, error: "Prompt is empty" };

    const projectId = params && params.projectId ? String(params.projectId) : "";
    if (projects.length === 0) return { ok: false, error: "No projects configured. Add one in sidebar." };

    let project: any = null;
    if (!projectId) {
      if (projects.length === 1) project = projects[0];
      else return { ok: false, error: "No project selected. Pick a project (or use Auto)." };
    } else if (projectId === "auto") {
      const hay = prompt.toLowerCase();
      project = projects.find((p: any) => (p.name || "").trim() && hay.includes(p.name.toLowerCase()));
      if (!project) return { ok: false, error: "Auto project selection failed. Please select a project." };
    } else {
      project = projects.find((p: any) => p.id === projectId) || null;
      if (!project) return { ok: false, error: "Selected project not found. Refresh projects list." };
    }

    const images = normalizeImagePaths(params && params.images ? params.images : [], project.path);
    const imgErr = validateImagePaths(images);
    if (imgErr) return { ok: false, error: imgErr };

    const modelOverride = (params && params.model ? String(params.model) : "").trim();
    let model = modelOverride;
    if (!model) {
      if (agent === "claude") model = String((claudeSettings as any).model || "").trim();
      else model = String(codexSettings.model || settings.agentModel || "").trim();
    }
    if (agent === "codex" && !model) model = readCodexDefaultModelFromConfigToml();

    const threadId = agent === "claude" ? randomUUID() : "";

    const jobId = this.createId();
    const createdAt = new Date().toISOString();

    const job: Job = {
      id: jobId,
      title: guessTitleFromPrompt(prompt),
      status: "running",
      box: "board",
      archivedAt: "",
      archiveReason: "",
      trashedAt: "",
      createdAt,
      startedAt: createdAt,
      finishedAt: "",
      projectId: project.id,
      projectPath: project.path,
      agent,
      model,
      threadId,
      prompts: [{ ts: createdAt, text: prompt, images }],
      messages: [],
      logs: [],
      usage: null,
      usageTotal: { input_tokens: 0, output_tokens: 0, turns: 0 },
      exitCode: null
    };

    this.jobs.set(jobId, job);
    this.sendJobEvent({ jobId, kind: "created", job: snapshotJobMeta(job) });
    this.markJobDirty(jobId);
    try {
      this.history.save(snapshotJob(job));
      this.dirtyJobIds.delete(jobId);
    } catch {
      // ignore
    }

    let child: ChildProcess;
    try {
      if (agent === "claude") {
        if (!this.runClaudeExec) throw new Error("Claude runner not configured");
        const claudePath = this.getClaudePath();
        child = this.runClaudeExec({
          claudePath,
          settings: claudeSettings,
          projectPath: project.path,
          model,
          sessionId: threadId,
          prompt,
          onEvent: (ev: any) => this.onClaudeEvent(jobId, ev)
        });
      } else {
        const codexPath = this.getCodexPath();
        child = this.runCodexExec({
          codexPath,
          settings: codexSettings,
          projectPath: project.path,
          model,
          prompt,
          images,
          onEvent: (ev: any) => this.onCodexEvent(jobId, ev)
        });
      }
    } catch (err: any) {
      this.setJobStatus(jobId, "failed", { finishedAt: new Date().toISOString(), exitCode: -1 });
      this.appendLog(job, {
        ts: new Date().toISOString(),
        stream: "stderr",
        kind: "log",
        text: String(err && err.message ? err.message : err)
      });
      this.sendJobEvent({ jobId, kind: "log", entry: job.logs[job.logs.length - 1] });
      return { ok: true, jobId };
    }

    this.procs.set(jobId, child);

    child.on("error", (err: NodeJS.ErrnoException) => {
      this.procs.delete(jobId);
      const finishedAt = new Date().toISOString();
      job.finishedAt = finishedAt;
      job.exitCode = -1;

      const hint =
        err && err.code === "ENOENT"
          ? agent === "claude"
            ? "claude binary not found. Set Settings -> Claude path (or launch the app from a shell with claude on PATH)."
            : "codex binary not found. Set Settings -> Codex path (or launch the app from a shell with codex on PATH)."
          : agent === "claude"
            ? "failed to start claude process."
            : "failed to start codex process.";

      this.appendLog(job, {
        ts: finishedAt,
        stream: "stderr",
        kind: "log",
        text: `ERROR: ${hint} ${String(err && err.message ? err.message : err)}`
      });
      this.sendJobEvent({ jobId, kind: "log", entry: job.logs[job.logs.length - 1] });

      this.setJobStatus(jobId, "failed", { finishedAt, exitCode: -1 });
    });

    child.on("close", (code: any, signal: any) => {
      this.procs.delete(jobId);
      const finishedAt = new Date().toISOString();

      const j = this.jobs.get(jobId);
      if (!j) return;
      j.finishedAt = finishedAt;
      j.exitCode = typeof code === "number" ? code : null;

      const wantsAttention = this.wantsAttentionOnSuccess(j);

      if (signal) {
        this.setJobStatus(jobId, "cancelled", { finishedAt, exitCode: code });
      } else if (code !== 0) {
        this.setJobStatus(jobId, "failed", { finishedAt, exitCode: code });
      } else if (wantsAttention) {
        this.setJobStatus(jobId, "needs_attention", { finishedAt, exitCode: code });
      } else {
        this.setJobStatus(jobId, "done", { finishedAt, exitCode: code });
      }
    });

    return { ok: true, jobId };
  }

  send(params: { jobId: string; prompt: string; images?: any }) {
    const jobId = params && params.jobId ? String(params.jobId) : "";
    const job = this.jobs.get(jobId);
    if (!job) return { ok: false, error: "Unknown job" };
    if (job.status === "running") return { ok: false, error: "Job is running" };
    if (!job.threadId) return { ok: false, error: "No thread id for this job yet" };

    // Resuming a job should bring it back onto the board so it's visible while running.
    if (job.box && job.box !== "board") {
      job.box = "board";
      job.archivedAt = "";
      job.archiveReason = "";
      job.trashedAt = "";
      this.sendJobEvent({
        jobId,
        kind: "meta",
        patch: { box: job.box, archivedAt: job.archivedAt, archiveReason: job.archiveReason, trashedAt: job.trashedAt }
      });
      this.markJobDirty(jobId);
    }

    const settings = this.store.getSettings();
    const codexSettings = this.getCodexSettingsFrom(settings);
    const claudeSettings = this.getClaudeSettingsFrom(settings);
    const agent = this.normalizeAgentKey(job.agent);
    let model = (job.model || (agent === "claude" ? String((claudeSettings as any).model || "") : String(codexSettings.model || settings.agentModel || "")) || "").trim();
    if (agent === "codex" && !model) model = readCodexDefaultModelFromConfigToml();
    const text = String(params && params.prompt ? params.prompt : "").trim();
    if (!text) return { ok: false, error: "Prompt is empty" };

    const images = normalizeImagePaths((params && (params as any).images) || [], job.projectPath);
    const imgErr = validateImagePaths(images);
    if (imgErr) return { ok: false, error: imgErr };

    const ts = new Date().toISOString();
    job.prompts.push({ ts, text, images });
    const meta = snapshotJobMeta(job);
    this.sendJobEvent({ jobId, kind: "meta", patch: { prompts: job.prompts, promptPreview: meta.promptPreview } });
    this.markJobDirty(jobId);
    try {
      this.history.save(snapshotJob(job));
      this.dirtyJobIds.delete(jobId);
    } catch {
      // ignore
    }

    if (agent === "claude" && !this.runClaudeResume) return { ok: false, error: "Claude runner not configured" };

    this.setJobStatus(jobId, "running", { startedAt: ts, finishedAt: "" });

    let child: ChildProcess;
    if (agent === "claude") {
      const claudePath = this.getClaudePath();
      child = this.runClaudeResume!({
        claudePath,
        settings: claudeSettings,
        cwd: job.projectPath || process.cwd(),
        sessionId: job.threadId,
        model,
        prompt: text,
        onEvent: (ev: any) => this.onClaudeEvent(jobId, ev)
      });
    } else {
      const codexPath = this.getCodexPath();
      child = this.runCodexResume({
        codexPath,
        settings: codexSettings,
        cwd: job.projectPath || process.cwd(),
        threadId: job.threadId,
        model,
        prompt: text,
        images,
        onEvent: (ev: any) => this.onCodexEvent(jobId, ev)
      });
    }
    this.procs.set(jobId, child);

    child.on("error", (err: NodeJS.ErrnoException) => {
      this.procs.delete(jobId);
      const finishedAt = new Date().toISOString();
      job.finishedAt = finishedAt;
      job.exitCode = -1;

      const hint =
        err && err.code === "ENOENT"
          ? agent === "claude"
            ? "claude binary not found. Set Settings -> Claude path (or launch the app from a shell with claude on PATH)."
            : "codex binary not found. Set Settings -> Codex path (or launch the app from a shell with codex on PATH)."
          : agent === "claude"
            ? "failed to start claude process."
            : "failed to start codex process.";

      this.appendLog(job, {
        ts: finishedAt,
        stream: "stderr",
        kind: "log",
        text: `ERROR: ${hint} ${String(err && err.message ? err.message : err)}`
      });
      this.sendJobEvent({ jobId, kind: "log", entry: job.logs[job.logs.length - 1] });

      this.setJobStatus(jobId, "failed", { finishedAt, exitCode: -1 });
    });

    child.on("close", (code: any, signal: any) => {
      this.procs.delete(jobId);
      const finishedAt = new Date().toISOString();
      job.finishedAt = finishedAt;
      job.exitCode = typeof code === "number" ? code : null;

      const wantsAttention = this.wantsAttentionOnSuccess(job);

      if (signal) {
        this.setJobStatus(jobId, "cancelled", { finishedAt, exitCode: code });
      } else if (code !== 0) {
        this.setJobStatus(jobId, "failed", { finishedAt, exitCode: code });
      } else if (wantsAttention) {
        this.setJobStatus(jobId, "needs_attention", { finishedAt, exitCode: code });
      } else {
        this.setJobStatus(jobId, "done", { finishedAt, exitCode: code });
      }
    });

    return { ok: true };
  }

  archive(params: { jobId: string; reason?: string }) {
    const jobId = params && params.jobId ? String(params.jobId) : "";
    const job = this.jobs.get(jobId);
    if (!job) return { ok: false, error: "Unknown job" };
    if (job.status === "running") return { ok: false, error: "Job is running" };

    const ts = new Date().toISOString();
    job.box = "archive";
    job.archivedAt = ts;
    job.archiveReason = "archived";
    job.trashedAt = "";

    this.sendJobEvent({
      jobId,
      kind: "meta",
      patch: { box: job.box, archivedAt: job.archivedAt, archiveReason: job.archiveReason, trashedAt: job.trashedAt }
    });
    this.markJobDirty(jobId);
    try {
      this.history.save(snapshotJob(job));
      this.dirtyJobIds.delete(jobId);
    } catch {
      // ignore
    }

    return { ok: true };
  }

  trash(jobId: unknown) {
    const id = String(jobId || "");
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };
    if (job.status === "running") return { ok: false, error: "Job is running" };

    const ts = new Date().toISOString();
    job.box = "trash";
    job.trashedAt = ts;
    job.archivedAt = "";
    job.archiveReason = "";

    this.sendJobEvent({
      jobId: id,
      kind: "meta",
      patch: { box: job.box, archivedAt: job.archivedAt, archiveReason: job.archiveReason, trashedAt: job.trashedAt }
    });
    this.markJobDirty(id);
    try {
      this.history.save(snapshotJob(job));
      this.dirtyJobIds.delete(id);
    } catch {
      // ignore
    }

    return { ok: true };
  }

  restore(jobId: unknown) {
    const id = String(jobId || "");
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };

    job.box = "board";
    job.archivedAt = "";
    job.archiveReason = "";
    job.trashedAt = "";

    this.sendJobEvent({
      jobId: id,
      kind: "meta",
      patch: { box: job.box, archivedAt: job.archivedAt, archiveReason: job.archiveReason, trashedAt: job.trashedAt }
    });
    this.markJobDirty(id);
    try {
      this.history.save(snapshotJob(job));
      this.dirtyJobIds.delete(id);
    } catch {
      // ignore
    }

    return { ok: true };
  }

  delete(jobId: unknown) {
    const id = String(jobId || "");
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };
    if (job.status === "running") return { ok: false, error: "Job is running" };

    this.jobs.delete(id);
    this.procs.delete(id);
    this.dirtyJobIds.delete(id);
    try {
      this.history.remove(id);
    } catch {
      // ignore
    }
    this.sendJobEvent({ jobId: id, kind: "deleted" });
    return { ok: true };
  }

  cancel(jobId: unknown) {
    const id = String(jobId || "");
    const child = this.procs.get(id);
    if (!child) return false;
    try {
      child.kill("SIGTERM");
      setTimeout(() => {
        try {
          if (!child.killed) child.kill("SIGKILL");
        } catch {
          // ignore
        }
      }, 2500);
      return true;
    } catch {
      return false;
    }
  }
}
