import * as fs from "node:fs";
import * as path from "node:path";
import { app, BrowserWindow, ipcMain, dialog, globalShortcut, nativeTheme, screen, shell, session } from "electron";
import type { OpenDialogOptions } from "electron";
import type { WebContents } from "electron";
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
import { TerminalManager } from "./terminal-manager";
import { TrayManager } from "./tray-manager";
import { WindowManager } from "./window-manager";
import { ensureMacAppMenu } from "./mac-app-menu";
import { listCodexModels } from "./codex-models";
import { checkAgentBinaries, resolveCodexCliPathFromSettings } from "../agent-binaries";
import { installAgentCli } from "../agent-install";
import { detectDefaultBranch, getGitInfo, removeWorktree, switchBranch } from "./git";

function isMenuBarMode(settings: any) {
  return process.platform === "darwin" && !!(settings && settings.menuBarMode);
}

function safeParseUrl(rawUrl: unknown): URL | null {
  const s = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!s) return null;
  try {
    return new URL(s);
  } catch {
    return null;
  }
}

function isTrustedRendererUrl(rawUrl: unknown): boolean {
  const u = safeParseUrl(rawUrl);
  if (!u) return false;
  if (u.protocol !== "file:") return false;
  // All app windows load the same renderer entrypoint (with optional query params).
  return u.pathname.endsWith("/renderer/index.html");
}

function senderUrlFromIpcEvent(evt: any): string {
  if (!evt || typeof evt !== "object") return "";
  try {
    const sf = (evt as any).senderFrame;
    if (sf && typeof sf.url === "string") return sf.url;
  } catch {
    // ignore
  }
  try {
    const sender = (evt as any).sender;
    if (sender && typeof sender.getURL === "function") return sender.getURL() || "";
  } catch {
    // ignore
  }
  return "";
}

function assertTrustedIpcSender(evt: any) {
  const url = senderUrlFromIpcEvent(evt);
  if (isTrustedRendererUrl(url)) return;
  throw new Error(`Untrusted IPC sender (${url || "unknown"})`);
}

function maybeOpenExternal(rawUrl: unknown) {
  const u = safeParseUrl(rawUrl);
  if (!u) return;
  if (u.protocol !== "https:" && u.protocol !== "http:") return;
  try {
    void shell.openExternal(u.toString()).catch(() => {});
  } catch {
    // ignore
  }
}

