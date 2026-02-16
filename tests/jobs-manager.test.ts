import { EventEmitter } from "node:events";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
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
    expect(saved.length).toBeGreaterThan(0);

    expect(execOnEvent).not.toBeNull();
    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "thread.started", thread_id: "t123" }
    });
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.threadId === "t123")).toBe(true);

    execChild.emit("close", 0, null);
    const snap = jm.getJob("job1");
    expect(snap.ok).toBe(true);
    expect((snap as any).job.threadId).toBe("t123");
    expect((snap as any).job.status).toBe("done");

    const sendRes = jm.send({ jobId: "job1", prompt: "follow up", images: [] });
    expect(sendRes).toEqual({ ok: true });
    expect(resumeOpts.threadId).toBe("t123");

    const snap2 = jm.getJob("job1") as any;
    expect(snap2.job.status).toBe("running");
    expect(Array.isArray(snap2.job.prompts)).toBe(true);
    expect(snap2.job.prompts.length).toBe(2);
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
    expect(jm.send({ jobId: "job1", prompt: "queued follow up", images: [] })).toEqual({ ok: true });
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
      data: { type: "system", subtype: "init", session_id: "s123" }
    });
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.threadId === "s123")).toBe(true);

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
    expect(snap.job.status).toBe("done");
    expect(snap.job.usageTotal.turns).toBe(1);

    const sendRes = jm.send({ jobId: "job1", prompt: "follow up", images: [] });
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
});
