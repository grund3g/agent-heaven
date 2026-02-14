import { BrowserWindow } from "electron";

function broadcast(channel: string, payload: any) {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win || win.isDestroyed()) continue;
    try {
      win.webContents.send(channel, payload);
    } catch {
      // ignore
    }
  }
}

export function sendDevNotice(payload: any) {
  broadcast("dev:notice", payload);
}

export function sendJobEvent(payload: any) {
  broadcast("job:event", payload);
}

export function sendSettingsChanged(settings: any) {
  broadcast("settings:changed", settings);
}

