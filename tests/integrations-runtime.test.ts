import { describe, expect, it, vi } from "vitest";
import { IntegrationRuntime } from "../src/integrations";

describe("integrations/runtime", () => {
  it("enriches prompts and dedupes bindings", async () => {
    const runtime = new IntegrationRuntime([
      {
        id: "linear",
        displayName: "Linear",
        capabilities: ["ticket.read"],
        enrichPrompt: async () => ({
          promptPrefix: "Linear issue context block",
          bindings: [
            {
              connectorId: "linear",
              capability: "ticket.comment",
              resourceType: "issue",
              resourceId: "id-1",
              externalRef: "LIN-1"
            },
            {
              connectorId: "linear",
              capability: "ticket.comment",
              resourceType: "issue",
              resourceId: "id-1",
              externalRef: "LIN-1"
            }
          ],
          messages: [{ connectorId: "linear", level: "info", text: "ok" }]
        })
      },
      {
        id: "github",
        displayName: "GitHub",
        capabilities: ["ticket.read"],
        enrichPrompt: async () => {
          throw new Error("boom");
        }
      }
    ]);

    const res = await runtime.preparePrompt({
      jobId: "j1",
      projectId: "p1",
      projectPath: "/tmp/project",
      prompt: "Fix LIN-1",
      settings: { integrations: { enabled: true, autoEnrichPrompt: true } }
    });

    expect(res.prompt).toContain("Connected system context");
    expect(res.prompt).toContain("User request:");
    expect(res.prompt).toContain("Fix LIN-1");
    expect(res.bindings).toHaveLength(1);
    expect(res.bindings[0].externalRef).toBe("LIN-1");

    expect(res.messages.some((m) => m.connectorId === "linear" && m.level === "info")).toBe(true);
    expect(res.messages.some((m) => m.connectorId === "github" && m.level === "error")).toBe(true);
  });

  it("runs completion hooks per connector with filtered bindings", async () => {
    const onLinear = vi.fn(async (ctx: any) => ({
      messages: [{ connectorId: "linear", level: "info", text: `linear:${ctx.bindings.length}` }]
    }));
    const onGithub = vi.fn(async (ctx: any) => ({
      messages: [{ connectorId: "github", level: "info", text: `github:${ctx.bindings.length}` }],
      bindings: [
        {
          connectorId: "github",
          capability: "ticket.comment",
          resourceType: "issue",
          resourceId: "repo#99",
          externalRef: "repo#99"
        }
      ]
    }));

    const runtime = new IntegrationRuntime([
      {
        id: "linear",
        displayName: "Linear",
        capabilities: ["ticket.comment"],
        notifyRunCompleted: onLinear
      },
      {
        id: "github",
        displayName: "GitHub",
        capabilities: ["ticket.comment"],
        notifyRunCompleted: onGithub
      }
    ]);

    const res = await runtime.notifyRunCompleted({
      jobId: "j1",
      projectId: "p1",
      projectPath: "/tmp/project",
      status: "done",
      finishedAt: "2020-01-01T00:00:00.000Z",
      exitCode: 0,
      assistantSummary: "Done",
      settings: { integrations: { enabled: true, autoCommentOnComplete: true } },
      bindings: [
        {
          connectorId: "linear",
          capability: "ticket.comment",
          resourceType: "issue",
          resourceId: "id-1",
          externalRef: "LIN-1"
        },
        {
          connectorId: "github",
          capability: "ticket.comment",
          resourceType: "issue",
          resourceId: "repo#1",
          externalRef: "repo#1"
        }
      ]
    });

    expect(onLinear).toHaveBeenCalledTimes(1);
    expect(onGithub).toHaveBeenCalledTimes(1);
    expect(onLinear.mock.calls[0][0].bindings).toHaveLength(1);
    expect(onGithub.mock.calls[0][0].bindings).toHaveLength(1);

    expect(res.messages.some((m) => m.text === "linear:1")).toBe(true);
    expect(res.messages.some((m) => m.text === "github:1")).toBe(true);
    expect(res.bindings.some((b) => b.resourceId === "repo#99")).toBe(true);
  });
});
