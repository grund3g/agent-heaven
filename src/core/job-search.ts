import type { Job } from "./jobs";

export type JobSearchOpts = {
  includeLogs?: boolean;
  limit?: number;
};

export function normalizeSearchTokens(query: unknown): string[] {
  const raw = typeof query === "string" ? query : query == null ? "" : String(query);
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const parts = q.split(/\s+/).filter(Boolean);
  // Guard against pathological inputs.
  if (parts.length > 24) return parts.slice(0, 24);
  return parts;
}

function includesToken(value: unknown, tokenLower: string): boolean {
  if (!tokenLower) return true;
  const s = typeof value === "string" ? value : value == null ? "" : String(value);
  if (!s) return false;
  return s.toLowerCase().includes(tokenLower);
}

function jobHasToken(job: Job, tokenLower: string, includeLogs: boolean): boolean {
  if (!job || typeof job !== "object") return false;

  // Fast path: check small string fields first.
  if (
    includesToken(job.id, tokenLower) ||
    includesToken(job.title, tokenLower) ||
    includesToken((job as any).titleLlm, tokenLower) ||
    includesToken(job.status, tokenLower) ||
    includesToken(job.box, tokenLower) ||
    includesToken(job.archiveReason, tokenLower) ||
    includesToken(job.threadId, tokenLower) ||
    includesToken(job.model, tokenLower) ||
    includesToken(job.projectId, tokenLower) ||
    includesToken(job.projectPath, tokenLower)
  ) {
    return true;
  }

  // Prompts (user input).
  for (const p of job.prompts || []) {
    if (!p) continue;
    if (includesToken((p as any).text, tokenLower)) return true;
    if ((p as any).images) {
      for (const img of (p as any).images) {
        if (includesToken(img, tokenLower)) return true;
      }
    }
  }

  // Queued prompts (follow-ups queued while the job is running).
  for (const p of job.queuedPrompts || []) {
    if (!p) continue;
    if (includesToken((p as any).text, tokenLower)) return true;
    if ((p as any).images) {
      for (const img of (p as any).images) {
        if (includesToken(img, tokenLower)) return true;
      }
    }
  }

  // Assistant/user messages (agent output + user follow-ups).
  for (const m of job.messages || []) {
    if (!m) continue;
    if (includesToken((m as any).text, tokenLower)) return true;
  }

  if (!includeLogs) return false;

  // Logs (stdout/stderr + structured codex events). Useful for finding stack traces and command output.
  for (const l of job.logs || []) {
    if (!l) continue;
    if ((l as any).kind === "log") {
      if (includesToken((l as any).text, tokenLower)) return true;
      continue;
    }
    if ((l as any).kind === "codex") {
      const d = (l as any).data && typeof (l as any).data === "object" ? (l as any).data : {};
      if (includesToken((d as any).type, tokenLower)) return true;
      if (includesToken((d as any).thread_id, tokenLower)) return true;
      const item = (d as any).item && typeof (d as any).item === "object" ? (d as any).item : null;
      if (item) {
        if (includesToken((item as any).type, tokenLower)) return true;
        if (includesToken((item as any).command, tokenLower)) return true;
        if (includesToken((item as any).text, tokenLower)) return true;
        if (includesToken((item as any).aggregated_output, tokenLower)) return true;
      }
      continue;
    }
    if ((l as any).kind === "claude") {
      const d = (l as any).data && typeof (l as any).data === "object" ? (l as any).data : {};
      if (includesToken((d as any).type, tokenLower)) return true;
      if (includesToken((d as any).subtype, tokenLower)) return true;
      if (includesToken((d as any).session_id, tokenLower)) return true;
      if (includesToken((d as any).result, tokenLower)) return true;

      const msg = (d as any).message && typeof (d as any).message === "object" ? (d as any).message : null;
      const content = msg ? (msg as any).content : null;
      if (typeof content === "string") {
        if (includesToken(content, tokenLower)) return true;
      } else if (Array.isArray(content)) {
        for (const b of content) {
          if (!b || typeof b !== "object") continue;
          if (includesToken((b as any).type, tokenLower)) return true;
          if (includesToken((b as any).text, tokenLower)) return true;
          if (includesToken((b as any).name, tokenLower)) return true;
        }
      }
    }
  }

  return false;
}

function jobMatchesTokens(job: Job, tokens: string[], includeLogs: boolean): boolean {
  if (tokens.length === 0) return false;
  for (const t of tokens) {
    if (!jobHasToken(job, t, includeLogs)) return false;
  }
  return true;
}

export function searchJobs(jobs: Iterable<Job>, query: unknown, opts?: JobSearchOpts) {
  const tokens = normalizeSearchTokens(query);
  if (tokens.length === 0) return { jobIds: [] as string[], total: 0, truncated: false };

  const o = opts && typeof opts === "object" ? opts : {};
  const includeLogs = o.includeLogs == null ? true : !!o.includeLogs;

  const hardLimitRaw = o.limit;
  const hardLimit = Number.isFinite(Number(hardLimitRaw)) ? Math.max(1, Math.min(20000, Number(hardLimitRaw))) : 20000;

  const matches: Array<{ id: string; createdAt: string }> = [];
  let total = 0;
  for (const job of jobs) {
    if (!jobMatchesTokens(job, tokens, includeLogs)) continue;
    total += 1;
    matches.push({ id: job.id, createdAt: job.createdAt || "" });
  }

  // Newest first (stable for ISO timestamps).
  matches.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const truncated = matches.length > hardLimit;
  const jobIds = (truncated ? matches.slice(0, hardLimit) : matches).map((m) => m.id);

  return { jobIds, total, truncated };
}
