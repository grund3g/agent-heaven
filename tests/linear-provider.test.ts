import { afterEach, describe, expect, it, vi } from "vitest";
import { linearGraphql } from "../src/integrations/providers/linear";

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
});
