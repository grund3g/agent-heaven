import { clipboard, dialog, globalShortcut, shell } from "electron";
import type { BrowserWindow } from "electron";
import type { WindowManager } from "./window-manager";
import type { TrayManager } from "./tray-manager";

export class HotkeyManager {
  private windowManager: WindowManager;
  private trayManager: TrayManager;
  private getSettings: () => any;

  private registeredGlobalHotkey = "";
  private shownGlobalHotkeyErrorFor = "";

  constructor(opts: { windowManager: WindowManager; trayManager: TrayManager; getSettings: () => any }) {
    this.windowManager = opts.windowManager;
    this.trayManager = opts.trayManager;
    this.getSettings = typeof opts.getSettings === "function" ? opts.getSettings : () => ({});
  }

  private readClipboardTextForQuickPrompt(settings: any) {
    const s = settings && typeof settings === "object" ? settings : {};
    if (!s.globalHotkeyUseClipboard) return "";
    try {
      const raw = clipboard.readText();
      const text = String(raw || "");
      if (!text) return "";
      // Avoid accidentally dumping huge clipboard payloads into the UI.
      if (text.length > 60000) return text.slice(0, 60000);
      return text;
    } catch {
      return "";
    }
  }

  private sendQuickPromptToWindow(win: BrowserWindow, payload: any) {
    if (!win || win.isDestroyed()) return false;
    const wc = win.webContents;
    if (!wc || wc.isDestroyed()) return false;

    const send = () => {
      if (!wc || wc.isDestroyed()) return;
      try {
        wc.send("ui:quickPrompt", payload);
      } catch {
        // ignore
      }
    };

    try {
      if (wc.isLoading()) {
        wc.once("did-finish-load", () => send());
        return true;
      }
    } catch {
      // ignore
    }

    send();
    return true;
  }

  private startWisprHandsFreeForQuickPrompt(win: BrowserWindow) {
    if (process.platform !== "darwin") return;
    if (!win || win.isDestroyed()) return;
    const wc = win.webContents;

    // Try to start dictation after the prompt has had a chance to take focus.
    const kick = () => {
      setTimeout(() => {
        try {
          // Avoid stealing focus away from Agent Heaven. Wispr's output should go into the focused prompt field.
          void shell
            .openExternal("wispr-flow://start-hands-free", { activate: false })
            .catch(() => shell.openExternal("wispr-flow://start-hands-free"));
        } catch {
          // ignore
        }
      }, 200);
    };

    if (!wc || wc.isDestroyed()) {
      kick();
      return;
    }

    try {
      if (wc.isLoading()) {
        wc.once("did-finish-load", () => kick());
        return;
      }
    } catch {
      // ignore
    }

    kick();
  }

  private handleGlobalQuickPrompt() {
    const s = this.getSettings();
    this.windowManager.ensureWindows(s);
    const win = this.windowManager.pickBoardWindowForQuickPrompt();
    if (!win) return;
    this.windowManager.revealAndFocusWindow(win);
    this.trayManager.updateTrayMenu();
    const text = this.readClipboardTextForQuickPrompt(s);
    this.sendQuickPromptToWindow(win, { text });

    if (s && typeof s === "object" && (s as any).globalHotkeyStartWisprHandsFree) {
      this.startWisprHandsFreeForQuickPrompt(win);
    }
  }

  private unregisterGlobalHotkey() {
    if (!this.registeredGlobalHotkey) return;
    try {
      globalShortcut.unregister(this.registeredGlobalHotkey);
    } catch {
      // ignore
    }
    this.registeredGlobalHotkey = "";
  }

  apply(settings: any) {
    const s = settings && typeof settings === "object" ? settings : {};
    const enabled = !!s.globalHotkeyEnabled;
    const accel = String(s.globalHotkeyAccelerator || "").trim();

    if (!enabled || !accel) {
      this.unregisterGlobalHotkey();
      return;
    }

    if (this.registeredGlobalHotkey === accel && globalShortcut.isRegistered(accel)) return;

    this.unregisterGlobalHotkey();

    let ok = false;
    try {
      ok = globalShortcut.register(accel, () => this.handleGlobalQuickPrompt());
    } catch {
      ok = false;
    }

    if (ok) {
      this.registeredGlobalHotkey = accel;
      return;
    }

    if (this.shownGlobalHotkeyErrorFor !== accel) {
      this.shownGlobalHotkeyErrorFor = accel;
      try {
        dialog.showErrorBox(
          "Global hotkey failed",
          `Could not register global hotkey:\n\n${accel}\n\nIt may be used by another app or reserved by the OS.`
        );
      } catch {
        // ignore
      }
    }
  }

  dispose() {
    this.unregisterGlobalHotkey();
  }
}
