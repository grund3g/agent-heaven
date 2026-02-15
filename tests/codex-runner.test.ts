import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCodexExec, runCodexResume } from "../src/codex-runner";

describe("codex-runner", () => {
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
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-codex-"));
    const isWin = process.platform === "win32";
    const binPath = path.join(tmpDir, isWin ? "fake-codex.cmd" : "fake-codex");
    const jsPath = path.join(tmpDir, "fake-codex.js");

    const script = [
      "#!/usr/bin/env node",
      "let input = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (c) => (input += c));",
      "process.stdin.on('end', () => {",
      "  // Emit one JSON event + two plain log lines.",
      "  console.log(JSON.stringify({ type: 'thread.started', thread_id: 't123' }));",
      "  console.log('plain stdout');",
      "  console.error('plain stderr');",
      "  process.exit(0);",
      "});"
    ].join("\n");

    if (isWin) {
      // Windows can't execute shebang scripts directly; use a .cmd shim that calls Node.
      fs.writeFileSync(jsPath, script, { encoding: "utf8" });
      const cmd = [`@echo off`, `setlocal`, `"${process.execPath}" "${jsPath}" %*`, `exit /b %errorlevel%`].join("\r\n") + "\r\n";
      fs.writeFileSync(binPath, cmd, { encoding: "utf8" });
    } else {
      fs.writeFileSync(binPath, script, { encoding: "utf8" });
      fs.chmodSync(binPath, 0o755);
    }

    const events: any[] = [];
    const child = runCodexExec({
      codexPath: binPath,
      settings: { sandboxMode: "workspace-write" },
      projectPath: tmpDir,
      model: "",
      prompt: "hello",
      images: [],
      onEvent: (ev: any) => events.push(ev)
    });

    await new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", () => resolve());
    });
    await new Promise((r) => setTimeout(r, 10));

    expect(events.some((e) => e.kind === "codex" && e.stream === "stdout" && e.data && e.data.type === "thread.started")).toBe(
      true
    );
    expect(events.some((e) => e.kind === "log" && e.stream === "stdout" && e.text === "plain stdout")).toBe(true);
    expect(events.some((e) => e.kind === "log" && e.stream === "stderr" && e.text === "plain stderr")).toBe(true);

    const resumeEvents: any[] = [];
    const child2 = runCodexResume({
      codexPath: binPath,
      settings: { sandboxMode: "workspace-write" },
      cwd: tmpDir,
      threadId: "t123",
      model: "",
      prompt: "followup",
      images: [],
      onEvent: (ev: any) => resumeEvents.push(ev)
    });

    await new Promise<void>((resolve, reject) => {
      child2.once("error", reject);
      child2.once("close", () => resolve());
    });
    await new Promise((r) => setTimeout(r, 10));

    expect(
      resumeEvents.some((e) => e.kind === "codex" && e.stream === "stdout" && e.data && e.data.type === "thread.started")
    ).toBe(true);
  });
});
