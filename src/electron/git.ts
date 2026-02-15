import { spawn } from "node:child_process";

function truncate(s: string, max = 12_000): string {
  const str = typeof s === "string" ? s : String(s || "");
  if (str.length <= max) return str;
  return `${str.slice(0, max)}\n...[truncated ${str.length - max} chars]`;
}

type RunOpts = { cwd: string; timeoutMs?: number };
type RunResult = { ok: boolean; stdout: string; stderr: string; code: number | null; error: string };

async function run(cmd: string, args: string[], opts: RunOpts): Promise<RunResult> {
  const cwd = String(opts && opts.cwd ? opts.cwd : "").trim() || process.cwd();
  const timeoutMs = typeof opts.timeoutMs === "number" && Number.isFinite(opts.timeoutMs) ? Math.max(250, opts.timeoutMs) : 8_000;

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
        stdout: truncate(stdout),
        stderr: truncate(stderr),
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
        stdout: truncate(stdout),
        stderr: truncate(stderr),
        code: null,
        error: String(err && err.message ? err.message : err)
      });
    });

    child.on("close", (code: any) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      const c = typeof code === "number" ? code : 0;
      const out = truncate(stdout);
      const err = truncate(stderr);
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

  const res = await git(["worktree", "add", "-b", branchName, worktreeDir, baseRef], { cwd: repoDir, timeoutMs: 5 * 60_000 });
  if (!res.ok) throw new Error(res.error);
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
