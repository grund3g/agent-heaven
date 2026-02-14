import { Menu, app } from "electron";
import type { MenuItemConstructorOptions } from "electron";

// In dev (`electron .`) on macOS, Electron can keep showing "Electron" as the
// app menu label next to the Apple icon. Force an explicit app menu so it reads
// like the actual product name.
export function ensureMacAppMenu(): void {
  if (process.platform !== "darwin") return;

  // Use an explicit label instead of app.getName() so this still fixes dev runs
  // where Electron keeps reporting/using the host app name ("Electron").
  const label = "Agent Heaven";
  try {
    app.setName(label);
  } catch {
    // ignore
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label,
      submenu: [
        { role: "about" as any },
        { type: "separator" },
        { role: "services" as any },
        { type: "separator" },
        { role: "hide" as any },
        { role: "hideOthers" as any },
        { role: "unhide" as any },
        { type: "separator" },
        { role: "quit" as any }
      ]
    },
    { role: "fileMenu" as any },
    { role: "editMenu" as any },
    { role: "viewMenu" as any },
    { role: "windowMenu" as any }
  ];

  try {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } catch {
    // ignore
  }
}
