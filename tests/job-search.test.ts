import { describe, expect, it } from "vitest";
import { searchJobs } from "../src/core/job-search";
import type { Job } from "../src/core/jobs";

function mkJob(patch: Partial<Job>): Job {
  const base: Job = {
    id: "j",
    title: "",
    status: "done",
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
    projectPath: "/tmp",
    agent: "codex",
    model: "gpt",
    threadId: "",
    prompts: [],
    queuedPrompts: [],
    messages: [],
    logs: [],
    usage: null,
    usageTotal: { input_tokens: 0, output_tokens: 0, turns: 0 },
    exitCode: 0
  };
  return { ...base, ...patch };
}

describe("core/job-search", () => {
  it("returns empty results for empty query", () => {
    const res = searchJobs([mkJob({ id: "j1" })], "   ");
    expect(res).toEqual({ jobIds: [], total: 0, truncated: false });
  });

  it("matches across fields, prompts and messages", () => {
    const jobs = [
      mkJob({ id: "j1", title: "Fix store migration" }),
      mkJob({ id: "j2", prompts: [{ ts: "t1", text: "Hello World", images: [] }] as any }),
      mkJob({ id: "j3", messages: [{ ts: "t1", role: "assistant", text: "Stack trace here" }] as any }),
      mkJob({ id: "j4", queuedPrompts: [{ ts: "t1", text: "Queued follow-up", images: [] }] as any })
    ];

    expect(searchJobs(jobs, "migration").jobIds).toEqual(["j1"]);
    expect(searchJobs(jobs, "hello").jobIds).toEqual(["j2"]);
    expect(searchJobs(jobs, "trace").jobIds).toEqual(["j3"]);
    expect(searchJobs(jobs, "queued").jobIds).toEqual(["j4"]);
  });

  it("includes or excludes logs based on opts.includeLogs", () => {
    const jobs = [
      mkJob({
        id: "j1",
        logs: [{ ts: "t1", stream: "stderr", kind: "log", text: "ENOENT: missing file" }] as any
      })
    ];

    expect(searchJobs(jobs, "enoent").jobIds).toEqual(["j1"]);
    expect(searchJobs(jobs, "enoent", { includeLogs: false }).jobIds).toEqual([]);
  });

  it("searches structured codex events in logs", () => {
    const jobs = [
      mkJob({
        id: "j1",
        logs: [
          {
            ts: "t1",
            stream: "stdout",
            kind: "codex",
            data: { type: "item.completed", thread_id: "t123", item: { type: "agent_message", text: "Please confirm." } }
          }
        ] as any
      })
    ];

    expect(searchJobs(jobs, "t123").jobIds).toEqual(["j1"]);
    expect(searchJobs(jobs, "confirm").jobIds).toEqual(["j1"]);
  });

  it("sorts newest first and enforces limit/truncation", () => {
    const jobs = [
      mkJob({ id: "j_old", createdAt: "2020-01-01T00:00:00.000Z", title: "match" }),
      mkJob({ id: "j_new", createdAt: "2020-01-02T00:00:00.000Z", title: "match" })
    ];

    const res = searchJobs(jobs, "match", { limit: 1 });
    expect(res.jobIds).toEqual(["j_new"]);
    expect(res.total).toBe(2);
    expect(res.truncated).toBe(true);
  });
});
