import * as path from "node:path";
import { app, BrowserWindow, screen, nativeTheme } from "electron";
import type { BrowserWindowConstructorOptions } from "electron";
import { normalizeLaneKey } from "../core/lane";
import { windowBgForSettings } from "../core/theme";

type WindowsChangedHandler = () => void;

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private willQuit = false;
  private onWindowsChanged: WindowsChangedHandler = () => {};
  private getSettings: () => any;

  constructor(opts: { getSettings: () => any }) {
    this.getSettings = typeof opts.getSettings === "function" ? opts.getSettings : () => ({});
  }

  setWillQuit(value: boolean) {
    this.willQuit = !!value;
  }

  setOnWindowsChanged(handler: WindowsChangedHandler) {
    this.onWindowsChanged = typeof handler === "function" ? handler : () => {};
  }

  getMainWindow(): BrowserWindow | null {
    const mw = this.mainWindow;
    if (!mw || mw.isDestroyed()) return null;
    return mw;
  }

  private isMenuBarMode(settings: any) {
    return process.platform === "darwin" && !!(settings && settings.menuBarMode);
  }

  liveWindows(): BrowserWindow[] {
    return BrowserWindow.getAllWindows().filter((w) => w && !w.isDestroyed());
  }

  private windowRole(win: any) {
    const r = win && typeof win.__agentHeavenRole === "string" ? win.__agentHeavenRole : "";
    if (r === "lane") return "lane";
    if (r === "job") return "job";
    return "board";
  }

  private isBoardWindow(win: any) {
    return this.windowRole(win) === "board";
  }

  private liveBoardWindows(): BrowserWindow[] {
    return this.liveWindows().filter((w) => this.isBoardWindow(w));
  }

  pickBoardWindowForQuickPrompt(): BrowserWindow | null {
    const focused = BrowserWindow.getFocusedWindow();
    if (focused && !focused.isDestroyed() && this.isBoardWindow(focused)) return focused;

    const mw = this.getMainWindow();
    if (mw && this.isBoardWindow(mw)) return mw;

    const wins = this.liveBoardWindows();
    return wins[0] || null;
  }

  revealAndFocusWindow(win: any) {
    if (!win || win.isDestroyed()) return;

    // If the app was hidden (Cmd+H), a plain win.show()/focus() can be ignored.
    // `app.show()` unhides app windows without forcing focus.
    if (process.platform === "darwin") {
      try {
        app.show();
      } catch {
        // ignore
      }

      // On macOS, this improves "bring to front" reliability when triggered from a global shortcut.
      try {
        app.focus({ steal: true });
      } catch {
        try {
          app.focus();
        } catch {
          // ignore
        }
      }
    }

    try {
      if (win.isMinimized()) win.restore();
    } catch {
      // ignore
    }
    try {
      win.show();
    } catch {
      // ignore
    }
    try {
      // Helps on some WMs where focus requests are ignored unless z-order changes.
      win.moveTop();
    } catch {
      // ignore
    }
    try {
      win.focus();
    } catch {
      // ignore
    }

    // Last resort: briefly toggle always-on-top to force z-order changes.
    // (Some platforms prevent "focus stealing" from global shortcuts.)
    try {
      const focused = typeof win.isFocused === "function" ? !!win.isFocused() : false;
      if (!focused && typeof win.setAlwaysOnTop === "function") {
        try {
          win.setAlwaysOnTop(true);
          win.show();
          win.moveTop();
          win.focus();
        } finally {
          try {
            win.setAlwaysOnTop(false);
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  }

  private createWindow(settings: any, bounds?: any) {
    const opts: BrowserWindowConstructorOptions = {
      width: 1320,
      height: 900,
      minWidth: 980,
      minHeight: 680,
      backgroundColor: windowBgForSettings(settings, { systemScheme: nativeTheme.shouldUseDarkColors ? "dark" : "light" }),
      titleBarStyle: "hiddenInset",
      webPreferences: {
        preload: path.join(__dirname, "..", "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        autoplayPolicy: "no-user-gesture-required"
      }
    };

    const b = bounds && typeof bounds === "object" ? bounds : null;
    if (b) {
      if (typeof b.x === "number") opts.x = b.x;
      if (typeof b.y === "number") opts.y = b.y;
      if (typeof b.width === "number") opts.width = b.width;
      if (typeof b.height === "number") opts.height = b.height;
    }

    const win = new BrowserWindow(opts);
    win.__agentHeavenRole = "board";
    win.loadFile(path.join(__dirname, "..", "..", "renderer", "index.html"));

    // Keep a reasonable default parent window for dialogs, etc.
    win.on("focus", () => {
      this.mainWindow = win;
    });

    return win;
  }

  private createLaneWindow(settings: any, laneKey: any, bounds?: any) {
    const lane = normalizeLaneKey(laneKey);
    if (!lane) return null;

    const opts: BrowserWindowConstructorOptions = {
      width: 720,
      height: 900,
      minWidth: 420,
      minHeight: 520,
      backgroundColor: windowBgForSettings(settings, { systemScheme: nativeTheme.shouldUseDarkColors ? "dark" : "light" }),
      titleBarStyle: "hiddenInset",
      webPreferences: {
        preload: path.join(__dirname, "..", "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        autoplayPolicy: "no-user-gesture-required"
      }
    };

    const b = bounds && typeof bounds === "object" ? bounds : null;
    if (b) {
      if (typeof b.x === "number") opts.x = b.x;
      if (typeof b.y === "number") opts.y = b.y;
      if (typeof b.width === "number") opts.width = b.width;
      if (typeof b.height === "number") opts.height = b.height;
    }

    const win = new BrowserWindow(opts);
    win.__agentHeavenRole = "lane";
    win.__agentHeavenLane = lane;
    win.loadFile(path.join(__dirname, "..", "..", "renderer", "index.html"), { query: { mode: "lane", lane } });

    return win;
  }

  private createJobWindow(settings: any, jobId: any, bounds?: any) {
    const id = String(jobId || "").trim();
    if (!id) return null;

    const opts: BrowserWindowConstructorOptions = {
      width: 1180,
      height: 900,
      minWidth: 820,
      minHeight: 640,
      backgroundColor: windowBgForSettings(settings, { systemScheme: nativeTheme.shouldUseDarkColors ? "dark" : "light" }),
      titleBarStyle: "hiddenInset",
      webPreferences: {
        preload: path.join(__dirname, "..", "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        autoplayPolicy: "no-user-gesture-required"
      }
    };

    const b = bounds && typeof bounds === "object" ? bounds : null;
    if (b) {
      if (typeof b.x === "number") opts.x = b.x;
      if (typeof b.y === "number") opts.y = b.y;
      if (typeof b.width === "number") opts.width = b.width;
      if (typeof b.height === "number") opts.height = b.height;
    }

    const win = new BrowserWindow(opts);
    win.__agentHeavenRole = "job";
    win.__agentHeavenJobId = id;
    win.loadFile(path.join(__dirname, "..", "..", "renderer", "index.html"), { query: { mode: "job", jobId: id } });

    return win;
  }

  private destroyWindow(win: any) {
    if (!win || win.isDestroyed()) return;
    try {
      win.destroy();
    } catch {
      // ignore
    }
  }

  private wireWindow(win: any) {
    if (!win || win.isDestroyed()) return;
    if (win.__agentHeavenWired) return;
    win.__agentHeavenWired = true;

    win.on("close", (e: any) => {
      const s = this.getSettings();
      if (this.windowRole(win) !== "board") return;
      if (!this.isMenuBarMode(s)) return;
      if (this.willQuit) return;
      e.preventDefault();
      win.hide();
    });

    win.on("show", () => this.onWindowsChanged());
    win.on("hide", () => this.onWindowsChanged());
    win.on("closed", () => {
      if (this.mainWindow === win) this.mainWindow = null;
      this.onWindowsChanged();
    });
  }

  wireAllWindows() {
    for (const win of this.liveWindows()) this.wireWindow(win);
  }

  private windowDisplayId(win: any) {
    if (!win || win.isDestroyed()) return null;
    try {
      const b = win.getBounds();
      const d = screen.getDisplayMatching(b);
      return d && typeof d.id === "number" ? d.id : null;
    } catch {
      return null;
    }
  }

  private boundsForDisplay(display: any) {
    const d = display && typeof display === "object" ? display : {};
    const wa = d.workArea && typeof d.workArea === "object" ? d.workArea : d.bounds;
    if (!wa || typeof wa !== "object") return null;
    return { x: wa.x, y: wa.y, width: wa.width, height: wa.height };
  }

  private findDisplayById(displayId: any) {
    const id = typeof displayId === "number" ? displayId : Number(displayId);
    if (!Number.isFinite(id)) return null;
    return screen.getAllDisplays().find((d) => d && d.id === id) || null;
  }

  moveWindowToDisplay(win: any, displayId: any) {
    if (!win || win.isDestroyed()) return false;
    const d = this.findDisplayById(displayId);
    if (!d) return false;
    const wa = d.workArea && typeof d.workArea === "object" ? d.workArea : d.bounds;
    if (!wa || typeof wa !== "object") return false;

    const b = win.getBounds();
    const width = Math.min(Math.max(420, Number(b.width) || 0), wa.width);
    const height = Math.min(Math.max(520, Number(b.height) || 0), wa.height);
    const x = Math.round(wa.x + (wa.width - width) / 2);
    const y = Math.round(wa.y + (wa.height - height) / 2);

    try {
      win.setBounds({ x, y, width, height }, true);
      return true;
    } catch {
      return false;
    }
  }

  ensureWindows(settings: any) {
    const s = settings && typeof settings === "object" ? settings : {};
    const openOnAllDisplays = !!s.openOnAllDisplays;

    const wins = this.liveBoardWindows();
    if (!openOnAllDisplays) {
      if (wins.length === 0) {
        this.mainWindow = this.createWindow(s);
        this.wireWindow(this.mainWindow);
        return;
      }

      const focused = BrowserWindow.getFocusedWindow();
      const keep =
        (focused && this.isBoardWindow(focused) ? focused : null) ||
        (this.mainWindow && !this.mainWindow.isDestroyed() && this.isBoardWindow(this.mainWindow) ? this.mainWindow : null) ||
        wins[0];
      if (keep && !keep.isDestroyed()) {
        this.mainWindow = keep;
        this.wireWindow(keep);
      }
      for (const w of wins) {
        if (keep && w === keep) continue;
        this.destroyWindow(w);
      }
      return;
    }

    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();
    const primaryId = primaryDisplay && typeof primaryDisplay.id === "number" ? primaryDisplay.id : null;

    const byDisplay = new Map<number, BrowserWindow>(); // displayId -> BrowserWindow
    const extras: BrowserWindow[] = [];
    for (const w of wins) {
      const id = this.windowDisplayId(w);
      if (id == null) continue;
      if (!byDisplay.has(id)) byDisplay.set(id, w);
      else extras.push(w);
    }

    // Keep one window per display in this mode.
    for (const w of extras) this.destroyWindow(w);

    for (const d of displays) {
      const existing = byDisplay.get(d.id);
      if (existing && !existing.isDestroyed()) {
        this.wireWindow(existing);
        continue;
      }
      const b = this.boundsForDisplay(d);
      const win = this.createWindow(s, b);
      byDisplay.set(d.id, win);
      this.wireWindow(win);
    }

    if (primaryId != null) {
      const primaryWin = byDisplay.get(primaryId) || null;
      if (primaryWin && !primaryWin.isDestroyed()) this.mainWindow = primaryWin;
    }
    const focused = BrowserWindow.getFocusedWindow();
    const focusedBoard = focused && this.isBoardWindow(focused) ? focused : null;
    if (!this.mainWindow || this.mainWindow.isDestroyed() || !this.isBoardWindow(this.mainWindow)) {
      this.mainWindow = focusedBoard || this.liveBoardWindows()[0] || null;
    }
  }

  showAllWindows() {
    const wins = this.liveWindows();
    for (const win of wins) {
      try {
        if (win.isMinimized()) win.restore();
        win.show();
      } catch {
        // ignore
      }
    }
    const focusWin = BrowserWindow.getFocusedWindow() || this.mainWindow || wins[0] || null;
    try {
      if (focusWin && !focusWin.isDestroyed()) focusWin.focus();
    } catch {
      // ignore
    }
    this.onWindowsChanged();
  }

  toggleWindows() {
    const wins = this.liveWindows();
    if (wins.length === 0) {
      this.ensureWindows(this.getSettings());
      this.onWindowsChanged();
      return;
    }

    const anyVisible = wins.some((w) => {
      try {
        return w.isVisible();
      } catch {
        return false;
      }
    });

    if (anyVisible) {
      for (const win of wins) {
        try {
          win.hide();
        } catch {
          // ignore
        }
      }
      this.onWindowsChanged();
      return;
    }

    this.showAllWindows();
  }

  listDisplays() {
    const displays = screen.getAllDisplays();
    const primary = screen.getPrimaryDisplay();
    const primaryId = primary && typeof primary.id === "number" ? primary.id : null;
    return displays.map((d, idx) => {
      const wa = d.workArea && typeof d.workArea === "object" ? d.workArea : d.bounds;
      const w = wa && typeof wa.width === "number" ? wa.width : d.size && d.size.width;
      const h = wa && typeof wa.height === "number" ? wa.height : d.size && d.size.height;
      const isPrimary = primaryId != null && d.id === primaryId;
      const label = `${isPrimary ? "Primary" : `Display ${idx + 1}`} (${w ?? "?"}x${h ?? "?"})`;
      return { id: d.id, primary: isPrimary, label, width: w ?? 0, height: h ?? 0 };
    });
  }

  openLane(lane: any, displayId: any) {
    const laneKey = normalizeLaneKey(lane);
    if (!laneKey) return { ok: false, error: "Unknown lane" };
    const win = this.createLaneWindow(this.getSettings(), laneKey);
    if (!win) return { ok: false, error: "Failed to create window" };
    if (displayId != null) this.moveWindowToDisplay(win, displayId);
    this.wireWindow(win);
    try {
      win.show();
      win.focus();
    } catch {
      // ignore
    }
    return { ok: true };
  }

  openJob(jobId: any, displayId: any) {
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    const win = this.createJobWindow(this.getSettings(), id);
    if (!win) return { ok: false, error: "Failed to create window" };
    if (displayId != null) this.moveWindowToDisplay(win, displayId);
    this.wireWindow(win);
    try {
      win.show();
      win.focus();
    } catch {
      // ignore
    }
    return { ok: true };
  }
}

