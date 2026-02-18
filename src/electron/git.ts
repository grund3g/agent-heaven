import { spawn } from "node:child_process";
import * as path from "node:path";

function truncate(s: string, max = 12_000): string {
  const str = typeof s === "string" ? s : String(s || "");
  if (str.length <= max) return str;
  return `${str.slice(0, max)}\n...[truncated ${str.length - max} chars]`;
}

function normalizeNewlines(s: unknown): string {
  return String(s || "").replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

type RunOpts = { cwd: string; timeoutMs?: number; maxOutputChars?: number };
type RunResult = { ok: boolean; stdout: string; stderr: string; code: number | null; error: string };

async function run(cmd: string, args: string[], opts: RunOpts): Promise<RunResult> {
  const cwd = String(opts && opts.cwd ? opts.cwd : "").trim() || process.cwd();
  const timeoutMs = typeof opts.timeoutMs === "number" && Number.isFinite(opts.timeoutMs) ? Math.max(250, opts.timeoutMs) : 8_000;
  const maxOutputChars =
    typeof opts.maxOutputChars === "number" && Number.isFinite(opts.maxOutputChars)
      ? Math.max(2_000, Math.min(500_000, Math.trunc(opts.maxOutputChars)))
      : 12_000;

  return await new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let done = false;

    const child = spawn(cmd, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      try {
        child.kill("SIGKILL");
      } catch {
        // ignore
      }
      resolve({
        ok: false,
        stdout: truncate(stdout, maxOutputChars),
        stderr: truncate(stderr, maxOutputChars),
        code: null,
        error: `Command timed out after ${timeoutMs}ms: ${cmd} ${args.join(" ")}`
      });
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));

    child.on("error", (err: any) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({
        ok: false,
        stdout: truncate(stdout, maxOutputChars),
        stderr: truncate(stderr, maxOutputChars),
        code: null,
        error: String(err && err.message ? err.message : err)
      });
    });

    child.on("close", (code: any) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      const c = typeof code === "number" ? code : 0;
      const out = truncate(stdout, maxOutputChars);
      const err = truncate(stderr, maxOutputChars);
      if (c === 0) resolve({ ok: true, stdout: out, stderr: err, code: c, error: "" });
      else
        resolve({
          ok: false,
          stdout: out,
          stderr: err,
          code: c,
          error: `Command failed (code=${c}): ${cmd} ${args.join(" ")}${err ? `\n${err.trim()}` : ""}`
        });
    });
  });
}

async function git(args: string[], opts: RunOpts): Promise<RunResult> {
  return await run("git", args, opts);
}

async function gitOkStdout(args: string[], opts: RunOpts): Promise<string> {
  const res = await git(args, opts);
  if (res.ok) return String(res.stdout || "").trim();
  throw new Error(res.error);
}

async function gitRefExists(opts: RunOpts, ref: string): Promise<boolean> {
  const r = String(ref || "").trim();
  if (!r) return false;
  const res = await git(["show-ref", "--verify", "--quiet", r], { cwd: opts.cwd, timeoutMs: opts.timeoutMs || 2_500 });
  return res.ok;
}

export type GitInfo = {
  isGitRepo: boolean;
  branch: string; // short branch name or "detached@<sha>"
  sha: string; // short sha (best-effort)
  detached: boolean;
  dirty: boolean;
  error?: string;
};

export async function getGitInfo(cwd: string): Promise<GitInfo> {
  const dir = String(cwd || "").trim() || process.cwd();

  // Is this a git work tree?
  {
    const inside = await git(["rev-parse", "--is-inside-work-tree"], { cwd: dir, timeoutMs: 2_500 });
    const ok = inside.ok && String(inside.stdout || "").trim() === "true";
    if (!ok) {
      return {
        isGitRepo: false,
        branch: "",
        sha: "",
        detached: false,
        dirty: false,
        error: inside.ok ? "" : inside.error
      };
    }
  }

  let detached = false;
  let branch = "";
  let sha = "";
  try {
    branch = await gitOkStdout(["symbolic-ref", "--quiet", "--short", "HEAD"], { cwd: dir, timeoutMs: 2_500 });
  } catch {
    detached = true;
  }

  try {
    sha = await gitOkStdout(["rev-parse", "--short", "HEAD"], { cwd: dir, timeoutMs: 2_500 });
  } catch {
    sha = "";
  }

  if (!branch && detached && sha) branch = `detached@${sha}`;

  let dirty = false;
  try {
    const porcelain = await gitOkStdout(["status", "--porcelain=v1"], { cwd: dir, timeoutMs: 4_000 });
    dirty = !!porcelain;
  } catch {
    dirty = false;
  }

  return { isGitRepo: true, branch, sha, detached, dirty };
}

