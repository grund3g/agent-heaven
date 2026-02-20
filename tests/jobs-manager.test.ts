import { EventEmitter } from "node:events";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as git from "../src/electron/git";
import { JobsManager } from "../src/electron/jobs-manager";

class FakeChild extends EventEmitter {
  killed = false;

  kill(_signal: string) {
    this.killed = true;
    return true;
  }
}

describe("electron/jobs-manager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("validates start params", async () => {
    const store = {
      getSettings: () => ({}),
      listProjects: () => []
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };
    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "" })).toEqual({ ok: false, error: "Prompt is empty" });
    expect(await jm.start({ prompt: "hi", projectId: "p1" })).toEqual({
      ok: false,
      error: "No projects configured. Add one in sidebar."
    });
  });

  it("starts jobs, handles thread.started, and can resume", async () => {
    const events: any[] = [];
    const saved: any[] = [];

    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = {
      loadAll: () => [],
      save: (job: any) => {
        saved.push(job);
        return true;
      },
      remove: () => true
    };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    let resumeOpts: any = null;
    const resumeChild = new FakeChild();
    const runCodexResume = (opts: any) => {
      resumeOpts = opts;
      return resumeChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: (p: any) => events.push(p),
      runCodexExec,
      runCodexResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    const startRes = await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] });
    expect(startRes).toEqual({ ok: true, jobId: "job1" });
    expect(events.some((e) => e.kind === "created" && e.jobId === "job1")).toBe(true);
    const createdEvent = events.find((e) => e.kind === "created" && e.jobId === "job1");
    expect(createdEvent && createdEvent.job && createdEvent.job.title).toBe("Do the thing");
    expect(saved.length).toBeGreaterThan(0);

    expect(execOnEvent).not.toBeNull();
    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "thread.started", thread_id: "t123" }
    });
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.threadId === "t123")).toBe(true);

    execOnEvent!({
      ts: "2020-01-01T00:00:00.100Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "token.usage.updated", model_context_window: 128000 }
    });
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.modelContextWindow === 128000)).toBe(true);

    execChild.emit("close", 0, null);
    const snap = jm.getJob("job1");
    expect(snap.ok).toBe(true);
    expect((snap as any).job.threadId).toBe("t123");
    expect((snap as any).job.title).toBe("Do the thing");
    expect((snap as any).job.status).toBe("done");

    const sendRes = await jm.send({ jobId: "job1", prompt: "follow up", images: [] });
    expect(sendRes).toEqual({ ok: true });
    expect(resumeOpts.threadId).toBe("t123");

    const snap2 = jm.getJob("job1") as any;
    expect(snap2.job.status).toBe("running");
    expect(Array.isArray(snap2.job.prompts)).toBe(true);
    expect(snap2.job.prompts.length).toBe(2);
  });

  it("enriches prompt via integration runtime and notifies completion hooks", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } }, integrations: { enabled: true } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    const execChild = new FakeChild();
    const runCodexExec = vi.fn((opts: any) => {
      (runCodexExec as any).lastOpts = opts;
      return execChild as any;
    });

    const integrationRuntime = {
      preparePrompt: vi.fn(async () => ({
        prompt: "ENRICHED PROMPT",
        bindings: [
          {
            connectorId: "linear",
            capability: "ticket.comment",
            resourceType: "issue",
            resourceId: "id-123",
            externalRef: "LIN-123"
          }
        ],
        messages: [{ connectorId: "linear", level: "info", text: "attached" }]
      })),
      notifyRunCompleted: vi.fn(async () => ({
        messages: [{ connectorId: "linear", level: "info", text: "commented" }]
      }))
    } as any;

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: runCodexExec as any,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      integrationRuntime,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Fix LIN-123", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(integrationRuntime.preparePrompt).toHaveBeenCalledTimes(1);
    expect((runCodexExec as any).lastOpts.prompt).toContain("ENRICHED PROMPT");

    execChild.emit("close", 1, null);
    await Promise.resolve();
    await Promise.resolve();

    expect(integrationRuntime.notifyRunCompleted).toHaveBeenCalledTimes(1);
    expect(integrationRuntime.notifyRunCompleted.mock.calls[0][0].status).toBe("failed");
    expect(integrationRuntime.notifyRunCompleted.mock.calls[0][0].bindings).toHaveLength(1);

    const snap = jm.getJob("job1") as any;
    expect(Array.isArray(snap.job.processBindings)).toBe(true);
    expect(snap.job.processBindings[0].externalRef).toBe("LIN-123");
  });

  it("falls back to project path when a job checkout path no longer exists", async () => {
    const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), "ah-proj-"));
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: projectPath }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    let resumeOpts: any = null;
    const runCodexResume = (opts: any) => {
      resumeOpts = opts;
      return new FakeChild() as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec,
      runCodexResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();
    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "thread.started", thread_id: "t123" }
    });
    execChild.emit("close", 0, null);

    // Simulate that an isolated checkout got removed during archive/trash cleanup.
    (jm as any).jobs.get("job1").projectPath = path.join(os.tmpdir(), "missing-checkout-path-does-not-exist");

    expect(await jm.send({ jobId: "job1", prompt: "follow up", images: [] })).toEqual({ ok: true });
    expect(resumeOpts).not.toBeNull();
    expect(resumeOpts.cwd).toBe(projectPath);

    const snap = jm.getJob("job1") as any;
    expect(snap.job.projectPath).toBe(projectPath);
  });

  it("asks for a decision when a managed worktree checkout is missing", async () => {
    const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), "ah-proj-"));
    const checkoutsDir = fs.mkdtempSync(path.join(os.tmpdir(), "ah-checkouts-"));
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: projectPath }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    let resumeOpts: any = null;
    const runCodexResume = (opts: any) => {
      resumeOpts = opts;
      return new FakeChild() as any;
    };

    const jm = new JobsManager({
      store,
      history,
      checkoutsDir,
      sendJobEvent: () => {},
      runCodexExec,
      runCodexResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();
    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "thread.started", thread_id: "t123" }
    });
    execChild.emit("close", 0, null);

    const missingPath = path.join(checkoutsDir, "worktrees", "p1", "job1");
    (jm as any).jobs.get("job1").projectPath = missingPath;
    expect(fs.existsSync(missingPath)).toBe(false);

    const askRes = await jm.send({ jobId: "job1", prompt: "follow up", images: [] });
    expect(askRes).toMatchObject({
      ok: true,
      needsCheckoutDecision: { kind: "recreate_worktree", missingPath, projectPath }
    });
    expect(resumeOpts).toBeNull();

    const snapAfterAsk = jm.getJob("job1") as any;
    expect(Array.isArray(snapAfterAsk.job.queuedPrompts)).toBe(true);
    expect(snapAfterAsk.job.queuedPrompts.length).toBe(0);

    expect(await jm.send({ jobId: "job1", prompt: "follow up", images: [], missingCheckoutAction: "fallback_to_project" })).toEqual({ ok: true });
    expect(resumeOpts).not.toBeNull();
    expect(resumeOpts.cwd).toBe(projectPath);

    const snapAfterFallback = jm.getJob("job1") as any;
    expect(snapAfterFallback.job.projectPath).toBe(projectPath);
  });

  it("can recreate a missing managed worktree checkout before resuming", async () => {
    const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), "ah-proj-"));
    const checkoutsDir = fs.mkdtempSync(path.join(os.tmpdir(), "ah-checkouts-"));
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: projectPath }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    let resumeOpts: any = null;
    const runCodexResume = (opts: any) => {
      resumeOpts = opts;
      return new FakeChild() as any;
    };

    const addWorktreeSpy = vi.spyOn(git, "addWorktree").mockImplementation(async (opts: any) => {
      const wt = String(opts && opts.worktreeDir ? opts.worktreeDir : "").trim();
      if (wt) fs.mkdirSync(wt, { recursive: true });
    });

    const jm = new JobsManager({
      store,
      history,
      checkoutsDir,
      sendJobEvent: () => {},
      runCodexExec,
      runCodexResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();
    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "thread.started", thread_id: "t123" }
    });
    execChild.emit("close", 0, null);

    const missingPath = path.join(checkoutsDir, "worktrees", "p1", "job1");
    (jm as any).jobs.get("job1").projectPath = missingPath;
    expect(fs.existsSync(missingPath)).toBe(false);

    expect(await jm.send({ jobId: "job1", prompt: "follow up", images: [], missingCheckoutAction: "recreate_worktree" })).toEqual({
      ok: true
    });
    expect(addWorktreeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        repoDir: projectPath,
        worktreeDir: missingPath,
        branchName: "ah/job/job1"
      })
    );
    expect(resumeOpts).not.toBeNull();
    expect(resumeOpts.cwd).toBe(missingPath);

    const snap = jm.getJob("job1") as any;
    expect(snap.job.projectPath).toBe(missingPath);
  });

  it("tracks integrate-to-default progress as ephemeral metadata", async () => {
    const events: any[] = [];
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
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

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });

    expect(jm.isIntegratingToDefault("job1")).toBe(false);
    expect(jm.setIntegratingToDefault("job1", true)).toEqual({ ok: true });
    expect(jm.isIntegratingToDefault("job1")).toBe(true);
    expect((jm.getJob("job1") as any).job.integratingToDefault).toBe(true);
    expect(jm.listJobMetas()[0].integratingToDefault).toBe(true);
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.integratingToDefault === true)).toBe(true);

    expect(jm.setIntegratingToDefault("job1", false)).toEqual({ ok: true });
    expect(jm.isIntegratingToDefault("job1")).toBe(false);
    expect((jm.getJob("job1") as any).job.integratingToDefault).toBe(false);
    expect(jm.listJobMetas()[0].integratingToDefault).toBe(false);
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.integratingToDefault === false)).toBe(true);
  });

  it("records integrate requests as chat prompts", async () => {
    const events: any[] = [];
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
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

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(jm.appendActionPrompt("job1", 'Integrate this checkout into the default branch "main".')).toEqual({ ok: true });

    const snap = jm.getJob("job1") as any;
    expect(Array.isArray(snap.job.prompts)).toBe(true);
    expect(snap.job.prompts.length).toBe(2);
    expect(snap.job.prompts[1].text).toBe('Integrate this checkout into the default branch "main".');

    expect(
      events.some(
        (e) =>
          e.kind === "meta" &&
          e.patch &&
          Array.isArray(e.patch.prompts) &&
          String(e.patch.promptPreview || "").includes("Integrate this checkout into the default branch")
      )
    ).toBe(true);
  });

  it("supports per-run checkoutMode overrides", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj", checkoutMode: "worktree" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    // Project is configured for worktrees, but overriding to inplace should avoid needing a checkouts directory.
    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [], checkoutMode: "inplace" })).toEqual({ ok: true, jobId: "job1" });

    const snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.projectPath).toBe("/tmp/proj");
  });

  it("normalizes checkoutMode override alias dedicated_checkout", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj", checkoutMode: "inplace" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    const res = await jm.start({ prompt: "Do the thing", projectId: "p1", images: [], checkoutMode: "dedicated_checkout" });
    expect(res).toEqual({ ok: false, error: "Checkouts directory is not configured" });
  });

  it("defers worktree creation for analysis-like prompts", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj", checkoutMode: "worktree" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    // No checkoutsDir configured on purpose: analysis-style prompts should stay in-place.
    expect(await jm.start({ prompt: "Kannst du das bitte analysieren und die Risiken zusammenfassen?", projectId: "p1", images: [] })).toEqual({
      ok: true,
      jobId: "job1"
    });

    const snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.projectPath).toBe("/tmp/proj");
  });

  it("switches deferred in-place jobs to worktree when follow-up asks for changes", async () => {
    const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), "ah-proj-"));
    const checkoutsDir = fs.mkdtempSync(path.join(os.tmpdir(), "ah-checkouts-"));
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: projectPath, checkoutMode: "worktree" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    let resumeOpts: any = null;
    const runCodexResume = (opts: any) => {
      resumeOpts = opts;
      return new FakeChild() as any;
    };

    const addWorktreeSpy = vi.spyOn(git, "addWorktree").mockImplementation(async (opts: any) => {
      const wt = String(opts && opts.worktreeDir ? opts.worktreeDir : "").trim();
      if (wt) fs.mkdirSync(wt, { recursive: true });
    });

    const jm = new JobsManager({
      store,
      history,
      checkoutsDir,
      sendJobEvent: () => {},
      runCodexExec,
      runCodexResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Kannst du das bitte analysieren?", projectId: "p1", images: [] })).toEqual({
      ok: true,
      jobId: "job1"
    });
    expect(execOnEvent).not.toBeNull();
    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "thread.started", thread_id: "t123" }
    });
    execChild.emit("close", 0, null);

    expect(await jm.send({ jobId: "job1", prompt: "Bitte implementiere jetzt die Änderung in src/app.ts", images: [] })).toEqual({
      ok: true
    });

    const expectedWorktree = path.join(checkoutsDir, "worktrees", "p1", "job1");
    expect(addWorktreeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        repoDir: projectPath,
        worktreeDir: expectedWorktree,
        branchName: "ah/job/job1"
      })
    );
    expect(resumeOpts).not.toBeNull();
    expect(resumeOpts.cwd).toBe(expectedWorktree);

    const snap = jm.getJob("job1") as any;
    expect(snap.job.projectPath).toBe(expectedWorktree);
    expect(snap.job.checkoutModePreference).toBe("worktree");
    expect(snap.job.checkoutModeEffective).toBe("worktree");
  });

  it("still requires checkoutsDir for worktree write prompts", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj", checkoutMode: "worktree" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Bitte implementiere die Änderung in src/app.ts", projectId: "p1", images: [] })).toEqual({
      ok: false,
      error: "Checkouts directory is not configured"
    });
  });

  it("trims jobId in getJob", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect((jm.getJob("  job1  ") as any).ok).toBe(true);
  });

  it("kills running child processes during shutdown", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };
    const execChild = new FakeChild();

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => execChild as any,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect((jm as any).procs.size).toBe(1);

    jm.shutdown();

    expect(execChild.killed).toBe(true);
    expect((jm as any).procs.size).toBe(0);
    await vi.runOnlyPendingTimersAsync();
  });

  it("queues follow-ups while running and drains them after a successful run", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    let resumeOpts: any = null;
    const resumeChild = new FakeChild();
    const runCodexResume = (opts: any) => {
      resumeOpts = opts;
      return resumeChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec,
      runCodexResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();
    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "thread.started", thread_id: "t123" }
    });

    // While running, send should queue (not error).
    expect(await jm.send({ jobId: "job1", prompt: "queued follow up", images: [] })).toEqual({ ok: true });
    const snapQueued = jm.getJob("job1") as any;
    expect(snapQueued.job.status).toBe("running");
    expect(Array.isArray(snapQueued.job.queuedPrompts)).toBe(true);
    expect(snapQueued.job.queuedPrompts.length).toBe(1);

    // First run completes successfully -> queued prompt auto-resumes.
    execChild.emit("close", 0, null);
    expect(resumeOpts).not.toBeNull();
    expect(resumeOpts.threadId).toBe("t123");

    const snapRunningAgain = jm.getJob("job1") as any;
    expect(snapRunningAgain.job.status).toBe("running");
    expect(snapRunningAgain.job.queuedPrompts.length).toBe(0);
    expect(snapRunningAgain.job.prompts.length).toBe(2);

    // Second run completes -> job is done.
    resumeChild.emit("close", 0, null);
    const snapDone = jm.getJob("job1") as any;
    expect(snapDone.job.status).toBe("done");
  });

  it("uses AH_STATUS hints from the agent to set Done vs Needs Attention", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "codex",
      data: {
        type: "item.completed",
        item: { type: "agent_message", text: "Bitte entscheide: Option A oder B?\nAH_STATUS: needs_attention\n" }
      }
    });

    execChild.emit("close", 0, null);
    const snap = jm.getJob("job1") as any;
    expect(snap.job.status).toBe("needs_attention");
    expect(snap.job.messages.length).toBe(1);
    expect(snap.job.messages[0].text).toBe("Bitte entscheide: Option A oder B?");
    expect(snap.job.messages[0].text.includes("AH_STATUS")).toBe(false);
  });

  it("ignores non-actionable AH_STATUS needs_attention hints with no visible ask", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "item.completed", item: { type: "agent_message", text: "AH_STATUS: needs_attention\n" } }
    });

    execChild.emit("close", 0, null);
    const snap = jm.getJob("job1") as any;
    expect(snap.job.status).toBe("done");
    expect(snap.job.messages.length).toBe(0);
  });

  it("reclassifies successful runs with a final LLM pass", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    let execChild: FakeChild | null = null;

    const runCodexExec = (opts: any) => {
      const prompt = String((opts && opts.prompt) || "");
      const child = new FakeChild();

      if (prompt.includes("Create a concise job card title summarizing the user's request.")) {
        setTimeout(() => child.emit("close", 0, null), 0);
        return child as any;
      }

      if (prompt.includes("Classify whether the final assistant response should be shown in Done or Needs Attention.")) {
        setTimeout(() => {
          if (typeof opts.onEvent === "function") {
            opts.onEvent({
              ts: "2020-01-01T00:00:02.000Z",
              stream: "stdout",
              kind: "codex",
              data: { type: "item.completed", item: { type: "agent_message", text: "needs_attention" } }
            });
          }
          child.emit("close", 0, null);
        }, 0);
        return child as any;
      }

      execOnEvent = opts.onEvent;
      execChild = child;
      return child as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();
    expect(execChild).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "item.completed", item: { type: "agent_message", text: "Ich brauche deine Entscheidung: Option A oder B?" } }
    });

    execChild!.emit("close", 0, null);
    await vi.runAllTimersAsync();

    const snap = jm.getJob("job1") as any;
    expect(snap.job.status).toBe("needs_attention");
  });

  it("starts claude jobs, handles system init, and can resume", async () => {
    const events: any[] = [];

    const store = {
      getSettings: () => ({
        agents: {
          codex: { path: "", model: "" },
          claude: { path: "", model: "sonnet", permissionMode: "acceptEdits", dangerouslySkipPermissions: false }
        }
      }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    let execOpts: any = null;
    const execChild = new FakeChild();
    const runClaudeExec = (opts: any) => {
      execOpts = opts;
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    let resumeOpts: any = null;
    const resumeChild = new FakeChild();
    const runClaudeResume = (opts: any) => {
      resumeOpts = opts;
      return resumeChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: (p: any) => events.push(p),
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec,
      runClaudeResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    const startRes = await jm.start({ prompt: "Do the thing", projectId: "p1", agent: "claude", images: [] });
    expect(startRes).toEqual({ ok: true, jobId: "job1" });
    expect(execOpts && execOpts.model).toBe("sonnet");
    expect(execOpts && typeof execOpts.sessionId === "string" && execOpts.sessionId.length > 0).toBe(true);
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "claude",
      data: { type: "system", subtype: "init", session_id: "s123", model: "claude-sonnet-4-5" }
    });
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.threadId === "s123")).toBe(true);
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.model === "claude-sonnet-4-5")).toBe(true);

    execOnEvent!({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "claude",
      data: { type: "assistant", parent_tool_use_id: null, message: { content: [{ type: "text", text: "hello" }] } }
    });
    expect(events.some((e) => e.kind === "message" && e.message && e.message.text === "hello")).toBe(true);

    execOnEvent!({
      ts: "2020-01-01T00:00:02.000Z",
      stream: "stdout",
      kind: "claude",
      data: { type: "result", subtype: "success", usage: { input_tokens: 1, output_tokens: 2 } }
    });

    execChild.emit("close", 0, null);
    const snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.threadId).toBe("s123");
    expect(snap.job.model).toBe("claude-sonnet-4-5");
    expect(snap.job.status).toBe("done");
    expect(snap.job.usageTotal.turns).toBe(1);

    const sendRes = await jm.send({ jobId: "job1", prompt: "follow up", images: [] });
    expect(sendRes).toEqual({ ok: true });
    expect(resumeOpts.sessionId).toBe("s123");
  });

  it("updates claude job model from stream init when no model is configured", async () => {
    const events: any[] = [];
    const store = {
      getSettings: () => ({
        agents: {
          codex: { path: "", model: "" },
          claude: { path: "", model: "", permissionMode: "acceptEdits", dangerouslySkipPermissions: false }
        }
      }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOpts: any = null;
    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runClaudeExec = (opts: any) => {
      execOpts = opts;
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: (p: any) => events.push(p),
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec,
      runClaudeResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", agent: "claude", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOpts && execOpts.model).toBe("");
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "claude",
      data: { type: "system", subtype: "init", session_id: "s123", model: "claude-sonnet-4-5" }
    });

    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.threadId === "s123")).toBe(true);
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.model === "claude-sonnet-4-5")).toBe(true);

    const snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.model).toBe("claude-sonnet-4-5");
  });

  it("backfills persisted claude model from stored claude log entries", () => {
    const store = {
      getSettings: () => ({
        agents: {
          codex: { path: "", model: "" },
          claude: { path: "", model: "sonnet", permissionMode: "acceptEdits", dangerouslySkipPermissions: false }
        }
      }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = {
      loadAll: () => [
        {
          id: "job1",
          status: "done",
          box: "board",
          createdAt: "2020-01-01T00:00:00.000Z",
          startedAt: "2020-01-01T00:00:00.000Z",
          finishedAt: "2020-01-01T00:00:01.000Z",
          projectId: "p1",
          projectPath: "/tmp/proj",
          agent: "claude",
          model: "",
          threadId: "s123",
          prompts: [{ ts: "2020-01-01T00:00:00.000Z", text: "Do the thing", images: [] }],
          queuedPrompts: [],
          messages: [],
          logs: [
            {
              ts: "2020-01-01T00:00:00.100Z",
              stream: "stdout",
              kind: "claude",
              data: { type: "system", subtype: "init", session_id: "s123", model: "claude-sonnet-4-5" }
            }
          ],
          usage: null,
          usageTotal: { input_tokens: 0, output_tokens: 0, turns: 0 },
          exitCode: 0
        }
      ],
      save: () => true,
      remove: () => true
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec: () => new FakeChild() as any,
      runClaudeResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false
    });

    const snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.model).toBe("claude-sonnet-4-5");
  });

  it("applies AH_STATUS hints for claude output too", async () => {
    const store = {
      getSettings: () => ({
        agents: {
          codex: { path: "", model: "" },
          claude: { path: "", model: "sonnet", permissionMode: "acceptEdits", dangerouslySkipPermissions: false }
        }
      }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runClaudeExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec,
      runClaudeResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", agent: "claude", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "claude",
      data: {
        type: "assistant",
        parent_tool_use_id: null,
        message: { content: [{ type: "text", text: "Done.\nAH_STATUS: done\n" }] }
      }
    });

    execChild.emit("close", 0, null);
    const snap = jm.getJob("job1") as any;
    expect(snap.job.status).toBe("done");
    expect(snap.job.messages.length).toBe(1);
    expect(snap.job.messages[0].text).toBe("Done.");
    expect(snap.job.messages[0].text.includes("AH_STATUS")).toBe(false);
  });

  it("ignores non-actionable AH_STATUS needs_attention hints in claude output", async () => {
    const store = {
      getSettings: () => ({
        agents: {
          codex: { path: "", model: "" },
          claude: { path: "", model: "sonnet", permissionMode: "acceptEdits", dangerouslySkipPermissions: false }
        }
      }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runClaudeExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec,
      runClaudeResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", agent: "claude", images: [] })).toEqual({
      ok: true,
      jobId: "job1"
    });
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "claude",
      data: {
        type: "assistant",
        parent_tool_use_id: null,
        message: { content: [{ type: "text", text: "AH_STATUS: needs_attention\n" }] }
      }
    });

    execChild.emit("close", 0, null);
    const snap = jm.getJob("job1") as any;
    expect(snap.job.status).toBe("done");
    expect(snap.job.messages.length).toBe(0);
  });

  it("refreshes the LLM title after follow-up prompts", async () => {
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };
    const events: any[] = [];

    type TitleRun = { child: FakeChild; onEvent: (ev: any) => void; prompt: string };
    const titleRuns: TitleRun[] = [];
    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      const p = String(opts && opts.prompt ? opts.prompt : "");
      const isTitleSummary = p.includes("Create a concise job card title summarizing the user's request.");
      if (isTitleSummary) {
        const child = new FakeChild();
        titleRuns.push({ child, onEvent: opts.onEvent, prompt: p });
        return child as any;
      }
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    let resumeOpts: any = null;
    const resumeChild = new FakeChild();
    const runCodexResume = (opts: any) => {
      resumeOpts = opts;
      return resumeChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: (p: any) => events.push(p),
      runCodexExec,
      runCodexResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Fix flaky login test", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();
    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "thread.started", thread_id: "t123" }
    });

    expect(titleRuns.length).toBe(1);
    titleRuns[0].onEvent({
      ts: "2020-01-01T00:00:00.100Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "item.completed", item: { type: "agent_message", text: "Fix flaky login test in CI" } }
    });
    titleRuns[0].child.emit("close", 0, null);
    await Promise.resolve();

    let snap = jm.getJob("job1") as any;
    expect(snap.job.titleLlm).toBe("Fix flaky login test in CI");

    execChild.emit("close", 0, null);
    snap = jm.getJob("job1") as any;
    expect(snap.job.status).toBe("done");

    expect(await jm.send({ jobId: "job1", prompt: "Now focus on deployment rollback for prod", images: [] })).toEqual({ ok: true });
    expect(resumeOpts.threadId).toBe("t123");
    expect(titleRuns.length).toBe(2);
    expect(titleRuns[1].prompt).toContain("Now focus on deployment rollback for prod");

    titleRuns[1].onEvent({
      ts: "2020-01-01T00:00:01.100Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "item.completed", item: { type: "agent_message", text: "Add production rollback deployment flow" } }
    });
    titleRuns[1].child.emit("close", 0, null);
    await Promise.resolve();

    snap = jm.getJob("job1") as any;
    expect(snap.job.titleLlm).toBe("Add production rollback deployment flow");
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.titleLlm === "Add production rollback deployment flow")).toBe(true);

    resumeChild.emit("close", 0, null);
  });

  it("renames temporary projects to a short LLM-based name after run completion", async () => {
    const events: any[] = [];
    const projects: any[] = [{ id: "p1", name: "temp-20200101-000000-deadbeef", path: "/tmp/proj", isTemporary: true }];
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => projects,
      updateProject: (id: string, patch: any) => {
        const idx = projects.findIndex((p: any) => p && p.id === id);
        if (idx < 0) return null;
        projects[idx] = { ...projects[idx], ...(patch && typeof patch === "object" ? patch : {}) };
        return projects[idx];
      }
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    type TitleRun = { child: FakeChild; onEvent: (ev: any) => void };
    const titleRuns: TitleRun[] = [];
    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runCodexExec = (opts: any) => {
      const p = String(opts && opts.prompt ? opts.prompt : "");
      const isTitleSummary = p.includes("Create a concise job card title summarizing the user's request.");
      if (isTitleSummary) {
        const child = new FakeChild();
        titleRuns.push({ child, onEvent: opts.onEvent });
        return child as any;
      }
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: (p: any) => events.push(p),
      runCodexExec,
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Fix flaky login test in CI", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();
    expect(titleRuns.length).toBe(1);

    titleRuns[0].onEvent({
      ts: "2020-01-01T00:00:00.100Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "item.completed", item: { type: "agent_message", text: "Fix flaky login test in CI" } }
    });
    titleRuns[0].child.emit("close", 0, null);
    await Promise.resolve();

    // While the run is active, keep the original generated temp folder name.
    expect(projects[0].name).toBe("temp-20200101-000000-deadbeef");

    execChild.emit("close", 0, null);
    await Promise.resolve();

    expect(projects[0].name).toBe("temp (flaky login test)");
    expect(events.some((e) => e.kind === "project_meta" && e.patch && e.patch.name === "temp (flaky login test)")).toBe(true);
  });
});
