import { describe, expect, it } from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import { checkAgentBinaries } from "../src/agent-binaries";

describe("agent-binaries", () => {
  it("reports found=true when explicit paths are spawnable", async () => {
    const settings: any = {
      agents: {
        codex: { path: process.execPath },
        claude: { path: process.execPath }
      }
    };

    const res = await checkAgentBinaries(settings, { timeoutMs: 5000 });
    expect(res.codex.found).toBe(true);
    expect(res.claude.found).toBe(true);
  });

  it("reports found=false for missing paths", async () => {
    const missing1 = path.join(os.tmpdir(), `agent-heaven-missing-codex-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const missing2 = path.join(os.tmpdir(), `agent-heaven-missing-claude-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const settings: any = {
      agents: {
        codex: { path: missing1 },
        claude: { path: missing2 }
      }
    };

    const res = await checkAgentBinaries(settings, { timeoutMs: 1500 });
    expect(res.codex.found).toBe(false);
    expect(res.claude.found).toBe(false);
  });
});
