import { app, dialog } from "electron";
import { startApp } from "./electron/start-app";

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

