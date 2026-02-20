const { execFileSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function bin(name) {
  const ext = process.platform === "win32" ? ".cmd" : "";
  return path.join(__dirname, "..", "node_modules", ".bin", `${name}${ext}`);
}

function patchMacElectronBundleName(appName) {
  if (process.platform !== "darwin") return;
  const plistPath = path.join(__dirname, "..", "node_modules", "electron", "dist", "Electron.app", "Contents", "Info.plist");
  if (!fs.existsSync(plistPath)) return;

  // In dev (`electron .`), macOS uses Electron.app's bundle name for the menu bar label.
  // Patch the dev Electron bundle so it shows our app name instead of "Electron".
  try {
    execFileSync("plutil", ["-replace", "CFBundleDisplayName", "-string", String(appName || ""), plistPath], { stdio: "ignore" });
  } catch {
    // ignore
  }
  try {
    execFileSync("plutil", ["-replace", "CFBundleName", "-string", String(appName || ""), plistPath], { stdio: "ignore" });
  } catch {
    // ignore
  }
}

function runInitialBuild() {
  execFileSync(bin("tsc"), ["-p", "tsconfig.json"], { stdio: "inherit" });
}

function killProcessTree(child, opts = {}) {
  const c = child && typeof child === "object" ? child : null;
  const pid = c && typeof c.pid === "number" ? c.pid : 0;
  if (!pid) return;

  const force = !!(opts && opts.force);

  if (process.platform === "win32") {
    const args = ["/pid", String(pid), "/t"];
    if (force) args.push("/f");
    try {
      spawn("taskkill", args, { stdio: "ignore", windowsHide: true });
    } catch {
      // ignore
    }
    return;
  }

  const sig = force ? "SIGKILL" : "SIGTERM";
  try {
    process.kill(-pid, sig);
    return;
  } catch {
    // ignore
  }

  try {
    c.kill(sig);
  } catch {
    // ignore
  }
}

function main() {
  patchMacElectronBundleName("Agent Heaven");
  runInitialBuild();

  const spawnOpts = { stdio: "inherit", detached: process.platform !== "win32" };
  const tsc = spawn(bin("tsc"), ["-w", "-p", "tsconfig.json"], spawnOpts);

  const env = { ...process.env, AGENT_HEAVEN_DEV_RELOAD: "1" };
  const electron = spawn(bin("electron"), ["."], { ...spawnOpts, env });

  const children = new Set([tsc, electron]);
  let shuttingDown = false;
  let exitCode = 0;
  let hardKillTimer = null;
  let forceExitTimer = null;

  function finalize() {
    if (hardKillTimer) {
      clearTimeout(hardKillTimer);
      hardKillTimer = null;
    }
    if (forceExitTimer) {
      clearTimeout(forceExitTimer);
      forceExitTimer = null;
    }
    process.exit(exitCode);
  }

  function shutdown(code) {
    if (shuttingDown) return;
    shuttingDown = true;
    exitCode = typeof code === "number" ? code : 1;

    for (const child of children) killProcessTree(child, { force: false });

    hardKillTimer = setTimeout(() => {
      for (const child of children) killProcessTree(child, { force: true });
    }, 2500);

    forceExitTimer = setTimeout(() => {
      process.exit(exitCode);
    }, 6000);

    if (children.size === 0) finalize();
  }

  function onChildExit(child, code, signal) {
    children.delete(child);
    if (!shuttingDown) {
      if (signal) shutdown(1);
      else shutdown(typeof code === "number" ? code : 1);
      return;
    }
    if (children.size === 0) finalize();
  }

  electron.on("exit", (code, signal) => onChildExit(electron, code, signal));
  tsc.on("exit", (code, signal) => onChildExit(tsc, code, signal));

  process.on("SIGINT", () => shutdown(130));
  process.on("SIGTERM", () => shutdown(143));
}

main();