function hardenWebContents(contents: WebContents) {
  if (!contents || contents.isDestroyed()) return;
  const isTrusted = () => {
    try {
      return isTrustedRendererUrl(contents.getURL());
    } catch {
      return false;
    }
  };

  // Block navigations away from the app UI (defense in depth; renderer also prevents link navigation).
  try {
    contents.on("will-navigate", (e: any, url: string) => {
      if (isTrustedRendererUrl(url)) return;
      if (!isTrusted()) return; // don't interfere with devtools / other non-app contents
      try {
        e.preventDefault();
      } catch {
        // ignore
      }
      maybeOpenExternal(url);
    });
  } catch {
    // ignore
  }

  // Also block frame navigations (e.g. if a future UI change introduces iframes).
  try {
    // Not all Electron typings include this event across versions; keep runtime behavior.
    (contents as any).on("will-frame-navigate", (e: any, url: string) => {
      if (isTrustedRendererUrl(url)) return;
      if (!isTrusted()) return;
      try {
        e.preventDefault();
      } catch {
        // ignore
      }
      maybeOpenExternal(url);
    });
  } catch {
    // ignore
  }

  // Block popups / window.open from the app UI.
  try {
    contents.setWindowOpenHandler(({ url }) => {
      if (!isTrusted()) return { action: "allow" as const };
      maybeOpenExternal(url);
      return { action: "deny" as const };
    });
  } catch {
    // ignore
  }

  // Explicitly deny <webview> usage even if a future change enables webviewTag.
  try {
    contents.on("will-attach-webview", (e: any) => {
      if (!isTrusted()) return;
      try {
        e.preventDefault();
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
}

function hardenSessionPermissions() {
  try {
    // Default-deny permissions. The app doesn't rely on camera/mic/geolocation/notifications/etc.
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler((_wc, _permission) => false);
  } catch {
    // ignore
  }
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

function setDevDockIcon() {
  if (process.platform !== "darwin") return;
  if (!app.dock) return;
  if (app.isPackaged) return;

  // In dev, Electron shows its default icon in the Dock unless we set one explicitly.
  // For packaged builds, the `.icns` is baked into the `.app` bundle by electron-builder.
  const iconPath = path.join(app.getAppPath(), "build-res", "icon.png");
  try {
    if (!fs.existsSync(iconPath)) return;
    app.dock.setIcon(iconPath);
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

  ensureMacAppMenu();

  app.on("web-contents-created", (_evt, contents) => {
    try {
      hardenWebContents(contents);
    } catch {
      // ignore
    }
  });
  hardenSessionPermissions();

  setDevDockIcon();

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
  const checkoutsDir = path.join(app.getPath("userData"), "checkouts");
  const history = new JobHistory(jobsDir);
  const jobsManager = new JobsManager({
    store,
    history,
    checkoutsDir,
    sendJobEvent,
    runCodexExec,
    runCodexResume,
    runClaudeExec,
    runClaudeResume,
    needsAttentionHeuristic
  });
  const terminalManager = new TerminalManager();

  app.on("before-quit", () => {
    windowManager.setWillQuit(true);
    jobsManager.shutdown();
    terminalManager.shutdown();
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
    return resolveCodexCliPathFromSettings(store.getSettings());
  }

  ipcMain.handle("settings:get", async (evt) => {
    assertTrustedIpcSender(evt);
    return store.getSettings();
  });
  ipcMain.handle("settings:update", async (evt, patch) => {
    assertTrustedIpcSender(evt);
    const next = store.updateSettings(patch || {});
    applyRuntimeSettings(next);
    sendSettingsChanged(next);
    return next;
  });

  ipcMain.handle("shell:openExternal", async (evt, rawUrl) => {
    assertTrustedIpcSender(evt);
    const s = String(rawUrl || "").trim();
    if (!s) return { ok: false, error: "Missing url" };

    let u: URL;
    try {
      u = new URL(s);
    } catch {
      return { ok: false, error: "Invalid url" };
    }

    if (u.protocol !== "https:" && u.protocol !== "http:") return { ok: false, error: "Blocked url protocol" };

    try {
      await shell.openExternal(u.toString());
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("shell:openPath", async (evt, rawPath) => {
    assertTrustedIpcSender(evt);
    const p = String(rawPath || "").trim();
    if (!p) return { ok: false, error: "Missing path" };

    try {
      const errMsg = await shell.openPath(p);
      if (errMsg) return { ok: false, error: errMsg };
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("agents:checkBinaries", async (evt) => {
    assertTrustedIpcSender(evt);
    try {
      const res = await checkAgentBinaries(store.getSettings(), { timeoutMs: 2500 });
      return { ok: true, ...res };
    } catch (err: any) {
      return { ok: true, checkedAt: new Date().toISOString(), error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("agents:install", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    try {
      const p = payload && typeof payload === "object" ? (payload as any) : {};
      const res = await installAgentCli(p.agent, { method: p.method, timeoutMs: p.timeoutMs });
      return { ok: true, ...res };
    } catch (err: any) {
      return { ok: true, finishedAt: new Date().toISOString(), error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("codex:listModels", async (evt) => {
    assertTrustedIpcSender(evt);
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

  ipcMain.handle("window:listDisplays", async (evt) => {
    assertTrustedIpcSender(evt);
    return { ok: true, displays: windowManager.listDisplays() };
  });

  ipcMain.handle("window:moveToDisplay", async (evt, displayId) => {
    assertTrustedIpcSender(evt);
    const win = BrowserWindow.fromWebContents(evt.sender);
    if (!win) return { ok: false, error: "Unknown window" };
    const ok = windowManager.moveWindowToDisplay(win, displayId);
    if (!ok) return { ok: false, error: "Unknown display" };
    return { ok: true };
  });

  ipcMain.handle("window:openLane", async (evt, lane, displayId) => {
    assertTrustedIpcSender(evt);
    return windowManager.openLane(lane, displayId);
  });

  ipcMain.handle("window:openJob", async (evt, jobId, displayId) => {
    assertTrustedIpcSender(evt);
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    if (!jobsManager.hasJob(id)) return { ok: false, error: "Unknown job" };
    return windowManager.openJob(id, displayId);
  });

  ipcMain.handle("projects:list", async (evt) => {
    assertTrustedIpcSender(evt);
    const projects = store.listProjects();
    const augmented = await Promise.all(
      projects.map(async (p: any) => {
        const projectPath = p && typeof p.path === "string" ? p.path : "";
        const info = projectPath ? await getGitInfo(projectPath) : { isGitRepo: false, branch: "", sha: "", detached: false, dirty: false, error: "Missing path" };
        return {
          ...p,
          gitBranch: info.branch,
          gitSha: info.sha,
          gitDetached: info.detached,
          gitDirty: info.dirty,
          gitError: typeof info.error === "string" ? info.error : ""
        };
      })
    );
    return augmented;
  });
  ipcMain.handle("projects:addDialog", async (evt) => {
    assertTrustedIpcSender(evt);
    const parent = BrowserWindow.getFocusedWindow() || windowManager.getMainWindow();
    const options: OpenDialogOptions = { properties: ["openDirectory", "createDirectory"] };
    const res = parent ? await dialog.showOpenDialog(parent, options) : await dialog.showOpenDialog(options);
    if (res.canceled || !res.filePaths || res.filePaths.length === 0) return null;
    const dirPath = res.filePaths[0];
    const name = path.basename(dirPath);
    let defaultBranch = "";
    try {
      defaultBranch = await detectDefaultBranch(dirPath);
    } catch {
      defaultBranch = "";
    }
    const project = store.addProject({ id: newId(), name, path: dirPath, defaultBranch, checkoutMode: "inplace" });
    return project;
  });
  ipcMain.handle("projects:gitInfo", async (evt, projectId) => {
    assertTrustedIpcSender(evt);
    const id = String(projectId || "").trim();
    if (!id) return { ok: false, error: "Missing projectId" };
    const project = store.listProjects().find((p: any) => p && p.id === id) || null;
    if (!project) return { ok: false, error: "Project not found" };
    const projectPath = typeof project.path === "string" ? project.path : "";
    const info = projectPath ? await getGitInfo(projectPath) : { isGitRepo: false, branch: "", sha: "", detached: false, dirty: false, error: "Missing path" };
    return { ok: true, info };
  });
  ipcMain.handle("projects:switchBranch", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const id = String(p.projectId || "").trim();
    const branch = String(p.branch || "").trim();
    if (!id) return { ok: false, error: "Missing projectId" };
    if (!branch) return { ok: false, error: "Missing branch" };
    const project = store.listProjects().find((x: any) => x && x.id === id) || null;
    if (!project) return { ok: false, error: "Project not found" };
    const projectPath = typeof project.path === "string" ? project.path : "";
    if (!projectPath) return { ok: false, error: "Missing project path" };
    try {
      await switchBranch(projectPath, branch);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });
  ipcMain.handle("projects:remove", async (evt, id) => {
    assertTrustedIpcSender(evt);
    return store.removeProject(id);
  });
  ipcMain.handle("projects:update", async (evt, { id, patch }) => {
    assertTrustedIpcSender(evt);
    return store.updateProject(id, patch || {});
  });

  function isPathWithinRoot(root: string, target: string): boolean {
    const r = path.resolve(root);
    const t = path.resolve(target);
    const rr = r.endsWith(path.sep) ? r : `${r}${path.sep}`;
    return t === r || t.startsWith(rr);
  }

  ipcMain.handle("checkouts:list", async (evt, projectId) => {
    assertTrustedIpcSender(evt);
    const id = String(projectId || "").trim();
    if (!id) return { ok: false, error: "Missing projectId" };

    const project = store.listProjects().find((p: any) => p && p.id === id) || null;
    if (!project) return { ok: false, error: "Project not found" };

    const root = path.resolve(checkoutsDir);
    const entries: any[] = [];
    const kinds: Array<{ kind: "worktree" | "clone"; dirName: string }> = [
      { kind: "worktree", dirName: "worktrees" },
      { kind: "clone", dirName: "clones" }
    ];

    for (const k of kinds) {
      const dir = path.join(root, k.dirName, id);
      try {
        if (!fs.existsSync(dir)) continue;
        const children = fs.readdirSync(dir, { withFileTypes: true });
        for (const de of children) {
          if (!de.isDirectory()) continue;
          const jobId = de.name;
          const p = path.join(dir, jobId);
          let st: any = null;
          try {
            st = fs.statSync(p);
          } catch {
            st = null;
          }
          entries.push({
            kind: k.kind,
            projectId: id,
            jobId,
            path: p,
            mtimeMs: st && typeof st.mtimeMs === "number" ? st.mtimeMs : 0
          });
        }
      } catch {
        // ignore
      }
    }

    entries.sort((a, b) => (Number(b.mtimeMs) || 0) - (Number(a.mtimeMs) || 0));
    return { ok: true, entries };
  });

  ipcMain.handle("checkouts:remove", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const projectId = String(p.projectId || "").trim();
    const kind = String(p.kind || "").trim();
    const jobId = String(p.jobId || "").trim();
    if (!projectId) return { ok: false, error: "Missing projectId" };
    if (!jobId) return { ok: false, error: "Missing jobId" };
    if (kind !== "worktree" && kind !== "clone") return { ok: false, error: "Invalid kind" };

    const project = store.listProjects().find((x: any) => x && x.id === projectId) || null;
    if (!project) return { ok: false, error: "Project not found" };
    const projectPath = typeof project.path === "string" ? project.path : "";
    if (!projectPath) return { ok: false, error: "Missing project path" };

    const root = path.resolve(checkoutsDir);
    const sub = kind === "worktree" ? "worktrees" : "clones";
    const target = path.resolve(root, sub, projectId, jobId);
    if (!isPathWithinRoot(root, target)) return { ok: false, error: "Invalid checkout path" };

    try {
      if (kind === "clone") {
        fs.rmSync(target, { recursive: true, force: true });
        return { ok: true };
      }

      // worktree: remove via git to keep metadata consistent
      try {
        if (fs.existsSync(target)) await removeWorktree({ repoDir: projectPath, worktreeDir: target });
      } catch (err: any) {
        if (fs.existsSync(target)) throw err;
      }

      // Best-effort: ensure the dir is gone.
      try {
        fs.rmSync(target, { recursive: true, force: true });
      } catch {
        // ignore
      }

      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("jobs:list", async (evt) => {
    assertTrustedIpcSender(evt);
    return jobsManager.listJobMetas();
  });

  ipcMain.handle("jobs:search", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const query = p.query;
    const opts = p.opts && typeof p.opts === "object" ? p.opts : {};
    const rawLimit = typeof opts.limit === "number" ? opts.limit : Number(opts.limit);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(800, Math.trunc(rawLimit))) : undefined;
    const res = jobsManager.search(query, { includeLogs: opts.includeLogs, limit });
    return { ok: true, ...res };
  });

  ipcMain.handle("jobs:get", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    return jobsManager.getJob(jobId);
  });
  ipcMain.handle("jobs:start", async (evt, params) => {
    assertTrustedIpcSender(evt);
    return jobsManager.start(params);
  });
  ipcMain.handle("jobs:send", async (evt, { jobId, prompt, images }) => {
    assertTrustedIpcSender(evt);
    return jobsManager.send({ jobId, prompt, images });
  });
  ipcMain.handle("jobs:archive", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    return jobsManager.archive({ jobId: p.jobId, reason: p.reason });
  });
  ipcMain.handle("jobs:trash", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    return jobsManager.trash(jobId);
  });
  ipcMain.handle("jobs:restore", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    return jobsManager.restore(jobId);
  });
  ipcMain.handle("jobs:delete", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    const res = jobsManager.delete(jobId);
    if (res && typeof res === "object" && (res as any).ok) terminalManager.destroy(jobId);
    return res;
  });
  ipcMain.handle("jobs:cancel", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    return jobsManager.cancel(jobId);
  });

  ipcMain.handle("term:ensure", async (evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const id = String(p.jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };

    const got = jobsManager.getJob(id);
    if (!got || typeof got !== "object" || (got as any).ok !== true) return got;

    const job = (got as any).job || {};
    const cwd = typeof job.projectPath === "string" && job.projectPath.trim() ? job.projectPath.trim() : process.cwd();
    return terminalManager.ensure(id, { cwd, cols: p.cols, rows: p.rows, webContentsId: evt.sender.id });
  });

  ipcMain.handle("term:write", async (_evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    return terminalManager.write(p.jobId, p.data);
  });

  ipcMain.handle("term:resize", async (_evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    return terminalManager.resize(p.jobId, p.cols, p.rows);
  });

  ipcMain.handle("term:detach", async (evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    return terminalManager.detach(p.jobId, evt.sender.id);
  });

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
