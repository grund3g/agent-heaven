// Ensure node-pty's `spawn-helper` is executable on macOS/Linux.
// Some published prebuilds ship it without the executable bit, which breaks PTY spawning.

const fs = require("node:fs");
const path = require("node:path");

function ensureExecBit(filePath) {
  try {
    const st = fs.statSync(filePath);
    if (!st.isFile()) return false;
    const mode = st.mode & 0o777;
    if ((mode & 0o111) !== 0) return true;
    fs.chmodSync(filePath, mode | 0o111);
    return true;
  } catch {
    return false;
  }
}

function main() {
  if (process.platform === "win32") return;

  let pkgPath = "";
  try {
    pkgPath = require.resolve("node-pty/package.json");
  } catch {
    return;
  }

  const root = path.dirname(pkgPath);
  const roots = new Set([
    root,
    root.replace("app.asar", "app.asar.unpacked"),
    root.replace("node_modules.asar", "node_modules.asar.unpacked")
  ]);

  for (const base of roots) {
    ensureExecBit(path.join(base, "build", "Release", "spawn-helper"));
    ensureExecBit(path.join(base, "build", "Debug", "spawn-helper"));

    const prebuildsDir = path.join(base, "prebuilds");
    let ents = [];
    try {
      ents = fs.readdirSync(prebuildsDir, { withFileTypes: true });
    } catch {
      ents = [];
    }
    for (const ent of ents) {
      if (!ent || !ent.isDirectory()) continue;
      ensureExecBit(path.join(prebuildsDir, ent.name, "spawn-helper"));
    }
  }
}

main();

