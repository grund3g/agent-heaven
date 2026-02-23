import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runGeminiExec, runGeminiResume } from "../src/gemini-runner";

function writeExecutable(filePath: string, content: string) {
  fs.writeFileSync(filePath, content, { encoding: "utf8" });
  if (process.platform !== "win32") fs.chmodSync(filePath, 0o755);
}

describe("gemini-runner", () => {
  let tmpDir = "";
  const originalPath = String(process.env.PATH || "");

  afterEach(() => {
    process.env.PATH = originalPath;
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
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-gemini-"));
    const isWin = process.platform === "win32";
    const binPath = path.join(tmpDir, isWin ? "fake-gemini.cmd" : "fake-gemini");
    const jsPath = path.join(tmpDir, "fake-gemini.js");

    const script = [
      "#!/usr/bin/env node",
      "let input = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (c) => (input += c));",
      "process.stdin.on('end', () => {",
      "  const args = process.argv.slice(2);",
      "  const resumeIdx = args.indexOf('--resume');",
      "  const resume = resumeIdx !== -1 ? String(args[resumeIdx + 1] || '') : '';",
      "  console.log(JSON.stringify({ type: 'content', text: resume ? `resume:${resume}` : 'exec', prompt: input }));",
      "  console.log('plain stdout');",
      "  console.error('plain stderr');",
      "  process.exit(0);",
      "});"
    ].join("\n");

    if (isWin) {
      writeExecutable(jsPath, script);
      const cmd = [`@echo off`, `setlocal`, `"${process.execPath}" "${jsPath}" %*`].join("\r\n") + "\r\n";
      writeExecutable(binPath, cmd);
    } else {
      writeExecutable(binPath, script);
    }

    const events: any[] = [];
    const child = runGeminiExec({
      geminiPath: binPath,
      settings: { sandboxMode: "workspace-write" },
      projectPath: tmpDir,
      model: "",
      prompt: "hello",
      onEvent: (ev: any) => events.push(ev)
    });

    await new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", () => resolve());
    });
    await new Promise((r) => setTimeout(r, 10));

    expect(events.some((e) => e.kind === "gemini" && e.stream === "stdout" && e.data && e.data.type === "content")).toBe(true);
    expect(events.some((e) => e.kind === "gemini" && e.stream === "stdout" && e.data && e.data.prompt === "hello")).toBe(true);
    expect(events.some((e) => e.kind === "log" && e.stream === "stdout" && e.text === "plain stdout")).toBe(true);
    expect(events.some((e) => e.kind === "log" && e.stream === "stderr" && e.text === "plain stderr")).toBe(true);

    const resumeEvents: any[] = [];
    const child2 = runGeminiResume({
      geminiPath: binPath,
      settings: { sandboxMode: "workspace-write" },
      cwd: tmpDir,
      sessionId: "session-42",
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
      resumeEvents.some(
        (e) => e.kind === "gemini" && e.stream === "stdout" && e.data && e.data.type === "content" && e.data.text === "resume:session-42"
      )
    ).toBe(true);
    expect(resumeEvents.some((e) => e.kind === "gemini" && e.stream === "stdout" && e.data && e.data.prompt === "followup")).toBe(true);
  });

  it("maps sandbox modes to supported Gemini CLI flags", async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-gemini-sandbox-"));
    const isWin = process.platform === "win32";
    const binPath = path.join(tmpDir, isWin ? "fake-gemini.cmd" : "fake-gemini");
    const jsPath = path.join(tmpDir, "fake-gemini.js");

    const script = [
      "#!/usr/bin/env node",
      "let input = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (c) => (input += c));",
      "process.stdin.on('end', () => {",
      "  const args = process.argv.slice(2);",
      "  console.log(JSON.stringify({ type: 'args', args, input }));",
      "  process.exit(0);",
      "});"
    ].join("\n");

    if (isWin) {
      writeExecutable(jsPath, script);
      const cmd = [`@echo off`, `setlocal`, `"${process.execPath}" "${jsPath}" %*`].join("\r\n") + "\r\n";
      writeExecutable(binPath, cmd);
    } else {
      writeExecutable(binPath, script);
    }

    async function runOnce(sandboxMode: string) {
      const events: any[] = [];
      const child = runGeminiExec({
        geminiPath: binPath,
        settings: { sandboxMode },
        projectPath: tmpDir,
        model: "",
        prompt: "hello",
        onEvent: (ev: any) => events.push(ev)
      });

      await new Promise<void>((resolve, reject) => {
        child.once("error", reject);
        child.once("close", () => resolve());
      });
      await new Promise((r) => setTimeout(r, 10));

      const argsEvent = events.find((e) => e.kind === "gemini" && e.data && e.data.type === "args");
      expect(argsEvent).toBeTruthy();
      return {
        args: Array.isArray(argsEvent.data.args) ? argsEvent.data.args.map((x: any) => String(x)) : [],
        input: typeof argsEvent.data.input === "string" ? argsEvent.data.input : ""
      };
    }

    const readOnlyRun = await runOnce("read-only");
    expect(readOnlyRun.args).not.toContain("--prompt");
    expect(readOnlyRun.input).toBe("hello");
    expect(readOnlyRun.args).toContain("--sandbox");
    expect(readOnlyRun.args).not.toContain("read-only");
    expect(readOnlyRun.args).not.toContain("workspace-write");
    expect(readOnlyRun.args).not.toContain("danger-full-access");

    const workspaceRun = await runOnce("workspace-write");
    expect(workspaceRun.args).not.toContain("--prompt");
    expect(workspaceRun.input).toBe("hello");
    expect(workspaceRun.args).toContain("--sandbox");
    expect(workspaceRun.args).toContain("--approval-mode");
    expect(workspaceRun.args).toContain("auto_edit");
    expect(workspaceRun.args).not.toContain("read-only");
    expect(workspaceRun.args).not.toContain("workspace-write");
    expect(workspaceRun.args).not.toContain("danger-full-access");

    const dangerRun = await runOnce("danger-full-access");
    expect(dangerRun.args).not.toContain("--prompt");
    expect(dangerRun.input).toBe("hello");
    expect(dangerRun.args).toContain("--approval-mode");
    expect(dangerRun.args).toContain("yolo");
    expect(dangerRun.args).not.toContain("--sandbox");
    expect(dangerRun.args).not.toContain("read-only");
    expect(dangerRun.args).not.toContain("workspace-write");
    expect(dangerRun.args).not.toContain("danger-full-access");
  });

  it("uses current runtime for node shebang scripts even if PATH node is broken", async () => {
    if (process.platform === "win32") return;

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-gemini-node-"));
    const fakeNodePath = path.join(tmpDir, "node");
    const geminiPath = path.join(tmpDir, "fake-gemini");

    writeExecutable(fakeNodePath, ["#!/bin/sh", "echo fake-node-hit >&2", "exit 97"].join("\n"));
    writeExecutable(
      geminiPath,
      [
        "#!/usr/bin/env node",
        "process.stdin.resume();",
        "process.stdin.on('end', () => {",
        "  console.log(JSON.stringify({ type: 'content', text: 'ok-from-real-node' }));",
        "  process.exit(0);",
        "});"
      ].join("\n")
    );
    process.env.PATH = `${tmpDir}${path.delimiter}${originalPath}`;

    const events: any[] = [];
    const child = runGeminiExec({
      geminiPath,
      settings: {},
      projectPath: tmpDir,
      model: "",
      prompt: "hello",
      onEvent: (ev: any) => events.push(ev)
    });

    await new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", () => resolve());
    });
    await new Promise((r) => setTimeout(r, 10));

    expect(events.some((e) => e.kind === "gemini" && e.data && e.data.text === "ok-from-real-node")).toBe(true);
    expect(events.some((e) => e.kind === "log" && String(e.text || "").includes("fake-node-hit"))).toBe(false);
  });
});
