import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  _resetCodexConfigCacheForTests,
  parseTopLevelCodexModelFromConfigToml,
  readCodexDefaultModelFromConfigToml
} from "../src/codex-config";

describe("codex-config", () => {
  afterEach(() => {
    _resetCodexConfigCacheForTests();
    delete process.env.AGENT_HEAVEN_CODEX_CONFIG_TOML;
  });

  it("parses top-level model from config.toml text", () => {
    const txt = [
      "# comment",
      "model = \"gpt-5.3-codex\"  # inline comment",
      "",
      "[projects.\"/tmp/x\"]",
      "trust_level = \"trusted\"",
      "model = \"should_not_win\""
    ].join("\n");
    expect(parseTopLevelCodexModelFromConfigToml(txt)).toBe("gpt-5.3-codex");
  });

  it("reads model from a config.toml file (with caching)", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-codex-config-"));
    const p = path.join(dir, "config.toml");
    fs.writeFileSync(p, "model = \"o3\"\n", { encoding: "utf8" });

    process.env.AGENT_HEAVEN_CODEX_CONFIG_TOML = p;

    const a = readCodexDefaultModelFromConfigToml();
    const b = readCodexDefaultModelFromConfigToml();
    expect(a).toBe("o3");
    expect(b).toBe("o3");

    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });
});

