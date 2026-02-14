/* eslint-disable no-console */
// Run with: `npx electron scripts/generate-icons.cjs`
//
// Generates `build-res/icon.png` and `build-res/icon.icns` from `assets/app-icon.svg`.
// We render the SVG via Chromium to avoid extra native deps (sharp/inkscape/etc.).

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { app, BrowserWindow } = require("electron");

const ROOT = path.join(__dirname, "..");
const SVG_PATH = path.join(ROOT, "assets", "app-icon.svg");
const OUT_DIR = path.join(ROOT, "build-res");
const OUT_PNG = path.join(OUT_DIR, "icon.png");
const OUT_ICNS = path.join(OUT_DIR, "icon.icns");

function htmlForSvg(svg) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        width: 1024px;
        height: 1024px;
        overflow: hidden;
        background: transparent;
      }
      svg { width: 1024px; height: 1024px; display: block; }
    </style>
  </head>
  <body>
    ${svg}
  </body>
</html>`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function rmrf(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

async function renderBase1024Png() {
  const svg = fs.readFileSync(SVG_PATH, "utf8");
  const win = new BrowserWindow({
    width: 1024,
    height: 1024,
    useContentSize: true,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    webPreferences: {
      offscreen: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.setMenuBarVisibility(false);
  await win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(htmlForSvg(svg)));

  // Ensure fonts/filters have applied before capture.
  await new Promise((r) => setTimeout(r, 60));

  const captured = await win.webContents.capturePage({ x: 0, y: 0, width: 1024, height: 1024 });
  const base = captured.resize({ width: 1024, height: 1024, quality: "best" });

  win.destroy();
  return base;
}

function writeIconset(baseImg, iconsetDir) {
  const sizes = [
    { name: "icon_16x16.png", size: 16 },
    { name: "icon_16x16@2x.png", size: 32 },
    { name: "icon_32x32.png", size: 32 },
    { name: "icon_32x32@2x.png", size: 64 },
    { name: "icon_128x128.png", size: 128 },
    { name: "icon_128x128@2x.png", size: 256 },
    { name: "icon_256x256.png", size: 256 },
    { name: "icon_256x256@2x.png", size: 512 },
    { name: "icon_512x512.png", size: 512 },
    { name: "icon_512x512@2x.png", size: 1024 }
  ];

  ensureDir(iconsetDir);
  for (const { name, size } of sizes) {
    const img = baseImg.resize({ width: size, height: size, quality: "best" });
    fs.writeFileSync(path.join(iconsetDir, name), img.toPNG());
  }
}

async function main() {
  if (process.platform !== "darwin") {
    console.error("This generator currently targets macOS (iconutil).");
    process.exitCode = 1;
    return;
  }

  ensureDir(OUT_DIR);

  const base = await renderBase1024Png();
  fs.writeFileSync(OUT_PNG, base.toPNG());

  const iconsetDir = path.join(OUT_DIR, "icon.iconset");
  rmrf(iconsetDir);
  writeIconset(base, iconsetDir);

  execFileSync("iconutil", ["-c", "icns", iconsetDir, "-o", OUT_ICNS], { stdio: "inherit" });
  rmrf(iconsetDir);

  console.log("Wrote:", OUT_PNG);
  console.log("Wrote:", OUT_ICNS);
}

app.disableHardwareAcceleration();
app.whenReady()
  .then(main)
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    try {
      app.quit();
    } catch {
      // ignore
    }
  });

