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

  it("honors explicit worktree override even for read-only looking prompts", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "jobs-manager-proj-"));
    const checkoutsDir = fs.mkdtempSync(path.join(os.tmpdir(), "jobs-manager-checkouts-"));
    const worktreeSpy = vi.spyOn(git, "addWorktree").mockResolvedValue(undefined as any);

    const runCalls: any[] = [];
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: projectDir, checkoutMode: "worktree", defaultBranch: "main" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };
    const jm = new JobsManager({
      store,
      history,
      checkoutsDir,
      sendJobEvent: () => {},
      runCodexExec: (opts: any) => {
        runCalls.push(opts);
        return new FakeChild() as any;
      },
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    const res = await jm.start({
      prompt: "Kannst du das bitte mal checken und warum ist das so?",
      projectId: "p1",
      checkoutMode: "worktree"
    });
    expect(res).toEqual({ ok: true, jobId: "job1" });
    expect(worktreeSpy).toHaveBeenCalledTimes(1);
    expect(runCalls[0].projectPath).toBe(path.join(checkoutsDir, "worktrees", "p1", "job1"));

    const snap = jm.getJob("job1") as any;
    expect(snap.job.checkoutModePreference).toBe("worktree");
    expect(snap.job.checkoutModeEffective).toBe("worktree");

    fs.rmSync(projectDir, { recursive: true, force: true });
    fs.rmSync(checkoutsDir, { recursive: true, force: true });
  });

  it("can still defer project-default worktree for read-only prompts", async () => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "jobs-manager-proj-"));
    const checkoutsDir = fs.mkdtempSync(path.join(os.tmpdir(), "jobs-manager-checkouts-"));
    const worktreeSpy = vi.spyOn(git, "addWorktree").mockResolvedValue(undefined as any);

    const runCalls: any[] = [];
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: projectDir, checkoutMode: "worktree", defaultBranch: "main" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };
    const jm = new JobsManager({
      store,
      history,
      checkoutsDir,
      sendJobEvent: () => {},
      runCodexExec: (opts: any) => {
        runCalls.push(opts);
        return new FakeChild() as any;
      },
      runCodexResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    const res = await jm.start({
      prompt: "Kannst du das bitte mal checken und warum ist das so?",
      projectId: "p1"
    });
    expect(res).toEqual({ ok: true, jobId: "job1" });
    expect(worktreeSpy).not.toHaveBeenCalled();
    expect(runCalls[0].projectPath).toBe(projectDir);

    const snap = jm.getJob("job1") as any;
    expect(snap.job.checkoutModePreference).toBe("worktree");
    expect(snap.job.checkoutModeEffective).toBe("inplace");

    fs.rmSync(projectDir, { recursive: true, force: true });
    fs.rmSync(checkoutsDir, { recursive: true, force: true });
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
    let snap = jm.getJob("job1") as any;
    expect(snap.job.agentInspectors).toEqual([
      expect.objectContaining({
        agent: "codex",
        role: "primary",
        phase: "exec",
        status: "running"
      })
    ]);

    expect(execOnEvent).not.toBeNull();
    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "thread.started", thread_id: "t123" }
    });
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.threadId === "t123")).toBe(true);
    snap = jm.getJob("job1") as any;
    expect(snap.job.agentInspectors).toEqual([
      expect.objectContaining({
        agent: "codex",
        threadId: "t123",
        status: "running"
      })
    ]);
    expect(
      events.some(
        (e) =>
          e.kind === "meta" &&
          Array.isArray(e.patch && e.patch.agentInspectors) &&
          e.patch.agentInspectors.some((item: any) => item && item.agent === "codex" && item.threadId === "t123")
      )
    ).toBe(true);

    execOnEvent!({
      ts: "2020-01-01T00:00:00.100Z",
      stream: "stdout",
      kind: "codex",
      data: { type: "token.usage.updated", model_context_window: 128000 }
    });
    expect(events.some((e) => e.kind === "meta" && e.patch && e.patch.modelContextWindow === 128000)).toBe(true);

    execChild.emit("close", 0, null);
    snap = jm.getJob("job1");
    expect(snap.ok).toBe(true);
    expect((snap as any).job.threadId).toBe("t123");
    expect((snap as any).job.title).toBe("Do the thing");
    expect((snap as any).job.status).toBe("done");
    expect((snap as any).job.agentInspectors).toEqual([
      expect.objectContaining({
        agent: "codex",
        phase: "exec",
        status: "done",
        threadId: "t123",
        exitCode: 0
      })
    ]);

    const sendRes = await jm.send({ jobId: "job1", prompt: "follow up", images: [] });
    expect(sendRes).toEqual({ ok: true });
    expect(resumeOpts.threadId).toBe("t123");

    const snap2 = jm.getJob("job1") as any;
    expect(snap2.job.status).toBe("running");
    expect(Array.isArray(snap2.job.prompts)).toBe(true);
    expect(snap2.job.prompts.length).toBe(2);
    expect(snap2.job.agentInspectors).toEqual([
      expect.objectContaining({
        agent: "codex",
        phase: "resume",
        status: "running",
        threadId: "t123"
      })
    ]);

    resumeChild.emit("close", 0, null);
    const snap3 = jm.getJob("job1") as any;
    expect(snap3.job.agentInspectors).toEqual([
      expect.objectContaining({
        agent: "codex",
        phase: "resume",
        status: "done",
        threadId: "t123",
        exitCode: 0
      })
    ]);
  });

  it("injects explicit Agent Heaven Linear MCP tool hints for ticket IDs", async () => {
    let capturedPrompt = "";
    const store = {
      getSettings: () => ({ agents: { codex: { path: "", model: "" } } }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    const runCodexExec = (opts: any) => {
      capturedPrompt = String(opts && opts.prompt ? opts.prompt : "");
      return new FakeChild() as any;
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

    expect(await jm.start({ prompt: "check mal Linear ticket DEV-1106", projectId: "p1", images: [] })).toEqual({
      ok: true,
      jobId: "job1"
    });

    expect(capturedPrompt).toContain("Detected issue identifiers: DEV-1106.");
    expect(capturedPrompt).toContain("mcp__agent_heaven__linear_get_issue");
    expect(capturedPrompt).toContain("Do not use `read_mcp_resource` / `list_mcp_resources` / `list_mcp_resource_templates`");
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

  it("repairs persisted synthetic Claude models before resume", async () => {
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
          title: "Recover session",
          status: "failed",
          box: "board",
          archivedAt: "",
          archiveReason: "",
          trashedAt: "",
          integratedToDefaultAt: "",
          integratedToDefaultBranch: "",
          createdAt: "2020-01-01T00:00:00.000Z",
          startedAt: "2020-01-01T00:00:00.000Z",
          finishedAt: "2020-01-01T00:00:01.000Z",
          projectId: "p1",
          projectPath: "/tmp/proj",
          agent: "claude",
          model: "<synthetic>",
          threadId: "s123",
          prompts: [{ ts: "2020-01-01T00:00:00.000Z", text: "Do the thing", images: [] }],
          queuedPrompts: [],
          messages: [],
          logs: [],
          usage: null,
          usageTotal: { input_tokens: 0, output_tokens: 0, turns: 0 },
          exitCode: 1
        }
      ],
      save: () => true,
      remove: () => true
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
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec: () => new FakeChild() as any,
      runClaudeResume,
      needsAttentionHeuristic: () => false
    });

    const snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.model).toBe("sonnet");

    expect(await jm.send({ jobId: "job1", prompt: "follow up", images: [] })).toEqual({ ok: true });
    expect(resumeOpts.sessionId).toBe("s123");
    expect(resumeOpts.model).toBe("sonnet");

    resumeChild.emit("close", 0, null);
  });

  it("does not overwrite a Claude job model with synthetic error metadata", async () => {
    const store = {
      getSettings: () => ({
        uiModel: "gpt-5-codex",
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

    let resumeOpts: any = null;
    const resumeChild = new FakeChild();
    const runClaudeResume = (opts: any) => {
      resumeOpts = opts;
      return resumeChild as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec,
      runClaudeResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", agent: "claude", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "claude",
      data: { type: "system", subtype: "init", session_id: "s123", model: "claude-sonnet-4-5" }
    });

    execOnEvent!({
      ts: "2020-01-01T00:00:00.500Z",
      stream: "stdout",
      kind: "claude",
      data: {
        type: "assistant",
        parent_tool_use_id: null,
        message: {
          content: [{ type: "tool_use", id: "toolu_1", name: "bash", input: { command: "pwd" } }]
        }
      }
    });

    execOnEvent!({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "claude",
      data: {
        type: "assistant",
        parent_tool_use_id: null,
        message: {
          model: "<synthetic>",
          content: [{ type: "text", text: "API Error: Unable to connect to API (EPIPE)" }]
        }
      }
    });

    execChild.emit("close", 1, null);

    const snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.model).toBe("claude-sonnet-4-5");

    expect(await jm.send({ jobId: "job1", prompt: "retry", images: [] })).toEqual({ ok: true });
    expect(resumeOpts.model).toBe("claude-sonnet-4-5");

    resumeChild.emit("close", 0, null);
  });

  it("retries an early transient Claude API connection failure once", async () => {
    const store = {
      getSettings: () => ({
        uiModel: "gpt-5-codex",
        agents: {
          codex: { path: "", model: "" },
          claude: { path: "", model: "sonnet", permissionMode: "acceptEdits", dangerouslySkipPermissions: false }
        }
      }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    const firstExecChild = new FakeChild();
    const secondExecChild = new FakeChild();
    const execChildren = [firstExecChild, secondExecChild];
    const execCalls: any[] = [];
    const runClaudeExec = (opts: any) => {
      execCalls.push(opts);
      const child = execChildren.shift();
      if (!child) throw new Error("unexpected extra Claude exec");
      return child as any;
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
    expect(execCalls).toHaveLength(1);

    execCalls[0].onEvent({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "claude",
      data: { type: "system", subtype: "init", session_id: "s123", model: "claude-sonnet-4-5" }
    });

    execCalls[0].onEvent({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "claude",
      data: {
        type: "assistant",
        parent_tool_use_id: null,
        message: { model: "<synthetic>", content: [{ type: "text", text: "API Error: Unable to connect to API (EPIPE)" }] }
      }
    });

    firstExecChild.emit("close", 1, null);

    expect(execCalls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1_199);
    expect(execCalls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(execCalls).toHaveLength(2);
    expect(execCalls[1].sessionId).toBe("s123");
    expect(execCalls[1].model).toBe("claude-sonnet-4-5");

    secondExecChild.emit("close", 0, null);

    const snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(["done", "needs_attention"]).toContain(snap.job.status);
  });

  it("retries a transient Claude resume without duplicating prompt history", async () => {
    const store = {
      getSettings: () => ({
        uiModel: "gpt-5-codex",
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

    const firstResumeChild = new FakeChild();
    const secondResumeChild = new FakeChild();
    const resumeChildren = [firstResumeChild, secondResumeChild];
    const resumeCalls: any[] = [];
    const runClaudeResume = (opts: any) => {
      resumeCalls.push(opts);
      const child = resumeChildren.shift();
      if (!child) throw new Error("unexpected extra Claude resume");
      return child as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec,
      runClaudeResume,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", agent: "claude", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "claude",
      data: { type: "system", subtype: "init", session_id: "s123", model: "claude-sonnet-4-5" }
    });
    execChild.emit("close", 0, null);

    expect(await jm.send({ jobId: "job1", prompt: "retry this", images: [] })).toEqual({ ok: true });
    expect(resumeCalls).toHaveLength(1);
    expect((jm.getJob("job1") as any).job.prompts.length).toBe(2);

    resumeCalls[0].onEvent({
      ts: "2020-01-01T00:00:01.000Z",
      stream: "stdout",
      kind: "claude",
      data: {
        type: "assistant",
        parent_tool_use_id: null,
        message: { model: "<synthetic>", content: [{ type: "text", text: "API Error: Unable to connect to API (EPIPE)" }] }
      }
    });
    firstResumeChild.emit("close", 1, null);

    await vi.advanceTimersByTimeAsync(1_200);
    expect(resumeCalls).toHaveLength(2);
    expect(resumeCalls[1].sessionId).toBe("s123");
    expect(resumeCalls[1].model).toBe("claude-sonnet-4-5");

    const snapDuringRetry = jm.getJob("job1") as any;
    expect(snapDuringRetry.job.prompts.length).toBe(2);

    secondResumeChild.emit("close", 0, null);

    const snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.prompts.length).toBe(2);
    expect(["done", "needs_attention"]).toContain(snap.job.status);
  });

  it("prepares Claude image attachments via Messages API on job start", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "jobs-manager-claude-img-start-"));
    const imagePath = path.join(tmpDir, "screen.png");
    fs.writeFileSync(imagePath, "fake");

    const store = {
      getSettings: () => ({
        agents: {
          codex: { path: "", model: "" },
          claude: { path: "", model: "sonnet", permissionMode: "acceptEdits", dangerouslySkipPermissions: false }
        }
      }),
      listProjects: () => [{ id: "p1", name: "Proj", path: tmpDir }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };
    let execOpts: any = null;

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec: (opts: any) => {
        execOpts = opts;
        return new FakeChild() as any;
      },
      runClaudeResume: () => new FakeChild() as any,
      summarizeClaudeImages: async () => ({
        text: "Image 1 shows a failing OIDC form with a validation error banner.",
        model: "claude-sonnet-4-0",
        usage: { input_tokens: 12, output_tokens: 34 }
      }),
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    await expect(jm.start({ prompt: "Check the screenshot", projectId: "p1", agent: "claude", images: [imagePath] })).resolves.toEqual({
      ok: true,
      jobId: "job1"
    });
    expect(execOpts && typeof execOpts.prompt === "string").toBe(true);
    expect(execOpts.prompt).toContain("Check the screenshot");
    expect(execOpts.prompt).toContain("Attached image context");
    expect(execOpts.prompt).toContain("Image 1 shows a failing OIDC form");

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("prepares Claude image attachments via Messages API on follow-up prompts", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "jobs-manager-claude-img-send-"));
    const imagePath = path.join(tmpDir, "screen.png");
    fs.writeFileSync(imagePath, "fake");

    const store = {
      getSettings: () => ({
        agents: {
          codex: { path: "", model: "" },
          claude: { path: "", model: "sonnet", permissionMode: "acceptEdits", dangerouslySkipPermissions: false }
        }
      }),
      listProjects: () => [{ id: "p1", name: "Proj", path: tmpDir }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };

    let execOnEvent: ((ev: any) => void) | null = null;
    const execChild = new FakeChild();
    const runClaudeExec = (opts: any) => {
      execOnEvent = opts.onEvent;
      return execChild as any;
    };

    let resumeOpts: any = null;
    const runClaudeResume = (opts: any) => {
      resumeOpts = opts;
      return new FakeChild() as any;
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: () => new FakeChild() as any,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec,
      runClaudeResume,
      summarizeClaudeImages: async () => ({
        text: "Image 1 shows a modal with dense metadata chips and hard-to-read filenames.",
        model: "claude-sonnet-4-0",
        usage: { input_tokens: 10, output_tokens: 22 }
      }),
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Do the thing", projectId: "p1", agent: "claude", images: [] })).toEqual({ ok: true, jobId: "job1" });
    expect(execOnEvent).not.toBeNull();

    execOnEvent!({
      ts: "2020-01-01T00:00:00.000Z",
      stream: "stdout",
      kind: "claude",
      data: { type: "system", subtype: "init", session_id: "s123", model: "claude-sonnet-4-5" }
    });
    execChild.emit("close", 0, null);

    await expect(jm.send({ jobId: "job1", prompt: "Check this image", images: [imagePath] })).resolves.toEqual({ ok: true });
    expect(resumeOpts && typeof resumeOpts.prompt === "string").toBe(true);
    expect(resumeOpts.prompt).toContain("Check this image");
    expect(resumeOpts.prompt).toContain("Attached image context");
    expect(resumeOpts.prompt).toContain("dense metadata chips");

    fs.rmSync(tmpDir, { recursive: true, force: true });
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

  it("runs war room rounds in parallel, tracks inspectors, and rejects follow-ups", async () => {
    const store = {
      getSettings: () => ({
        agents: {
          codex: { path: "", model: "gpt-5-codex" },
          claude: { path: "", model: "sonnet", permissionMode: "acceptEdits", dangerouslySkipPermissions: false },
          gemini: { path: "", model: "gemini-2.5-pro", sandboxMode: "workspace-write" }
        }
      }),
      listProjects: () => [{ id: "p1", name: "Proj", path: "/tmp/proj" }]
    };
    const history = { loadAll: () => [], save: () => true, remove: () => true };
    const TITLE_SUMMARY_PROMPT = "Create a concise job card title summarizing the user's request.";
    type WarRun = { child: FakeChild; onEvent: (ev: any) => void; prompt: string };
    const warRuns: Record<"codex" | "claude" | "gemini", WarRun[]> = {
      codex: [],
      claude: [],
      gemini: []
    };

    const spawnTitleSummary = () => {
      const child = new FakeChild();
      setTimeout(() => child.emit("close", 0, null), 0);
      return child as any;
    };

    const spawnCodex = (opts: any) => {
      const prompt = String(opts && opts.prompt ? opts.prompt : "");
      if (prompt.includes(TITLE_SUMMARY_PROMPT)) return spawnTitleSummary();
      const child = new FakeChild();
      warRuns.codex.push({ child, onEvent: opts.onEvent, prompt });
      return child as any;
    };

    const spawnClaude = (opts: any) => {
      const prompt = String(opts && opts.prompt ? opts.prompt : "");
      if (prompt.includes(TITLE_SUMMARY_PROMPT)) return spawnTitleSummary();
      const child = new FakeChild();
      warRuns.claude.push({ child, onEvent: opts.onEvent, prompt });
      return child as any;
    };

    const spawnGemini = (opts: any) => {
      const prompt = String(opts && opts.prompt ? opts.prompt : "");
      if (prompt.includes(TITLE_SUMMARY_PROMPT)) return spawnTitleSummary();
      const child = new FakeChild();
      warRuns.gemini.push({ child, onEvent: opts.onEvent, prompt });
      return child as any;
    };

    const flushWarRoom = async () => {
      await Promise.resolve();
      await Promise.resolve();
    };

    const finishCodex = (run: WarRun, ts: string, text: string) => {
      run.onEvent({
        ts,
        stream: "stdout",
        kind: "codex",
        data: { type: "item.completed", item: { type: "agent_message", text } }
      });
      run.child.emit("close", 0, null);
    };

    const finishClaude = (run: WarRun, ts: string, text: string) => {
      run.onEvent({
        ts,
        stream: "stdout",
        kind: "claude",
        data: { type: "assistant", parent_tool_use_id: null, message: { content: [{ type: "text", text }] } }
      });
      run.child.emit("close", 0, null);
    };

    const finishGemini = (run: WarRun, ts: string, text: string) => {
      run.onEvent({
        ts,
        stream: "stdout",
        kind: "gemini",
        data: { type: "result", text }
      });
      run.child.emit("close", 0, null);
    };

    const jm = new JobsManager({
      store,
      history,
      sendJobEvent: () => {},
      runCodexExec: spawnCodex,
      runCodexResume: () => new FakeChild() as any,
      runClaudeExec: spawnClaude,
      runClaudeResume: () => new FakeChild() as any,
      runGeminiExec: spawnGemini,
      runGeminiResume: () => new FakeChild() as any,
      needsAttentionHeuristic: () => false,
      createId: () => "job1"
    });

    expect(await jm.start({ prompt: "Design a rollout plan", projectId: "p1", agent: "codex", mode: "war_room", images: [] })).toEqual({
      ok: true,
      jobId: "job1"
    });

    await flushWarRoom();

    expect(warRuns.codex.length).toBe(1);
    expect(warRuns.claude.length).toBe(1);
    expect(warRuns.gemini.length).toBe(1);

    let snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.agentInspectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ agent: "codex", phase: "round_1", status: "running" }),
        expect.objectContaining({ agent: "claude", phase: "round_1", status: "running" }),
        expect.objectContaining({ agent: "gemini", phase: "round_1", status: "running" })
      ])
    );

    finishCodex(warRuns.codex[0], "2020-01-01T00:00:00.000Z", "codex war room output");
    finishClaude(warRuns.claude[0], "2020-01-01T00:00:00.100Z", "claude war room output");
    finishGemini(warRuns.gemini[0], "2020-01-01T00:00:00.200Z", "gemini war room output");

    await flushWarRoom();

    expect(warRuns.codex.length).toBe(2);
    expect(warRuns.claude.length).toBe(2);
    expect(warRuns.gemini.length).toBe(2);

    snap = jm.getJob("job1") as any;
    expect(snap.job.agentInspectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ agent: "codex", phase: "round_2", status: "running" }),
        expect.objectContaining({ agent: "claude", phase: "round_2", status: "running" }),
        expect.objectContaining({ agent: "gemini", phase: "round_2", status: "running" })
      ])
    );

    finishCodex(warRuns.codex[1], "2020-01-01T00:00:01.000Z", "codex critique");
    finishClaude(warRuns.claude[1], "2020-01-01T00:00:01.100Z", "claude critique");
    finishGemini(warRuns.gemini[1], "2020-01-01T00:00:01.200Z", "gemini critique");

    await flushWarRoom();

    expect(warRuns.codex.length).toBe(3);
    expect(warRuns.claude.length).toBe(2);
    expect(warRuns.gemini.length).toBe(2);

    snap = jm.getJob("job1") as any;
    expect(snap.job.agentInspectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ agent: "codex", phase: "synthesis", status: "running" }),
        expect.objectContaining({ agent: "claude", phase: "round_2", status: "done" }),
        expect.objectContaining({ agent: "gemini", phase: "round_2", status: "done" })
      ])
    );

    finishCodex(warRuns.codex[2], "2020-01-01T00:00:02.000Z", "final synthesis");

    await flushWarRoom();
    await vi.runAllTimersAsync();
    await Promise.resolve();

    snap = jm.getJob("job1") as any;
    expect(snap.ok).toBe(true);
    expect(snap.job.mode).toBe("war_room");
    expect(["done", "needs_attention"]).toContain(snap.job.status);
    expect(Array.isArray(snap.job.logs)).toBe(true);
    expect(snap.job.logs.some((x: any) => x && x.kind === "codex")).toBe(true);
    expect(snap.job.logs.some((x: any) => x && x.kind === "claude")).toBe(true);
    expect(snap.job.logs.some((x: any) => x && x.kind === "gemini")).toBe(true);
    expect(snap.job.messages.some((x: any) => x && x.agent === "codex")).toBe(true);
    expect(snap.job.messages.some((x: any) => x && x.agent === "claude")).toBe(true);
    expect(snap.job.messages.some((x: any) => x && x.agent === "gemini")).toBe(true);
    expect(snap.job.agentInspectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ agent: "codex", phase: "synthesis", status: "done" }),
        expect.objectContaining({ agent: "claude", phase: "round_2", status: "done" }),
        expect.objectContaining({ agent: "gemini", phase: "round_2", status: "done" })
      ])
    );

    expect(await jm.send({ jobId: "job1", prompt: "follow up" })).toEqual({
      ok: false,
      error: "War Room sessions do not support follow-up prompts yet. Start a new War Room run from the composer."
    });
  });
});
