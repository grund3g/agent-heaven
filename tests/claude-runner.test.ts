import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runClaudeExec, runClaudeResume } from "../src/claude-runner";

describe("claude-runner", () => {
  let tmpDir = "";

  afterEach(() => {
    if (tmpDir) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
      tmpDir = "";
    }
  });

  it("streams jsonl events + plain logs (exec + resume)", async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-claude-"));
    const binPath = path.join(tmpDir, "fake-claude");

    const script = [
      "#!/usr/bin/env node",
      "let input = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (c) => (input += c));",
      "process.stdin.on('end', () => {",
      "  console.log(JSON.stringify({ type: 'system', subtype: 'init', session_id: 's123' }));",
      "  console.log('plain stdout');",
      "  console.error('plain stderr');",
      "  process.exit(0);",
      "});"
    ].join("\n");

    fs.writeFileSync(binPath, script, { encoding: "utf8" });
    fs.chmodSync(binPath, 0o755);

    const events: any[] = [];
    const child = runClaudeExec({
      claudePath: binPath,
      settings: {},
      projectPath: tmpDir,
      model: "",
      sessionId: "00000000-0000-4000-8000-000000000000",
      prompt: "hello",
      onEvent: (ev: any) => events.push(ev)
    });

    await new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", () => resolve());
    });
    await new Promise((r) => setTimeout(r, 10));

    expect(
      events.some(
        (e) => e.kind === "claude" && e.stream === "stdout" && e.data && e.data.type === "system" && e.data.subtype === "init"
      )
    ).toBe(true);
    expect(events.some((e) => e.kind === "log" && e.stream === "stdout" && e.text === "plain stdout")).toBe(true);
    expect(events.some((e) => e.kind === "log" && e.stream === "stderr" && e.text === "plain stderr")).toBe(true);

    const resumeEvents: any[] = [];
    const child2 = runClaudeResume({
      claudePath: binPath,
      settings: {},
      cwd: tmpDir,
      sessionId: "s123",
      model: "",
      prompt: "followup",
      onEvent: (ev: any) => resumeEvents.push(ev)
    });

    await new Promise<void>((resolve, reject) => {
      child2.once("error", reject);
      child2.once("close", () => resolve());
    });
    await new Promise((r) => setTimeout(r, 10));

    expect(
      resumeEvents.some((e) => e.kind === "claude" && e.stream === "stdout" && e.data && e.data.type === "system" && e.data.subtype === "init")
    ).toBe(true);
  });
});