export async function detectDefaultBranch(cwd: string): Promise<string> {
  const dir = String(cwd || "").trim() || process.cwd();

  const info = await getGitInfo(dir);
  if (!info.isGitRepo) return "";

  // Prefer the remote's default branch if origin/HEAD is present.
  try {
    const ref = await gitOkStdout(["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"], { cwd: dir, timeoutMs: 2_500 });
    // Typically "origin/main" -> "main".
    const s = String(ref || "").trim();
    if (s.startsWith("origin/")) return s.slice("origin/".length).trim();
  } catch {
    // ignore
  }

  // Fall back to the currently checked out branch (if any).
  if (!info.detached && info.branch) return info.branch;
  return "";
}

async function gitSwitchOrCheckout(opts: RunOpts, branch: string): Promise<void> {
  const b = String(branch || "").trim();
  if (!b) throw new Error("Missing branch");

  const sw = await git(["switch", b], { cwd: opts.cwd, timeoutMs: opts.timeoutMs || 15_000 });
  if (sw.ok) return;

  // Older git versions might not have `switch`.
  const stderr = String(sw.stderr || "");
  if (stderr.includes("is not a git command") || stderr.toLowerCase().includes("unknown subcommand")) {
    const co = await git(["checkout", b], { cwd: opts.cwd, timeoutMs: opts.timeoutMs || 15_000 });
    if (co.ok) return;
    throw new Error(co.error);
  }

  throw new Error(sw.error);
}

export async function switchBranch(cwd: string, branch: string): Promise<void> {
  const dir = String(cwd || "").trim() || process.cwd();
  const b = String(branch || "").trim();
  if (!b) throw new Error("Missing branch");

  // Attempt direct switch first.
  try {
    await gitSwitchOrCheckout({ cwd: dir, timeoutMs: 20_000 }, b);
    return;
  } catch (err: any) {
    // If the local branch doesn't exist but origin/<branch> does, create a tracking branch.
    const remoteRef = `refs/remotes/origin/${b}`;
    const hasRemote = await gitRefExists({ cwd: dir, timeoutMs: 2_500 }, remoteRef);
    if (!hasRemote) throw err;

    const sw = await git(["switch", "-c", b, "--track", `origin/${b}`], { cwd: dir, timeoutMs: 25_000 });
    if (sw.ok) return;

    const stderr = String(sw.stderr || "");
    if (stderr.includes("is not a git command") || stderr.toLowerCase().includes("unknown subcommand")) {
      const co = await git(["checkout", "-b", b, `origin/${b}`], { cwd: dir, timeoutMs: 25_000 });
      if (co.ok) return;
      throw new Error(co.error);
    }

    throw new Error(sw.error);
  }
}

export async function addWorktree(opts: { repoDir: string; worktreeDir: string; branchName: string; baseRef: string }): Promise<void> {
  const repoDir = String(opts && opts.repoDir ? opts.repoDir : "").trim() || process.cwd();
  const worktreeDir = String(opts && opts.worktreeDir ? opts.worktreeDir : "").trim();
  const branchName = String(opts && opts.branchName ? opts.branchName : "").trim();
  const baseRef = String(opts && opts.baseRef ? opts.baseRef : "").trim();
  if (!worktreeDir) throw new Error("Missing worktreeDir");
  if (!branchName) throw new Error("Missing branchName");
  if (!baseRef) throw new Error("Missing baseRef");

  const created = await git(["worktree", "add", "-b", branchName, worktreeDir, baseRef], { cwd: repoDir, timeoutMs: 5 * 60_000 });
  if (created.ok) return;

  // Recreating a checkout for an existing task can reuse the existing branch.
  const err = String(created.error || "").toLowerCase();
  const branchAlreadyExists = err.includes("already exists") && err.includes("branch");
  if (!branchAlreadyExists) throw new Error(created.error);

  try {
    await git(["worktree", "prune"], { cwd: repoDir, timeoutMs: 60_000 });
  } catch {
    // ignore
  }

  const reused = await git(["worktree", "add", worktreeDir, branchName], { cwd: repoDir, timeoutMs: 5 * 60_000 });
  if (!reused.ok) throw new Error(reused.error);
}

