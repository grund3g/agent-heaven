import * as http from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerLinearTools } from "./tools-linear";
import { registerGithubTools } from "./tools-github";
import { registerNotionTools } from "./tools-notion";

export class McpServerManager {
  private httpServer: http.Server | null = null;
  private mcpServer: McpServer;
  private transports = new Map<string, StreamableHTTPServerTransport>();
  private bearerToken: string;

  port = 0;

  constructor(private getSettings: () => any) {
    this.bearerToken = randomUUID();

    this.mcpServer = new McpServer(
      { name: "agent-heaven", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    registerLinearTools(this.mcpServer, getSettings);
    registerGithubTools(this.mcpServer, getSettings);
    registerNotionTools(this.mcpServer, getSettings);
  }

  get token(): string {
    return this.bearerToken;
  }

  async start(): Promise<void> {
    const srv = http.createServer((req, res) => this.handleRequest(req, res));
    this.httpServer = srv;

    return new Promise<void>((resolve, reject) => {
      srv.on("error", reject);
      srv.listen(0, "127.0.0.1", () => {
        const addr = srv.address();
        if (addr && typeof addr === "object") {
          this.port = addr.port;
        }
        resolve();
      });
    });
  }

  async shutdown(): Promise<void> {
    for (const transport of this.transports.values()) {
      try { await transport.close(); } catch { /* ignore */ }
    }
    this.transports.clear();

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer!.close(() => resolve());
      });
      this.httpServer = null;
    }
    this.port = 0;
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = req.url || "";
    const pathname = url.split("?")[0];

    if (pathname !== "/mcp") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    // Validate bearer token
    const authHeader = req.headers.authorization || "";
    const expectedAuth = `Bearer ${this.bearerToken}`;
    if (authHeader !== expectedAuth) {
      res.writeHead(401, { "Content-Type": "text/plain" });
      res.end("Unauthorized");
      return;
    }

    const method = (req.method || "").toUpperCase();

    if (method === "POST") {
      await this.handlePost(req, res);
    } else if (method === "GET") {
      await this.handleGet(req, res);
    } else if (method === "DELETE") {
      await this.handleDelete(req, res);
    } else {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
    }
  }

  private async handlePost(req: http.IncomingMessage, res: http.ServerResponse) {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId && this.transports.has(sessionId)) {
      const transport = this.transports.get(sessionId)!;
      await transport.handleRequest(req, res);
      return;
    }

    // New session: create a new transport
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID()
    });

    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid) this.transports.delete(sid);
    };

    await this.mcpServer.connect(transport);
    await transport.handleRequest(req, res);

    const sid = transport.sessionId;
    if (sid) {
      this.transports.set(sid, transport);
    }
  }

  private async handleGet(req: http.IncomingMessage, res: http.ServerResponse) {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !this.transports.has(sessionId)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request: missing or invalid session ID");
      return;
    }
    const transport = this.transports.get(sessionId)!;
    await transport.handleRequest(req, res);
  }

  private async handleDelete(req: http.IncomingMessage, res: http.ServerResponse) {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !this.transports.has(sessionId)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request: missing or invalid session ID");
      return;
    }
    const transport = this.transports.get(sessionId)!;
    await transport.handleRequest(req, res);
  }
}
