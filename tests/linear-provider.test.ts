import { afterEach, describe, expect, it, vi } from "vitest";
import { linearConnector, linearGraphql } from "../src/integrations/providers/linear";

describe("integrations/providers/linear", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends Linear API key directly in Authorization header", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: { viewer: { id: "u1" } } })
    }));
    vi.stubGlobal("fetch", fetchMock as any);

    const res = await linearGraphql("https://api.linear.app/graphql", "lin_api_test", "query { viewer { id } }", {});

    expect(res).toEqual({ viewer: { id: "u1" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as any;
    expect(init.headers.Authorization).toBe("lin_api_test");
  });

  it("strips Bearer prefix from configured Linear token", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ data: { issue: { id: "i1" } } })
    }));
    vi.stubGlobal("fetch", fetchMock as any);

    const res = await linearGraphql("https://api.linear.app/graphql", "Bearer lin_api_test", "query { issue { id } }", {});

    expect(res).toEqual({ issue: { id: "i1" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as any;
    expect(init.headers.Authorization).toBe("lin_api_test");
  });

  it("enriches prompt via searchIssues and keeps exact identifier matches only", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          data: {
            searchIssues: {
              nodes: [
                {
                  id: "i1",
                  identifier: "DEV-1106",
                  title: "Fix lookup",
                  description: "desc",
                  url: "https://linear.app/x/issue/DEV-1106",
                  state: { name: "Todo" },
                  team: { key: "DEV", name: "Dev Team" }
                },
                {
                  id: "i2",
                  identifier: "DEV-11067",
                  title: "Similar issue",
                  description: "nope",
                  url: "https://linear.app/x/issue/DEV-11067",
                  state: { name: "Todo" },
                  team: { key: "DEV", name: "Dev Team" }
                }
              ]
            }
          }
        })
    }));
    vi.stubGlobal("fetch", fetchMock as any);

    const res = await linearConnector.enrichPrompt!({
      jobId: "j1",
      projectId: "p1",
      projectPath: "/tmp/proj",
      prompt: "check DEV-1106",
      settings: {
        integrations: {
          providers: {
            linear: {
              enabled: true,
              token: "lin_api_test",
              includeDescription: false
            }
          }
        }
      }
    });

    expect(res).toBeTruthy();
    expect(String((res as any).promptPrefix || "")).toContain("DEV-1106");
    expect(String((res as any).promptPrefix || "")).not.toContain("DEV-11067");
    expect(Array.isArray((res as any).bindings)).toBe(true);
    expect((res as any).bindings[0].externalRef).toBe("DEV-1106");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as any;
    const body = JSON.parse(String(init && init.body ? init.body : "{}"));
    expect(String(body.query || "")).toContain("searchIssues(term:");
    expect(String(body.query || "")).not.toContain("issue(identifier:");
  });
});