export async function removeWorktree(opts: { repoDir: string; worktreeDir: string }): Promise<void> {
  const repoDir = String(opts && opts.repoDir ? opts.repoDir : "").trim() || process.cwd();
  const worktreeDir = String(opts && opts.worktreeDir ? opts.worktreeDir : "").trim();
  if (!worktreeDir) throw new Error("Missing worktreeDir");

  const rm = await git(["worktree", "remove", "--force", worktreeDir], { cwd: repoDir, timeoutMs: 5 * 60_000 });
  if (!rm.ok) throw new Error(rm.error);

  // Best-effort cleanup of stale worktree metadata.
  try {
    await git(["worktree", "prune"], { cwd: repoDir, timeoutMs: 60_000 });
  } catch {
    // ignore
  }
}

export async function cloneRepo(opts: { srcDir: string; destDir: string; baseBranch?: string }): Promise<void> {
  const srcDir = String(opts && opts.srcDir ? opts.srcDir : "").trim() || process.cwd();
  const destDir = String(opts && opts.destDir ? opts.destDir : "").trim();
  const baseBranch = String(opts && opts.baseBranch ? opts.baseBranch : "").trim();
  if (!destDir) throw new Error("Missing destDir");

  const args = ["clone"];
  if (baseBranch) args.push("--branch", baseBranch, "--single-branch");
  args.push(srcDir, destDir);
  const res = await git(args, { cwd: process.cwd(), timeoutMs: 8 * 60_000 });
  if (!res.ok) throw new Error(res.error);
}

export async function createBranchInRepo(opts: { cwd: string; branchName: string }): Promise<void> {
  const cwd = String(opts && opts.cwd ? opts.cwd : "").trim() || process.cwd();
  const branchName = String(opts && opts.branchName ? opts.branchName : "").trim();
  if (!branchName) throw new Error("Missing branchName");

  const res = await git(["switch", "-c", branchName], { cwd, timeoutMs: 25_000 });
  if (res.ok) return;

  const stderr = String(res.stderr || "");
  if (stderr.includes("is not a git command") || stderr.toLowerCase().includes("unknown subcommand")) {
    const co = await git(["checkout", "-b", branchName], { cwd, timeoutMs: 25_000 });
    if (co.ok) return;
    throw new Error(co.error);
  }

  throw new Error(res.error);
}

export async function getGitCommonDir(cwd: string): Promise<string> {
  const dir = String(cwd || "").trim() || process.cwd();
  const out = await gitOkStdout(["rev-parse", "--git-common-dir"], { cwd: dir, timeoutMs: 2_500 });
  return path.resolve(dir, String(out || "").trim());
}

export async function getPorcelainStatus(cwd: string): Promise<string> {
  const dir = String(cwd || "").trim() || process.cwd();
  return await gitOkStdout(["status", "--porcelain=v1"], { cwd: dir, timeoutMs: 4_000 });
}

export async function listChangedPaths(cwd: string): Promise<string[]> {
  const dir = String(cwd || "").trim() || process.cwd();
  const res = await git(["status", "--porcelain=v1", "-z"], { cwd: dir, timeoutMs: 6_000 });
  if (!res.ok) throw new Error(res.error);
  const raw = String(res.stdout || "");
  if (!raw) return [];

  const parts = raw.split("\0").filter(Boolean);
  const out: string[] = [];

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i] || "";
    // Entry format: XY <path>
    if (part.length >= 4 && part[2] === " ") {
      const status = part.slice(0, 2);
      const p = part.slice(3);
      const isRenameOrCopy = status.includes("R") || status.includes("C");
      if (isRenameOrCopy) {
        const newPath = parts[i + 1] || "";
        const picked = newPath || p;
        if (picked) out.push(picked);
        i += 1; // skip the extra path field
      } else {
        if (p) out.push(p);
      }
    }
  }

  // De-dupe while preserving order.
  const seen = new Set<string>();
  const uniq: string[] = [];
  for (const p of out) {
    const s = String(p || "").trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    uniq.push(s);
  }
  return uniq;
}

