import { describe, expect, it, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { writeMcpConfig, cleanupMcpConfig } from "../src/mcp-server/config-writer";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "mcp-config-test-"));
}

function rmDir(dir: string) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
}

describe("mcp-server/config-writer", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const d of dirs) rmDir(d);
    dirs.length = 0;
  });

  it("writes .mcp.json for Claude agent", () => {
    const dir = makeTmpDir();
    dirs.push(dir);

    const files = writeMcpConfig({ projectPath: dir, agent: "claude", port: 12345, token: "test-token" });

    expect(files).toHaveLength(1);
    expect(files[0]).toBe(path.join(dir, ".mcp.json"));

    const content = JSON.parse(fs.readFileSync(files[0], "utf8"));
    expect(content.mcpServers["agent-heaven"]).toBeDefined();
    expect(content.mcpServers["agent-heaven"].type).toBe("http");
    expect(content.mcpServers["agent-heaven"].url).toBe("http://127.0.0.1:12345/mcp");
    expect(content.mcpServers["agent-heaven"].headers.Authorization).toBe("Bearer test-token");
  });

  it("writes .codex/mcp.json for Codex agent", () => {
    const dir = makeTmpDir();
    dirs.push(dir);

    const files = writeMcpConfig({ projectPath: dir, agent: "codex", port: 9999, token: "codex-tok" });

    expect(files).toHaveLength(1);
    expect(files[0]).toBe(path.join(dir, ".codex", "mcp.json"));

    const content = JSON.parse(fs.readFileSync(files[0], "utf8"));
    expect(content.mcpServers["agent-heaven"]).toBeDefined();
    expect(content.mcpServers["agent-heaven"].url).toBe("http://127.0.0.1:9999/mcp");
    expect(content.mcpServers["agent-heaven"].http_headers.Authorization).toBe("Bearer codex-tok");
  });

  it("merges into existing .mcp.json without overwriting other servers", () => {
    const dir = makeTmpDir();
    dirs.push(dir);

    const mcpPath = path.join(dir, ".mcp.json");
    fs.writeFileSync(mcpPath, JSON.stringify({
      mcpServers: {
        "some-other-server": { type: "http", url: "http://example.com/mcp" }
      }
    }), "utf8");

    writeMcpConfig({ projectPath: dir, agent: "claude", port: 5555, token: "tok" });

    const content = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    expect(content.mcpServers["some-other-server"]).toBeDefined();
    expect(content.mcpServers["agent-heaven"]).toBeDefined();
  });

  it("cleanupMcpConfig removes agent-heaven entry and deletes file if empty", () => {
    const dir = makeTmpDir();
    dirs.push(dir);

    const files = writeMcpConfig({ projectPath: dir, agent: "claude", port: 1234, token: "tok" });
    expect(fs.existsSync(files[0])).toBe(true);

    cleanupMcpConfig(files);
    expect(fs.existsSync(files[0])).toBe(false);
  });

  it("cleanupMcpConfig preserves other servers when cleaning up", () => {
    const dir = makeTmpDir();
    dirs.push(dir);

    const mcpPath = path.join(dir, ".mcp.json");
    fs.writeFileSync(mcpPath, JSON.stringify({
      mcpServers: {
        "other-server": { type: "http", url: "http://other.com/mcp" }
      }
    }), "utf8");

    const files = writeMcpConfig({ projectPath: dir, agent: "claude", port: 1234, token: "tok" });
    cleanupMcpConfig(files);

    expect(fs.existsSync(mcpPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    expect(content.mcpServers["other-server"]).toBeDefined();
    expect(content.mcpServers["agent-heaven"]).toBeUndefined();
  });

  it("cleanupMcpConfig for codex also removes .codex dir if empty", () => {
    const dir = makeTmpDir();
    dirs.push(dir);

    const files = writeMcpConfig({ projectPath: dir, agent: "codex", port: 1234, token: "tok" });
    expect(fs.existsSync(path.join(dir, ".codex"))).toBe(true);

    cleanupMcpConfig(files);
    expect(fs.existsSync(path.join(dir, ".codex"))).toBe(false);
  });

  it("cleanupMcpConfig is no-op if file was already removed", () => {
    const dir = makeTmpDir();
    dirs.push(dir);

    const files = writeMcpConfig({ projectPath: dir, agent: "claude", port: 1234, token: "tok" });
    fs.unlinkSync(files[0]);

    // Should not throw
    cleanupMcpConfig(files);
  });
});
