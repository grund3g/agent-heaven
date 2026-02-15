/* eslint-disable no-console */
// Run with: `npx electron scripts/generate-icons.cjs`
//
// Generates `build-res/icon.png`, `build-res/icon.icns` (macOS), and `build-res/icon.ico` (Windows)
// from `assets/app-icon.svg`.
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
const OUT_ICO = path.join(OUT_DIR, "icon.ico");

function u16(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n >>> 0, 0);
  return b;
}

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0, 0);
  return b;
}

function makeIcoFromPngBuffers(entries) {
  // ICO: https://learn.microsoft.com/en-us/previous-versions/ms997538(v=msdn.10)
  // We embed PNG images directly (supported by modern Windows).
  const count = entries.length;
  const header = Buffer.concat([u16(0), u16(1), u16(count)]);

  const dirEntries = [];
  const images = [];
  let offset = 6 + count * 16;

  for (const ent of entries) {
    const size = ent && typeof ent.size === "number" ? ent.size : 0;
    const png = ent && Buffer.isBuffer(ent.png) ? ent.png : Buffer.alloc(0);
    const w = size === 256 ? 0 : Math.max(1, Math.min(255, size)) & 0xff;
    const h = size === 256 ? 0 : Math.max(1, Math.min(255, size)) & 0xff;

    const dir = Buffer.alloc(16);
    dir.writeUInt8(w, 0); // width
    dir.writeUInt8(h, 1); // height
    dir.writeUInt8(0, 2); // color count
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // planes
    dir.writeUInt16LE(32, 6); // bit count
    dir.writeUInt32LE(png.length, 8); // bytes in res
    dir.writeUInt32LE(offset, 12); // image offset

    dirEntries.push(dir);
    images.push(png);
    offset += png.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images]);
}

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
  ensureDir(OUT_DIR);

  const base = await renderBase1024Png();
  fs.writeFileSync(OUT_PNG, base.toPNG());

  // Windows ICO (embed PNGs at common sizes).
  const icoSizes = [16, 32, 48, 64, 128, 256];
  const icoEntries = icoSizes.map((size) => ({
    size,
    png: base.resize({ width: size, height: size, quality: "best" }).toPNG()
  }));
  fs.writeFileSync(OUT_ICO, makeIcoFromPngBuffers(icoEntries));

  const iconsetDir = path.join(OUT_DIR, "icon.iconset");
  if (process.platform === "darwin") {
    rmrf(iconsetDir);
    writeIconset(base, iconsetDir);

    execFileSync("iconutil", ["-c", "icns", iconsetDir, "-o", OUT_ICNS], { stdio: "inherit" });
    rmrf(iconsetDir);
  }

  console.log("Wrote:", OUT_PNG);
  console.log("Wrote:", OUT_ICO);
  if (process.platform === "darwin") console.log("Wrote:", OUT_ICNS);
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
