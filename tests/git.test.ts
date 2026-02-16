import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { cherryPick } from "../src/electron/git";

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
