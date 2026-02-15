import { contextBridge, ipcRenderer, webUtils } from "electron";

async function invokeOk(channel, ...args) {
  const res = await ipcRenderer.invoke(channel, ...args);
  if (res && typeof res === "object" && res.ok === false) {
    throw new Error(res.error || "Request failed");
  }
  return res;
}

contextBridge.exposeInMainWorld("agentHeaven", {
  // In sandboxed renderers, File.path is empty; use Electron's safe helper.
  getPathForFile: (file) => {
    try {
      return webUtils.getPathForFile(file as any);
    } catch {
      return "";
    }
  },

  settingsGet: () => ipcRenderer.invoke("settings:get"),
  settingsUpdate: (patch) => ipcRenderer.invoke("settings:update", patch),

  actionsGenerate: async (prompt) => {
    const res = await invokeOk("actions:generate", { prompt });
    return res && typeof res === "object" ? (res as any).action : null;
  },

  shellOpenExternal: async (url) => {
    await invokeOk("shell:openExternal", url);
    return true;
  },
  shellOpenPath: async (filePath) => {
    await invokeOk("shell:openPath", filePath);
    return true;
  },

  agentsCheckBinaries: async () => {
    const res = await invokeOk("agents:checkBinaries");
    return res;
  },
  agentsInstall: async (payload) => {
    const res = await invokeOk("agents:install", payload);
    return res;
  },

  codexListModels: async () => {
    const res = await invokeOk("codex:listModels");
    return Array.isArray(res.models) ? res.models : [];
  },

  windowListDisplays: async () => {
    const res = await invokeOk("window:listDisplays");
    return Array.isArray(res.displays) ? res.displays : [];
  },

  windowMoveToDisplay: async (displayId) => {
    await invokeOk("window:moveToDisplay", displayId);
    return true;
  },

  windowOpenLane: async (lane, displayId) => {
    await invokeOk("window:openLane", lane, displayId);
    return true;
  },

  windowOpenJob: async (jobId, displayId) => {
    await invokeOk("window:openJob", jobId, displayId);
    return true;
  },

  projectsList: () => ipcRenderer.invoke("projects:list"),
  projectsAddDialog: () => ipcRenderer.invoke("projects:addDialog"),
  projectsAddTemporary: (opts) => ipcRenderer.invoke("projects:addTemporary", opts || {}),
  projectsRemove: (id, opts) => {
    const o = opts && typeof opts === "object" ? opts : {};
    return ipcRenderer.invoke("projects:remove", { id, deleteFolder: !!o.deleteFolder });
  },
  projectsUpdate: (id, patch) => ipcRenderer.invoke("projects:update", { id, patch }),
  projectsGitInfo: async (projectId) => {
    const res = await invokeOk("projects:gitInfo", projectId);
    return res.info;
  },
  projectsSwitchBranch: async (projectId, branch) => {
    await invokeOk("projects:switchBranch", { projectId, branch });
    return true;
  },

  checkoutsList: async (projectId) => {
    const res = await invokeOk("checkouts:list", projectId);
    return Array.isArray(res.entries) ? res.entries : [];
  },
  checkoutsRemove: async (projectId, kind, jobId) => {
    await invokeOk("checkouts:remove", { projectId, kind, jobId });
    return true;
  },
  checkoutsIntegrateToDefault: async (jobId, opts) => {
    const p = opts && typeof opts === "object" ? opts : {};
    const res = await invokeOk("checkouts:integrateToDefault", { jobId, commitMessage: p.commitMessage });
    return res;
  },

  jobsList: () => ipcRenderer.invoke("jobs:list"),
  jobsGet: async (jobId) => {
    const res = await invokeOk("jobs:get", jobId);
    return res.job;
  },
  jobsSearch: async (query, opts) => {
    const res = await invokeOk("jobs:search", { query, opts });
    return {
      jobIds: Array.isArray(res.jobIds) ? res.jobIds : [],
      total: typeof res.total === "number" ? res.total : 0,
      truncated: !!res.truncated
    };
  },
  jobsStart: async (params) => {
    const res = await invokeOk("jobs:start", params);
    return res.jobId;
  },
  jobsSend: async (jobId, prompt, images, opts) => {
    const o = opts && typeof opts === "object" ? opts : {};
    const res = await invokeOk("jobs:send", {
      jobId,
      prompt,
      images,
      missingCheckoutAction: o.missingCheckoutAction
    });
    return res && typeof res === "object" ? res : { ok: true };
  },
  jobsCancel: (jobId) => ipcRenderer.invoke("jobs:cancel", jobId),
  jobsArchive: async (jobId) => {
    await invokeOk("jobs:archive", { jobId });
    return true;
  },
  jobsTrash: async (jobId) => {
    await invokeOk("jobs:trash", jobId);
    return true;
  },
  jobsRestore: async (jobId) => {
    await invokeOk("jobs:restore", jobId);
    return true;
  },
  jobsDelete: async (jobId) => {
    await invokeOk("jobs:delete", jobId);
    return true;
  },

  termEnsure: async (jobId, cols, rows) => {
    const res = await invokeOk("term:ensure", { jobId, cols, rows });
    return { buffer: typeof res.buffer === "string" ? res.buffer : "", seq: typeof res.seq === "number" ? res.seq : 0 };
  },
  termWrite: async (jobId, data) => {
    await invokeOk("term:write", { jobId, data });
    return true;
  },
  termResize: async (jobId, cols, rows) => {
    await invokeOk("term:resize", { jobId, cols, rows });
    return true;
  },
  termDetach: async (jobId) => {
    await invokeOk("term:detach", { jobId });
    return true;
  },

  onJobEvent: (handler) => {
    const listener = (_evt, payload) => handler(payload);
    ipcRenderer.on("job:event", listener);
    return () => ipcRenderer.removeListener("job:event", listener);
  },

  onDevNotice: (handler) => {
    const listener = (_evt, payload) => handler(payload);
    ipcRenderer.on("dev:notice", listener);
    return () => ipcRenderer.removeListener("dev:notice", listener);
  },

  onSettingsChanged: (handler) => {
    const listener = (_evt, settings) => handler(settings);
    ipcRenderer.on("settings:changed", listener);
    return () => ipcRenderer.removeListener("settings:changed", listener);
  },

  onQuickPrompt: (handler) => {
    const listener = (_evt, payload) => handler(payload);
    ipcRenderer.on("ui:quickPrompt", listener);
    return () => ipcRenderer.removeListener("ui:quickPrompt", listener);
  },

  onTermEvent: (handler) => {
    const listener = (_evt, payload) => handler(payload);
    ipcRenderer.on("term:event", listener);
    return () => ipcRenderer.removeListener("term:event", listener);
  }
});
