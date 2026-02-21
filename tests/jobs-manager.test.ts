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

    expect(jm.send({ jobId: "job1", prompt: "follow up", images: [] })).toEqual({ ok: true });
    expect(resumeOpts).not.toBeNull();
    expect(resumeOpts.cwd).toBe(projectPath);

    const snap = jm.getJob("job1") as any;
    expect(snap.job.projectPath).toBe(projectPath);
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
      data: { type: "item.completed", item: { type: "agent_message", text: "All set.\nAH_STATUS: needs_attention\n" } }
    });

    execChild.emit("close", 0, null);
    const snap = jm.getJob("job1") as any;
    expect(snap.job.status).toBe("needs_attention");
    expect(snap.job.messages.length).toBe(1);
    expect(snap.job.messages[0].text).toBe("All set.");
    expect(snap.job.messages[0].text.includes("AH_STATUS")).toBe(false);
  });

  it("parses AHSTATUS variants and strips leaked internal blocks from codex messages", async () => {
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

    expect(await jm.start({ prompt: "check DEV-1106", projectId: "p1", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "codex",
      data: {
        type: "item.completed",
        item: {
          type: "agent_message",
          text:
            "Please fix the Agent Heaven Linear integration authentication configuration, then tell me to retry checking DEV-1106.\n" +
            "AHSTATUS: needsattention\n\n" +
            "-----\n" +
            "[Agent Heaven internal]\n" +
            "At the very end of your final reply, output exactly one line."
        }
      }
    });

    execChild.emit("close", 0, null);
    const snap = jm.getJob("job1") as any;
    expect(snap.job.status).toBe("needs_attention");
    expect(snap.job.messages.length).toBe(1);
    expect(snap.job.messages[0].text).toBe(
      "Please fix the Agent Heaven Linear integration authentication configuration, then tell me to retry checking DEV-1106."
    );
    expect(snap.job.messages[0].text.includes("[Agent Heaven internal]")).toBe(false);
    expect(snap.job.messages[0].text.includes("AHSTATUS")).toBe(false);
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
});
