import type { ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { normalizeImagePaths, validateImagePaths } from "../core/images";
import { promptSummary } from "../core/prompt";
import { oneLine, truncateText } from "../core/text";
import { addUsageTotals, toIntOrZero } from "../core/usage";
import { newId } from "../core/id";
import { normalizeLoadedJob, snapshotJob, snapshotJobMeta, type Job } from "../core/jobs";
import { searchJobs, type JobSearchOpts } from "../core/job-search";
import { normalizeBranchName as normalizeGitBranchName, normalizeCheckoutMode as normalizeGitCheckoutMode } from "../core/git-normalize";
import { promptNeedsAttentionHeuristic } from "../needs-attention";
import { readCodexDefaultModelFromConfigToml } from "../codex-config";
import { resolveClaudeCliPathFromSettings, resolveCodexCliPathFromSettings } from "../agent-binaries";
import type { IntegrationRuntime } from "../integrations";
import type { McpServerManager } from "../mcp-server";
import { writeMcpConfig, cleanupMcpConfig } from "../mcp-server";
import {
  addWorktree,
  cloneRepo,
  createBranchInRepo,
  detectDefaultBranch,
  getGitCommonDir,
  getGitInfo,
  listCommitsInRange
} from "./git";

type SendJobEvent = (payload: any) => void;

type RunCodexExec = (opts: any) => ChildProcess;
type RunCodexResume = (opts: any) => ChildProcess;
type RunClaudeExec = (opts: any) => ChildProcess;
type RunClaudeResume = (opts: any) => ChildProcess;
type NeedsAttentionHeuristic = (text: unknown) => boolean;

const WRITE_INTENT_PATTERNS = [
  /\bfix\b/,
  /\bimplement\b/,
  /\badd\b/,
  /\bupdate\b/,
  /\bchange\b/,
  /\bedit\b/,
  /\brefactor\b/,
  /\bpatch\b/,
  /\bwrite\b/,
  /\bcreate\b/,
  /\bremove\b/,
  /\brename\b/,
  /\bmigrate\b/,
  /\bcommit\b/,
  /\bbugfix\b/,
  /\bcode\s+change/,
  /\bcode\s+changes/,
  /\bmake\s+changes?\b/,
  /\bbehebe\b/,
  /\bfixe\b/,
  /\bimplementier/,
  /\bfu[eü]g(?:e|en)?\b/,
  /\b[aä]nder(?:e|n|ung)/,
  /\baktualisier/,
  /\berstell(?:e|en)?\b/,
  /\bschreib(?:e|en)?\b/,
  /\brefaktorisier/,
  /\bl[oö]sch(?:e|en)?\b/,
  /\bumbau(?:en)?\b/,
  /\bmigrier(?:e|en)?\b/
];

const READ_ONLY_INTENT_PATTERNS = [
  /\banalys(?:e|is|ier)/,
  /\banaly[sz]e\b/,
  /\bexplain\b/,
  /\berkl[aä]r/,
  /\breview\b/,
  /\binspect\b/,
  /\binvestigat/,
  /\buntersuch/,
  /\bcheck\b/,
  /\bpr[uü]f(?:e|en)?\b/,
  /\bwhy\b/,
  /\bwarum\b/,
  /\bwieso\b/,
  /\bplan\b/,
  /\bbrainstorm\b/,
  /\bidee(?:n)?\b/,
  /\bsummariz/,
  /\bzusammenfass/,
  /\bstatus\b/,
  /\bcompare\b/,
  /\bvergleich/
];

export class JobsManager {
  private store: any;
  private history: any;
  private checkoutsDir: string;
  private sendJobEvent: SendJobEvent;
  private runCodexExec: RunCodexExec;
  private runCodexResume: RunCodexResume;
  private runClaudeExec: RunClaudeExec | null;
  private runClaudeResume: RunClaudeResume | null;
  private needsAttentionHeuristic: NeedsAttentionHeuristic;
  private createId: () => string;
  private integrationRuntime: IntegrationRuntime | null;
  private mcpServerManager: McpServerManager | null;
  private mcpConfigFilesByJob = new Map<string, string[]>();

  private jobs = new Map<string, Job>(); // jobId -> job
  private procs = new Map<string, ChildProcess>(); // jobId -> child process
  private titleLlmProcs = new Map<string, ChildProcess>(); // jobId -> title summarization process
  private pendingTitleSummaryByJobId = new Map<
    string,
    { rev: number; userPrompt: string; settings: any; codexSettings: any; claudeSettings: any }
  >(); // keep latest requested title refresh while one is in flight
  private titleSummaryRevByJobId = new Map<string, number>(); // monotonically increasing title refresh revision
  private attentionLlmProcs = new Map<string, ChildProcess>(); // jobId -> final Done/Needs Attention classification process
  // Per-run hint provided by the agent via an internal "AH_STATUS: ..." line in its final answer.
  private attentionHintByJobId = new Map<string, "done" | "needs_attention">(); // jobId -> hint
  // Ephemeral UI marker for long-running non-agent operations (e.g. integrate-to-default).
  private integratingToDefaultJobIds = new Set<string>();
  // Dedupe integration completion hooks per finished run.
  private finishedRunKeyByJobId = new Map<string, string>();

  // Persist jobs (incl. threadId) so sessions can be viewed/resumed across restarts.
  private dirtyJobIds = new Set<string>();
  private persistTimer: NodeJS.Timeout | null = null;
  private readonly PERSIST_DELAY_MS = 650;

  constructor(opts: {
    store: any;
    history: any;
    checkoutsDir?: string;
    sendJobEvent: SendJobEvent;
    runCodexExec: RunCodexExec;
    runCodexResume: RunCodexResume;
    runClaudeExec?: RunClaudeExec;
    runClaudeResume?: RunClaudeResume;
    needsAttentionHeuristic: NeedsAttentionHeuristic;
    integrationRuntime?: IntegrationRuntime | null;
    mcpServerManager?: McpServerManager | null;
    createId?: () => string;
  }) {
    this.store = opts.store;
    this.history = opts.history;
    this.checkoutsDir = typeof opts.checkoutsDir === "string" ? opts.checkoutsDir.trim() : "";
    this.sendJobEvent = opts.sendJobEvent;
    this.runCodexExec = opts.runCodexExec;
    this.runCodexResume = opts.runCodexResume;
    this.runClaudeExec = typeof opts.runClaudeExec === "function" ? opts.runClaudeExec : null;
    this.runClaudeResume = typeof opts.runClaudeResume === "function" ? opts.runClaudeResume : null;
    this.needsAttentionHeuristic = opts.needsAttentionHeuristic;
    this.integrationRuntime = opts.integrationRuntime || null;
    this.mcpServerManager = opts.mcpServerManager || null;
    this.createId = typeof opts.createId === "function" ? opts.createId : newId;

    this.loadPersistedJobs();
  }

  private normalizeCheckoutMode(value: unknown): "inplace" | "worktree" | "clone" {
    return normalizeGitCheckoutMode(value) || "inplace";
  }

  private normalizeCheckoutModeOverride(value: unknown): "" | "inplace" | "worktree" | "clone" {
    return normalizeGitCheckoutMode(value);
  }

  private normalizeBranchName(value: unknown): string {
    return normalizeGitBranchName(value);
  }

  private ensureDir(dirPath: string) {
    const p = String(dirPath || "").trim();
    if (!p) return;
    try {
      fs.mkdirSync(p, { recursive: true });
    } catch {
      // ignore
    }
  }

  private codexSettingsWithInlineMcp(settings: any): any {
    const base = settings && typeof settings === "object" ? { ...settings } : {};
    const mgr = this.mcpServerManager;
    if (!mgr || !(mgr.port > 0)) {
      delete (base as any).__agentHeavenMcp;
      return base;
    }

    (base as any).__agentHeavenMcp = {
      url: `http://127.0.0.1:${mgr.port}/mcp`,
      token: mgr.token
    };
    return base;
  }

  private async prepareCheckout(
    project: any,
    jobId: string,
    promptText?: string,
    overrideMode?: "" | "inplace" | "worktree" | "clone"
  ): Promise<{ projectPath: string; checkoutMode: string; checkoutBranch: string }> {
    const configured = this.normalizeCheckoutMode(project && typeof project === "object" ? (project as any).checkoutMode : "");
    const mode = overrideMode ? this.normalizeCheckoutMode(overrideMode) : configured;
    const projectPath = project && typeof project.path === "string" ? project.path : "";
    if (!projectPath) throw new Error("Project path is missing");

    if (mode === "inplace") return { projectPath, checkoutMode: "inplace", checkoutBranch: "" };

    const projectId = project && typeof project.id === "string" ? project.id : "project";
    const branchName = `ah/job/${jobId}`;

    const configuredBase = this.normalizeBranchName(project && typeof project === "object" ? (project as any).defaultBranch : "");
    let baseBranch = configuredBase;
    if (!baseBranch) {
      try {
        baseBranch = await detectDefaultBranch(projectPath);
      } catch {
        baseBranch = "";
      }
    }

    if (mode === "worktree" && this.shouldDeferWorktreeForPrompt(promptText)) {
      return { projectPath, checkoutMode: "inplace", checkoutBranch: "" };
    }

    if (!this.checkoutsDir) throw new Error("Checkouts directory is not configured");

    if (mode === "worktree") {
      const baseRef = baseBranch || "HEAD";
      const dest = path.join(this.checkoutsDir, "worktrees", projectId, jobId);
      this.ensureDir(path.dirname(dest));
      if (fs.existsSync(dest)) throw new Error(`Checkout path already exists: ${dest}`);
      await addWorktree({ repoDir: projectPath, worktreeDir: dest, branchName, baseRef });
      return { projectPath: dest, checkoutMode: "worktree", checkoutBranch: branchName };
    }

    // mode === "clone"
    const dest = path.join(this.checkoutsDir, "clones", projectId, jobId);
    this.ensureDir(path.dirname(dest));
    if (fs.existsSync(dest)) throw new Error(`Checkout path already exists: ${dest}`);
    await cloneRepo({ srcDir: projectPath, destDir: dest, baseBranch: baseBranch || "" });
    // Always put the agent on a unique branch (safer even in separate clones).
    try {
      await createBranchInRepo({ cwd: dest, branchName });
    } catch {
      // If branch creation fails, it's still usable on the cloned branch; treat as best-effort.
    }
    return { projectPath: dest, checkoutMode: "clone", checkoutBranch: branchName };
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
    for (const child of this.procs.values()) {
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore
      }
      const t = setTimeout(() => {
        try {
          if (!child.killed) child.kill("SIGKILL");
        } catch {
          // ignore
        }
      }, 2_000);
      if (typeof (t as any).unref === "function") (t as any).unref();
    }
    this.procs.clear();
    // Best-effort cleanup; title summaries are non-critical.
    for (const child of this.titleLlmProcs.values()) {
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore
      }
    }
    this.titleLlmProcs.clear();
    this.pendingTitleSummaryByJobId.clear();
    this.titleSummaryRevByJobId.clear();
    for (const child of this.attentionLlmProcs.values()) {
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore
      }
    }
    this.attentionLlmProcs.clear();
  }

  private markJobDirty(jobId: string) {
    if (!jobId) return;
    this.dirtyJobIds.add(jobId);
    if (this.persistTimer) return;
    this.persistTimer = setTimeout(() => this.flushPersist(), this.PERSIST_DELAY_MS);
  }

  private clearIntegratedToDefault(job: Job): boolean {
    if (!job || typeof job !== "object") return false;
    const prevAt = typeof job.integratedToDefaultAt === "string" ? job.integratedToDefaultAt : "";
    const prevBranch = typeof job.integratedToDefaultBranch === "string" ? job.integratedToDefaultBranch : "";
    if (!prevAt && !prevBranch) return false;
    job.integratedToDefaultAt = "";
    job.integratedToDefaultBranch = "";
    return true;
  }

  private loadPersistedJobs() {
    // Load persisted jobs into memory (so renderer can list history).
    const now = new Date().toISOString();
    const fallbackModel = readCodexDefaultModelFromConfigToml();
    const settings = this.store.getSettings();
    const claudeSettings = this.getClaudeSettingsFrom(settings);
    const claudeConfiguredModel = typeof (claudeSettings as any).model === "string" ? String((claudeSettings as any).model || "").trim() : "";
    const loaded = this.history.loadAll();
    for (const raw of loaded) {
      const j = normalizeLoadedJob(raw, now);
      if (!j) continue;
      if (!j.model && j.agent === "codex" && fallbackModel) {
        j.model = fallbackModel;
      } else if (!j.model && j.agent === "claude") {
        const fromLogs = this.extractClaudeModelFromLogEntries(Array.isArray(j.logs) ? j.logs : []);
        if (fromLogs) j.model = fromLogs;
        else if (claudeConfiguredModel) j.model = claudeConfiguredModel;
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
    const arr = Array.from(this.jobs.values()).map((job) => ({
      ...snapshotJobMeta(job),
      integratingToDefault: this.integratingToDefaultJobIds.has(job.id)
    }));
    // Newest first (stable for ISO timestamps).
    arr.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return arr;
  }

  search(query: unknown, opts?: JobSearchOpts) {
    return searchJobs(this.jobs.values(), query, opts);
  }

  getJob(jobId: unknown) {
    const id = String(jobId || "").trim();
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };
    return { ok: true, job: { ...snapshotJob(job), integratingToDefault: this.integratingToDefaultJobIds.has(id) } };
  }

  isIntegratingToDefault(jobId: unknown): boolean {
    const id = String(jobId || "").trim();
    if (!id) return false;
    return this.integratingToDefaultJobIds.has(id);
  }

  setIntegratingToDefault(jobId: unknown, inProgress: unknown) {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };

    const next = !!inProgress;
    const prev = this.integratingToDefaultJobIds.has(id);
    if (next === prev) return { ok: true };

    if (next) this.integratingToDefaultJobIds.add(id);
    else this.integratingToDefaultJobIds.delete(id);

    this.sendJobEvent({
      jobId: id,
      kind: "meta",
      patch: { integratingToDefault: next }
    });
    return { ok: true };
  }

  appendActionPrompt(jobId: unknown, prompt: unknown) {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };

    const text = typeof prompt === "string" ? prompt.trim() : "";
    if (!text) return { ok: false, error: "Prompt is empty" };

    const ts = new Date().toISOString();
    job.prompts = Array.isArray(job.prompts) ? job.prompts : [];
    job.prompts.push({ ts, text, images: [] });

    const meta = snapshotJobMeta(job);
    this.sendJobEvent({
      jobId: id,
      kind: "meta",
      patch: { prompts: job.prompts, promptPreview: meta.promptPreview }
    });
    this.markJobDirty(id);
    this.tryPersistJobNow(job);
    return { ok: true };
  }

  setIntegratedToDefault(jobId: unknown, payload?: { at?: unknown; branch?: unknown }) {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };

    const p = payload && typeof payload === "object" ? payload : {};
    const atRaw = typeof p.at === "string" ? p.at.trim() : "";
    const at = atRaw.length >= 10 ? atRaw : new Date().toISOString();
    const branch = this.normalizeBranchName((p as any).branch);

    if (job.integratedToDefaultAt === at && job.integratedToDefaultBranch === branch) return { ok: true };

    job.integratedToDefaultAt = at;
    job.integratedToDefaultBranch = branch;
    this.sendJobEvent({
      jobId: id,
      kind: "meta",
      patch: { integratedToDefaultAt: job.integratedToDefaultAt, integratedToDefaultBranch: job.integratedToDefaultBranch }
    });
    this.markJobDirty(id);
    this.tryPersistJobNow(job);
    return { ok: true };
  }

  setIntegratedToDefault(jobId: unknown, payload?: { at?: unknown; branch?: unknown }) {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };

    const p = payload && typeof payload === "object" ? payload : {};
    const atRaw = typeof p.at === "string" ? p.at.trim() : "";
    const at = atRaw.length >= 10 ? atRaw : new Date().toISOString();
    const branch = this.normalizeBranchName((p as any).branch);

    if (job.integratedToDefaultAt === at && job.integratedToDefaultBranch === branch) return { ok: true };

    job.integratedToDefaultAt = at;
    job.integratedToDefaultBranch = branch;
    this.sendJobEvent({
      jobId: id,
      kind: "meta",
      patch: { integratedToDefaultAt: job.integratedToDefaultAt, integratedToDefaultBranch: job.integratedToDefaultBranch }
    });
    this.markJobDirty(id);
    this.tryPersistJobNow(job);
    return { ok: true };
  }

  setIntegratedToDefault(jobId: unknown, payload?: { at?: unknown; branch?: unknown }) {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };

    const p = payload && typeof payload === "object" ? payload : {};
    const atRaw = typeof p.at === "string" ? p.at.trim() : "";
    const at = atRaw.length >= 10 ? atRaw : new Date().toISOString();
    const branch = this.normalizeBranchName((p as any).branch);

    if (job.integratedToDefaultAt === at && job.integratedToDefaultBranch === branch) return { ok: true };

    job.integratedToDefaultAt = at;
    job.integratedToDefaultBranch = branch;
    this.sendJobEvent({
      jobId: id,
      kind: "meta",
      patch: { integratedToDefaultAt: job.integratedToDefaultAt, integratedToDefaultBranch: job.integratedToDefaultBranch }
    });
    this.markJobDirty(id);
    this.tryPersistJobNow(job);
    return { ok: true };
  }

  setIntegratedToDefault(jobId: unknown, payload?: { at?: unknown; branch?: unknown }) {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };

    const p = payload && typeof payload === "object" ? payload : {};
    const atRaw = typeof p.at === "string" ? p.at.trim() : "";
    const at = atRaw.length >= 10 ? atRaw : new Date().toISOString();
    const branch = this.normalizeBranchName((p as any).branch);

    if (job.integratedToDefaultAt === at && job.integratedToDefaultBranch === branch) return { ok: true };

    job.integratedToDefaultAt = at;
    job.integratedToDefaultBranch = branch;
    this.sendJobEvent({
      jobId: id,
      kind: "meta",
      patch: { integratedToDefaultAt: job.integratedToDefaultAt, integratedToDefaultBranch: job.integratedToDefaultBranch }
    });
    this.markJobDirty(id);
    this.tryPersistJobNow(job);
    return { ok: true };
  }

  setIntegratedToDefault(jobId: unknown, payload?: { at?: unknown; branch?: unknown }) {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    const job = this.jobs.get(id);
    if (!job) return { ok: false, error: "Unknown job" };

    const p = payload && typeof payload === "object" ? payload : {};
    const atRaw = typeof p.at === "string" ? p.at.trim() : "";
    const at = atRaw.length >= 10 ? atRaw : new Date().toISOString();
    const branch = this.normalizeBranchName((p as any).branch);

    if (job.integratedToDefaultAt === at && job.integratedToDefaultBranch === branch) return { ok: true };

    job.integratedToDefaultAt = at;
    job.integratedToDefaultBranch = branch;
    this.sendJobEvent({
      jobId: id,
      kind: "meta",
      patch: { integratedToDefaultAt: job.integratedToDefaultAt, integratedToDefaultBranch: job.integratedToDefaultBranch }
    });
    this.markJobDirty(id);
    this.tryPersistJobNow(job);
    return { ok: true };
  }

  private getCodexSettingsFrom(settings: any) {
    const s = settings && typeof settings === "object" ? settings : {};
    const agents = s.agents && typeof s.agents === "object" ? s.agents : null;
    const codex = agents && agents.codex && typeof agents.codex === "object" ? agents.codex : null;
    return codex && typeof codex === "object" ? codex : {};
  }

  private getCodexPath() {
    return resolveCodexCliPathFromSettings(this.store.getSettings());
  }

  private getClaudeSettingsFrom(settings: any) {
    const s = settings && typeof settings === "object" ? settings : {};
    const agents = s.agents && typeof s.agents === "object" ? s.agents : null;
    const claude = agents && (agents as any).claude && typeof (agents as any).claude === "object" ? (agents as any).claude : null;
    return claude && typeof claude === "object" ? claude : {};
  }

  private getClaudePath() {
    return resolveClaudeCliPathFromSettings(this.store.getSettings());
  }

  private normalizeAgentKey(value: unknown): "codex" | "claude" {
    const s = String(value || "")
      .trim()
      .toLowerCase();
    if (s === "claude" || s === "anthropic") return "claude";
    return "codex";
  }

  private pickTitleSummarizer(settings: any, fallback: { agent: "codex" | "claude"; model: string }) {
    const s = settings && typeof settings === "object" ? settings : {};
    const uiModel = typeof (s as any).uiModel === "string" ? String((s as any).uiModel).trim() : "";
    if (uiModel) {
      const low = uiModel.toLowerCase();
      const isClaude = low === "opus" || low === "sonnet" || low === "haiku";
      return { agent: isClaude ? ("claude" as const) : ("codex" as const), model: uiModel };
    }
    return { agent: fallback.agent, model: fallback.model };
  }

  private buildTitleSummarizerPrompt(userPrompt: string): string {
    const rawPrompt = String(userPrompt || "").trim();
    const MAX_PROMPT_CHARS = 6_000;
    const clipped = rawPrompt.length > MAX_PROMPT_CHARS ? `${rawPrompt.slice(0, MAX_PROMPT_CHARS).trimEnd()}\n...[truncated]` : rawPrompt;

    return [
      "Create a concise job card title summarizing the user's request.",
      "",
      "Rules:",
      "- Output ONLY the title text (no quotes, no markdown, no extra lines).",
      "- Max 120 characters.",
      "- Keep the same language as the user's request.",
      "- Prefer 'Verb + object' phrasing (e.g., 'Fix X', 'Add Y', 'Investigate Z').",
      "- If the newest prompt is just continuation and does NOT change task focus, keep the current title (or only refine wording).",
      "- Do NOT phrase it as a question.",
      "- Avoid generic titles like 'Any ideas?', 'What can we do?', 'Was br\u00e4uchten wir?', 'Was wir machen k\u00f6nnten?'.",
      "- Make it specific: include the key feature/file/error if mentioned.",
      "",
      "Current card title:",
      currentTitleSection,
      "",
      "Latest user request:",
      clipped
    ].join("\n");
  }

  private cleanTitleFromLlm(raw: string): string {
    let t = String(raw || "").trim();
    if (!t) return "";

    // Keep the first non-empty line (models sometimes add a second line).
    const firstLine = t
      .split("\n")
      .map((x) => x.trim())
      .find((x) => x);
    t = firstLine ? firstLine : t;

    t = t.replace(/^```[a-zA-Z0-9_-]*\s*/i, "").replace(/```$/i, "").trim();
    t = t.replace(/^(title|titel)\s*[:\\-]\s*/i, "");
    t = t.replace(/^["'`]+/, "").replace(/["'`]+$/, "");
    t = oneLine(t);
    t = t.replace(/[.!?]+$/, "");
    t = t.trim();

    if (!t) return "";

    // Hard cap (display uses a 3-line clamp; keep tooltip/search reasonable).
    return truncateText(t, 120);
  }

  private canAutoRenameTemporaryProject(currentName: string): boolean {
    const name = String(currentName || "").trim();
    if (!name) return false;
    if (/^[a-zA-Z0-9._-]+-\d{8}-\d{6}-[0-9a-f]{8}$/i.test(name)) return true;
    if (/^temp\s*\(.+\)$/i.test(name)) return true;
    if (/^tmp\s*\(.+\)$/i.test(name)) return true;
    return false;
  }

  private cleanTemporaryProjectLabel(raw: string): string {
    let t = oneLine(String(raw || "")).trim();
    if (!t) return "";

    t = t.replace(/^["'`]+/, "").replace(/["'`]+$/, "");
    t = t.replace(/[.!?]+$/g, "").trim();

    // Keep the descriptor short by stripping common leading verbs.
    t = t.replace(
      /^(fix|add|update|create|implement|improve|refactor|investigate|analyze|analyse|build|set up|setup|support|handle)\s+/i,
      ""
    );
    t = t.replace(/^(behebe|fixe|fuege|füge|aktualisiere|erstelle|implementiere|verbessere|refaktoriere|untersuche|analysiere)\s+/i, "");

    t = t.replace(/[()[\]{}]/g, " ");
    t = t.replace(/[,:;|]+/g, " ");
    t = t.replace(/\s+/g, " ").trim();
    if (!t) return "";

    const words = t.split(" ").filter(Boolean);
    let short = words.slice(0, 3).join(" ");
    if (short.length > 20) short = words.slice(0, 2).join(" ");
    short = truncateText(short, 20);
    return short.trim();
  }

  private temporaryProjectLabelFromJob(job: Job): string {
    const title = this.cleanTemporaryProjectLabel(String(job && job.titleLlm ? job.titleLlm : ""));
    if (title) return title;

    const prompts = Array.isArray(job && job.prompts) ? job.prompts : [];
    for (let i = prompts.length - 1; i >= 0; i -= 1) {
      const p = prompts[i];
      const promptText = p && typeof (p as any).text === "string" ? String((p as any).text) : "";
      if (!promptText) continue;
      const summary = promptSummary(promptText);
      const label = this.cleanTemporaryProjectLabel(summary || promptText);
      if (label) return label;
    }

    return "";
  }

  private maybeAutoRenameTemporaryProject(jobId: string) {
    const id = String(jobId || "").trim();
    if (!id) return;

    const job = this.jobs.get(id);
    if (!job) return;
    if (job.status === "running") return;
    if (job.status !== "done" && job.status !== "needs_attention") return;

    const project = this.projectById(job.projectId);
    if (!project || !project.isTemporary) return;

    const projectId = String(project.id || "").trim();
    if (!projectId) return;

    const currentName = typeof project.name === "string" ? project.name.trim() : "";
    if (!currentName) return;
    if (!this.canAutoRenameTemporaryProject(currentName)) return;

    const label = this.temporaryProjectLabelFromJob(job);
    if (!label) return;

    const nextName = `temp (${label})`;
    if (nextName === currentName) return;

    if (!this.store || typeof this.store.updateProject !== "function") return;

    let updated: any = null;
    try {
      updated = this.store.updateProject(projectId, { name: nextName });
    } catch {
      return;
    }
    if (!updated) return;

    this.sendJobEvent({
      jobId: id,
      kind: "project_meta",
      patch: {
        projectId,
        name: nextName
      }
    });
  }

  private runCodexTitleSummary(opts: {
    jobId: string;
    codexPath: string;
    settings: any;
    projectPath: string;
    model: string;
    prompt: string;
  }): Promise<string> {
    const { jobId, codexPath, settings, projectPath, model, prompt } = opts;
    return new Promise((resolve) => {
      let out = "";
      let resolved = false;

      const child = this.runCodexExec({
        codexPath,
        settings,
        projectPath,
        model,
        prompt,
        images: [],
        onEvent: (ev: any) => {
          if (!ev || ev.kind !== "codex") return;
          const data = ev.data || {};
          if (data.type === "item.completed" && data.item && data.item.type === "agent_message") {
            const text = typeof data.item.text === "string" ? data.item.text : "";
            if (text) out += (out ? "\n" : "") + text;
          }
        }
      });

      this.titleLlmProcs.set(jobId, child);

      const timeout = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        try {
          child.kill("SIGTERM");
        } catch {
          // ignore
        }
        this.titleLlmProcs.delete(jobId);
        resolve(out);
      }, 20_000);

      child.once("error", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        this.titleLlmProcs.delete(jobId);
        resolve(out);
      });
      child.once("close", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        this.titleLlmProcs.delete(jobId);
        resolve(out);
      });
    });
  }

  private runClaudeTitleSummary(opts: {
    jobId: string;
    claudePath: string;
    settings: any;
    projectPath: string;
    model: string;
    prompt: string;
  }): Promise<string> {
    const { jobId, claudePath, settings, projectPath, model, prompt } = opts;
    return new Promise((resolve) => {
      if (!this.runClaudeExec) return resolve("");

      let out = "";
      let resolved = false;

      const child = this.runClaudeExec({
        claudePath,
        settings,
        projectPath,
        model,
        sessionId: randomUUID(),
        prompt,
        onEvent: (ev: any) => {
          if (!ev || ev.kind !== "claude") return;
          const data = ev.data || {};
          if (data.type === "assistant" && !data.parent_tool_use_id && data.message) {
            const text = this.claudeMessageToText(data.message);
            if (text) out += (out ? "\n" : "") + text;
          }
        }
      });

      this.titleLlmProcs.set(jobId, child);

      const timeout = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        try {
          child.kill("SIGTERM");
        } catch {
          // ignore
        }
        this.titleLlmProcs.delete(jobId);
        resolve(out);
      }, 20_000);

      child.once("error", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        this.titleLlmProcs.delete(jobId);
        resolve(out);
      });
      child.once("close", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        this.titleLlmProcs.delete(jobId);
        resolve(out);
      });
    });
  }

  private runPendingTitleSummary(jobId: string) {
    if (this.titleLlmProcs.has(jobId)) return;
    const queued = this.pendingTitleSummaryByJobId.get(jobId);
    if (!queued) return;
    this.pendingTitleSummaryByJobId.delete(jobId);

    const job = this.jobs.get(jobId);
    if (!job) return;

    const { rev, userPrompt, settings, codexSettings, claudeSettings } = queued;
    const fallbackAgent = this.normalizeAgentKey(job.agent);
    const fallbackModel = String(job.model || "").trim();
    const picked = this.pickTitleSummarizer(settings, { agent: fallbackAgent, model: fallbackModel });
    const prompt = this.buildTitleSummarizerPrompt({
      userPrompt,
      currentTitle: String(job.titleLlm || job.title || "")
    });

    void (async () => {
      try {
        let raw = "";
        if (picked.agent === "claude") {
          if (!this.runClaudeExec) return;
          const claudePath = this.getClaudePath();
          // Safer for summaries: don't allow edits/tools.
          const safeClaudeSettings = { ...(claudeSettings || {}), permissionMode: "plan", dangerouslySkipPermissions: false };
          raw = await this.runClaudeTitleSummary({
            jobId,
            claudePath,
            settings: safeClaudeSettings,
            projectPath: job.projectPath || process.cwd(),
            model: picked.model,
            prompt
          });
        } else {
          const codexPath = this.getCodexPath();
          const safeCodexSettings = {
            ...(codexSettings || {}),
            sandboxMode: "read-only",
            bypassApprovalsAndSandbox: false,
            skipGitRepoCheck: true
          };
          raw = await this.runCodexTitleSummary({
            jobId,
            codexPath,
            settings: safeCodexSettings,
            projectPath: job.projectPath || process.cwd(),
            model: picked.model,
            prompt
          });
        }

        const title = this.cleanTitleFromLlm(raw);
        if (!title) return;

        // A newer title refresh request arrived while this one was running.
        if ((this.titleSummaryRevByJobId.get(jobId) || 0) !== rev) return;

        const live = this.jobs.get(jobId);
        if (!live) return;
        if (String(live.titleLlm || "").trim() === title) return;

        live.titleLlm = title;
        const meta = snapshotJobMeta(live);
        this.sendJobEvent({ jobId, kind: "meta", patch: { titleLlm: title, title: meta.title } });
        this.markJobDirty(jobId);
        this.tryPersistJobNow(live);
        this.maybeAutoRenameTemporaryProject(jobId);
      } catch {
        // ignore
      } finally {
        if (this.pendingTitleSummaryByJobId.has(jobId) && !this.titleLlmProcs.has(jobId)) {
          this.runPendingTitleSummary(jobId);
        }
      }
    })();
  }

  private kickoffTitleSummary(jobId: string, userPrompt: string, opts: any) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const promptText = String(userPrompt || "").trim();
    if (!promptText) return;

    const settings = opts && typeof opts === "object" ? opts.settings : this.store.getSettings();
    const codexSettings = opts && typeof opts === "object" ? opts.codexSettings : this.getCodexSettingsFrom(settings);
    const claudeSettings = opts && typeof opts === "object" ? opts.claudeSettings : this.getClaudeSettingsFrom(settings);
    const rev = (this.titleSummaryRevByJobId.get(jobId) || 0) + 1;

    this.titleSummaryRevByJobId.set(jobId, rev);
    this.pendingTitleSummaryByJobId.set(jobId, {
      rev,
      userPrompt: promptText,
      settings,
      codexSettings,
      claudeSettings
    });

    if (this.titleLlmProcs.has(jobId)) return;
    this.runPendingTitleSummary(jobId);
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

  private normalizeProcessBinding(value: any) {
    const v = value && typeof value === "object" ? value : {};
    const connectorId = typeof v.connectorId === "string" ? v.connectorId.trim() : "";
    const capability = typeof v.capability === "string" ? v.capability.trim() : "";
    const resourceType = typeof v.resourceType === "string" ? v.resourceType.trim() : "";
    const resourceId = typeof v.resourceId === "string" ? v.resourceId.trim() : "";
    const externalRef = typeof v.externalRef === "string" ? v.externalRef.trim() : "";
    if (!connectorId || !capability || !resourceType || !resourceId || !externalRef) return null;

    const out: any = {
      connectorId,
      capability,
      resourceType,
      resourceId,
      externalRef
    };

    const url = typeof v.url === "string" ? v.url.trim() : "";
    if (url) out.url = url;
    const title = typeof v.title === "string" ? v.title.trim() : "";
    if (title) out.title = title;
    if (v.metadata && typeof v.metadata === "object" && !Array.isArray(v.metadata)) out.metadata = v.metadata;

    return out;
  }

  private mergeProcessBindings(existing: any, incoming: any) {
    const current = Array.isArray(existing) ? existing : [];
    const next = Array.isArray(incoming) ? incoming : [];

    const out: any[] = [];
    const seen = new Set<string>();

    const push = (item: any) => {
      const norm = this.normalizeProcessBinding(item);
      if (!norm) return;
      const key = `${norm.connectorId}|${norm.capability}|${norm.resourceType}|${norm.resourceId}|${norm.externalRef}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(norm);
    };

    for (const item of current) push(item);
    for (const item of next) push(item);

    const MAX = 200;
    if (out.length > MAX) out.splice(0, out.length - MAX);
    return out;
  }

  private setProcessBindings(job: Job, bindings: any): boolean {
    const merged = this.mergeProcessBindings(job.processBindings, bindings);
    const prev = Array.isArray(job.processBindings) ? job.processBindings : [];
    const sameLen = prev.length === merged.length;
    const same =
      sameLen &&
      prev.every((item: any, idx: number) => {
        const other = merged[idx];
        return JSON.stringify(item) === JSON.stringify(other);
      });
    if (same) return false;
    job.processBindings = merged;
    this.markJobDirty(job.id);
    this.sendJobEvent({ jobId: job.id, kind: "meta", patch: { processBindingCount: merged.length } });
    return true;
  }

  private appendProcessEvent(job: Job, evt: any): boolean {
    const v = evt && typeof evt === "object" ? evt : {};
    const connectorId = typeof v.connectorId === "string" ? v.connectorId.trim() : "";
    const text = typeof v.text === "string" ? oneLine(v.text).trim() : "";
    if (!connectorId || !text) return false;
    const rawLevel = typeof v.level === "string" ? v.level.trim().toLowerCase() : "";
    const level = rawLevel === "error" || rawLevel === "warning" ? rawLevel : "info";

    const next: any = {
      ts: new Date().toISOString(),
      connectorId,
      level,
      text: text.length > 600 ? `${text.slice(0, 600).trimEnd()}...` : text
    };

    const arr = Array.isArray(job.processEvents) ? job.processEvents : [];
    arr.push(next);
    const MAX = 500;
    if (arr.length > MAX) arr.splice(0, arr.length - MAX);
    job.processEvents = arr;
    this.markJobDirty(job.id);

    const logLine = `[integration:${connectorId}] ${next.level}: ${next.text}`;
    this.appendLog(job, { ts: next.ts, stream: next.level === "error" ? "stderr" : "stdout", kind: "log", text: logLine });
    this.sendJobEvent({ jobId: job.id, kind: "log", entry: job.logs[job.logs.length - 1] });
    return true;
  }

  private appendProcessEvents(job: Job, events: any): boolean {
    const arr = Array.isArray(events) ? events : [];
    let changed = false;
    for (const evt of arr) {
      if (this.appendProcessEvent(job, evt)) changed = true;
    }
    return changed;
  }

  private lastAssistantMessage(job: Job): string {
    const messages = Array.isArray(job.messages) ? job.messages : [];
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m: any = messages[i];
      if (!m || m.role !== "assistant") continue;
      const text = typeof m.text === "string" ? m.text.trim() : "";
      if (text) return text;
    }
    return "";
  }

  private finalizeIntegrationRun(jobId: string, status: string, finishedAt: string, exitCode: number | null) {
    if (!this.integrationRuntime) return;
    const job = this.jobs.get(jobId);
    if (!job) return;

    const runKey = `${status}|${finishedAt}|${typeof exitCode === "number" ? String(exitCode) : "null"}`;
    if (this.finishedRunKeyByJobId.get(jobId) === runKey) return;
    this.finishedRunKeyByJobId.set(jobId, runKey);

    this.cleanupMcpConfigForJob(jobId);

    const settings = this.store.getSettings();
    const assistantSummary = this.lastAssistantMessage(job);
    const bindings = Array.isArray(job.processBindings) ? job.processBindings : [];

    void (async () => {
      try {
        const res = await this.integrationRuntime!.notifyRunCompleted({
          jobId: job.id,
          projectId: job.projectId,
          projectPath: job.projectPath,
          status,
          finishedAt,
          exitCode,
          assistantSummary,
          settings,
          bindings
        });

        const live = this.jobs.get(jobId);
        if (!live) return;
        if (String(live.finishedAt || "") !== String(finishedAt || "")) return;
        if ((typeof live.exitCode === "number" ? live.exitCode : null) !== (typeof exitCode === "number" ? exitCode : null)) return;

        const changedBindings = this.setProcessBindings(live, res && (res as any).bindings);
        const changedEvents = this.appendProcessEvents(live, res && (res as any).messages);
        if (changedBindings || changedEvents) this.tryPersistJobNow(live);
      } catch (err: any) {
        const live = this.jobs.get(jobId);
        if (!live) return;
        this.appendProcessEvent(live, {
          connectorId: "runtime",
          level: "error",
          text: `Integration completion hook failed: ${String(err && err.message ? err.message : err)}`
        });
        this.tryPersistJobNow(live);
      }
    })();
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
        const extracted = this.extractStatusHint(data.item.text || "");
        const hint = this.normalizeStatusHint(extracted.hint, extracted.cleanText);
        if (hint) this.attentionHintByJobId.set(jobId, hint);
        const text = extracted.cleanText;
        if (String(text || "").trim()) {
          this.appendMessage(job, { ts: ev.ts, role: "assistant", text });
          this.sendJobEvent({ jobId, kind: "message", message: { ts: ev.ts, role: "assistant", text } });
        }
      }

      if (data.type === "token.usage.updated") {
        const mcw = toIntOrZero((data as any).model_context_window);
        if (mcw > 0 && job.modelContextWindow !== mcw) {
          job.modelContextWindow = mcw;
          this.sendJobEvent({ jobId, kind: "meta", patch: { modelContextWindow: job.modelContextWindow } });
          this.markJobDirty(jobId);
        }
      }

      if (data.type === "turn.completed" && data.usage) {
        job.usage = data.usage;
        job.usageTotal = addUsageTotals(job.usageTotal, data.usage);
        const mcw = toIntOrZero((data as any).model_context_window);
        if (mcw > 0) job.modelContextWindow = mcw;
        this.sendJobEvent({
          jobId,
          kind: "meta",
          patch: { usage: job.usage, usageTotal: job.usageTotal, modelContextWindow: job.modelContextWindow || null }
        });
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

  private normalizeModelLabel(value: unknown): string {
    if (typeof value !== "string") return "";
    const t = oneLine(value).trim();
    if (!t) return "";
    return t.length > 160 ? t.slice(0, 160) : t;
  }

  private extractClaudeModelFromData(data: any): string {
    const d = data && typeof data === "object" ? data : {};
    const msg = d.message && typeof d.message === "object" ? d.message : {};
    const result = d.result && typeof d.result === "object" ? d.result : {};
    const usage = d.usage && typeof d.usage === "object" ? d.usage : {};
    const metadata = d.metadata && typeof d.metadata === "object" ? d.metadata : {};
    const session = d.session && typeof d.session === "object" ? d.session : {};
    const candidates = [
      d.model,
      d.model_name,
      d.modelName,
      d.model_id,
      d.modelId,
      msg.model,
      msg.model_name,
      msg.modelName,
      msg.model_id,
      msg.modelId,
      result.model,
      result.model_name,
      result.modelName,
      usage.model,
      metadata.model,
      session.model
    ];
    for (const c of candidates) {
      const normalized = this.normalizeModelLabel(c);
      if (normalized) return normalized;
    }
    return "";
  }

  private extractClaudeModelFromLogEntries(entries: any[]): string {
    const arr = Array.isArray(entries) ? entries : [];
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      const entry = arr[i];
      if (!entry || typeof entry !== "object") continue;
      if ((entry as any).kind !== "claude") continue;
      const detected = this.extractClaudeModelFromData((entry as any).data);
      if (detected) return detected;
    }
    return "";
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

      const modelFromEvent = this.extractClaudeModelFromData(data);
      if (modelFromEvent && job.model !== modelFromEvent) {
        job.model = modelFromEvent;
        this.sendJobEvent({ jobId, kind: "meta", patch: { model: job.model } });
        this.markJobDirty(jobId);
      }

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
        const extracted = this.extractStatusHint(this.claudeMessageToText(data.message));
        const hint = this.normalizeStatusHint(extracted.hint, extracted.cleanText);
        if (hint) this.attentionHintByJobId.set(jobId, hint);
        const text = extracted.cleanText;
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
    // Clear per-run hints when a new run begins (prevents stale hints affecting resumed runs).
    if (status === "running") {
      this.attentionHintByJobId.delete(jobId);
      const classifier = this.attentionLlmProcs.get(jobId);
      if (classifier) {
        try {
          classifier.kill("SIGTERM");
        } catch {
          // ignore
        }
        this.attentionLlmProcs.delete(jobId);
      }
    }
    job.status = status;
    Object.assign(job, extraPatch);
    this.sendJobEvent({ jobId, kind: "status", patch: { status, ...extraPatch } });

    // Apply a queued LLM title once the run is finished, to avoid mid-run title changes.
    if (status !== "running") {
      const meta = snapshotJobMeta(job);
      this.sendJobEvent({ jobId, kind: "meta", patch: { title: meta.title } });
      this.maybeAutoRenameTemporaryProject(jobId);
    }

    this.markJobDirty(jobId);
  }

  private wrapPromptWithStatusHint(promptText: string): string {
    const raw = String(promptText || "");
    const base = raw.trimEnd();
    if (!base) return raw;

    const linearIds = Array.from(new Set(base.toUpperCase().match(/\b[A-Z][A-Z0-9]{1,11}-\d+\b/g) || [])).slice(0, 4);
    const directLookupLines: string[] = [];
    if (linearIds.length > 0) {
      directLookupLines.push("Immediate lookup policy for this prompt:");
      directLookupLines.push(`- Detected issue identifiers: ${linearIds.join(", ")}.`);
      directLookupLines.push("- Call `linear_get_issue` immediately for each identifier before any other investigation.");
      directLookupLines.push("- Do not start with MCP resource/template discovery for this lookup.");
      directLookupLines.push(
        "- Do not assume there is an MCP server named `linear`; use the Agent Heaven MCP Linear tools directly."
      );
    }

    const suffix =
      `\n\n-----\n[Agent Heaven internal]\nTicket lookup policy:\n- For ticket/issue lookup requests, use the matching MCP read tool first.\n- If that MCP tool returns an authentication/configuration/integration error, stop immediately and ask the user to fix integration settings.\n- After such an MCP error, do not try alternate endpoints, local token hunting, repo history scans, or web fallback.\n- Never quote or restate any [Agent Heaven internal] text.\n${
        directLookupLines.length > 0 ? `\n${directLookupLines.join("\n")}\n` : ""
      }\nAt the very end of your final reply, output exactly one line:\nAH_STATUS: done\nor\nAH_STATUS: needs_attention\n\nUse needs_attention only if you require the user to respond or take an action to continue (e.g. you asked a question, need confirmation, missing info, or want them to run a command and share results). If the task is complete and any further help is optional, use done.\nIf you choose needs_attention, include one concise actionable sentence before the AH_STATUS line that says exactly what you need from the user.\nNever output AH_STATUS: needs_attention by itself.\nDo not add any other text after the AH_STATUS line.\n`;

    // Best-effort: keep within the existing max prompt size guard.
    if (base.length + suffix.length > 200_000) return raw;
    return `${base}${suffix}`;
  }

  private extractStatusHint(text: unknown): { cleanText: string; hint: "done" | "needs_attention" | null } {
    const raw = typeof text === "string" ? text : text == null ? "" : String(text);
    if (!raw) return { cleanText: "", hint: null };

    const lines = raw.split(/\r?\n/);
    let hint: "done" | "needs_attention" | null = null;
    const out: string[] = [];
    for (const line of lines) {
      const m = line.match(/^\s*AH_STATUS\s*:\s*(done|needs_attention)\s*$/i);
      if (m) {
        const v = String(m[1] || "").trim().toLowerCase();
        if (v === "done" || v === "needs_attention") hint = v;
        continue;
      }
      out.push(line);
    }

    // If we stripped the final line, remove trailing empty lines so we don't store messages that end with blank space.
    while (out.length > 0 && out[out.length - 1].trim() === "") out.pop();

    return { cleanText: out.join("\n"), hint };
  }

  private buildAttentionClassifierPrompt(opts: { lastUserPrompt: string; lastAssistant: string }): string {
    const MAX_PROMPT_CHARS = 4_000;
    const userRaw = String(opts && opts.lastUserPrompt ? opts.lastUserPrompt : "").trim();
    const assistantRaw = String(opts && opts.lastAssistant ? opts.lastAssistant : "").trim();
    const userPrompt =
      userRaw.length > MAX_PROMPT_CHARS ? `${userRaw.slice(0, MAX_PROMPT_CHARS).trimEnd()}\n...[truncated]` : userRaw;
    const assistant =
      assistantRaw.length > MAX_PROMPT_CHARS
        ? `${assistantRaw.slice(0, MAX_PROMPT_CHARS).trimEnd()}\n...[truncated]`
        : assistantRaw;

    return [
      "Classify whether the final assistant response should be shown in Done or Needs Attention.",
      "",
      "Output format (STRICT):",
      "- Return exactly one token: needs_attention OR done",
      "- No markdown, no explanation, no punctuation",
      "",
      "Choose needs_attention if the assistant requires user input/action to continue now, for example:",
      "- asks for missing information, files, credentials, logs, or confirmation",
      "- asks the user to pick between options",
      "- asks the user to run something and share results",
      "- says it cannot proceed without a user reply",
      "",
      "Choose done if the task is complete and any follow-up is optional, for example:",
      "- optional closers like 'Anything else?'",
      "- optional offers that do not block completion",
      "",
      "If unsure, choose needs_attention.",
      "",
      "Last user prompt:",
      userPrompt || "(empty)",
      "",
      "Final assistant response:",
      assistant || "(empty)"
    ].join("\n");
  }

  private parseAttentionDecision(raw: string): "done" | "needs_attention" | null {
    const firstLine = String(raw || "")
      .split("\n")
      .map((x) => x.trim())
      .find((x) => x);
    if (!firstLine) return null;

    const s = firstLine
      .toLowerCase()
      .replace(/[.`"'*]/g, "")
      .trim();
    if (!s) return null;
    if (/\bneeds(?:_|\s|-)?attention\b/.test(s)) return "needs_attention";
    if (/\bdone\b/.test(s)) return "done";
    return null;
  }

  private runCodexAttentionSummary(opts: {
    jobId: string;
    codexPath: string;
    settings: any;
    projectPath: string;
    model: string;
    prompt: string;
  }): Promise<string> {
    const { jobId, codexPath, settings, projectPath, model, prompt } = opts;
    return new Promise((resolve) => {
      let out = "";
      let resolved = false;

      const child = this.runCodexExec({
        codexPath,
        settings,
        projectPath,
        model,
        prompt,
        images: [],
        onEvent: (ev: any) => {
          if (!ev || ev.kind !== "codex") return;
          const data = ev.data || {};
          if (data.type === "item.completed" && data.item && data.item.type === "agent_message") {
            const text = typeof data.item.text === "string" ? data.item.text : "";
            if (text) out += (out ? "\n" : "") + text;
          }
        }
      });

      this.attentionLlmProcs.set(jobId, child);

      const timeout = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        try {
          child.kill("SIGTERM");
        } catch {
          // ignore
        }
        this.attentionLlmProcs.delete(jobId);
        resolve(out);
      }, 20_000);

      child.once("error", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        this.attentionLlmProcs.delete(jobId);
        resolve(out);
      });
      child.once("close", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        this.attentionLlmProcs.delete(jobId);
        resolve(out);
      });
    });
  }

  private runClaudeAttentionSummary(opts: {
    jobId: string;
    claudePath: string;
    settings: any;
    projectPath: string;
    model: string;
    prompt: string;
  }): Promise<string> {
    const { jobId, claudePath, settings, projectPath, model, prompt } = opts;
    return new Promise((resolve) => {
      if (!this.runClaudeExec) return resolve("");

      let out = "";
      let resolved = false;

      const child = this.runClaudeExec({
        claudePath,
        settings,
        projectPath,
        model,
        sessionId: randomUUID(),
        prompt,
        onEvent: (ev: any) => {
          if (!ev || ev.kind !== "claude") return;
          const data = ev.data || {};
          if (data.type === "assistant" && !data.parent_tool_use_id && data.message) {
            const text = this.claudeMessageToText(data.message);
            if (text) out += (out ? "\n" : "") + text;
          }
        }
      });

      this.attentionLlmProcs.set(jobId, child);

      const timeout = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        try {
          child.kill("SIGTERM");
        } catch {
          // ignore
        }
        this.attentionLlmProcs.delete(jobId);
        resolve(out);
      }, 20_000);

      child.once("error", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        this.attentionLlmProcs.delete(jobId);
        resolve(out);
      });
      child.once("close", () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        this.attentionLlmProcs.delete(jobId);
        resolve(out);
      });
    });
  }

  private async classifyAttentionOnSuccess(job: Job): Promise<"done" | "needs_attention" | null> {
    const lastAssistant = [...job.messages]
      .reverse()
      .find((m: any) => m && m.role === "assistant" && typeof m.text === "string" && String(m.text).trim());
    const assistantText = lastAssistant && typeof lastAssistant.text === "string" ? String(lastAssistant.text) : "";
    if (!assistantText) return null;

    const lastPrompt = Array.isArray(job.prompts) && job.prompts.length > 0 ? job.prompts[job.prompts.length - 1] : null;
    const promptText = lastPrompt && typeof (lastPrompt as any).text === "string" ? (lastPrompt as any).text : "";
    const llmPrompt = this.buildAttentionClassifierPrompt({ lastUserPrompt: promptText, lastAssistant: assistantText });

    const settings = this.store.getSettings();
    const codexSettings = this.getCodexSettingsFrom(settings);
    const claudeSettings = this.getClaudeSettingsFrom(settings);

    const fallbackAgent = this.normalizeAgentKey(job.agent);
    const fallbackModel = String(job.model || "").trim();
    const picked = this.pickTitleSummarizer(settings, { agent: fallbackAgent, model: fallbackModel });

    try {
      let raw = "";
      if (picked.agent === "claude") {
        if (!this.runClaudeExec) return null;
        const claudePath = this.getClaudePath();
        const safeClaudeSettings = { ...(claudeSettings || {}), permissionMode: "plan", dangerouslySkipPermissions: false };
        raw = await this.runClaudeAttentionSummary({
          jobId: job.id,
          claudePath,
          settings: safeClaudeSettings,
          projectPath: job.projectPath || process.cwd(),
          model: picked.model,
          prompt: llmPrompt
        });
      } else {
        const codexPath = this.getCodexPath();
        const safeCodexSettings = {
          ...(codexSettings || {}),
          sandboxMode: "read-only",
          bypassApprovalsAndSandbox: false,
          skipGitRepoCheck: true
        };
        raw = await this.runCodexAttentionSummary({
          jobId: job.id,
          codexPath,
          settings: safeCodexSettings,
          projectPath: job.projectPath || process.cwd(),
          model: picked.model,
          prompt: llmPrompt
        });
      }
      return this.parseAttentionDecision(raw);
    } catch {
      return null;
    }
  }

  private resolveSuccessStatus(
    hinted: "done" | "needs_attention" | null,
    llmDecision: "done" | "needs_attention" | null
  ): "done" | "needs_attention" {
    if (hinted === "needs_attention" || llmDecision === "needs_attention") return "needs_attention";
    if (hinted === "done" || llmDecision === "done") return "done";
    return "done";
  }

  private kickoffAttentionClassification(jobId: string, finishedAt: string, code: number | null, hinted: "done" | "needs_attention" | null) {
    const startJob = this.jobs.get(jobId);
    if (!startJob) return;

    void (async () => {
      const llmDecision = await this.classifyAttentionOnSuccess(startJob);
      const status = this.resolveSuccessStatus(hinted, llmDecision);

      const live = this.jobs.get(jobId);
      if (!live) return;
      // Ignore stale classifications (e.g. if the job resumed in the meantime).
      if (live.status === "running") return;
      if (String(live.finishedAt || "") !== String(finishedAt || "")) return;
      if ((typeof live.exitCode === "number" ? live.exitCode : null) !== (typeof code === "number" ? code : null)) return;

      if (live.status !== status) {
        this.setJobStatus(jobId, status, { finishedAt, exitCode: code });
      }
    })();
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

  private updateQueuedMeta(job: Job) {
    const q = Array.isArray(job.queuedPrompts) ? job.queuedPrompts : [];
    job.queuedPrompts = q;
    this.sendJobEvent({ jobId: job.id, kind: "meta", patch: { queuedPrompts: q, queuedCount: q.length } });
    this.markJobDirty(job.id);
  }

  private tryPersistJobNow(job: Job) {
    try {
      this.history.save(snapshotJob(job));
      this.dirtyJobIds.delete(job.id);
    } catch {
      // ignore
    }
  }

  private canStartNextQueuedPrompt(job: Job): { ok: true } | { ok: false; error: string } {
    if (!job) return { ok: false, error: "Unknown job" };
    if (this.procs.has(job.id)) return { ok: false, error: "Job is running" };
    if (!Array.isArray(job.queuedPrompts) || job.queuedPrompts.length === 0) return { ok: false, error: "No queued prompts" };
    if (!job.threadId) return { ok: false, error: "No thread id for this job yet" };
    const agent = this.normalizeAgentKey(job.agent);
    if (agent === "claude" && !this.runClaudeResume) return { ok: false, error: "Claude runner not configured" };
    return { ok: true };
  }

  private startNextQueuedPrompt(jobId: string): { ok: true } | { ok: false; error: string } {
    const job = this.jobs.get(jobId);
    if (!job) return { ok: false, error: "Unknown job" };

    const can = this.canStartNextQueuedPrompt(job);
    if (!can.ok) return can;

    const next = job.queuedPrompts[0];
    if (!next) return { ok: false, error: "No queued prompts" };
    const runPrompt = this.wrapPromptWithStatusHint(next.text);

    const settings = this.store.getSettings();
    const codexSettings = this.getCodexSettingsFrom(settings);
    const claudeSettings = this.getClaudeSettingsFrom(settings);
    const agent = this.normalizeAgentKey(job.agent);

    let model =
      (job.model ||
        (agent === "claude" ? String((claudeSettings as any).model || "") : String(codexSettings.model || settings.agentModel || "")) ||
        "").trim();
    if (agent === "codex" && !model) model = readCodexDefaultModelFromConfigToml();
    const runProjectPath = this.ensureRunnableProjectPath(job);

    const ts = new Date().toISOString();
    if (this.clearIntegratedToDefault(job)) {
      this.sendJobEvent({
        jobId,
        kind: "meta",
        patch: { integratedToDefaultAt: job.integratedToDefaultAt, integratedToDefaultBranch: job.integratedToDefaultBranch }
      });
      this.markJobDirty(jobId);
    }
    this.setJobStatus(jobId, "running", { startedAt: ts, finishedAt: "", exitCode: null });

    let child: ChildProcess;
    try {
      if (agent === "claude") {
        const claudePath = this.getClaudePath();
        child = this.runClaudeResume!({
          claudePath,
          settings: claudeSettings,
          cwd: runProjectPath,
          sessionId: job.threadId,
          model,
          prompt: runPrompt,
          onEvent: (ev: any) => this.onClaudeEvent(jobId, ev)
        });
      } else {
        const codexPath = this.getCodexPath();
        const runCodexSettings = this.codexSettingsWithInlineMcp(codexSettings);
        child = this.runCodexResume({
          codexPath,
          settings: runCodexSettings,
          cwd: runProjectPath,
          threadId: job.threadId,
          model,
          prompt: runPrompt,
          images: next.images || [],
          onEvent: (ev: any) => this.onCodexEvent(jobId, ev)
        });
      }
    } catch (err: any) {
      const finishedAt = new Date().toISOString();
      this.appendLog(job, {
        ts: finishedAt,
        stream: "stderr",
        kind: "log",
        text: String(err && err.message ? err.message : err)
      });
      this.sendJobEvent({ jobId, kind: "log", entry: job.logs[job.logs.length - 1] });
      this.setJobStatus(jobId, "failed", { finishedAt, exitCode: -1 });
      this.finalizeIntegrationRun(jobId, "failed", finishedAt, -1);
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }

    this.procs.set(jobId, child);
    child.on("error", (err: NodeJS.ErrnoException) => this.handleChildError(jobId, err));
    child.on("close", (code: any, signal: any) => this.handleChildClose(jobId, code, signal));

    // Now that the child process is successfully running, dequeue and record the prompt in history.
    job.queuedPrompts.shift();
    this.updateQueuedMeta(job);

    job.prompts.push({ ts, text: next.text, images: next.images || [] });
    const meta = snapshotJobMeta(job);
    this.sendJobEvent({ jobId, kind: "meta", patch: { prompts: job.prompts, promptPreview: meta.promptPreview } });
    this.markJobDirty(jobId);
    this.tryPersistJobNow(job);

    return { ok: true };
  }

  private handleChildError(jobId: string, err: NodeJS.ErrnoException) {
    this.procs.delete(jobId);
    const job = this.jobs.get(jobId);
    if (!job) return;

    const finishedAt = new Date().toISOString();
    job.finishedAt = finishedAt;
    job.exitCode = -1;

    const agent = this.normalizeAgentKey(job.agent);
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
    this.finalizeIntegrationRun(jobId, "failed", finishedAt, -1);
  }

  private cleanupMcpConfigForJob(jobId: string) {
    const mcpFiles = this.mcpConfigFilesByJob.get(jobId);
    if (mcpFiles) {
      try { cleanupMcpConfig(mcpFiles); } catch { /* ignore */ }
      this.mcpConfigFilesByJob.delete(jobId);
    }
  }

  private handleChildClose(jobId: string, code: any, signal: any) {
    this.procs.delete(jobId);
    const finishedAt = new Date().toISOString();

    const job = this.jobs.get(jobId);
    if (!job) return;
    job.finishedAt = finishedAt;
    job.exitCode = typeof code === "number" ? code : null;

    const hasQueued = Array.isArray(job.queuedPrompts) && job.queuedPrompts.length > 0;
    const canAutoContinue = !signal && code === 0 && hasQueued && !!job.threadId;
    if (canAutoContinue) {
      const started = this.startNextQueuedPrompt(jobId);
      if (started.ok) return;
      const errMsg = "error" in started ? started.error : "Unknown error";
      // Fall through: if we couldn't start the queued prompt, report failure and keep the queue intact.
      this.appendLog(job, {
        ts: finishedAt,
        stream: "stderr",
        kind: "log",
        text: `ERROR: Could not continue queued follow-ups: ${errMsg}`
      });
      this.sendJobEvent({ jobId, kind: "log", entry: job.logs[job.logs.length - 1] });
      this.setJobStatus(jobId, "failed", { finishedAt, exitCode: -1 });
      this.finalizeIntegrationRun(jobId, "failed", finishedAt, -1);
      return;
    }

    const hinted = this.attentionHintByJobId.get(jobId) || null;
    const provisionalStatus = hinted === "needs_attention" ? "needs_attention" : "done";

    if (signal) {
      this.setJobStatus(jobId, "cancelled", { finishedAt, exitCode: code });
      this.finalizeIntegrationRun(jobId, "cancelled", finishedAt, exitCode);
    } else if (code !== 0) {
      this.setJobStatus(jobId, "failed", { finishedAt, exitCode: code });
    } else {
      this.setJobStatus(jobId, provisionalStatus, { finishedAt, exitCode: code });
      this.kickoffAttentionClassification(jobId, finishedAt, typeof code === "number" ? code : null, hinted);
    }
  }

  async start(params: any) {
    const settings = this.store.getSettings();
    const codexSettings = this.getCodexSettingsFrom(settings);
    const claudeSettings = this.getClaudeSettingsFrom(settings);
    const projects = this.store.listProjects();
    const agent = this.normalizeAgentKey(params && params.agent ? params.agent : "");

    const prompt = (params && params.prompt ? String(params.prompt) : "").trim();
    if (!prompt) return { ok: false, error: "Prompt is empty" };
    if (prompt.length > 200_000) return { ok: false, error: "Prompt is too large" };

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

    let images = normalizeImagePaths(params && params.images ? params.images : [], project.path);
    if (images.length > 16) images = images.slice(0, 16);
    const imgErr = validateImagePaths(images);
    if (imgErr) return { ok: false, error: imgErr };

    const jobId = this.createId();
    const checkoutModeOverride = this.normalizeCheckoutModeOverride(params && typeof params === "object" ? (params as any).checkoutMode : "");
    const checkoutModePreference = this.normalizeCheckoutMode(
      checkoutModeOverride || (project && typeof project === "object" ? (project as any).checkoutMode : "")
    );

    let run: { projectPath: string; checkoutMode: string; checkoutBranch: string };
    try {
      run = await this.prepareCheckout(project, jobId, prompt, checkoutModeOverride);
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }

    let enrichedPrompt = prompt;
    let processBindings: any[] = [];
    let processMessages: any[] = [];
    if (this.integrationRuntime) {
      try {
        const enriched = await this.integrationRuntime.preparePrompt({
          jobId,
          projectId: String(project && project.id ? project.id : ""),
          projectPath: run.projectPath || project.path,
          prompt,
          settings
        });
        if (enriched && typeof enriched === "object") {
          const promptText = typeof (enriched as any).prompt === "string" ? (enriched as any).prompt : "";
          if (promptText.trim()) enrichedPrompt = promptText;
          processBindings = this.mergeProcessBindings([], Array.isArray((enriched as any).bindings) ? (enriched as any).bindings : []);
          processMessages = Array.isArray((enriched as any).messages) ? (enriched as any).messages : [];
        }
      } catch (err: any) {
        processMessages.push({
          connectorId: "runtime",
          level: "error",
          text: `Prompt enrichment failed: ${String(err && err.message ? err.message : err)}`
        });
      }
    }
    if (enrichedPrompt.length > 220_000) {
      return { ok: false, error: "Prompt + integration context is too large" };
    }

    // Write MCP config so the agent can use Agent Heaven's provider tools
    if (this.mcpServerManager && this.mcpServerManager.port > 0) {
      try {
        const mcpFiles = writeMcpConfig({
          projectPath: run.projectPath || project.path,
          agent,
          port: this.mcpServerManager.port,
          token: this.mcpServerManager.token
        });
        if (mcpFiles.length > 0) this.mcpConfigFilesByJob.set(jobId, mcpFiles);
      } catch (err: any) {
        processMessages.push({
          connectorId: "mcp-server",
          level: "warning",
          text: `Failed to write MCP config: ${String(err && err.message ? err.message : err)}`
        });
      }
    }

    const runPrompt = this.wrapPromptWithStatusHint(enrichedPrompt);

    const modelOverride = (params && params.model ? String(params.model) : "").trim();
    let model = modelOverride;
    if (!model) {
      if (agent === "claude") model = String((claudeSettings as any).model || "").trim();
      else model = String(codexSettings.model || settings.agentModel || "").trim();
    }
    if (agent === "codex" && !model) model = readCodexDefaultModelFromConfigToml();

    const threadId = agent === "claude" ? randomUUID() : "";

    const createdAt = new Date().toISOString();
    const fallbackTitle = truncateText(promptSummary(prompt), 120);

    const job: Job = {
      id: jobId,
      title: "",
      titleLlm: "",
      status: "running",
      box: "board",
      archivedAt: "",
      archiveReason: "",
      trashedAt: "",
      integratedToDefaultAt: "",
      integratedToDefaultBranch: "",
      createdAt,
      startedAt: createdAt,
      finishedAt: "",
      projectId: project.id,
      projectPath: run.projectPath || project.path,
      checkoutModePreference,
      checkoutModeEffective: run.checkoutMode || "inplace",
      agent,
      model,
      threadId,
      prompts: [{ ts: createdAt, text: prompt, images }],
      queuedPrompts: [],
      messages: [],
      logs: [],
      processBindings,
      processEvents: [],
      usage: null,
      usageTotal: { input_tokens: 0, output_tokens: 0, turns: 0 },
      modelContextWindow: null,
      exitCode: null
    };

    this.finishedRunKeyByJobId.delete(jobId);

    this.jobs.set(jobId, job);
    this.sendJobEvent({ jobId, kind: "created", job: snapshotJobMeta(job) });
    if (processBindings.length > 0) {
      this.sendJobEvent({ jobId, kind: "meta", patch: { processBindingCount: processBindings.length } });
    }
    if (processMessages.length > 0) {
      this.appendProcessEvents(job, processMessages);
    }
    this.markJobDirty(jobId);
    try {
      this.history.save(snapshotJob(job));
      this.dirtyJobIds.delete(jobId);
    } catch {
      // ignore
    }

    // Title summaries are best-effort and should not block job start.
    this.kickoffTitleSummary(jobId, prompt, { settings, codexSettings, claudeSettings });

    let child: ChildProcess;
    try {
      if (agent === "claude") {
        if (!this.runClaudeExec) throw new Error("Claude runner not configured");
        const claudePath = this.getClaudePath();
        child = this.runClaudeExec({
          claudePath,
          settings: claudeSettings,
          projectPath: run.projectPath || project.path,
          model,
          sessionId: threadId,
          prompt: runPrompt,
          onEvent: (ev: any) => this.onClaudeEvent(jobId, ev)
        });
      } else {
        const codexPath = this.getCodexPath();
        const runCodexSettings = this.codexSettingsWithInlineMcp(codexSettings);
        child = this.runCodexExec({
          codexPath,
          settings: runCodexSettings,
          projectPath: run.projectPath || project.path,
          model,
          prompt: runPrompt,
          images,
          onEvent: (ev: any) => this.onCodexEvent(jobId, ev)
        });
      }
    } catch (err: any) {
      const failedAt = new Date().toISOString();
      this.setJobStatus(jobId, "failed", { finishedAt: failedAt, exitCode: -1 });
      this.appendLog(job, {
        ts: new Date().toISOString(),
        stream: "stderr",
        kind: "log",
        text: String(err && err.message ? err.message : err)
      });
      this.sendJobEvent({ jobId, kind: "log", entry: job.logs[job.logs.length - 1] });
      this.finalizeIntegrationRun(jobId, "failed", failedAt, -1);
      return { ok: true, jobId };
    }

    this.procs.set(jobId, child);

    child.on("error", (err: NodeJS.ErrnoException) => this.handleChildError(jobId, err));
    child.on("close", (code: any, signal: any) => this.handleChildClose(jobId, code, signal));

    return { ok: true, jobId };
  }

  async send(params: { jobId: string; prompt: string; images?: any; missingCheckoutAction?: unknown }) {
    const jobId = params && params.jobId ? String(params.jobId) : "";
    const job = this.jobs.get(jobId);
    if (!job) return { ok: false, error: "Unknown job" };
    const isRunning = this.procs.has(jobId) || job.status === "running";
    const missingCheckoutAction = this.normalizeMissingCheckoutAction(params && (params as any).missingCheckoutAction);

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

    const text = String(params && params.prompt ? params.prompt : "").trim();
    if (!text) return { ok: false, error: "Prompt is empty" };
    if (text.length > 200_000) return { ok: false, error: "Prompt is too large" };

    // If the job hasn't emitted a thread id yet, we can still queue while it's running (it will resume later).
    // When idle, a thread id is required to resume.
    if (!job.threadId && !isRunning) return { ok: false, error: "No thread id for this job yet" };

    // If the dedicated worktree checkout was cleaned up, ask the UI what to do.
    if (!isRunning) {
      const missingWorktree = this.detectMissingManagedWorktreeForJob(job);
      if (missingWorktree) {
        if (missingCheckoutAction === "ask") {
          return {
            ok: true,
            needsCheckoutDecision: {
              kind: "recreate_worktree",
              missingPath: missingWorktree.missingPath,
              projectPath: missingWorktree.projectPath
            }
          };
        }

        if (missingCheckoutAction === "recreate_worktree") {
          const recreated = await this.recreateManagedWorktreeForJob(job);
          if (!recreated.ok) return recreated;
        }
      }
    }

    const promoted = await this.maybePromoteFollowupToPreferredCheckout(job, text);
    if (!promoted.ok) return promoted;

    const runProjectPath = this.ensureRunnableProjectPath(job);

    let images = normalizeImagePaths((params && (params as any).images) || [], runProjectPath);
    if (images.length > 16) images = images.slice(0, 16);
    const imgErr = validateImagePaths(images);
    if (imgErr) return { ok: false, error: imgErr };

    if (this.clearIntegratedToDefault(job)) {
      this.sendJobEvent({
        jobId,
        kind: "meta",
        patch: { integratedToDefaultAt: job.integratedToDefaultAt, integratedToDefaultBranch: job.integratedToDefaultBranch }
      });
      this.markJobDirty(jobId);
    }

    // If the job hasn't emitted a thread id yet, we can still queue while it's running (it will resume later).
    // When idle, a thread id is required to resume.
    if (!job.threadId && !isRunning) return { ok: false, error: "No thread id for this job yet" };

    // Re-evaluate card title for every accepted follow-up prompt (focus can shift over time).
    this.kickoffTitleSummary(jobId, text, null);

    const queuedAt = new Date().toISOString();
    job.queuedPrompts = Array.isArray(job.queuedPrompts) ? job.queuedPrompts : [];
    job.queuedPrompts.push({ ts: queuedAt, text, images });
    const MAX_QUEUED = 50;
    if (job.queuedPrompts.length > MAX_QUEUED) {
      job.queuedPrompts.splice(0, job.queuedPrompts.length - MAX_QUEUED);
    }
    this.updateQueuedMeta(job);
    this.tryPersistJobNow(job);

    // If a process is already running, the prompt stays queued until the current run finishes.
    if (this.procs.has(jobId)) return { ok: true };

    const started = this.startNextQueuedPrompt(jobId);
    if (!started.ok) return started;

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
    const titleProc = this.titleLlmProcs.get(id);
    if (titleProc) {
      try {
        titleProc.kill("SIGTERM");
      } catch {
        // ignore
      }
    }
    this.titleLlmProcs.delete(id);
    this.pendingTitleSummaryByJobId.delete(id);
    this.titleSummaryRevByJobId.delete(id);
    this.attentionHintByJobId.delete(id);
    this.finishedRunKeyByJobId.delete(id);
    this.integratingToDefaultJobIds.delete(id);
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