export type CheckoutReviewDiff = {
  cwd: string;
  baseRef: string;
  mergeBase: string;
  committedRange: string;
  hasCommittedChanges: boolean;
  hasWorkingTreeChanges: boolean;
  hasChanges: boolean;
  untrackedFiles: string[];
  untrackedFilesOmitted: number;
  truncated: boolean;
  hints: string[];
  diff: string;
};

function normalizeInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

async function tryGitStdout(args: string[], opts: RunOpts): Promise<string> {
  try {
    return await gitOkStdout(args, opts);
  } catch {
    return "";
  }
}

async function gitRefResolvable(cwd: string, ref: string): Promise<boolean> {
  const r = String(ref || "").trim();
  if (!r) return false;
  const res = await git(["rev-parse", "--verify", "--quiet", `${r}^{commit}`], {
    cwd,
    timeoutMs: 2_500,
    maxOutputChars: 1_200
  });
  return !!res.ok;
}

function addRefCandidate(out: string[], seen: Set<string>, value: unknown): void {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return;
  if (seen.has(s)) return;
  seen.add(s);
  out.push(s);
}

async function resolveDiffBaseRef(cwd: string, preferredBranch: string): Promise<string> {
  const candidates: string[] = [];
  const seen = new Set<string>();
  const branch = String(preferredBranch || "").trim();
  if (branch) {
    addRefCandidate(candidates, seen, branch);
    addRefCandidate(candidates, seen, `origin/${branch}`);
    addRefCandidate(candidates, seen, `refs/heads/${branch}`);
    addRefCandidate(candidates, seen, `refs/remotes/origin/${branch}`);
  }

  const originHead = await tryGitStdout(["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"], {
    cwd,
    timeoutMs: 2_500,
    maxOutputChars: 1_200
  });
  if (originHead) {
    addRefCandidate(candidates, seen, originHead);
    if (originHead.startsWith("origin/")) {
      addRefCandidate(candidates, seen, originHead.slice("origin/".length));
    }
  }

  const upstream = await tryGitStdout(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], {
    cwd,
    timeoutMs: 2_500,
    maxOutputChars: 1_200
  });
  if (upstream) {
    addRefCandidate(candidates, seen, upstream);
    if (upstream.startsWith("origin/")) addRefCandidate(candidates, seen, upstream.slice("origin/".length));
  }

  for (const candidate of candidates) {
    if (await gitRefResolvable(cwd, candidate)) return candidate;
  }
  return "";
}

