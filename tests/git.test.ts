import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { addWorktree, buildCheckoutReviewDiff, cherryPick } from "../src/electron/git";

function runGit(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" });
}

function initRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ah-git-test-"));
  runGit(dir, ["init", "-b", "main"]);
  runGit(dir, ["config", "user.email", "test@example.com"]);
  runGit(dir, ["config", "user.name", "AH Test"]);
  fs.writeFileSync(path.join(dir, "file.txt"), "line 1\n", "utf8");
  runGit(dir, ["add", "file.txt"]);
  runGit(dir, ["commit", "-m", "base"]);
  return dir;
}

function initEmptyRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ah-git-empty-test-"));
  runGit(dir, ["init", "-b", "main"]);
  runGit(dir, ["config", "user.email", "test@example.com"]);
  runGit(dir, ["config", "user.name", "AH Test"]);
  return dir;
}

function hasCherryPickInProgress(cwd: string): boolean {
  const res = spawnSync("git", ["rev-parse", "--verify", "--quiet", "CHERRY_PICK_HEAD"], { cwd });
  return res.status === 0;
}

function normalizeEol(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

describe("electron/git cherryPick", () => {
  it("skips empty cherry-picks and continues with remaining commits", async () => {
    const dir = initRepo();

    runGit(dir, ["checkout", "-b", "feature"]);
    fs.writeFileSync(path.join(dir, "file.txt"), "line 1\nline A\n", "utf8");
    runGit(dir, ["add", "file.txt"]);
    runGit(dir, ["commit", "-m", "feature A"]);
    const commitA = runGit(dir, ["rev-parse", "HEAD"]).trim();

    fs.writeFileSync(path.join(dir, "file.txt"), "line 1\nline A\nline B\n", "utf8");
    runGit(dir, ["add", "file.txt"]);
    runGit(dir, ["commit", "-m", "feature B"]);
    const commitB = runGit(dir, ["rev-parse", "HEAD"]).trim();

    runGit(dir, ["checkout", "main"]);
    runGit(dir, ["cherry-pick", commitA]);

    await cherryPick(dir, [commitA, commitB]);

    const text = normalizeEol(fs.readFileSync(path.join(dir, "file.txt"), "utf8"));
    expect(text).toBe("line 1\nline A\nline B\n");
    expect(hasCherryPickInProgress(dir)).toBe(false);
  });

  it("still fails on real conflicts", async () => {
    const dir = initRepo();

    runGit(dir, ["checkout", "-b", "feature"]);
    fs.writeFileSync(path.join(dir, "file.txt"), "line 1 from feature\n", "utf8");
    runGit(dir, ["add", "file.txt"]);
    runGit(dir, ["commit", "-m", "feature change"]);
    const featureCommit = runGit(dir, ["rev-parse", "HEAD"]).trim();

    runGit(dir, ["checkout", "main"]);
    fs.writeFileSync(path.join(dir, "file.txt"), "line 1 from main\n", "utf8");
    runGit(dir, ["add", "file.txt"]);
    runGit(dir, ["commit", "-m", "main change"]);

    await expect(cherryPick(dir, [featureCommit])).rejects.toThrow();
    expect(hasCherryPickInProgress(dir)).toBe(true);

    runGit(dir, ["cherry-pick", "--abort"]);
    expect(hasCherryPickInProgress(dir)).toBe(false);
  });
});

describe("electron/git addWorktree", () => {
  it("reuses an existing task branch when recreating a worktree", async () => {
    const dir = initRepo();

    const wt1 = path.join(dir, "..", `ah-wt-${Date.now()}-1`);
    const wt2 = path.join(dir, "..", `ah-wt-${Date.now()}-2`);
    const branchName = "ah/job/test";

    await addWorktree({ repoDir: dir, worktreeDir: wt1, branchName, baseRef: "main" });
    runGit(dir, ["worktree", "remove", "--force", wt1]);

    await addWorktree({ repoDir: dir, worktreeDir: wt2, branchName, baseRef: "main" });

    const checkedOut = runGit(wt2, ["rev-parse", "--abbrev-ref", "HEAD"]).trim();
    expect(checkedOut).toBe(branchName);
  });
});

describe("electron/git buildCheckoutReviewDiff", () => {
  it("includes committed, uncommitted, and untracked changes", async () => {
    const dir = initRepo();

    runGit(dir, ["checkout", "-b", "feature"]);
    fs.writeFileSync(path.join(dir, "file.txt"), "line 1\nline 2\n", "utf8");
    runGit(dir, ["add", "file.txt"]);
    runGit(dir, ["commit", "-m", "feature change"]);

    fs.writeFileSync(path.join(dir, "file.txt"), "line 1\nline 2\nline 3\n", "utf8");
    fs.writeFileSync(path.join(dir, "new-file.ts"), "export const ok = true;\n", "utf8");

    const diff = await buildCheckoutReviewDiff(dir, { defaultBranch: "main", maxChars: 180_000 });

    expect(diff.baseRef).toContain("main");
    expect(diff.hasCommittedChanges).toBe(true);
    expect(diff.hasWorkingTreeChanges).toBe(true);
    expect(diff.hasChanges).toBe(true);
    expect(diff.untrackedFiles).toContain("new-file.ts");
    expect(diff.diff).toContain("# committed changes");
    expect(diff.diff).toContain("# uncommitted changes");
    expect(diff.diff).toContain("diff --git");
  });

  it("returns no changes for a clean checkout", async () => {
    const dir = initRepo();
    const diff = await buildCheckoutReviewDiff(dir, { defaultBranch: "main" });

    expect(diff.hasChanges).toBe(false);
    expect(diff.hasCommittedChanges).toBe(false);
    expect(diff.hasWorkingTreeChanges).toBe(false);
    expect(diff.diff).toBe("");
  });

  it("handles repositories without an initial commit", async () => {
    const dir = initEmptyRepo();
    fs.writeFileSync(path.join(dir, "draft.ts"), "export const draft = 1;\n", "utf8");

    const diff = await buildCheckoutReviewDiff(dir, { defaultBranch: "main" });

    expect(diff.hasChanges).toBe(true);
    expect(diff.hasCommittedChanges).toBe(false);
    expect(diff.hasWorkingTreeChanges).toBe(true);
    expect(diff.diff).toContain("# untracked files");
    expect(diff.hints.some((h) => h.includes("no commits yet"))).toBe(true);
  });
});
