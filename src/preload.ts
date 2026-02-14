import { contextBridge, ipcRenderer } from "electron";

async function invokeOk(channel, ...args) {
  const res = await ipcRenderer.invoke(channel, ...args);
  if (res && typeof res === "object" && res.ok === false) {
    throw new Error(res.error || "Request failed");
  }
  return res;
}

contextBridge.exposeInMainWorld("agentHeaven", {
  settingsGet: () => ipcRenderer.invoke("settings:get"),
  settingsUpdate: (patch) => ipcRenderer.invoke("settings:update", patch),

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
  projectsRemove: (id) => ipcRenderer.invoke("projects:remove", id),
  projectsUpdate: (id, patch) => ipcRenderer.invoke("projects:update", { id, patch }),

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
  jobsSend: async (jobId, prompt, images) => {
    await invokeOk("jobs:send", { jobId, prompt, images });
    return true;
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
  }
});
