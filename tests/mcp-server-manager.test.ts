import * as http from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { McpServerManager } from "../src/mcp-server/server";

function httpRequestStatus(url: string, headers?: Record<string, string>): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: "GET",
        headers: headers || {}
      },
      (res) => {
        res.resume();
        resolve(Number(res.statusCode || 0));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

describe("mcp-server/server", () => {
  const managers: McpServerManager[] = [];

  afterEach(async () => {
    for (const mgr of managers) {
      try {
        await mgr.shutdown();
      } catch {
        // ignore
      }
    }
    managers.length = 0;
  });

  it("starts idempotently and enforces bearer auth", async () => {
    const mgr = new McpServerManager(() => ({}));
    managers.push(mgr);

    await mgr.start();
    const firstPort = mgr.port;
    expect(firstPort).toBeGreaterThan(0);

    await mgr.start();
    expect(mgr.port).toBe(firstPort);

    const baseUrl = `http://127.0.0.1:${mgr.port}/mcp`;
    const unauthorized = await httpRequestStatus(baseUrl);
    expect(unauthorized).toBe(401);

    const authorized = await httpRequestStatus(baseUrl, { Authorization: `Bearer ${mgr.token}` });
    expect(authorized).toBe(400);
  });
});
