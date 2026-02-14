import { Menu, nativeImage, Tray } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import type { WindowManager } from "./window-manager";

// 1x1 transparent PNG (used so we can display a title-only macOS menu bar item without shipping assets).
const TRAY_TRANSPARENT_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+5X4sAAAAASUVORK5CYII=";

export class TrayManager {
  private tray: Tray | null = null;
  private windowManager: WindowManager;
  private isMenuBarMode: (settings: any) => boolean;
  private onQuit: () => void;

  constructor(opts: { windowManager: WindowManager; isMenuBarMode: (settings: any) => boolean; onQuit: () => void }) {
    this.windowManager = opts.windowManager;
    this.isMenuBarMode = typeof opts.isMenuBarMode === "function" ? opts.isMenuBarMode : () => false;
    this.onQuit = typeof opts.onQuit === "function" ? opts.onQuit : () => {};
  }

  updateTrayMenu() {
    if (!this.tray) return;

    const visible = this.windowManager.liveWindows().some((w) => {
      try {
        return w.isVisible();
      } catch {
        return false;
      }
    });

    const template: MenuItemConstructorOptions[] = [
      {
        label: visible ? "Hide" : "Show",
        click: () => this.windowManager.toggleWindows()
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => this.onQuit()
      }
    ];

    const menu = Menu.buildFromTemplate(template);

    try {
      this.tray.setContextMenu(menu);
    } catch {
      // ignore
    }
  }

  ensureTray(settings: any) {
    if (!this.isMenuBarMode(settings)) {
      if (this.tray) {
        try {
          this.tray.destroy();
        } catch {
          // ignore
        }
        this.tray = null;
      }
      return;
    }

    if (this.tray) return;

    const img = nativeImage.createFromBuffer(Buffer.from(TRAY_TRANSPARENT_PNG_BASE64, "base64"));
    img.setTemplateImage(true);
    this.tray = new Tray(img);
    this.tray.setTitle("AH");
    this.tray.setToolTip("Agent Heaven");
    this.tray.on("click", () => this.windowManager.toggleWindows());
    this.tray.on("right-click", () => this.tray && this.tray.popUpContextMenu());

    this.updateTrayMenu();
  }
}

