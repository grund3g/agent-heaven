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

function main() {
  patchMacElectronBundleName("Agent Heaven");
  runInitialBuild();

  const tsc = spawn(bin("tsc"), ["-w", "-p", "tsconfig.json"], { stdio: "inherit" });

  const env = { ...process.env, AGENT_HEAVEN_DEV_RELOAD: "1" };
  const electron = spawn(bin("electron"), ["."], { stdio: "inherit", env });

  function shutdown(code) {
    try {
      tsc.kill("SIGTERM");
    } catch {
      // ignore
    }
    try {
      electron.kill("SIGTERM");
    } catch {
      // ignore
    }
    process.exit(code);
  }

  electron.on("exit", (code, signal) => {
    if (signal) shutdown(1);
    shutdown(typeof code === "number" ? code : 1);
  });

  tsc.on("exit", (code, signal) => {
    if (signal) shutdown(1);
    shutdown(typeof code === "number" ? code : 1);
  });

  process.on("SIGINT", () => shutdown(130));
  process.on("SIGTERM", () => shutdown(143));
}

main();
