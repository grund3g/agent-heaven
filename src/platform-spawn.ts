import * as path from "node:path";
import { spawn } from "node:child_process";
import type { SpawnOptions } from "node:child_process";

function isBareCommand(p: string): boolean {
  const s = String(p || "").trim();
  if (!s) return true;
  return !s.includes("\\") && !s.includes("/");
}

function isWindowsCmdShim(p: string): boolean {
  const ext = path.extname(String(p || "")).toLowerCase();
  return ext === ".cmd" || ext === ".bat";
}

function shouldUseCmdExeOnWindows(command: string): boolean {
  if (process.platform !== "win32") return false;
  const c = String(command || "").trim();
  if (!c) return false;
  // npm-installed CLIs are typically `*.cmd` shims (CreateProcess can't run them directly).
  if (isWindowsCmdShim(c)) return true;
  // For bare commands (e.g. "codex"), let cmd.exe resolve via PATH/PATHEXT.
  if (isBareCommand(c)) return true;
  return false;
}

export function spawnPlatform(command: string, args: string[], options: SpawnOptions) {
  const cmd = String(command || "").trim();
  const argv = Array.isArray(args) ? args.map((x) => String(x)) : [];

  if (shouldUseCmdExeOnWindows(cmd)) {
    const comspec = (process.env.comspec && String(process.env.comspec).trim()) || "cmd.exe";
    const cmdArgs = ["/d", "/s", "/c", cmd, ...argv];
    const opts: any = { ...(options || {}) };
    // Avoid flashing a console window in packaged apps.
    if (typeof opts.windowsHide !== "boolean") opts.windowsHide = true;
    return spawn(comspec, cmdArgs, opts);
  }

  return spawn(cmd, argv, options || {});
}

