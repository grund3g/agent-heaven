import { app, dialog } from "electron";
import { startApp } from "./electron/start-app";

// In dev (`electron .`), macOS will often show the host Electron app name in the
// menu bar (next to the Apple icon). Force our product name so the app menu
// reads "Agent Heaven".
try {
  app.setName("Agent Heaven");
} catch {
  // ignore
}

startApp().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  try {
    dialog.showErrorBox("Agent Heaven failed to start", String(err && err.stack ? err.stack : err));
  } catch {
    // ignore
  }
  app.quit();
});
