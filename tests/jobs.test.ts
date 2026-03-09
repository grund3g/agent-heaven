import { describe, expect, it } from "vitest";
import { normalizeLoadedJob, snapshotJobMeta, type Job } from "../src/core/jobs";

describe("core/jobs", () => {
  it("normalizes loaded jobs and marks previously-running jobs as cancelled", () => {
    const nowIso = "2020-01-01T00:00:00.000Z";
    const raw = { id: "j1", status: "running" };
    const j = normalizeLoadedJob(raw, nowIso);
    expect(j).not.toBeNull();
    expect(j?.status).toBe("cancelled");
    expect(j?.finishedAt).toBe(nowIso);
    expect(Array.isArray(j?.logs)).toBe(true);
    expect(j?.logs[0].text).toContain("marked as cancelled");
    expect(j?.integratedToDefaultAt).toBe("");
    expect(j?.integratedToDefaultBranch).toBe("");
  });

  it("drops internal sentinel model names from loaded jobs", () => {
    const j = normalizeLoadedJob({ id: "j2", status: "failed", model: "<synthetic>" }, "2020-01-01T00:00:00.000Z");
    expect(j).not.toBeNull();
    expect(j?.model).toBe("");
  });

  it("computes snapshot meta (title/promptPreview/previewText)", () => {
    const job: Job = {
      id: "j1",
      title: "",
      titleLlm: "Fix store migration bug",
      status: "done",
      box: "board",
      archivedAt: "",
      archiveReason: "",
      trashedAt: "",
      integratedToDefaultAt: "2020-01-01T00:00:02.000Z",
      integratedToDefaultBranch: "main",
      createdAt: "2020-01-01T00:00:00.000Z",
      startedAt: "2020-01-01T00:00:00.000Z",
      finishedAt: "2020-01-01T00:00:01.000Z",
      projectId: "p1",
      projectPath: "/tmp",
      agent: "codex",
      model: "gpt",
      threadId: "t1",
      prompts: [{ ts: "t0", text: "Fix store migration bug", images: [] }],
      queuedPrompts: [],
      messages: [{ ts: "t1", role: "assistant", text: "All set." }],
      logs: [{ ts: "t1", stream: "stdout", kind: "log", text: "hello" }],
      usage: null,
      usageTotal: { input_tokens: 0, output_tokens: 0, turns: 0 },
      exitCode: 0
    };

    const meta = snapshotJobMeta(job);
    expect(meta.title).toBe("Fix store migration bug");
    expect(meta.promptPreview).toContain("Fix store migration bug");
    expect(meta.previewText).toBe("All set.");
    expect(meta.integratedToDefaultAt).toBe("2020-01-01T00:00:02.000Z");
    expect(meta.integratedToDefaultBranch).toBe("main");
  });
});
