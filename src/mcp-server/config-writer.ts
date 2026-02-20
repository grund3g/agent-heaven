import * as fs from "node:fs";
import * as path from "node:path";

const AGENT_HEAVEN_KEY = "agent-heaven";

export function writeMcpConfig(opts: {
  projectPath: string;
  agent: "claude" | "codex";
  port: number;
  token: string;
}): string[] {
  const files: string[] = [];

  if (opts.agent === "claude") {
    const filePath = path.join(opts.projectPath, ".mcp.json");
    const config = readJsonSafe(filePath);
    if (!config.mcpServers || typeof config.mcpServers !== "object") {
      config.mcpServers = {};
    }
    config.mcpServers[AGENT_HEAVEN_KEY] = {
      type: "http",
      url: `http://127.0.0.1:${opts.port}/mcp`,
      headers: {
        Authorization: `Bearer ${opts.token}`
      }
    };
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n", "utf8");
    files.push(filePath);
  } else {
    // Codex: write .codex/mcp.json
    const codexDir = path.join(opts.projectPath, ".codex");
    if (!fs.existsSync(codexDir)) {
      fs.mkdirSync(codexDir, { recursive: true });
    }
    const filePath = path.join(codexDir, "mcp.json");
    const config = readJsonSafe(filePath);
    if (!config.mcpServers || typeof config.mcpServers !== "object") {
      config.mcpServers = {};
    }
    config.mcpServers[AGENT_HEAVEN_KEY] = {
      url: `http://127.0.0.1:${opts.port}/mcp`,
      http_headers: {
        Authorization: `Bearer ${opts.token}`
      }
    };
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n", "utf8");
    files.push(filePath);
  }

  return files;
}

export function cleanupMcpConfig(files: string[]): void {
  for (const filePath of files) {
    try {
      const config = readJsonSafe(filePath);
      if (config.mcpServers && typeof config.mcpServers === "object") {
        delete config.mcpServers[AGENT_HEAVEN_KEY];
        const remaining = Object.keys(config.mcpServers).length;
        if (remaining === 0) {
          // No other MCP servers, remove the file entirely
          fs.unlinkSync(filePath);

          // Also clean up .codex dir if it's empty
          const dir = path.dirname(filePath);
          if (path.basename(dir) === ".codex") {
            try {
              const entries = fs.readdirSync(dir);
              if (entries.length === 0) fs.rmdirSync(dir);
            } catch { /* ignore */ }
          }
        } else {
          // Other entries remain, rewrite without our key
          fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n", "utf8");
        }
      }
    } catch {
      // File may already be gone (worktree cleaned up), ignore
    }
  }
}

function readJsonSafe(filePath: string): any {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch { /* ignore */ }
  return {};
}
