import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCodexExec, runCodexResume } from "../src/codex-runner";

describe("codex-runner", () => {
  let tmpDir = "";

  function writeFakeCodex(script: string) {
    const isWin = process.platform === "win32";
    const binPath = path.join(tmpDir, isWin ? "fake-codex.cmd" : "fake-codex");
    const jsPath = path.join(tmpDir, "fake-codex.js");

    if (isWin) {
      fs.writeFileSync(jsPath, script, { encoding: "utf8" });
      const cmd = [`@echo off`, `setlocal`, `"${process.execPath}" "${jsPath}" %*`, `exit /b %errorlevel%`].join("\r\n") + "\r\n";
      fs.writeFileSync(binPath, cmd, { encoding: "utf8" });
    } else {
      fs.writeFileSync(binPath, script, { encoding: "utf8" });
      fs.chmodSync(binPath, 0o755);
    }

    return binPath;
  }

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
      "  console.log(JSON.stringify({ type: 'thread.started', thread_id: 't123' }));",
      "  console.log('plain stdout');",
      "  console.error('plain stderr');",
      "  process.exit(0);",
      "});"
    ].join("\n");

    if (isWin) {
      // Windows can't execute shebang scripts directly; use a .cmd shim that calls Node.
      fs.writeFileSync(jsPath, script, { encoding: "utf8" });
      const cmd = [`@echo off`, `setlocal`, `"${process.execPath}" "${jsPath}" %*`].join("\r\n") + "\r\n";
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

  it("falls back to exec --json when app-server bootstrap fails", async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-codex-"));

    const script = [
      "#!/usr/bin/env node",
      "const args = process.argv.slice(2);",
      "if (args.includes('app-server')) {",
      "  console.error('app-server boom');",
      "  process.exit(7);",
      "}",
      "let input = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (c) => (input += c));",
      "process.stdin.on('end', () => {",
      "  console.log(JSON.stringify({ type: 'thread.started', thread_id: 'fallback-thread' }));",
      "  console.log(JSON.stringify({ type: 'turn.started' }));",
      "  console.log(JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'ok' } }));",
      "  console.log(JSON.stringify({ type: 'turn.completed', usage: { input_tokens: 12, output_tokens: 3 } }));",
      "  process.exit(0);",
      "});"
    ].join("\n");

    const binPath = writeFakeCodex(script);

    const events: any[] = [];
    const child = runCodexExec({
      codexPath: binPath,
      settings: { sandboxMode: "workspace-write", transport: "app_server" },
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

    expect(events.some((e) => e.kind === "log" && String(e.text || "").includes("falling back to exec --json"))).toBe(true);
    expect(events.some((e) => e.kind === "codex" && e.data && e.data.thread_id === "fallback-thread")).toBe(true);
  });

  it("maps app-server notifications to codex event format", async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-codex-"));

    const script = [
      "#!/usr/bin/env node",
      "const args = process.argv.slice(2);",
      "function send(obj){ process.stdout.write(JSON.stringify(obj) + '\\n'); }",
      "if (!args.includes('app-server')) { process.exit(1); }",
      "let buf = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (chunk) => {",
      "  buf += chunk;",
      "  while (true) {",
      "    const idx = buf.indexOf('\\n');",
      "    if (idx < 0) break;",
      "    const line = buf.slice(0, idx);",
      "    buf = buf.slice(idx + 1);",
      "    if (!line.trim()) continue;",
      "    let msg = null;",
      "    try { msg = JSON.parse(line); } catch { continue; }",
      "    if (!msg || typeof msg !== 'object') continue;",
      "    if (msg.method === 'initialize') { send({ id: msg.id, result: {} }); continue; }",
      "    if (msg.method === 'thread/start') { send({ id: msg.id, result: { thread: { id: 't-app' } } }); continue; }",
      "    if (msg.method === 'turn/start') {",
      "      send({ id: msg.id, result: { turn: { id: 'turn-1', items: [], status: 'inProgress', error: null } } });",
      "      send({ method: 'thread/started', params: { thread: { id: 't-app' } } });",
      "      send({ method: 'turn/started', params: { threadId: 't-app', turn: { id: 'turn-1', items: [], status: 'inProgress', error: null } } });",
      "      send({ method: 'thread/tokenUsage/updated', params: { threadId: 't-app', turnId: 'turn-1', tokenUsage: {",
      "        last: { inputTokens: 11, cachedInputTokens: 1, outputTokens: 3, reasoningOutputTokens: 0, totalTokens: 14 },",
      "        total: { inputTokens: 11, cachedInputTokens: 1, outputTokens: 3, reasoningOutputTokens: 0, totalTokens: 14 },",
      "        modelContextWindow: 200000",
      "      } } });",
      "      send({ method: 'item/completed', params: { threadId: 't-app', turnId: 'turn-1', item: { type: 'agentMessage', id: 'msg-1', text: 'hello from app-server' } } });",
      "      send({ method: 'turn/completed', params: { threadId: 't-app', turn: { id: 'turn-1', items: [], status: 'completed', error: null } } });",
      "      setTimeout(() => process.exit(0), 10);",
      "      continue;",
      "    }",
      "  }",
      "});"
    ].join("\n");

    const binPath = writeFakeCodex(script);

    const events: any[] = [];
    const child = runCodexExec({
      codexPath: binPath,
      settings: { sandboxMode: "workspace-write", transport: "app_server" },
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

    const tokenEvent = events.find((e) => e.kind === "codex" && e.data && e.data.type === "token.usage.updated");
    expect(tokenEvent && tokenEvent.data && tokenEvent.data.model_context_window).toBe(200000);

    const msgEvent = events.find(
      (e) => e.kind === "codex" && e.data && e.data.type === "item.completed" && e.data.item && e.data.item.type === "agent_message"
    );
    expect(msgEvent && msgEvent.data && msgEvent.data.item && msgEvent.data.item.text).toBe("hello from app-server");

    const completed = events.find((e) => e.kind === "codex" && e.data && e.data.type === "turn.completed");
    expect(completed && completed.data && completed.data.usage && completed.data.usage.input_tokens).toBe(11);
  });
});
