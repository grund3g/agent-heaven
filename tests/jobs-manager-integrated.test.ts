import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/electron/git", async () => {
  const actual = (await vi.importActual("../src/electron/git")) as any;
  return {
    ...actual,
    detectDefaultBranch: vi.fn(),
    getGitInfo: vi.fn(),
    getGitCommonDir: vi.fn(),
    listCommitsInRange: vi.fn()
  };
});

import * as git from "../src/electron/git";
import { JobsManager } from "../src/electron/jobs-manager";

class FakeChild extends EventEmitter {
  kill(_signal: string) {
    return true;
  }
}

function gitInfo(patch?: Partial<any>) {
  return {
    isGitRepo: true,
    branch: "ah/job/job1",
    sha: "abc123",
    detached: false,
    dirty: false,
    ...(patch || {})
  };
}

async function createIntegratedJob(events: any[] = []) {
  const store = {
    getSettings: () => ({}),
    listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj", defaultBranch: "main" }]
  };
  const history = { loadAll: () => [], save: () => true, remove: () => true };
  const jm = new JobsManager({
    store,
    history,
    sendJobEvent: (p: any) => events.push(p),
    runCodexExec: () => new FakeChild() as any,
    runCodexResume: () => new FakeChild() as any,
    needsAttentionHeuristic: () => false,
    createId: () => "job1"
  });

  const startRes = await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] });
  expect(startRes).toEqual({ ok: true, jobId: "job1" });

  jm.setIntegratedToDefault("job1", { at: "2020-01-01T00:00:00.000Z", branch: "main" });
  return jm;
}

describe("electron/jobs-manager integrated revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (git.detectDefaultBranch as any).mockResolvedValue("main");
    (git.getGitInfo as any).mockResolvedValue(gitInfo());
    (git.getGitCommonDir as any).mockResolvedValue("/tmp/common");
    (git.listCommitsInRange as any).mockResolvedValue([]);
  });

  it("clears merged marker when checkout has uncommitted changes", async () => {
    const events: any[] = [];
    const jm = await createIntegratedJob(events);

    (git.getGitInfo as any).mockResolvedValueOnce(gitInfo({ dirty: true }));

    await jm.reconcileIntegratedToDefault("job1");

    const snap = jm.getJob("job1") as any;
    expect(snap.job.integratedToDefaultAt).toBe("");
    expect(snap.job.integratedToDefaultBranch).toBe("");
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.integratedToDefaultAt === "")).toBe(true);
  });

  it("clears merged marker when checkout is ahead of default branch again", async () => {
    const jm = await createIntegratedJob();
    (git.listCommitsInRange as any).mockResolvedValueOnce(["abc123"]);

    await jm.reconcileIntegratedToDefault("job1");

    const snap = jm.getJob("job1") as any;
    expect(snap.job.integratedToDefaultAt).toBe("");
    expect(snap.job.integratedToDefaultBranch).toBe("");
    expect(git.listCommitsInRange).toHaveBeenCalledWith("/tmp/proj", "main..HEAD", { noMerges: false });
  });

  it("keeps merged marker when checkout has no new work", async () => {
    const jm = await createIntegratedJob();

    await jm.reconcileIntegratedToDefault("job1");

    const snap = jm.getJob("job1") as any;
    expect(snap.job.integratedToDefaultAt).toBe("2020-01-01T00:00:00.000Z");
    expect(snap.job.integratedToDefaultBranch).toBe("main");
  });
});
