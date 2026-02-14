import * as path from "node:path";
import { app, BrowserWindow, ipcMain, dialog, globalShortcut, nativeTheme, screen } from "electron";
import type { OpenDialogOptions } from "electron";
import { Store } from "../store";
import { JobHistory } from "../job-history";
import { runCodexExec, runCodexResume } from "../codex-runner";
import { runClaudeExec, runClaudeResume } from "../claude-runner";
import { needsAttentionHeuristic } from "../needs-attention";
import { newId } from "../core/id";
import { normalizeColorScheme, windowBgForSettings } from "../core/theme";
import { sendDevNotice, sendJobEvent, sendSettingsChanged } from "./broadcast";
import { startDevLiveReload } from "./dev-live-reload";
import { HotkeyManager } from "./hotkey-manager";
import { JobsManager } from "./jobs-manager";
import { TrayManager } from "./tray-manager";
import { WindowManager } from "./window-manager";
import { listCodexModels } from "./codex-models";

function isMenuBarMode(settings: any) {
  return process.platform === "darwin" && !!(settings && settings.menuBarMode);
}

function setDockVisibility(settings: any) {
  if (process.platform !== "darwin") return;
  if (!app.dock) return;

  if (isMenuBarMode(settings)) {
    try {
      app.dock.hide();
    } catch {
      // ignore
    }
    return;
  }

  try {
    // show() returns a Promise on macOS.
    app.dock.show().catch(() => {});
  } catch {
    // ignore
  }
}

function setLoginItem(settings: any) {
  if (process.platform !== "darwin") return;
  if (!app.isPackaged) return;
  try {
    app.setLoginItemSettings({
      openAtLogin: !!(settings && settings.startAtLogin),
      openAsHidden: true
    });
  } catch {
    // ignore
  }
}

function applyNativeThemeFromSettings(settings: any) {
  const s = settings && typeof settings === "object" ? settings : {};
  const scheme = normalizeColorScheme(s.uiColorScheme);
  try {
    nativeTheme.themeSource = scheme;
  } catch {
    // ignore
  }
}

