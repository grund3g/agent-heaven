import * as http from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { McpServerManager } from "../src/mcp-server/server";

type HttpResponseMeta = {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
};

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

function httpPostJson(url: string, body: unknown, headers?: Record<string, string>): Promise<HttpResponseMeta> {
  const payload = JSON.stringify(body);
  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Content-Length": String(Buffer.byteLength(payload)),
    ...(headers || {})
  };

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: "POST",
        headers: reqHeaders
      },
      (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          text += chunk;
        });
        res.on("end", () => {
          resolve({
            status: Number(res.statusCode || 0),
            headers: res.headers,
            body: text
          });
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
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

  it("supports multiple independent initialize sessions without HTTP 500", async () => {
    const mgr = new McpServerManager(() => ({}));
    managers.push(mgr);
    await mgr.start();

    const baseUrl = `http://127.0.0.1:${mgr.port}/mcp`;
    const authHeaders = {
      Authorization: `Bearer ${mgr.token}`,
      Accept: "application/json, text/event-stream"
    };

    const initPayload = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
      }
    };

    const first = await httpPostJson(baseUrl, initPayload, authHeaders);
    expect(first.status).toBe(200);
    const firstSession = String(first.headers["mcp-session-id"] || "");
    expect(firstSession.length).toBeGreaterThan(0);

    const second = await httpPostJson(baseUrl, { ...initPayload, id: 2 }, authHeaders);
    expect(second.status).toBe(200);
    const secondSession = String(second.headers["mcp-session-id"] || "");
    expect(secondSession.length).toBeGreaterThan(0);
    expect(secondSession).not.toBe(firstSession);
  });
});