export async function buildCheckoutReviewDiff(
  cwd: string,
  opts?: { defaultBranch?: string; maxChars?: number; maxUntrackedFiles?: number }
): Promise<CheckoutReviewDiff> {
  const dir = String(cwd || "").trim() || process.cwd();
  const maxChars = normalizeInt(opts && opts.maxChars, 160_000, 20_000, 400_000);
  const maxUntrackedFiles = normalizeInt(opts && opts.maxUntrackedFiles, 40, 0, 400);
  const preferredBase = String(opts && opts.defaultBranch ? opts.defaultBranch : "").trim();

  const info = await getGitInfo(dir);
  if (!info.isGitRepo) throw new Error(`Checkout is not a git repo: ${dir}`);

  const hints: string[] = [];
  const baseRef = await resolveDiffBaseRef(dir, preferredBase);
  if (!baseRef) hints.push("Base branch could not be resolved; showing working tree changes only.");

  const headSha = await tryGitStdout(["rev-parse", "HEAD"], { cwd: dir, timeoutMs: 2_500, maxOutputChars: 1_200 });
  let mergeBase = "";
  if (baseRef) {
    mergeBase = await tryGitStdout(["merge-base", "HEAD", baseRef], { cwd: dir, timeoutMs: 4_000, maxOutputChars: 1_200 });
    if (!mergeBase) hints.push(`Could not compute merge-base against ${baseRef}.`);
  }

  let committedRange = "";
  let committedDiff = "";
  if (mergeBase && headSha && mergeBase !== headSha) {
    committedRange = `${mergeBase.slice(0, 12)}..HEAD`;
    const committedRes = await git(
      ["diff", "--no-color", "--patch", "--find-renames", "--submodule=short", `${mergeBase}..HEAD`],
      { cwd: dir, timeoutMs: 20_000, maxOutputChars: maxChars }
    );
    if (!committedRes.ok) throw new Error(committedRes.error);
    committedDiff = normalizeNewlines(committedRes.stdout || "").trimEnd();
  }

  let workingTreeDiff = "";
  if (headSha) {
    const workingRes = await git(["diff", "--no-color", "--patch", "--find-renames", "--submodule=short", "HEAD"], {
      cwd: dir,
      timeoutMs: 20_000,
      maxOutputChars: maxChars
    });
    if (!workingRes.ok) throw new Error(workingRes.error);
    workingTreeDiff = normalizeNewlines(workingRes.stdout || "").trimEnd();
  } else {
    hints.push("Repository has no commits yet; showing staged/unstaged changes.");
    const stagedRes = await git(["diff", "--no-color", "--patch", "--find-renames", "--submodule=short", "--cached"], {
      cwd: dir,
      timeoutMs: 20_000,
      maxOutputChars: maxChars
    });
    if (!stagedRes.ok) throw new Error(stagedRes.error);
    const unstagedRes = await git(["diff", "--no-color", "--patch", "--find-renames", "--submodule=short"], {
      cwd: dir,
      timeoutMs: 20_000,
      maxOutputChars: maxChars
    });
    if (!unstagedRes.ok) throw new Error(unstagedRes.error);

    const stagedDiff = normalizeNewlines(stagedRes.stdout || "").trimEnd();
    const unstagedDiff = normalizeNewlines(unstagedRes.stdout || "").trimEnd();
    const sections: string[] = [];
    if (stagedDiff) {
      sections.push("# staged changes");
      sections.push(stagedDiff);
    }
    if (unstagedDiff) {
      sections.push("# unstaged changes");
      sections.push(unstagedDiff);
    }
    workingTreeDiff = sections.join("\n\n").trimEnd();
  }

  const untrackedRaw = await tryGitStdout(["ls-files", "--others", "--exclude-standard"], {
    cwd: dir,
    timeoutMs: 6_000,
    maxOutputChars: 120_000
  });
  const allUntrackedFiles = normalizeNewlines(untrackedRaw)
    .split("\n")
    .map((s) => String(s || "").trim())
    .filter(Boolean);
  const untrackedFiles = maxUntrackedFiles > 0 ? allUntrackedFiles.slice(0, maxUntrackedFiles) : [];
  const untrackedFilesOmitted = Math.max(0, allUntrackedFiles.length - untrackedFiles.length);

  const parts: string[] = [];
  if (committedDiff) {
    const rangeLabel = committedRange || "merge-base..HEAD";
    parts.push(`# committed changes (${rangeLabel})`);
    parts.push(committedDiff);
  }
  if (workingTreeDiff) {
    parts.push("# uncommitted changes (working tree vs HEAD)");
    parts.push(workingTreeDiff);
  }
  if (untrackedFiles.length > 0 || untrackedFilesOmitted > 0) {
    parts.push("# untracked files");
    for (const rel of untrackedFiles) parts.push(`?? ${rel}`);
    if (untrackedFilesOmitted > 0) {
      parts.push(`... ${untrackedFilesOmitted} more untracked file${untrackedFilesOmitted === 1 ? "" : "s"} omitted`);
    }
  }

  let diff = parts.join("\n\n").trimEnd();
  let truncated = false;
  if (diff.length > maxChars) {
    truncated = true;
    const omitted = diff.length - maxChars;
    diff = `${diff.slice(0, maxChars).trimEnd()}\n\n...[truncated ${omitted} chars]`;
  }
  if (
    committedDiff.includes("...[truncated ") ||
    workingTreeDiff.includes("...[truncated ") ||
    untrackedRaw.includes("...[truncated ")
  ) {
    truncated = true;
  }

  const hasCommittedChanges = !!committedDiff;
  const hasWorkingTreeChanges = !!workingTreeDiff || allUntrackedFiles.length > 0;
  const hasChanges = hasCommittedChanges || hasWorkingTreeChanges;

  return {
    cwd: dir,
    baseRef,
    mergeBase,
    committedRange,
    hasCommittedChanges,
    hasWorkingTreeChanges,
    hasChanges,
    untrackedFiles,
    untrackedFilesOmitted,
    truncated,
    hints,
    diff
  };
}