export async function startApp(): Promise<void> {
  await app.whenReady();

  const storePath = path.join(app.getPath("userData"), "agent-heaven.store.json");
  const store = new Store(storePath);
  store.load();

  const windowManager = new WindowManager({ getSettings: () => store.getSettings() });
  const trayManager = new TrayManager({
    windowManager,
    isMenuBarMode,
    onQuit: () => {
      windowManager.setWillQuit(true);
      app.quit();
    }
  });
  windowManager.setOnWindowsChanged(() => trayManager.updateTrayMenu());

  const hotkeyManager = new HotkeyManager({ windowManager, trayManager, getSettings: () => store.getSettings() });

  const jobsDir = path.join(app.getPath("userData"), "jobs");
  const history = new JobHistory(jobsDir);
  const jobsManager = new JobsManager({
    store,
    history,
    sendJobEvent,
    runCodexExec,
    runCodexResume,
    runClaudeExec,
    runClaudeResume,
    needsAttentionHeuristic
  });

  app.on("before-quit", () => {
    windowManager.setWillQuit(true);
    jobsManager.shutdown();
  });
  app.on("will-quit", () => {
    try {
      hotkeyManager.dispose();
    } catch {
      // ignore
    }
    try {
      globalShortcut.unregisterAll();
    } catch {
      // ignore
    }
  });

  function applyRuntimeSettings(settings: any) {
    applyNativeThemeFromSettings(settings);
    windowManager.ensureWindows(settings);

    const bg = windowBgForSettings(settings, { systemScheme: nativeTheme.shouldUseDarkColors ? "dark" : "light" });
    for (const win of windowManager.liveWindows()) {
      try {
        win.setBackgroundColor(bg);
      } catch {
        // ignore
      }
    }

    setDockVisibility(settings);
    trayManager.ensureTray(settings);
    setLoginItem(settings);
    hotkeyManager.apply(settings);
    windowManager.wireAllWindows();
    trayManager.updateTrayMenu();
  }

  let codexModelsCache: { ts: number; codexPath: string; models: any[] } | null = null;
  function getCodexPathForTools() {
    const s = store.getSettings();
    const agents = s && typeof s === "object" && (s as any).agents && typeof (s as any).agents === "object" ? (s as any).agents : {};
    const codex = agents && (agents as any).codex && typeof (agents as any).codex === "object" ? (agents as any).codex : {};
    const p = String((codex as any).path || (s as any).codexPath || "").trim();
    return p.length > 0 ? p : "codex";
  }

  ipcMain.handle("settings:get", async () => store.getSettings());
  ipcMain.handle("settings:update", async (_evt, patch) => {
    const next = store.updateSettings(patch || {});
    applyRuntimeSettings(next);
    sendSettingsChanged(next);
    return next;
  });

  ipcMain.handle("codex:listModels", async () => {
    const codexPath = getCodexPathForTools();
    const now = Date.now();
    if (codexModelsCache && codexModelsCache.codexPath === codexPath && now - codexModelsCache.ts < 5 * 60 * 1000) {
      return { ok: true, models: codexModelsCache.models, cached: true };
    }

    try {
      const models = await listCodexModels({ codexPath, timeoutMs: 12_000 });
      codexModelsCache = { ts: now, codexPath, models };
      return { ok: true, models, cached: false };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("window:listDisplays", async () => {
    return { ok: true, displays: windowManager.listDisplays() };
  });

  ipcMain.handle("window:moveToDisplay", async (evt, displayId) => {
    const win = BrowserWindow.fromWebContents(evt.sender);
    if (!win) return { ok: false, error: "Unknown window" };
    const ok = windowManager.moveWindowToDisplay(win, displayId);
    if (!ok) return { ok: false, error: "Unknown display" };
    return { ok: true };
  });

  ipcMain.handle("window:openLane", async (_evt, lane, displayId) => {
    return windowManager.openLane(lane, displayId);
  });

  ipcMain.handle("window:openJob", async (_evt, jobId, displayId) => {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    if (!jobsManager.hasJob(id)) return { ok: false, error: "Unknown job" };
    return windowManager.openJob(id, displayId);
  });

  ipcMain.handle("projects:list", async () => store.listProjects());
  ipcMain.handle("projects:addDialog", async () => {
    const parent = BrowserWindow.getFocusedWindow() || windowManager.getMainWindow();
    const options: OpenDialogOptions = { properties: ["openDirectory", "createDirectory"] };
    const res = parent ? await dialog.showOpenDialog(parent, options) : await dialog.showOpenDialog(options);
    if (res.canceled || !res.filePaths || res.filePaths.length === 0) return null;
    const dirPath = res.filePaths[0];
    const name = path.basename(dirPath);
    const project = store.addProject({ id: newId(), name, path: dirPath });
    return project;
  });
  ipcMain.handle("projects:remove", async (_evt, id) => store.removeProject(id));
  ipcMain.handle("projects:update", async (_evt, { id, patch }) => store.updateProject(id, patch || {}));

  ipcMain.handle("jobs:list", async () => jobsManager.listJobMetas());

  ipcMain.handle("jobs:search", async (_evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const query = p.query;
    const opts = p.opts && typeof p.opts === "object" ? p.opts : {};
    const res = jobsManager.search(query, { includeLogs: opts.includeLogs, limit: opts.limit });
    return { ok: true, ...res };
  });

  ipcMain.handle("jobs:get", async (_evt, jobId) => jobsManager.getJob(jobId));
  ipcMain.handle("jobs:start", async (_evt, params) => jobsManager.start(params));
  ipcMain.handle("jobs:send", async (_evt, { jobId, prompt, images }) => jobsManager.send({ jobId, prompt, images }));
  ipcMain.handle("jobs:archive", async (_evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    return jobsManager.archive({ jobId: p.jobId, reason: p.reason });
  });
  ipcMain.handle("jobs:trash", async (_evt, jobId) => jobsManager.trash(jobId));
  ipcMain.handle("jobs:restore", async (_evt, jobId) => jobsManager.restore(jobId));
  ipcMain.handle("jobs:delete", async (_evt, jobId) => jobsManager.delete(jobId));
  ipcMain.handle("jobs:cancel", async (_evt, jobId) => jobsManager.cancel(jobId));

  applyRuntimeSettings(store.getSettings());

  // If the user selected "system", keep window backgrounds in sync with OS theme changes.
  nativeTheme.on("updated", () => {
    const s = store.getSettings();
    if (normalizeColorScheme(s && typeof s === "object" ? (s as any).uiColorScheme : "") !== "system") return;
    const bg = windowBgForSettings(s, { systemScheme: nativeTheme.shouldUseDarkColors ? "dark" : "light" });
    for (const win of windowManager.liveWindows()) {
      try {
        win.setBackgroundColor(bg);
      } catch {
        // ignore
      }
    }
  });

  startDevLiveReload({ sendDevNotice, isMainRestartSafe: () => !jobsManager.hasRunningJobs() });

  let displayEnsureTimer: NodeJS.Timeout | null = null;
  function scheduleEnsureWindowsForDisplays() {
    if (displayEnsureTimer) clearTimeout(displayEnsureTimer);
    displayEnsureTimer = setTimeout(() => {
      displayEnsureTimer = null;
      const s = store.getSettings();
      if (!s || !s.openOnAllDisplays) return;
      windowManager.ensureWindows(s);
      trayManager.updateTrayMenu();
    }, 200);
  }
  screen.on("display-added", () => scheduleEnsureWindowsForDisplays());
  screen.on("display-removed", () => scheduleEnsureWindowsForDisplays());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      applyRuntimeSettings(store.getSettings());
      return;
    }
    windowManager.showAllWindows();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
