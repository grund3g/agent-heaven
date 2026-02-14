import * as path from "node:path";
import { app, BrowserWindow } from "electron";
import { isFalseyEnv, isTruthyEnv } from "../core/env";

let devLiveReloadStarted = false;

export function startDevLiveReload(opts: {
  isMainRestartSafe?: () => boolean;
  sendDevNotice: (payload: any) => void;
}) {
  if (devLiveReloadStarted) return;

  // In dev (not packaged), enable live reload by default. Allow opting out via AGENT_HEAVEN_DEV_RELOAD=0.
  if (isFalseyEnv("AGENT_HEAVEN_DEV_RELOAD")) return;
  if (app.isPackaged && !isTruthyEnv("AGENT_HEAVEN_DEV_RELOAD")) return;

  devLiveReloadStarted = true;

  const options = opts && typeof opts === "object" ? opts : ({} as any);
  const sendDevNotice = typeof options.sendDevNotice === "function" ? options.sendDevNotice : () => {};
  const isMainRestartSafe =
    typeof options.isMainRestartSafe === "function"
      ? options.isMainRestartSafe
      : () => true;

  let chokidar: any;
  try {
    // Dev dependency; keep production startup resilient.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    chokidar = require("chokidar");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Dev live reload enabled, but chokidar is not installed (install dev dependencies):", err);
    return;
  }

  // In build output, this file lives at build/electron/*.js.
  const buildDir = path.join(__dirname, "..");
  const rendererDir = path.join(__dirname, "..", "..", "renderer");
  const preloadFile = path.join(buildDir, "preload.js");

  // eslint-disable-next-line no-console
  console.log("[dev] live reload enabled (watching renderer/* + preload.js)");
  sendDevNotice({ kind: "live-reload-enabled" });

  const watchOpts = {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 120, pollInterval: 25 }
  };

  let reloadTimer: NodeJS.Timeout | null = null;
  function scheduleRendererReload() {
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      reloadTimer = null;
      for (const win of BrowserWindow.getAllWindows()) {
        if (!win || win.isDestroyed()) continue;
        try {
          win.webContents.reloadIgnoringCache();
        } catch {
          try {
            win.webContents.reload();
          } catch {
            // ignore
          }
        }
      }
    }, 150);
  }

  const uiWatcher = chokidar.watch([rendererDir, preloadFile], watchOpts);
  uiWatcher.on("all", (_event: any, filePath: any) => {
    // Only reload for actual files (avoid some editor temp events).
    if (typeof filePath === "string" && filePath.length > 0) scheduleRendererReload();
  });
  uiWatcher.on("error", (err: any) => {
    // eslint-disable-next-line no-console
    console.warn("dev live reload watcher error:", err);
  });

  // Watch all main-process build outputs, but avoid preload.js since that's safe to reload in-place.
  const mainFiles = [
    path.join(buildDir, "main.js"),
    path.join(buildDir, "store.js"),
    path.join(buildDir, "codex-runner.js"),
    path.join(buildDir, "job-history.js"),
    path.join(buildDir, "needs-attention.js"),
    path.join(buildDir, "electron/**/*.js"),
    path.join(buildDir, "core/**/*.js")
  ];

  const mainWatcher = chokidar.watch(mainFiles, { ...watchOpts, ignored: [preloadFile] });
  let noticeTimer: NodeJS.Timeout | null = null;
  const noticeFiles = new Set<string>();
  function scheduleMainRestartNotice(filePath: any) {
    noticeFiles.add(path.basename(String(filePath || "")));
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => {
      noticeTimer = null;
      const files = [...noticeFiles].filter(Boolean);
      noticeFiles.clear();
      sendDevNotice({
        kind: "main-restart-required",
        files
      });
    }, 250);
  }

  let relaunchTimer: NodeJS.Timeout | null = null;
  const relaunchFiles = new Set<string>();
  let relaunching = false;
  function scheduleMainRelaunch(filePath: any) {
    if (relaunching) return;
    relaunchFiles.add(path.basename(String(filePath || "")));
    if (relaunchTimer) clearTimeout(relaunchTimer);
    relaunchTimer = setTimeout(() => {
      relaunchTimer = null;
      if (relaunching) return;
      relaunching = true;
      const files = [...relaunchFiles].filter(Boolean);
      relaunchFiles.clear();
      // eslint-disable-next-line no-console
      console.log(`[dev] main process changed${files.length ? ` (${files.join(", ")})` : ""}; relaunching...`);
      sendDevNotice({ kind: "main-restarting", files });
      try {
        app.relaunch();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[dev] relaunch failed:", err);
      }
      // Ensure we actually exit even if something holds the event loop.
      try {
        app.exit(0);
      } catch {
        process.exit(0);
      }
    }, 300);
  }

  mainWatcher.on("all", (_event: any, filePath: any) => {
    let safe = false;
    try {
      safe = !!isMainRestartSafe();
    } catch {
      safe = false;
    }
    if (safe) scheduleMainRelaunch(filePath);
    else scheduleMainRestartNotice(filePath);
  });

  app.on("before-quit", () => {
    try {
      uiWatcher.close();
    } catch {
      // ignore
    }
    try {
      mainWatcher.close();
    } catch {
      // ignore
    }
  });
}