export async function addAll(cwd: string): Promise<void> {
  const dir = String(cwd || "").trim() || process.cwd();
  const res = await git(["add", "-A"], { cwd: dir, timeoutMs: 20_000 });
  if (!res.ok) throw new Error(res.error);
}

export async function commitWithMessage(cwd: string, message: string): Promise<string> {
  const dir = String(cwd || "").trim() || process.cwd();
  const msg = String(message || "").trim();
  if (!msg) throw new Error("Missing commit message");
  const res = await git(["commit", "-m", msg], { cwd: dir, timeoutMs: 60_000 });
  if (!res.ok) throw new Error(res.error);
  return await gitOkStdout(["rev-parse", "--short", "HEAD"], { cwd: dir, timeoutMs: 2_500 });
}

function looksLikeMissingUpstreamPushError(msg: string): boolean {
  const low = String(msg || "").toLowerCase();
  if (!low) return false;
  return (
    low.includes("has no upstream branch") ||
    low.includes("set upstream") ||
    low.includes("no upstream configured") ||
    low.includes("no upstream branch")
  );
}

function extractRemoteFromUpstreamRef(upstreamRef: string): string {
  const s = String(upstreamRef || "").trim();
  if (!s) return "";
  const idx = s.indexOf("/");
  if (idx <= 0) return "";
  return s.slice(0, idx).trim();
}

async function tryCurrentUpstreamRef(cwd: string): Promise<string> {
  const dir = String(cwd || "").trim() || process.cwd();
  try {
    return await gitOkStdout(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], {
      cwd: dir,
      timeoutMs: 2_500
    });
  } catch {
    return "";
  }
}

export async function pushCurrentBranch(
  cwd: string
): Promise<{ branch: string; upstreamRef: string; remote: string; setUpstream: boolean }> {
  const dir = String(cwd || "").trim() || process.cwd();
  const branch = await gitOkStdout(["rev-parse", "--abbrev-ref", "HEAD"], { cwd: dir, timeoutMs: 2_500 });
  if (!branch || branch === "HEAD") throw new Error("Cannot push from detached HEAD.");

  const firstPush = await git(["push"], { cwd: dir, timeoutMs: 10 * 60_000 });
  if (firstPush.ok) {
    const upstreamRef = await tryCurrentUpstreamRef(dir);
    return {
      branch,
      upstreamRef,
      remote: extractRemoteFromUpstreamRef(upstreamRef),
      setUpstream: false
    };
  }

  const firstErrorText = `${String(firstPush.error || "")}\n${String(firstPush.stderr || "")}`;
  if (!looksLikeMissingUpstreamPushError(firstErrorText)) throw new Error(firstPush.error);

  const hasOrigin = (await git(["remote", "get-url", "origin"], { cwd: dir, timeoutMs: 4_000 })).ok;
  if (!hasOrigin) throw new Error(firstPush.error);

  const fallbackPush = await git(["push", "--set-upstream", "origin", "HEAD"], { cwd: dir, timeoutMs: 10 * 60_000 });
  if (!fallbackPush.ok) {
    const bits = [
      String(firstPush.error || "").trim(),
      String(fallbackPush.error || "").trim()
    ].filter(Boolean);
    throw new Error(bits.join("\n\n"));
  }

  const upstreamRef = await tryCurrentUpstreamRef(dir);
  return {
    branch,
    upstreamRef,
    remote: extractRemoteFromUpstreamRef(upstreamRef) || "origin",
    setUpstream: true
  };
}

