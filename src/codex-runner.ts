import { spawn } from "node:child_process";

function nowIso() {
  return new Date().toISOString();
}

function pushImageArgs(args, images) {
  const arr = Array.isArray(images) ? images : [];
  for (const img of arr) {
    const p = typeof img === "string" ? img.trim() : "";
    if (!p) continue;
    args.push("--image", p);
  }
}

function looksLikeJsonObjectLine(line) {
  const s = line.trimStart();
  return s.startsWith("{") && s.endsWith("}");
}

function parseJsonLine(line) {
  if (!looksLikeJsonObjectLine(line)) return null;
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function buildExecArgs({ settings, model, projectPath, images }) {
  const args = ["exec", "--json"];

  if (settings.color && settings.color !== "auto") {
    args.push("--color", settings.color);
  }
  if (settings.skipGitRepoCheck) {
    args.push("--skip-git-repo-check");
  }
  if (model) {
    args.push("-m", model);
  }

  pushImageArgs(args, images);

  // Note: `--dangerously-bypass-approvals-and-sandbox` overrides sandboxing.
  if (settings.bypassApprovalsAndSandbox) {
    args.push("--dangerously-bypass-approvals-and-sandbox");
  } else if (settings.sandboxMode) {
    args.push("--sandbox", settings.sandboxMode);
  }

  // Keep both `cwd` (spawn option) and `-C` for Codex; helps with trust checks and path resolution.
  if (projectPath) {
    args.push("-C", projectPath);
  }

  // Read prompt from stdin to avoid command-line length/escaping problems.
  args.push("-");

  return args;
}

function buildResumeArgs({ settings, model, threadId, images }) {
  const args = ["exec", "resume", "--json"];

  if (settings.skipGitRepoCheck) {
    args.push("--skip-git-repo-check");
  }
  if (model) {
    args.push("-m", model);
  }
  if (settings.bypassApprovalsAndSandbox) {
    args.push("--dangerously-bypass-approvals-and-sandbox");
  }

  pushImageArgs(args, images);

  args.push(threadId);
  args.push("-");
  return args;
}

function spawnCodex({ codexPath, cwd, args, prompt }) {
  const child = spawn(codexPath, args, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    env: process.env
  });

  child.stdin.setDefaultEncoding("utf8");
  child.stdin.write(prompt);
  child.stdin.end();

  return child;
}

function attachLineStream(stream, onLine) {
  let buf = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buf += chunk;
    while (true) {
      const idx = buf.indexOf("\n");
      if (idx === -1) break;
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      onLine(line);
    }
  });
  stream.on("end", () => {
    if (buf.length > 0) onLine(buf);
    buf = "";
  });
}

export function runCodexExec({ codexPath, settings, projectPath, model, prompt, images, onEvent }) {
  const args = buildExecArgs({ settings, model, projectPath, images });
  const child = spawnCodex({ codexPath, cwd: projectPath || process.cwd(), args, prompt });

  attachLineStream(child.stdout, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stdout", kind: "codex", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stdout", kind: "log", text: line });
  });
  attachLineStream(child.stderr, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stderr", kind: "codex", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stderr", kind: "log", text: line });
  });

  return child;
}

export function runCodexResume({ codexPath, settings, cwd, threadId, model, prompt, images, onEvent }) {
  const args = buildResumeArgs({ settings, model, threadId, images });
  const child = spawnCodex({ codexPath, cwd: cwd || process.cwd(), args, prompt });

  attachLineStream(child.stdout, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stdout", kind: "codex", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stdout", kind: "log", text: line });
  });
  attachLineStream(child.stderr, (line) => {
    const json = parseJsonLine(line);
    if (json) onEvent({ ts: nowIso(), stream: "stderr", kind: "codex", data: json });
    else if (line.trim().length > 0) onEvent({ ts: nowIso(), stream: "stderr", kind: "log", text: line });
  });

  return child;
}