export async function listRecentCommitSubjects(cwd: string, limit: number): Promise<string[]> {
  const dir = String(cwd || "").trim() || process.cwd();
  const n = Number.isFinite(Number(limit)) ? Math.max(0, Math.min(200, Math.trunc(Number(limit)))) : 0;
  if (!n) return [];
  const out = await gitOkStdout(["log", "-n", String(n), "--pretty=format:%s"], { cwd: dir, timeoutMs: 6_000 });
  return String(out || "")
    .split("\n")
    .map((s) => String(s || "").trim())
    .filter(Boolean);
}

export async function listCommitsInRange(
  cwd: string,
  range: string,
  opts?: { noMerges?: boolean }
): Promise<string[]> {
  const dir = String(cwd || "").trim() || process.cwd();
  const r = String(range || "").trim();
  if (!r) return [];
  const noMerges = opts && typeof opts === "object" ? opts.noMerges !== false : true;

  const args = ["rev-list", "--reverse"];
  if (noMerges) args.push("--no-merges");
  args.push(r);

  const out = await gitOkStdout(args, { cwd: dir, timeoutMs: 8_000 });
  return String(out || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function hasCherryPickInProgress(cwd: string): Promise<boolean> {
  const dir = String(cwd || "").trim() || process.cwd();
  const res = await git(["rev-parse", "-q", "--verify", "CHERRY_PICK_HEAD"], { cwd: dir, timeoutMs: 2_500 });
  return !!res.ok;
}

export async function cherryPick(cwd: string, commits: string[]): Promise<void> {
  const dir = String(cwd || "").trim() || process.cwd();
  const arr = Array.isArray(commits) ? commits.map((c) => String(c || "").trim()).filter(Boolean) : [];
  if (arr.length === 0) return;

  function looksLikeEmptyCherryPickError(msg: string): boolean {
    const low = String(msg || "").toLowerCase();
    if (!low) return false;
    return low.includes("cherry-pick is now empty") || low.includes("previous cherry-pick is now empty");
  }

  for (const commit of arr) {
    const pick = await git(["cherry-pick", commit], { cwd: dir, timeoutMs: 10 * 60_000 });
    if (pick.ok) continue;

    const pickText = `${String(pick.error || "")}\n${String(pick.stderr || "")}`;
    if (!looksLikeEmptyCherryPickError(pickText)) throw new Error(pick.error);

    // Commit is already effectively present (or became empty after prior picks); skip and continue.
    const skip = await git(["cherry-pick", "--skip"], { cwd: dir, timeoutMs: 60_000 });
    if (!skip.ok) {
      const bits = [String(pick.error || "").trim(), String(skip.error || "").trim()].filter(Boolean);
      throw new Error(bits.join("\n\n"));
    }
  }
}

export async function findWorktreePathForBranch(cwd: string, branchName: string): Promise<string> {
  const dir = String(cwd || "").trim() || process.cwd();
  const b = String(branchName || "").trim();
  if (!b) return "";

  const wantRef = `refs/heads/${b}`;

  let raw = "";
  try {
    raw = await gitOkStdout(["worktree", "list", "--porcelain"], { cwd: dir, timeoutMs: 8_000 });
  } catch {
    raw = "";
  }
  if (!raw) return "";

  let current: { worktree: string; branch: string } | null = null;
  const entries: Array<{ worktree: string; branch: string }> = [];

  for (const line of String(raw).split("\n")) {
    const s = line.trim();
    if (!s) {
      if (current && current.worktree) entries.push(current);
      current = null;
      continue;
    }

    const sp = s.indexOf(" ");
    const key = sp === -1 ? s : s.slice(0, sp);
    const val = sp === -1 ? "" : s.slice(sp + 1).trim();
    if (key === "worktree") {
      if (current && current.worktree) entries.push(current);
      current = { worktree: val, branch: "" };
      continue;
    }
    if (!current) continue;
    if (key === "branch") current.branch = val;
  }
  if (current && current.worktree) entries.push(current);

  for (const e of entries) {
    if (e.branch === wantRef) return e.worktree;
  }
  return "";
}
