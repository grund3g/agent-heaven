const api = window.agentHeaven;

		const els = {
		  projectsList: document.getElementById("projectsList"),
		  addTempProjectBtn: document.getElementById("addTempProjectBtn"),
		  addProjectBtn: document.getElementById("addProjectBtn"),
	  openActionsBtn: document.getElementById("openActionsBtn"),
	  openShortcutsBtn: document.getElementById("openShortcutsBtn"),
	  openSettingsBtn: document.getElementById("openSettingsBtn"),
	  openStatusBtn: document.getElementById("openStatusBtn"),
	  openStatusSidebarBtn: document.getElementById("openStatusSidebarBtn"),
	  toggleSidebarBtn: document.getElementById("toggleSidebarBtn"),
	  toggleSidebarCollapsedBtn: document.getElementById("toggleSidebarCollapsedBtn"),
  tableScopeCtl: document.getElementById("tableScopeCtl"),
  tableScopeSelect: document.getElementById("tableScopeSelect"),
  sortSelect: document.getElementById("sortSelect"),
  projectFilterSelect: document.getElementById("projectFilterSelect"),
  searchInput: document.getElementById("searchInput"),
		  searchClearBtn: document.getElementById("searchClearBtn"),
		  searchMeta: document.getElementById("searchMeta"),
		  brandLogo: document.getElementById("brandLogo"),

		  projectSelect: document.getElementById("projectSelect"),
		  agentSelect: document.getElementById("agentSelect"),
		  checkoutModeSelect: document.getElementById("checkoutModeSelect"),
		  modelInput: document.getElementById("modelInput"),
		  promptDropwrap: document.getElementById("promptDropwrap"),
		  promptInput: document.getElementById("promptInput"),
	  promptBadge: document.getElementById("promptBadge"),
	  promptAttachments: document.getElementById("promptAttachments"),
  runBtn: document.getElementById("runBtn"),
  composerHint: document.getElementById("composerHint"),

  boardSection: document.getElementById("boardSection"),
  sessionsTableSection: document.getElementById("sessionsTableSection"),
  sessionsTableMeta: document.getElementById("sessionsTableMeta"),
  sessionsTableBody: document.getElementById("sessionsTableBody"),
  laneRunning: document.getElementById("laneRunning"),
  laneAttention: document.getElementById("laneAttention"),
  laneDone: document.getElementById("laneDone"),

  jobDialog: document.getElementById("jobDialog"),
  jobDialogTitle: document.getElementById("jobDialogTitle"),
  jobDialogMeta: document.getElementById("jobDialogMeta"),
  jobDialogClose: document.getElementById("jobDialogClose"),
  jobDialogPopout: document.getElementById("jobDialogPopout"),
  jobDialogMove: document.getElementById("jobDialogMove"),
  jobDialogChat: document.getElementById("jobDialogChat"),
  jobDialogLive: document.getElementById("jobDialogLive"),
  jobDialogLogs: document.getElementById("jobDialogLogs"),
  jobDialogDiff: document.getElementById("jobDialogDiff"),
  jobDialogTerm: document.getElementById("jobDialogTerm"),
  jobSearchInput: document.getElementById("jobSearchInput"),
  jobSearchMeta: document.getElementById("jobSearchMeta"),
  jobSearchPrevBtn: document.getElementById("jobSearchPrevBtn"),
  jobSearchNextBtn: document.getElementById("jobSearchNextBtn"),
  jobSearchClearBtn: document.getElementById("jobSearchClearBtn"),
  followupDropwrap: document.getElementById("followupDropwrap"),
  followupInput: document.getElementById("followupInput"),
  followupBadge: document.getElementById("followupBadge"),
  followupAttachments: document.getElementById("followupAttachments"),
  sendFollowupBtn: document.getElementById("sendFollowupBtn"),
  cancelJobBtn: document.getElementById("cancelJobBtn"),
  jobMoreBtn: document.getElementById("jobMoreBtn"),
  jobMoreMenu: document.getElementById("jobMoreMenu"),
  jobActionsMenu: document.getElementById("jobActionsMenu"),

  rerunDialog: document.getElementById("rerunDialog"),
  rerunDialogClose: document.getElementById("rerunDialogClose"),
  rerunDialogMeta: document.getElementById("rerunDialogMeta"),
  rerunAgentSelect: document.getElementById("rerunAgentSelect"),
  rerunModelInput: document.getElementById("rerunModelInput"),
  rerunPromptSelect: document.getElementById("rerunPromptSelect"),
  rerunStartBtn: document.getElementById("rerunStartBtn"),

  projectDialog: document.getElementById("projectDialog"),
  projectDialogTitle: document.getElementById("projectDialogTitle"),
  projectDialogMeta: document.getElementById("projectDialogMeta"),
  projectDialogClose: document.getElementById("projectDialogClose"),
  projectNameInput: document.getElementById("projectNameInput"),
  projectShortNameInput: document.getElementById("projectShortNameInput"),
  projectDefaultBranchInput: document.getElementById("projectDefaultBranchInput"),
  projectCheckoutModeSelect: document.getElementById("projectCheckoutModeSelect"),
  projectDialogOpenFinderBtn: document.getElementById("projectDialogOpenFinderBtn"),
  projectDialogSave: document.getElementById("projectDialogSave"),
  projectDialogRemoveBtn: document.getElementById("projectDialogRemoveBtn"),

  branchDialog: document.getElementById("branchDialog"),
  branchDialogClose: document.getElementById("branchDialogClose"),
  branchDialogMeta: document.getElementById("branchDialogMeta"),
	  branchDialogText: document.getElementById("branchDialogText"),
	  branchDialogCheckoutBtn: document.getElementById("branchDialogCheckoutBtn"),
	  branchDialogRunBtn: document.getElementById("branchDialogRunBtn"),
	  branchDialogRunNoAskBtn: document.getElementById("branchDialogRunNoAskBtn"),
	  branchDialogCancelBtn: document.getElementById("branchDialogCancelBtn"),

	  integrateDialog: document.getElementById("integrateDialog"),
	  integrateDialogTitle: document.getElementById("integrateDialogTitle"),
	  integrateDialogMeta: document.getElementById("integrateDialogMeta"),
	  integrateDialogClose: document.getElementById("integrateDialogClose"),
	  integrateDialogIcon: document.getElementById("integrateDialogIcon"),
	  integrateDialogStatus: document.getElementById("integrateDialogStatus"),
	  integrateDialogMessage: document.getElementById("integrateDialogMessage"),
	  integrateDialogResultWrap: document.getElementById("integrateDialogResultWrap"),
	  integrateDialogResult: document.getElementById("integrateDialogResult"),
	  integrateDialogRevealBtn: document.getElementById("integrateDialogRevealBtn"),
	  integrateDialogDetailsBtn: document.getElementById("integrateDialogDetailsBtn"),
	  integrateDialogCancelBtn: document.getElementById("integrateDialogCancelBtn"),
	  integrateDialogStartBtn: document.getElementById("integrateDialogStartBtn"),
	  integrateDialogArchiveBtn: document.getElementById("integrateDialogArchiveBtn"),

	  checkoutsDialog: document.getElementById("checkoutsDialog"),
	  checkoutsDialogClose: document.getElementById("checkoutsDialogClose"),
	  checkoutsDialogClose2: document.getElementById("checkoutsDialogClose2"),
	  checkoutsDialogMeta: document.getElementById("checkoutsDialogMeta"),
  checkoutsDialogBody: document.getElementById("checkoutsDialogBody"),
  checkoutsDialogRefresh: document.getElementById("checkoutsDialogRefresh"),

  projectDialogCheckoutsBtn: document.getElementById("projectDialogCheckoutsBtn"),

	  settingsDialog: document.getElementById("settingsDialog"),
	  settingsDialogClose: document.getElementById("settingsDialogClose"),
		  settingsCodexPath: document.getElementById("settingsCodexPath"),
		  settingsCodexModel: document.getElementById("settingsCodexModel"),
		  settingsUiModel: document.getElementById("settingsUiModel"),
			  settingsUiModelCustom: document.getElementById("settingsUiModelCustom"),
			  settingsUiModelCodexGroup: document.getElementById("settingsUiModelCodexGroup"),
		  settingsTheme: document.getElementById("settingsTheme"),
		  settingsColorScheme: document.getElementById("settingsColorScheme"),
		  settingsEditorCommand: document.getElementById("settingsEditorCommand"),
		  settingsCodexSandboxMode: document.getElementById("settingsCodexSandboxMode"),
		  settingsCodexSkipGitRepoCheck: document.getElementById("settingsCodexSkipGitRepoCheck"),
		  settingsCodexBypass: document.getElementById("settingsCodexBypass"),
	  settingsCodexColor: document.getElementById("settingsCodexColor"),
	  settingsClaudePath: document.getElementById("settingsClaudePath"),
	  settingsClaudeModel: document.getElementById("settingsClaudeModel"),
	  settingsClaudePermissionMode: document.getElementById("settingsClaudePermissionMode"),
	  settingsClaudeSkipPermissions: document.getElementById("settingsClaudeSkipPermissions"),
	  settingsMenuBarMode: document.getElementById("settingsMenuBarMode"),
	  settingsStartAtLogin: document.getElementById("settingsStartAtLogin"),
  settingsOpenOnAllDisplays: document.getElementById("settingsOpenOnAllDisplays"),
  settingsGlobalHotkeyEnabled: document.getElementById("settingsGlobalHotkeyEnabled"),
  settingsGlobalHotkeyAccelerator: document.getElementById("settingsGlobalHotkeyAccelerator"),
  settingsGlobalHotkeyUseClipboard: document.getElementById("settingsGlobalHotkeyUseClipboard"),
  settingsGlobalHotkeyStartWisprHandsFree: document.getElementById("settingsGlobalHotkeyStartWisprHandsFree"),
		  settingsSoundNeedsAttention: document.getElementById("settingsSoundNeedsAttention"),
		  settingsSoundDone: document.getElementById("settingsSoundDone"),
	  settingsSoundPreset: document.getElementById("settingsSoundPreset"),
	  settingsSoundVolume: document.getElementById("settingsSoundVolume"),
			  settingsTestSoundAttention: document.getElementById("settingsTestSoundAttention"),
			  settingsTestSoundDone: document.getElementById("settingsTestSoundDone"),
	  settingsBoardDoneLimit: document.getElementById("settingsBoardDoneLimit"),
	  settingsAttentionOnQuestionPrompts: document.getElementById("settingsAttentionOnQuestionPrompts"),
	  settingsIntegrateAutoArchive: document.getElementById("settingsIntegrateAutoArchive"),

	  settingsActionsList: document.getElementById("settingsActionsList"),
	  settingsActionsAddBtn: document.getElementById("settingsActionsAddBtn"),
	  settingsActionsPromptBtn: document.getElementById("settingsActionsPromptBtn"),

	  actionsDialog: document.getElementById("actionsDialog"),
	  actionsDialogClose: document.getElementById("actionsDialogClose"),
	  saveActionsBtn: document.getElementById("saveActionsBtn"),

		  actionPromptDialog: document.getElementById("actionPromptDialog"),
		  actionPromptDialogClose: document.getElementById("actionPromptDialogClose"),
		  actionPromptDialogMeta: document.getElementById("actionPromptDialogMeta"),
		  actionPromptInput: document.getElementById("actionPromptInput"),
		  actionPromptGenerateBtn: document.getElementById("actionPromptGenerateBtn"),

		  textPromptDialog: document.getElementById("textPromptDialog"),
		  textPromptDialogTitle: document.getElementById("textPromptDialogTitle"),
		  textPromptDialogMessage: document.getElementById("textPromptDialogMessage"),
		  textPromptDialogLabel: document.getElementById("textPromptDialogLabel"),
		  textPromptDialogInput: document.getElementById("textPromptDialogInput"),
		  textPromptDialogClose: document.getElementById("textPromptDialogClose"),
		  textPromptDialogCancel: document.getElementById("textPromptDialogCancel"),
		  textPromptDialogOk: document.getElementById("textPromptDialogOk"),

		  projectRemoveDialog: document.getElementById("projectRemoveDialog"),
		  projectRemoveDialogMessage: document.getElementById("projectRemoveDialogMessage"),
		  projectRemoveDialogDeleteRow: document.getElementById("projectRemoveDialogDeleteRow"),
		  projectRemoveDialogDeleteFolder: document.getElementById("projectRemoveDialogDeleteFolder"),
		  projectRemoveDialogClose: document.getElementById("projectRemoveDialogClose"),
		  projectRemoveDialogCancel: document.getElementById("projectRemoveDialogCancel"),
		  projectRemoveDialogRemove: document.getElementById("projectRemoveDialogRemove"),

			  saveSettingsBtn: document.getElementById("saveSettingsBtn"),

  codexModelsList: document.getElementById("codexModelsList"),

  statusDialog: document.getElementById("statusDialog"),
  statusDialogClose: document.getElementById("statusDialogClose"),
  statusDialogMeta: document.getElementById("statusDialogMeta"),
  statusDialogBody: document.getElementById("statusDialogBody"),

  agentsInstallDialog: document.getElementById("agentsInstallDialog"),
  agentsInstallDialogClose: document.getElementById("agentsInstallDialogClose"),
  agentsInstallDialogMeta: document.getElementById("agentsInstallDialogMeta"),
  agentsInstallDialogBody: document.getElementById("agentsInstallDialogBody"),

  shortcutsDialog: document.getElementById("shortcutsDialog"),
  shortcutsDialogClose: document.getElementById("shortcutsDialogClose"),
  shortcutsDialogBody: document.getElementById("shortcutsDialogBody"),

  toast: document.getElementById("toast"),
  cardContextMenu: document.getElementById("cardContextMenu"),

  imageDialog: document.getElementById("imageDialog"),
  imageDialogTitle: document.getElementById("imageDialogTitle"),
  imageDialogClose: document.getElementById("imageDialogClose"),
  imageDialogImg: document.getElementById("imageDialogImg"),

  helperThinkingIndicator: document.getElementById("helperThinkingIndicator"),
  helperBubbleBtn: document.getElementById("helperBubbleBtn"),
  helperPanel: document.getElementById("helperPanel"),
  helperPanelClose: document.getElementById("helperPanelClose"),
  helperMeta: document.getElementById("helperMeta"),
  helperAgentSelect: document.getElementById("helperAgentSelect"),
  helperContextScopeSelect: document.getElementById("helperContextScopeSelect"),
  helperSessionSelect: document.getElementById("helperSessionSelect"),
  helperNewSessionBtn: document.getElementById("helperNewSessionBtn"),
  helperClearSessionBtn: document.getElementById("helperClearSessionBtn"),
  helperMessages: document.getElementById("helperMessages"),
  helperInput: document.getElementById("helperInput"),
  helperSendBtn: document.getElementById("helperSendBtn"),
  helperToPromptBtn: document.getElementById("helperToPromptBtn")
};

const state = {
  settings: null,
  agentBinaries: null,
  projects: [],
  jobs: new Map(),
  selectedJobId: null,
  rerunSourceJobId: null,
  activeTab: "chat",
  cardEls: new Map(), // jobId -> HTMLElement
  view: "board", // board | archive | trash
  displayMode: "cards", // cards | table
  tableScope: "view", // view | all (table mode only)
  focusLane: "", // running | attention | done (popout window)
  focusJobId: "", // jobId (popout window)
  showAllDone: false, // board view: show all Done cards (otherwise respect boardDoneLimit)
  sortMode: "lane_newest", // lane_newest | lane_oldest | duration_longest | created_newest | created_oldest
  toastTimer: null,
  toastUndo: null,
  toastActions: [],
  agentInstallInFlight: "", // codex | claude
  agentInstallResults: { codex: null, claude: null },
  cardCtxJobId: "",
  cardCtxOpenedAt: 0,
  statusRenderTimer: null,
  durationTimer: null,
	  projectRefreshTimer: null,
	  composerCheckoutModeProjectId: "",

	  editingProjectId: "",
	  branchDialogResolver: null,
	  checkoutsProjectId: "",
	  checkoutsEntries: [],
  checkoutsLoading: false,

  projectFilterId: "", // projectId | ""
  searchQuery: "",
  searchJobIds: null, // Set<string> | null
  searchTotal: 0,
  searchTruncated: false,
  searchPending: false,
  searchTimer: null,
  searchSeq: 0,
  jobSearchQuery: "",
  jobSearchMatches: [],
  jobSearchIndex: -1,
  jobSearchUnsupported: false,

  composerImages: [],
  composerFiles: [],
  followupImages: [],
  followupFiles: [],

  helperOpen: false,
  helperPending: false,
  helperSessions: [],
  helperSessionId: "",
  helperMessages: [],
  helperLastRunner: ""
};

const audio = {
  ctx: null,
  activeHtmlPlayers: new Set()
};

const SOUND_SAMPLE_URLS = {
  cucaracha: "sounds/la-cucaracha-car-horn.mp3",
  fun_drum: "sounds/fun-comedic-drum.mp3",
  pipe: "sounds/pipe.mp3",
  sergei: "sounds/sergei-spas.mp3",
  pop_wow: "sounds/pop-wow.mp3"
};

const STORAGE = {
  lastProjectId: "agentHeaven.lastProjectId",
  lastAgent: "agentHeaven.lastAgent",
  sortMode: "agentHeaven.sortMode",
  displayMode: "agentHeaven.displayMode",
  tableScope: "agentHeaven.tableScope",
  projectFilterId: "agentHeaven.projectFilterId",
  sidebarCollapsed: "agentHeaven.sidebarCollapsed",
  composerDraft: "agentHeaven.draft.composer",
  agentBinariesToastAt: "agentHeaven.agentBinaries.toastAt.v1",
  onboardingSeen: "agentHeaven.onboarding.seen.v1",
  helperHistory: "agentHeaven.helper.history.v1",
  helperSessions: "agentHeaven.helper.sessions.v2",
  helperContextScope: "agentHeaven.helper.contextScope.v1"
};

const DEMO = {
  projectId: "__agentHeavenDemoProject__",
  jobs: {
    running: "__ah_demo_running__",
    attention: "__ah_demo_attention__",
    done: "__ah_demo_done__"
  }
};

const TOUR_ROOT_ID = "ahTour";
const DEFAULT_FOLLOWUP_PLACEHOLDER = "Follow-up… (⌘+Enter)";
const PROMPT_PATH_SUGGEST_LIMIT = 24;
const PROMPT_PATH_SUGGEST_DEBOUNCE_MS = 90;
const PROMPT_PATH_SUGGEST_CURSOR_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]);
let promptPathSuggestTimer = null;
let promptPathSuggestReqSeq = 0;
const OFFLINE_TOAST_MESSAGE = "No internet connection. Some actions may fail until you're back online.";
const promptPathSuggestState = {
  open: false,
  mode: "insert", // insert | attach
  items: [],
  activeIndex: 0
};
const FOLLOWUP_AUTOSIZE_MAX_ROWS = 10;
const TEMP_PROJECT_OPTION_VALUE = "__temp_new__";
const HELPER_CONTEXT_GLOBAL_VALUE = "global";
const HELPER_CONTEXT_PROJECT_PREFIX = "project:";
const HELPER_SESSION_MAX = 12;
const HELPER_SESSION_MESSAGES_MAX = 80;
const HELPER_SESSION_TEXT_MAX = 4000;
const EDITOR_PRESET_CUSTOM_VALUE = "__custom__";
const EDITOR_PRESET_VALUES = new Set(["code", "cursor", "windsurf", "zed", "subl", "nvim", "vim", "idea", "webstorm", "pycharm", "goland"]);

let followupAutosizeRaf = 0;

function scheduleAutosizeFollowupInput() {
  if (!els.followupInput) return;
  if (followupAutosizeRaf) {
    try {
      window.cancelAnimationFrame(followupAutosizeRaf);
    } catch {
      // ignore
    }
  }
  followupAutosizeRaf = window.requestAnimationFrame(() => {
    followupAutosizeRaf = 0;
    autosizeTextarea(els.followupInput, { maxRows: FOLLOWUP_AUTOSIZE_MAX_ROWS });
  });
}

function autosizeTextarea(el, { maxRows = 10 } = {}) {
  if (!el) return;
  if (typeof el.scrollHeight !== "number") return;

  // When the element is not visible yet (e.g. <dialog> closed), layout metrics are unreliable.
  // We'll re-run on the next input/open once it's on-screen.
  if (el.scrollHeight === 0) return;

  const cs = window.getComputedStyle(el);
  const boxSizing = String(cs.boxSizing || "");

  const pt = parseFloat(cs.paddingTop) || 0;
  const pb = parseFloat(cs.paddingBottom) || 0;
  const bt = parseFloat(cs.borderTopWidth) || 0;
  const bb = parseFloat(cs.borderBottomWidth) || 0;

  const fontSize = parseFloat(cs.fontSize) || 13;
  const lineHeightRaw = String(cs.lineHeight || "");
  const lineHeight =
    lineHeightRaw === "normal" ? fontSize * 1.35 : parseFloat(lineHeightRaw) || fontSize * 1.35;

  const rowsAttr = parseInt(String(el.getAttribute("rows") || ""), 10);
  const minRows = Number.isFinite(rowsAttr) && rowsAttr > 0 ? rowsAttr : 1;

  const padY = pt + pb;
  const borderY = bt + bb;

  const minContent = lineHeight * minRows + padY;
  const maxContent = lineHeight * maxRows + padY;
  const minHeight = boxSizing === "border-box" ? minContent + borderY : minContent;
  const maxHeight = boxSizing === "border-box" ? maxContent + borderY : maxContent;

  // Reset so the textarea can shrink when deleting.
  el.style.height = "auto";
  const want = boxSizing === "border-box" ? el.scrollHeight + borderY : el.scrollHeight;
  const next = Math.max(minHeight, Math.min(maxHeight, want));

  el.style.height = `${next}px`;
  el.style.overflowY = want > maxHeight ? "auto" : "hidden";
}

const termUi = {
  jobId: "",
  term: null,
  fitAddon: null,
  dataDispose: null,
  resizeObserver: null,
  fitRaf: 0,
  lastSeq: 0,
  connectPromise: null,
  connectJobId: "",
  xtermModsPromise: null
};

const tour = {
  active: false,
  step: 0,
  root: null,
  spotlightEl: null,
  cardEl: null,
  kickerEl: null,
  titleEl: null,
  bodyEl: null,
  backBtn: null,
  nextBtn: null,
  skipBtn: null,
  updateRaf: 0,
  dispose: []
};

const TOUR_STEPS = [
  {
    title: "Welcome",
    body: "This is Agent Heaven.\n\nThese cards are examples (demo) and will disappear when you finish the tour.",
    prefer: "right",
    getTarget: () => document.querySelector(".brand")
  },
  {
    title: "Add a project folder",
    body: "Add a project so the agent has a working directory.\n(You can add multiple projects.)",
    prefer: "right",
    getTarget: () => els.addProjectBtn
  },
  {
    title: "Write a prompt",
    body: "Pick a project + agent, then describe what you want.\nTip: ⌘+P focuses the prompt.",
    prefer: "bottom",
    getTarget: () => els.promptInput
  },
  {
    title: "Run",
    body: "Run starts a new job card.\nTip: ⌘+Enter runs from the prompt.",
    prefer: "bottom",
    getTarget: () => els.runBtn
  },
  {
    title: "Cards",
    body: "Cards move across lanes based on status.\nClick a card to open chat + logs.\nRight click a card for actions.",
    prefer: "left",
    getTarget: () => document.querySelector(`[data-job-id="${DEMO.jobs.done}"]`) || document.querySelector(".card[data-job-id]")
  },
  {
    title: "Shortcuts + Settings",
    body: "Open shortcuts (⌘+/) and tweak defaults in Settings.",
    prefer: "top",
    getTarget: () => els.openShortcutsBtn || els.openSettingsBtn
  }
];

applySidebarCollapsed(getStoredSidebarCollapsed());

const THEMES = ["heaven", "nord", "gruvbox", "solarized", "dracula", "ocean"];
const COLOR_SCHEMES = ["system", "dark", "light"];
const SOUND_PRESETS = ["classic", "chime", "pop", "bell", "arcade", "cucaracha", "fun_drum", "pipe", "sergei", "pop_wow", "goat"];
const GRID_SVG = `
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="4" width="9" height="9" rx="2" stroke-width="2.0" />
    <rect x="19" y="4" width="9" height="9" rx="2" stroke-width="2.0" opacity="0.50" />
    <rect x="4" y="19" width="9" height="9" rx="2" stroke-width="2.0" opacity="0.50" />
    <rect x="19" y="19" width="9" height="9" rx="2" stroke-width="2.0" opacity="0.30" />
  </g>
`.trim();
const LOGO_VARIANTS = {
  v1: {
    label: "Round",
    svg: GRID_SVG,
    font: '"Avenir Next", "Nunito", "Quicksand", Avenir, "Century Gothic", sans-serif',
    weight: 700
  },
  v2: {
    label: "Serif",
    svg: GRID_SVG,
    font: '"New York", "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
    weight: 800
  },
  v3: {
    label: "Sans",
    svg: GRID_SVG,
    font: '"SF Pro Display", "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    weight: 700
  },
  v4: {
    label: "Mono",
    svg: GRID_SVG,
    font: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    weight: 600
  },
  v5: {
    label: "System",
    svg: GRID_SVG,
    font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif',
    weight: 800
  }
};
// Branding is fixed; we no longer expose this as a setting.
const FIXED_LOGO_VARIANT = "v1";
const UI_MODEL_CUSTOM = "__custom__";

const SORT_MODES = ["lane_newest", "lane_oldest", "duration_longest", "created_newest", "created_oldest"];
const TOKEN_TOOLTIP_ATTR = "data-ah-tooltip";

let systemSchemeMql = null;
let appliedLogoVariant = "";
const tokenTooltip = {
  root: null,
  textEl: null,
  activeEl: null,
  raf: 0,
  observer: null
};

function normalizeLaneKey(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_");
  if (v === "running") return "running";
  if (v === "done") return "done";
  if (v === "attention" || v === "needs_attention" || v === "needsattention" || v === "attn") return "attention";
  return "";
}

function laneTitleForKey(key) {
  if (key === "running") return "Running";
  if (key === "done") return "Done";
  return "Needs Attention";
}

	function isJobMode() {
	  return document.documentElement.dataset.mode === "job";
	}

	let textPromptDialogInFlight = false;
	let textPromptDialogResolve = null;
	function closeTextPromptDialog() {
	  if (!els.textPromptDialog) return;
	  try {
	    if (els.textPromptDialog.open) els.textPromptDialog.close();
	  } catch {
	    // ignore
	  }
	}
	function resolveTextPromptDialog(value) {
	  if (typeof textPromptDialogResolve !== "function") return;
	  const resolve = textPromptDialogResolve;
	  textPromptDialogResolve = null;
	  textPromptDialogInFlight = false;
	  resolve(value);
	}
	async function promptText(opts = {}) {
	  const o = opts && typeof opts === "object" ? opts : {};
	  const title = typeof o.title === "string" ? o.title : "Input";
	  const message = typeof o.message === "string" ? o.message : "";
	  const label = typeof o.label === "string" ? o.label : "Value";
	  const defaultValue = typeof o.defaultValue === "string" ? o.defaultValue : "";
	  const placeholder = typeof o.placeholder === "string" ? o.placeholder : "";
	  const okLabel = typeof o.okLabel === "string" ? o.okLabel : "OK";
	  const cancelLabel = typeof o.cancelLabel === "string" ? o.cancelLabel : "Cancel";

	  // Fallback (or last resort) for builds without the custom dialog.
	  if (!els.textPromptDialog || !els.textPromptDialogInput) {
	    const full = message ? `${title}\n\n${message}` : title;
	    try {
	      return window.prompt(full, defaultValue);
	    } catch {
	      return null;
	    }
	  }

	  if (textPromptDialogInFlight) return null;
	  textPromptDialogInFlight = true;

	  if (els.textPromptDialogTitle) els.textPromptDialogTitle.textContent = title || "Input";
	  if (els.textPromptDialogMessage) {
	    els.textPromptDialogMessage.textContent = message;
	    els.textPromptDialogMessage.hidden = !message;
	  }
	  if (els.textPromptDialogLabel) els.textPromptDialogLabel.textContent = label || "Value";
	  if (els.textPromptDialogOk) els.textPromptDialogOk.textContent = okLabel || "OK";
	  if (els.textPromptDialogCancel) els.textPromptDialogCancel.textContent = cancelLabel || "Cancel";
	  if (els.textPromptDialogInput) {
	    els.textPromptDialogInput.value = defaultValue;
	    if (placeholder) els.textPromptDialogInput.placeholder = placeholder;
	    else els.textPromptDialogInput.removeAttribute("placeholder");
	  }

	  return await new Promise((resolve) => {
	    textPromptDialogResolve = resolve;

	    try {
	      els.textPromptDialog.showModal();
	    } catch {
	      // Best-effort fallback: reset state and try native prompt.
	      textPromptDialogResolve = null;
	      textPromptDialogInFlight = false;
	      const full = message ? `${title}\n\n${message}` : title;
	      try {
	        resolve(window.prompt(full, defaultValue));
	      } catch {
	        resolve(null);
	      }
	      return;
	    }

	    try {
	      if (els.textPromptDialogInput) {
	        els.textPromptDialogInput.focus();
	        els.textPromptDialogInput.select();
	      }
	    } catch {
	      // ignore
	    }
	  });
	}

	let projectRemoveDialogInFlight = false;
	let projectRemoveDialogResolve = null;
	function closeProjectRemoveDialog() {
	  if (!els.projectRemoveDialog) return;
	  try {
	    if (els.projectRemoveDialog.open) els.projectRemoveDialog.close();
	  } catch {
	    // ignore
	  }
	}
	function resolveProjectRemoveDialog(value) {
	  if (typeof projectRemoveDialogResolve !== "function") return;
	  const resolve = projectRemoveDialogResolve;
	  projectRemoveDialogResolve = null;
	  projectRemoveDialogInFlight = false;
	  resolve(value);
	}
	async function promptProjectRemove(project) {
	  const p = project && typeof project === "object" ? project : null;
	  const label = p && p.name ? `"${p.name}"` : "this project";
	  const isTemporary = !!(p && p.isTemporary);
	  const fullPath = p && typeof p.path === "string" ? p.path : "";
	  const displayPath = formatProjectPathForDisplay(fullPath);

	  // Fallback for builds without the custom dialog.
	  if (!els.projectRemoveDialog || !els.projectRemoveDialogRemove) {
	    const ok = window.confirm(`Remove ${label} from the sidebar list?`);
	    if (!ok) return { confirmed: false, deleteFolder: false };
	    let deleteFolder = false;
	    if (isTemporary) {
	      deleteFolder = window.confirm(
	        `Also delete the temporary folder from disk?\n\n${fullPath || displayPath || "(path unknown)"}`
	      );
	    }
	    return { confirmed: true, deleteFolder };
	  }

	  if (projectRemoveDialogInFlight) return { confirmed: false, deleteFolder: false };
	  projectRemoveDialogInFlight = true;

	  if (els.projectRemoveDialogMessage) {
	    const lines = [`Remove ${label} from the sidebar list?`];
	    if (isTemporary) {
	      lines.push("");
	      lines.push("Temporary project folder:");
	      lines.push(fullPath || displayPath || "(path unknown)");
	      lines.push("");
	      lines.push("Enable the checkbox below to also delete the folder from disk.");
	    }
	    els.projectRemoveDialogMessage.textContent = lines.join("\n");
	  }

	  if (els.projectRemoveDialogDeleteRow) els.projectRemoveDialogDeleteRow.hidden = !isTemporary;
	  if (els.projectRemoveDialogDeleteFolder) {
	    els.projectRemoveDialogDeleteFolder.checked = false;
	    els.projectRemoveDialogDeleteFolder.disabled = !isTemporary;
	  }

	  return await new Promise((resolve) => {
	    projectRemoveDialogResolve = resolve;
	    try {
	      els.projectRemoveDialog.showModal();
	    } catch {
	      projectRemoveDialogResolve = null;
	      projectRemoveDialogInFlight = false;
	      const ok = window.confirm(`Remove ${label} from the sidebar list?`);
	      if (!ok) {
	        resolve({ confirmed: false, deleteFolder: false });
	        return;
	      }
	      const deleteFolder = isTemporary
	        ? window.confirm(`Also delete the temporary folder from disk?\n\n${fullPath || displayPath || "(path unknown)"}`)
	        : false;
	      resolve({ confirmed: true, deleteFolder });
	      return;
	    }

	    try {
	      if (els.projectRemoveDialogRemove) els.projectRemoveDialogRemove.focus();
	    } catch {
	      // ignore
	    }
	  });
	}

async function pickDisplayId(actionLabel) {
	  if (!api.windowListDisplays) return null;
	  const title = String(actionLabel || "Select display").trim() || "Select display";

  let displays;
  try {
    displays = await api.windowListDisplays();
  } catch {
    displays = [];
  }

	  const arr = Array.isArray(displays) ? displays : [];
	  if (arr.length === 0) return null;
	  if (arr.length === 1) return arr[0].id;

	  const lines = arr.map((d, idx) => `${idx + 1}: ${d && d.label ? d.label : `Display ${idx + 1}`}`);
	  const raw = await promptText({
	    title,
	    message: `${lines.join("\n")}\n\nEnter a number (1-${arr.length}):`,
	    label: "Number",
	    defaultValue: "1"
	  });
	  if (!raw) return null;
	  const n = Number(String(raw).trim());
	  if (!Number.isFinite(n) || n < 1 || n > arr.length) return null;
	  return arr[n - 1].id;
	}

async function moveThisWindowToDisplay() {
  if (!api.windowMoveToDisplay) {
    showToast("Move-to-display is not supported in this build.");
    return;
  }
  const displayId = await pickDisplayId("Move this window to which display?");
  if (displayId == null) return;
  try {
    await api.windowMoveToDisplay(displayId);
  } catch (err) {
    showToast(String(err && err.message ? err.message : err));
  }
}

// Support popout windows (e.g. put "running" and "needs attention" on separate monitors).
{
  const params = new URLSearchParams(window.location.search || "");
  const mode = String(params.get("mode") || "")
    .trim()
    .toLowerCase();
  const lane = normalizeLaneKey(params.get("lane") || "");
  const jobId = String(params.get("jobId") || "").trim();
  if (mode === "lane" && lane) {
    state.focusLane = lane;
    document.documentElement.dataset.mode = "lane";
    document.title = `Agent Heaven - ${laneTitleForKey(lane)}`;
  } else if (mode === "job" && jobId) {
    state.focusJobId = jobId;
    document.documentElement.dataset.mode = "job";
    document.title = "Agent Heaven - Job";
  }
}

// Platform hint for CSS (e.g. macOS traffic lights with hiddenInset title bars).
{
  try {
    document.documentElement.dataset.platform = isMacPlatform() ? "mac" : "other";
  } catch {
    // ignore
  }
}

function clampNumber(n, min, max, fallback) {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}

function tooltipTextFromElement(el) {
  if (!el || typeof el.getAttribute !== "function") return "";
  const raw = el.getAttribute(TOKEN_TOOLTIP_ATTR);
  return typeof raw === "string" ? raw.trim() : "";
}

function stashNativeTitle(el) {
  if (!el || typeof el.hasAttribute !== "function") return;
  if (!el.hasAttribute("title")) return;
  const raw = el.getAttribute("title");
  const text = typeof raw === "string" ? raw.trim() : "";
  if (text) el.setAttribute(TOKEN_TOOLTIP_ATTR, raw);
  else el.removeAttribute(TOKEN_TOOLTIP_ATTR);
  el.removeAttribute("title");
}

function stashTitlesInTree(root) {
  if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root;
  stashNativeTitle(el);
  if (!el.querySelectorAll) return;
  const matches = el.querySelectorAll("[title]");
  for (const node of matches) stashNativeTitle(node);
}

function ensureTokenTooltipEl() {
  if (tokenTooltip.root) return tokenTooltip.root;
  if (!document || !document.body) return null;
  const wrap = document.createElement("div");
  wrap.className = "tokenTooltip";
  wrap.setAttribute("role", "tooltip");
  wrap.hidden = true;
  const text = document.createElement("div");
  text.className = "tokenTooltip__text";
  wrap.appendChild(text);
  document.body.appendChild(wrap);
  tokenTooltip.root = wrap;
  tokenTooltip.textEl = text;
  return wrap;
}

function hideTokenTooltip() {
  if (tokenTooltip.raf) {
    try {
      window.cancelAnimationFrame(tokenTooltip.raf);
    } catch {
      // ignore
    }
    tokenTooltip.raf = 0;
  }
  tokenTooltip.activeEl = null;
  if (!tokenTooltip.root) return;
  tokenTooltip.root.hidden = true;
  tokenTooltip.root.removeAttribute("data-open");
}

function positionTokenTooltip() {
  const root = tokenTooltip.root;
  const activeEl = tokenTooltip.activeEl;
  if (!root || !activeEl) return;
  if (!document.body || !document.body.contains(activeEl)) {
    hideTokenTooltip();
    return;
  }

  const text = tooltipTextFromElement(activeEl);
  if (!text) {
    hideTokenTooltip();
    return;
  }
  if (tokenTooltip.textEl) tokenTooltip.textEl.textContent = text;

  root.hidden = false;
  root.setAttribute("data-open", "true");
  root.style.left = "0px";
  root.style.top = "0px";

  const gap = 10;
  const pad = 8;
  const targetRect = activeEl.getBoundingClientRect();
  const tipRect = root.getBoundingClientRect();

  let left = targetRect.left + targetRect.width / 2 - tipRect.width / 2;
  left = clampNumber(left, pad, window.innerWidth - tipRect.width - pad, pad);

  let top = targetRect.top - tipRect.height - gap;
  if (!Number.isFinite(top) || top < pad) top = targetRect.bottom + gap;
  top = clampNumber(top, pad, window.innerHeight - tipRect.height - pad, pad);

  root.style.left = `${Math.round(left)}px`;
  root.style.top = `${Math.round(top)}px`;
}

function scheduleTokenTooltipPosition() {
  if (tokenTooltip.raf) return;
  tokenTooltip.raf = window.requestAnimationFrame(() => {
    tokenTooltip.raf = 0;
    positionTokenTooltip();
  });
}

function tooltipTargetFromNode(node) {
  const start = node && node.nodeType === Node.ELEMENT_NODE ? node : node && node.parentElement ? node.parentElement : null;
  if (!start || typeof start.closest !== "function") return null;
  const target = start.closest(`[${TOKEN_TOOLTIP_ATTR}], [title]`);
  if (!target || target === tokenTooltip.root) return null;
  stashNativeTitle(target);
  return tooltipTextFromElement(target) ? target : null;
}

function showTokenTooltipFor(target) {
  if (!target) {
    hideTokenTooltip();
    return;
  }
  stashNativeTitle(target);
  const text = tooltipTextFromElement(target);
  if (!text) {
    hideTokenTooltip();
    return;
  }
  if (!ensureTokenTooltipEl()) return;
  tokenTooltip.activeEl = target;
  if (tokenTooltip.textEl) tokenTooltip.textEl.textContent = text;
  scheduleTokenTooltipPosition();
}

function removedNodeContains(node, target) {
  if (!node || !target) return false;
  if (node === target) return true;
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  return !!(node.contains && node.contains(target));
}

function setupTokenTooltips() {
  if (!document || !document.body) return;
  stashTitlesInTree(document.body);

  document.addEventListener("pointerover", (e) => {
    const target = tooltipTargetFromNode(e.target);
    if (target) {
      showTokenTooltipFor(target);
      return;
    }
    if (!tokenTooltip.activeEl) return;
    const next = tooltipTargetFromNode(e.relatedTarget);
    if (!next) hideTokenTooltip();
  });

  document.addEventListener("pointerout", (e) => {
    if (!tokenTooltip.activeEl) return;
    const next = tooltipTargetFromNode(e.relatedTarget);
    if (next) {
      showTokenTooltipFor(next);
      return;
    }
    hideTokenTooltip();
  });

  document.addEventListener("focusin", (e) => {
    const target = tooltipTargetFromNode(e.target);
    if (target) showTokenTooltipFor(target);
  });

  document.addEventListener("focusout", (e) => {
    if (!tokenTooltip.activeEl) return;
    const next = tooltipTargetFromNode(e.relatedTarget);
    if (next) {
      showTokenTooltipFor(next);
      return;
    }
    hideTokenTooltip();
  });

  document.addEventListener("keydown", (e) => {
    if (e && e.key === "Escape") hideTokenTooltip();
  });

  window.addEventListener("blur", () => hideTokenTooltip());
  window.addEventListener("resize", () => scheduleTokenTooltipPosition());
  window.addEventListener(
    "scroll",
    () => {
      if (!tokenTooltip.activeEl) return;
      scheduleTokenTooltipPosition();
    },
    true
  );

  if (typeof MutationObserver !== "function") return;
  tokenTooltip.observer = new MutationObserver((mutations) => {
    let shouldReposition = false;
    for (const m of mutations) {
      if (!m) continue;
      if (m.type === "attributes" && m.target && m.target.nodeType === Node.ELEMENT_NODE) {
        const el = m.target;
        if (m.attributeName === "title") stashNativeTitle(el);
        if (el === tokenTooltip.activeEl && (m.attributeName === TOKEN_TOOLTIP_ATTR || m.attributeName === "title")) {
          const text = tooltipTextFromElement(el);
          if (!text) {
            hideTokenTooltip();
            continue;
          }
          if (tokenTooltip.textEl) tokenTooltip.textEl.textContent = text;
          shouldReposition = true;
        }
        continue;
      }

      if (m.type !== "childList") continue;
      for (const node of m.addedNodes || []) stashTitlesInTree(node);
      if (!tokenTooltip.activeEl) continue;
      for (const node of m.removedNodes || []) {
        if (removedNodeContains(node, tokenTooltip.activeEl)) {
          hideTokenTooltip();
          break;
        }
      }
    }
    if (shouldReposition) scheduleTokenTooltipPosition();
  });

  tokenTooltip.observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["title", TOKEN_TOOLTIP_ATTR]
  });
}

function accelKeyFromEvent(e) {
  const key = String(e && e.key ? e.key : "");
  if (!key) return "";

  // Ignore modifiers alone (we only commit once a real key is pressed).
  if (key === "Shift" || key === "Control" || key === "Meta" || key === "Alt") return "";

  // Common non-printable keys supported by Electron accelerators.
  if (key === " ") return "Space";
  if (key === "Escape") return "Esc";
  if (key === "ArrowUp") return "Up";
  if (key === "ArrowDown") return "Down";
  if (key === "ArrowLeft") return "Left";
  if (key === "ArrowRight") return "Right";
  if (key === "PageUp") return "PageUp";
  if (key === "PageDown") return "PageDown";
  if (key === "Home") return "Home";
  if (key === "End") return "End";
  if (key === "Insert") return "Insert";
  if (key === "Delete") return "Delete";
  if (key === "Backspace") return "Backspace";
  if (key === "Tab") return "Tab";
  if (key === "Enter") return "Enter";

  if (/^F\\d{1,2}$/i.test(key)) return key.toUpperCase();

  if (key.length === 1) {
    const up = key.toUpperCase();
    if (up === "+") return "Plus";
    if (up === "-") return "Minus";
    if (/^[A-Z0-9]$/.test(up)) return up;
  }

  // Fallback to physical key codes for common letter/digit keys.
  const code = String(e && e.code ? e.code : "");
  if (code.startsWith("Key") && code.length === 4) return code.slice(3).toUpperCase();
  if (code.startsWith("Digit") && code.length === 6) return code.slice(5);

  return "";
}

function acceleratorFromEvent(e) {
  const key = accelKeyFromEvent(e);
  if (!key) return "";

  const mods = [];
  if (e && (e.metaKey || e.ctrlKey)) mods.push("CommandOrControl");
  if (e && e.altKey) mods.push("Alt");
  if (e && e.shiftKey) mods.push("Shift");

  return [...mods, key].join("+");
}

function wireAcceleratorCaptureInput(inputEl) {
  if (!inputEl || typeof inputEl.addEventListener !== "function") return;

  inputEl.addEventListener("keydown", (e) => {
    if (!e) return;
    if (e.isComposing) return;

    const hasMods = !!(e.metaKey || e.ctrlKey || e.altKey || e.shiftKey);

    // Let users tab out naturally.
    if (e.key === "Tab" && !hasMods) return;

    // Let bare-Escape close dialogs (default <dialog> behavior).
    if (e.key === "Escape" && !hasMods) return;

    // Backspace/Delete clears the value unless used as part of a combo.
    if ((e.key === "Backspace" || e.key === "Delete") && !hasMods) {
      e.preventDefault();
      e.stopPropagation();
      inputEl.value = "";
      return;
    }

    const accel = acceleratorFromEvent(e);

    // Swallow modifier-only presses so they don't trigger app-level shortcuts.
    if (!accel) {
      if (e.key === "Shift" || e.key === "Control" || e.key === "Meta" || e.key === "Alt") {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    inputEl.value = accel;
    try {
      inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
    } catch {
      // ignore
    }
  });
}

function normalizeTheme(value) {
  const t = String(value || "")
    .trim()
    .toLowerCase();
  return THEMES.includes(t) ? t : "heaven";
}

function normalizeColorScheme(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  return COLOR_SCHEMES.includes(v) ? v : "dark";
}

function getSystemColorScheme() {
  try {
    if (systemSchemeMql && typeof systemSchemeMql.matches === "boolean") return systemSchemeMql.matches ? "dark" : "light";
  } catch {
    // ignore
  }

  try {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
  } catch {
    // ignore
  }

  return "dark";
}

function wireSystemColorSchemeListener() {
  if (systemSchemeMql) return;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

  try {
    systemSchemeMql = window.matchMedia("(prefers-color-scheme: dark)");
  } catch {
    systemSchemeMql = null;
    return;
  }

  const onChange = () => {
    const pref = normalizeColorScheme(state.settings && state.settings.uiColorScheme);
    if (pref !== "system") return;
    applyThemeFromSettings(state.settings);
  };

  try {
    systemSchemeMql.addEventListener("change", onChange);
  } catch {
    try {
      systemSchemeMql.addListener(onChange);
    } catch {
      // ignore
    }
  }
}

function normalizeSoundPreset(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  return SOUND_PRESETS.includes(v) ? v : "classic";
}

function normalizeLogoVariant(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (raw && Object.prototype.hasOwnProperty.call(LOGO_VARIANTS, raw)) return raw;
  if (/^\d+$/.test(raw)) {
    const id = `v${Number(raw)}`;
    if (Object.prototype.hasOwnProperty.call(LOGO_VARIANTS, id)) return id;
  }
  return "v1";
}

function renderBrandLogo(variant) {
  if (!els.brandLogo) return;
  const v = normalizeLogoVariant(variant);
  if (appliedLogoVariant === v) return;
  const def = LOGO_VARIANTS[v] || LOGO_VARIANTS.v1;
  if (!def || !def.svg) return;
  try {
    els.brandLogo.innerHTML = def.svg;
  } catch {
    // ignore
  }
  const nameEl = document.querySelector(".brand__name");
  if (nameEl && def.font) {
    nameEl.style.fontFamily = def.font;
    nameEl.style.fontWeight = def.weight || 800;
  }
  appliedLogoVariant = v;
}

function ensureSelectOption(selectEl, value, label) {
  if (!selectEl || !value) return null;
  const v = String(value);
  for (const opt of Array.from(selectEl.options || [])) {
    if (opt && opt.value === v) return opt;
  }
  const opt = document.createElement("option");
  opt.value = v;
  opt.textContent = String(label || value);
  try {
    selectEl.appendChild(opt);
  } catch {
    // ignore
  }
  return opt;
}

function isSelectEl(el) {
  return !!el && String(el.tagName || "").toUpperCase() === "SELECT";
}

function selectHasOptionValue(selectEl, value) {
  if (!isSelectEl(selectEl) || value == null) return false;
  const v = String(value);
  for (const opt of Array.from(selectEl.options || [])) {
    if (opt && opt.value === v) return true;
  }
  return false;
}

function syncUiModelCustomVisibility() {
  const selectEl = els.settingsUiModel;
  const customEl = els.settingsUiModelCustom;
  if (!customEl) return;
  const show = isSelectEl(selectEl) && selectEl.value === UI_MODEL_CUSTOM;
  customEl.hidden = !show;
}

function getUiModelFromControls() {
  const selectEl = els.settingsUiModel;
  const customEl = els.settingsUiModelCustom;
  const v = String(selectEl && selectEl.value != null ? selectEl.value : "").trim();
  if (v === UI_MODEL_CUSTOM) return String(customEl && customEl.value != null ? customEl.value : "").trim();
  return v;
}

function setUiModelControls(value) {
  const selectEl = els.settingsUiModel;
  const customEl = els.settingsUiModelCustom;
  const v = String(value || "").trim();

  if (!isSelectEl(selectEl) || !customEl) {
    if (selectEl) selectEl.value = v;
    if (customEl) customEl.value = v;
    return;
  }

  if (!v) {
    selectEl.value = "";
    customEl.value = "";
  } else if (selectHasOptionValue(selectEl, v)) {
    selectEl.value = v;
    customEl.value = "";
  } else {
    selectEl.value = UI_MODEL_CUSTOM;
    customEl.value = v;
  }
  syncUiModelCustomVisibility();
}

function applyThemeFromSettings(settings) {
  const s = settings && typeof settings === "object" ? settings : {};
  const theme = normalizeTheme(s.uiTheme);
  const pref = normalizeColorScheme(s.uiColorScheme);
  const scheme = pref === "system" ? getSystemColorScheme() : pref;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.scheme = scheme;
  renderBrandLogo(FIXED_LOGO_VARIANT);
}

function getStoredProjectId() {
  try {
    return window.localStorage.getItem(STORAGE.lastProjectId) || "";
  } catch {
    return "";
  }
}

function clearStoredProjectId() {
  try {
    window.localStorage.removeItem(STORAGE.lastProjectId);
  } catch {
    // ignore
  }
}

function storeProjectId(id) {
  try {
    if (!id) return;
    window.localStorage.setItem(STORAGE.lastProjectId, id);
  } catch {
    // ignore
  }
}

function getStoredProjectFilterId() {
  try {
    return window.localStorage.getItem(STORAGE.projectFilterId) || "";
  } catch {
    return "";
  }
}

function storeProjectFilterId(id) {
  try {
    const v = String(id || "");
    if (!v) {
      window.localStorage.removeItem(STORAGE.projectFilterId);
      return;
    }
    window.localStorage.setItem(STORAGE.projectFilterId, v);
  } catch {
    // ignore
  }
}

function getStoredAgent() {
  try {
    return window.localStorage.getItem(STORAGE.lastAgent) || "";
  } catch {
    return "";
  }
}

function storeAgent(agent) {
  try {
    if (!agent) return;
    window.localStorage.setItem(STORAGE.lastAgent, agent);
  } catch {
    // ignore
  }
}

function normalizeHelperAgentSelection(value) {
  const s = String(value || "")
    .trim()
    .toLowerCase();
  if (s === "claude") return "claude";
  if (s === "codex") return "codex";
  return "";
}

function normalizeHelperModelValue(value) {
  return String(value || "")
    .trim()
    .slice(0, 160);
}

function helperContextValueForProjectId(projectId) {
  const id = String(projectId || "").trim();
  return id ? `${HELPER_CONTEXT_PROJECT_PREFIX}${id}` : HELPER_CONTEXT_GLOBAL_VALUE;
}

function helperProjectIdFromContextValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const low = raw.toLowerCase();
  if (low === HELPER_CONTEXT_GLOBAL_VALUE || low === "project") return "";
  if (!raw.startsWith(HELPER_CONTEXT_PROJECT_PREFIX)) return raw;
  return String(raw.slice(HELPER_CONTEXT_PROJECT_PREFIX.length) || "").trim();
}

function helperProjectById(projectId) {
  const id = String(projectId || "").trim();
  if (!id) return null;
  return state.projects.find((p) => p && String(p.id || "").trim() === id) || null;
}

function helperDefaultProjectIdForContext() {
  const selected = String(els.projectSelect && els.projectSelect.value ? els.projectSelect.value : "").trim();
  if (selected && selected !== "auto" && selected !== TEMP_PROJECT_OPTION_VALUE) {
    const hit = helperProjectById(selected);
    if (hit) return String(hit.id || "").trim();
    if (state.projects.length === 0) return selected;
  }

  const stored = String(getStoredProjectId() || "").trim();
  if (stored) {
    const hit = helperProjectById(stored);
    if (hit) return String(hit.id || "").trim();
    if (state.projects.length === 0) return stored;
  }

  if (state.projects.length === 1) {
    const only = state.projects[0];
    return only && only.id ? String(only.id).trim() : "";
  }
  return "";
}

function normalizeHelperContextScope(value, opts = {}) {
  const raw = String(value || "").trim();
  const fallbackProjectId = String(opts && opts.defaultProjectId ? opts.defaultProjectId : "").trim();
  const fallback = fallbackProjectId ? helperContextValueForProjectId(fallbackProjectId) : HELPER_CONTEXT_GLOBAL_VALUE;
  if (!raw) return HELPER_CONTEXT_GLOBAL_VALUE;

  const low = raw.toLowerCase();
  if (low === HELPER_CONTEXT_GLOBAL_VALUE) return HELPER_CONTEXT_GLOBAL_VALUE;
  if (low === "project") return fallback;

  const explicitProjectId = helperProjectIdFromContextValue(raw);
  if (explicitProjectId) return helperContextValueForProjectId(explicitProjectId);
  return HELPER_CONTEXT_GLOBAL_VALUE;
}

function getStoredHelperContextScope() {
  const fallbackProjectId = helperDefaultProjectIdForContext();
  try {
    const raw = window.localStorage.getItem(STORAGE.helperContextScope) || "";
    return normalizeHelperContextScope(raw, { defaultProjectId: fallbackProjectId });
  } catch {
    return fallbackProjectId ? helperContextValueForProjectId(fallbackProjectId) : HELPER_CONTEXT_GLOBAL_VALUE;
  }
}

function storeHelperContextScope(scope) {
  try {
    const fallbackProjectId = helperDefaultProjectIdForContext();
    const v = normalizeHelperContextScope(scope, { defaultProjectId: fallbackProjectId });
    window.localStorage.setItem(STORAGE.helperContextScope, v);
  } catch {
    // ignore
  }
}

function helperDefaultAgentFromSettings(settings = state.settings) {
  const s = settings && typeof settings === "object" ? settings : {};
  return normalizeHelperAgentSelection(s.helperDefaultAgent);
}

function helperDefaultModelFromSettings(settings = state.settings) {
  const s = settings && typeof settings === "object" ? settings : {};
  const raw = normalizeHelperModelValue(s.helperDefaultModel);
  if (raw) return raw;
  const agent = helperDefaultAgentFromSettings(s);
  return agent === "codex" ? "" : "opus";
}

function helperPersistHistoryFromSettings(settings = state.settings) {
  const s = settings && typeof settings === "object" ? settings : {};
  return s.helperPersistHistory !== false;
}

function normalizeHelperMessageItem(item) {
  if (!item || typeof item !== "object") return null;
  const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : "";
  if (!role) return null;
  const text = String(item.text || "").trim();
  if (!text) return null;
  return {
    id: typeof item.id === "string" ? item.id : safeUuid(),
    role,
    text: text.slice(0, HELPER_SESSION_TEXT_MAX),
    ts: typeof item.ts === "string" ? item.ts : new Date().toISOString(),
    agent: role === "assistant" ? normalizeHelperAgentSelection(item.agent) : "",
    model: role === "assistant" ? normalizeHelperModelValue(item.model) : ""
  };
}

function normalizeHelperMessages(messages, limit = HELPER_SESSION_MESSAGES_MAX) {
  const arr = Array.isArray(messages) ? messages : [];
  const out = [];
  for (const item of arr) {
    const next = normalizeHelperMessageItem(item);
    if (!next) continue;
    out.push(next);
    if (out.length >= limit) break;
  }
  return out;
}

function helperRunnerFromMessages(messages) {
  const arr = Array.isArray(messages) ? messages : [];
  for (let i = arr.length - 1; i >= 0; i--) {
    const m = arr[i];
    if (!m || m.role !== "assistant") continue;
    const agent = normalizeAgentKey(m.agent || "");
    if (agent) return agentDisplayName(agent);
  }
  return "";
}

function normalizeHelperSessionRecord(item) {
  if (!item || typeof item !== "object") return null;
  const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : safeUuid();
  const messages = normalizeHelperMessages(item.messages);
  const fallbackTs = new Date().toISOString();
  const createdAtRaw = typeof item.createdAt === "string" ? item.createdAt : "";
  const updatedAtRaw = typeof item.updatedAt === "string" ? item.updatedAt : "";
  const createdAt = createdAtRaw || (messages.length > 0 && messages[0].ts ? messages[0].ts : fallbackTs);
  const updatedAt = updatedAtRaw || (messages.length > 0 && messages[messages.length - 1].ts ? messages[messages.length - 1].ts : createdAt);
  const lastRunnerRaw = typeof item.lastRunner === "string" ? item.lastRunner.trim() : "";
  const lastRunner = lastRunnerRaw || helperRunnerFromMessages(messages);
  return { id, createdAt, updatedAt, lastRunner: lastRunner.slice(0, 64), messages };
}

function normalizeHelperSessions(sessions, activeSessionId = "") {
  const arr = Array.isArray(sessions) ? sessions : [];
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const next = normalizeHelperSessionRecord(item);
    if (!next) continue;
    if (seen.has(next.id)) continue;
    seen.add(next.id);
    out.push(next);
  }
  out.sort((a, b) => {
    const ta = Number(new Date(a.updatedAt || a.createdAt || 0).getTime()) || 0;
    const tb = Number(new Date(b.updatedAt || b.createdAt || 0).getTime()) || 0;
    return tb - ta;
  });

  let trimmed = out;
  if (out.length > HELPER_SESSION_MAX) {
    if (activeSessionId && out.some((s) => s.id === activeSessionId)) {
      const keep = out.filter((s) => s.id === activeSessionId).slice(0, 1);
      const rest = out.filter((s) => s.id !== activeSessionId).slice(0, HELPER_SESSION_MAX - 1);
      trimmed = [...keep, ...rest];
      trimmed.sort((a, b) => {
        const ta = Number(new Date(a.updatedAt || a.createdAt || 0).getTime()) || 0;
        const tb = Number(new Date(b.updatedAt || b.createdAt || 0).getTime()) || 0;
        return tb - ta;
      });
    } else {
      trimmed = out.slice(0, HELPER_SESSION_MAX);
    }
  }

  let active = String(activeSessionId || "").trim();
  if (!active || !trimmed.some((s) => s.id === active)) active = trimmed[0] ? trimmed[0].id : "";
  return { sessions: trimmed, activeSessionId: active };
}

function createHelperSessionRecord(opts = {}) {
  const now = new Date().toISOString();
  const rawMessages = Array.isArray(opts.messages) ? opts.messages : [];
  const messages = normalizeHelperMessages(rawMessages);
  const id = typeof opts.id === "string" && opts.id.trim() ? opts.id.trim() : safeUuid();
  return {
    id,
    createdAt: typeof opts.createdAt === "string" && opts.createdAt ? opts.createdAt : now,
    updatedAt: typeof opts.updatedAt === "string" && opts.updatedAt ? opts.updatedAt : now,
    lastRunner: typeof opts.lastRunner === "string" ? String(opts.lastRunner).trim().slice(0, 64) : helperRunnerFromMessages(messages),
    messages
  };
}

function clearStoredHelperHistory() {
  try {
    window.localStorage.removeItem(STORAGE.helperHistory);
    window.localStorage.removeItem(STORAGE.helperSessions);
  } catch {
    // ignore
  }
}

function storeHelperHistory(messages) {
  const out = normalizeHelperMessages(messages);
  if (out.length === 0) {
    clearStoredHelperHistory();
    return;
  }
  const seeded = createHelperSessionRecord({ messages: out });
  storeHelperSessions([seeded], seeded.id);
}

function getStoredHelperHistory() {
  try {
    const raw = window.localStorage.getItem(STORAGE.helperHistory) || "";
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : [];
    return normalizeHelperMessages(arr);
  } catch {
    return [];
  }
}

function storeHelperSessions(sessions, activeSessionId = "") {
  const normalized = normalizeHelperSessions(sessions, activeSessionId);
  try {
    if (!normalized.sessions || normalized.sessions.length === 0) {
      window.localStorage.removeItem(STORAGE.helperSessions);
      window.localStorage.removeItem(STORAGE.helperHistory);
      return;
    }
    window.localStorage.setItem(
      STORAGE.helperSessions,
      JSON.stringify({
        sessions: normalized.sessions,
        activeSessionId: normalized.activeSessionId
      })
    );
    // Keep key cleanup for migrated installs.
    window.localStorage.removeItem(STORAGE.helperHistory);
  } catch {
    // ignore
  }
}

function getStoredHelperSessions() {
  try {
    const raw = window.localStorage.getItem(STORAGE.helperSessions) || "";
    if (raw) {
      const parsed = JSON.parse(raw);
      const sessions = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray(parsed.sessions)
          ? parsed.sessions
          : [];
      const activeSessionId = parsed && typeof parsed === "object" ? String(parsed.activeSessionId || "").trim() : "";
      return normalizeHelperSessions(sessions, activeSessionId);
    }
  } catch {
    // ignore
  }

  const legacy = getStoredHelperHistory();
  if (!Array.isArray(legacy) || legacy.length === 0) return { sessions: [], activeSessionId: "" };
  const seeded = createHelperSessionRecord({
    messages: legacy,
    createdAt: legacy[0] && legacy[0].ts ? String(legacy[0].ts) : "",
    updatedAt: legacy[legacy.length - 1] && legacy[legacy.length - 1].ts ? String(legacy[legacy.length - 1].ts) : ""
  });
  const normalized = normalizeHelperSessions([seeded], seeded.id);
  storeHelperSessions(normalized.sessions, normalized.activeSessionId);
  return normalized;
}

function getStoredAgentBinariesToastAtMs() {
  try {
    return Number(window.localStorage.getItem(STORAGE.agentBinariesToastAt) || "0") || 0;
  } catch {
    return 0;
  }
}

function storeAgentBinariesToastAtMs(ms) {
  try {
    window.localStorage.setItem(STORAGE.agentBinariesToastAt, String(Number(ms) || 0));
  } catch {
    // ignore
  }
}

function getStoredOnboardingSeen() {
  try {
    return window.localStorage.getItem(STORAGE.onboardingSeen) === "1";
  } catch {
    return false;
  }
}

function storeOnboardingSeen() {
  try {
    window.localStorage.setItem(STORAGE.onboardingSeen, "1");
  } catch {
    // ignore
  }
}

function normalizeSortMode(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  return SORT_MODES.includes(v) ? v : "lane_newest";
}

function getStoredSortMode() {
  try {
    return window.localStorage.getItem(STORAGE.sortMode) || "";
  } catch {
    return "";
  }
}

function storeSortMode(mode) {
  try {
    if (!mode) return;
    window.localStorage.setItem(STORAGE.sortMode, mode);
  } catch {
    // ignore
  }
}

function getStoredDisplayMode() {
  try {
    return window.localStorage.getItem(STORAGE.displayMode) || "";
  } catch {
    return "";
  }
}

function storeDisplayMode(mode) {
  try {
    const v = normalizeDisplayMode(mode);
    window.localStorage.setItem(STORAGE.displayMode, v);
  } catch {
    // ignore
  }
}

function getStoredTableScope() {
  try {
    return window.localStorage.getItem(STORAGE.tableScope) || "";
  } catch {
    return "";
  }
}

function storeTableScope(scope) {
  try {
    const v = normalizeTableScope(scope);
    window.localStorage.setItem(STORAGE.tableScope, v);
  } catch {
    // ignore
  }
}

function getStoredSidebarCollapsed() {
  try {
    return window.localStorage.getItem(STORAGE.sidebarCollapsed) === "1";
  } catch {
    return false;
  }
}

function storeSidebarCollapsed(collapsed) {
  try {
    if (collapsed) {
      window.localStorage.setItem(STORAGE.sidebarCollapsed, "1");
    } else {
      window.localStorage.removeItem(STORAGE.sidebarCollapsed);
    }
  } catch {
    // ignore
  }
}

function isSidebarCollapsed() {
  return document.documentElement.dataset.sidebar === "collapsed";
}

function syncSidebarToggleBtn() {
  const collapsed = isSidebarCollapsed();
  const label = collapsed ? "Show sidebar" : "Hide sidebar";
  [els.toggleSidebarBtn, els.toggleSidebarCollapsedBtn].forEach((btn) => {
    if (!btn) return;
    btn.title = label;
    btn.setAttribute("aria-label", label);
    btn.setAttribute("aria-pressed", collapsed ? "true" : "false");
  });
}

function applySidebarCollapsed(collapsed) {
  if (collapsed) {
    document.documentElement.dataset.sidebar = "collapsed";
  } else {
    document.documentElement.removeAttribute("data-sidebar");
  }
  syncSidebarToggleBtn();
}

function toggleSidebarCollapsed() {
  const next = !isSidebarCollapsed();
  applySidebarCollapsed(next);
  storeSidebarCollapsed(next);
}

function getStoredComposerDraft() {
  try {
    return window.sessionStorage.getItem(STORAGE.composerDraft) || "";
  } catch {
    return "";
  }
}

function clearStoredComposerDraft() {
  try {
    window.sessionStorage.removeItem(STORAGE.composerDraft);
  } catch {
    // ignore
  }
}

function storeComposerDraft(text) {
  try {
    const t = String(text || "");
    if (!t) {
      clearStoredComposerDraft();
      return;
    }
    window.sessionStorage.setItem(STORAGE.composerDraft, t);
  } catch {
    // ignore
  }
}

function restoreComposerDraft() {
  if (!els.promptInput) return;
  if (String(els.promptInput.value || "").trim()) return;
  const draft = getStoredComposerDraft();
  if (!draft) return;
  els.promptInput.value = draft;
  try {
    els.promptInput.selectionStart = els.promptInput.selectionEnd = els.promptInput.value.length;
  } catch {
    // ignore
  }
}

function applyDefaultProjectSelection() {
  if (els.projectSelect.value) return;

  const stored = getStoredProjectId();
  if (stored && state.projects.some((p) => p.id === stored)) {
    els.projectSelect.value = stored;
    return;
  }

  if (state.projects.length === 1) {
    els.projectSelect.value = state.projects[0].id;
    storeProjectId(state.projects[0].id);
    return;
  }

  if (state.projects.length > 1) {
    els.projectSelect.value = "auto";
  }
}

function syncComposerCheckoutModeUi() {
  const sel = els.checkoutModeSelect;
  if (!sel) return;
  const projectId = String(els.projectSelect && els.projectSelect.value ? els.projectSelect.value : "").trim();
  if (projectId === state.composerCheckoutModeProjectId) return;
  state.composerCheckoutModeProjectId = projectId;

  // With Auto selection there is no single project to sync from (the backend will pick one from the prompt).
  // Disable the override to avoid forcing an accidental strategy onto an auto-picked project.
  if (!projectId || projectId === "auto") {
    sel.disabled = true;
    sel.value = "inplace";
    return;
  }

  const project = state.projects.find((p) => p && p.id === projectId) || null;
  if (!project) {
    sel.disabled = true;
    sel.value = "inplace";
    return;
  }

  const mode = normalizeCheckoutMode(project.checkoutMode);
  sel.disabled = false;
  sel.value = selectHasOptionValue(sel, mode) ? mode : "inplace";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeExternalUrl(rawUrl) {
  const u = String(rawUrl || "").trim();
  if (!u) return "";
  const low = u.toLowerCase();
  if (low.startsWith("https://") || low.startsWith("http://")) return u;
  return "";
}

function applyMarkdownInlineFormatting(escapedText) {
  let s = String(escapedText || "");
  // Bold before italics to support **_both_** patterns.
  s = s.replaceAll(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
  // Italics (underscore). Keep this before single-asterisk italics.
  s = s.replaceAll(/_(\S[\s\S]*?\S)_/g, "<em>$1</em>");
  // Italics (asterisk). Avoid list bullets by requiring a non-space right after '*'.
  s = s.replaceAll(/\*(\S[\s\S]*?\S)\*/g, "<em>$1</em>");
  return s;
}

function renderMarkdownInlineTextSafeHtml(text) {
  const s = String(text || "");
  if (!s) return "";

  // Support Markdown links: [label](https://example.com)
  // Keep it strict (http/https) to avoid navigation/XSS issues.
  // Parse links as complete tokens so literal '[' / ']' does not split emphasis spans.
  const out = [];
  const linkRe = /\[([^\]]*)\]\(([^)]*)\)/g;
  let i = 0;
  let m = null;

  while ((m = linkRe.exec(s)) !== null) {
    const whole = m[0];
    const label = m[1];
    const urlRaw = m[2];
    const at = typeof m.index === "number" ? m.index : -1;
    if (at < i) continue;

    if (at > i) {
      out.push(applyMarkdownInlineFormatting(escapeHtml(s.slice(i, at))));
    }

    const url = sanitizeExternalUrl(urlRaw);
    if (!url) {
      out.push(applyMarkdownInlineFormatting(escapeHtml(whole)));
      i = at + whole.length;
      continue;
    }

    const labelHtml = applyMarkdownInlineFormatting(escapeHtml(label));
    const href = escapeHtml(url);
    out.push(`<a class="md-link" href="${href}" rel="noreferrer noopener">${labelHtml}</a>`);
    i = at + whole.length;
  }

  if (i < s.length) out.push(applyMarkdownInlineFormatting(escapeHtml(s.slice(i))));
  return out.join("");
}

function renderMarkdownInlineSafeHtml(text) {
  const s = String(text || "");
  if (!s) return "";

  // Extract inline code spans into placeholders so emphasis can span across code,
  // then restore the code HTML afterwards.
  let textWithPlaceholders = "";
  const codeSpans = [];
  let i = 0;
  let tokenIdx = 0;

  const nextToken = () => {
    let token = "";
    do {
      token = `AHCODESPAN${tokenIdx}TOKEN`;
      tokenIdx += 1;
    } while (s.includes(token));
    return token;
  };

  while (i < s.length) {
    const start = s.indexOf("`", i);
    if (start === -1) {
      textWithPlaceholders += s.slice(i);
      break;
    }

    textWithPlaceholders += s.slice(i, start);

    const end = s.indexOf("`", start + 1);
    if (end === -1) {
      textWithPlaceholders += s.slice(start);
      break;
    }

    const token = nextToken();
    codeSpans.push({
      token,
      html: `<code class="md-inline">${escapeHtml(s.slice(start + 1, end))}</code>`
    });
    textWithPlaceholders += token;
    i = end + 1;
  }

  let out = renderMarkdownInlineTextSafeHtml(textWithPlaceholders);
  for (const span of codeSpans) {
    out = out.replaceAll(span.token, span.html);
  }
  return out;
}

function renderMarkdownCodeBlockHtml(code, info) {
  const lang = String(info || "").trim();
  const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : "";
  return `<pre class="md-code"${langAttr}><code>${escapeHtml(code)}</code></pre>`;
}

function renderMarkdownLineSafeHtml(line) {
  const t = String(line || "");

  // Headings (# ... ###### ...)
  const m = t.match(/^(#{1,6})\s+(.+)$/);
  if (m) {
    const lvl = m[1].length;
    const inner = renderMarkdownInlineSafeHtml(m[2]);
    return `<span class="md-heading md-h${lvl}">${inner}</span>`;
  }

  return renderMarkdownInlineSafeHtml(t);
}

function renderMarkdownSafeHtml(markdownText) {
  const raw = String(markdownText || "").replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  if (!raw) return "";

  // Support fenced code blocks (```lang ... ```). Everything else stays "inline",
  // relying on `.msg__text { white-space: pre-wrap; }` for newlines.
  const lines = raw.split("\n");
  let inFence = false;
  let fenceInfo = "";
  let fenceLines = [];
  let buf = [];
  const out = [];

  const flushBuf = () => {
    if (buf.length === 0) return;
    out.push(buf.map(renderMarkdownLineSafeHtml).join("\n"));
    buf = [];
  };

  for (const line of lines) {
    const t = String(line || "");
    const trimmed = t.trim();

    if (!inFence) {
      if (trimmed.startsWith("```")) {
        flushBuf();
        inFence = true;
        fenceInfo = trimmed.slice(3).trim();
        fenceLines = [];
        continue;
      }
      buf.push(t);
      continue;
    }

    if (trimmed.startsWith("```")) {
      out.push(renderMarkdownCodeBlockHtml(fenceLines.join("\n"), fenceInfo));
      inFence = false;
      fenceInfo = "";
      fenceLines = [];
      continue;
    }

    fenceLines.push(t);
  }

  if (inFence) {
    // Unterminated fence: render literally to avoid swallowing the rest of the message.
    buf.push("```" + (fenceInfo ? " " + fenceInfo : ""));
    buf.push(...fenceLines);
    flushBuf();
  } else {
    flushBuf();
  }

  return out.join("");
}

function normalizeHexColor(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  const s = raw.startsWith("#") ? raw.slice(1) : raw;
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s.toLowerCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    const r = s[0];
    const g = s[1];
    const b = s[2];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return "";
}

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tif", ".tiff"]);

function pathBaseName(p) {
  const s = String(p || "");
  const parts = s.split(/[/\\\\]/g);
  return parts[parts.length - 1] || s;
}

function encodeFileUrlPathSegment(seg) {
  // Keep the Windows drive letter segment readable/stable.
  if (/^[a-zA-Z]:$/.test(seg)) return seg;
  return encodeURIComponent(seg);
}

function fileUrlForPath(p) {
  const raw = String(p || "").trim();
  if (!raw) return "";
  if (/^file:\/\//i.test(raw) || /^data:/i.test(raw) || /^blob:/i.test(raw)) return raw;

  const normalized = raw.replaceAll("\\", "/");

  // UNC paths: \\server\share\file.png -> file://server/share/file.png
  if (normalized.startsWith("//")) {
    const parts = normalized.slice(2).split("/").map(encodeFileUrlPathSegment).join("/");
    return `file://${parts}`;
  }

  // Drive letter paths: C:\foo\bar.png -> file:///C:/foo/bar.png
  if (/^[a-zA-Z]:\//.test(normalized)) {
    const parts = normalized.split("/").map(encodeFileUrlPathSegment).join("/");
    return `file:///${parts}`;
  }

  // POSIX absolute paths: /Users/me/a.png -> file:///Users/me/a.png
  if (normalized.startsWith("/")) {
    const parts = normalized.split("/").map(encodeFileUrlPathSegment).join("/");
    return `file://${parts}`;
  }

  // Fallback: treat as a path-like value.
  const parts = normalized.split("/").map(encodeFileUrlPathSegment).join("/");
  return `file://${parts}`;
}

function looksLikeImageFileName(name) {
  const s = String(name || "").toLowerCase();
  for (const ext of IMAGE_EXTS) {
    if (s.endsWith(ext)) return true;
  }
  return false;
}

function normalizePathList(list) {
  const arr = Array.isArray(list) ? list : [];
  const out = [];
  for (const v of arr) {
    const p = typeof v === "string" ? v.trim() : "";
    if (!p) continue;
    out.push(p);
  }
  return [...new Set(out)];
}

function normalizeImageList(list) {
  return normalizePathList(list);
}

function normalizeFileList(list) {
  return normalizePathList(list);
}

function mergeImages(existing, added, maxCount = 8) {
  const out = normalizeImageList([...(existing || []), ...(added || [])]);
  return out.slice(0, Math.max(0, maxCount));
}

function mergeFiles(existing, added, maxCount = 24) {
  const out = normalizeFileList([...(existing || []), ...(added || [])]);
  return out.slice(0, Math.max(0, maxCount));
}

function dataTransferHasFiles(dt) {
  if (!dt) return false;
  try {
    const types = dt.types ? Array.from(dt.types) : [];
    if (types.includes("Files")) return true;
    const items = dt.items ? Array.from(dt.items) : [];
    for (const it of items) {
      if (it && it.kind === "file") return true;
    }
    return false;
  } catch {
    return false;
  }
}

function droppedFileEntries(e) {
  const dt = e && e.dataTransfer ? e.dataTransfer : null;
  const files = dt && dt.files ? Array.from(dt.files) : [];
  const out = new Map();

  for (const f of files) {
    // Electron 35 + sandboxed renderers: File.path may be empty; ask preload via webUtils.
    let p = typeof f.path === "string" ? f.path : "";
    if (!p && api && typeof api.getPathForFile === "function") {
      try {
        p = String(api.getPathForFile(f) || "");
      } catch {
        p = "";
      }
    }
    const name = typeof f.name === "string" ? f.name : p;
    const type = typeof f.type === "string" ? f.type : "";
    if (!p) continue;
    const normalizedPath = String(p || "").trim();
    if (!normalizedPath) continue;
    const isImage = type.startsWith("image/") || looksLikeImageFileName(name);
    if (out.has(normalizedPath)) {
      const prev = out.get(normalizedPath);
      prev.isImage = prev.isImage || isImage;
      continue;
    }
    out.set(normalizedPath, { path: normalizedPath, isImage });
  }

  return Array.from(out.values());
}

function imagePathsFromDroppedEntries(entries) {
  const arr = Array.isArray(entries) ? entries : [];
  return normalizeImageList(
    arr
      .filter((f) => f && f.isImage)
      .map((f) => (f && typeof f.path === "string" ? f.path : ""))
  );
}

function nonImagePathsFromDroppedEntries(entries) {
  const arr = Array.isArray(entries) ? entries : [];
  return normalizeFileList(
    arr
      .filter((f) => f && !f.isImage)
      .map((f) => (f && typeof f.path === "string" ? f.path : ""))
  );
}

function fileAttachmentTypeLabel(path) {
  const base = pathBaseName(path);
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot >= base.length - 1) return "FILE";
  const ext = base
    .slice(dot + 1)
    .replaceAll(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  if (!ext) return "FILE";
  return ext.length <= 4 ? ext : ext.slice(0, 4);
}

function buildPromptWithFileAttachments(promptText, files) {
  const base = String(promptText || "").trim();
  const arr = normalizeFileList(files);
  if (arr.length === 0) return base;
  const block = `Attached files:\n${arr.map((p) => `- ${p}`).join("\n")}`;
  return base ? `${base}\n\n${block}` : block;
}

function normalizePromptPathSuggestQuery(raw) {
  let q = String(raw || "").trim();
  if (!q) return "";
  q = q.replaceAll("\\", "/");
  while (q.startsWith("./")) q = q.slice(2);
  while (q.startsWith("/")) q = q.slice(1);
  while (q.startsWith("~/")) q = q.slice(2);
  while (q.startsWith("../")) q = q.slice(3);
  q = q.replaceAll(/\/{2,}/g, "/");
  return q;
}

function selectedComposerProjectForPathSuggest() {
  if (!els.projectSelect) return null;
  const projectId = String(els.projectSelect.value || "").trim();
  if (!projectId || projectId === "auto") return null;
  const project = state.projects.find((p) => p && p.id === projectId) || null;
  if (!project || typeof project.path !== "string" || !project.path.trim()) return null;
  return { id: projectId, path: project.path.trim() };
}

function promptPathTokenAtCursor(inputEl) {
  if (!inputEl) return null;
  const value = String(inputEl.value || "");
  const cursorStart = Number.isFinite(inputEl.selectionStart) ? inputEl.selectionStart : value.length;
  const cursorEnd = Number.isFinite(inputEl.selectionEnd) ? inputEl.selectionEnd : cursorStart;
  if (cursorStart !== cursorEnd) return null;

  const end = Math.max(0, Math.min(value.length, cursorStart));
  let start = end;
  while (start > 0) {
    const ch = value[start - 1];
    if (
      ch === " " ||
      ch === "\n" ||
      ch === "\t" ||
      ch === '"' ||
      ch === "'" ||
      ch === "`" ||
      ch === "(" ||
      ch === ")" ||
      ch === "[" ||
      ch === "]" ||
      ch === "{" ||
      ch === "}" ||
      ch === "," ||
      ch === ";"
    ) {
      break;
    }
    start -= 1;
  }

  const rawToken = value.slice(start, end);
  if (!rawToken) return null;

  const low = rawToken.toLowerCase();
  if (/^[a-z][a-z0-9+.-]*:\/\//.test(low)) return null;

  if (rawToken.startsWith("@")) {
    return {
      start,
      end,
      mode: "attach",
      rawToken,
      query: normalizePromptPathSuggestQuery(rawToken.slice(1))
    };
  }

  const looksPathLike =
    rawToken.includes("/") ||
    rawToken.includes("\\") ||
    rawToken.startsWith("./") ||
    rawToken.startsWith("../") ||
    rawToken.startsWith("~/") ||
    rawToken.startsWith("/");
  if (!looksPathLike) return null;

  return {
    start,
    end,
    mode: "insert",
    rawToken,
    query: normalizePromptPathSuggestQuery(rawToken)
  };
}

function normalizePromptPathSuggestItems(items) {
  const arr = Array.isArray(items) ? items : [];
  const out = [];
  const seen = new Set();

  for (const it of arr) {
    if (!it || typeof it !== "object") continue;
    const pathText = String(it.path || "").trim().replaceAll("\\", "/").replaceAll(/^\.\//g, "");
    const absPath = String(it.absPath || "").trim();
    if (!pathText || !absPath || seen.has(pathText)) continue;
    seen.add(pathText);
    out.push({ path: pathText, absPath });
  }
  return out;
}

function closePromptPathSuggest() {
  if (promptPathSuggestTimer) {
    clearTimeout(promptPathSuggestTimer);
    promptPathSuggestTimer = null;
  }
  promptPathSuggestState.open = false;
  promptPathSuggestState.mode = "insert";
  promptPathSuggestState.items = [];
  promptPathSuggestState.activeIndex = 0;

  if (!els.promptPathSuggest) return;
  els.promptPathSuggest.hidden = true;
  els.promptPathSuggest.innerHTML = "";
}

function renderPromptPathSuggest() {
  const menuEl = els.promptPathSuggest;
  if (!menuEl) return;

  const items = Array.isArray(promptPathSuggestState.items) ? promptPathSuggestState.items : [];
  if (!promptPathSuggestState.open || items.length === 0) {
    menuEl.hidden = true;
    menuEl.innerHTML = "";
    return;
  }

  const activeIndex = Math.max(0, Math.min(items.length - 1, Number(promptPathSuggestState.activeIndex) || 0));
  promptPathSuggestState.activeIndex = activeIndex;
  const modeBadge = promptPathSuggestState.mode === "attach" ? "attach" : "insert";

  menuEl.innerHTML = items
    .map((it, idx) => {
      const p = String(it && it.path ? it.path : "");
      const base = pathBaseName(p);
      const secondary = base && base !== p ? base : "";
      const activeCls = idx === activeIndex ? " combo__item--active" : "";
      return `
        <button type="button" class="combo__item${activeCls}" data-idx="${idx}">
          <span class="combo__itemMain">
            <span class="combo__itemValue">${escapeHtml(p)}</span>
            ${secondary ? `<span class="combo__itemLabel">${escapeHtml(secondary)}</span>` : ""}
          </span>
          <span class="combo__badge combo__badge--recent">${modeBadge}</span>
        </button>
      `.trim();
    })
    .join("");
  menuEl.hidden = false;

  const activeEl = menuEl.querySelector(`.combo__item[data-idx="${activeIndex}"]`);
  if (activeEl && typeof activeEl.scrollIntoView === "function") {
    try {
      activeEl.scrollIntoView({ block: "nearest" });
    } catch {
      // ignore
    }
  }
}

function movePromptPathSuggestSelection(delta) {
  if (!promptPathSuggestState.open) return;
  const items = Array.isArray(promptPathSuggestState.items) ? promptPathSuggestState.items : [];
  if (items.length === 0) return;
  const cur = Math.max(0, Math.min(items.length - 1, Number(promptPathSuggestState.activeIndex) || 0));
  const next = Math.max(0, Math.min(items.length - 1, cur + Number(delta || 0)));
  if (next === cur) return;
  promptPathSuggestState.activeIndex = next;
  renderPromptPathSuggest();
}

function applyPromptPathSuggestSelection(indexOverride) {
  const inputEl = els.promptInput;
  if (!inputEl || !promptPathSuggestState.open) return false;

  const items = Array.isArray(promptPathSuggestState.items) ? promptPathSuggestState.items : [];
  if (items.length === 0) return false;

  const idxRaw = Number.isFinite(indexOverride) ? Number(indexOverride) : promptPathSuggestState.activeIndex;
  const idx = Math.max(0, Math.min(items.length - 1, Number.isFinite(idxRaw) ? idxRaw : 0));
  const item = items[idx];
  if (!item) return false;

  const token = promptPathTokenAtCursor(inputEl);
  if (!token) {
    closePromptPathSuggest();
    return false;
  }

  const before = String(inputEl.value || "").slice(0, token.start);
  const after = String(inputEl.value || "").slice(token.end);
  const insert = `${item.path} `;
  inputEl.value = `${before}${insert}${after}`;
  const nextCursor = before.length + insert.length;

  try {
    inputEl.focus();
    inputEl.selectionStart = inputEl.selectionEnd = nextCursor;
  } catch {
    // ignore
  }

  if (token.mode === "attach" && item.absPath) {
    setComposerFiles(mergeFiles(state.composerFiles, [item.absPath]));
  }

  try {
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
  } catch {
    storeComposerDraft(inputEl.value || "");
  }

  closePromptPathSuggest();
  return true;
}

async function refreshPromptPathSuggest() {
  const inputEl = els.promptInput;
  if (!inputEl || !api || typeof api.projectsSuggestPaths !== "function") {
    closePromptPathSuggest();
    return;
  }

  const token = promptPathTokenAtCursor(inputEl);
  if (!token) {
    closePromptPathSuggest();
    return;
  }

  const project = selectedComposerProjectForPathSuggest();
  if (!project) {
    closePromptPathSuggest();
    return;
  }

  const reqSeq = ++promptPathSuggestReqSeq;
  let rawItems = [];
  try {
    rawItems = await api.projectsSuggestPaths(project.id, token.query, PROMPT_PATH_SUGGEST_LIMIT);
  } catch {
    rawItems = [];
  }
  if (reqSeq !== promptPathSuggestReqSeq) return;

  const currentToken = promptPathTokenAtCursor(inputEl);
  if (!currentToken) {
    closePromptPathSuggest();
    return;
  }
  if (currentToken.start !== token.start || currentToken.end !== token.end || currentToken.mode !== token.mode || currentToken.query !== token.query) {
    return;
  }

  const items = normalizePromptPathSuggestItems(rawItems);
  if (items.length === 0) {
    closePromptPathSuggest();
    return;
  }

  const prevPath =
    promptPathSuggestState.items &&
    promptPathSuggestState.items[promptPathSuggestState.activeIndex] &&
    promptPathSuggestState.items[promptPathSuggestState.activeIndex].path
      ? promptPathSuggestState.items[promptPathSuggestState.activeIndex].path
      : "";

  let activeIndex = 0;
  if (prevPath) {
    const prevIdx = items.findIndex((it) => it && it.path === prevPath);
    if (prevIdx >= 0) activeIndex = prevIdx;
  }

  promptPathSuggestState.open = true;
  promptPathSuggestState.mode = currentToken.mode;
  promptPathSuggestState.items = items;
  promptPathSuggestState.activeIndex = activeIndex;
  renderPromptPathSuggest();
}

function schedulePromptPathSuggestRefresh(opts = {}) {
  const immediate = !!(opts && opts.immediate);
  if (promptPathSuggestTimer) {
    clearTimeout(promptPathSuggestTimer);
    promptPathSuggestTimer = null;
  }
  if (immediate) {
    void refreshPromptPathSuggest();
    return;
  }
  promptPathSuggestTimer = window.setTimeout(() => {
    promptPathSuggestTimer = null;
    void refreshPromptPathSuggest();
  }, PROMPT_PATH_SUGGEST_DEBOUNCE_MS);
}

function handlePromptPathSuggestKeyDown(e) {
  if (!promptPathSuggestState.open) return false;
  if (e.metaKey || e.ctrlKey || e.altKey) return false;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    movePromptPathSuggestSelection(1);
    return true;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    movePromptPathSuggestSelection(-1);
    return true;
  }

  if ((e.key === "Enter" || e.key === "Tab") && !e.shiftKey) {
    e.preventDefault();
    applyPromptPathSuggestSelection();
    return true;
  }

  if (e.key === "Escape") {
    e.preventDefault();
    closePromptPathSuggest();
    return true;
  }

  return false;
}

function renderAttachmentBadge(badgeEl, { images, files } = {}) {
  if (!badgeEl) return;
  const imageCount = Array.isArray(images) ? images.length : 0;
  const fileCount = Array.isArray(files) ? files.length : 0;
  if (imageCount <= 0 && fileCount <= 0) {
    badgeEl.hidden = true;
    badgeEl.textContent = "";
    return;
  }
  const parts = [];
  if (imageCount > 0) parts.push(`IMG ${imageCount}`);
  if (fileCount > 0) parts.push(`FILE ${fileCount}`);
  badgeEl.hidden = false;
  badgeEl.textContent = `[${parts.join(" | ")}]`;
}

function wireAttachmentThumbs(rootEl) {
  if (!rootEl || !rootEl.querySelectorAll) return;
  const imgs = Array.from(rootEl.querySelectorAll("img.attachthumb__img"));

  for (const img of imgs) {
    if (img.__agentHeavenWired) continue;
    img.__agentHeavenWired = true;

    img.addEventListener(
      "error",
      () => {
        const wrap = img.closest ? img.closest(".attachthumb") : null;
        if (wrap) wrap.classList.add("attachthumb--broken");
      },
      { once: true }
    );
  }
}

function openImageDialogForSrc(src, title) {
  const s = String(src || "").trim();
  if (!s || !els.imageDialog || !els.imageDialogImg) return;
  const t = String(title || "").trim();
  if (els.imageDialogTitle) els.imageDialogTitle.textContent = t || "Image";
  els.imageDialogImg.src = s;
  els.imageDialogImg.alt = t || "Image";
  try {
    els.imageDialog.showModal();
  } catch {
    // ignore
  }
}

function openImageDialogForThumbEl(targetEl) {
  const el = targetEl && targetEl.closest ? targetEl.closest(".attachthumb") : null;
  if (!el || !el.querySelector) return;
  if (el.classList && el.classList.contains("attachthumb--broken")) return;
  const img = el.querySelector("img.attachthumb__img");
  if (!img) return;
  const src = img.getAttribute("src") || img.currentSrc || "";
  const title = img.getAttribute("alt") || "";
  openImageDialogForSrc(src, title);
}

function renderAttachmentChips(containerEl, images, files, opts = {}) {
  if (!containerEl) return;
  const imageArr = Array.isArray(images) ? images : [];
  const fileArr = Array.isArray(files) ? files : [];
  if (imageArr.length === 0 && fileArr.length === 0) {
    containerEl.innerHTML = "";
    return;
  }

  const removable = !!opts.removable;
  const imageRemoveAttr = typeof opts.imageRemoveAttr === "string" ? opts.imageRemoveAttr : "";
  const imageRemoveLabel = typeof opts.imageRemoveLabel === "string" ? opts.imageRemoveLabel : "Remove image";
  const fileRemoveAttr = typeof opts.fileRemoveAttr === "string" ? opts.fileRemoveAttr : "";
  const fileRemoveLabel = typeof opts.fileRemoveLabel === "string" ? opts.fileRemoveLabel : "Remove file";

  const imageHtml = imageArr
    .map((p, idx) => {
      const name = pathBaseName(p);
      const src = fileUrlForPath(p);
      const rm =
        removable && imageRemoveAttr
          ? `<button type="button" class="attachthumb__x" data-${imageRemoveAttr}="${idx}" aria-label="${escapeHtml(imageRemoveLabel)}">&times;</button>`
          : "";
      return `
        <div class="attachthumb">
          <img class="attachthumb__img" src="${escapeHtml(src)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async" />
          <div class="attachthumb__bar">
            <span class="attachthumb__name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
            ${rm}
          </div>
        </div>
      `.trim();
    })
    .join("");

  const fileHtml = fileArr
    .map((p, idx) => {
      const name = pathBaseName(p);
      const kind = fileAttachmentTypeLabel(p);
      const rm =
        removable && fileRemoveAttr
          ? `<button type="button" class="attachthumb__x" data-${fileRemoveAttr}="${idx}" aria-label="${escapeHtml(fileRemoveLabel)}">&times;</button>`
          : "";
      return `
        <div class="attachfile">
          <div class="attachfile__kind" aria-hidden="true">${escapeHtml(kind)}</div>
          <div class="attachfile__meta">
            <span class="attachfile__name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
            <span class="attachfile__path" title="${escapeHtml(p)}">${escapeHtml(p)}</span>
          </div>
          ${rm}
        </div>
      `.trim();
    })
    .join("");

  containerEl.innerHTML = `${imageHtml}${fileHtml}`;
  wireAttachmentThumbs(containerEl);
}

function renderComposerAttachments() {
  renderAttachmentBadge(els.promptBadge, { images: state.composerImages, files: state.composerFiles });
  renderAttachmentChips(els.promptAttachments, state.composerImages, state.composerFiles, {
    removable: true,
    imageRemoveAttr: "remove-composer-image",
    imageRemoveLabel: "Remove attached image",
    fileRemoveAttr: "remove-composer-file",
    fileRemoveLabel: "Remove attached file"
  });
}

function renderFollowupAttachments() {
  renderAttachmentBadge(els.followupBadge, { images: state.followupImages, files: state.followupFiles });
  renderAttachmentChips(els.followupAttachments, state.followupImages, state.followupFiles, {
    removable: true,
    imageRemoveAttr: "remove-followup-image",
    imageRemoveLabel: "Remove attached image",
    fileRemoveAttr: "remove-followup-file",
    fileRemoveLabel: "Remove attached file"
  });
}

function setComposerImages(images) {
  state.composerImages = normalizeImageList(images);
  renderComposerAttachments();
}

function setComposerFiles(files) {
  state.composerFiles = normalizeFileList(files);
  renderComposerAttachments();
}

function setFollowupImages(images) {
  state.followupImages = normalizeImageList(images);
  renderFollowupAttachments();
  scheduleAutosizeFollowupInput();
}

function setFollowupFiles(files) {
  state.followupFiles = normalizeFileList(files);
  renderFollowupAttachments();
  scheduleAutosizeFollowupInput();
}

function attachmentChipsHtml(images) {
  const arr = Array.isArray(images) ? images : [];
  if (arr.length === 0) return "";

  const thumbs = arr
    .map((p) => {
      const name = pathBaseName(p);
      const src = fileUrlForPath(p);
      return `
        <div class="attachthumb">
          <img class="attachthumb__img" src="${escapeHtml(src)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async" />
          <div class="attachthumb__bar">
            <span class="attachthumb__name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
          </div>
        </div>
      `.trim();
    })
    .join("");

  return `<div class="attachments attachments--thumbs">${thumbs}</div>`;
}

function stripAnsi(s) {
  // Good-enough ANSI stripping for terminal-ish output.
  return String(s || "").replaceAll(/\x1b\[[0-9;]*m/g, "");
}

function truncateText(s, maxLen) {
  const t = String(s || "");
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

function jobStartMs(job) {
  if (!job) return NaN;
  const startedAt = typeof job.startedAt === "string" ? job.startedAt : "";
  const createdAt = typeof job.createdAt === "string" ? job.createdAt : "";
  const t0 = Date.parse(startedAt || createdAt || "");
  return Number.isFinite(t0) ? t0 : NaN;
}

function fmtElapsed(ms) {
  const totalSec = Math.max(0, Math.floor((Number(ms) || 0) / 1000));

  if (totalSec < 60) return `${totalSec}s`;

  const totalMin = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (totalMin < 60) return `${totalMin}m ${String(sec).padStart(2, "0")}s`;

  const hours = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return `${hours}h ${String(min).padStart(2, "0")}m`;
}

function fmtClock(ms) {
  const t = Number(ms);
  if (!Number.isFinite(t)) return "";
  const d = new Date(t);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// Relative offset without unit letters, e.g. "5:17" or "1:02:03".
function fmtOffset(ms) {
  const totalSec = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const sec = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const min = totalMin % 60;
  const hours = Math.floor(totalMin / 60);
  if (hours > 0) return `${hours}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${totalMin}:${String(sec).padStart(2, "0")}`;
}

function jobElapsedText(job, nowMs = Date.now()) {
  const t0 = jobStartMs(job);
  if (!Number.isFinite(t0)) return "";
  return fmtElapsed(Math.max(0, nowMs - t0));
}

function jobDurationText(job, nowMs = Date.now()) {
  const t0 = jobStartMs(job);
  if (!Number.isFinite(t0)) return "";
  const finishedAt = job && typeof job.finishedAt === "string" ? job.finishedAt : "";
  const t1 = Date.parse(finishedAt || "");
  const endMs = job && job.status === "running" ? nowMs : Number.isFinite(t1) ? t1 : nowMs;
  return fmtElapsed(Math.max(0, endMs - t0));
}

function isoMs(value) {
  const s = typeof value === "string" ? value : "";
  if (!s) return NaN;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : NaN;
}

function jobCreatedMs(job) {
  return isoMs(job && typeof job.createdAt === "string" ? job.createdAt : "");
}

function jobDurationMs(job, nowMs = Date.now()) {
  const t0 = jobStartMs(job);
  if (!Number.isFinite(t0)) return NaN;

  const finishedAt = job && typeof job.finishedAt === "string" ? job.finishedAt : "";
  const t1 = isoMs(finishedAt);
  const endMs = job && job.status === "running" ? nowMs : Number.isFinite(t1) ? t1 : nowMs;
  return Math.max(0, endMs - t0);
}

function laneKindForLaneEl(laneEl) {
  if (state.view === "archive") {
    if (laneEl === els.laneRunning) return "archived";
    return "";
  }
  if (state.view === "trash") {
    if (laneEl === els.laneRunning) return "trash";
    return "";
  }

  // state.view === "board"
  if (laneEl === els.laneRunning) return "running";
  if (laneEl === els.laneAttention) return "attention";
  if (laneEl === els.laneDone) return "done";
  return "";
}

function jobLaneEnteredMs(job, laneKind) {
  const kind = String(laneKind || "");

  if (state.view === "archive") {
    const t = isoMs(job && typeof job.archivedAt === "string" ? job.archivedAt : "");
    if (Number.isFinite(t)) return t;
    return jobCreatedMs(job);
  }

  if (state.view === "trash") {
    const t = isoMs(job && typeof job.trashedAt === "string" ? job.trashedAt : "");
    if (Number.isFinite(t)) return t;
    return jobCreatedMs(job);
  }

  // state.view === "board"
  if (kind === "running") {
    const t = isoMs(job && typeof job.startedAt === "string" ? job.startedAt : "");
    if (Number.isFinite(t)) return t;
    return jobStartMs(job);
  }

  if (kind === "attention" || kind === "done") {
    const t = isoMs(job && typeof job.finishedAt === "string" ? job.finishedAt : "");
    if (Number.isFinite(t)) return t;
    return jobStartMs(job);
  }

  return jobCreatedMs(job);
}

function cmpNumDir(a, b, dir) {
  const d = String(dir || "").toLowerCase() === "asc" ? "asc" : "desc";
  const ax = Number.isFinite(a) ? a : d === "desc" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  const bx = Number.isFinite(b) ? b : d === "desc" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  if (ax < bx) return d === "asc" ? -1 : 1;
  if (ax > bx) return d === "asc" ? 1 : -1;
  return 0;
}

function cmpJobsForLane(a, b, laneKind) {
  const mode = normalizeSortMode(state.sortMode);
  const kind = String(laneKind || "");

  let d = 0;

  if (mode === "duration_longest") {
    d = cmpNumDir(jobDurationMs(a), jobDurationMs(b), "desc");
  } else if (mode === "created_newest") {
    d = cmpNumDir(jobCreatedMs(a), jobCreatedMs(b), "desc");
  } else if (mode === "created_oldest") {
    d = cmpNumDir(jobCreatedMs(a), jobCreatedMs(b), "asc");
  } else if (mode === "lane_oldest") {
    d = cmpNumDir(jobLaneEnteredMs(a, kind), jobLaneEnteredMs(b, kind), "asc");
  } else {
    // lane_newest (default)
    d = cmpNumDir(jobLaneEnteredMs(a, kind), jobLaneEnteredMs(b, kind), "desc");
  }

  if (d) return d;

  // Stable-ish fallback ordering.
  d = cmpNumDir(jobCreatedMs(a), jobCreatedMs(b), "desc");
  if (d) return d;

  const aid = String(a && a.id ? a.id : "");
  const bid = String(b && b.id ? b.id : "");
  return aid.localeCompare(bid);
}

function sortJobsForLane(jobs, laneKind) {
  const arr = Array.isArray(jobs) ? [...jobs] : [];
  arr.sort((a, b) => cmpJobsForLane(a, b, laneKind));
  return arr;
}

function toIntOrZero(value) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function fmtTokCompact(n) {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return "?";
  const abs = Math.abs(x);
  if (abs < 1000) return String(Math.trunc(x));
  if (abs < 10_000) return `${(x / 1000).toFixed(1)}k`;
  if (abs < 1_000_000) return `${Math.round(x / 1000)}k`;
  if (abs < 10_000_000) return `${(x / 1_000_000).toFixed(1)}m`;
  return `${Math.round(x / 1_000_000)}m`;
}

function fmtPctCompact(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "?";
  if (Math.abs(n) >= 100) return `${Math.round(n)}%`;
  if (Math.abs(n) >= 10) return `${n.toFixed(1)}%`;
  return `${n.toFixed(2)}%`;
}

function jobTokenTotals(job) {
  if (!job || typeof job !== "object") return null;

  const ut = job.usageTotal && typeof job.usageTotal === "object" ? job.usageTotal : null;
  const turns = ut ? toIntOrZero(ut.turns) : 0;
  if (ut && turns > 0) {
    return {
      input_tokens: toIntOrZero(ut.input_tokens),
      output_tokens: toIntOrZero(ut.output_tokens),
      turns
    };
  }

  const u = job.usage && typeof job.usage === "object" ? job.usage : null;
  if (!u) return null;
  return {
    input_tokens: u.input_tokens,
    output_tokens: u.output_tokens,
    turns: 1
  };
}

function normalizeAgentKey(value) {
  const s = String(value || "")
    .trim()
    .toLowerCase();
  if (s === "claude" || s === "anthropic") return "claude";
  // Migration/default: historical jobs were Codex-only.
  return "codex";
}

function agentDisplayName(agentKey) {
  const a = normalizeAgentKey(agentKey);
  if (a === "claude") return "Claude";
  return "Codex";
}

function normalizeModelKey(value) {
  const s = String(value || "").trim();
  return s || "(default)";
}

function makeUsageBucket() {
  return { jobs: 0, input_tokens: 0, output_tokens: 0, turns: 0 };
}

function addToUsageBucket(bucket, totals) {
  const b = bucket && typeof bucket === "object" ? bucket : makeUsageBucket();
  const t = totals && typeof totals === "object" ? totals : {};
  b.jobs += 1;
  b.input_tokens += toIntOrZero(t.input_tokens);
  b.output_tokens += toIntOrZero(t.output_tokens);
  b.turns += toIntOrZero(t.turns);
  return b;
}

function aggregateTokenUsage(jobs) {
  const arr = Array.isArray(jobs) ? jobs : [];
  const out = {
    jobsTotal: arr.length,
    jobsWithUsage: 0,
    input_tokens: 0,
    output_tokens: 0,
    turns: 0,
    byAgent: new Map(),
    byModel: new Map()
  };

  for (const j of arr) {
    const t = jobTokenTotals(j);
    if (!t) continue;

    out.jobsWithUsage += 1;
    out.input_tokens += toIntOrZero(t.input_tokens);
    out.output_tokens += toIntOrZero(t.output_tokens);
    out.turns += toIntOrZero(t.turns);

    const agent = normalizeAgentKey(j && j.agent);
    const model = normalizeModelKey(j && j.model);

    out.byAgent.set(agent, addToUsageBucket(out.byAgent.get(agent), t));
    out.byModel.set(model, addToUsageBucket(out.byModel.get(model), t));
  }

  return out;
}

function jobTokensCardText(job) {
  const t = jobTokenTotals(job);
  if (!t) return null;
  const inTok = t.input_tokens;
  const outTok = t.output_tokens;
  const turns = toIntOrZero(t.turns);
  const text = `tok in=${fmtTokCompact(inTok)} out=${fmtTokCompact(outTok)}${turns > 1 ? ` (${turns}t)` : ""}`;
  const title = `tokens in=${inTok ?? "?"} out=${outTok ?? "?"}${turns > 1 ? ` turns=${turns}` : ""}`;
  return { text, title };
}

function oneLine(s) {
  return stripAnsi(String(s || "")).replaceAll(/\s+/g, " ").trim();
}

function jobDisplayTitle(job) {
  const JOB_TITLE_MAX_LEN = 120;
  const llmTitle = job && typeof job.titleLlm === "string" ? oneLine(job.titleLlm) : "";
  if (llmTitle) return truncateText(llmTitle, JOB_TITLE_MAX_LEN);

  const fallback = job && typeof job.title === "string" ? oneLine(job.title) : "";
  if (fallback) return truncateText(fallback, JOB_TITLE_MAX_LEN);
  return "Untitled";
}

function isNoisyLogLine(text) {
  const s = String(text || "");
  if (!s) return false;
  // Codex internal noise we've observed on startup.
  if (/state db missing rollout path/i.test(s)) return true;
  if (/codex_core::rollout::list/i.test(s)) return true;
  return false;
}

function shortShellCommand(cmd) {
  const s = String(cmd || "").trim();
  // Common form in codex events: "/bin/zsh -lc <cmd>".
  const m = s.match(/\s-lc\s([\s\S]+)$/);
  return m ? m[1].trim() : s;
}

function tailLines(text, maxLines, maxLineLen) {
  const raw = stripAnsi(String(text || ""))
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .split("\n");
  const out = [];
  const want = Math.max(0, Number(maxLines) || 0);
  const maxLen = Math.max(16, Number(maxLineLen) || 160);

  for (let i = raw.length - 1; i >= 0 && out.length < want; i -= 1) {
    const ln = String(raw[i] || "").trimEnd();
    if (!ln.trim()) continue;
    out.push(truncateText(ln, maxLen));
  }

  out.reverse();
  return out;
}

function prefixEveryNonEmptyLine(text, prefix) {
  const p = String(prefix || "");
  if (!p) return String(text || "");
  return String(text || "")
    .split("\n")
    .map((ln) => (String(ln || "").trim() ? `${p}${ln}` : ln))
    .join("\n");
}

function summarizeCodexEvent(data) {
  const d = data || {};
  const type = d.type;

  if (type === "item.started" && d.item && d.item.type === "command_execution") {
    const cmd = shortShellCommand(d.item.command);
    return truncateText(`$ ${oneLine(cmd)}`, 140);
  }

  if (type === "item.completed" && d.item && d.item.type === "command_execution") {
    const code = d.item.exit_code;
    const tail = tailLines(d.item.aggregated_output || "", 3, 140);
    if (tail.length > 0) {
      if (typeof code === "number" && code !== 0) tail.push(`exit ${code}`);
      return tail.join("\n");
    }
    return `exit ${typeof code === "number" ? code : "?"}`;
  }

  // Keep card previews focused on "what it's doing" (commands + output),
  // not assistant chatter or structural protocol noise.
  if (type === "item.completed" && d.item && (d.item.type === "reasoning" || d.item.type === "agent_message")) {
    return null;
  }
  if (type === "turn.completed") return null;
  if (type === "token.usage.updated") return null;
  if (type === "thread.started" && d.thread_id) return null;

  if ((type === "item.started" || type === "item.completed") && d.item && d.item.type) {
    const it = String(d.item.type || "");
    if (it && it !== "command_execution" && it !== "agent_message") {
      return type === "item.started" ? `[${it}] started` : `[${it}] completed`;
    }
  }

  return null;
}

function claudeMessageBlocks(message) {
  if (!message || typeof message !== "object") return [];
  const c = message.content;
  if (typeof c === "string") return [{ type: "text", text: c }];
  return Array.isArray(c) ? c : [];
}

function claudeMessageText(message) {
  const blocks = claudeMessageBlocks(message);
  const parts = [];
  for (const b of blocks) {
    if (!b || typeof b !== "object") continue;
    if (b.type === "text" && typeof b.text === "string") parts.push(b.text);
  }
  return parts.join("");
}

function summarizeClaudeEvent(data) {
  const d = data && typeof data === "object" ? data : {};
  const type = String(d.type || "");

  if (type === "assistant" && d.message) {
    const blocks = claudeMessageBlocks(d.message);
    for (const b of blocks) {
      if (!b || typeof b !== "object") continue;
      if (b.type === "tool_use" && typeof b.name === "string") {
        const name = b.name;
        const input = b.input && typeof b.input === "object" ? b.input : {};
        const cmd = typeof input.command === "string" ? input.command : "";
        if (name === "Bash" && cmd) return truncateText(`$ ${oneLine(cmd)}`, 140);
        return truncateText(`[${name}]`, 140);
      }
    }

    const text = claudeMessageText(d.message);
    if (!text.trim()) return null;
    return truncateText(oneLine(text), 160);
  }

  // Hide structural noise; card previews should focus on actionable output.
  if (type === "system" || type === "stream_event") return null;
  if (type === "result") return null;
  if (type === "user") return null;

  return null;
}

function summarizeLogEntry(entry) {
  if (!entry) return null;

  if (entry.kind === "log") {
    const t = String(entry.text || "");
    if (!t.trim()) return null;
    if (isNoisyLogLine(t)) return null;
    const line = truncateText(oneLine(t), 160);
    if (!line) return null;
    return entry.stream === "stderr" ? prefixEveryNonEmptyLine(line, "ERR: ") : line;
  }

  if (entry.kind === "codex") {
    const s = summarizeCodexEvent(entry.data);
    if (!s) return null;
    return entry.stream === "stderr" ? prefixEveryNonEmptyLine(s, "ERR: ") : s;
  }

  if (entry.kind === "claude") {
    const s = summarizeClaudeEvent(entry.data);
    if (!s) return null;
    return entry.stream === "stderr" ? prefixEveryNonEmptyLine(s, "ERR: ") : s;
  }

  return null;
}

function buildLogTail(job, maxLines) {
  const logs = (job && job.logs) || [];
  const want = Math.max(1, Number(maxLines) || 4);
  const out = [];
  const seen = new Set();

  for (let i = logs.length - 1; i >= 0; i -= 1) {
    const s = summarizeLogEntry(logs[i]);
    if (!s) continue;
    const lines = String(s)
      .split("\n")
      .map((ln) => String(ln || "").trimEnd())
      .filter((ln) => ln.trim().length > 0);

    for (let j = lines.length - 1; j >= 0; j -= 1) {
      const ln = lines[j];
      if (!ln) continue;
      if (seen.has(ln)) continue;
      seen.add(ln);
      out.push(ln);
      if (out.length >= want) break;
    }
    if (out.length >= want) break;
  }

  return out.reverse().join("\n").trim();
}

function normalizeNewlines(text) {
  return String(text || "").replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function codexEntryToLiveChunks(entry) {
  const d = entry && entry.data && typeof entry.data === "object" ? entry.data : {};
  const type = String(d.type || "");
  const item = d.item && typeof d.item === "object" ? d.item : null;
  const itemType = item && typeof item.type === "string" ? item.type : "";
  const chunks = [];

  // Hide structural noise; Live is meant to feel like a terminal tail.
  if (type === "thread.started" || type === "turn.started" || type === "turn.completed") return chunks;

  if ((type === "item.started" || type === "item.completed") && itemType === "command_execution") {
    const cmd = shortShellCommand(item.command || "");
    if (type === "item.started") {
      chunks.push({ kind: "prompt", stream: entry.stream, text: `$ ${cmd}` });
      return chunks;
    }

    const out = normalizeNewlines(stripAnsi(String(item.aggregated_output || "")));
    for (const ln of out.split("\n")) {
      chunks.push({ kind: "output", stream: entry.stream, text: ln });
    }

    if (typeof item.exit_code === "number" && item.exit_code !== 0) {
      chunks.push({ kind: "exit", stream: entry.stream, text: `exit ${item.exit_code}`, exitCode: item.exit_code });
    }

    return chunks;
  }

  if (type === "item.completed" && (itemType === "reasoning" || itemType === "agent_message")) {
    const text = normalizeNewlines(String(item.text || ""));
    for (const ln of text.split("\n")) {
      chunks.push({ kind: "assistant", stream: entry.stream, text: ln });
    }
    return chunks;
  }

  return chunks;
}

function claudeEntryToLiveChunks(entry) {
  const d = entry && entry.data && typeof entry.data === "object" ? entry.data : {};
  const type = String(d.type || "");
  const chunks = [];

  if (type === "system" && String(d.subtype || "") === "init") {
    const bits = [];
    if (d.session_id) bits.push(`session ${d.session_id}`);
    if (d.model) bits.push(`model ${d.model}`);
    if (d.permissionMode) bits.push(`perm ${d.permissionMode}`);
    const line = bits.length > 0 ? `[init] ${bits.join(" ")}` : "[init]";
    chunks.push({ kind: "meta", stream: entry.stream, text: line });
    return chunks;
  }

  if ((type === "assistant" || type === "user") && d.message) {
    const blocks = claudeMessageBlocks(d.message);
    for (const b of blocks) {
      if (!b || typeof b !== "object") continue;
      if (b.type === "tool_use" && typeof b.name === "string") {
        const name = b.name;
        const input = b.input && typeof b.input === "object" ? b.input : {};
        const cmd = typeof input.command === "string" ? input.command : "";
        if (name === "Bash" && cmd) chunks.push({ kind: "prompt", stream: entry.stream, text: `$ ${shortShellCommand(cmd)}` });
        else chunks.push({ kind: "prompt", stream: entry.stream, text: `[${name}]` });
        continue;
      }
      if (b.type === "text" && typeof b.text === "string") {
        const raw = stripAnsi(normalizeNewlines(String(b.text || "")));
        const kind = type === "assistant" ? "assistant" : "output";
        for (const ln of raw.split("\n")) chunks.push({ kind, stream: entry.stream, text: ln });
      }
    }
    return chunks;
  }

  if (type === "result") {
    const u = d.usage && typeof d.usage === "object" ? d.usage : {};
    const inTok = u.input_tokens ?? "?";
    const outTok = u.output_tokens ?? "?";
    const subtype = typeof d.subtype === "string" && d.subtype ? d.subtype : "";
    const summary = `[result${subtype ? ` ${subtype}` : ""}] tokens in=${inTok} out=${outTok}`;
    chunks.push({ kind: "meta", stream: entry.stream, text: summary });
    return chunks;
  }

  return chunks;
}

function logEntryToLiveChunks(entry) {
  if (!entry) return [];
  const entryMs = isoMs(entry && typeof entry.ts === "string" ? entry.ts : "");

  if (entry.kind === "log") {
    const raw = stripAnsi(normalizeNewlines(String(entry.text || "")));
    if (!raw.trim()) return [];
    if (isNoisyLogLine(raw)) return [];
    return raw.split("\n").map((ln) => ({ kind: "output", stream: entry.stream, text: ln, ms: entryMs }));
  }

  if (entry.kind === "codex") return codexEntryToLiveChunks(entry).map((c) => ({ ...c, ms: c.ms ?? entryMs }));
  if (entry.kind === "claude") return claudeEntryToLiveChunks(entry).map((c) => ({ ...c, ms: c.ms ?? entryMs }));

  return [];
}

function buildLiveTailChunks(job, maxLines) {
  const logs = (job && job.logs) || [];
  const want = Math.max(1, Number(maxLines) || 120);
  const out = [];

  for (let i = logs.length - 1; i >= 0; i -= 1) {
    const chunks = logEntryToLiveChunks(logs[i]);
    if (!chunks || chunks.length === 0) continue;
    for (let j = chunks.length - 1; j >= 0; j -= 1) {
      out.push(chunks[j]);
      if (out.length >= want) break;
    }
    if (out.length >= want) break;
  }

  return out.reverse();
}

function renderLiveTailHtml(chunks, { running } = {}) {
  const arr = Array.isArray(chunks) ? chunks : [];
  const cls = running ? "term term--running" : "term";
  const nowMs = Date.now();

  if (arr.length === 0) {
    const msg = running ? "Working…" : "No output yet.";
    return `<div class="${cls}"><div class="term__line term__line--meta">${escapeHtml(msg)}</div></div>`;
  }

  const lastIdx = arr.length - 1;
  const lines = arr
    .map((c, idx) => {
      const kind = String(c && c.kind ? c.kind : "output");
      const stream = c && typeof c.stream === "string" ? c.stream : "";
      const text = c && typeof c.text === "string" ? c.text : "";

      const classes = ["term__line"];
      classes.push(`term__line--${kind}`);
      if (stream === "stderr") classes.push("term__line--stderr");
      if (kind === "exit" && typeof c.exitCode === "number" && c.exitCode !== 0) classes.push("term__line--stderr");

      let inner = "";
      if (kind === "assistant") inner = renderMarkdownInlineSafeHtml(text);
      else inner = escapeHtml(text);
      if (text === "") inner = "&nbsp;";

      // While running, show a live "silence" counter next to the most recent line.
      // This helps gauge how long the current step has been ongoing without new output.
      if (running && idx === lastIdx) {
        const baseMs = Number.isFinite(Number(c && c.ms)) ? Number(c.ms) : NaN;
        if (Number.isFinite(baseMs)) {
          const counter = fmtOffset(Math.max(0, nowMs - baseMs));
          inner += ` <span class="term__counter" data-live-running-base-ms="${escapeHtml(String(baseMs))}" title="Time since last output">(+${escapeHtml(counter)})</span>`;
        }
      }

      return `<div class="${classes.join(" ")}">${inner}</div>`;
    })
    .join("");

  return `<div class="${cls}">${lines}</div>`;
}

function jobStatusForUi(value) {
  if (value && typeof value === "object") {
    if (value.integratingToDefault === true) return "running";
    const raw = typeof value.status === "string" ? value.status : "";
    return raw || "unknown";
  }
  const raw = typeof value === "string" ? value : String(value || "");
  return raw || "unknown";
}

function fmtStatusPill(status) {
  const s = jobStatusForUi(status);
  const cls =
    s === "running"
      ? "pill pill--run"
      : s === "done"
        ? "pill pill--done"
        : s === "needs_attention" || s === "failed" || s === "cancelled"
          ? "pill pill--attn"
          : "pill";
  return `<span class="${cls}">${escapeHtml(s)}</span>`;
}

function pickLane(status) {
  const s = jobStatusForUi(status);
  if (s === "running") return "running";
  if (s === "needs_attention" || s === "failed" || s === "cancelled") return "attention";
  if (s === "done") return "done";
  return "attention";
}

const VIEWS = ["board", "archive", "trash"];
const DISPLAY_MODES = ["cards", "table"];
const TABLE_SCOPES = ["view", "all"];

function normalizeView(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  return VIEWS.includes(v) ? v : "board";
}

function normalizeDisplayMode(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  return DISPLAY_MODES.includes(v) ? v : "cards";
}

function normalizeTableScope(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  return TABLE_SCOPES.includes(v) ? v : "view";
}

function normalizeSearchQuery(value) {
  const s = typeof value === "string" ? value : value == null ? "" : String(value);
  return s.trim();
}

function isSearchActive() {
  return !!normalizeSearchQuery(state.searchQuery);
}

function renderSearchUi() {
  if (els.searchClearBtn) els.searchClearBtn.hidden = !isSearchActive();
  if (!els.searchMeta) return;

  if (!isSearchActive()) {
    els.searchMeta.textContent = "";
    els.searchMeta.title = "";
    return;
  }

  if (state.searchPending) {
    els.searchMeta.textContent = "Searching…";
    els.searchMeta.title = "";
    return;
  }

  const ids = state.searchJobIds;
  if (!ids || !(ids instanceof Set)) {
    els.searchMeta.textContent = "";
    els.searchMeta.title = "";
    return;
  }

  const total = Number(state.searchTotal) || 0;
  if (!total) {
    els.searchMeta.textContent = "No matches";
    els.searchMeta.title = "";
    return;
  }

  let inView = 0;
  for (const id of ids.values()) {
    const job = state.jobs.get(id);
    if (!job) continue;
    if (!jobVisibleInCurrentView(job)) continue;
    inView += 1;
  }

  const shown = ids.size;
  els.searchMeta.textContent = `${inView}/${total} matches`;
  els.searchMeta.title = state.searchTruncated && shown < total ? `Limited to first ${shown} matches.` : "";
}

function localSearchTokens(query) {
  const q = normalizeSearchQuery(query).toLowerCase();
  if (!q) return [];
  const parts = q.split(/\s+/).filter(Boolean);
  if (parts.length > 24) return parts.slice(0, 24);
  return parts;
}

function localIncludesToken(value, tokenLower) {
  if (!tokenLower) return true;
  const s = typeof value === "string" ? value : value == null ? "" : String(value);
  if (!s) return false;
  return s.toLowerCase().includes(tokenLower);
}

function localJobHasToken(job, tokenLower) {
  if (!job || typeof job !== "object") return false;

  if (
    localIncludesToken(job.id, tokenLower) ||
    localIncludesToken(job.title, tokenLower) ||
    localIncludesToken(job.status, tokenLower) ||
    localIncludesToken(job.box, tokenLower) ||
    localIncludesToken(job.archiveReason, tokenLower) ||
    localIncludesToken(job.threadId, tokenLower) ||
    localIncludesToken(job.model, tokenLower) ||
    localIncludesToken(job.projectId, tokenLower) ||
    localIncludesToken(job.projectPath, tokenLower) ||
    localIncludesToken(job.promptPreview, tokenLower) ||
    localIncludesToken(job.previewText, tokenLower)
  ) {
    return true;
  }

  // If we happen to have full details loaded (e.g. a job was opened), include them too.
  const prompts = Array.isArray(job.prompts) ? job.prompts : [];
  for (const p of prompts) {
    if (!p) continue;
    if (localIncludesToken(p.text, tokenLower)) return true;
    const imgs = Array.isArray(p.images) ? p.images : [];
    for (const img of imgs) {
      if (localIncludesToken(img, tokenLower)) return true;
    }
  }

  const messages = Array.isArray(job.messages) ? job.messages : [];
  for (const m of messages) {
    if (!m) continue;
    if (localIncludesToken(m.text, tokenLower)) return true;
  }

  const logs = Array.isArray(job.logs) ? job.logs : [];
  for (const l of logs) {
    if (!l) continue;
    if (l.kind === "log" && localIncludesToken(l.text, tokenLower)) return true;
    if (l.kind === "codex") {
      const d = l.data && typeof l.data === "object" ? l.data : {};
      if (localIncludesToken(d.type, tokenLower)) return true;
      if (localIncludesToken(d.thread_id, tokenLower)) return true;
      const item = d.item && typeof d.item === "object" ? d.item : null;
      if (item) {
        if (localIncludesToken(item.type, tokenLower)) return true;
        if (localIncludesToken(item.command, tokenLower)) return true;
        if (localIncludesToken(item.text, tokenLower)) return true;
        if (localIncludesToken(item.aggregated_output, tokenLower)) return true;
      }
    }
    if (l.kind === "claude") {
      const d = l.data && typeof l.data === "object" ? l.data : {};
      if (localIncludesToken(d.type, tokenLower)) return true;
      if (localIncludesToken(d.subtype, tokenLower)) return true;
      if (localIncludesToken(d.session_id, tokenLower)) return true;
      if (localIncludesToken(d.result, tokenLower)) return true;
      const msg = d.message && typeof d.message === "object" ? d.message : null;
      if (msg) {
        const content = msg.content;
        if (typeof content === "string") {
          if (localIncludesToken(content, tokenLower)) return true;
        } else if (Array.isArray(content)) {
          for (const b of content) {
            if (!b || typeof b !== "object") continue;
            if (localIncludesToken(b.type, tokenLower)) return true;
            if (localIncludesToken(b.text, tokenLower)) return true;
            if (localIncludesToken(b.name, tokenLower)) return true;
          }
        }
      }
    }
  }

  return false;
}

function localJobMatchesTokens(job, tokens) {
  if (!tokens || tokens.length === 0) return false;
  for (const t of tokens) {
    if (!localJobHasToken(job, t)) return false;
  }
  return true;
}

function localSearchJobs(query) {
  const tokens = localSearchTokens(query);
  if (tokens.length === 0) return { jobIds: [], total: 0, truncated: false };
  const ids = [];
  for (const job of state.jobs.values()) {
    if (localJobMatchesTokens(job, tokens)) ids.push(job.id);
  }
  return { jobIds: ids, total: ids.length, truncated: false };
}

function scheduleSearch(delayMs = 260, { replace = true } = {}) {
  if (!isSearchActive()) return;

  if (state.searchTimer) {
    if (!replace) return;
    window.clearTimeout(state.searchTimer);
    state.searchTimer = null;
  }

  state.searchTimer = window.setTimeout(() => {
    state.searchTimer = null;
    runSearch(state.searchQuery);
  }, Math.max(0, delayMs));
}

async function runSearch(query) {
  const q = normalizeSearchQuery(query);
  if (!q) return;

  const seq = ++state.searchSeq;
  state.searchPending = true;
  renderSearchUi();

  try {
    const res =
      api && typeof api.jobsSearch === "function"
        ? await api.jobsSearch(q, { limit: 20000, includeLogs: true })
        : localSearchJobs(q);

    // Ignore stale results (query changed while searching).
    if (seq !== state.searchSeq) return;

    const ids = res && Array.isArray(res.jobIds) ? res.jobIds : [];
    state.searchJobIds = new Set(ids);
    state.searchTotal = typeof res.total === "number" ? res.total : ids.length;
    state.searchTruncated = !!(res && res.truncated);
    state.searchPending = false;
    renderSearchUi();
    renderBoard();
    scheduleStatusDialogRender();
  } catch (err) {
    if (seq !== state.searchSeq) return;
    state.searchJobIds = new Set();
    state.searchTotal = 0;
    state.searchTruncated = false;
    state.searchPending = false;
    renderSearchUi();
    renderBoard();
    scheduleStatusDialogRender();
    showToast(`Search failed: ${String(err && err.message ? err.message : err)}`);
  }
}

function setSearchQuery(value, { immediate = false } = {}) {
  state.searchQuery = typeof value === "string" ? value : value == null ? "" : String(value);
  renderSearchUi();

  if (!isSearchActive()) {
    state.searchSeq += 1;
    state.searchJobIds = null;
    state.searchTotal = 0;
    state.searchTruncated = false;
    state.searchPending = false;
    if (state.searchTimer) {
      window.clearTimeout(state.searchTimer);
      state.searchTimer = null;
    }
    renderSearchUi();
    renderBoard();
    scheduleStatusDialogRender();
    return;
  }

  if (immediate) runSearch(state.searchQuery);
  else scheduleSearch(260, { replace: true });
}

function clearSearch({ focus = true } = {}) {
  if (els.searchInput) els.searchInput.value = "";
  setSearchQuery("");
  if (focus && els.searchInput) {
    try {
      els.searchInput.focus();
    } catch {
      // ignore
    }
  }
}

function normalizeJobSearchQuery(value) {
  const s = typeof value === "string" ? value : value == null ? "" : String(value);
  return s.trim();
}

function focusJobSearchInput({ select = true } = {}) {
  if (!els.jobSearchInput) return false;
  try {
    els.jobSearchInput.focus();
    if (select) els.jobSearchInput.select();
    return true;
  } catch {
    return false;
  }
}

function renderJobSearchUi() {
  const q = normalizeJobSearchQuery(state.jobSearchQuery);
  const matches = Array.isArray(state.jobSearchMatches) ? state.jobSearchMatches : [];
  const total = matches.length;
  const hasMatches = total > 0;
  const unsupported = !!(q && state.jobSearchUnsupported);

  if (els.jobSearchClearBtn) els.jobSearchClearBtn.hidden = !q;
  if (els.jobSearchPrevBtn) els.jobSearchPrevBtn.disabled = !q || !hasMatches || unsupported;
  if (els.jobSearchNextBtn) els.jobSearchNextBtn.disabled = !q || !hasMatches || unsupported;
  if (!els.jobSearchMeta) return;

  if (!q) {
    els.jobSearchMeta.textContent = "";
    return;
  }

  if (unsupported) {
    els.jobSearchMeta.textContent = "Terminal tab";
    return;
  }

  if (!hasMatches) {
    els.jobSearchMeta.textContent = "No matches";
    return;
  }

  const idx = state.jobSearchIndex >= 0 ? state.jobSearchIndex + 1 : 1;
  els.jobSearchMeta.textContent = `${idx}/${total}`;
}

function jobSearchablePanelForActiveTab() {
  if (state.activeTab === "chat") return els.jobDialogChat;
  if (state.activeTab === "live") return els.jobDialogLive;
  if (state.activeTab === "logs") return els.jobDialogLogs;
  return null;
}

function clearJobSearchMarksInPanel(panelEl) {
  const panel = panelEl && panelEl.querySelectorAll ? panelEl : null;
  if (!panel) return;
  const marks = panel.querySelectorAll("mark.jobfindmark");
  if (!marks || marks.length === 0) return;

  const parents = new Set();
  marks.forEach((mark) => {
    const parent = mark && mark.parentNode ? mark.parentNode : null;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    if (parent && typeof parent.normalize === "function") parents.add(parent);
  });
  parents.forEach((parent) => parent.normalize());
}

function clearJobSearchMarks() {
  clearJobSearchMarksInPanel(els.jobDialogChat);
  clearJobSearchMarksInPanel(els.jobDialogLive);
  clearJobSearchMarksInPanel(els.jobDialogLogs);
}

function collectJobSearchTextNodes(rootEl) {
  const root = rootEl && rootEl.nodeType === 1 ? rootEl : null;
  if (!root) return [];
  const out = [];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const text = node && typeof node.nodeValue === "string" ? node.nodeValue : "";
        if (!text || !text.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = String(parent.tagName || "").toUpperCase();
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "INPUT" || tag === "TEXTAREA") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    },
    false
  );

  for (let node = walker.nextNode(); node; node = walker.nextNode()) out.push(node);
  return out;
}

function highlightJobSearchMatches(rootEl, query) {
  const root = rootEl && rootEl.nodeType === 1 ? rootEl : null;
  const q = normalizeJobSearchQuery(query).toLowerCase();
  if (!root || !q) return [];

  const nodes = collectJobSearchTextNodes(root);
  const marks = [];

  for (const node of nodes) {
    const text = String(node.nodeValue || "");
    const low = text.toLowerCase();
    if (!low.includes(q)) continue;

    const parent = node.parentNode;
    if (!parent) continue;

    const frag = document.createDocumentFragment();
    let cursor = 0;
    let idx = low.indexOf(q, cursor);
    while (idx !== -1) {
      if (idx > cursor) frag.appendChild(document.createTextNode(text.slice(cursor, idx)));
      const mark = document.createElement("mark");
      mark.className = "jobfindmark";
      mark.textContent = text.slice(idx, idx + q.length);
      frag.appendChild(mark);
      marks.push(mark);
      cursor = idx + q.length;
      idx = low.indexOf(q, cursor);
    }
    if (cursor < text.length) frag.appendChild(document.createTextNode(text.slice(cursor)));
    parent.replaceChild(frag, node);
  }

  return marks;
}

function setJobSearchActiveIndex(nextIndex, { scroll = true } = {}) {
  const matches = Array.isArray(state.jobSearchMatches) ? state.jobSearchMatches : [];
  const total = matches.length;
  matches.forEach((mark) => {
    if (mark && mark.classList) mark.classList.remove("jobfindmark--active");
  });

  if (!total) {
    state.jobSearchIndex = -1;
    renderJobSearchUi();
    return;
  }

  let idx = Number(nextIndex);
  if (!Number.isFinite(idx)) idx = 0;
  idx = Math.trunc(idx);
  idx %= total;
  if (idx < 0) idx += total;
  state.jobSearchIndex = idx;

  const target = matches[idx];
  if (target && target.classList) {
    target.classList.add("jobfindmark--active");
    if (scroll && typeof target.scrollIntoView === "function") {
      try {
        target.scrollIntoView({ block: "center", inline: "nearest" });
      } catch {
        // ignore
      }
    }
  }

  renderJobSearchUi();
}

function applyJobSearchToActivePanel({ preserveIndex = false, scroll = false } = {}) {
  const q = normalizeJobSearchQuery(state.jobSearchQuery);
  const prevIndex = state.jobSearchIndex;
  clearJobSearchMarks();
  state.jobSearchMatches = [];
  state.jobSearchIndex = -1;
  state.jobSearchUnsupported = false;

  if (!q) {
    renderJobSearchUi();
    return;
  }

  if (!(els.jobDialog && els.jobDialog.open)) {
    renderJobSearchUi();
    return;
  }

  const panel = jobSearchablePanelForActiveTab();
  if (!panel) {
    state.jobSearchUnsupported = state.activeTab === "term";
    renderJobSearchUi();
    return;
  }

  const marks = highlightJobSearchMatches(panel, q);
  state.jobSearchMatches = marks;

  if (marks.length === 0) {
    renderJobSearchUi();
    return;
  }

  const desired = preserveIndex ? prevIndex : 0;
  setJobSearchActiveIndex(desired, { scroll });
}

function setJobSearchQuery(value, { preserveIndex = false, scroll = false } = {}) {
  state.jobSearchQuery = typeof value === "string" ? value : value == null ? "" : String(value);
  if (els.jobSearchInput && els.jobSearchInput.value !== state.jobSearchQuery) {
    els.jobSearchInput.value = state.jobSearchQuery;
  }
  applyJobSearchToActivePanel({ preserveIndex, scroll });
}

function clearJobSearch({ focus = false } = {}) {
  setJobSearchQuery("");
  if (focus) focusJobSearchInput({ select: false });
}

function stepJobSearch(delta) {
  const q = normalizeJobSearchQuery(state.jobSearchQuery);
  if (!q || state.jobSearchUnsupported) return;
  const step = Number(delta) < 0 ? -1 : 1;
  setJobSearchActiveIndex(state.jobSearchIndex + step, { scroll: true });
}

function jobBox(job) {
  const box = job && typeof job.box === "string" ? job.box.trim().toLowerCase() : "";
  return box === "archive" || box === "trash" ? box : "board";
}

function jobVisibleInView(job, view) {
  const v = normalizeView(view);
  const b = jobBox(job);
  if (v === "archive") return b === "archive";
  if (v === "trash") return b === "trash";
  return b === "board";
}

function tableScopeIncludesAllBoxes() {
  return state.displayMode === "table" && state.tableScope === "all";
}

function jobVisibleInCurrentView(job) {
  if (isSearchActive()) {
    const ids = state.searchJobIds;
    if (ids && ids instanceof Set) {
      const id = job && typeof job.id === "string" ? job.id : "";
      if (!id || !ids.has(id)) return false;
    }
  }
  const filterId = String(state.projectFilterId || "").trim();
  if (filterId) {
    const pid = job && typeof job.projectId === "string" ? job.projectId : "";
    if (pid !== filterId) return false;
  }
  if (!tableScopeIncludesAllBoxes() && !jobVisibleInView(job, state.view)) return false;
  if (state.view === "board" && state.focusLane) {
    return pickLane(job) === state.focusLane;
  }
  return true;
}

function laneElForJob(job) {
  if (!jobVisibleInCurrentView(job)) return null;

  if (state.view === "archive") {
    return els.laneRunning;
  }

  if (state.view === "trash") {
    return els.laneRunning;
  }

  // state.view === "board"
  // Use full job object so UI-only running markers (integratingToDefault) map to the Running lane immediately.
  return laneElForStatus(job);
}

function isDemoJob(job) {
  return !!(job && typeof job === "object" && job.demo === true);
}

function hasRealJobs() {
  for (const j of state.jobs.values()) {
    if (!isDemoJob(j)) return true;
  }
  return false;
}

function ensureDemoJobs() {
  // Never show demo cards if the user already has real jobs.
  if (hasRealJobs()) return false;

  const now = Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  const prompt = (ms, text) => ({ ts: iso(ms), text: String(text || ""), images: [] });
  const msg = (ms, role, text) => ({ ts: iso(ms), role: String(role || ""), text: String(text || ""), images: [] });
  const log = (ms, stream, text) => ({ ts: iso(ms), kind: "log", stream: String(stream || "stdout"), text: String(text || "") });

  const jobs = [
    {
      id: DEMO.jobs.running,
      demo: true,
      title: "",
      status: "running",
      box: "board",
      createdAt: iso(now - 4 * 60 * 1000),
      startedAt: iso(now - 3 * 60 * 1000),
      finishedAt: "",
      projectId: DEMO.projectId,
      agent: "codex",
      model: "",
      threadId: "",
      prompts: [prompt(now - 3 * 60 * 1000, "Add a first-run guided tour (with an example card).")],
      messages: [],
      logs: [
        log(now - 2.6 * 60 * 1000, "stdout", "Scanning UI…"),
        log(now - 2.1 * 60 * 1000, "stdout", "Preparing onboarding overlay…"),
        log(now - 1.2 * 60 * 1000, "stdout", "Rendering demo cards…")
      ]
    },
    {
      id: DEMO.jobs.attention,
      demo: true,
      title: "",
      status: "needs_attention",
      box: "board",
      createdAt: iso(now - 32 * 60 * 1000),
      startedAt: iso(now - 31 * 60 * 1000),
      finishedAt: iso(now - 28 * 60 * 1000),
      projectId: DEMO.projectId,
      agent: "claude",
      model: "",
      threadId: "",
      prompts: [prompt(now - 31 * 60 * 1000, "Wire up the tour to the first app start.")],
      messages: [
        msg(
          now - 28 * 60 * 1000,
          "assistant",
          "Quick question before I proceed: should the tour show only when there are zero jobs, or always on first launch even if jobs already exist?"
        )
      ],
      logs: [log(now - 30.5 * 60 * 1000, "stdout", "Reviewing existing UI and flows…")]
    },
    {
      id: DEMO.jobs.done,
      demo: true,
      title: "",
      status: "done",
      box: "board",
      createdAt: iso(now - 95 * 60 * 1000),
      startedAt: iso(now - 94 * 60 * 1000),
      finishedAt: iso(now - 92 * 60 * 1000),
      projectId: DEMO.projectId,
      agent: "codex",
      model: "",
      threadId: "",
      prompts: [prompt(now - 94 * 60 * 1000, "Explain how job cards work (Running → Needs Attention → Done).")],
      messages: [
        msg(
          now - 92 * 60 * 1000,
          "assistant",
          "Done. Cards represent runs. Click a card to open the full chat + logs.\n\nTip: right click a card to archive/trash it (when not running)."
        )
      ],
      logs: [log(now - 93.5 * 60 * 1000, "stdout", "Summarizing UI behavior…")],
      usageTotal: { input_tokens: 842, output_tokens: 391, turns: 2 }
    }
  ];

  let changed = false;
  for (const j of jobs) {
    if (state.jobs.has(j.id)) continue;
    state.jobs.set(j.id, j);
    changed = true;
  }

  if (changed) {
    renderBoard();
    syncDurationTicker();
    scheduleStatusDialogRender();
  }

  return changed;
}

function clearDemoJobs() {
  let removed = false;
  const selectedId = state.selectedJobId;
  const selected = selectedId ? state.jobs.get(selectedId) : null;
  const selectedWasDemo = !!selected && isDemoJob(selected);

  for (const [id, job] of state.jobs.entries()) {
    if (!isDemoJob(job)) continue;
    state.jobs.delete(id);
    removed = true;
  }

  if (removed) {
    if (selectedWasDemo) {
      try {
        if (els.jobDialog && els.jobDialog.open) els.jobDialog.close();
      } catch {
        // ignore
      }
      state.selectedJobId = null;
    }
    renderBoard();
    scheduleStatusDialogRender();
  }

  return removed;
}

function ensureTourDom() {
  if (tour.root && !tour.root.isConnected) {
    tour.root = null;
  }

  const existing = document.getElementById(TOUR_ROOT_ID);
  if (existing) {
    tour.root = existing;
    tour.spotlightEl = existing.querySelector("[data-tour-spotlight]");
    tour.cardEl = existing.querySelector("[data-tour-card]");
    tour.kickerEl = existing.querySelector("[data-tour-kicker]");
    tour.titleEl = existing.querySelector("[data-tour-title]");
    tour.bodyEl = existing.querySelector("[data-tour-body]");
    tour.backBtn = existing.querySelector('[data-tour-action="back"]');
    tour.nextBtn = existing.querySelector('[data-tour-action="next"]');
    tour.skipBtn = existing.querySelector('[data-tour-action="skip"]');
    return existing;
  }

  const root = document.createElement("div");
  root.id = TOUR_ROOT_ID;
  root.className = "tour";
  root.hidden = true;
  root.innerHTML = `
    <div class="tour__spotlight" data-tour-spotlight></div>
    <div class="tour__card" data-tour-card role="dialog" aria-modal="true" aria-label="Guided tour">
      <div class="tour__kicker" data-tour-kicker></div>
      <div class="tour__title" data-tour-title></div>
      <div class="tour__body" data-tour-body></div>
      <div class="tour__actions">
        <button type="button" class="btn btn--ghost" data-tour-action="skip">Skip</button>
        <div class="tour__spacer"></div>
        <button type="button" class="btn btn--ghost" data-tour-action="back">Back</button>
        <button type="button" class="btn btn--primary" data-tour-action="next">Next</button>
      </div>
    </div>
  `.trim();

  document.body.appendChild(root);

  tour.root = root;
  tour.spotlightEl = root.querySelector("[data-tour-spotlight]");
  tour.cardEl = root.querySelector("[data-tour-card]");
  tour.kickerEl = root.querySelector("[data-tour-kicker]");
  tour.titleEl = root.querySelector("[data-tour-title]");
  tour.bodyEl = root.querySelector("[data-tour-body]");
  tour.backBtn = root.querySelector('[data-tour-action="back"]');
  tour.nextBtn = root.querySelector('[data-tour-action="next"]');
  tour.skipBtn = root.querySelector('[data-tour-action="skip"]');

  const onClick = (e) => {
    const btn = e.target && e.target.closest ? e.target.closest("[data-tour-action]") : null;
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const action = btn.getAttribute("data-tour-action") || "";
    if (action === "skip") stopFirstRunTour();
    else if (action === "back") setTourStep(tour.step - 1);
    else if (action === "next") {
      if (tour.step >= TOUR_STEPS.length - 1) stopFirstRunTour();
      else setTourStep(tour.step + 1);
    }
  };
  root.addEventListener("click", onClick);
  tour.dispose.push(() => root.removeEventListener("click", onClick));

  return root;
}

function scheduleTourUpdate() {
  if (!tour.active) return;
  if (tour.updateRaf) return;
  tour.updateRaf = window.requestAnimationFrame(() => {
    tour.updateRaf = 0;
    updateTourLayout();
  });
}

function tourTargetElForStep(step) {
  const s = step && typeof step === "object" ? step : null;
  const getTarget = s && typeof s.getTarget === "function" ? s.getTarget : null;
  if (!getTarget) return null;
  try {
    return getTarget();
  } catch {
    return null;
  }
}

function updateTourLayout() {
  if (!tour.active) return;
  if (!tour.root || !tour.cardEl || !tour.spotlightEl) return;

  const step = TOUR_STEPS[tour.step] || null;
  const targetEl = tourTargetElForStep(step);
  const targetRect = targetEl && targetEl.getBoundingClientRect ? targetEl.getBoundingClientRect() : null;
  const hasTarget =
    !!targetRect &&
    Number.isFinite(targetRect.left) &&
    Number.isFinite(targetRect.top) &&
    targetRect.width > 2 &&
    targetRect.height > 2;

  // Spotlight
  if (!hasTarget) {
    tour.spotlightEl.style.opacity = "0";
    tour.spotlightEl.style.left = "50%";
    tour.spotlightEl.style.top = "50%";
    tour.spotlightEl.style.width = "10px";
    tour.spotlightEl.style.height = "10px";
    tour.spotlightEl.style.transform = "translate(-50%, -50%)";
  } else {
    const pad = 10;
    const x0 = Math.max(6, targetRect.left - pad);
    const y0 = Math.max(6, targetRect.top - pad);
    const x1 = Math.min(window.innerWidth - 6, targetRect.right + pad);
    const y1 = Math.min(window.innerHeight - 6, targetRect.bottom + pad);

    tour.spotlightEl.style.opacity = "1";
    tour.spotlightEl.style.left = `${Math.round(x0)}px`;
    tour.spotlightEl.style.top = `${Math.round(y0)}px`;
    tour.spotlightEl.style.width = `${Math.round(Math.max(10, x1 - x0))}px`;
    tour.spotlightEl.style.height = `${Math.round(Math.max(10, y1 - y0))}px`;
    tour.spotlightEl.style.transform = "none";
  }

  // Card positioning
  tour.cardEl.style.left = "0px";
  tour.cardEl.style.top = "0px";
  const cardRect = tour.cardEl.getBoundingClientRect();
  const cw = cardRect.width || 360;
  const ch = cardRect.height || 200;
  const vw = window.innerWidth || 1200;
  const vh = window.innerHeight || 800;
  const margin = 12;

  const fits = (x, y) => x >= margin && y >= margin && x + cw <= vw - margin && y + ch <= vh - margin;
  const clampPos = (x, y) => ({
    x: clampNumber(x, margin, Math.max(margin, vw - cw - margin), margin),
    y: clampNumber(y, margin, Math.max(margin, vh - ch - margin), margin)
  });

  if (!hasTarget) {
    const centered = clampPos((vw - cw) / 2, 24);
    tour.cardEl.style.left = `${Math.round(centered.x)}px`;
    tour.cardEl.style.top = `${Math.round(centered.y)}px`;
    return;
  }

  const prefer = step && typeof step.prefer === "string" ? step.prefer : "";
  const rect = targetRect;
  const candidates = [];
  const addRight = () => candidates.push({ x: rect.right + margin, y: rect.top });
  const addLeft = () => candidates.push({ x: rect.left - cw - margin, y: rect.top });
  const addBottom = () => candidates.push({ x: rect.left, y: rect.bottom + margin });
  const addTop = () => candidates.push({ x: rect.left, y: rect.top - ch - margin });

  if (prefer === "right") {
    addRight(); addLeft(); addBottom(); addTop();
  } else if (prefer === "left") {
    addLeft(); addRight(); addBottom(); addTop();
  } else if (prefer === "top") {
    addTop(); addBottom(); addRight(); addLeft();
  } else {
    // default: bottom
    addBottom(); addTop(); addRight(); addLeft();
  }

  let placed = null;
  for (const c of candidates) {
    const pos = clampPos(c.x, c.y);
    if (fits(pos.x, pos.y)) {
      placed = pos;
      break;
    }
  }
  if (!placed) placed = clampPos(rect.left, rect.bottom + margin);

  tour.cardEl.style.left = `${Math.round(placed.x)}px`;
  tour.cardEl.style.top = `${Math.round(placed.y)}px`;
}

function setTourStep(idx) {
  const next = clampNumber(idx, 0, TOUR_STEPS.length - 1, 0);
  tour.step = next;
  const s = TOUR_STEPS[next] || {};

  if (tour.kickerEl) tour.kickerEl.textContent = `Step ${next + 1} of ${TOUR_STEPS.length}`;
  if (tour.titleEl) tour.titleEl.textContent = String(s.title || "");
  if (tour.bodyEl) tour.bodyEl.textContent = String(s.body || "");

  if (tour.backBtn) tour.backBtn.disabled = next <= 0;
  if (tour.nextBtn) tour.nextBtn.textContent = next >= TOUR_STEPS.length - 1 ? "Finish" : "Next";

  scheduleTourUpdate();
}

function startFirstRunTour() {
  if (tour.active) return;

  // Only show once. If the app restarts/crashes during onboarding we still don't want to nag.
  storeOnboardingSeen();

  // Ensure cards are visible on a fresh start.
  setView("board");
  setDisplayMode("cards");
  ensureDemoJobs();

  ensureTourDom();
  if (!tour.root) return;

  tour.active = true;
  tour.root.hidden = false;

  const onResize = () => scheduleTourUpdate();
  const onScroll = () => scheduleTourUpdate();
  const onKeyDown = (e) => {
    if (!tour.active) return;
    if (!e) return;
    if (e.key === "Escape") {
      e.preventDefault();
      stopFirstRunTour();
      return;
    }
    // Don't steal Enter from textareas/inputs.
    const tag = e.target && e.target.tagName ? String(e.target.tagName).toLowerCase() : "";
    if (tag === "textarea" || tag === "input") return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setTourStep(tour.step - 1);
      return;
    }
    if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      if (tour.step >= TOUR_STEPS.length - 1) stopFirstRunTour();
      else setTourStep(tour.step + 1);
    }
  };

  window.addEventListener("resize", onResize);
  document.addEventListener("scroll", onScroll, true);
  document.addEventListener("keydown", onKeyDown);
  tour.dispose.push(() => window.removeEventListener("resize", onResize));
  tour.dispose.push(() => document.removeEventListener("scroll", onScroll, true));
  tour.dispose.push(() => document.removeEventListener("keydown", onKeyDown));

  setTourStep(0);
  scheduleTourUpdate();

  try {
    if (tour.nextBtn) tour.nextBtn.focus();
  } catch {
    // ignore
  }
}

function stopFirstRunTour() {
  if (!tour.active) return;
  tour.active = false;

  if (tour.updateRaf) {
    try {
      window.cancelAnimationFrame(tour.updateRaf);
    } catch {
      // ignore
    }
    tour.updateRaf = 0;
  }

  const fns = tour.dispose.splice(0, tour.dispose.length);
  for (const fn of fns) {
    try {
      if (typeof fn === "function") fn();
    } catch {
      // ignore
    }
  }

  try {
    if (tour.root) tour.root.remove();
  } catch {
    // ignore
  }

  tour.root = null;
  tour.spotlightEl = null;
  tour.cardEl = null;
  tour.kickerEl = null;
  tour.titleEl = null;
  tour.bodyEl = null;
  tour.backBtn = null;
  tour.nextBtn = null;
  tour.skipBtn = null;

  clearDemoJobs();
}

function maybeStartFirstRunTour() {
  if (getStoredOnboardingSeen()) return;
  if (state.focusLane || state.focusJobId) return;

  // Heuristic: only show on a "fresh" install with no previous job history.
  if (state.jobs && state.jobs.size > 0) return;

  startFirstRunTour();
}

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (audio.ctx && audio.ctx.state === "closed") audio.ctx = null;
  if (!audio.ctx) {
    try {
      audio.ctx = new Ctx();
    } catch {
      audio.ctx = null;
    }
  }
  return audio.ctx;
}

function primeAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {
      // ignored; may require a user gesture depending on platform/policy.
    });
  }
}

function scheduleTone(ctx, when, freqHz, durationSec, amp, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const typeRaw = typeof o.type === "string" ? o.type.trim().toLowerCase() : "sine";
  const type =
    typeRaw === "sine" || typeRaw === "triangle" || typeRaw === "square" || typeRaw === "sawtooth"
      ? typeRaw
      : "sine";

  const start = typeof freqHz === "number" && Number.isFinite(freqHz) ? Math.max(1, freqHz) : 440;
  const end =
    typeof o.endFreqHz === "number" && Number.isFinite(o.endFreqHz) ? Math.max(1, o.endFreqHz) : null;
  const detuneCents =
    typeof o.detuneCents === "number" && Number.isFinite(o.detuneCents) ? o.detuneCents : 0;

  const d = typeof durationSec === "number" && Number.isFinite(durationSec) ? Math.max(0.01, durationSec) : 0.1;
  const attack = clampNumber(o.attack, 0.001, 0.2, 0.01);
  const release = clampNumber(o.release, 0.001, 0.8, 0.02);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(start, when);
  if (detuneCents) osc.detune.setValueAtTime(detuneCents, when);
  if (end != null) {
    // Exponential ramps require positive values.
    osc.frequency.exponentialRampToValueAtTime(end, when + d);
  }

  // Envelope to avoid clicks.
  const peak = Math.max(0.0001, amp);
  const aTime = Math.min(attack, d);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + aTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(aTime, d - release));

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + d + 0.05);
}

function scheduleBeep(ctx, when, freqHz, durationSec, amp) {
  scheduleTone(ctx, when, freqHz, durationSec, amp);
}

function scheduleBellStrike(ctx, when, freqHz, amp) {
  const f = typeof freqHz === "number" && Number.isFinite(freqHz) ? Math.max(1, freqHz) : 440;
  const a = Math.max(0.0001, amp);
  // Layer a harmonic for a simple bell-ish timbre.
  scheduleTone(ctx, when, f, 0.34, a, { type: "sine", attack: 0.005, release: 0.3 });
  scheduleTone(ctx, when, f * 2.01, 0.34, a * 0.35, { type: "sine", attack: 0.005, release: 0.3 });
}

function scheduleNoiseBurst(ctx, when, durationSec, amp, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const d = typeof durationSec === "number" && Number.isFinite(durationSec) ? Math.max(0.01, durationSec) : 0.12;
  const a = Math.max(0.0001, amp);
  const freqHz = clampNumber(o.freqHz, 200, 12000, 2600);
  const q = clampNumber(o.q, 0.1, 30, 3);

  const len = Math.max(1, Math.floor(ctx.sampleRate * d));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * 0.85;

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(freqHz, when);
  filter.Q.setValueAtTime(q, when);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(a, when + Math.min(0.015, d * 0.25));
  gain.gain.exponentialRampToValueAtTime(0.0001, when + d);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  src.start(when);
  src.stop(when + d + 0.05);
}

function scheduleHornBlast(ctx, when, freqHz, durationSec, amp, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const f = typeof freqHz === "number" && Number.isFinite(freqHz) ? Math.max(40, freqHz) : 440;
  const d = clampNumber(durationSec, 0.04, 1.2, 0.14);
  const a = Math.max(0.0001, amp);
  const attack = clampNumber(o.attack, 0.001, 0.08, 0.008);
  const wobbleHz = clampNumber(o.wobbleHz, 0.1, 20, 4.8);
  const wobbleCents = clampNumber(o.wobbleCents, 0, 80, 10);
  const endHz =
    typeof o.endFreqHz === "number" && Number.isFinite(o.endFreqHz) ? Math.max(20, o.endFreqHz) : Math.max(20, f * 0.93);

  const oscMain = ctx.createOscillator();
  const oscBody = ctx.createOscillator();
  const oscEdge = ctx.createOscillator();
  const gainMain = ctx.createGain();
  const gainBody = ctx.createGain();
  const gainEdge = ctx.createGain();
  const mix = ctx.createGain();
  const band = ctx.createBiquadFilter();
  const low = ctx.createBiquadFilter();
  const out = ctx.createGain();

  oscMain.type = "sawtooth";
  oscBody.type = "square";
  oscEdge.type = "triangle";

  oscMain.frequency.setValueAtTime(f * 1.02, when);
  oscMain.frequency.exponentialRampToValueAtTime(Math.max(20, endHz), when + d);
  oscBody.frequency.setValueAtTime(Math.max(20, f * 0.5), when);
  oscBody.frequency.exponentialRampToValueAtTime(Math.max(20, endHz * 0.5), when + d);
  oscEdge.frequency.setValueAtTime(f * 2.01, when);
  oscEdge.frequency.exponentialRampToValueAtTime(Math.max(20, endHz * 1.95), when + d);

  const detuneMain = clampNumber(o.detuneCents, -80, 80, 0);
  if (detuneMain) oscMain.detune.setValueAtTime(detuneMain, when);

  gainMain.gain.setValueAtTime(0.8, when);
  gainBody.gain.setValueAtTime(0.32, when);
  gainEdge.gain.setValueAtTime(0.2, when);
  mix.gain.setValueAtTime(1, when);

  band.type = "bandpass";
  band.frequency.setValueAtTime(clampNumber(o.formantHz, 500, 2800, 1120), when);
  band.Q.setValueAtTime(clampNumber(o.formantQ, 0.1, 20, 1.35), when);

  low.type = "lowpass";
  low.frequency.setValueAtTime(clampNumber(o.lowpassHz, 800, 6000, 2800), when);
  low.Q.setValueAtTime(0.55, when);

  out.gain.setValueAtTime(0.0001, when);
  out.gain.exponentialRampToValueAtTime(a, when + Math.min(attack, d));
  out.gain.exponentialRampToValueAtTime(Math.max(0.0001, a * 0.78), when + d * 0.52);
  out.gain.exponentialRampToValueAtTime(0.0001, when + d);

  const lfo = ctx.createOscillator();
  const lfoMain = ctx.createGain();
  const lfoBody = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(wobbleHz, when);
  lfoMain.gain.setValueAtTime(wobbleCents, when);
  lfoBody.gain.setValueAtTime(wobbleCents * 0.6, when);
  lfo.connect(lfoMain);
  lfo.connect(lfoBody);
  lfoMain.connect(oscMain.detune);
  lfoBody.connect(oscBody.detune);

  // Small attack burst to imitate air/compressor onset of a horn.
  scheduleNoiseBurst(ctx, when, Math.min(0.045, d * 0.45), a * 0.08, { freqHz: 1900, q: 1.2 });

  oscMain.connect(gainMain);
  oscBody.connect(gainBody);
  oscEdge.connect(gainEdge);
  gainMain.connect(mix);
  gainBody.connect(mix);
  gainEdge.connect(mix);
  mix.connect(band);
  band.connect(low);
  low.connect(out);
  out.connect(ctx.destination);

  oscMain.start(when);
  oscBody.start(when);
  oscEdge.start(when);
  lfo.start(when);
  oscMain.stop(when + d + 0.06);
  oscBody.stop(when + d + 0.06);
  oscEdge.stop(when + d + 0.06);
  lfo.stop(when + d + 0.06);
}

function sampleUrlForPreset(preset) {
  if (!preset) return "";
  const rel = Object.prototype.hasOwnProperty.call(SOUND_SAMPLE_URLS, preset) ? SOUND_SAMPLE_URLS[preset] : "";
  if (!rel) return "";
  try {
    return new URL(rel, window.location.href).toString();
  } catch {
    return "";
  }
}

function playPresetSample(preset, volume01, opts) {
  const url = sampleUrlForPreset(preset);
  if (!url) return false;

  const o = opts && typeof opts === "object" ? opts : {};
  const onError = typeof o.onError === "function" ? o.onError : null;

  let player = null;
  try {
    player = new Audio(url);
    player.preload = "auto";
    player.volume = clampNumber(volume01, 0, 1, 0.6);
    player.currentTime = 0;
  } catch {
    if (onError) onError();
    return false;
  }

  const release = () => {
    try {
      audio.activeHtmlPlayers.delete(player);
    } catch {
      // ignore
    }
  };

  audio.activeHtmlPlayers.add(player);
  player.addEventListener("ended", release, { once: true });
  player.addEventListener("error", () => {
    release();
    if (onError) onError();
  }, { once: true });

  try {
    const playRes = player.play();
    if (playRes && typeof playRes.catch === "function") {
      playRes.catch(() => {
        release();
        if (onError) onError();
      });
    }
  } catch {
    release();
    if (onError) onError();
    return false;
  }

  return true;
}

function scheduleCucarachaHornPattern(ctx, kind, t0, amp) {
  if (!ctx) return;
  if (kind === "attention") {
    scheduleHornBlast(ctx, t0 + 0.00, 659.25, 0.12, amp, { wobbleHz: 4.4, wobbleCents: 9.5, attack: 0.006 });
    scheduleHornBlast(ctx, t0 + 0.14, 659.25, 0.12, amp, { wobbleHz: 4.4, wobbleCents: 9.5, attack: 0.006 });
    scheduleHornBlast(ctx, t0 + 0.28, 659.25, 0.12, amp, { wobbleHz: 4.4, wobbleCents: 9.5, attack: 0.006 });
    scheduleHornBlast(ctx, t0 + 0.46, 523.25, 0.14, amp * 0.96, {
      wobbleHz: 4.2,
      wobbleCents: 8.8,
      attack: 0.006
    });
    scheduleHornBlast(ctx, t0 + 0.64, 698.46, 0.14, amp, { wobbleHz: 4.7, wobbleCents: 9.8, attack: 0.006 });
    scheduleHornBlast(ctx, t0 + 0.82, 659.25, 0.18, amp, { wobbleHz: 4.4, wobbleCents: 9.5, attack: 0.006 });
    return;
  }

  scheduleHornBlast(ctx, t0 + 0.00, 523.25, 0.11, amp * 0.95, { wobbleHz: 4.1, wobbleCents: 8.2, attack: 0.006 });
  scheduleHornBlast(ctx, t0 + 0.14, 523.25, 0.11, amp * 0.95, { wobbleHz: 4.1, wobbleCents: 8.2, attack: 0.006 });
  scheduleHornBlast(ctx, t0 + 0.29, 587.33, 0.11, amp * 0.96, { wobbleHz: 4.3, wobbleCents: 8.6, attack: 0.006 });
  scheduleHornBlast(ctx, t0 + 0.43, 659.25, 0.11, amp, { wobbleHz: 4.5, wobbleCents: 9.2, attack: 0.006 });
  scheduleHornBlast(ctx, t0 + 0.57, 698.46, 0.11, amp, { wobbleHz: 4.8, wobbleCents: 10, attack: 0.006 });
  scheduleHornBlast(ctx, t0 + 0.71, 659.25, 0.11, amp * 0.98, { wobbleHz: 4.5, wobbleCents: 9.2, attack: 0.006 });
  scheduleHornBlast(ctx, t0 + 0.85, 587.33, 0.11, amp * 0.96, { wobbleHz: 4.3, wobbleCents: 8.6, attack: 0.006 });
  scheduleHornBlast(ctx, t0 + 0.99, 523.25, 0.18, amp, { wobbleHz: 4.1, wobbleCents: 8.2, attack: 0.006 });
}

function scheduleClassicPattern(ctx, kind, t0, amp) {
  if (!ctx) return;
  if (kind === "attention") {
    scheduleBeep(ctx, t0 + 0.00, 880, 0.09, amp);
    scheduleBeep(ctx, t0 + 0.14, 880, 0.09, amp);
    scheduleBeep(ctx, t0 + 0.30, 660, 0.14, amp);
    return;
  }
  scheduleBeep(ctx, t0 + 0.00, 523.25, 0.09, amp);
  scheduleBeep(ctx, t0 + 0.12, 659.25, 0.12, amp);
}

function scheduleGoatBleat(ctx, when, amp, opts) {
  const o = opts && typeof opts === "object" ? opts : {};
  const a = Math.max(0.0001, amp);
  const d = clampNumber(o.durationSec, 0.08, 0.9, 0.33);
  const baseHz = clampNumber(o.baseFreqHz, 90, 520, 220);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const band = ctx.createBiquadFilter();
  const low = ctx.createBiquadFilter();

  osc.type = "sawtooth";

  // Frequency contour: quick rise + wobble + fall (bleat-ish).
  const f0 = baseHz * 2.1;
  const f1 = baseHz * 3.0;
  const f2 = baseHz * 1.25;
  const f3 = baseHz * 1.75;
  osc.frequency.setValueAtTime(f0, when);
  osc.frequency.linearRampToValueAtTime(f1, when + d * 0.18);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), when + d * 0.58);
  osc.frequency.linearRampToValueAtTime(f3, when + d);

  // Vibrato via detune (cents).
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(9.5, when);
  lfoGain.gain.setValueAtTime(clampNumber(o.vibratoCents, 5, 120, 38), when);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.detune);

  // Simple formant-ish filtering.
  band.type = "bandpass";
  band.frequency.setValueAtTime(clampNumber(o.formantHz, 500, 3000, 1200), when);
  band.Q.setValueAtTime(clampNumber(o.formantQ, 0.5, 20, 6), when);
  low.type = "lowpass";
  low.frequency.setValueAtTime(3200, when);
  low.Q.setValueAtTime(0.7, when);

  // Envelope to avoid clicks.
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(a, when + Math.min(0.02, d * 0.25));
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, a * 0.7), when + d * 0.22);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + d);

  // Breath/noise transient.
  scheduleNoiseBurst(ctx, when, Math.min(0.12, d * 0.4), a * 0.14, { freqHz: 2600, q: 3 });

  osc.connect(band);
  band.connect(low);
  low.connect(gain);
  gain.connect(ctx.destination);

  osc.start(when);
  lfo.start(when);
  osc.stop(when + d + 0.05);
  lfo.stop(when + d + 0.05);
}

function playSound(kind, opts) {
  const s = state.settings || {};
  const overrideVolumePct = opts && Object.prototype.hasOwnProperty.call(opts, "volumePct") ? opts.volumePct : null;
  const volumePct = clampNumber(overrideVolumePct != null ? overrideVolumePct : s.soundVolume, 0, 100, 35);
  const volume01 = volumePct / 100;
  if (volume01 <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Oscillators can be deceptively quiet at low gains; allow more headroom at 100
  // without making the default feel extreme.
  const run = () => {
    if (ctx.state !== "running") return;
    const overridePreset = opts && Object.prototype.hasOwnProperty.call(opts, "preset") ? opts.preset : null;
    const preset = normalizeSoundPreset(overridePreset != null ? overridePreset : s.soundPreset);

    const MAX_AMP = 0.5;
    const CURVE = 2.35;
    let amp = MAX_AMP * Math.pow(volume01, CURVE);
    if (preset === "chime") amp *= 0.85;
    else if (preset === "bell") amp *= 0.75;
    else if (preset === "pop") amp *= 0.55;
    else if (preset === "arcade") amp *= 0.55;
    else if (preset === "cucaracha") amp *= 0.62;
    else if (preset === "goat") amp *= 0.6;
    const t0 = ctx.currentTime + 0.01;
    if (sampleUrlForPreset(preset)) {
      const sampleVolume01 = clampNumber(volume01 * (preset === "cucaracha" ? 1.05 : 1), 0, 1, volume01);
      const fallback = () => {
        if (preset === "cucaracha") scheduleCucarachaHornPattern(ctx, kind, t0, amp);
        else scheduleClassicPattern(ctx, kind, t0, amp);
      };
      const played = playPresetSample(preset, sampleVolume01, { onError: fallback });
      if (!played) fallback();
      return;
    }

    if (kind === "attention") {
      if (preset === "classic") {
        scheduleBeep(ctx, t0 + 0.00, 880, 0.09, amp);
        scheduleBeep(ctx, t0 + 0.14, 880, 0.09, amp);
        scheduleBeep(ctx, t0 + 0.30, 660, 0.14, amp);
      } else if (preset === "chime") {
        scheduleTone(ctx, t0 + 0.00, 1046.5, 0.07, amp, {
          type: "triangle",
          attack: 0.005,
          release: 0.09
        });
        scheduleTone(ctx, t0 + 0.11, 1046.5, 0.07, amp, {
          type: "triangle",
          attack: 0.005,
          release: 0.09
        });
        scheduleTone(ctx, t0 + 0.24, 783.99, 0.22, amp * 0.95, {
          type: "triangle",
          attack: 0.005,
          release: 0.14
        });
      } else if (preset === "pop") {
        scheduleTone(ctx, t0 + 0.00, 1500, 0.03, amp, { type: "square", attack: 0.001, release: 0.012 });
        scheduleTone(ctx, t0 + 0.09, 1500, 0.03, amp, { type: "square", attack: 0.001, release: 0.012 });
        scheduleTone(ctx, t0 + 0.20, 1100, 0.05, amp, { type: "square", attack: 0.001, release: 0.016 });
      } else if (preset === "bell") {
        scheduleBellStrike(ctx, t0 + 0.00, 880, amp);
        scheduleBellStrike(ctx, t0 + 0.20, 880, amp);
        scheduleBellStrike(ctx, t0 + 0.44, 659.25, amp * 0.95);
      } else if (preset === "arcade") {
        scheduleTone(ctx, t0 + 0.00, 1400, 0.10, amp, { type: "square", endFreqHz: 700, attack: 0.001, release: 0.04 });
        scheduleTone(ctx, t0 + 0.14, 1400, 0.10, amp, { type: "square", endFreqHz: 700, attack: 0.001, release: 0.04 });
        scheduleTone(ctx, t0 + 0.28, 700, 0.10, amp * 0.95, {
          type: "square",
          endFreqHz: 520,
          attack: 0.001,
          release: 0.05
        });
      } else if (preset === "goat") {
        scheduleGoatBleat(ctx, t0 + 0.00, amp, { durationSec: 0.34, baseFreqHz: 210 });
        scheduleGoatBleat(ctx, t0 + 0.26, amp * 0.92, { durationSec: 0.30, baseFreqHz: 190, vibratoCents: 44 });
      } else {
        scheduleBeep(ctx, t0 + 0.00, 880, 0.09, amp);
        scheduleBeep(ctx, t0 + 0.14, 880, 0.09, amp);
        scheduleBeep(ctx, t0 + 0.30, 660, 0.14, amp);
      }
      return;
    }

    if (kind === "done") {
      if (preset === "classic") {
        scheduleBeep(ctx, t0 + 0.00, 523.25, 0.09, amp);
        scheduleBeep(ctx, t0 + 0.12, 659.25, 0.12, amp);
      } else if (preset === "chime") {
        scheduleTone(ctx, t0 + 0.00, 523.25, 0.08, amp * 0.95, { type: "triangle", attack: 0.005, release: 0.11 });
        scheduleTone(ctx, t0 + 0.10, 659.25, 0.08, amp * 0.95, { type: "triangle", attack: 0.005, release: 0.11 });
        scheduleTone(ctx, t0 + 0.22, 783.99, 0.24, amp, { type: "triangle", attack: 0.005, release: 0.15 });
      } else if (preset === "pop") {
        scheduleTone(ctx, t0 + 0.00, 1000, 0.03, amp, { type: "square", attack: 0.001, release: 0.012 });
        scheduleTone(ctx, t0 + 0.10, 1500, 0.04, amp, { type: "square", attack: 0.001, release: 0.016 });
      } else if (preset === "bell") {
        scheduleBellStrike(ctx, t0 + 0.00, 523.25, amp);
        scheduleBellStrike(ctx, t0 + 0.14, 659.25, amp * 0.95);
      } else if (preset === "arcade") {
        scheduleTone(ctx, t0 + 0.00, 700, 0.10, amp, { type: "square", endFreqHz: 1400, attack: 0.001, release: 0.04 });
        scheduleTone(ctx, t0 + 0.14, 1400, 0.08, amp * 0.95, {
          type: "square",
          endFreqHz: 1800,
          attack: 0.001,
          release: 0.03
        });
      } else if (preset === "goat") {
        scheduleGoatBleat(ctx, t0 + 0.00, amp * 0.95, { durationSec: 0.28, baseFreqHz: 230 });
      } else {
        scheduleBeep(ctx, t0 + 0.00, 523.25, 0.09, amp);
        scheduleBeep(ctx, t0 + 0.12, 659.25, 0.12, amp);
      }
    }
  };

  if (ctx.state === "suspended") {
    ctx
      .resume()
      .then(run)
      .catch(() => {
        // ignored
      });
    return;
  }

  run();
}

function maybePlayStatusSound(prevStatus, nextStatus) {
  if (!nextStatus || nextStatus === prevStatus) return;

  const prevLane = prevStatus ? pickLane(prevStatus) : "";
  const nextLane = pickLane(nextStatus);
  if (prevLane === nextLane) return;

  const s = state.settings || {};
  if (nextLane === "attention" && !!s.soundOnNeedsAttention) {
    playSound("attention");
  } else if (nextLane === "done" && !!s.soundOnDone) {
    playSound("done");
  }
}

function lastAssistantPreview(job) {
  const msgs = job.messages || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    if (msgs[i].role !== "assistant") continue;
    if (!msgs[i].text) continue;
    return truncateText(String(msgs[i].text).trimEnd(), 900);
  }
  return "";
}

function lastUserPromptPreview(job) {
  const prompts = job && Array.isArray(job.prompts) ? job.prompts : [];
  for (let i = prompts.length - 1; i >= 0; i -= 1) {
    const p = prompts[i];
    const t = p && typeof p.text === "string" ? p.text.trimEnd() : "";
    if (t) return truncateText(t, 900);
  }
  const meta = job && typeof job.promptPreview === "string" ? job.promptPreview.trimEnd() : "";
  return meta ? truncateText(meta, 900) : "";
}

function jobHasCommandExecution(job) {
  const logs = (job && job.logs) || [];
  for (let i = logs.length - 1; i >= 0; i -= 1) {
    const entry = logs[i];
    if (!entry || entry.kind !== "codex") continue;
    const d = entry.data && typeof entry.data === "object" ? entry.data : {};
    const type = d.type;
    const item = d.item && typeof d.item === "object" ? d.item : null;
    if ((type === "item.started" || type === "item.completed") && item && item.type === "command_execution") return true;
  }
  return false;
}

function cardPreview(job) {
  if (!job) return { text: "…", live: false };
  const uiStatus = jobStatusForUi(job);
  if (uiStatus === "running") {
    if (job.integratingToDefault === true) return { text: "Integrating to default branch…", live: true };
    if (jobHasCommandExecution(job)) {
      const tail = buildLogTail(job, 6);
      if (tail) return { text: tail, live: true };
    }
    const prompt = lastUserPromptPreview(job);
    return { text: prompt || "Working…", live: true };
  }

  const preview = lastAssistantPreview(job);
  if (preview) return { text: preview, live: false };

  const metaPreview = typeof job.previewText === "string" ? job.previewText.trim() : "";
  if (metaPreview) return { text: metaPreview, live: false };

  const tail = buildLogTail(job, 2);
  return { text: tail || "…", live: false };
}

function normalizeShortName(value) {
  const s = typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
  if (!s) return "";
  return s.slice(0, 16);
}

function suggestShortNameFromProjectName(name) {
  const raw = String(name || "").trim();
  if (!raw) return "";

  const parts = raw.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length >= 2) {
    return parts
      .map((p) => (p ? p[0] : ""))
      .join("")
      .slice(0, 4)
      .toUpperCase();
  }

  const compact = raw.replaceAll(/[^a-zA-Z0-9]/g, "");
  return (compact || raw).slice(0, 4).toUpperCase();
}

function formatProjectPathForDisplay(projectPath) {
  const raw = String(projectPath || "").trim();
  if (!raw) return "";

  // For readability on macOS/Linux/Windows, collapse the user home portion to "~".
  // The full path is still available via title tooltip.
  const norm = raw.replaceAll("\\", "/");
  const mac = norm.match(/^\/Users\/[^/]+(\/.*)?$/);
  if (mac) return `~${mac[1] || ""}`;
  const linux = norm.match(/^\/home\/[^/]+(\/.*)?$/);
  if (linux) return `~${linux[1] || ""}`;
  const win = norm.match(/^[A-Za-z]:\/Users\/[^/]+(\/.*)?$/);
  if (win) return `~${win[1] || ""}`;

  return raw;
}

async function createTemporaryProject(opts = {}) {
  if (!api || typeof api.projectsAddTemporary !== "function") {
    throw new Error("Temporary projects are not supported in this build.");
  }
  const created = await api.projectsAddTemporary(opts);
  if (!created || typeof created !== "object" || !created.id) {
    throw new Error("Could not create temporary project.");
  }

  state.projects = await api.projectsList();
  renderProjects();
  renderBoard();

  const nextId = String(created.id || "").trim();
  if (nextId) {
    els.projectSelect.value = nextId;
    storeProjectId(nextId);
    syncComposerCheckoutModeUi();
  }
  return created;
}

async function removeProjectWithConfirm(projectId, opts = {}) {
  const id = String(projectId || "").trim();
  if (!id) return false;

  const o = opts && typeof opts === "object" ? opts : {};
  const closeDialog = !!o.closeDialog;

  const project = state.projects.find((p) => p && p.id === id) || null;
  const confirmRes = await promptProjectRemove(project);
  if (!confirmRes || !confirmRes.confirmed) return false;

  try {
    setHint("");
    const removed = await api.projectsRemove(id, { deleteFolder: !!confirmRes.deleteFolder });
    if (!removed) return false;

    if (getStoredProjectId() === id) clearStoredProjectId();

    state.projects = await api.projectsList();
    renderProjects();
    renderBoard();

    if (closeDialog) closeProjectDialog();
    return true;
  } catch (err) {
    setHint(String(err && err.message ? err.message : err), "error");
    return false;
  }
}

async function promptEditProjectShortName(projectId, opts = {}) {
  const id = String(projectId || "");
  if (!id) return false;

  const project = state.projects.find((p) => p && p.id === id) || null;
  if (!project) return false;

	const suggested = suggestShortNameFromProjectName(project.name);
	const current = normalizeShortName(project.shortName);
	const def = current || suggested;

	const label = project && project.name ? `"${project.name}"` : "this project";
	const input = await promptText({
	  title: "Project short name",
	  message: `Short name / Kürzel for ${label} (optional):`,
	  label: "Short name / Kürzel",
	  defaultValue: def
	});
	if (input == null) return false;

  const next = normalizeShortName(input);
  if (next === current) return false;

  try {
    await api.projectsUpdate(id, { shortName: next });
    state.projects = await api.projectsList();
    renderProjects();
    renderBoard();
    return true;
  } catch (err) {
    setHint(String(err && err.message ? err.message : err), "error");
    return false;
  }
}

function normalizeCheckoutMode(value) {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "worktree" || raw === "worktrees") return "worktree";
  if (raw === "clone" || raw === "checkout" || raw === "dedicated") return "clone";
  return "inplace";
}

function normalizeBranchName(value) {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return "";
  const stripped = s.startsWith("origin/") ? s.slice("origin/".length) : s;
  return stripped.slice(0, 200);
}

async function refreshProjectGitInfo(projectId) {
  const id = String(projectId || "").trim();
  if (!id) return null;
  if (!api || typeof api.projectsGitInfo !== "function") return null;

  try {
    const info = await api.projectsGitInfo(id);
    const p = state.projects.find((x) => x && x.id === id) || null;
    if (p && info && typeof info === "object") {
      p.gitBranch = typeof info.branch === "string" ? info.branch : "";
      p.gitSha = typeof info.sha === "string" ? info.sha : "";
      p.gitDetached = !!info.detached;
      p.gitDirty = !!info.dirty;
      p.gitError = typeof info.error === "string" ? info.error : "";
      renderProjects();
    }
    return info;
  } catch {
    return null;
  }
}

function renderProjectDialogMeta(project) {
  if (!els.projectDialogMeta) return;
  const p = project && typeof project === "object" ? project : {};
  const fullPath = String(p.path || "");
  const displayPath = formatProjectPathForDisplay(fullPath);
  const bits = [];
  if (displayPath) bits.push(`path=${displayPath}`);
  const br = typeof p.gitBranch === "string" ? p.gitBranch.trim() : "";
  if (br) bits.push(`branch=${br}${p.gitDirty ? "*" : ""}`);
  if (typeof p.checkoutMode === "string" && p.checkoutMode) bits.push(`checkout=${normalizeCheckoutMode(p.checkoutMode)}`);
  if (typeof p.defaultBranch === "string" && p.defaultBranch.trim()) bits.push(`default=${p.defaultBranch.trim()}`);
  els.projectDialogMeta.textContent = bits.join("  ");
  els.projectDialogMeta.title = fullPath ? `path=${fullPath}` : "";
}

async function openProjectDialog(projectId) {
  const id = String(projectId || "").trim();
  if (!id || !els.projectDialog) return false;
  const project = state.projects.find((p) => p && p.id === id) || null;
  if (!project) return false;

  state.editingProjectId = id;
  if (els.projectDialogTitle) els.projectDialogTitle.textContent = project.name ? `Project: ${project.name}` : "Project";

  if (els.projectNameInput) els.projectNameInput.value = String(project.name || "");
  if (els.projectShortNameInput) els.projectShortNameInput.value = normalizeShortName(project.shortName || "");
  if (els.projectDefaultBranchInput) els.projectDefaultBranchInput.value = normalizeBranchName(project.defaultBranch || "");
  if (els.projectCheckoutModeSelect) els.projectCheckoutModeSelect.value = normalizeCheckoutMode(project.checkoutMode);
  if (els.projectDialogOpenFinderBtn) {
    const fullPath = String(project.path || "").trim();
    const isTemporary = !!project.isTemporary;
    const canOpenPath = isTemporary && !!fullPath && api && typeof api.shellOpenPath === "function";
    els.projectDialogOpenFinderBtn.hidden = !isTemporary;
    els.projectDialogOpenFinderBtn.disabled = !canOpenPath;
    els.projectDialogOpenFinderBtn.title = fullPath ? fullPath : "";
  }

  renderProjectDialogMeta(project);

  try {
    els.projectDialog.showModal();
  } catch {
    // ignore
  }

  try {
    if (els.projectNameInput) els.projectNameInput.focus();
  } catch {
    // ignore
  }

  // Refresh branch info in the background so the dialog stays accurate if the user switched branches outside the app.
  void refreshProjectGitInfo(id).then(() => {
    const p2 = state.projects.find((p) => p && p.id === id) || null;
    if (p2) renderProjectDialogMeta(p2);
  });

  return true;
}

function closeProjectDialog() {
  state.editingProjectId = "";
  try {
    if (els.projectDialog && els.projectDialog.open) els.projectDialog.close();
  } catch {
    // ignore
  }
}

async function saveProjectDialog() {
  const id = String(state.editingProjectId || "").trim();
  if (!id) return;
  const project = state.projects.find((p) => p && p.id === id) || null;
  if (!project) return;

  const patch = {};
  const nextName = els.projectNameInput ? String(els.projectNameInput.value || "").trim() : "";
  if (nextName && nextName !== String(project.name || "")) patch.name = nextName;

  const nextShort = els.projectShortNameInput ? normalizeShortName(els.projectShortNameInput.value || "") : "";
  const curShort = normalizeShortName(project.shortName || "");
  if (nextShort !== curShort) patch.shortName = nextShort;

  const nextDef = els.projectDefaultBranchInput ? normalizeBranchName(els.projectDefaultBranchInput.value || "") : "";
  const curDef = normalizeBranchName(project.defaultBranch || "");
  if (nextDef !== curDef) patch.defaultBranch = nextDef;

  const nextMode = els.projectCheckoutModeSelect ? normalizeCheckoutMode(els.projectCheckoutModeSelect.value) : "inplace";
  const curMode = normalizeCheckoutMode(project.checkoutMode);
  if (nextMode !== curMode) patch.checkoutMode = nextMode;

  try {
    setHint("");
    if (Object.keys(patch).length > 0) await api.projectsUpdate(id, patch);
    state.projects = await api.projectsList();
    renderProjects();
    renderBoard();
    closeProjectDialog();
  } catch (err) {
    setHint(String(err && err.message ? err.message : err), "error");
  }
}

function fmtAge(ms) {
  const t = Number(ms);
  if (!Number.isFinite(t) || t <= 0) return "";
  const age = Math.max(0, Date.now() - t);
  const dayMs = 24 * 60 * 60 * 1000;
  if (age >= dayMs) {
    const d = Math.floor(age / dayMs);
    const h = Math.floor((age % dayMs) / (60 * 60 * 1000));
    return `${d}d ${h}h ago`;
  }
  return `${fmtElapsed(age)} ago`;
}

function closeCheckoutsDialog() {
  state.checkoutsProjectId = "";
  state.checkoutsEntries = [];
  state.checkoutsLoading = false;
  try {
    if (els.checkoutsDialog && els.checkoutsDialog.open) els.checkoutsDialog.close();
  } catch {
    // ignore
  }
}

function renderCheckoutsDialog() {
  if (!els.checkoutsDialogBody) return;

  const entries = Array.isArray(state.checkoutsEntries) ? state.checkoutsEntries : [];
  if (state.checkoutsLoading) {
    els.checkoutsDialogBody.innerHTML = `<div class="logline">Loading…</div>`;
    return;
  }

  if (entries.length === 0) {
    els.checkoutsDialogBody.innerHTML = `<div class="logline">No checkouts found for this project.</div>`;
    return;
  }

  const head = `
    <div class="checkoutrow checkoutrow--head" role="row">
      <div class="checkoutcell" role="columnheader">Kind</div>
      <div class="checkoutcell" role="columnheader">Job</div>
      <div class="checkoutcell" role="columnheader">Updated</div>
      <div class="checkoutcell" role="columnheader">Path</div>
      <div class="checkoutcell" role="columnheader">Actions</div>
    </div>
  `;

  const rows = entries
    .map((e) => {
      const kind = e && typeof e.kind === "string" ? e.kind : "";
      const jobId = e && typeof e.jobId === "string" ? e.jobId : "";
      const p = e && typeof e.path === "string" ? e.path : "";
      const pDisp = formatProjectPathForDisplay(p);
      const age = fmtAge(e && typeof e.mtimeMs === "number" ? e.mtimeMs : 0);
      const title = p ? p : "";

      const job = jobId ? state.jobs.get(jobId) : null;
      const inUse = !!(job && jobStatusForUi(job) === "running");

      return `
        <div class="checkoutrow" role="row">
          <div class="checkoutcell" role="cell"><div class="checkoutpill">${escapeHtml(kind || "?")}</div></div>
          <div class="checkoutcell" role="cell"><div class="checkoutpill" title="${escapeHtml(jobId)}">${escapeHtml(jobId)}</div></div>
          <div class="checkoutcell" role="cell"><div class="checkoutpill" title="${escapeHtml(String(e && e.mtimeMs ? new Date(e.mtimeMs).toISOString() : ""))}">${escapeHtml(age)}</div></div>
          <div class="checkoutcell" role="cell"><div class="checkoutpath" title="${escapeHtml(title)}">${escapeHtml(pDisp || p)}</div></div>
          <div class="checkoutcell" role="cell">
            <div class="checkoutactions">
              <button class="btn btn--ghost" type="button" data-checkout-open-kind="${escapeHtml(kind)}" data-checkout-open-job="${escapeHtml(jobId)}">Reveal</button>
              <button class="btn btn--danger" type="button" data-checkout-remove-kind="${escapeHtml(kind)}" data-checkout-remove-job="${escapeHtml(jobId)}" ${inUse ? "disabled" : ""} title="${inUse ? "In use by a running job" : "Remove checkout"}">
                Remove
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  els.checkoutsDialogBody.innerHTML = `${head}${rows}`;
}

async function loadCheckouts(projectId) {
  const id = String(projectId || "").trim();
  if (!id) return;
  if (!api || typeof api.checkoutsList !== "function") return;

  state.checkoutsLoading = true;
  renderCheckoutsDialog();
  try {
    const entries = await api.checkoutsList(id);
    state.checkoutsEntries = Array.isArray(entries) ? entries : [];
  } catch {
    state.checkoutsEntries = [];
  } finally {
    state.checkoutsLoading = false;
    renderCheckoutsDialog();
  }
}

async function openCheckoutsDialog(projectId) {
  const id = String(projectId || "").trim();
  if (!id || !els.checkoutsDialog) return false;

  const project = state.projects.find((p) => p && p.id === id) || null;
  if (!project) return false;

  state.checkoutsProjectId = id;
  if (els.checkoutsDialogMeta) {
    const label = project && project.name ? project.name : id;
    const pDisp = formatProjectPathForDisplay(project.path);
    const bits = [];
    bits.push(`project=${label}`);
    if (pDisp) bits.push(`path=${pDisp}`);
    els.checkoutsDialogMeta.textContent = bits.join("  ");
    els.checkoutsDialogMeta.title = project.path ? `path=${project.path}` : "";
  }

  state.checkoutsEntries = [];
  state.checkoutsLoading = true;
  renderCheckoutsDialog();

  try {
    els.checkoutsDialog.showModal();
  } catch {
    // ignore
  }

  await loadCheckouts(id);
  return true;
}

function resolveBranchDialog(action) {
  const r = state.branchDialogResolver;
  state.branchDialogResolver = null;
  try {
    if (els.branchDialog && els.branchDialog.open) els.branchDialog.close();
  } catch {
    // ignore
  }
  if (typeof r === "function") r(action);
}

function promptBranchMismatch({ projectName, projectPath, currentBranch, defaultBranch, dirty }) {
  if (!els.branchDialog) return Promise.resolve("run");
  const name = String(projectName || "Project");
  const cur = String(currentBranch || "").trim();
  const def = String(defaultBranch || "").trim();
  const pathDisp = formatProjectPathForDisplay(projectPath);
  if (els.branchDialogMeta) {
    const bits = [];
    if (name) bits.push(`project=${name}`);
    if (pathDisp) bits.push(`path=${pathDisp}`);
    if (dirty) bits.push("dirty=true");
    els.branchDialogMeta.textContent = bits.join("  ");
    els.branchDialogMeta.title = projectPath ? `path=${projectPath}` : "";
  }
  if (els.branchDialogText) {
    els.branchDialogText.textContent =
      `You are currently on "${cur || "?"}", but this project's default branch is "${def || "?"}".\n` +
      `Du bist gerade nicht im Default-Branch.\n\n` +
      `Checkout the default branch first (safer), run anyway on the current branch, or cancel.\n` +
      `Default-Branch auschecken (sicherer), trotzdem starten, oder abbrechen.`;
  }

  return new Promise((resolve) => {
    state.branchDialogResolver = resolve;
    try {
      els.branchDialog.showModal();
    } catch {
      resolve("run");
    }
  });
}

function renderHelperContextScopeOptions(opts = {}) {
  if (!els.helperContextScopeSelect) return;
  const o = opts && typeof opts === "object" ? opts : {};
  const forceStored = !!o.forceStored;
  const fallbackProjectId = helperDefaultProjectIdForContext();
  const currentRaw = String(els.helperContextScopeSelect.value || "").trim();
  const storedRaw = getStoredHelperContextScope();
  const wanted = normalizeHelperContextScope(forceStored ? storedRaw : currentRaw || storedRaw, { defaultProjectId: fallbackProjectId });

  const scopeOpts = [
    `<option value="${HELPER_CONTEXT_GLOBAL_VALUE}">Context: Global</option>`,
    ...state.projects.map((p) => {
      const shortName = normalizeShortName(p.shortName);
      const baseLabel = shortName ? `${shortName} · ${p.name}` : p.name;
      const label = p && p.isTemporary ? `TMP · ${baseLabel}` : baseLabel;
      const value = helperContextValueForProjectId(p && p.id ? p.id : "");
      return `<option value="${escapeHtml(value)}">Context: ${escapeHtml(label)}</option>`;
    })
  ];
  const wantedProjectId = helperProjectIdFromContextValue(wanted);
  if (wantedProjectId && !state.projects.some((p) => p && String(p.id || "").trim() === wantedProjectId)) {
    const wantedValue = helperContextValueForProjectId(wantedProjectId);
    scopeOpts.push(`<option value="${escapeHtml(wantedValue)}">Context: Project</option>`);
  }
  els.helperContextScopeSelect.innerHTML = scopeOpts.join("");

  let next = wanted;
  if (!selectHasOptionValue(els.helperContextScopeSelect, next)) {
    const fallbackValue = fallbackProjectId ? helperContextValueForProjectId(fallbackProjectId) : HELPER_CONTEXT_GLOBAL_VALUE;
    next = selectHasOptionValue(els.helperContextScopeSelect, fallbackValue) ? fallbackValue : HELPER_CONTEXT_GLOBAL_VALUE;
  }
  els.helperContextScopeSelect.value = next;
  if (!o.skipStore) storeHelperContextScope(next);
}

function renderProjects() {
  els.projectsList.innerHTML = state.projects
    .map((p) => {
      const color = normalizeHexColor(p.color) || "#64d8a3";
      const shortName = normalizeShortName(p.shortName);
      const isTemporary = !!p.isTemporary;
      const branch = typeof p.gitBranch === "string" ? p.gitBranch.trim() : "";
      const dirty = !!p.gitDirty;
      const branchHtml = branch
        ? `<span class="project__branch ${dirty ? "project__branch--dirty" : ""}" title="Current branch${dirty ? " (dirty)" : ""}">${escapeHtml(branch)}</span>`
        : "";
      const tempHtml = isTemporary ? `<span class="project__tag" title="Temporary project">TMP</span>` : "";
      const fullPath = String(p.path || "");
      const displayPath = formatProjectPathForDisplay(fullPath);
      return `
        <div class="project" style="--proj-color: ${escapeHtml(color)}">
          <input
            class="project__swatch"
            type="color"
            value="${escapeHtml(color)}"
            data-project-color="${escapeHtml(p.id)}"
            title="Project color"
            aria-label="Project color"
          />
          <div class="project__main" role="button" tabindex="0" data-project-edit="${escapeHtml(p.id)}" title="Project settings">
            <div class="project__name">
              <span class="project__nametext">${escapeHtml(p.name)}</span>
              ${tempHtml}
              ${shortName ? `<span class="project__abbr" title="Short name / Kürzel">${escapeHtml(shortName)}</span>` : ""}
            </div>
            <div class="project__path" title="${escapeHtml(fullPath)}">${escapeHtml(displayPath)}</div>
          </div>
          <div class="project__actions">${branchHtml}</div>
        </div>
      `;
    })
    .join("");

  // project select
  const current = els.projectSelect.value;
  const opts = [
    `<option value="">Select project…</option>`,
    `<option value="${TEMP_PROJECT_OPTION_VALUE}">Temporary: new empty folder</option>`,
    state.projects.length > 0 ? `<option value="auto">Auto (match by name)</option>` : "",
    ...state.projects.map((p) => {
      const shortName = normalizeShortName(p.shortName);
      const baseLabel = shortName ? `${shortName} · ${p.name}` : p.name;
      const label = p && p.isTemporary ? `TMP · ${baseLabel}` : baseLabel;
      return `<option value="${escapeHtml(p.id)}">${escapeHtml(label)}</option>`;
    })
  ].filter(Boolean);
  els.projectSelect.innerHTML = opts.join("");
  if (current) els.projectSelect.value = current;
  applyDefaultProjectSelection();
  syncComposerCheckoutModeUi();
  renderHelperContextScopeOptions({ skipStore: true });

  // project filter select (Board)
  if (els.projectFilterSelect) {
    const stored = getStoredProjectFilterId();
    const currentFilter = String(els.projectFilterSelect.value || "").trim();
    const want = currentFilter || String(state.projectFilterId || "").trim() || String(stored || "").trim();

    const filterOpts = [
      `<option value="">All projects</option>`,
      ...state.projects.map((p) => {
        const shortName = normalizeShortName(p.shortName);
        const label = shortName ? `${shortName} · ${p.name}` : p.name;
        return `<option value="${escapeHtml(p.id)}">${escapeHtml(label)}</option>`;
      })
    ];
    els.projectFilterSelect.innerHTML = filterOpts.join("");

    if (want && selectHasOptionValue(els.projectFilterSelect, want)) {
      els.projectFilterSelect.value = want;
      state.projectFilterId = want;
    } else {
      els.projectFilterSelect.value = "";
      state.projectFilterId = "";
      storeProjectFilterId("");
    }

    const wrap = els.projectFilterSelect.closest ? els.projectFilterSelect.closest(".filterctl") : null;
    if (wrap) wrap.hidden = state.projects.length <= 1 && !state.projectFilterId;
  }

  helperSetMeta(helperCurrentMetaStatusText());
}

function setLaneHidden(laneEl, hidden) {
  const wrap = laneEl && laneEl.closest ? laneEl.closest(".lane") : null;
  if (!wrap) return;
  wrap.hidden = !!hidden;
}

function syncBoardLaneVisibility() {
  // Keep all board lanes visible so one non-empty lane never expands to full width.
  // Popout lane windows are still controlled by applyViewLayout via state.focusLane.
  if (state.view !== "board") return;
  if (state.focusLane) return;
  setLaneHidden(els.laneRunning, false);
  setLaneHidden(els.laneAttention, false);
  setLaneHidden(els.laneDone, false);
}

function setLaneTitle(laneEl, title) {
  const wrap = laneEl && laneEl.closest ? laneEl.closest(".lane") : null;
  if (!wrap) return;
  const t = wrap.querySelector(".lane__titleText") || wrap.querySelector(".lane__title");
  if (t) t.textContent = String(title || "");
}

function setLanePopoutsHidden(hidden) {
  document.querySelectorAll("[data-popout-lane]").forEach((btn) => {
    btn.hidden = !!hidden;
  });
}

function setDisplayModeButtons(mode) {
  document.querySelectorAll(".seg__btn[data-display-mode]").forEach((btn) => {
    const v = btn.getAttribute("data-display-mode") || "";
    const active = v === mode;
    btn.classList.toggle("seg__btn--active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function setViewButtons(view) {
  document.querySelectorAll(".seg__btn[data-view]").forEach((btn) => {
    const v = btn.getAttribute("data-view") || "";
    const active = v === view;
    btn.classList.toggle("seg__btn--active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function applyViewLayout() {
  const v = normalizeView(state.view);
  const display = normalizeDisplayMode(state.displayMode);
  const showCards = display === "cards";
  const showTable = display === "table";

  if (els.boardSection) els.boardSection.hidden = !showCards;
  if (els.sessionsTableSection) els.sessionsTableSection.hidden = !showTable;
  if (els.tableScopeCtl) els.tableScopeCtl.hidden = !showTable;
  if (els.tableScopeSelect && els.tableScopeSelect.value !== state.tableScope) {
    els.tableScopeSelect.value = state.tableScope;
  }

  setLanePopoutsHidden(!showCards || v !== "board" || !!state.focusLane);

  if (!showCards) return;

  if (v === "archive") {
    setLaneHidden(els.laneRunning, false);
    setLaneHidden(els.laneAttention, true);
    setLaneHidden(els.laneDone, true);
    setLaneTitle(els.laneRunning, "Archived");
    return;
  }

  if (v === "trash") {
    setLaneHidden(els.laneRunning, false);
    setLaneHidden(els.laneAttention, true);
    setLaneHidden(els.laneDone, true);
    setLaneTitle(els.laneRunning, "Trash");
    return;
  }

  // v === "board"
  setLaneHidden(els.laneRunning, false);
  setLaneHidden(els.laneAttention, false);
  setLaneHidden(els.laneDone, false);
  setLaneTitle(els.laneRunning, "Running");
  setLaneTitle(els.laneAttention, "Needs Attention");
  setLaneTitle(els.laneDone, "Done");

  if (state.focusLane) {
    setLaneHidden(els.laneRunning, state.focusLane !== "running");
    setLaneHidden(els.laneAttention, state.focusLane !== "attention");
    setLaneHidden(els.laneDone, state.focusLane !== "done");
  }
}

function setView(value) {
  if (state.focusLane) return; // popout windows are locked to the board view
  const next = normalizeView(value);
  if (state.view === next) return;

  if (next === "settings") {
    const current = normalizeView(state.view);
    if (current !== "settings") state.lastMainView = current;
  } else {
    state.lastMainView = next;
  }

  if (next !== "board") state.showAllDone = false;
  state.view = next;
  setViewButtons(next);

  applyViewLayout();
  renderBoard();
  renderSearchUi();
  scheduleStatusDialogRender();
}

function setDisplayMode(value) {
  const next = normalizeDisplayMode(value);
  if (state.displayMode === next) return;
  state.displayMode = next;
  storeDisplayMode(next);
  setDisplayModeButtons(next);
  applyViewLayout();
  renderBoard();
  renderSearchUi();
  scheduleStatusDialogRender();
}

function setTableScope(value) {
  const next = normalizeTableScope(value);
  if (state.tableScope === next) return;
  state.tableScope = next;
  storeTableScope(next);
  if (els.tableScopeSelect && els.tableScopeSelect.value !== next) els.tableScopeSelect.value = next;
  renderBoard();
  renderSearchUi();
  scheduleStatusDialogRender();
}

function setSortMode(value) {
  const next = normalizeSortMode(value);
  if (state.sortMode === next) return;
  state.sortMode = next;
  storeSortMode(next);
  if (els.sortSelect && els.sortSelect.value !== next) els.sortSelect.value = next;
  renderBoard();
  scheduleStatusDialogRender();
}

function boardDoneLimitValue() {
  const s = state.settings && typeof state.settings === "object" ? state.settings : {};
  return clampNumber(s.boardDoneLimit, 0, 5000, 250);
}

function tableLaneKindForJob(job) {
  if (tableScopeIncludesAllBoxes()) {
    const box = jobBox(job);
    if (box === "archive") return "archived";
    if (box === "trash") return "trash";
  } else if (state.view === "archive") {
    return "archived";
  } else if (state.view === "trash") {
    return "trash";
  }
  return pickLane(job && job.status);
}

function tableLaneEnteredMs(job) {
  return jobLaneEnteredMs(job, tableLaneKindForJob(job));
}

function cmpJobsForTable(a, b) {
  const mode = normalizeSortMode(state.sortMode);
  let d = 0;

  if (mode === "duration_longest") {
    d = cmpNumDir(jobDurationMs(a), jobDurationMs(b), "desc");
  } else if (mode === "created_newest") {
    d = cmpNumDir(jobCreatedMs(a), jobCreatedMs(b), "desc");
  } else if (mode === "created_oldest") {
    d = cmpNumDir(jobCreatedMs(a), jobCreatedMs(b), "asc");
  } else if (mode === "lane_oldest") {
    d = cmpNumDir(tableLaneEnteredMs(a), tableLaneEnteredMs(b), "asc");
  } else {
    d = cmpNumDir(tableLaneEnteredMs(a), tableLaneEnteredMs(b), "desc");
  }

  if (d) return d;

  d = cmpNumDir(jobCreatedMs(a), jobCreatedMs(b), "desc");
  if (d) return d;

  const aid = String(a && a.id ? a.id : "");
  const bid = String(b && b.id ? b.id : "");
  return aid.localeCompare(bid);
}

function sortJobsForTable(jobs) {
  const arr = Array.isArray(jobs) ? [...jobs] : [];
  arr.sort((a, b) => cmpJobsForTable(a, b));
  return arr;
}

function pad2(n) {
  return String(Math.max(0, Number(n) || 0)).padStart(2, "0");
}

function fmtDateTimeShort(value) {
  const ms = isoMs(value);
  if (!Number.isFinite(ms)) return "—";
  const d = new Date(ms);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function middleEllipsis(value, { head = 8, tail = 8 } = {}) {
  const s = String(value || "").trim();
  if (!s) return "";
  const h = Math.max(1, Math.trunc(head));
  const t = Math.max(1, Math.trunc(tail));
  if (s.length <= h + t + 1) return s;
  return `${s.slice(0, h)}…${s.slice(-t)}`;
}

function tableBoxLabel(job) {
  const box = jobBox(job);
  if (box === "archive") return "archive";
  if (box === "trash") return "trash";
  return `board/${pickLane(job && job.status)}`;
}

function renderSessionsTable(jobs) {
  if (!els.sessionsTableBody || !els.sessionsTableMeta) return;

  const arr = sortJobsForTable(jobs);
  const scopeLabel = tableScopeIncludesAllBoxes() ? "all sessions" : `view=${state.view}`;
  els.sessionsTableMeta.textContent = `${arr.length} sessions · ${scopeLabel}`;

  if (arr.length === 0) {
    els.sessionsTableBody.innerHTML = `<tr><td colspan="13" class="sessiontable__mono sessiontable__mono--dim">No sessions.</td></tr>`;
    return;
  }

  const rows = arr.map((j) => {
    const title = jobDisplayTitle(j) || "Untitled";
    const project = projectLabelById(j.projectId);
    const projectTitle = projectNameById(j.projectId);
    const agent = agentDisplayName(j.agent);
    const model = String(j.model || "").trim() || "—";
    const created = fmtDateTimeShort(j.createdAt);
    const finished = j.status === "running" ? "—" : fmtDateTimeShort(j.finishedAt);
    const duration = jobDurationText(j);
    const tok = jobTokensCardText(j);
    const tokText = tok ? tok.text : "—";
    const tokTitle = tok ? tok.title : "";
    const thread = String(j.threadId || "").trim();
    const threadShort = thread ? middleEllipsis(thread, { head: 10, tail: 8 }) : "—";
    const exitText = j && j.exitCode == null ? "—" : String(j.exitCode);
    const integrated = integratedBadgeForJob(j);
    const integratedText = integrated ? integrated.text : "—";
    const integratedTitle = integrated ? integrated.title : "";
    const durationAttr = `data-session-duration="${escapeHtml(j.id)}"`;

    return `
      <tr class="sessionrow" data-job-id="${escapeHtml(j.id)}">
        <td>${fmtStatusPill(j.status)}</td>
        <td class="sessiontable__mono">${escapeHtml(tableBoxLabel(j))}</td>
        <td class="sessiontable__title" title="${escapeHtml(oneLine(title))}">${escapeHtml(title)}</td>
        <td title="${escapeHtml(oneLine(projectTitle))}">${escapeHtml(project)}</td>
        <td class="sessiontable__mono">${escapeHtml(agent)}</td>
        <td class="sessiontable__mono" title="${escapeHtml(oneLine(model))}">${escapeHtml(model)}</td>
        <td class="sessiontable__mono" title="${escapeHtml(String(j.createdAt || ""))}">${escapeHtml(created)}</td>
        <td class="sessiontable__mono" title="${escapeHtml(String(j.finishedAt || ""))}">${escapeHtml(finished)}</td>
        <td class="sessiontable__mono" ${durationAttr}>${escapeHtml(duration || "—")}</td>
        <td class="sessiontable__mono sessiontable__tokens" title="${escapeHtml(oneLine(tokTitle))}">${escapeHtml(tokText)}</td>
        <td class="sessiontable__mono" title="${escapeHtml(oneLine(thread))}">${escapeHtml(threadShort)}</td>
        <td class="sessiontable__mono sessiontable__right">${escapeHtml(exitText)}</td>
        <td class="sessiontable__mono" title="${escapeHtml(oneLine(integratedTitle))}">${escapeHtml(integratedText)}</td>
      </tr>
    `;
  });

  els.sessionsTableBody.innerHTML = rows.join("");
}

function renderCardsBoard(jobs) {
  let laneA = [];
  let laneB = [];
  let laneC = [];

  if (state.view === "archive") {
    laneA = sortJobsForLane(jobs, "archived");
  } else if (state.view === "trash") {
    laneA = sortJobsForLane(jobs, "trash");
  } else {
    laneA = sortJobsForLane(
      jobs.filter((j) => pickLane(j) === "running"),
      "running"
    );
    laneB = sortJobsForLane(
      jobs.filter((j) => pickLane(j) === "attention"),
      "attention"
    );
    laneC = sortJobsForLane(
      jobs.filter((j) => pickLane(j) === "done"),
      "done"
    );
  }

  let doneTotal = 0;
  const doneLimit = state.view === "board" ? boardDoneLimitValue() : 0;
  const doneCapped = state.view === "board" && doneLimit > 0 && !state.showAllDone;
  if (state.view === "board") {
    doneTotal = laneC.length;
    if (doneCapped && laneC.length > doneLimit) laneC = laneC.slice(0, doneLimit);
  }

  state.cardEls.clear();
  els.laneRunning.innerHTML = "";
  els.laneAttention.innerHTML = "";
  els.laneDone.innerHTML = "";

  laneA.forEach((j) => mountCard(j, els.laneRunning));
  laneB.forEach((j) => mountCard(j, els.laneAttention));
  if (state.view === "board" && doneLimit > 0 && doneTotal > doneLimit) {
    const bar = document.createElement("div");
    bar.className = "lane__cap";
    bar.setAttribute("data-done-cap-bar", "");
    if (state.showAllDone) {
      bar.innerHTML = `Showing all ${doneTotal} done jobs. <button type="button" class="btn btn--ghost" data-done-cap-action="collapse">Collapse</button>`;
    } else {
      const shown = Math.min(doneLimit, doneTotal);
      bar.innerHTML = `Showing ${shown} of ${doneTotal} done jobs. <button type="button" class="btn btn--ghost" data-done-cap-action="show-all">Show all</button>`;
    }
    els.laneDone.appendChild(bar);
  }
  laneC.forEach((j) => mountCard(j, els.laneDone));

  if (state.view === "board") {
    setLaneTitle(els.laneRunning, laneA.length ? `Running (${laneA.length})` : "Running");
    setLaneTitle(els.laneAttention, laneB.length ? `Needs Attention (${laneB.length})` : "Needs Attention");
    if (doneLimit > 0 && doneTotal > doneLimit && !state.showAllDone) {
      setLaneTitle(els.laneDone, `Done (${Math.min(doneLimit, doneTotal)}/${doneTotal})`);
    } else if (doneTotal) {
      setLaneTitle(els.laneDone, `Done (${doneTotal})`);
    } else {
      setLaneTitle(els.laneDone, "Done");
    }
  }

  syncBoardLaneVisibility();
}

function renderBoard() {
  const jobs = Array.from(state.jobs.values()).filter((j) => jobVisibleInCurrentView(j));
  if (state.displayMode === "table") {
    renderSessionsTable(jobs);
    return;
  }
  renderCardsBoard(jobs);
}

function projectById(id) {
  const pid = String(id || "");
  return state.projects.find((x) => x.id === pid) || null;
}

function projectNameById(id) {
  const pid = String(id || "");
  if (pid === DEMO.projectId) return "Example project";
  const p = projectById(id);
  return p ? p.name : "Unknown";
}

function projectLabelById(id) {
  const pid = String(id || "");
  if (pid === DEMO.projectId) return "DEMO";
  const p = projectById(id);
  if (!p) return "Unknown";
  const shortName = normalizeShortName(p.shortName);
  return shortName || p.name || "Unknown";
}

function projectColorById(id) {
  const pid = String(id || "");
  if (pid === DEMO.projectId) return "#5b9ef5";
  const p = projectById(id);
  return p ? normalizeHexColor(p.color) : "";
}

function integratedBadgeForJob(job) {
  if (!job || typeof job !== "object") return null;
  const atRaw = typeof job.integratedToDefaultAt === "string" ? job.integratedToDefaultAt.trim() : "";
  if (!atRaw) return null;
  const branch = typeof job.integratedToDefaultBranch === "string" ? job.integratedToDefaultBranch.trim() : "";
  const titleBits = ["Integrated into default branch"];
  if (branch) titleBits.push(`branch=${branch}`);
  titleBits.push(`at=${atRaw}`);
  return { text: "Merged", title: titleBits.join("  ") };
}

function renderCard(job) {
  // Kept for reference; we use DOM nodes + textContent updates now.
  const prev = cardPreview(job);
  const sub = `${projectLabelById(job.projectId)}${job.model ? `  ·  ${job.model}` : ""}`;
  const subTitle = `${projectNameById(job.projectId)}${job.model ? `  ·  ${job.model}` : ""}`;
  const integrated = integratedBadgeForJob(job);
  const integratedHiddenAttr = integrated ? "" : " hidden";
  const integratedText = integrated ? integrated.text : "Merged";
  const integratedTitle = integrated ? oneLine(integrated.title) : "";
  const liveCls = prev.live ? " card__preview--live" : "";
  const uiStatus = jobStatusForUi(job);
  const isRunningUi = uiStatus === "running";
  const cardCls = isRunningUi ? "card card--running" : "card";
  const title = jobDisplayTitle(job);
  const projColor = projectColorById(job.projectId) || "transparent";
  const dur = job.integratingToDefault === true ? "Integrating…" : isRunningUi ? jobElapsedText(job) : "";
  const showDuration = job.integratingToDefault === true || isRunningUi;
  const durHiddenAttr = showDuration ? "" : " hidden";
  const metaHiddenAttr = showDuration ? "" : " hidden";
  const ctx = jobContextStepper(job);
  // On the Board, the lane already conveys status (Running/Needs Attention/Done).
  // Keep the pill for non-board views (Archive/Trash) where lanes aren't status-based.
  const showStatusPill = state.view !== "board";
  return `
    <article class="${cardCls}" data-job-id="${escapeHtml(job.id)}" style="--proj-color: ${escapeHtml(projColor)}">
      <div class="card__top">
        <div class="card__head">
          <div class="card__sub">
            <span class="projdot" aria-hidden="true"></span>
            <span class="card__subtext" title="${escapeHtml(oneLine(subTitle))}">${escapeHtml(sub)}</span>
            <span class="card__flag card__flag--merged" data-job-integrated title="${escapeHtml(integratedTitle)}"${integratedHiddenAttr}>${escapeHtml(
              integratedText
            )}</span>
          </div>
          <div class="card__title">${escapeHtml(title)}</div>
        </div>
        ${ctx ? renderCardContextStepper(ctx) : ""}
        ${showStatusPill ? `<div class="card__status">${fmtStatusPill(job)}</div>` : ""}
      </div>
      <div class="card__preview${liveCls}">${renderMarkdownInlineSafeHtml(prev.text || "…")}</div>
      <div class="card__meta"${metaHiddenAttr} data-job-meta>
        <div class="card__duration"${durHiddenAttr} data-job-duration>${escapeHtml(dur)}</div>
      </div>
    </article>
  `;
}

function laneElForStatus(status) {
  const lane = pickLane(status);
  if (lane === "running") return els.laneRunning;
  if (lane === "done") return els.laneDone;
  return els.laneAttention;
}

function createCardEl(job) {
  const tpl = document.createElement("template");
  tpl.innerHTML = renderCard(job).trim();
  return tpl.content.firstElementChild;
}

function insertCardElSorted(job, laneEl, el) {
  if (!laneEl || !el) return;
  const laneKind = laneKindForLaneEl(laneEl);
  const kids = laneEl.children ? Array.from(laneEl.children) : [];

  for (const child of kids) {
    if (!child || child === el) continue;
    const otherId = child.getAttribute ? child.getAttribute("data-job-id") : "";
    if (!otherId) continue;
    const other = state.jobs.get(otherId);
    if (!other) continue;
    if (cmpJobsForLane(job, other, laneKind) < 0) {
      laneEl.insertBefore(el, child);
      return;
    }
  }

  laneEl.appendChild(el);
}

function mountCard(job, laneEl) {
  const el = createCardEl(job);
  if (!el) return;
  laneEl.appendChild(el);
  state.cardEls.set(job.id, el);
}

function mountCardSorted(job, laneEl) {
  const el = createCardEl(job);
  if (!el) return;
  insertCardElSorted(job, laneEl, el);
  state.cardEls.set(job.id, el);
}

function unmountCard(jobId) {
  const existing = state.cardEls.get(jobId) || null;
  if (!existing) return;
  try {
    existing.remove();
  } catch {
    if (existing.parentElement) existing.parentElement.removeChild(existing);
  }
  state.cardEls.delete(jobId);
}

function removeDoneCapBar() {
  const bar = els.laneDone && els.laneDone.querySelector ? els.laneDone.querySelector("[data-done-cap-bar]") : null;
  if (bar) bar.remove();
}

function syncBoardDoneLane() {
  if (state.view !== "board") return;

  const limit = boardDoneLimitValue();
  if (limit <= 0) {
    state.showAllDone = false;
    removeDoneCapBar();
    return;
  }

  const jobs = Array.from(state.jobs.values()).filter((j) => jobVisibleInCurrentView(j));
  const runningJobs = jobs.filter((j) => pickLane(j) === "running");
  const attentionJobs = jobs.filter((j) => pickLane(j) === "attention");
  const doneJobs = sortJobsForLane(
    jobs.filter((j) => pickLane(j) === "done"),
    "done"
  );

  const total = doneJobs.length;
  const showAll = !!state.showAllDone;
  const wantJobs = showAll ? doneJobs : doneJobs.slice(0, limit);
  const wantIds = new Set(wantJobs.map((j) => j.id));

  removeDoneCapBar();

  // Unmount done cards that are outside the cap.
  if (els.laneDone && els.laneDone.children) {
    for (const child of Array.from(els.laneDone.children)) {
      const id = child && child.getAttribute ? child.getAttribute("data-job-id") : "";
      if (!id) continue;
      if (wantIds.has(id)) continue;
      unmountCard(id);
    }
  }

  // Ensure desired done cards are mounted and sorted.
  for (const j of wantJobs) {
    const el = state.cardEls.get(j.id) || null;
    if (!el) {
      mountCardSorted(j, els.laneDone);
      continue;
    }
    if (el.parentElement !== els.laneDone) {
      insertCardElSorted(j, els.laneDone, el);
      continue;
    }
    insertCardElSorted(j, els.laneDone, el);
  }

  if (total > limit) {
    const bar = document.createElement("div");
    bar.className = "lane__cap";
    bar.setAttribute("data-done-cap-bar", "");
    if (state.showAllDone) {
      bar.innerHTML = `Showing all ${total} done jobs. <button type="button" class="btn btn--ghost" data-done-cap-action="collapse">Collapse</button>`;
    } else {
      const shown = Math.min(limit, total);
      bar.innerHTML = `Showing ${shown} of ${total} done jobs. <button type="button" class="btn btn--ghost" data-done-cap-action="show-all">Show all</button>`;
    }
    if (els.laneDone) els.laneDone.prepend(bar);
  }

  // Update board lane titles with counts.
  setLaneTitle(els.laneRunning, runningJobs.length ? `Running (${runningJobs.length})` : "Running");
  setLaneTitle(
    els.laneAttention,
    attentionJobs.length ? `Needs Attention (${attentionJobs.length})` : "Needs Attention"
  );
  if (limit > 0 && total > limit && !state.showAllDone) {
    setLaneTitle(els.laneDone, `Done (${Math.min(limit, total)}/${total})`);
  } else if (total) {
    setLaneTitle(els.laneDone, `Done (${total})`);
  } else {
    setLaneTitle(els.laneDone, "Done");
  }

  syncBoardLaneVisibility();
}

function prefersReducedMotion() {
  try {
    return !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function snapshotCardRects() {
  const rects = new Map(); // HTMLElement -> DOMRect
  for (const el of state.cardEls.values()) {
    if (!el || !el.getBoundingClientRect) continue;
    rects.set(el, el.getBoundingClientRect());
  }
  return rects;
}

function playFlipFromRects(rects, { durationMs = 260, easing = "cubic-bezier(0.2, 0.8, 0.2, 1)" } = {}) {
  if (!rects || prefersReducedMotion()) return;

  for (const [el, first] of rects.entries()) {
    if (!el || !el.isConnected || !el.getBoundingClientRect) continue;
    const last = el.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

    try {
      // Avoid stacking move animations if multiple updates land quickly.
      if (el.getAnimations) {
        for (const a of el.getAnimations()) {
          if (a && typeof a.cancel === "function") a.cancel();
        }
      }
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px) translateZ(0)` }, { transform: "translateZ(0)" }],
        { duration: durationMs, easing }
      );
    } catch {
      // Ignore animation failures; UI should still update correctly.
    }
  }
}

function updateCardEl(job) {
  const existing = state.cardEls.get(job.id) || null;
  const laneEl = laneElForJob(job);
  const prevLaneEl = existing ? existing.parentElement : null;
  const wasDone = !!existing && existing.parentElement === els.laneDone;
  const willBeDone = laneEl === els.laneDone;
  const shouldSyncDone = state.view === "board" && boardDoneLimitValue() > 0 && (wasDone || willBeDone);
  const shouldAnimateMove = !!existing && !!laneEl && existing.parentElement !== laneEl && state.view === "board";
  const firstRects = shouldAnimateMove ? snapshotCardRects() : null;

  if (!laneEl) {
    if (existing) unmountCard(job.id);
    if (shouldSyncDone) syncBoardDoneLane();
    else if (prevLaneEl) syncBoardLaneVisibility();
    return;
  }

  if (!existing) {
    mountCardSorted(job, laneEl);
    if (shouldSyncDone) syncBoardDoneLane();
    else syncBoardLaneVisibility();
    return;
  }

  // Move lanes if status changed.
  if (existing.parentElement !== laneEl) {
    insertCardElSorted(job, laneEl, existing);
  }

  // Update classes + status pill.
  const uiStatus = jobStatusForUi(job);
  const isRunningUi = uiStatus === "running";
  existing.classList.toggle("card--running", isRunningUi);
  existing.style.setProperty("--proj-color", projectColorById(job.projectId) || "transparent");

  const titleEl = existing.querySelector(".card__title");
  if (titleEl) {
    const title = jobDisplayTitle(job);
    titleEl.textContent = title;
    titleEl.removeAttribute("title");
  }

  const subTextEl = existing.querySelector(".card__subtext") || existing.querySelector(".card__sub");
  if (subTextEl) {
    const sub = `${projectLabelById(job.projectId)}${job.model ? `  ·  ${job.model}` : ""}`;
    const subTitle = `${projectNameById(job.projectId)}${job.model ? `  ·  ${job.model}` : ""}`;
    subTextEl.textContent = sub;
    if (subTextEl.classList && subTextEl.classList.contains("card__subtext")) {
      subTextEl.title = oneLine(subTitle);
    }
  }

  const integrated = integratedBadgeForJob(job);
  let integratedEl = existing.querySelector("[data-job-integrated]");
  if (!integratedEl) {
    const subWrap = existing.querySelector(".card__sub");
    if (subWrap) {
      integratedEl = document.createElement("span");
      integratedEl.className = "card__flag card__flag--merged";
      integratedEl.setAttribute("data-job-integrated", "");
      subWrap.appendChild(integratedEl);
    }
  }
  if (integratedEl) {
    integratedEl.hidden = !integrated;
    integratedEl.textContent = integrated ? integrated.text : "Merged";
    integratedEl.title = integrated ? oneLine(integrated.title) : "";
  }

  const pillEl = existing.querySelector(".pill");
  if (pillEl) {
    const s = uiStatus;
    pillEl.textContent = s;
    pillEl.className =
      s === "running"
        ? "pill pill--run"
        : s === "done"
          ? "pill pill--done"
          : s === "needs_attention" || s === "failed" || s === "cancelled"
            ? "pill pill--attn"
          : "pill";
  }

  const ensureMetaWrap = () => {
    let wrap = existing.querySelector("[data-job-meta]");
    const previewEl = existing.querySelector(".card__preview");
    if (wrap) {
      if (previewEl && previewEl.parentElement === existing && wrap.parentElement === existing && wrap !== previewEl.nextElementSibling) {
        existing.insertBefore(wrap, previewEl.nextSibling);
      }
      return wrap;
    }
    wrap = document.createElement("div");
    wrap.className = "card__meta";
    wrap.setAttribute("data-job-meta", "");
    wrap.hidden = true;
    if (previewEl && previewEl.parentElement === existing) existing.insertBefore(wrap, previewEl.nextSibling);
    else existing.appendChild(wrap);
    return wrap;
  };

  let durEl = existing.querySelector("[data-job-duration]");
  if (!durEl) {
    const metaWrap = ensureMetaWrap();
    if (metaWrap) {
      durEl = document.createElement("div");
      durEl.className = "card__duration";
      durEl.setAttribute("data-job-duration", "");
      durEl.hidden = true;
      metaWrap.appendChild(durEl);
    }
  }
  if (durEl) {
    if (job.integratingToDefault === true) {
      durEl.hidden = false;
      durEl.textContent = "Integrating…";
    } else if (isRunningUi) {
      durEl.hidden = false;
      durEl.textContent = jobElapsedText(job);
    } else {
      durEl.hidden = true;
      durEl.textContent = "";
    }
  }

  const staleTokEl = existing.querySelector("[data-job-tokens]");
  if (staleTokEl) staleTokEl.remove();

  const metaWrap = existing.querySelector("[data-job-meta]");
  if (metaWrap) {
    const hideDuration = !durEl || durEl.hidden;
    metaWrap.hidden = hideDuration;
  }

  const previewEl = existing.querySelector(".card__preview");
  if (previewEl) {
    const prev = cardPreview(job);
    previewEl.innerHTML = renderMarkdownInlineSafeHtml(prev.text || "…");
    previewEl.classList.toggle("card__preview--live", !!prev.live);
  }

  if (shouldSyncDone) syncBoardDoneLane();
  else if (existing.parentElement !== prevLaneEl) syncBoardLaneVisibility();

  // Animate lane changes (e.g. running -> done) so cards visibly "travel" to their new column.
  if (firstRects) playFlipFromRects(firstRects);
}

function tickRunningDurations() {
  const nowMs = Date.now();
  for (const job of state.jobs.values()) {
    if (!job || job.status !== "running") continue;
    const el = state.cardEls.get(job.id);
    if (!el) continue;
    const durEl = el.querySelector("[data-job-duration]");
    if (!durEl) continue;
    if (durEl.hidden) durEl.hidden = false;
    const next = jobElapsedText(job, nowMs);
    if (durEl.textContent !== next) durEl.textContent = next;

    if (els.sessionsTableBody && els.sessionsTableBody.querySelectorAll) {
      const tableEls = els.sessionsTableBody.querySelectorAll(`[data-session-duration="${job.id}"]`);
      for (const tableEl of tableEls) {
        if (!tableEl) continue;
        const nextTable = jobDurationText(job, nowMs);
        if (tableEl.textContent !== nextTable) tableEl.textContent = nextTable;
      }
    }
  }

  // If a running job is open, refresh its meta row (includes elapsed).
  const openId = state.selectedJobId;
  if (openId && els.jobDialog && els.jobDialog.open) {
    const job = state.jobs.get(openId);
    if (job && job.status === "running") {
      renderJobDialogMeta(job);
      tickRunningJobDialogCounters(job, nowMs);
    }
  }

  // If the status overlay is open, keep the elapsed fields fresh.
  if (els.statusDialog && els.statusDialog.open && els.statusDialogBody) {
    for (const job of state.jobs.values()) {
      if (!job || job.status !== "running") continue;
      const el = els.statusDialogBody.querySelector(`[data-status-elapsed="${job.id}"]`);
      if (!el) continue;
      const next = jobDurationText(job, nowMs);
      if (el.textContent !== next) el.textContent = next;
    }
  }
}

function tickRunningJobDialogCounters(job, nowMs = Date.now()) {
  if (!job || job.status !== "running") return;
  if (!els.jobDialog || !els.jobDialog.open) return;

  // Chat: update the "running since last message" counter.
  if (els.jobDialogChat && els.jobDialogChat.querySelectorAll) {
    const nodes = els.jobDialogChat.querySelectorAll("[data-msg-running-base-ms]");
    for (const el of nodes) {
      const raw = el && el.getAttribute ? el.getAttribute("data-msg-running-base-ms") : null;
      const baseMs = raw ? Number(raw) : NaN;
      if (!Number.isFinite(baseMs)) continue;
      const next = `running ${fmtOffset(Math.max(0, nowMs - baseMs))}`;
      if (el.textContent !== next) el.textContent = next;
    }
  }

  // Live: update the "time since last output" counter.
  if (els.jobDialogLive && els.jobDialogLive.querySelectorAll) {
    const nodes = els.jobDialogLive.querySelectorAll("[data-live-running-base-ms]");
    for (const el of nodes) {
      const raw = el && el.getAttribute ? el.getAttribute("data-live-running-base-ms") : null;
      const baseMs = raw ? Number(raw) : NaN;
      if (!Number.isFinite(baseMs)) continue;
      const next = `(+${fmtOffset(Math.max(0, nowMs - baseMs))})`;
      if (el.textContent !== next) el.textContent = next;
    }
  }
}

function hasRunningJobs() {
  for (const job of state.jobs.values()) {
    if (job && job.status === "running") return true;
  }
  return false;
}

function stopDurationTicker() {
  if (!state.durationTimer) return;
  window.clearInterval(state.durationTimer);
  state.durationTimer = null;
}

function ensureDurationTicker() {
  if (state.durationTimer) return;
  state.durationTimer = window.setInterval(() => {
    if (!hasRunningJobs()) {
      stopDurationTicker();
      return;
    }
    tickRunningDurations();
  }, 1000);
  tickRunningDurations();
}

function syncDurationTicker() {
  if (hasRunningJobs()) ensureDurationTicker();
  else stopDurationTicker();
}

function setHint(msg, kind = "info") {
  if (!msg) {
    els.composerHint.textContent = "";
    return;
  }
  els.composerHint.textContent = msg;
  els.composerHint.style.color = kind === "error" ? "rgba(255, 91, 110, 0.9)" : "rgba(255,255,255,0.52)";
}

let transientHintNonce = 0;
function setTransientHint(msg, kind = "info", ms = 6000) {
  if (!msg) return;
  const n = ++transientHintNonce;
  setHint(msg, kind);
  window.setTimeout(() => {
    if (transientHintNonce !== n) return;
    if (els.composerHint.textContent === msg) setHint("");
  }, Math.max(250, ms));
}

function setHidden(el, hidden) {
  if (!el) return;
  el.hidden = !!hidden;
}

function safeUuid() {
  try {
    if (typeof crypto !== "undefined" && crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // ignore
  }
  return `ah_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function fnv1a32Hex(s) {
  const str = typeof s === "string" ? s : "";
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function stableActionId(seed) {
  return `ah_act_${fnv1a32Hex(seed)}`;
}

function normalizeActions(value) {
  // Accept multiple shapes for backwards compatibility:
  // - [{ id, name, command }]
  // - [{ id, title|label, cmd|command|value }]
  // - ["shell command", ...]
  // - [["Name", "shell command"], ...]
  // - { "Name": "shell command", ... }
  let arr = [];
  if (Array.isArray(value)) {
    arr = value;
  } else if (value && typeof value === "object") {
    try {
      arr = Object.entries(value).map(([k, v]) => ({ name: k, command: v }));
    } catch {
      arr = [];
    }
  }
  const seen = new Set();
  const out = [];

  for (const item of arr) {
    let id = "";
    let name = "";
    let command = "";

    if (typeof item === "string") {
      command = item;
    } else if (Array.isArray(item)) {
      const rawName = item.length > 0 && typeof item[0] === "string" ? item[0].trim() : "";
      const rawCommand = item.length > 1 && typeof item[1] === "string" ? item[1] : "";
      name = rawCommand ? rawName : "";
      command = rawCommand || (typeof item[0] === "string" ? item[0] : "");
    } else {
      const obj = item && typeof item === "object" ? item : {};
      id = typeof obj.id === "string" ? obj.id.trim() : "";
      name = typeof obj.name === "string" ? obj.name.trim() : "";
      if (!name && typeof obj.title === "string") name = obj.title.trim();
      if (!name && typeof obj.label === "string") name = obj.label.trim();

      const rawCmd =
        typeof obj.command === "string"
          ? obj.command
          : typeof obj.cmd === "string"
            ? obj.cmd
            : typeof obj.shell === "string"
              ? obj.shell
              : typeof obj.value === "string"
                ? obj.value
                : Array.isArray(obj.command)
                  ? obj.command.filter((x) => typeof x === "string").join("\n")
                  : "";
      command = rawCmd;
    }

    command = String(command || "").replaceAll("\r\n", "\n").trimEnd();
    if (!command) continue;

    if (!name) {
      const first = (command.split("\n")[0] || "").trim();
      name = first.slice(0, 80) || "Action";
    }

    if (!id) {
      // Stable ids help keep select values intact even if actions were stored without ids.
      id = stableActionId(`${name}\n${command}`);
      if (seen.has(id)) {
        let n = 2;
        while (seen.has(`${id}_${n}`)) n++;
        id = `${id}_${n}`;
      }
    } else if (seen.has(id)) {
      id = safeUuid();
      while (seen.has(id)) id = safeUuid();
    }
    seen.add(id);

    out.push({ id, name, command });
  }

  return out;
}

function jobActionsFromSettings() {
  const s = state.settings && typeof state.settings === "object" ? state.settings : {};
  return normalizeActions(s.actions);
}

function hideJobActionsMenu() {
  if (!els.jobActionsMenu) return;
  if (els.jobActionsMenu.hidden) return;
  els.jobActionsMenu.hidden = true;
}

function renderJobActionsMenu() {
  if (!els.jobActionsMenu) return;

  const actions = jobActionsFromSettings();
  const out = [];

  for (const a of actions) {
    const id = escapeHtml(a.id);
    const label = escapeHtml(a.name);
    const title = escapeHtml(String(a.command || "").trim());
    out.push(`<button type="button" class="ctxmenu__item" data-jobaction-id="${id}" title="${title}">${label}</button>`);
  }

  if (actions.length > 0) out.push(`<div class="ctxmenu__sep" role="separator"></div>`);
  out.push(`<button type="button" class="ctxmenu__item" data-jobaction-manage>Manage actions…</button>`);

  els.jobActionsMenu.innerHTML = out.join("");
}

function openJobActionsMenu(anchorEl) {
  if (!els.jobActionsMenu) return;

  renderJobActionsMenu();

  const menu = els.jobActionsMenu;
  menu.hidden = false;

  // Start at a safe origin so we can measure reliably.
  menu.style.left = "0px";
  menu.style.top = "0px";

  const ar = anchorEl && typeof anchorEl.getBoundingClientRect === "function" ? anchorEl.getBoundingClientRect() : null;
  const rect = menu.getBoundingClientRect();
  const pad = 8;

  const maxX = Math.max(pad, window.innerWidth - rect.width - pad);
  const maxY = Math.max(pad, window.innerHeight - rect.height - pad);

  const aLeft = ar ? ar.left : window.innerWidth / 2;
  const aRight = ar ? ar.right : window.innerWidth / 2;
  const aTop = ar ? ar.top : window.innerHeight / 2;

  const spaceRight = window.innerWidth - aRight;
  const openRight = spaceRight >= rect.width + 12;

  const idealX = openRight ? aRight + 8 : aLeft - rect.width - 8;
  const x = clampNumber(idealX, pad, maxX, pad);

  // Align with the clicked row; clamp to viewport.
  const y = clampNumber(aTop - 6, pad, maxY, pad);

  menu.style.left = `${Math.round(x)}px`;
  menu.style.top = `${Math.round(y)}px`;
}

function isIntegrateToDefaultAction(action) {
  const a = action && typeof action === "object" ? action : {};
  const name = typeof a.name === "string" ? a.name.trim().toLowerCase() : "";
  const cmd = typeof a.command === "string" ? a.command.trim().toLowerCase() : "";
  if (!name && !cmd) return false;
  if (name === "integrate to default branch" || name === "integrate-to-default") return true;
  if (name.includes("integrate") && name.includes("default branch")) return true;
  if (cmd === "__integrate_to_default_branch__" || cmd === "integrate-to-default") return true;
  return false;
}

function suggestIntegrateCommitMessage(job) {
  const title = String(jobDisplayTitle(job) || "")
    .replaceAll(/\s+/g, " ")
    .trim();
  if (title) return `chore: ${title}`.slice(0, 120);
  return "chore: integrate job changes";
}

function shortCommitSha(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  return s.slice(0, 12);
}

async function runIntegrateToDefaultAction(job) {
  const jobId = String(job && job.id ? job.id : "").trim();
  if (!jobId) return;
  if (!api || typeof api.checkoutsIntegrateToDefault !== "function") {
    showToast("Integrate to default branch is not supported in this build.");
    return;
  }

  let commitMessage = "";
  let askedCommitMessage = false;

  while (true) {
    try {
      const res = await api.checkoutsIntegrateToDefault(jobId, commitMessage ? { commitMessage } : {});
      const targetBranch = normalizeBranchName(res && res.targetBranch ? res.targetBranch : "");
      const targetPath = String(res && res.targetPath ? res.targetPath : "").trim();
      const commitsApplied = Math.max(0, toIntOrZero(res && res.commitsApplied));
      const committed = !!(res && res.committed);
      const committedSha = shortCommitSha(res && res.committedSha ? res.committedSha : "");

      const summaryLines = [];
      if (commitsApplied > 0) summaryLines.push(`Successfully integrated ${commitsApplied} commit${commitsApplied === 1 ? "" : "s"} into "${targetBranch || "main"}".`);
      else summaryLines.push(`No commits were applied. This task is already integrated into "${targetBranch || "main"}".`);
      if (targetPath) summaryLines.push(`Target checkout: ${targetPath}`);
      if (committed) summaryLines.push(`Committed working-tree changes in task checkout${committedSha ? ` (${committedSha})` : ""}.`);

      const canArchive = jobBox(job) === "board" && job.status !== "running";
      if (canArchive) {
        const archiveNow = window.confirm(`${summaryLines.join("\n")}\n\nArchive this task now?`);
        if (archiveNow) await archiveJob(jobId, { closeDialog: false });
      } else {
        window.alert(summaryLines.join("\n"));
      }
      return;
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      if (!askedCommitMessage && /Provide a commit message first/i.test(msg)) {
        askedCommitMessage = true;
        const suggested = suggestIntegrateCommitMessage(job);
        const entered = window.prompt(
          "The task checkout has uncommitted changes.\n\nPlease enter a commit message before integrating to the default branch:",
          suggested
        );
        if (entered == null) return;
        commitMessage = String(entered || "").trim();
        if (!commitMessage) {
          showToast("Integration cancelled (empty commit message).");
          return;
        }
        continue;
      }

      showToast(msg || "Failed to integrate to default branch.");
      return;
    }
  }
}

async function runJobActionById(actionId) {
  const jobId = state.selectedJobId;
  if (!jobId) return;
  const job = state.jobs.get(jobId);
  if (!job || isDemoJob(job)) return;

  const id = String(actionId || "").trim();
  if (!id) return;

  const action = jobActionsFromSettings().find((a) => a.id === id) || null;
  if (!action) {
    showToast("Unknown action.");
    return;
  }

  const integrateToDefault = isIntegrateToDefaultAction(action);

  const builtIn = builtInActionKindFromCommand(cmd);
  if (builtIn === "integrate_to_default") {
    await runIntegrateToDefaultAction(jobId);
    return;
  }
  if (builtIn === "commit_and_push") {
    await runCheckoutCommitAction(jobId, { push: true });
    return;
  }
  if (builtIn === "commit_only") {
    await runCheckoutCommitAction(jobId, { push: false });
    return;
  }

  if (job && jobStatusForUi(job) === "running") {
    const ok = window.confirm(`Job is running. Running actions may interfere.\n\nRun "${action.name}" anyway?`);
    if (!ok) return;
  }

  if (integrateToDefault) {
    await runIntegrateToDefaultAction(job);
    return;
  }

  const cmd = String(action.command || "").trimEnd();
  if (!cmd) {
    showToast("Action has no command.");
    return;
  }

  // Actions run via the per-job terminal session so interactive commands work
  // (git commit editor, auth prompts, ...). We don't force a tab switch; the toast
  // offers a one-click "Open Terminal" if the user wants to watch or interact.
  if (!api || typeof api.termEnsure !== "function" || typeof api.termWrite !== "function") {
    showToast("Terminal is not supported in this build.");
    return;
  }

  try {
    await api.termEnsure(jobId, 110, 34);
  } catch (err) {
    showToast(String(err && err.message ? err.message : err) || "Failed to start terminal.");
    return;
  }

  try {
    const payload = cmd.replaceAll("\n", "\r") + "\r";
    await api.termWrite(jobId, payload);
    showToast(`Action started: ${action.name}`, null, 8000, {
      actions: [
        {
          label: "Open Terminal",
          kind: "primary",
          onClick: () => {
            setActiveTab("term");
            attachTerminalToJob(jobId).catch(() => {});
          }
        }
      ]
    });
  } catch (err) {
    showToast(String(err && err.message ? err.message : err) || "Failed to run action.");
  }
}

function hideJobMoreMenu() {
  if (!els.jobMoreMenu || !els.jobMoreBtn) return;
  if (els.jobMoreMenu.hidden) return;
  els.jobMoreMenu.hidden = true;
  els.jobMoreBtn.setAttribute("aria-expanded", "false");
  hideJobActionsMenu();
}

function openJobMoreMenu() {
  if (!els.jobMoreMenu || !els.jobMoreBtn) return;
  const btn = els.jobMoreBtn;
  const menu = els.jobMoreMenu;

  const jobId = state.selectedJobId;
  const job = jobId ? state.jobs.get(jobId) : null;
  if (!job || isDemoJob(job)) return;

  updateJobMoreMenuActions(job);
  if (btn.hidden || btn.disabled) return;

  // Toggle behavior.
  if (!menu.hidden) {
    hideJobMoreMenu();
    return;
  }

  menu.hidden = false;
  btn.setAttribute("aria-expanded", "true");

  // Start at a safe origin so we can measure reliably.
  menu.style.left = "0px";
  menu.style.top = "0px";

  const br = btn.getBoundingClientRect();
  const rect = menu.getBoundingClientRect();
  const pad = 8;

  const maxX = Math.max(pad, window.innerWidth - rect.width - pad);
  const maxY = Math.max(pad, window.innerHeight - rect.height - pad);

  // Prefer aligning the right edge to the button (clean in the dialog footer).
  const idealX = br.right - rect.width;
  const x = clampNumber(idealX, pad, maxX, pad);

  const spaceBelow = window.innerHeight - br.bottom;
  const spaceAbove = br.top;
  const belowY = br.bottom + 8;
  const aboveY = br.top - rect.height - 8;
  const idealY = spaceBelow < rect.height + 12 && spaceAbove > spaceBelow ? aboveY : belowY;
  const y = clampNumber(idealY, pad, maxY, pad);

  menu.style.left = `${Math.round(x)}px`;
  menu.style.top = `${Math.round(y)}px`;
}

function updateJobMoreMenuActions(job) {
  if (!els.jobMoreMenu || !els.jobMoreBtn) return;
  const menu = els.jobMoreMenu;
  const btn = els.jobMoreBtn;

  const b = jobBox(job);
  const running = job && job.status === "running";

  const canFile = !running && b === "board";
  const canTrash = !running && b !== "trash";
  const canDelete = b === "trash" && !running;
  const canRestore = b === "archive" || b === "trash";
  const canRerun = !running;

  const byAction = (name) => menu.querySelector(`[data-jobmore-action="${name}"]`);
  const setActionHidden = (name, hidden) => {
    const el = byAction(name);
    if (el) el.hidden = !!hidden;
  };

  setActionHidden("actions", false);
  setActionHidden("rerun", !canRerun);
  setActionHidden("restore", !canRestore);
  setActionHidden("archive", !canFile);
  setActionHidden("trash", !canTrash);
  setActionHidden("delete", !canDelete);

  const sep = menu.querySelector('[data-jobmore-sep="danger"]');
  if (sep) sep.hidden = !canDelete;

  const anyVisible = ["actions", "rerun", "restore", "archive", "trash", "delete"].some((a) => {
    const el = byAction(a);
    return !!el && !el.hidden;
  });

  // Hide the overflow button if it would be empty (common while a job is running).
  btn.hidden = !anyVisible;
  btn.disabled = !anyVisible;
  if (!anyVisible) hideJobMoreMenu();
}

function renderSettingsActions(actions) {
  if (!els.settingsActionsList) return;

  const arr = normalizeActions(actions);
  const list = els.settingsActionsList;

  if (arr.length === 0) {
    list.innerHTML = `<div class="actionslist__empty">No actions yet. Add one below (examples: <code class="md-inline">git status</code>, <code class="md-inline">git add -A && git commit && git push</code>).</div>`;
    return;
  }

  // Render with DOM nodes (not innerHTML) so values are preserved exactly while editing.
  list.innerHTML = "";
  for (const a of arr) {
    const row = document.createElement("div");
    row.className = "actionrow";
    row.setAttribute("data-action-row", "1");
    row.setAttribute("data-action-id", a.id);

    const name = document.createElement("input");
    name.className = "input";
    name.placeholder = "Name";
    name.value = a.name || "";
    name.setAttribute("data-action-field", "name");

    const cmd = document.createElement("textarea");
    cmd.className = "textarea textarea--sm";
    cmd.rows = 2;
    cmd.placeholder = "Command (shell)";
    cmd.value = a.command || "";
    cmd.setAttribute("data-action-field", "command");

    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "iconbtn iconbtn--danger";
    rm.title = "Remove action";
    rm.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    rm.setAttribute("data-action-remove", "1");

    row.appendChild(name);
    row.appendChild(cmd);
    row.appendChild(rm);
    list.appendChild(row);
  }
}

function addBlankSettingsActionRow(initial = null) {
  if (!els.settingsActionsList) return;
  const list = els.settingsActionsList;

  // If we're in the empty state, swap to real list mode.
  if (list.querySelector(".actionslist__empty")) list.innerHTML = "";

  const init = initial && typeof initial === "object" ? initial : {};
  const initName = typeof init.name === "string" ? init.name : "";
  const initCommand = typeof init.command === "string" ? init.command : "";

  const id = safeUuid();
  const row = document.createElement("div");
  row.className = "actionrow";
  row.setAttribute("data-action-row", "1");
  row.setAttribute("data-action-id", id);

  const name = document.createElement("input");
  name.className = "input";
  name.placeholder = "Name";
  name.value = initName;
  name.setAttribute("data-action-field", "name");

  const cmd = document.createElement("textarea");
  cmd.className = "textarea textarea--sm";
  cmd.rows = 2;
  cmd.placeholder = "Command (shell)";
  cmd.value = initCommand;
  cmd.setAttribute("data-action-field", "command");

  const rm = document.createElement("button");
  rm.type = "button";
  rm.className = "iconbtn iconbtn--danger";
  rm.title = "Remove action";
  rm.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  rm.setAttribute("data-action-remove", "1");

  row.appendChild(name);
  row.appendChild(cmd);
  row.appendChild(rm);
  list.appendChild(row);

  try {
    if (!initCommand) name.focus();
    else cmd.focus();
  } catch {
    // ignore
  }

  return { row, name, cmd };
}

function readSettingsActionsFromUi() {
  if (!els.settingsActionsList) return [];
  const rows = Array.from(els.settingsActionsList.querySelectorAll("[data-action-row]"));
  const out = [];
  const seen = new Set();

  for (const row of rows) {
    const idRaw = String(row.getAttribute("data-action-id") || "").trim();
    let id = idRaw || safeUuid();
    if (seen.has(id)) id = safeUuid();
    seen.add(id);

    const nameEl = row.querySelector('[data-action-field="name"]');
    const cmdEl = row.querySelector('[data-action-field="command"]');
    const name = nameEl && "value" in nameEl ? String(nameEl.value || "").trim() : "";
    let command = cmdEl && "value" in cmdEl ? String(cmdEl.value || "") : "";
    command = command.replaceAll("\r\n", "\n").trimEnd();
    if (!command) continue;

    let finalName = name;
    if (!finalName) {
      const first = (command.split("\n")[0] || "").trim();
      finalName = first.slice(0, 80) || "Action";
    }

    out.push({ id, name: finalName, command });
  }

  return out;
}

function uiModelForMeta() {
  const s = state.settings && typeof state.settings === "object" ? state.settings : {};
  const uiModel = typeof s.uiModel === "string" ? s.uiModel.trim() : "";
  if (uiModel) return uiModel;

  const agents = s.agents && typeof s.agents === "object" ? s.agents : {};
  const codex = agents.codex && typeof agents.codex === "object" ? agents.codex : {};
  const fallback = typeof codex.model === "string" ? codex.model.trim() : "";
  return fallback;
}

function openActionPromptDialog() {
  if (!els.actionPromptDialog) return;

  const model = uiModelForMeta();
  if (els.actionPromptDialogMeta) {
    const bits = [];
    if (model) bits.push(`model=${model}`);
    else bits.push("model=default");
    els.actionPromptDialogMeta.textContent = bits.join("  ");
  }

  if (els.actionPromptInput) els.actionPromptInput.value = "";
  if (els.actionPromptGenerateBtn) {
    els.actionPromptGenerateBtn.disabled = false;
    els.actionPromptGenerateBtn.textContent = "Generate";
  }

  try {
    els.actionPromptDialog.showModal();
  } catch {
    // ignore
  }

  try {
    if (els.actionPromptInput) els.actionPromptInput.focus();
  } catch {
    // ignore
  }
}

function closeActionPromptDialog() {
  if (!els.actionPromptDialog) return;
  try {
    if (els.actionPromptDialog.open) els.actionPromptDialog.close();
  } catch {
    // ignore
  }
}

let actionPromptInFlight = false;
async function generateActionFromPrompt() {
  if (!els.actionPromptInput || !els.actionPromptGenerateBtn) return;
  if (actionPromptInFlight) return;
  if (!api || typeof api.actionsGenerate !== "function") {
    showToast("Action generator is not supported in this build.");
    return;
  }

  const text = String(els.actionPromptInput.value || "").trim();
  if (!text) return;

  actionPromptInFlight = true;
  const prevText = els.actionPromptGenerateBtn.textContent;
  els.actionPromptGenerateBtn.disabled = true;
  els.actionPromptGenerateBtn.textContent = "Generating…";

  try {
    const action = await api.actionsGenerate(text);
    const name = action && typeof action === "object" ? String(action.name || "").trim() : "";
    const command = action && typeof action === "object" ? String(action.command || "").trimEnd() : "";
    if (!command) throw new Error("No command generated.");

    addBlankSettingsActionRow({ name, command });
    closeActionPromptDialog();
    showToast("Action added. Don't forget to Save.");
  } catch (err) {
    showToast(String(err && err.message ? err.message : err));
  } finally {
    actionPromptInFlight = false;
    els.actionPromptGenerateBtn.disabled = false;
    els.actionPromptGenerateBtn.textContent = prevText || "Generate";
  }
}

function updateJobDialogActions(job) {
  if (isDemoJob(job)) {
    // Demo cards are UI-only; disable actions that would hit the main process.
    setHidden(els.cancelJobBtn, true);
    setHidden(els.jobMoreBtn, true);
    hideJobMoreMenu();

    if (els.jobDialogPopout) els.jobDialogPopout.hidden = true;
    if (els.jobDialogMove) els.jobDialogMove.hidden = true;

    if (els.followupInput) {
      els.followupInput.disabled = true;
      els.followupInput.placeholder = "Demo card (start a real run to chat)";
    }
    if (els.sendFollowupBtn) {
      els.sendFollowupBtn.disabled = true;
      els.sendFollowupBtn.textContent = "Send";
      els.sendFollowupBtn.title = "Demo card";
    }
    hideJobActionsMenu();
    return;
  }

  if (els.followupInput) {
    els.followupInput.disabled = false;
    if (els.followupInput.placeholder !== DEFAULT_FOLLOWUP_PLACEHOLDER) {
      els.followupInput.placeholder = DEFAULT_FOLLOWUP_PLACEHOLDER;
    }
  }
  if (els.jobDialogPopout) els.jobDialogPopout.hidden = isJobMode();
  if (els.jobDialogMove) els.jobDialogMove.hidden = !isJobMode();

  const b = jobBox(job);
  const running = job && jobStatusForUi(job) === "running";
  const hasThreadId = job && typeof job.threadId === "string" && job.threadId.trim().length > 0;

  // Stop only makes sense while running.
  setHidden(els.cancelJobBtn, !running);

  // Follow-ups:
  // - while running: queue them (unless user typed /stop)
  // - while idle: send immediately (requires a thread id)
  // - while trashed: disabled until restored
  const followCmd = String(els.followupInput && els.followupInput.value ? els.followupInput.value : "")
    .trim()
    .toLowerCase();
  const isStopCmd = followCmd === "stop" || followCmd === "/stop";
  const isRerunCmd = followCmd === "rerun" || followCmd === "/rerun";

  const canSend = b !== "trash" && (running || hasThreadId || isRerunCmd);
  if (els.sendFollowupBtn) {
    els.sendFollowupBtn.disabled = !canSend;
    if (!canSend) {
      els.sendFollowupBtn.title = b === "trash" ? "Restore this job to send follow-ups" : "No thread id for this job yet";
    } else if (running && isStopCmd) {
      els.sendFollowupBtn.title = "Stop job";
    } else if (!running && isRerunCmd) {
      els.sendFollowupBtn.title = "Open rerun dialog";
    } else if (running) {
      els.sendFollowupBtn.title = "Job is running; follow-ups will be queued";
    } else {
      els.sendFollowupBtn.title = "";
    }

    // Button label matches the current mode/command.
    if (running && isStopCmd) els.sendFollowupBtn.textContent = "Stop";
    else if (!running && isRerunCmd) els.sendFollowupBtn.textContent = "Rerun";
    else if (running) els.sendFollowupBtn.textContent = "Queue";
    else els.sendFollowupBtn.textContent = "Send";
  }

  updateJobMoreMenuActions(job);
  hideJobActionsMenu();
}

async function openJobInEditor(jobId) {
  const id = String(jobId || "").trim();
  if (!id) return;
  const job = state.jobs.get(id);
  if (!job || isDemoJob(job)) return;

  const targetPath = jobPathForEditor(job);
  if (!targetPath) {
    showToast("No project path available for this task.");
    return;
  }

  if (!hasConfiguredEditorCommand()) {
    showToast('Set "Editor command" in Settings first.');
    return;
  }

  if (!api || typeof api.editorOpenPath !== "function") {
    showToast("Open in editor is not supported in this build.");
    return;
  }

  try {
    await api.editorOpenPath(targetPath);
  } catch (err) {
    showToast(String(err && err.message ? err.message : err) || "Failed to open editor.");
  }
}

function updateCardContextMenuActions(job) {
  if (!els.cardContextMenu) return;
  const menu = els.cardContextMenu;
  const b = jobBox(job);
  const running = job && jobStatusForUi(job) === "running";

  const canFile = !running && b === "board";
  const canTrash = !running && b !== "trash";
  const canDelete = b === "trash" && !running;
  const canRestore = b === "archive" || b === "trash";
  const canOpenInEditor = !!jobPathForEditor(job) && hasConfiguredEditorCommand();

  const byAction = (name) => menu.querySelector(`[data-ctx-action="${name}"]`);
  const setActionHidden = (name, hidden) => {
    const el = byAction(name);
    if (el) el.hidden = !!hidden;
  };

  if (isDemoJob(job)) {
    for (const a of ["open_in_editor", "rerun", "stop", "restore", "archive", "trash", "delete"]) setActionHidden(a, true);
    const sep = menu.querySelector('[data-ctx-sep="main"]');
    if (sep) sep.hidden = true;
    return;
  }

  setActionHidden("open_in_editor", !canOpenInEditor);
  setActionHidden("rerun", running);
  setActionHidden("stop", !running);
  setActionHidden("restore", !canRestore);
  setActionHidden("archive", !canFile);
  setActionHidden("trash", !canTrash);
  setActionHidden("delete", !canDelete);

  const sep = menu.querySelector('[data-ctx-sep="main"]');
  if (sep) {
    const anyVisible = ["rerun", "stop", "restore", "archive", "trash", "delete"].some((a) => {
      const el = byAction(a);
      return !!el && !el.hidden;
    });
    sep.hidden = !anyVisible;
  }
}

function hideCardContextMenu() {
  if (!els.cardContextMenu) return;
  if (els.cardContextMenu.hidden) return;
  els.cardContextMenu.hidden = true;
  state.cardCtxJobId = "";
}

function openCardContextMenu(jobId, clientX, clientY) {
  if (!els.cardContextMenu) return;
  const id = String(jobId || "");
  if (!id) return;
  const job = state.jobs.get(id);
  if (!job) return;

  state.cardCtxJobId = id;
  state.cardCtxOpenedAt = Date.now();

  updateCardContextMenuActions(job);
  els.cardContextMenu.hidden = false;

  // Start at a safe origin so we can measure reliably.
  els.cardContextMenu.style.left = "0px";
  els.cardContextMenu.style.top = "0px";

  const rect = els.cardContextMenu.getBoundingClientRect();
  const pad = 8;
  const maxX = Math.max(pad, window.innerWidth - rect.width - pad);
  const maxY = Math.max(pad, window.innerHeight - rect.height - pad);
  const x = clampNumber(clientX, pad, maxX, pad);
  const y = clampNumber(clientY, pad, maxY, pad);

  els.cardContextMenu.style.left = `${Math.round(x)}px`;
  els.cardContextMenu.style.top = `${Math.round(y)}px`;
}

function jobDetailsLoaded(job) {
  if (!job || typeof job !== "object") return false;
  return Array.isArray(job.prompts) && Array.isArray(job.messages) && Array.isArray(job.logs);
}

function promptKey(p) {
  if (!p || typeof p !== "object") return "";
  const ts = typeof p.ts === "string" ? p.ts : "";
  const text = typeof p.text === "string" ? p.text : "";
  return `p|${ts}|${text}`;
}

function messageKey(m) {
  if (!m || typeof m !== "object") return "";
  const ts = typeof m.ts === "string" ? m.ts : "";
  const role = typeof m.role === "string" ? m.role : "";
  const text = typeof m.text === "string" ? m.text : "";
  return `m|${ts}|${role}|${text}`;
}

function logKey(l) {
  if (!l || typeof l !== "object") return "";
  const ts = typeof l.ts === "string" ? l.ts : "";
  const kind = typeof l.kind === "string" ? l.kind : "";
  const stream = typeof l.stream === "string" ? l.stream : "";
  if (kind === "log") {
    const text = typeof l.text === "string" ? l.text : "";
    return `l|${ts}|${stream}|${text}`;
  }
  if (kind === "codex") {
    const d = l.data && typeof l.data === "object" ? l.data : {};
    const type = typeof d.type === "string" ? d.type : "";
    const thread = typeof d.thread_id === "string" ? d.thread_id : "";
    const itemType = d.item && typeof d.item === "object" && typeof d.item.type === "string" ? d.item.type : "";
    const cmd =
      d.item && typeof d.item === "object" && typeof d.item.command === "string" ? shortShellCommand(d.item.command) : "";
    return `c|${ts}|${stream}|${type}|${thread}|${itemType}|${cmd}`;
  }
  if (kind === "claude") {
    const d = l.data && typeof l.data === "object" ? l.data : {};
    const type = typeof d.type === "string" ? d.type : "";
    const subtype = typeof d.subtype === "string" ? d.subtype : "";
    const sessionId = typeof d.session_id === "string" ? d.session_id : "";
    const parent = typeof d.parent_tool_use_id === "string" ? d.parent_tool_use_id : "";
    return `a|${ts}|${stream}|${type}|${subtype}|${sessionId}|${parent}`;
  }
  return `x|${ts}|${stream}|${kind}`;
}

function mergeArrays(primary, secondary, keyFn) {
  const a = Array.isArray(primary) ? primary : [];
  const b = Array.isArray(secondary) ? secondary : [];
  if (b.length === 0) return a;
  if (a.length === 0) return b;

  const keyAEnd = keyFn(a[a.length - 1]);
  if (keyAEnd) {
    for (let i = b.length - 1; i >= 0; i -= 1) {
      if (keyFn(b[i]) === keyAEnd) return a.concat(b.slice(i + 1));
    }
  }

  // Fallback: union by key (may keep duplicates if keys collide).
  const seen = new Set(a.map((x) => keyFn(x)).filter(Boolean));
  const out = [...a];
  for (const item of b) {
    const k = keyFn(item);
    if (k && seen.has(k)) continue;
    if (k) seen.add(k);
    out.push(item);
  }
  return out;
}

function mergeJobDetails(existingJob, fetchedJob) {
  const prev = existingJob && typeof existingJob === "object" ? existingJob : null;
  const full = fetchedJob && typeof fetchedJob === "object" ? fetchedJob : null;
  if (!full) return prev;
  if (!prev) return full;

  const out = { ...full };
  out.prompts = mergeArrays(full.prompts, prev.prompts, promptKey);
  out.messages = mergeArrays(full.messages, prev.messages, messageKey);
  out.logs = mergeArrays(full.logs, prev.logs, logKey);
  if (typeof prev.previewText === "string" && prev.previewText.trim() && !out.previewText) out.previewText = prev.previewText;
  return out;
}

function compactJobForList(job) {
  if (!job || typeof job !== "object") return job;
  let preview = lastAssistantPreview(job) || (typeof job.previewText === "string" ? job.previewText : "");
  if (!preview) preview = buildLogTail(job, 2);
  const previewText = preview ? truncateText(String(preview).trimEnd(), 900) : "";
  const out = { ...job, previewText };
  delete out.prompts;
  delete out.messages;
  delete out.logs;
  return out;
}

function setTerminalTabHidden(hidden) {
  const tab = document.querySelector('.tab[data-tab="term"]');
  if (!tab) return;
  tab.hidden = !!hidden;
}

function cssVar(name, fallback = "", el) {
  try {
    const target = el && el.nodeType === 1 ? el : document.documentElement;
    const v = window.getComputedStyle(target).getPropertyValue(name);
    const s = typeof v === "string" ? v.trim() : "";
    return s || fallback;
  } catch {
    return fallback;
  }
}

function applyXtermTheme() {
  const t = termUi.term;
  if (!t) return;

  try {
    // Theme should follow the panel tokens so we can keep terminal output dark even in light scheme.
    const scopeEl = els.jobDialogTerm || document.documentElement;
    const bg = cssVar("--surface5", "#000000", scopeEl);
    const fg = cssVar("--ink-mono", "rgba(255, 255, 255, 0.8)", scopeEl);
    const cursor = cssVar("--accent2", "#4bb6ff", scopeEl);
    const selection = cssVar("--card2", "rgba(255, 255, 255, 0.12)", scopeEl);
    const mono = cssVar("--mono", "", scopeEl);

    if (mono) t.options.fontFamily = mono;
    t.options.theme = {
      background: bg,
      foreground: fg,
      cursor,
      selectionBackground: selection
    };
  } catch {
    // ignore
  }
}

async function loadXtermModules() {
  if (termUi.xtermModsPromise) return termUi.xtermModsPromise;
  termUi.xtermModsPromise = Promise.all([
    import("../node_modules/@xterm/xterm/lib/xterm.mjs"),
    import("../node_modules/@xterm/addon-fit/lib/addon-fit.mjs")
  ]).then(([xterm, fit]) => ({ Terminal: xterm.Terminal, FitAddon: fit.FitAddon }));
  return termUi.xtermModsPromise;
}

function isTermPanelActive() {
  return !!(els.jobDialog && els.jobDialog.open && state.activeTab === "term" && els.jobDialogTerm);
}

function scheduleTermFit() {
  if (!termUi.term || !termUi.fitAddon) return;
  if (!termUi.jobId) return;
  if (!isTermPanelActive()) return;
  if (termUi.fitRaf) return;

  termUi.fitRaf = window.requestAnimationFrame(async () => {
    termUi.fitRaf = 0;
    if (!termUi.term || !termUi.fitAddon) return;
    if (!termUi.jobId) return;
    if (!isTermPanelActive()) return;

    try {
      termUi.fitAddon.fit();
    } catch {
      // ignore
    }

    try {
      if (api && typeof api.termResize === "function") {
        await api.termResize(termUi.jobId, termUi.term.cols, termUi.term.rows);
      }
    } catch {
      // ignore
    }
  });
}

async function ensureXtermMounted() {
  if (!els.jobDialogTerm) return false;
  if (termUi.term) return true;

  let Terminal;
  let FitAddon;
  try {
    const mods = await loadXtermModules();
    Terminal = mods.Terminal;
    FitAddon = mods.FitAddon;
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    els.jobDialogTerm.innerHTML = `<div class="logline">Failed to load terminal UI: ${escapeHtml(msg)}</div>`;
    return false;
  }

  try {
    els.jobDialogTerm.innerHTML = "";
  } catch {
    // ignore
  }

  const mono = cssVar("--mono", "");
  const term = new Terminal({
    fontFamily: mono || undefined,
    fontSize: 12,
    cursorBlink: true,
    scrollback: 5000,
    convertEol: true
  });
  const fit = new FitAddon();
  term.loadAddon(fit);

  try {
    term.open(els.jobDialogTerm);
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    els.jobDialogTerm.innerHTML = `<div class="logline">Failed to mount terminal UI: ${escapeHtml(msg)}</div>`;
    return false;
  }

  termUi.term = term;
  termUi.fitAddon = fit;
  applyXtermTheme();

  try {
    termUi.dataDispose = term.onData((data) => {
      const id = termUi.jobId;
      if (!id) return;
      if (!api || typeof api.termWrite !== "function") return;
      api.termWrite(id, data).catch(() => {});
    });
  } catch {
    // ignore
  }

  try {
    const ro = new ResizeObserver(() => scheduleTermFit());
    ro.observe(els.jobDialogTerm);
    termUi.resizeObserver = ro;
  } catch {
    // ignore
  }

  return true;
}

function termPrint(text) {
  const t = termUi.term;
  if (!t) return;
  const s = String(text || "").replaceAll("\n", "\r\n");
  try {
    t.write(s);
  } catch {
    // ignore
  }
}

function termPrintLine(text) {
  termPrint(`${String(text || "").replaceAll("\n", "\r\n")}\r\n`);
}

async function attachTerminalToJob(jobId) {
  const id = String(jobId || "").trim();
  if (!id) return;
  if (!els.jobDialogTerm) return;

  const job = state.jobs.get(id);
  if (isDemoJob(job)) {
    els.jobDialogTerm.innerHTML = `<div class="logline">Terminal is not available for demo cards.</div>`;
    return;
  }

  if (!api || typeof api.termEnsure !== "function") {
    els.jobDialogTerm.innerHTML = `<div class="logline">Terminal is not supported in this build.</div>`;
    return;
  }

  if (termUi.jobId === id && termUi.term) {
    applyXtermTheme();
    scheduleTermFit();
    try {
      termUi.term.focus();
    } catch {
      // ignore
    }
    return;
  }

  if (termUi.connectPromise && termUi.connectJobId === id) {
    await termUi.connectPromise;
    return;
  }

  if (termUi.jobId && termUi.jobId !== id && typeof api.termDetach === "function") {
    try {
      await api.termDetach(termUi.jobId);
    } catch {
      // ignore
    }
  }

  termUi.jobId = id;
  termUi.lastSeq = 0;

  const connect = (async () => {
    const ok = await ensureXtermMounted();
    if (!ok || !termUi.term || !termUi.fitAddon) return;

    applyXtermTheme();
    try {
      termUi.term.reset();
    } catch {
      // ignore
    }
    termPrintLine("Connecting…");

    try {
      termUi.fitAddon.fit();
    } catch {
      // ignore
    }

    const cols = termUi.term.cols || 110;
    const rows = termUi.term.rows || 34;

    let ensured;
    try {
      ensured = await api.termEnsure(id, cols, rows);
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      try {
        termUi.term.reset();
      } catch {
        // ignore
      }
      termPrintLine("Failed to start terminal:");
      termPrintLine(msg);
      termUi.lastSeq = 0;
      return;
    }

    if (termUi.jobId !== id) return;

    const buf = ensured && typeof ensured.buffer === "string" ? ensured.buffer : "";
    const seq = ensured && typeof ensured.seq === "number" ? ensured.seq : 0;
    termUi.lastSeq = seq;

    try {
      termUi.term.reset();
    } catch {
      // ignore
    }
    if (buf) termPrint(buf);

    scheduleTermFit();
    try {
      termUi.term.focus();
    } catch {
      // ignore
    }
  })();

  termUi.connectPromise = connect.finally(() => {
    if (termUi.connectPromise === connect) {
      termUi.connectPromise = null;
      termUi.connectJobId = "";
    }
  });
  termUi.connectJobId = id;

  await termUi.connectPromise;
}

function maybeEnsureTerminalForSelectedJob() {
  if (!isTermPanelActive()) return;
  const id = state.selectedJobId;
  if (!id) return;
  attachTerminalToJob(id).catch(() => {});
}

function onTermEvent(payload) {
  const p = payload && typeof payload === "object" ? payload : null;
  if (!p) return;
  if (!termUi.term) return;

  const jobId = typeof p.jobId === "string" ? p.jobId : "";
  if (!jobId || jobId !== termUi.jobId) return;

  if (p.kind === "data") {
    const data = typeof p.data === "string" ? p.data : "";
    if (!data) return;
    termPrint(data);
    if (typeof p.seq === "number") termUi.lastSeq = p.seq;
    return;
  }

  if (p.kind === "exit") {
    const code = typeof p.exitCode === "number" ? p.exitCode : NaN;
    const sig = typeof p.signal === "number" ? p.signal : NaN;
    const bits = [];
    if (Number.isFinite(code)) bits.push(`code=${code}`);
    if (Number.isFinite(sig) && sig !== 0) bits.push(`signal=${sig}`);
    termPrintLine("");
    termPrintLine(`[terminal exited${bits.length ? `: ${bits.join(" ")}` : ""}]`);
  }
}

async function openJobDialog(jobId) {
  state.selectedJobId = jobId;
  let job = state.jobs.get(jobId);
  if (!job) return;
  clearJobSearch();

  // While a job is running, the most useful default view is the live feed.
  state.activeTab = job.status === "running" ? "live" : "chat";
  setTerminalTabHidden(isDemoJob(job));

  {
    const title = jobDisplayTitle(job);
    els.jobDialogTitle.textContent = title || "Job";
    els.jobDialogTitle.title = oneLine(title);
  }
  renderJobDialogMeta(job);
  if (jobDetailsLoaded(job)) {
    renderJobDialogPanels(job);
  } else {
    els.jobDialogChat.innerHTML = `<div class="logline">Loading…</div>`;
    els.jobDialogLive.innerHTML = `<div class="logline">Loading…</div>`;
    els.jobDialogLogs.innerHTML = `<div class="logline">Loading…</div>`;
    if (els.jobDialogDiff) els.jobDialogDiff.innerHTML = `<div class="logline">Open Diff to load git changes.</div>`;
    if (els.jobDialogTerm && !termUi.term) {
      els.jobDialogTerm.innerHTML = `<div class="logline">Open this tab to start a shell in the project folder.</div>`;
    }
    setActiveTab(state.activeTab);
  }
  updateJobDialogActions(job);

  els.followupInput.value = "";
  setFollowupImages([]);
  setFollowupFiles([]);
  els.jobDialog.showModal();
  scheduleAutosizeFollowupInput();
  try {
    els.followupInput.focus();
    const end = els.followupInput.value.length;
    els.followupInput.selectionStart = end;
    els.followupInput.selectionEnd = end;
  } catch {
    // ignore
  }

  // Lazy-load full logs/messages/prompts to keep the board fast when many jobs exist.
  if (!jobDetailsLoaded(job)) {
    try {
      const fetched = await api.jobsGet(jobId);
      const merged = mergeJobDetails(state.jobs.get(jobId), fetched);
      if (merged) state.jobs.set(jobId, merged);
      job = state.jobs.get(jobId);
      if (job && state.selectedJobId === jobId && els.jobDialog.open) {
        const title = jobDisplayTitle(job);
        els.jobDialogTitle.textContent = title || "Job";
        els.jobDialogTitle.title = oneLine(title);
        renderJobDialogMeta(job);
        renderJobDialogPanels(job);
        updateJobDialogActions(job);
      }
    } catch (err) {
      if (state.selectedJobId === jobId && els.jobDialog.open) {
        const msg = String(err && err.message ? err.message : err);
        els.jobDialogChat.innerHTML = `<div class="logline">Failed to load job details: ${escapeHtml(msg)}</div>`;
        els.jobDialogLive.innerHTML = `<div class="logline">Failed to load job details.</div>`;
        els.jobDialogLogs.innerHTML = `<div class="logline">Failed to load job details.</div>`;
        if (els.jobDialogDiff) els.jobDialogDiff.innerHTML = `<div class="logline">Failed to load job details.</div>`;
      }
    }
  }
}

function renderJobDialogMeta(job) {
  if (!els.jobDialogMeta) return;
  els.jobDialogMeta.removeAttribute(TOKEN_TOOLTIP_ATTR);
  els.jobDialogMeta.removeAttribute("title");
  const chips = [];
  const pushChip = (key, value, opts = {}) => {
    const k = oneLine(key);
    const v = oneLine(value);
    if (!k || !v) return;
    const wantsTooltip = !!(opts && (opts.long || opts.tooltip));
    const rawTitle = opts && opts.title ? oneLine(opts.title) : "";
    const title = wantsTooltip && rawTitle && rawTitle !== v ? rawTitle : "";
    chips.push({
      key: k,
      value: v,
      title,
      tone: opts && opts.tone ? String(opts.tone) : "",
      long: !!(opts && opts.long)
    });
  };
  const fmtTokMeta = (raw) => {
    if (raw == null || raw === "") return "?";
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) return fmtTokCompact(Math.trunc(n));
    return oneLine(raw);
  };

  const uiStatus = jobStatusForUi(job);
  const statusTone =
    uiStatus === "running"
      ? "run"
      : uiStatus === "done"
        ? "done"
        : uiStatus === "needs_attention" || uiStatus === "failed" || uiStatus === "cancelled"
          ? "attn"
          : "";
  pushChip("status", uiStatus || "?", { tone: statusTone });
  pushChip("box", jobBox(job));
  {
    const qc =
      typeof job.queuedCount === "number"
        ? job.queuedCount
        : Array.isArray(job.queuedPrompts)
          ? job.queuedPrompts.length
          : 0;
    if (qc > 0) pushChip("queued", String(qc));
  }
  if (job && job.status === "running") {
    const dur = jobElapsedText(job);
    if (dur) pushChip("elapsed", dur);
  }
  if (job) pushChip("agent", normalizeAgentKey(job.agent));

  // Project + checkout path
  {
    const project = state.projects.find((p) => p && p.id === job.projectId) || null;
    const basePath = project && typeof project.path === "string" ? project.path : "";
    const cwdPath = job && typeof job.projectPath === "string" ? job.projectPath : "";

    const projShort = project ? normalizeShortName(project.shortName || "") : "";
    const projName = project && project.name ? String(project.name) : "";
    const projLabel = projShort || projName;
    if (projLabel) pushChip("project", projLabel);

    const cwdDisp = formatProjectPathForDisplay(cwdPath);
    if (cwdDisp) pushChip("cwd", cwdDisp, { title: cwdPath, long: true });

    if (basePath && cwdPath && basePath !== cwdPath) {
      const baseDisp = formatProjectPathForDisplay(basePath);
      if (baseDisp) pushChip("base", baseDisp, { title: basePath, long: true });
    }
  }

  if (job.threadId) {
    const threadRaw = String(job.threadId);
    pushChip("thread", middleEllipsis(threadRaw, { head: 12, tail: 10 }), { title: threadRaw, long: true });
  }
  if (job.model) pushChip("model", job.model);
  const ut = job.usageTotal && typeof job.usageTotal === "object" ? job.usageTotal : null;
  if (ut && toIntOrZero(ut.turns) > 0) {
    const turns = toIntOrZero(ut.turns);
    const value = `in ${fmtTokMeta(ut.input_tokens)} out ${fmtTokMeta(ut.output_tokens)} t ${turns}`;
    const title = `tokens in=${ut.input_tokens ?? "?"} out=${ut.output_tokens ?? "?"} turns=${turns}`;
    pushChip("tokens", value, { title, tooltip: true });
  } else if (job.usage) {
    const u = job.usage;
    const value = `in ${fmtTokMeta(u.input_tokens)} out ${fmtTokMeta(u.output_tokens)}`;
    const title = `tokens in=${u.input_tokens ?? "?"} out=${u.output_tokens ?? "?"}`;
    pushChip("tokens", value, { title, tooltip: true });
  }
  {
    const ctx = jobContextUsage(job);
    if (ctx) {
      const value = `${fmtPctCompact(ctx.percent)} · ${fmtTokCompact(ctx.input_tokens)}/${fmtTokCompact(ctx.limit_tokens)} in`;
      const title = `context ${fmtPctCompact(ctx.percent)} (${ctx.input_tokens}/${ctx.limit_tokens} input)`;
      pushChip("context", value, { title, tooltip: true });
    }
  }
  if (chips.length === 0) {
    els.jobDialogMeta.removeAttribute(TOKEN_TOOLTIP_ATTR);
    els.jobDialogMeta.removeAttribute("title");
    els.jobDialogMeta.textContent = "";
    return;
  }
  const chipsHtml = chips
    .map((chip) => {
      const classes = ["jobmeta__chip"];
      if (chip.long) classes.push("jobmeta__chip--long");
      if (chip.tone === "run" || chip.tone === "done" || chip.tone === "attn") classes.push(`jobmeta__chip--${chip.tone}`);
      const tooltipAttr = chip.title ? ` ${TOKEN_TOOLTIP_ATTR}="${escapeHtml(chip.title)}"` : "";
      return `<span class="${classes.join(" ")}"${tooltipAttr}><span class="jobmeta__key">${escapeHtml(chip.key)}</span><span class="jobmeta__value">${escapeHtml(chip.value)}</span></span>`;
    })
    .join("");
  els.jobDialogMeta.innerHTML = `<div class="jobmeta">${chipsHtml}</div>`;
}

function setActiveTab(tab) {
  const wanted = String(tab || "").trim();
  const nextTab = wanted === "chat" || wanted === "live" || wanted === "logs" || wanted === "diff" || wanted === "term" ? wanted : "chat";
  state.activeTab = nextTab;
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("tab--active", t.getAttribute("data-tab") === nextTab);
  });
  els.jobDialogChat.classList.toggle("panel--active", tab === "chat");
  els.jobDialogLive.classList.toggle("panel--active", tab === "live");
  els.jobDialogLogs.classList.toggle("panel--active", tab === "logs");
  if (els.jobDialogTerm) els.jobDialogTerm.classList.toggle("panel--active", tab === "term");
  if (els.jobDialog && els.jobDialog.open) applyJobSearchToActivePanel({ preserveIndex: true, scroll: false });
  if (tab === "term") maybeEnsureTerminalForSelectedJob();
}

function isNearBottom(el) {
  if (!el) return true;
  // If the panel isn't visible, treat as "stick" so it snaps to bottom next open.
  if (el.scrollHeight <= el.clientHeight) return true;
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
}

function codexEventToLogLines(data) {
  if (!data || typeof data !== "object") return [String(data)];
  const d = data;
  const type = d.type || "codex";

  if (type === "thread.started") {
    return [`[thread.started] ${d.thread_id || ""}`.trim()];
  }

  if (type === "turn.started") return ["[turn.started]"];

  if (type === "token.usage.updated") {
    const u = d.usage && typeof d.usage === "object" ? d.usage : {};
    const inTok = u.input_tokens ?? "?";
    const outTok = u.output_tokens ?? "?";
    const mcw = toPositiveInt(d.model_context_window);
    let line = `[token.usage.updated] tokens in=${inTok} out=${outTok}`;
    const inNum = toPositiveInt(inTok);
    if (mcw > 0 && inNum > 0) {
      const pct = (inNum / mcw) * 100;
      line += ` context=${fmtPctCompact(pct)} (${fmtTokCompact(inNum)}/${fmtTokCompact(mcw)} in)`;
    }
    return [line];
  }

  if (type === "turn.completed") {
    const u = d.usage && typeof d.usage === "object" ? d.usage : null;
    if (u) {
      const inTok = u.input_tokens ?? "?";
      const outTok = u.output_tokens ?? "?";
      return [`[turn.completed] tokens in=${inTok} out=${outTok}`];
    }
    return ["[turn.completed]"];
  }

  if ((type === "item.started" || type === "item.completed") && d.item && typeof d.item === "object") {
    const item = d.item;
    const itemType = item.type || "";

    if (itemType === "command_execution") {
      const cmd = shortShellCommand(item.command || "");
      const lines = [type === "item.started" ? `$ ${cmd}  (running)` : `$ ${cmd}`];
      if (type === "item.completed") {
        const out = stripAnsi(String(item.aggregated_output || "")).replaceAll("\r\n", "\n").replaceAll("\r", "\n");
        for (const ln of out.split("\n")) {
          if (!ln) continue;
          lines.push(ln);
        }
        if (typeof item.exit_code === "number") lines.push(`(exit ${item.exit_code})`);
      }
      return lines;
    }

    if (itemType === "agent_message") {
      const text = String(item.text || "").trimEnd();
      if (!text) return ["[agent_message]"];
      return ["[agent_message]", text];
    }

    return [`[${type}] ${itemType}`.trim()];
  }

  return [`[${type}]`];
}

function claudeEventToLogLines(data) {
  if (!data || typeof data !== "object") return [String(data)];
  const d = data;
  const type = String(d.type || "claude");
  const subtype = typeof d.subtype === "string" ? d.subtype : "";

  if (type === "system" && subtype === "init") {
    const bits = [];
    if (d.session_id) bits.push(`session=${d.session_id}`);
    if (d.model) bits.push(`model=${d.model}`);
    if (d.permissionMode) bits.push(`perm=${d.permissionMode}`);
    return [`[init] ${bits.join(" ")}`.trim()];
  }

  if ((type === "assistant" || type === "user") && d.message) {
    const text = String(claudeMessageText(d.message) || "").trimEnd();
    if (!text) return [`[${type}]`];
    return [`[${type}]`, text];
  }

  if (type === "result") {
    const u = d.usage && typeof d.usage === "object" ? d.usage : {};
    const inTok = u.input_tokens ?? "?";
    const outTok = u.output_tokens ?? "?";
    const head = `[result${subtype ? `.${subtype}` : ""}] tokens in=${inTok} out=${outTok}`;
    const result = typeof d.result === "string" ? d.result.trimEnd() : "";
    return result ? [head, result] : [head];
  }

  return [`[${type}${subtype ? `.${subtype}` : ""}]`];
}

function renderJobLogsHtml(logs) {
  const out = [];
  const arr = Array.isArray(logs) ? logs : [];

  for (const l of arr) {
    if (!l) continue;

    if (l.kind === "log") {
      const t = String(l.text || "");
      if (isNoisyLogLine(t)) continue;
      const cls = l.stream === "stderr" ? "logline logline--stderr" : "logline";
      out.push(`<div class="${cls}">${escapeHtml(t)}</div>`);
      continue;
    }

    if (l.kind === "codex") {
      const cls = l.stream === "stderr" ? "logline logline--stderr" : "logline";
      for (const line of codexEventToLogLines(l.data)) {
        out.push(`<div class="${cls}">${escapeHtml(line)}</div>`);
      }
      continue;
    }

    if (l.kind === "claude") {
      const cls = l.stream === "stderr" ? "logline logline--stderr" : "logline";
      for (const line of claudeEventToLogLines(l.data)) {
        out.push(`<div class="${cls}">${escapeHtml(line)}</div>`);
      }
    }
  }

  return out.join("") || `<div class="logline">No logs yet.</div>`;
}

function jobDiffSignature(job) {
  if (!job || typeof job !== "object") return "";
  const status = typeof job.status === "string" ? job.status : "";
  const finishedAt = typeof job.finishedAt === "string" ? job.finishedAt : "";
  const projectPath = typeof job.projectPath === "string" ? job.projectPath : "";
  const integratedAt = typeof job.integratedToDefaultAt === "string" ? job.integratedToDefaultAt : "";
  const exitCode = typeof job.exitCode === "number" ? String(job.exitCode) : "";
  return [status, finishedAt, projectPath, integratedAt, exitCode].join("|");
}

function getJobDiffUi(jobId) {
  const id = String(jobId || "").trim();
  if (!id) return { filterText: "", selectedFileId: "" };
  let entry = jobDiffUiState.get(id);
  if (!entry) {
    entry = { filterText: "", selectedFileId: "" };
    jobDiffUiState.set(id, entry);
  }
  return entry;
}

function normalizeDiffPathToken(value) {
  let s = typeof value === "string" ? value.trim() : "";
  if (!s) return "";
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) s = s.slice(1, -1);
  if (s.startsWith("'") && s.endsWith("'") && s.length >= 2) s = s.slice(1, -1);
  if (s === "/dev/null") return "";
  if (s.startsWith("a/") || s.startsWith("b/")) s = s.slice(2);
  return s;
}

function parseDiffGitHeaderPaths(line) {
  const m = /^diff --git a\/(.+) b\/(.+)$/.exec(String(line || ""));
  if (!m) return { oldPath: "", newPath: "" };
  return {
    oldPath: normalizeDiffPathToken(m[1]),
    newPath: normalizeDiffPathToken(m[2])
  };
}

function parseDiffHunk(header, bodyLines) {
  const m = /^@@\s*-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s*@@/.exec(String(header || ""));
  let leftLine = m ? Number(m[1]) : 0;
  let rightLine = m ? Number(m[3]) : 0;
  const rows = [];
  let additions = 0;
  let deletions = 0;

  const lines = Array.isArray(bodyLines) ? bodyLines : [];
  let i = 0;
  while (i < lines.length) {
    const line = String(lines[i] || "");

    if (line.startsWith(" ")) {
      const text = line.slice(1);
      rows.push({
        kind: "context",
        leftNo: leftLine > 0 ? leftLine : null,
        rightNo: rightLine > 0 ? rightLine : null,
        leftText: text,
        rightText: text
      });
      leftLine += 1;
      rightLine += 1;
      i += 1;
      continue;
    }

    if (line.startsWith("-") || line.startsWith("+")) {
      const dels = [];
      const adds = [];
      while (i < lines.length) {
        const blockLine = String(lines[i] || "");
        if (blockLine.startsWith("-")) {
          dels.push(blockLine.slice(1));
          i += 1;
          continue;
        }
        if (blockLine.startsWith("+")) {
          adds.push(blockLine.slice(1));
          i += 1;
          continue;
        }
        break;
      }

      const span = Math.max(dels.length, adds.length);
      for (let j = 0; j < span; j += 1) {
        const leftText = j < dels.length ? dels[j] : null;
        const rightText = j < adds.length ? adds[j] : null;
        const hasLeft = leftText != null;
        const hasRight = rightText != null;

        const row = {
          kind: hasLeft && hasRight ? "mod" : hasLeft ? "del" : "add",
          leftNo: hasLeft ? (leftLine > 0 ? leftLine : null) : null,
          rightNo: hasRight ? (rightLine > 0 ? rightLine : null) : null,
          leftText,
          rightText
        };
        rows.push(row);
        if (hasLeft) {
          leftLine += 1;
          deletions += 1;
        }
        if (hasRight) {
          rightLine += 1;
          additions += 1;
        }
      }
      continue;
    }

    rows.push({
      kind: "meta",
      leftNo: null,
      rightNo: null,
      leftText: line,
      rightText: line
    });
    i += 1;
  }

  return {
    header: String(header || ""),
    rows,
    additions,
    deletions
  };
}

function parseUnifiedDiffModel(diffText) {
  const lines = normalizeNewlines(diffText).split("\n");
  const files = [];
  const notes = [];
  let section = "";
  let fileCounter = 0;
  let current = null;

  function pushCurrent() {
    if (!current) return;
    current.status = String(current.status || "modified").trim().toLowerCase();
    if (
      current.status !== "modified" &&
      current.status !== "added" &&
      current.status !== "deleted" &&
      current.status !== "renamed" &&
      current.status !== "copied" &&
      current.status !== "untracked"
    ) {
      current.status = "modified";
    }

    current.oldPath = normalizeDiffPathToken(current.oldPath);
    current.newPath = normalizeDiffPathToken(current.newPath);

    if (current.status === "deleted") current.path = current.oldPath || current.newPath || "";
    else current.path = current.newPath || current.oldPath || "";
    if (!current.path) current.path = current.headerPath || "";
    if (!current.path) current.path = `file-${current.id}`;

    files.push(current);
    current = null;
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = String(lines[i] || "");

    if (line.startsWith("# ")) {
      pushCurrent();
      section = line.slice(2).trim();
      continue;
    }

    if (line.startsWith("diff --git ")) {
      pushCurrent();
      fileCounter += 1;
      const paths = parseDiffGitHeaderPaths(line);
      const headerPath = paths.newPath || paths.oldPath || "";
      current = {
        id: `f${fileCounter}`,
        section,
        status: "modified",
        headerPath,
        path: headerPath,
        oldPath: paths.oldPath,
        newPath: paths.newPath,
        metaLines: [],
        hunks: [],
        additions: 0,
        deletions: 0,
        binary: false,
        untracked: false
      };
      continue;
    }

    if (line.startsWith("?? ")) {
      pushCurrent();
      const untrackedPath = normalizeDiffPathToken(line.slice(3));
      if (!untrackedPath) continue;
      fileCounter += 1;
      files.push({
        id: `f${fileCounter}`,
        section,
        status: "untracked",
        headerPath: untrackedPath,
        path: untrackedPath,
        oldPath: "",
        newPath: untrackedPath,
        metaLines: [],
        hunks: [],
        additions: 0,
        deletions: 0,
        binary: false,
        untracked: true
      });
      continue;
    }

    if (line.startsWith("... ")) {
      notes.push(line);
      continue;
    }

    if (!current) {
      if (line.trim()) notes.push(line);
      continue;
    }

    if (line.startsWith("@@")) {
      const body = [];
      let j = i + 1;
      while (j < lines.length) {
        const next = String(lines[j] || "");
        if (next.startsWith("@@") || next.startsWith("diff --git ") || next.startsWith("# ") || next.startsWith("?? ")) break;
        body.push(next);
        j += 1;
      }
      const hunk = parseDiffHunk(line, body);
      current.hunks.push(hunk);
      current.additions += hunk.additions;
      current.deletions += hunk.deletions;
      i = j - 1;
      continue;
    }

    if (line.startsWith("new file mode ")) current.status = "added";
    else if (line.startsWith("deleted file mode ")) current.status = "deleted";
    else if (line.startsWith("rename from ")) {
      current.status = "renamed";
      current.oldPath = normalizeDiffPathToken(line.slice("rename from ".length));
    } else if (line.startsWith("rename to ")) {
      current.status = "renamed";
      current.newPath = normalizeDiffPathToken(line.slice("rename to ".length));
    } else if (line.startsWith("copy from ")) {
      current.status = "copied";
      current.oldPath = normalizeDiffPathToken(line.slice("copy from ".length));
    } else if (line.startsWith("copy to ")) {
      current.status = "copied";
      current.newPath = normalizeDiffPathToken(line.slice("copy to ".length));
    } else if (line.startsWith("Binary files ")) current.binary = true;
    else if (line.startsWith("--- ")) {
      const oldPath = normalizeDiffPathToken(line.slice(4));
      if (oldPath) current.oldPath = oldPath;
    } else if (line.startsWith("+++ ")) {
      const newPath = normalizeDiffPathToken(line.slice(4));
      if (newPath) current.newPath = newPath;
    }
    current.metaLines.push(line);
  }

  pushCurrent();
  return { files, notes };
}

function diffStatusText(status) {
  const s = String(status || "").trim().toLowerCase();
  if (s === "added") return "Added";
  if (s === "deleted") return "Deleted";
  if (s === "renamed") return "Renamed";
  if (s === "copied") return "Copied";
  if (s === "untracked") return "Untracked";
  return "Modified";
}

function diffStatusShort(status) {
  const s = String(status || "").trim().toLowerCase();
  if (s === "added") return "A";
  if (s === "deleted") return "D";
  if (s === "renamed") return "R";
  if (s === "copied") return "C";
  if (s === "untracked") return "?";
  return "M";
}

function diffStatusClass(status) {
  const s = String(status || "").trim().toLowerCase();
  if (s === "added" || s === "deleted" || s === "renamed" || s === "copied" || s === "untracked") return s;
  return "modified";
}

function diffRawLineClass(line) {
  const s = String(line || "");
  if (!s) return "diffline";
  if (s.startsWith("# ")) return "diffline diffline--section";
  if (s.startsWith("diff --git ")) return "diffline diffline--file";
  if (s.startsWith("@@")) return "diffline diffline--hunk";
  if (s.startsWith("+") && !s.startsWith("+++")) return "diffline diffline--add";
  if (s.startsWith("-") && !s.startsWith("---")) return "diffline diffline--del";
  if (
    s.startsWith("index ") ||
    s.startsWith("new file mode ") ||
    s.startsWith("deleted file mode ") ||
    s.startsWith("rename from ") ||
    s.startsWith("rename to ") ||
    s.startsWith("similarity index ") ||
    s.startsWith("Binary files ") ||
    s.startsWith("--- ") ||
    s.startsWith("+++ ") ||
    s.startsWith("?? ") ||
    s.startsWith("... ") ||
    s.startsWith("\\ No newline at end of file")
  ) {
    return "diffline diffline--meta";
  }
  return "diffline";
}

function renderDiffRawTextHtml(diffText) {
  const lines = normalizeNewlines(diffText).split("\n");
  if (lines.length === 1 && !lines[0]) return `<div class="logline">No diff output.</div>`;
  const rows = lines
    .map((line) => {
      const cls = diffRawLineClass(line);
      const inner = line ? escapeHtml(line) : "&nbsp;";
      return `<div class="${cls}">${inner}</div>`;
    })
    .join("");
  return `<div class="diffview__body diffview__body--raw">${rows}</div>`;
}

function diffFileMatchesQuery(file, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  const f = file && typeof file === "object" ? file : {};
  const hay = [f.path, f.oldPath, f.newPath, f.section, diffStatusText(f.status)].map((x) => String(x || "").toLowerCase()).join(" ");
  return hay.includes(q);
}

function renderDiffLineNumberHtml(value) {
  if (!Number.isFinite(value)) return "&nbsp;";
  const n = Math.max(0, Math.trunc(value));
  return n > 0 ? String(n) : "&nbsp;";
}

function renderDiffCodeHtml(value) {
  if (value == null) return "&nbsp;";
  const safe = escapeHtml(String(value));
  return safe || "&nbsp;";
}

function renderDiffHunkHtml(hunk) {
  const h = hunk && typeof hunk === "object" ? hunk : {};
  const rows = Array.isArray(h.rows) ? h.rows : [];
  const rowsHtml = rows
    .map((row) => {
      const r = row && typeof row === "object" ? row : {};
      const kind = String(r.kind || "context");
      const rowClass =
        kind === "add"
          ? "difftable__row difftable__row--add"
          : kind === "del"
            ? "difftable__row difftable__row--del"
            : kind === "mod"
              ? "difftable__row difftable__row--mod"
              : kind === "meta"
                ? "difftable__row difftable__row--meta"
                : "difftable__row difftable__row--context";

      return `
        <tr class="${rowClass}">
          <td class="difftable__ln difftable__ln--left">${renderDiffLineNumberHtml(Number(r.leftNo))}</td>
          <td class="difftable__code difftable__code--left">${renderDiffCodeHtml(r.leftText)}</td>
          <td class="difftable__ln difftable__ln--right">${renderDiffLineNumberHtml(Number(r.rightNo))}</td>
          <td class="difftable__code difftable__code--right">${renderDiffCodeHtml(r.rightText)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <section class="diffchunk">
      <div class="diffchunk__header">${escapeHtml(String(h.header || ""))}</div>
      <div class="diffchunk__tableWrap">
        <table class="difftable" role="table" aria-label="Side-by-side diff hunk">
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderDiffSelectedFileHtml(file, notes) {
  const f = file && typeof file === "object" ? file : null;
  if (!f) return `<div class="diffcontent__empty">No files match the current filter.</div>`;

  const statusClass = diffStatusClass(f.status);
  const statusText = diffStatusText(f.status);
  const statusShort = diffStatusShort(f.status);
  const additions = Number.isFinite(f.additions) ? Math.max(0, Math.trunc(f.additions)) : 0;
  const deletions = Number.isFinite(f.deletions) ? Math.max(0, Math.trunc(f.deletions)) : 0;
  const mainPath = String(f.path || f.newPath || f.oldPath || "(unknown file)");
  const renamed = !!(f.oldPath && f.newPath && f.oldPath !== f.newPath);
  const metaLines = Array.isArray(f.metaLines)
    ? f.metaLines.filter((line) => {
        const s = String(line || "");
        if (!s) return false;
        if (s.startsWith("--- ") || s.startsWith("+++ ")) return false;
        return true;
      })
    : [];

  const metaHtml = metaLines.length
    ? `<div class="diffcontent__meta">${metaLines.map((line) => `<div class="diffcontent__metaLine">${escapeHtml(String(line || ""))}</div>`).join("")}</div>`
    : "";

  const noteList = Array.isArray(notes) ? notes.filter((line) => String(line || "").trim()) : [];
  const notesHtml = noteList.length
    ? `<div class="diffcontent__notes">${noteList.map((line) => `<div class="diffcontent__note">${escapeHtml(String(line || ""))}</div>`).join("")}</div>`
    : "";

  let bodyHtml = "";
  if (Array.isArray(f.hunks) && f.hunks.length > 0) {
    bodyHtml = f.hunks.map((h) => renderDiffHunkHtml(h)).join("");
  } else if (f.untracked) {
    bodyHtml = `<div class="diffcontent__empty">Untracked file. Content preview is not included in patch output.</div>`;
  } else if (f.binary) {
    bodyHtml = `<div class="diffcontent__empty">Binary file changed.</div>`;
  } else {
    bodyHtml = `<div class="diffcontent__empty">No line-level hunks available.</div>`;
  }

  return `
    <div class="diffcontent__head">
      <div class="diffcontent__titleWrap">
        <div class="diffcontent__title">${escapeHtml(mainPath)}</div>
        ${renamed ? `<div class="diffcontent__subtitle">renamed from ${escapeHtml(String(f.oldPath || ""))}</div>` : ""}
      </div>
      <div class="diffcontent__badges">
        <span class="diffstatus diffstatus--${statusClass}">${escapeHtml(statusShort)} ${escapeHtml(statusText)}</span>
        ${additions > 0 ? `<span class="diffdelta diffdelta--add">+${additions}</span>` : ""}
        ${deletions > 0 ? `<span class="diffdelta diffdelta--del">-${deletions}</span>` : ""}
      </div>
    </div>
    ${notesHtml}
    <div class="diffcontent__scroll">
      ${metaHtml}
      ${bodyHtml}
    </div>
  `;
}

function getJobDiffModel(job, payload) {
  const p = payload && typeof payload === "object" ? payload : null;
  if (!p) return { files: [], notes: [] };
  const diffText = typeof p.diff === "string" ? p.diff : "";
  const jobId = String((job && job.id) || state.selectedJobId || "").trim();
  const cached = jobId ? jobDiffCache.get(jobId) : null;
  if (cached && cached.payload === p && cached.model && typeof cached.model === "object") {
    return cached.model;
  }
  const model = parseUnifiedDiffModel(diffText);
  if (cached && cached.payload === p) cached.model = model;
  return model;
}

function renderDiffWorkbenchHtml(job, payload) {
  const model = getJobDiffModel(job, payload);
  const files = Array.isArray(model.files) ? model.files : [];
  if (files.length === 0) {
    return renderDiffRawTextHtml(typeof payload.diff === "string" ? payload.diff : "");
  }

  const jobId = String((job && job.id) || state.selectedJobId || "").trim();
  const ui = getJobDiffUi(jobId);
  const queryRaw = typeof ui.filterText === "string" ? ui.filterText : "";
  const query = queryRaw.trim().toLowerCase();
  const visible = query ? files.filter((f) => diffFileMatchesQuery(f, query)) : files;

  let selectedFileId = String(ui.selectedFileId || "").trim();
  if (!visible.some((f) => String(f.id || "") === selectedFileId)) {
    selectedFileId = visible[0] ? String(visible[0].id || "") : "";
  }
  ui.selectedFileId = selectedFileId;
  const selectedFile = visible.find((f) => String(f.id || "") === selectedFileId) || null;

  const totalAdditions = files.reduce((sum, f) => sum + Math.max(0, Number.isFinite(f.additions) ? Math.trunc(f.additions) : 0), 0);
  const totalDeletions = files.reduce((sum, f) => sum + Math.max(0, Number.isFinite(f.deletions) ? Math.trunc(f.deletions) : 0), 0);

  let listHtml = "";
  let lastSection = "";
  for (const file of visible) {
    const section = String(file && file.section ? file.section : "");
    if (section !== lastSection) {
      listHtml += `<div class="difffiles__section">${escapeHtml(section || "changes")}</div>`;
      lastSection = section;
    }

    const f = file && typeof file === "object" ? file : {};
    const statusClass = diffStatusClass(f.status);
    const statusShort = diffStatusShort(f.status);
    const additions = Math.max(0, Number.isFinite(f.additions) ? Math.trunc(f.additions) : 0);
    const deletions = Math.max(0, Number.isFinite(f.deletions) ? Math.trunc(f.deletions) : 0);
    const mainPath = String(f.path || f.newPath || f.oldPath || "(unknown file)");
    const subPath = f.oldPath && f.newPath && f.oldPath !== f.newPath ? String(f.oldPath) : "";
    const active = String(f.id || "") === selectedFileId;

    listHtml += `
      <button type="button" class="difffile${active ? " difffile--active" : ""}" data-job-diff-file-id="${escapeHtml(String(f.id || ""))}">
        <span class="difffile__text">
          <span class="difffile__path">${escapeHtml(mainPath)}</span>
          ${subPath ? `<span class="difffile__sub">${escapeHtml(subPath)}</span>` : ""}
        </span>
        <span class="difffile__meta">
          <span class="difffile__status difffile__status--${statusClass}">${escapeHtml(statusShort)}</span>
          ${additions > 0 ? `<span class="difffile__delta difffile__delta--add">+${additions}</span>` : ""}
          ${deletions > 0 ? `<span class="difffile__delta difffile__delta--del">-${deletions}</span>` : ""}
        </span>
      </button>
    `;
  }

  if (!listHtml) {
    listHtml = `<div class="difffiles__empty">No files match the current filter.</div>`;
  }

  const fileCountText = query ? `${visible.length}/${files.length} files` : `${files.length} files`;

  return `
    <div class="diffview__shell">
      <aside class="difffiles">
        <div class="difffiles__toolbar">
          <input
            class="difffiles__filter"
            type="search"
            placeholder="Filter files…"
            autocomplete="off"
            value="${escapeHtml(queryRaw)}"
            data-job-diff-filter
          />
          <div class="difffiles__summary">
            <span>${escapeHtml(fileCountText)}</span>
            <span class="difffiles__totals">
              ${totalAdditions > 0 ? `<span class="difffile__delta difffile__delta--add">+${totalAdditions}</span>` : ""}
              ${totalDeletions > 0 ? `<span class="difffile__delta difffile__delta--del">-${totalDeletions}</span>` : ""}
            </span>
          </div>
        </div>
        <div class="difffiles__list">${listHtml}</div>
      </aside>
      <section class="diffcontent">${renderDiffSelectedFileHtml(selectedFile, model.notes)}</section>
    </div>
  `;
}

function rerenderSelectedJobDiffFromCache() {
  const jobId = String(state.selectedJobId || "").trim();
  if (!jobId) return;
  const job = state.jobs.get(jobId);
  if (!job) return;
  const cached = jobDiffCache.get(jobId);
  if (!(cached && cached.payload)) return;

  renderJobDiffPanel(job, cached.payload, { showRefresh: true });
  if (state.activeTab === "diff" && normalizeJobSearchQuery(state.jobSearchQuery)) {
    applyJobSearchToActivePanel({ preserveIndex: true, scroll: false });
  }
}

function renderJobDiffPanel(job, payload, opts = {}) {
  if (!els.jobDialogDiff) return;
  const o = opts && typeof opts === "object" ? opts : {};
  const loading = !!o.loading;
  const error = !!o.error;
  const message = typeof o.message === "string" ? o.message.trim() : "";
  const canRefresh = o.showRefresh !== false;
  const p = payload && typeof payload === "object" ? payload : null;

  const metaBits = [];
  if (p && typeof p.baseRef === "string" && p.baseRef.trim()) metaBits.push(`base=${p.baseRef.trim()}`);
  if (p && typeof p.committedRange === "string" && p.committedRange.trim()) metaBits.push(`range=${p.committedRange.trim()}`);
  if (p && p.hasCommittedChanges === true) metaBits.push("committed=yes");
  if (p && p.hasWorkingTreeChanges === true) metaBits.push("working_tree=yes");
  if (p) {
    const untrackedListed = Array.isArray(p.untrackedFiles) ? p.untrackedFiles.length : 0;
    const untrackedOmitted = typeof p.untrackedFilesOmitted === "number" ? Math.max(0, Math.trunc(p.untrackedFilesOmitted)) : 0;
    const untrackedTotal = untrackedListed + untrackedOmitted;
    if (untrackedTotal > 0) metaBits.push(`untracked=${untrackedTotal}`);
  }
  if (p && p.truncated === true) metaBits.push("truncated=yes");
  const metaText = metaBits.length > 0 ? metaBits.join("  ") : "git diff";

  const statusText = loading ? "Loading…" : error ? "Load failed" : p && p.hasChanges ? "Changes" : "No changes";
  const cwdTitle = p && typeof p.cwd === "string" ? p.cwd.trim() : "";

  let body = "";
  if (message) {
    body = `<div class="logline${error ? " logline--stderr" : ""}">${escapeHtml(message)}</div>`;
  } else if (p && p.hasChanges === true) {
    body = renderDiffWorkbenchHtml(job, p);
  } else {
    body = `<div class="logline">No code changes detected for this task.</div>`;
  }

  const hints = p && Array.isArray(p.hints) ? p.hints.map((x) => String(x || "").trim()).filter(Boolean) : [];
  const hintsHtml = hints.length
    ? `<div class="diffview__hints">${hints.map((h) => `<div class="diffview__hint">${escapeHtml(h)}</div>`).join("")}</div>`
    : "";

  const refreshBtn = canRefresh
    ? `<button type="button" class="btn btn--ghost diffview__refresh" data-job-diff-refresh ${loading ? "disabled" : ""}>Refresh</button>`
    : "";

  els.jobDialogDiff.innerHTML = `
    <div class="diffview">
      <div class="diffview__head">
        <div class="diffview__status">${escapeHtml(statusText)}</div>
        <div class="diffview__meta" title="${escapeHtml(cwdTitle)}">${escapeHtml(metaText)}</div>
        ${refreshBtn}
      </div>
      ${hintsHtml}
      ${body}
    </div>
  `;
}

async function loadSelectedJobDiff(opts = {}) {
  if (!els.jobDialogDiff) return;
  const o = opts && typeof opts === "object" ? opts : {};
  const force = !!o.force;
  const jobId = String(state.selectedJobId || "").trim();
  if (!jobId) return;
  const job = state.jobs.get(jobId);
  if (!job) return;

  if (isDemoJob(job)) {
    renderJobDiffPanel(job, null, { message: "Diff view is not available for demo cards.", showRefresh: false });
    return;
  }
  if (!api || typeof api.checkoutsGetDiff !== "function") {
    renderJobDiffPanel(job, null, { message: "Diff view is not supported in this build.", showRefresh: false });
    return;
  }
  if (job.status === "running" && !force) {
    renderJobDiffPanel(job, null, {
      message: "This task is still running. Open this tab after completion or refresh manually.",
      showRefresh: true
    });
    return;
  }

  const sig = jobDiffSignature(job);
  const cached = jobDiffCache.get(jobId);
  const hasFreshCache = !!(cached && cached.sig === sig && Date.now() - cached.fetchedAt <= JOB_DIFF_CACHE_TTL_MS);
  if (!force && hasFreshCache && cached.payload) {
    renderJobDiffPanel(job, cached.payload);
    return;
  }

  renderJobDiffPanel(job, cached && cached.payload ? cached.payload : null, { loading: true, showRefresh: true });
  const reqSeq = ++jobDiffReqSeq;

  try {
    const res = await api.checkoutsGetDiff(jobId, { maxChars: JOB_DIFF_MAX_CHARS });
    if (reqSeq !== jobDiffReqSeq) return;
    if (!(els.jobDialog && els.jobDialog.open)) return;
    if (String(state.selectedJobId || "") !== jobId) return;

    const liveJob = state.jobs.get(jobId) || job;
    const payload = res && typeof res === "object" ? res : {};
    const model = payload && payload.hasChanges === true ? parseUnifiedDiffModel(typeof payload.diff === "string" ? payload.diff : "") : null;
    jobDiffCache.set(jobId, { sig: jobDiffSignature(liveJob), fetchedAt: Date.now(), payload, model });
    renderJobDiffPanel(liveJob, payload);

    if (state.activeTab === "diff" && normalizeJobSearchQuery(state.jobSearchQuery)) {
      applyJobSearchToActivePanel({ preserveIndex: false, scroll: false });
    }
  } catch (err) {
    if (reqSeq !== jobDiffReqSeq) return;
    if (!(els.jobDialog && els.jobDialog.open)) return;
    if (String(state.selectedJobId || "") !== jobId) return;
    const msg = String(err && err.message ? err.message : err).trim() || "Failed to load git diff.";
    renderJobDiffPanel(job, cached && cached.payload ? cached.payload : null, { message: msg, error: true, showRefresh: true });
  }
}

function renderJobDialogPanels(job) {
  const stickChat = isNearBottom(els.jobDialogChat);
  const stickLive = isNearBottom(els.jobDialogLive);
  const stickLogs = isNearBottom(els.jobDialogLogs);
  const agentName = agentDisplayName(job && job.agent);
  const nowMs = Date.now();
  const running = job && job.status === "running";

  // queued follow-ups (entered while a job is running)
  const queuedPrompts = Array.isArray(job && job.queuedPrompts) ? job.queuedPrompts : [];
  const queuedHtml = queuedPrompts.length
    ? (() => {
        const head = `Queued follow-ups (${queuedPrompts.length})`;
        const qItems = queuedPrompts
          .map((p) => {
            const ts = p && typeof p.ts === "string" ? p.ts : "";
            const tMs = isoMs(ts);
            const clock = fmtClock(tMs);
            const timeHtml = clock
              ? ` <span class="msg__time" title="${escapeHtml(ts)}">${escapeHtml(clock)}</span>`
              : "";
            const text = p && typeof p.text === "string" ? p.text : "";
            const images = p && Array.isArray(p.images) ? p.images : [];
            return `
		      <div class="msg msg--user msg--queued">
			        <div class="msg__role">You <span class="msg__badge">Queued</span>${timeHtml}</div>
		        <div class="msg__text">${renderMarkdownSafeHtml(text)}</div>
		        ${attachmentChipsHtml(images)}
		      </div>
		    `;
          })
          .join("");
        return `<div class="queued" title="Queued follow-ups will run after the current agent process finishes."><div class="queued__head">${escapeHtml(head)}</div>${qItems}</div>`;
      })()
    : "";

  // chat (merge user prompts + assistant messages by timestamp)
  const timeline = [];
  for (let i = 0; i < (job.prompts || []).length; i += 1) {
    const p = job.prompts[i];
    timeline.push({ ts: p.ts || "", role: "user", text: p.text || "", images: p.images || [], _i: i });
  }
  for (let i = 0; i < (job.messages || []).length; i += 1) {
    const m = job.messages[i];
    timeline.push({
      ts: m.ts || "",
      role: m.role || "assistant",
      text: m.text || "",
      images: m.images || [],
      _i: i + 100000
    });
  }
  timeline.sort((a, b) => {
    if (a.ts < b.ts) return -1;
    if (a.ts > b.ts) return 1;
    return a._i - b._i;
  });

  // Precompute per-entry timestamps and "since prompt" offsets (reset after each user prompt).
  let lastPromptMs = NaN;
  const enriched = [];
  for (const t of timeline) {
    const tMs = isoMs(t.ts);
    if (t.role === "user" && Number.isFinite(tMs)) lastPromptMs = tMs;
    enriched.push({ ...t, _ms: tMs, _baseMs: lastPromptMs });
  }

  const items = enriched.map((t, idx) => {
    const isLast = idx === enriched.length - 1;
    const isUser = t.role === "user";
    const clock = fmtClock(t._ms);
    const relMs =
      Number.isFinite(t._ms) && Number.isFinite(t._baseMs) ? Math.max(0, Number(t._ms) - Number(t._baseMs)) : NaN;
    const rel = Number.isFinite(relMs) ? fmtOffset(relMs) : "";
    const showRel = rel && rel !== "0:00";
    const meta = clock && showRel ? `${clock} (+${rel})` : clock || "";
    const timeHtml = meta ? ` <span class="msg__time" title="${escapeHtml(t.ts)}">${escapeHtml(meta)}</span>` : "";

    // While the job is running, keep a live counter on the latest chat entry so you can
    // see how long it's been since the last message appeared.
    let runningHtml = "";
    if (running && isLast) {
      const baseMs = Number.isFinite(t._ms) ? t._ms : jobStartMs(job);
      if (Number.isFinite(baseMs)) {
        const counter = fmtOffset(Math.max(0, nowMs - baseMs));
        runningHtml = ` <span class="msg__time" data-msg-running-base-ms="${escapeHtml(String(baseMs))}" title="Time since last message">running ${escapeHtml(counter)}</span>`;
      }
    }
	      return `
	      <div class="msg ${isUser ? "msg--user" : "msg--assistant"}">
		        <div class="msg__role">${isUser ? "You" : escapeHtml(agentName)}${timeHtml}${runningHtml}</div>
	        <div class="msg__text">${renderMarkdownSafeHtml(t.text)}</div>
	        ${attachmentChipsHtml(t.images)}
		      </div>
		    `;
		  });
  // Keep queued follow-ups at the end so they stay visible with sticky bottom scroll.
  const chatHtml = `${items.join("")}${queuedHtml}`;
  els.jobDialogChat.innerHTML = chatHtml || `<div class="logline">No messages yet.</div>`;
  wireAttachmentThumbs(els.jobDialogChat);

  // live feed (terminal-ish tail)
  {
    const running = job && job.status === "running";
    const maxLines = running ? 260 : 140;
    const chunks = buildLiveTailChunks(job, maxLines);
    els.jobDialogLive.innerHTML = renderLiveTailHtml(chunks, { running });
  }

  // logs
  els.jobDialogLogs.innerHTML = renderJobLogsHtml(job.logs || []);

  setActiveTab(state.activeTab);

  if (stickChat) els.jobDialogChat.scrollTop = els.jobDialogChat.scrollHeight;
  if (stickLive) els.jobDialogLive.scrollTop = els.jobDialogLive.scrollHeight;
  if (stickLogs) els.jobDialogLogs.scrollTop = els.jobDialogLogs.scrollHeight;
  if (normalizeJobSearchQuery(state.jobSearchQuery)) {
    applyJobSearchToActivePanel({ preserveIndex: true, scroll: false });
  } else {
    renderJobSearchUi();
  }
}

function upsertJob(job) {
  state.jobs.set(job.id, job);
  if (state.displayMode === "cards") updateCardEl(job);
  else renderBoard();
  if (state.selectedJobId === job.id && els.jobDialog.open) {
    const title = jobDisplayTitle(job);
    els.jobDialogTitle.textContent = title || "Job";
    els.jobDialogTitle.title = oneLine(title);
    renderJobDialogMeta(job);
    renderJobDialogPanels(job);
    updateJobDialogActions(job);
  }
  syncDurationTicker();
  scheduleStatusDialogRender();
  // Keep search results accurate while a query is active (jobs can start matching as new text arrives).
  if (isSearchActive()) scheduleSearch(900, { replace: false });
}

function patchJob(jobId, patch) {
  const job = state.jobs.get(jobId);
  if (!job) return;
  Object.assign(job, patch);
  upsertJob(job);
}

function removeJob(jobId) {
  const id = String(jobId || "");
  if (!id) return;
  state.jobs.delete(id);
  unmountCard(id);
  if (state.displayMode === "cards") syncBoardLaneVisibility();
  else renderBoard();
  if (state.selectedJobId === id) {
    if (els.jobDialog && els.jobDialog.open) els.jobDialog.close();
    state.selectedJobId = null;
  }
  syncDurationTicker();
  scheduleStatusDialogRender();
}

function appendJobLog(jobId, entry) {
  const job = state.jobs.get(jobId);
  if (!job) return;
  job.logs = job.logs || [];
  job.logs.push(entry);
  if (job.logs.length > 2000) job.logs.splice(0, job.logs.length - 2000);
  upsertJob(job);
}

function appendJobMessage(jobId, message) {
  const job = state.jobs.get(jobId);
  if (!job) return;
  job.messages = job.messages || [];
  job.messages.push(message);
  if (job.messages.length > 200) job.messages.splice(0, job.messages.length - 200);
  upsertJob(job);
}

async function addSkipDefaultBranchConfirmBranch(projectId, branch) {
  const id = String(projectId || "").trim();
  const b = normalizeBranchName(branch);
  if (!id || !b) return false;
  if (!api || typeof api.projectsUpdate !== "function") return false;

  const project = state.projects.find((p) => p && p.id === id) || null;
  if (!project) return false;

  const existing = Array.isArray(project.skipDefaultBranchConfirmBranches) ? project.skipDefaultBranchConfirmBranches : [];
  const next = [];
  const seen = new Set();
  for (const x of existing) {
    const nx = normalizeBranchName(x);
    if (!nx) continue;
    if (seen.has(nx)) continue;
    seen.add(nx);
    next.push(nx);
    if (next.length >= 100) break;
  }
  if (!seen.has(b)) next.push(b);
  while (next.length > 100) next.shift();

  try {
    await api.projectsUpdate(id, { skipDefaultBranchConfirmBranches: next });
    project.skipDefaultBranchConfirmBranches = next;
    return true;
  } catch (err) {
    showToast(String(err && err.message ? err.message : err));
    return false;
  }
}

async function maybeConfirmDefaultBranchBeforeRun(projectId, checkoutModeOverride) {
  const id = String(projectId || "").trim();
  if (!id) return true;

  const project = state.projects.find((p) => p && p.id === id) || null;
  if (!project) return true;

  const overrideRaw = typeof checkoutModeOverride === "string" ? checkoutModeOverride.trim() : "";
  const mode = overrideRaw ? normalizeCheckoutMode(overrideRaw) : normalizeCheckoutMode(project.checkoutMode);
  const def = normalizeBranchName(project.defaultBranch);
  if (mode !== "inplace") return true;
  if (!def) return true;
  if (!api || typeof api.projectsGitInfo !== "function") return true;

  let info = null;
  try {
    info = await api.projectsGitInfo(id);
  } catch {
    info = null;
  }
  if (!info || typeof info !== "object") return true;
  if (!info.isGitRepo) return true;

  const cur = typeof info.branch === "string" ? info.branch.trim() : "";
  if (!cur || cur === def) return true;
  const curNorm = normalizeBranchName(cur);
  if (curNorm && Array.isArray(project.skipDefaultBranchConfirmBranches)) {
    const suppress = project.skipDefaultBranchConfirmBranches.some((b) => normalizeBranchName(b) === curNorm);
    if (suppress) return true;
  }

  const action = await promptBranchMismatch({
    projectName: project.name,
    projectPath: project.path,
    currentBranch: cur,
    defaultBranch: def,
    dirty: !!info.dirty
  });

  if (action === "checkout") {
    try {
      await api.projectsSwitchBranch(id, def);
      state.projects = await api.projectsList();
      renderProjects();
      renderBoard();
      return true;
    } catch (err) {
      setHint(String(err && err.message ? err.message : err), "error");
      return false;
    }
  }

  if (action === "run_no_ask") {
    await addSkipDefaultBranchConfirmBranch(id, curNorm || cur);
    return true;
  }

  if (action === "run") return true;
  return false; // cancel
}

function helperCurrentAgentPref() {
  return normalizeHelperAgentSelection(els.helperAgentSelect ? els.helperAgentSelect.value : "");
}

function helperCurrentContextScope() {
  const raw = els.helperContextScopeSelect ? String(els.helperContextScopeSelect.value || "") : "";
  const fallbackProjectId = helperDefaultProjectIdForContext();
  return normalizeHelperContextScope(raw || getStoredHelperContextScope(), { defaultProjectId: fallbackProjectId });
}

function isHelperClaudeFamilyModel(value) {
  const low = String(value || "")
    .trim()
    .toLowerCase();
  return low === "opus" || low === "sonnet" || low === "haiku";
}

function helperCurrentModelPref() {
  const selectedAgent = helperCurrentAgentPref();
  const configured = normalizeHelperModelValue(state.settings && state.settings.helperDefaultModel ? state.settings.helperDefaultModel : "");

  if (selectedAgent === "claude") return configured || "opus";
  if (selectedAgent === "codex") return isHelperClaudeFamilyModel(configured) ? "" : configured;
  if (configured) return configured;
  return helperDefaultModelFromSettings(state.settings);
}

function helperRunnerText(agent, model) {
  const a = normalizeAgentKey(agent || "");
  const aLabel = a ? agentDisplayName(a) : "";
  const m = String(model || "").trim();
  return `${aLabel || "auto"}${m ? ` · ${m}` : ""}`;
}

function helperSelectedProjectForContext(scopeValue = helperCurrentContextScope()) {
  const projectId = helperProjectIdFromContextValue(scopeValue);
  if (!projectId) return null;
  return helperProjectById(projectId);
}

function helperSelectedJobForContext(projectId = "") {
  const selected = String(state.selectedJobId || "").trim();
  if (selected) {
    const hit = state.jobs.get(selected);
    if (hit && !isDemoJob(hit)) {
      if (!projectId) return hit;
      const hitProjectId = String(hit.projectId || "").trim();
      if (!hitProjectId || hitProjectId !== String(projectId).trim()) return null;
      return hit;
    }
  }
  return null;
}

function buildHelperContextPayload() {
  const scope = helperCurrentContextScope();
  const project = helperSelectedProjectForContext(scope);
  const projectId = project && project.id ? String(project.id).trim() : "";
  const job = project ? helperSelectedJobForContext(projectId) : null;
  const composerAgent = normalizeAgentKey(els.agentSelect ? els.agentSelect.value : "");
  const composerModel = String(els.modelInput && els.modelInput.value ? els.modelInput.value : "").trim();
  const promptPreview = job && typeof job.promptPreview === "string" ? job.promptPreview.trim() : "";
  const preview =
    promptPreview ||
    (job && Array.isArray(job.prompts) && job.prompts.length > 0 && typeof job.prompts[job.prompts.length - 1].text === "string"
      ? String(job.prompts[job.prompts.length - 1].text || "").trim()
      : "");

  return {
    projectName: project && project.name ? String(project.name) : "",
    projectPath: project && project.path ? String(project.path) : "",
    activeView: normalizeView(state.view),
    composerAgent,
    composerModel,
    selectedJobTitle: job ? jobDisplayTitle(job) : "",
    selectedJobStatus: job ? jobStatusForUi(job) : "",
    selectedJobAgent: job && job.agent ? normalizeAgentKey(job.agent) : "",
    selectedJobModel: job && job.model ? String(job.model) : "",
    selectedJobPrompt: preview
  };
}

function helperSessionById(sessionId) {
  const id = String(sessionId || "").trim();
  if (!id) return null;
  return Array.isArray(state.helperSessions) ? state.helperSessions.find((s) => s && s.id === id) || null : null;
}

function helperSessionPreviewText(session) {
  const messages = session && Array.isArray(session.messages) ? session.messages : [];
  const seed = messages.find((m) => m && m.role === "user" && String(m.text || "").trim()) || messages[0];
  const raw = seed && typeof seed.text === "string" ? oneLine(seed.text) : "";
  return raw ? truncateText(raw, 56) : "New session";
}

function helperSessionUpdatedLabel(session) {
  const raw = session && session.updatedAt ? String(session.updatedAt) : session && session.createdAt ? String(session.createdAt) : "";
  if (!raw) return "";
  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) return "";
  const d = new Date(ms);
  try {
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return d.toISOString();
  }
}

function helperSessionOptionLabel(session, idx) {
  const title = helperSessionPreviewText(session);
  const when = helperSessionUpdatedLabel(session);
  const prefix = `Session ${idx + 1}`;
  return when ? `${prefix}: ${title} · ${when}` : `${prefix}: ${title}`;
}

function renderHelperSessionOptions() {
  if (!els.helperSessionSelect) return;
  const sessions = Array.isArray(state.helperSessions) ? state.helperSessions : [];
  if (sessions.length === 0) {
    els.helperSessionSelect.innerHTML = `<option value="">No sessions</option>`;
    els.helperSessionSelect.value = "";
    return;
  }

  const options = sessions
    .map((session, idx) => `<option value="${escapeHtml(session.id)}">${escapeHtml(helperSessionOptionLabel(session, idx))}</option>`)
    .join("");
  els.helperSessionSelect.innerHTML = options;

  let active = String(state.helperSessionId || "").trim();
  if (!active || !sessions.some((s) => s && s.id === active)) active = sessions[0].id;
  state.helperSessionId = active;
  if (active) els.helperSessionSelect.value = active;
}

function helperPersistSessionsState() {
  if (!helperPersistHistoryFromSettings()) {
    clearStoredHelperHistory();
    return;
  }
  storeHelperSessions(state.helperSessions, state.helperSessionId);
}

function syncActiveHelperSessionFromState(opts = {}) {
  const touch = !(opts && opts.touch === false);
  const persist = !(opts && opts.persist === false);

  state.helperSessions = Array.isArray(state.helperSessions) ? state.helperSessions : [];
  state.helperMessages = Array.isArray(state.helperMessages) ? state.helperMessages : [];

  let activeId = String(state.helperSessionId || "").trim();
  let active = helperSessionById(activeId);
  if (!active) {
    const seeded = createHelperSessionRecord({ messages: state.helperMessages, lastRunner: state.helperLastRunner });
    state.helperSessions.unshift(seeded);
    active = seeded;
    activeId = seeded.id;
  }

  const normalizedMessages = normalizeHelperMessages(state.helperMessages);
  const next = {
    ...active,
    messages: normalizedMessages,
    lastRunner: String(state.helperLastRunner || helperRunnerFromMessages(normalizedMessages))
      .trim()
      .slice(0, 64)
  };
  if (touch) next.updatedAt = new Date().toISOString();

  state.helperSessions = state.helperSessions.map((s) => (s && s.id === activeId ? next : s));
  const normalized = normalizeHelperSessions(state.helperSessions, activeId);
  state.helperSessions = normalized.sessions;
  state.helperSessionId = normalized.activeSessionId;

  if (persist) helperPersistSessionsState();
}

function loadHelperSessionsFromStorage() {
  if (!helperPersistHistoryFromSettings()) {
    clearStoredHelperHistory();
    const seeded = createHelperSessionRecord({});
    state.helperSessions = [seeded];
    state.helperSessionId = seeded.id;
    state.helperMessages = [];
    state.helperLastRunner = "";
    return;
  }

  const stored = getStoredHelperSessions();
  if (!Array.isArray(stored.sessions) || stored.sessions.length === 0) {
    const seeded = createHelperSessionRecord({});
    state.helperSessions = [seeded];
    state.helperSessionId = seeded.id;
    state.helperMessages = [];
    state.helperLastRunner = "";
    helperPersistSessionsState();
    return;
  }

  state.helperSessions = stored.sessions;
  state.helperSessionId = stored.activeSessionId || (stored.sessions[0] && stored.sessions[0].id ? stored.sessions[0].id : "");
  const active = helperSessionById(state.helperSessionId) || stored.sessions[0];
  state.helperSessionId = active && active.id ? active.id : "";
  state.helperMessages = active && Array.isArray(active.messages) ? normalizeHelperMessages(active.messages) : [];
  state.helperLastRunner = String(active && active.lastRunner ? active.lastRunner : helperRunnerFromMessages(state.helperMessages)).trim().slice(0, 64);
  helperPersistSessionsState();
}

function helperSelectSession(sessionId, opts = {}) {
  if (state.helperPending) return false;
  const id = String(sessionId || "").trim();
  syncActiveHelperSessionFromState({ touch: false });
  const next = helperSessionById(id);
  if (!next) return false;
  state.helperSessionId = next.id;
  state.helperMessages = Array.isArray(next.messages) ? normalizeHelperMessages(next.messages) : [];
  state.helperLastRunner = String(next.lastRunner || helperRunnerFromMessages(state.helperMessages)).trim().slice(0, 64);
  helperPersistSessionsState();
  helperSetMeta(helperCurrentMetaStatusText());
  renderHelperPanel({ forceScroll: true });

  if (opts && opts.focus && els.helperInput) {
    try {
      els.helperInput.focus();
    } catch {
      // ignore
    }
  }
  return true;
}

function helperNewSessionNow(opts = {}) {
  if (state.helperPending) return false;
  syncActiveHelperSessionFromState({ touch: false });

  const created = createHelperSessionRecord({});
  const merged = normalizeHelperSessions([created, ...(Array.isArray(state.helperSessions) ? state.helperSessions : [])], created.id);
  state.helperSessions = merged.sessions;
  state.helperSessionId = merged.activeSessionId || created.id;
  state.helperMessages = [];
  state.helperLastRunner = "";
  helperPersistSessionsState();
  helperSetMeta(helperCurrentMetaStatusText());
  renderHelperPanel({ forceScroll: true });

  if (!(opts && opts.toast === false)) showToast("New chat session started.");
  if (opts && opts.focus && els.helperInput) {
    try {
      els.helperInput.focus();
    } catch {
      // ignore
    }
  }
  return true;
}

function clearHelperCurrentSessionNow(opts = {}) {
  const showToastMsg = !(opts && opts.toast === false);
  if (state.helperPending) return false;
  state.helperMessages = [];
  state.helperLastRunner = "";
  syncActiveHelperSessionFromState({ touch: true });
  helperSetMeta(helperCurrentMetaStatusText());
  renderHelperPanel({ forceScroll: true });
  if (showToastMsg) showToast("Current chat session cleared.");
  return true;
}

function helperMessagesForApi() {
  const arr = Array.isArray(state.helperMessages) ? state.helperMessages : [];
  return arr
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      text: String(m.text || "").trim()
    }))
    .filter((m) => m.text)
    .slice(-18);
}

function helperPushMessage(role, text, meta = {}) {
  const r = role === "assistant" ? "assistant" : "user";
  const t = String(text || "").trim();
  if (!t) return;
  const item = {
    id: safeUuid(),
    role: r,
    text: t,
    ts: new Date().toISOString(),
    agent: r === "assistant" ? normalizeHelperAgentSelection(meta.agent) : "",
    model: r === "assistant" ? normalizeHelperModelValue(meta.model) : ""
  };
  state.helperMessages = Array.isArray(state.helperMessages) ? state.helperMessages : [];
  state.helperMessages.push(item);
  const MAX = HELPER_SESSION_MESSAGES_MAX;
  if (state.helperMessages.length > MAX) state.helperMessages.splice(0, state.helperMessages.length - MAX);
  syncActiveHelperSessionFromState({ touch: true });
}

function helperSetMeta(text) {
  if (!els.helperMeta) return;
  const scope = helperCurrentContextScope();
  const project = helperSelectedProjectForContext(scope);
  const projectName = project && project.name ? String(project.name).trim() : "";
  const contextText = projectName ? `Context: Project · ${projectName}` : "Context: Global";
  const msg = String(text || "").trim();
  els.helperMeta.textContent = msg ? `${msg} · ${contextText}` : contextText;
}

function helperCurrentMetaStatusText() {
  if (state.helperPending) return "Thinking…";
  if (state.helperLastRunner) return `Last reply: ${state.helperLastRunner}`;
  return "";
}

function renderHelperPanel(opts = {}) {
  const forceScroll = !!(opts && opts.forceScroll);
  const showClosedPending = !!state.helperPending && !state.helperOpen;
  if (els.helperBubbleBtn) {
    els.helperBubbleBtn.classList.toggle("helperbubble--open", !!state.helperOpen);
    els.helperBubbleBtn.classList.toggle("helperbubble--pending", showClosedPending);
    els.helperBubbleBtn.setAttribute("aria-pressed", state.helperOpen ? "true" : "false");
  }
  if (els.helperThinkingIndicator) els.helperThinkingIndicator.hidden = !showClosedPending;
  if (els.helperPanel) els.helperPanel.hidden = !state.helperOpen;
  renderHelperSessionOptions();
  if (!els.helperMessages) return;

  const stick = isNearBottom(els.helperMessages);
  const items = Array.isArray(state.helperMessages) ? state.helperMessages : [];
  const hasAssistantReply = items.some((m) => m && m.role === "assistant");

  if (items.length === 0 && !state.helperPending) {
    els.helperMessages.innerHTML = `<div class="helperpanel__empty">Try quick questions, architecture checks, or ask for a clean task seed. You can move the result into the main prompt.</div>`;
  } else {
    const rows = [];
    for (const m of items) {
      const isAssistant = m.role === "assistant";
      const roleLabel = isAssistant ? "Chat" : "You";
      const runner = isAssistant ? helperRunnerText(m.agent, m.model) : "";
      rows.push(`
        <article class="helpermsg ${isAssistant ? "helpermsg--assistant" : "helpermsg--user"}">
          <div class="helpermsg__head">${escapeHtml(roleLabel)}${runner ? `<span class="helpermsg__meta">${escapeHtml(runner)}</span>` : ""}</div>
          <div class="msg__text">${renderMarkdownSafeHtml(String(m.text || ""))}</div>
        </article>
      `);
    }
    if (state.helperPending) {
      rows.push(`
        <article class="helpermsg helpermsg--assistant">
          <div class="helpermsg__head">Chat</div>
          <div class="msg__text">Thinking…</div>
        </article>
      `);
    }
    els.helperMessages.innerHTML = rows.join("");
  }

  if (els.helperSendBtn) els.helperSendBtn.disabled = !!state.helperPending;
  if (els.helperInput) els.helperInput.disabled = !!state.helperPending;
  if (els.helperSessionSelect) els.helperSessionSelect.disabled = !!state.helperPending;
  if (els.helperNewSessionBtn) els.helperNewSessionBtn.disabled = !!state.helperPending;
  if (els.helperClearSessionBtn) els.helperClearSessionBtn.disabled = !!state.helperPending || items.length === 0;
  if (els.helperToPromptBtn) {
    els.helperToPromptBtn.hidden = !hasAssistantReply;
    els.helperToPromptBtn.disabled = state.helperPending || !hasAssistantReply;
  }

  if (forceScroll || stick || state.helperPending) {
    els.helperMessages.scrollTop = els.helperMessages.scrollHeight;
  }
}

function setHelperOpen(open, opts = {}) {
  const nextOpen = !!open;
  if (!nextOpen && state.helperPending) state.helperReopenOnReply = true;
  if (nextOpen) state.helperReopenOnReply = false;
  state.helperOpen = nextOpen;
  renderHelperPanel();
  if (state.helperOpen && opts && opts.focus && els.helperInput) {
    try {
      els.helperInput.focus();
      els.helperInput.selectionStart = els.helperInput.selectionEnd = els.helperInput.value.length;
    } catch {
      // ignore
    }
  }
}

function toggleHelperPanel(opts = {}) {
  const force = opts && Object.prototype.hasOwnProperty.call(opts, "open") ? !!opts.open : null;
  const next = force == null ? !state.helperOpen : force;
  setHelperOpen(next, { focus: next && opts && opts.focus !== false });
}

async function askHelperFromInput() {
  if (state.helperPending) return;
  if (!api || typeof api.helperAsk !== "function") {
    showToast("Chat is not supported in this build.");
    return;
  }
  const text = String(els.helperInput && els.helperInput.value ? els.helperInput.value : "").trim();
  if (!text) return;

  helperPushMessage("user", text);
  if (els.helperInput) {
    els.helperInput.value = "";
    autosizeTextarea(els.helperInput, { maxRows: FOLLOWUP_AUTOSIZE_MAX_ROWS });
  }
  state.helperPending = true;
  helperSetMeta("Thinking…");
  renderHelperPanel({ forceScroll: true });

  const preferAgent = helperCurrentAgentPref();
  const preferModel = helperCurrentModelPref();
  const context = buildHelperContextPayload();
  const history = helperMessagesForApi();

  try {
    const res = await api.helperAsk({
      question: text,
      history,
      context,
      preferAgent,
      preferModel
    });
    const answer = String(res && res.answer ? res.answer : "").trim() || "No answer generated.";
    const agent = normalizeAgentKey(res && res.agent ? res.agent : "");
    const model = String(res && res.model ? res.model : "").trim();
    helperPushMessage("assistant", answer, { agent, model });
    state.helperLastRunner = agent ? agentDisplayName(agent) : "Auto";
    syncActiveHelperSessionFromState({ touch: false });
    helperSetMeta(`Last reply: ${state.helperLastRunner}`);
  } catch (err) {
    const msg = String(err && err.message ? err.message : err).trim() || "Chat request failed.";
    helperPushMessage("assistant", `Error: ${msg}`);
    syncActiveHelperSessionFromState({ touch: false });
    helperSetMeta("Chat request failed.");
  } finally {
    state.helperPending = false;
    if (!state.helperOpen && state.helperReopenOnReply) {
      state.helperOpen = true;
    }
    state.helperReopenOnReply = false;
    renderHelperPanel({ forceScroll: true });
    if (state.helperOpen && els.helperInput) {
      try {
        els.helperInput.focus();
      } catch {
        // ignore
      }
    }
  }
}

function helperContextSnippetForComposer() {
  const arr = helperMessagesForApi();
  if (arr.length === 0) return "";
  const picked = arr.slice(-8);
  const out = ["[Chat context]"];
  for (const m of picked) {
    out.push(m.role === "assistant" ? "Assistant:" : "User:");
    out.push(m.text);
    out.push("");
  }
  const body = out.join("\n").trim();
  return body.length > 20_000 ? `${body.slice(0, 20_000).trimEnd()}…` : body;
}

function appendHelperContextToComposer() {
  const snippet = helperContextSnippetForComposer();
  if (!snippet) {
    showToast("No chat context yet.");
    return false;
  }
  if (!els.promptInput) return false;

  const existing = String(els.promptInput.value || "").trimEnd();
  const next = existing ? `${existing}\n\n${snippet}` : snippet;
  els.promptInput.value = next;
  storeComposerDraft(next);
  setView("board");
  try {
    els.promptInput.focus();
    els.promptInput.selectionStart = els.promptInput.selectionEnd = els.promptInput.value.length;
  } catch {
    // ignore
  }
  showToast("Chat context added to prompt.");
  return true;
}

function applyHelperDefaultsToPanel(settings = state.settings, opts = {}) {
  const force = !!(opts && opts.force);
  const defAgent = helperDefaultAgentFromSettings(settings);

  if (els.helperAgentSelect) {
    const cur = normalizeHelperAgentSelection(els.helperAgentSelect.value);
    if (force || !cur) els.helperAgentSelect.value = defAgent;
  }
  renderHelperContextScopeOptions({ forceStored: force, skipStore: true });
}

function clearHelperHistoryNow(opts = {}) {
  const showToastMsg = !(opts && opts.toast === false);
  clearStoredHelperHistory();
  const seeded = createHelperSessionRecord({});
  state.helperSessions = [seeded];
  state.helperSessionId = seeded.id;
  state.helperMessages = [];
  state.helperLastRunner = "";
  helperPersistSessionsState();
  helperSetMeta("");
  renderHelperPanel({ forceScroll: true });
  if (showToastMsg) showToast("Chat history cleared.");
}

function initHelperUi() {
  const mod = isMacPlatform() ? "⌘" : "Ctrl";
  applyHelperDefaultsToPanel(state.settings, { force: true });
  if (els.helperInput) autosizeTextarea(els.helperInput, { maxRows: FOLLOWUP_AUTOSIZE_MAX_ROWS });
  if (els.helperBubbleBtn) {
    els.helperBubbleBtn.title = `Chat (${mod}+K)`;
    const kbd = els.helperBubbleBtn.querySelector(".helperbubble__kbd");
    if (kbd) kbd.textContent = `${mod}K`;
  }
  if (els.helperInput) {
    els.helperInput.placeholder = `Ask quickly… (${mod}+Enter to send)`;
  }
  state.helperOpen = false;
  state.helperPending = false;
  loadHelperSessionsFromStorage();
  helperSetMeta("");
  renderHelperPanel();
}

async function startJobFromComposer() {
  const promptText = (els.promptInput.value || "").trim();
  if (!promptText) return;

  // If the user starts a real job during onboarding, clean up demo UI.
  if (tour.active) stopFirstRunTour();
  else clearDemoJobs();

  // Starting a new run should land you on the active board view.
  setView("board");

  let projectId = els.projectSelect.value;
  const agent = normalizeAgentKey(els.agentSelect ? els.agentSelect.value : "");
  const model = (els.modelInput.value || "").trim();
  const images = [...(state.composerImages || [])];
  const files = [...(state.composerFiles || [])];

  try {
    setHint("");
    if (!projectId) {
      applyDefaultProjectSelection();
      syncComposerCheckoutModeUi();
      projectId = els.projectSelect.value;
    }

    if (projectId === TEMP_PROJECT_OPTION_VALUE) {
      const p = await createTemporaryProject();
      projectId = p && p.id ? String(p.id) : "";
      if (!projectId) return;
    }

    // First-run convenience: if there are no projects yet, open the folder picker.
    if (!projectId && state.projects.length === 0) {
      const p = await api.projectsAddDialog();
      if (!p) return;
      state.projects = await api.projectsList();
      renderProjects();
      renderBoard();
      els.projectSelect.value = p.id;
      storeProjectId(p.id);
      syncComposerCheckoutModeUi();
      projectId = p.id;
    }

    const checkoutMode =
      els.checkoutModeSelect && !els.checkoutModeSelect.disabled ? normalizeCheckoutMode(els.checkoutModeSelect.value) : "";
    const okBranch = await maybeConfirmDefaultBranchBeforeRun(projectId, checkoutMode);
    if (!okBranch) return;

    const payload = { prompt, projectId, agent, model, images };
    if (checkoutMode) payload.checkoutMode = checkoutMode;
    await api.jobsStart(payload);
    els.promptInput.value = "";
    closePromptPathSuggest();
    clearStoredComposerDraft();
    setComposerImages([]);
    setComposerFiles([]);
  } catch (err) {
    setHint(String(err && err.message ? err.message : err), "error");
  }
}

function quickPromptTargetTextarea() {
  if (state.helperOpen && els.helperInput && !els.helperInput.disabled) return els.helperInput;
  if (els.jobDialog && els.jobDialog.open && els.followupInput) return els.followupInput;
  return els.promptInput;
}

function appendQuickPromptText(text) {
  const raw = typeof text === "string" ? text : "";
  const t = raw.trim();
  const el = quickPromptTargetTextarea();
  if (!el) return;

  if (t) {
    const prev = el.value || "";
    const next = prev ? `${prev.replace(/\s*$/, "")}\n\n${t}\n` : `${t}\n`;
    el.value = next;
  }

  if (el === els.promptInput) storeComposerDraft(el.value || "");
  if (el === els.followupInput) scheduleAutosizeFollowupInput();
  if (el === els.helperInput) autosizeTextarea(els.helperInput, { maxRows: FOLLOWUP_AUTOSIZE_MAX_ROWS });

  try {
    el.focus();
    el.selectionStart = el.selectionEnd = el.value.length;
  } catch {
    // ignore
  }
}

async function sendFollowup() {
  const jobId = state.selectedJobId;
  if (!jobId) return;
  const job = state.jobs.get(jobId);
  if (!job) return;

  // Lightweight in-ticket control commands (helpful for voice / keyboard-only flows).
  // Only trigger on exact matches to avoid interfering with normal prompts.
  const raw = String(els.followupInput && els.followupInput.value ? els.followupInput.value : "");
  const cmd = raw.trim();
  const cmdLow = cmd.toLowerCase();
  if (job.status === "running" && (cmdLow === "stop" || cmdLow === "/stop")) {
    els.followupInput.value = "";
    scheduleAutosizeFollowupInput();
    setFollowupImages([]);
    setFollowupFiles([]);
    await cancelJob(jobId, { closeDialog: true });
    return;
  }
  if (job.status !== "running" && (cmdLow === "rerun" || cmdLow === "/rerun")) {
    els.followupInput.value = "";
    scheduleAutosizeFollowupInput();
    setFollowupImages([]);
    setFollowupFiles([]);
    await openRerunDialog(jobId);
    return;
  }

  if (jobBox(job) === "trash") {
    setTransientHint("Restore this job from Trash to send follow-ups.", "info", 7000);
    return;
  }
  const running = job.status === "running";
  const hasThreadId = typeof job.threadId === "string" && job.threadId.trim().length > 0;
  if (!running && !hasThreadId) {
    showToast("No thread id for this job yet.");
    return;
  }
  const text = cmd;
  if (!text) return;
  const images = [...(state.followupImages || [])];
  const files = [...(state.followupFiles || [])];
  const prompt = buildPromptWithFileAttachments(text, files);
  try {
    setHint("");
    setView("board");

    let sendRes = await api.jobsSend(jobId, prompt, images);
    const decision =
      sendRes && typeof sendRes === "object" && sendRes.needsCheckoutDecision && typeof sendRes.needsCheckoutDecision === "object"
        ? sendRes.needsCheckoutDecision
        : null;

    if (decision && decision.kind === "recreate_worktree") {
      const missingPath = typeof decision.missingPath === "string" ? decision.missingPath.trim() : "";
      const projectPath = typeof decision.projectPath === "string" ? decision.projectPath.trim() : "";
      const recreate = window.confirm(
        `The previous worktree checkout for this task no longer exists.\n\n` +
          `Missing checkout:\n${missingPath || "(unknown path)"}\n\n` +
          `Create a new worktree for this follow-up?\n\n` +
          `OK = create new worktree\nCancel = choose another option`
      );
      if (recreate) {
        sendRes = await api.jobsSend(jobId, prompt, images, { missingCheckoutAction: "recreate_worktree" });
      } else {
        const proceedInProject = window.confirm(
          `Continue this follow-up in the project checkout instead?\n\n` +
            `${projectPath || "(project path unknown)"}\n\n` +
            `This may run on the default branch.`
        );
        if (!proceedInProject) return;
        sendRes = await api.jobsSend(jobId, prompt, images, { missingCheckoutAction: "fallback_to_project" });
      }
    }

    if (sendRes && sendRes.ok === false) throw new Error(sendRes.error || "Failed to send follow-up");

    els.followupInput.value = "";
    scheduleAutosizeFollowupInput();
    setFollowupImages([]);
    setFollowupFiles([]);
    if (running) showToast("Queued follow-up.");
  } catch (err) {
    setHint(String(err && err.message ? err.message : err), "error");
  }
}

async function cancelJob(jobId, { closeDialog = false } = {}) {
  const id = String(jobId || "");
  if (!id) return;
  const job = state.jobs.get(id);
  if (job && job.status === "running") {
    const title = job ? jobDisplayTitle(job) : "this job";
    const ok = window.confirm(`Stop "${title}"?\n\nThis will interrupt the running agent.`);
    if (!ok) return;
  }
  try {
    await api.jobsCancel(id);
  } catch {
    // ignore
  } finally {
    if (closeDialog && state.selectedJobId === id) {
      // UX: stopping a running job should dismiss the modal.
      if (els.jobDialog && els.jobDialog.open) els.jobDialog.close();
      state.selectedJobId = null;
    }
  }
}

function normalizeRerunPromptSource(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (v === "first") return "first";
  if (v === "last") return "last";
  return "all";
}

function jobPromptTextAndImagesForRerun(job, promptSource) {
  const src = normalizeRerunPromptSource(promptSource);
  const prompts = Array.isArray(job && job.prompts) ? job.prompts : [];
  if (prompts.length === 0) {
    const preview = job && typeof job.promptPreview === "string" ? job.promptPreview.trimEnd() : "";
    return { prompt: preview, images: [] };
  }

  function pickPrompt(p) {
    const text = p && typeof p.text === "string" ? p.text.trimEnd() : "";
    const imgsRaw = p && Array.isArray(p.images) ? p.images : [];
    const images = [];
    const seen = new Set();
    for (const img of imgsRaw) {
      const s = typeof img === "string" ? img.trim() : "";
      if (!s || seen.has(s)) continue;
      seen.add(s);
      images.push(s);
    }
    return { prompt: text, images };
  }

  if (src === "first") return pickPrompt(prompts[0]);
  if (src === "last") return pickPrompt(prompts[prompts.length - 1]);

  // Combine prompts: keep the original prompt at the top for better titles,
  // then add follow-ups with lightweight headings.
  const parts = [];
  const images = [];
  const seen = new Set();

  let followIdx = 0;
  for (let i = 0; i < prompts.length; i += 1) {
    const p = prompts[i];
    const text = p && typeof p.text === "string" ? p.text.trimEnd() : "";
    if (text) {
      if (i === 0) parts.push(text);
      else {
        followIdx += 1;
        parts.push(`[Follow-up ${followIdx}]\n${text}`);
      }
    }

    const imgsRaw = p && Array.isArray(p.images) ? p.images : [];
    for (const img of imgsRaw) {
      const s = typeof img === "string" ? img.trim() : "";
      if (!s || seen.has(s)) continue;
      seen.add(s);
      images.push(s);
    }
  }

  return { prompt: parts.join("\n\n"), images };
}

async function ensureJobDetailsLoaded(jobId) {
  const id = String(jobId || "");
  if (!id) return null;
  let job = state.jobs.get(id) || null;
  if (job && jobDetailsLoaded(job)) return job;
  try {
    const fetched = await api.jobsGet(id);
    const merged = mergeJobDetails(job, fetched);
    if (merged) {
      state.jobs.set(id, merged);
      job = merged;
    }
  } catch {
    // ignore
  }
  return job;
}

function rerunAgentUiSync() {
  const agent = normalizeAgentKey(els.rerunAgentSelect ? els.rerunAgentSelect.value : "");
  if (!els.rerunModelInput) return;
  const cmb = codexModelComboboxRerun;
  const hasCombobox = !!(cmb && typeof cmb.setEnabled === "function");

  if (agent === "claude") {
    if (hasCombobox) cmb.setEnabled(false);
    else els.rerunModelInput.removeAttribute("list");
    els.rerunModelInput.placeholder = "Model override (optional, e.g. sonnet)";
  } else {
    if (hasCombobox) cmb.setEnabled(true);
    else els.rerunModelInput.setAttribute("list", "codexModelsList");
    els.rerunModelInput.placeholder = "Model override (optional)";
  }
}

async function openRerunDialog(jobId) {
  const id = String(jobId || "").trim();
  if (!id) return;
  if (!els.rerunDialog) return;
  const job = await ensureJobDetailsLoaded(id);
  if (!job) {
    showToast("Could not load job details for rerun.");
    return;
  }
  if (jobStatusForUi(job) === "running") {
    showToast("Stop the job before rerunning.");
    return;
  }

  state.rerunSourceJobId = id;

  if (els.rerunDialogMeta) {
    const bits = [];
    bits.push(`from=${jobDisplayTitle(job) || id}`);
    bits.push(`project=${projectNameById(job.projectId)}`);
    bits.push(`agent=${normalizeAgentKey(job.agent)}`);
    if (job.model) bits.push(`model=${job.model}`);
    bits.push(`prompts=${Array.isArray(job.prompts) ? job.prompts.length : 0}`);
    els.rerunDialogMeta.textContent = bits.join("  ");
  }

  if (els.rerunAgentSelect) els.rerunAgentSelect.value = normalizeAgentKey(job.agent);
  if (els.rerunModelInput) els.rerunModelInput.value = job.model || "";
  if (els.rerunPromptSelect) els.rerunPromptSelect.value = "all";

  rerunAgentUiSync();
  refreshCodexModelsDatalist({ showErrors: false });

  try {
    els.rerunDialog.showModal();
  } catch {
    // ignore
  }

  try {
    if (els.rerunAgentSelect) els.rerunAgentSelect.focus();
    else if (els.rerunModelInput) els.rerunModelInput.focus();
  } catch {
    // ignore
  }
}

async function startRerunFromDialog() {
  const sourceJobId = String(state.rerunSourceJobId || "");
  if (!sourceJobId) return;
  const job = await ensureJobDetailsLoaded(sourceJobId);
  if (!job) {
    showToast("Could not load job details for rerun.");
    return;
  }
  if (jobStatusForUi(job) === "running") {
    showToast("Stop the job before rerunning.");
    return;
  }

  const agent = normalizeAgentKey(els.rerunAgentSelect ? els.rerunAgentSelect.value : "");
  const model = (els.rerunModelInput && els.rerunModelInput.value ? String(els.rerunModelInput.value) : "").trim();
  const promptSource = normalizeRerunPromptSource(els.rerunPromptSelect ? els.rerunPromptSelect.value : "");
  const { prompt, images } = jobPromptTextAndImagesForRerun(job, promptSource);
  const text = String(prompt || "").trim();
  if (!text) {
    showToast("No prompt text found to rerun.");
    return;
  }

  try {
    setView("board");
    await api.jobsStart({ prompt: text, projectId: job.projectId, agent, model, images });
    showToast(`Rerun started (${agentDisplayName(agent)}${model ? ` · ${model}` : ""})`);
    try {
      if (els.rerunDialog && els.rerunDialog.open) els.rerunDialog.close();
    } catch {
      // ignore
    } finally {
      state.rerunSourceJobId = null;
    }
  } catch (err) {
    showToast(String(err && err.message ? err.message : err));
  }
}

function hideToast() {
  if (state.toastTimer) {
    window.clearTimeout(state.toastTimer);
    state.toastTimer = null;
  }
  state.toastUndo = null;
  state.toastActions = [];
  if (!els.toast) return;
  els.toast.hidden = true;
  els.toast.innerHTML = "";
}

function showToast(msg, undoHandler = null, ms = 8000, opts = null) {
  if (!els.toast) return;
  if (state.toastTimer) window.clearTimeout(state.toastTimer);

  state.toastUndo = typeof undoHandler === "function" ? undoHandler : null;
  const undoBtn = state.toastUndo
    ? `<button type="button" class="btn btn--ghost" data-toast-undo>Undo</button>`
    : "";

  const actions = opts && typeof opts === "object" && Array.isArray(opts.actions) ? opts.actions : [];
  const actionFns = [];
  const actionBtns = [];
  for (const a of actions) {
    if (!a || typeof a !== "object") continue;
    const label = typeof a.label === "string" ? a.label : "";
    const onClick = typeof a.onClick === "function" ? a.onClick : null;
    const kind = typeof a.kind === "string" ? a.kind : "";
    if (!label || !onClick) continue;
    const idx = actionFns.length;
    actionFns.push(onClick);
    const btnClass = kind === "primary" ? "btn btn--primary" : "btn btn--ghost";
    actionBtns.push(`<button type="button" class="${btnClass}" data-toast-action="${idx}">${escapeHtml(label)}</button>`);
  }
  state.toastActions = actionFns;

  els.toast.innerHTML = `<div class="toast__msg">${escapeHtml(msg)}</div>${actionBtns.join("")}${undoBtn}`;
  els.toast.hidden = false;
  state.toastTimer = window.setTimeout(() => hideToast(), Math.max(800, ms));
}

function browserOnlineState() {
  if (typeof navigator === "undefined") return true;
  if (typeof navigator.onLine !== "boolean") return true;
  return navigator.onLine;
}

function wireOfflineToast() {
  let lastKnownOnline = browserOnlineState();

  const syncOnlineState = () => {
    const nowOnline = browserOnlineState();
    const wentOffline = lastKnownOnline && !nowOnline;
    lastKnownOnline = nowOnline;
    if (wentOffline) showToast(OFFLINE_TOAST_MESSAGE);
  };

  if (!lastKnownOnline) showToast(OFFLINE_TOAST_MESSAGE);

  window.addEventListener("offline", () => syncOnlineState());
  window.addEventListener("online", () => {
    lastKnownOnline = true;
  });
  window.addEventListener("focus", () => syncOnlineState());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    syncOnlineState();
  });
}

function closeJobDialog() {
  if (!els.jobDialog) return;
  if (els.jobDialog.open) els.jobDialog.close();
  state.selectedJobId = null;
}

async function archiveJob(jobId, { closeDialog = false } = {}) {
  const id = String(jobId || "");
  if (!id) return;
  const job = state.jobs.get(id);
  if (!job) return;
  if (jobStatusForUi(job) === "running") return;

  try {
    await api.jobsArchive(id);
    if (closeDialog && state.selectedJobId === id) closeJobDialog();
    showToast("Archived", async () => {
      try {
        await api.jobsRestore(id);
      } catch {
        // ignore
      }
    });
  } catch (err) {
    setTransientHint(String(err && err.message ? err.message : err), "error");
  }
}

async function trashJob(jobId, { closeDialog = false } = {}) {
  const id = String(jobId || "");
  if (!id) return;
  const job = state.jobs.get(id);
  if (!job) return;
  if (jobStatusForUi(job) === "running") return;
  const prevBox = jobBox(job);

  try {
    await api.jobsTrash(id);
    if (closeDialog && state.selectedJobId === id) closeJobDialog();
    showToast("Moved to Trash", async () => {
      try {
        if (prevBox === "archive") await api.jobsArchive(id);
        else await api.jobsRestore(id);
      } catch {
        // ignore
      }
    });
  } catch (err) {
    setTransientHint(String(err && err.message ? err.message : err), "error");
  }
}

async function restoreJob(jobId, { closeDialog = false } = {}) {
  const id = String(jobId || "");
  if (!id) return;
  const job = state.jobs.get(id);
  if (!job) return;

  try {
    await api.jobsRestore(id);
    if (closeDialog && state.selectedJobId === id) closeJobDialog();
    showToast("Restored to Board");
    setView("board");
  } catch (err) {
    setTransientHint(String(err && err.message ? err.message : err), "error");
  }
}

async function deleteJob(jobId, { closeDialog = false } = {}) {
  const id = String(jobId || "");
  if (!id) return;
  const job = state.jobs.get(id);
  if (!job) return;
  if (jobStatusForUi(job) === "running") return;

  const ok = window.confirm("Delete this job permanently? This cannot be undone.");
  if (!ok) return;

  try {
    await api.jobsDelete(id);
    if (closeDialog && state.selectedJobId === id) closeJobDialog();
    showToast("Deleted");
  } catch (err) {
    setTransientHint(String(err && err.message ? err.message : err), "error");
  }
}

async function cancelSelectedJob() {
  return cancelJob(state.selectedJobId, { closeDialog: true });
}

async function archiveSelectedJob() {
  return archiveJob(state.selectedJobId, { closeDialog: true });
}

async function trashSelectedJob() {
  return trashJob(state.selectedJobId, { closeDialog: true });
}

async function restoreSelectedJob() {
  return restoreJob(state.selectedJobId, { closeDialog: true });
}

async function deleteSelectedJob() {
  return deleteJob(state.selectedJobId, { closeDialog: true });
}

function wireUi() {
  // Some Chromium policies require a user gesture before audio will play.
  document.addEventListener("pointerdown", () => primeAudio(), { once: true });
  document.addEventListener("keydown", () => primeAudio(), { once: true });

  // Sync the project filter across windows (main board + popouts).
  window.addEventListener("storage", (e) => {
    if (!e) return;
    if (e.storageArea !== window.localStorage) return;
    if (e.key !== STORAGE.projectFilterId) return;
    const next = typeof e.newValue === "string" ? e.newValue : "";
    if (next === state.projectFilterId) return;
    state.projectFilterId = next;
    if (els.projectFilterSelect) {
      // Best-effort: if the option doesn't exist yet, renderProjects() will correct later.
      els.projectFilterSelect.value = next;
      const wrap = els.projectFilterSelect.closest ? els.projectFilterSelect.closest(".filterctl") : null;
      if (wrap) wrap.hidden = state.projects.length <= 1 && !state.projectFilterId;
    }
    renderBoard();
    renderSearchUi();
    scheduleStatusDialogRender();
  });

  // Prevent the Electron window from navigating away when users click Markdown links.
  document.addEventListener("click", (e) => {
    const a = e.target && e.target.closest ? e.target.closest("a.md-link") : null;
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!href) return;
    e.preventDefault();
    e.stopPropagation();
    if (api && typeof api.shellOpenExternal === "function") {
      api.shellOpenExternal(href).catch(() => {});
    }
  });

  // View switcher (Board / Archive / Trash).
  document.querySelectorAll(".seg__btn[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.getAttribute("data-view")));
  });
  document.querySelectorAll(".seg__btn[data-display-mode]").forEach((btn) => {
    btn.addEventListener("click", () => setDisplayMode(btn.getAttribute("data-display-mode")));
  });
  if (els.tableScopeSelect) {
    els.tableScopeSelect.addEventListener("change", () => setTableScope(els.tableScopeSelect.value));
  }

  // Sidebar collapse/expand.
  [els.toggleSidebarBtn, els.toggleSidebarCollapsedBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => toggleSidebarCollapsed());
  });

		  // Lane popouts (Running / Needs Attention / Done) into separate windows (useful for multi-monitor setups).
		  document.addEventListener("click", async (e) => {
		    const btn = e.target && e.target.closest ? e.target.closest("[data-popout-lane]") : null;
		    if (!btn) return;
	    if (state.view !== "board" || state.focusLane) return;
	    const lane = btn.getAttribute("data-popout-lane") || "";
	    if (!lane) return;
	    if (!api.windowOpenLane) {
	      setTransientHint("Popout windows are not supported in this build.", "error");
	      return;
	    }
	    const displayId = await pickDisplayId(`Open ${laneTitleForKey(normalizeLaneKey(lane))} on which display?`);
	    if (displayId == null) return;
	    try {
	      await api.windowOpenLane(lane, displayId);
	    } catch (err) {
	      setTransientHint(String(err && err.message ? err.message : err), "error");
	    }
	  });

	  // Move the current window to a selected display (lane/job popout windows).
	  document.addEventListener("click", (e) => {
	    const btn = e.target && e.target.closest ? e.target.closest("[data-move-window]") : null;
	    if (!btn) return;
	    moveThisWindowToDisplay();
	  });

	  document.addEventListener("keydown", (e) => {
	    // Cmd+Shift+M (or Ctrl+Shift+M): move this window to a selected display.
	    if (!(e.metaKey || e.ctrlKey) || !e.shiftKey) return;
	    if (e.key !== "m" && e.key !== "M") return;
	    e.preventDefault();
	    moveThisWindowToDisplay();
	  });

	  // Sorting.
	  if (els.sortSelect) {
	    els.sortSelect.addEventListener("change", () => setSortMode(els.sortSelect.value));
	  }

	  // Project filter.
	  if (els.projectFilterSelect) {
	    els.projectFilterSelect.addEventListener("change", () => {
	      const v = String(els.projectFilterSelect.value || "").trim();
	      state.projectFilterId = v;
	      storeProjectFilterId(v);
	      const wrap = els.projectFilterSelect.closest ? els.projectFilterSelect.closest(".filterctl") : null;
	      if (wrap) wrap.hidden = state.projects.length <= 1 && !state.projectFilterId;
	      renderBoard();
	      renderSearchUi();
	      scheduleStatusDialogRender();
	    });
	  }

	  // Search across sessions (prompts/messages/logs).
	  if (els.searchInput) {
	    els.searchInput.addEventListener("input", () => setSearchQuery(els.searchInput.value));
	    els.searchInput.addEventListener("keydown", (e) => {
	      if (e.key === "Escape") {
	        e.preventDefault();
	        clearSearch();
	        return;
	      }
	      if (e.key === "Enter") {
	        e.preventDefault();
	        setSearchQuery(els.searchInput.value, { immediate: true });
	      }
	    });
	  }
	  if (els.searchClearBtn) {
	    els.searchClearBtn.addEventListener("click", () => clearSearch());
	  }

	  if (els.jobSearchInput) {
	    els.jobSearchInput.addEventListener("input", () => {
	      setJobSearchQuery(els.jobSearchInput.value, { preserveIndex: false, scroll: false });
	    });
	    els.jobSearchInput.addEventListener("keydown", (e) => {
	      if (e.key === "Escape") {
	        e.preventDefault();
	        clearJobSearch({ focus: true });
	        return;
	      }
	      if (e.key === "Enter") {
	        e.preventDefault();
	        stepJobSearch(e.shiftKey ? -1 : 1);
	      }
	    });
	  }
	  if (els.jobSearchPrevBtn) {
	    els.jobSearchPrevBtn.addEventListener("click", () => stepJobSearch(-1));
	  }
	  if (els.jobSearchNextBtn) {
	    els.jobSearchNextBtn.addEventListener("click", () => stepJobSearch(1));
	  }
	  if (els.jobSearchClearBtn) {
	    els.jobSearchClearBtn.addEventListener("click", () => clearJobSearch({ focus: true }));
	  }
	  renderJobSearchUi();

	  document.addEventListener("keydown", (e) => {
	    if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
	    if (e.key !== "f" && e.key !== "F") return;
	    if (els.jobDialog && els.jobDialog.open) {
	      e.preventDefault();
	      focusJobSearchInput();
	      return;
	    }
	    if (document.documentElement.dataset.mode === "lane" || document.documentElement.dataset.mode === "job") return;
	    if (!els.searchInput) return;
	    e.preventDefault();
	    try {
	      els.searchInput.focus();
	      els.searchInput.select();
	    } catch {
	      // ignore
	    }
	  });
	  document.addEventListener("keydown", (e) => {
	    if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
	    if (e.key !== "g" && e.key !== "G") return;
	    if (!(els.jobDialog && els.jobDialog.open)) return;
	    if (!normalizeJobSearchQuery(state.jobSearchQuery)) return;
	    e.preventDefault();
	    stepJobSearch(e.shiftKey ? -1 : 1);
	  });

	  // Cmd+/ (or Ctrl+/): show shortcuts.
	  document.addEventListener("keydown", (e) => {
	    if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
	    if (e.key !== "/" && e.key !== "?") return;
	    if (!els.shortcutsDialog) return;
	    e.preventDefault();
	    openShortcutsDialog({ toggle: true });
	  });

	  // Cmd+P (or Ctrl+P): focus the main prompt textarea (and override the default Print shortcut).
	  document.addEventListener("keydown", (e) => {
	    if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
	    if (e.key !== "p" && e.key !== "P") return;
	    if (document.documentElement.dataset.mode === "lane" || document.documentElement.dataset.mode === "job") return;
	    if (!els.promptInput) return;
	    e.preventDefault();
	    try {
	      els.promptInput.focus();
	    } catch {
	      // ignore
	    }
	  });

	  // Cmd+K (or Ctrl+K): toggle helper chat.
	  document.addEventListener("keydown", (e) => {
	    if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
	    if (e.key !== "k" && e.key !== "K") return;
	    e.preventDefault();
	    toggleHelperPanel({ focus: true });
	  });

  // Toast interactions.
  if (els.toast) {
    els.toast.addEventListener("click", (e) => {
      const actionBtn = e.target && e.target.closest ? e.target.closest("[data-toast-action]") : null;
      if (actionBtn) {
        const idx = Number(actionBtn.getAttribute("data-toast-action") || "-1");
        const fn = idx >= 0 && idx < state.toastActions.length ? state.toastActions[idx] : null;
        hideToast();
        if (typeof fn === "function") fn();
        return;
      }
      const undoBtn = e.target && e.target.closest ? e.target.closest("[data-toast-undo]") : null;
      if (!undoBtn) return;
      const fn = state.toastUndo;
      hideToast();
      if (typeof fn === "function") fn();
    });
  }

		  // Job overflow menu (in the job dialog footer).
		  if (els.jobMoreBtn) {
		    els.jobMoreBtn.addEventListener("click", (e) => {
		      e.preventDefault();
		      openJobMoreMenu();
		    });
		  }
		  if (els.jobMoreMenu) {
		    els.jobMoreMenu.addEventListener("click", async (e) => {
		      const btn = e.target && e.target.closest ? e.target.closest("[data-jobmore-action]") : null;
		      if (!btn) return;
		      e.preventDefault();
		      const action = btn.getAttribute("data-jobmore-action") || "";
		      if (action === "actions") {
		        openJobActionsMenu(btn);
		        return;
		      }
		
		      hideJobMoreMenu();
		
		      if (action === "rerun") {
		        await openRerunDialog(state.selectedJobId);
		        return;
		      }
		      if (action === "restore") {
		        await restoreSelectedJob();
		        return;
		      }
		      if (action === "archive") {
		        await archiveSelectedJob();
		        return;
		      }
		      if (action === "trash") {
		        await trashSelectedJob();
		        return;
		      }
		      if (action === "delete") {
		        await deleteSelectedJob();
		        return;
		      }
		    });
		
		    // Click-out closes the menu.
		    document.addEventListener(
		      "click",
		      (e) => {
		        if (!els.jobMoreMenu || els.jobMoreMenu.hidden) return;
		        if (els.jobMoreMenu.contains(e.target)) return;
		        if (els.jobActionsMenu && els.jobActionsMenu.contains(e.target)) return;
		        if (els.jobMoreBtn && els.jobMoreBtn.contains(e.target)) return;
		        hideJobMoreMenu();
		      },
		      true
		    );
		
		    // Escape closes the menu.
		    document.addEventListener("keydown", (e) => {
		      const moreOpen = !!(els.jobMoreMenu && !els.jobMoreMenu.hidden);
		      const actionsOpen = !!(els.jobActionsMenu && !els.jobActionsMenu.hidden);
		      if (!moreOpen && !actionsOpen) return;
		      if (e.key === "Escape") hideJobMoreMenu();
		    });
		
		    // Scrolling/resizing should not leave a floating menu in the wrong place.
		    document.addEventListener("scroll", () => hideJobMoreMenu(), true);
		    window.addEventListener("resize", () => hideJobMoreMenu());
		  }
		  if (els.jobDialogPopout) {
		    els.jobDialogPopout.hidden = isJobMode();
		    els.jobDialogPopout.addEventListener("click", async () => {
	      if (isJobMode()) return;
	      if (!api.windowOpenJob) {
	        showToast("Job popout windows are not supported in this build.");
	        return;
	      }
	      const jobId = state.selectedJobId;
	      if (!jobId) return;

	      const displayId = await pickDisplayId("Open job window on which display?");
	      if (displayId == null) return;

	      try {
	        await api.windowOpenJob(jobId, displayId);
	        if (els.jobDialog && els.jobDialog.open) els.jobDialog.close();
	      } catch (err) {
	        showToast(String(err && err.message ? err.message : err));
	      }
	    });
	  }
	  if (els.jobDialogMove) {
	    els.jobDialogMove.hidden = !isJobMode();
	    if (isJobMode()) {
	      els.jobDialogClose.textContent = "Close Window";
	    }
	    els.jobDialogMove.addEventListener("click", () => moveThisWindowToDisplay());
	  }

	  if (els.addTempProjectBtn) {
	    els.addTempProjectBtn.addEventListener("click", async () => {
	      try {
	        await createTemporaryProject();
	      } catch (err) {
	        setHint(String(err && err.message ? err.message : err), "error");
	      }
	    });
	  }

	  els.addProjectBtn.addEventListener("click", async () => {
	    const p = await api.projectsAddDialog();
	    if (!p) return;

	    state.projects = await api.projectsList();
	    renderProjects();
	    renderBoard();
	    els.projectSelect.value = p.id;
	    storeProjectId(p.id);
	    syncComposerCheckoutModeUi();

	    // Open the richer project settings modal so default branch / checkout strategy can be set immediately.
	    try {
	      await openProjectDialog(p.id);
	    } catch {
	      // ignore
	    }
	  });

  els.projectsList.addEventListener("change", async (e) => {
    const inp = e.target && e.target.closest ? e.target.closest("[data-project-color]") : null;
    if (!inp) return;

    const id = inp.getAttribute("data-project-color") || "";
    const color = normalizeHexColor(inp.value);
    if (!id || !color) return;

    try {
      await api.projectsUpdate(id, { color });
      state.projects = await api.projectsList();
      renderProjects();
      renderBoard();
    } catch (err) {
      setHint(String(err && err.message ? err.message : err), "error");
    }
  });

  els.projectsList.addEventListener("click", async (e) => {
    const btn = e.target && e.target.closest ? e.target.closest("[data-project-remove]") : null;
    if (btn) {
      e.preventDefault();
      e.stopPropagation();

      const id = btn.getAttribute("data-project-remove") || "";
      if (!id) return;
      await removeProjectWithConfirm(id);
      return;
    }
    const colorInp = e.target && e.target.closest ? e.target.closest("[data-project-color]") : null;
    if (colorInp) return;

    const edit = e.target && e.target.closest ? e.target.closest("[data-project-edit]") : null;
    if (!edit) return;

    const id = edit.getAttribute("data-project-edit") || "";
    if (!id) return;

    await openProjectDialog(id);
  });

  els.projectsList.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const edit = e.target && e.target.closest ? e.target.closest("[data-project-edit]") : null;
    if (!edit) return;
    e.preventDefault();
    const id = edit.getAttribute("data-project-edit") || "";
    if (!id) return;
    await openProjectDialog(id);
  });

  // Project settings dialog
  if (els.projectDialogClose) {
    els.projectDialogClose.addEventListener("click", () => closeProjectDialog());
  }
  if (els.projectDialogSave) {
    els.projectDialogSave.addEventListener("click", () => saveProjectDialog());
  }
  if (els.projectDialogCheckoutsBtn) {
    els.projectDialogCheckoutsBtn.addEventListener("click", async () => {
      const id = String(state.editingProjectId || "").trim();
      if (!id) return;
      await openCheckoutsDialog(id);
    });
  }
  if (els.projectDialogOpenFinderBtn) {
    els.projectDialogOpenFinderBtn.addEventListener("click", async () => {
      const id = String(state.editingProjectId || "").trim();
      if (!id) return;
      const project = state.projects.find((p) => p && p.id === id) || null;
      if (!project || !project.isTemporary) return;
      const fullPath = String(project.path || "").trim();
      if (!fullPath) {
        showToast("Temporary project path is missing.");
        return;
      }
      if (!api || typeof api.shellOpenPath !== "function") return;
      try {
        await api.shellOpenPath(fullPath);
      } catch (err) {
        showToast(String(err && err.message ? err.message : err));
      }
    });
  }
  if (els.projectDialogRemoveBtn) {
    els.projectDialogRemoveBtn.addEventListener("click", async () => {
      const id = String(state.editingProjectId || "").trim();
      if (!id) return;
      await removeProjectWithConfirm(id, { closeDialog: true });
    });
  }
  if (els.projectDialog) {
    els.projectDialog.addEventListener("click", (e) => {
      if (e.target === els.projectDialog) closeProjectDialog();
    });
    els.projectDialog.addEventListener("close", () => {
      state.editingProjectId = "";
    });
  }

  // Checkouts dialog
  if (els.checkoutsDialogClose) els.checkoutsDialogClose.addEventListener("click", () => closeCheckoutsDialog());
  if (els.checkoutsDialogClose2) els.checkoutsDialogClose2.addEventListener("click", () => closeCheckoutsDialog());
  if (els.checkoutsDialogRefresh) {
    els.checkoutsDialogRefresh.addEventListener("click", async () => {
      const id = String(state.checkoutsProjectId || "").trim();
      if (!id) return;
      await loadCheckouts(id);
    });
  }
  if (els.checkoutsDialog) {
    els.checkoutsDialog.addEventListener("click", (e) => {
      if (e.target === els.checkoutsDialog) closeCheckoutsDialog();
    });
    els.checkoutsDialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeCheckoutsDialog();
    });
    els.checkoutsDialog.addEventListener("close", () => {
      state.checkoutsProjectId = "";
      state.checkoutsEntries = [];
      state.checkoutsLoading = false;
    });
  }
  if (els.checkoutsDialogBody) {
    els.checkoutsDialogBody.addEventListener("click", async (e) => {
      const openBtn = e.target && e.target.closest ? e.target.closest("[data-checkout-open-job]") : null;
      if (openBtn) {
        const kind = openBtn.getAttribute("data-checkout-open-kind") || "";
        const jobId = openBtn.getAttribute("data-checkout-open-job") || "";
        const entry = (state.checkoutsEntries || []).find((x) => x && x.kind === kind && x.jobId === jobId) || null;
        if (entry && entry.path && api && typeof api.shellOpenPath === "function") {
          try {
            await api.shellOpenPath(entry.path);
          } catch (err) {
            showToast(String(err && err.message ? err.message : err));
          }
        }
        return;
      }

      const rmBtn = e.target && e.target.closest ? e.target.closest("[data-checkout-remove-job]") : null;
      if (!rmBtn) return;

      const kind = rmBtn.getAttribute("data-checkout-remove-kind") || "";
      const jobId = rmBtn.getAttribute("data-checkout-remove-job") || "";
      const projectId = String(state.checkoutsProjectId || "").trim();
      if (!projectId || !kind || !jobId) return;

      const job = state.jobs.get(jobId);
      if (job && jobStatusForUi(job) === "running") {
        showToast("This checkout is in use by a running job.");
        return;
      }

      const ok = window.confirm(
        `Remove ${kind} checkout for job ${jobId}?\n\nThis will delete the checkout folder under the app's checkouts directory (including any uncommitted changes inside it).`
      );
      if (!ok) return;

      try {
        await api.checkoutsRemove(projectId, kind, jobId);
        showToast("Checkout removed.");
        await loadCheckouts(projectId);
      } catch (err) {
        showToast(String(err && err.message ? err.message : err));
      }
    });
  }

  // Default-branch mismatch dialog
  if (els.branchDialogClose) els.branchDialogClose.addEventListener("click", () => resolveBranchDialog("cancel"));
  if (els.branchDialogCheckoutBtn) els.branchDialogCheckoutBtn.addEventListener("click", () => resolveBranchDialog("checkout"));
  if (els.branchDialogRunBtn) els.branchDialogRunBtn.addEventListener("click", () => resolveBranchDialog("run"));
  if (els.branchDialogRunNoAskBtn) els.branchDialogRunNoAskBtn.addEventListener("click", () => resolveBranchDialog("run_no_ask"));
  if (els.branchDialogCancelBtn) els.branchDialogCancelBtn.addEventListener("click", () => resolveBranchDialog("cancel"));
	  if (els.branchDialog) {
	    els.branchDialog.addEventListener("click", (e) => {
	      if (e.target === els.branchDialog) resolveBranchDialog("cancel");
	    });
	    els.branchDialog.addEventListener("cancel", (e) => {
	      e.preventDefault();
	      resolveBranchDialog("cancel");
	    });
	    els.branchDialog.addEventListener("close", () => {
	      if (state.branchDialogResolver) resolveBranchDialog("cancel");
	    });
	  }

	  // Integrate-to-default dialog
	  if (els.integrateDialogClose) els.integrateDialogClose.addEventListener("click", () => closeIntegrateDialog());
	  if (els.integrateDialogCancelBtn) els.integrateDialogCancelBtn.addEventListener("click", () => closeIntegrateDialog());
	  if (els.integrateDialogStartBtn)
	    els.integrateDialogStartBtn.addEventListener("click", () => startIntegrateToDefaultFromDialog());
	  if (els.integrateDialogArchiveBtn) els.integrateDialogArchiveBtn.addEventListener("click", () => archiveIntegrateDialogJob());
	  if (els.integrateDialogRevealBtn) els.integrateDialogRevealBtn.addEventListener("click", () => revealIntegrateDialogTarget());
	  if (els.integrateDialogDetailsBtn) els.integrateDialogDetailsBtn.addEventListener("click", () => showIntegrateDialogDetails());
	  if (els.integrateDialog) {
	    els.integrateDialog.addEventListener("click", (e) => {
	      if (e.target === els.integrateDialog) closeIntegrateDialog();
	    });
	    els.integrateDialog.addEventListener("cancel", (e) => {
	      e.preventDefault();
	      closeIntegrateDialog();
	    });
	    els.integrateDialog.addEventListener("close", () => {
	      resetIntegrateDialogState();
	    });
	  }

	  els.openSettingsBtn.addEventListener("click", () => {
	    setView("settings");
	    openSettingsDialog();
	  });

  if (els.openStatusBtn) els.openStatusBtn.addEventListener("click", () => openStatusDialog());
  if (els.openStatusSidebarBtn) els.openStatusSidebarBtn.addEventListener("click", () => openStatusDialog());
  if (els.statusDialogClose) {
    els.statusDialogClose.addEventListener("click", () => {
      try {
        if (els.statusDialog && els.statusDialog.open) els.statusDialog.close();
      } catch {
        // ignore
      }
    });
  }
  if (els.statusDialog) {
    els.statusDialog.addEventListener("click", (e) => {
      if (e.target === els.statusDialog) els.statusDialog.close();
    });
  }
  if (els.statusDialogBody) {
    els.statusDialogBody.addEventListener("click", (e) => {
      const installBtn = e.target && e.target.closest ? e.target.closest("[data-status-install-agents]") : null;
      if (installBtn) {
        e.preventDefault();
        try {
          if (els.statusDialog && els.statusDialog.open) els.statusDialog.close();
        } catch {
          // ignore
        }
        openAgentsInstallDialog();
        return;
      }

      const openSettingsBtn = e.target && e.target.closest ? e.target.closest("[data-status-open-settings]") : null;
      if (openSettingsBtn) {
        e.preventDefault();
        try {
          if (els.statusDialog && els.statusDialog.open) els.statusDialog.close();
        } catch {
          // ignore
        }
        openSettings();
        return;
      }

      const refreshBtn = e.target && e.target.closest ? e.target.closest("[data-status-refresh-agents]") : null;
      if (refreshBtn) {
        e.preventDefault();
        refreshAgentBinaries({ showToastOnMissing: false });
        return;
      }

      const row = e.target && e.target.closest ? e.target.closest("[data-status-job-id]") : null;
      if (!row) return;
      const id = row.getAttribute("data-status-job-id") || "";
      if (!id) return;
      try {
        if (els.statusDialog && els.statusDialog.open) els.statusDialog.close();
      } catch {
        // ignore
      }
      openJobDialog(id);
    });
  }

  if (els.agentsInstallDialogClose) {
    els.agentsInstallDialogClose.addEventListener("click", () => {
      try {
        if (els.agentsInstallDialog && els.agentsInstallDialog.open) els.agentsInstallDialog.close();
      } catch {
        // ignore
      }
    });
  }
  if (els.agentsInstallDialog) {
    els.agentsInstallDialog.addEventListener("click", (e) => {
      if (e.target === els.agentsInstallDialog) els.agentsInstallDialog.close();
    });
  }
  if (els.agentsInstallDialogBody) {
    els.agentsInstallDialogBody.addEventListener("click", (e) => {
      const installBtn = e.target && e.target.closest ? e.target.closest("[data-agent-install]") : null;
      if (installBtn) {
        e.preventDefault();
        const agent = installBtn.getAttribute("data-agent-install") || "";
        const method = installBtn.getAttribute("data-agent-install-method") || "";
        runAgentInstallFromUi(agent, method);
        return;
      }

      const recheckBtn = e.target && e.target.closest ? e.target.closest("[data-agent-install-recheck]") : null;
      if (recheckBtn) {
        e.preventDefault();
        refreshAgentBinaries({ showToastOnMissing: false });
        return;
      }

      const openSettingsBtn = e.target && e.target.closest ? e.target.closest("[data-agent-install-open-settings]") : null;
      if (openSettingsBtn) {
        e.preventDefault();
        try {
          if (els.agentsInstallDialog && els.agentsInstallDialog.open) els.agentsInstallDialog.close();
        } catch {
          // ignore
        }
        openSettings();
        return;
      }
    });
  }

	  if (els.openShortcutsBtn) {
	    els.openShortcutsBtn.addEventListener("click", () => openShortcutsDialog());
	  }
	  if (els.openActionsBtn) {
	    els.openActionsBtn.addEventListener("click", () => openActionsDialog());
	  }
  if (els.shortcutsDialogClose) {
    els.shortcutsDialogClose.addEventListener("click", () => {
      try {
        if (els.shortcutsDialog && els.shortcutsDialog.open) els.shortcutsDialog.close();
      } catch {
        // ignore
      }
    });
  }
  if (els.shortcutsDialog) {
    els.shortcutsDialog.addEventListener("click", (e) => {
      if (e.target === els.shortcutsDialog) els.shortcutsDialog.close();
    });
  }

  if (els.helperBubbleBtn) {
    els.helperBubbleBtn.addEventListener("click", () => toggleHelperPanel({ focus: true }));
  }
  if (els.helperThinkingIndicator) {
    els.helperThinkingIndicator.addEventListener("click", () => toggleHelperPanel({ open: true, focus: true }));
  }
  if (els.helperPanelClose) {
    els.helperPanelClose.addEventListener("click", () => toggleHelperPanel({ open: false }));
  }
  if (els.helperAgentSelect) {
    els.helperAgentSelect.addEventListener("change", () => {
      const next = normalizeHelperAgentSelection(els.helperAgentSelect.value);
      els.helperAgentSelect.value = next;
      renderHelperPanel();
    });
  }
  if (els.helperContextScopeSelect) {
    els.helperContextScopeSelect.addEventListener("change", () => {
      const fallbackProjectId = helperDefaultProjectIdForContext();
      const next = normalizeHelperContextScope(els.helperContextScopeSelect.value, { defaultProjectId: fallbackProjectId });
      if (!selectHasOptionValue(els.helperContextScopeSelect, next)) {
        renderHelperContextScopeOptions({ skipStore: true });
        helperSetMeta(helperCurrentMetaStatusText());
        renderHelperPanel();
        return;
      }
      els.helperContextScopeSelect.value = next;
      storeHelperContextScope(next);
      helperSetMeta(helperCurrentMetaStatusText());
      renderHelperPanel();
    });
  }
  if (els.helperSessionSelect) {
    els.helperSessionSelect.addEventListener("change", () => {
      const next = String(els.helperSessionSelect.value || "").trim();
      if (!helperSelectSession(next, { focus: true })) renderHelperPanel();
    });
  }
  if (els.helperNewSessionBtn) {
    els.helperNewSessionBtn.addEventListener("click", () => helperNewSessionNow({ focus: true }));
  }
  if (els.helperClearSessionBtn) {
    els.helperClearSessionBtn.addEventListener("click", () => clearHelperCurrentSessionNow());
  }
  if (els.helperInput) {
    els.helperInput.addEventListener("input", () => autosizeTextarea(els.helperInput, { maxRows: FOLLOWUP_AUTOSIZE_MAX_ROWS }));
    els.helperInput.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        askHelperFromInput();
        return;
      }
      if (e.key === "Escape" && state.helperOpen) {
        e.preventDefault();
        toggleHelperPanel({ open: false });
      }
    });
  }
  if (els.helperSendBtn) {
    els.helperSendBtn.addEventListener("click", () => askHelperFromInput());
  }
  if (els.helperToPromptBtn) {
    els.helperToPromptBtn.addEventListener("click", () => appendHelperContextToComposer());
  }
  if (els.settingsHelperClearHistoryBtn) {
    els.settingsHelperClearHistoryBtn.addEventListener("click", () => clearHelperHistoryNow());
  }

  els.projectSelect.addEventListener("change", async () => {
    const v = String(els.projectSelect.value || "").trim();
    if (v === TEMP_PROJECT_OPTION_VALUE) {
      try {
        await createTemporaryProject();
      } catch (err) {
        setHint(String(err && err.message ? err.message : err), "error");
        els.projectSelect.value = "";
        syncComposerCheckoutModeUi();
      }
      schedulePromptPathSuggestRefresh({ immediate: true });
      return;
    }
    if (v && v !== "auto") storeProjectId(v);
    syncComposerCheckoutModeUi();
  });

  // Custom model dropdowns (replaces the native <datalist> chrome).
  if (els.modelInput) codexModelComboboxComposer = attachCodexModelCombobox(els.modelInput, { ariaLabel: "Show models" });
  if (els.settingsCodexModel)
    codexModelComboboxSettings = attachCodexModelCombobox(els.settingsCodexModel, { ariaLabel: "Show models" });
  if (els.rerunModelInput) codexModelComboboxRerun = attachCodexModelCombobox(els.rerunModelInput, { ariaLabel: "Show models" });

  function syncComposerAgentUi() {
    const agent = normalizeAgentKey(els.agentSelect ? els.agentSelect.value : "");
    if (!els.modelInput) return;
    const cmb = codexModelComboboxComposer;
    const hasCombobox = !!(cmb && typeof cmb.setEnabled === "function");

    if (agent === "claude") {
      if (hasCombobox) cmb.setEnabled(false);
      else els.modelInput.removeAttribute("list");
      els.modelInput.placeholder = "Model override (optional, e.g. sonnet)";
    } else {
      if (hasCombobox) cmb.setEnabled(true);
      else els.modelInput.setAttribute("list", "codexModelsList");
      els.modelInput.placeholder = "Model override (optional)";
    }
  }

  if (els.agentSelect) {
    const stored = normalizeAgentKey(getStoredAgent());
    els.agentSelect.value = stored;
    els.agentSelect.addEventListener("change", () => {
      const next = normalizeAgentKey(els.agentSelect.value);
      els.agentSelect.value = next;
      storeAgent(next);
      syncComposerAgentUi();
    });
    syncComposerAgentUi();
  }

  els.runBtn.addEventListener("click", () => {
    startJobFromComposer();
  });

  els.promptInput.addEventListener("keydown", (e) => {
    if (handlePromptPathSuggestKeyDown(e)) return;
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      startJobFromComposer();
    }
  });

  // Avoid losing the current prompt during dev live reloads (or accidental reloads).
  els.promptInput.addEventListener("input", () => {
    storeComposerDraft(els.promptInput.value || "");
    schedulePromptPathSuggestRefresh();
  });
  els.promptInput.addEventListener("focus", () => schedulePromptPathSuggestRefresh({ immediate: true }));
  els.promptInput.addEventListener("click", () => schedulePromptPathSuggestRefresh({ immediate: true }));
  els.promptInput.addEventListener("keyup", (e) => {
    if (!PROMPT_PATH_SUGGEST_CURSOR_KEYS.has(e.key)) return;
    if (promptPathSuggestState.open && (e.key === "ArrowUp" || e.key === "ArrowDown")) return;
    schedulePromptPathSuggestRefresh({ immediate: true });
  });

  if (els.promptPathSuggest) {
    els.promptPathSuggest.addEventListener("pointerdown", (e) => {
      // Keep focus in textarea so selection/cursor stays stable when picking a suggestion.
      e.preventDefault();
    });

    els.promptPathSuggest.addEventListener("click", (e) => {
      const row = e.target && e.target.closest ? e.target.closest(".combo__item[data-idx]") : null;
      if (!row) return;
      const idx = Number(row.getAttribute("data-idx"));
      if (!Number.isFinite(idx)) return;
      applyPromptPathSuggestSelection(idx);
    });
  }

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!promptPathSuggestState.open) return;
      const t = e && e.target ? e.target : null;
      if (t && els.promptDropwrap && els.promptDropwrap.contains(t)) return;
      closePromptPathSuggest();
    },
    true
  );
  restoreComposerDraft();

  // Attach images/files via drag&drop and render them as removable preview tiles.
  let fileDragDepth = 0;
  function clearDropwrapDragover() {
    if (els.promptDropwrap) els.promptDropwrap.classList.remove("dropwrap--dragover");
    if (els.followupDropwrap) els.followupDropwrap.classList.remove("dropwrap--dragover");
  }
  function activeAttachmentDropTarget() {
    if (els.jobDialog && els.jobDialog.open && els.followupDropwrap && els.followupInput) {
      return {
        wrap: els.followupDropwrap,
        input: els.followupInput,
        addImages: (imgs) => setFollowupImages(mergeImages(state.followupImages, imgs)),
        addFiles: (files) => setFollowupFiles(mergeFiles(state.followupFiles, files))
      };
    }
    if (els.promptDropwrap && els.promptInput) {
      return {
        wrap: els.promptDropwrap,
        input: els.promptInput,
        addImages: (imgs) => setComposerImages(mergeImages(state.composerImages, imgs)),
        addFiles: (files) => setComposerFiles(mergeFiles(state.composerFiles, files))
      };
    }
    return null;
  }
  function syncActiveDropwrapHighlight() {
    const target = activeAttachmentDropTarget();
    clearDropwrapDragover();
    if (!target || !target.wrap) return null;
    target.wrap.classList.add("dropwrap--dragover");
    return target;
  }
  document.addEventListener("dragenter", (e) => {
    const dt = e.dataTransfer;
    if (!dataTransferHasFiles(dt)) return;
    e.preventDefault();
    fileDragDepth += 1;
    syncActiveDropwrapHighlight();
  });
  document.addEventListener("dragover", (e) => {
    const dt = e.dataTransfer;
    if (!dataTransferHasFiles(dt)) return;
    e.preventDefault();
    if (dt) dt.dropEffect = "copy";
    syncActiveDropwrapHighlight();
  });
  document.addEventListener("dragleave", (e) => {
    const dt = e.dataTransfer;
    if (!dataTransferHasFiles(dt)) return;
    const leftWindow =
      Number.isFinite(e.clientX) &&
      Number.isFinite(e.clientY) &&
      (e.clientX < 0 || e.clientY < 0 || e.clientX > window.innerWidth || e.clientY > window.innerHeight);
    if (leftWindow) fileDragDepth = 0;
    else fileDragDepth = Math.max(0, fileDragDepth - 1);
    if (fileDragDepth === 0) clearDropwrapDragover();
  });
  document.addEventListener("dragend", () => {
    fileDragDepth = 0;
    clearDropwrapDragover();
  });
  window.addEventListener("blur", () => {
    fileDragDepth = 0;
    clearDropwrapDragover();
  });
  document.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (!dt || !dt.files || dt.files.length === 0) return;
    e.preventDefault();
    fileDragDepth = 0;
    const target = activeAttachmentDropTarget();
    clearDropwrapDragover();
    if (!target) return;
    const dropped = droppedFileEntries(e);
    const imgs = imagePathsFromDroppedEntries(dropped);
    const files = nonImagePathsFromDroppedEntries(dropped);
    if (imgs.length > 0) target.addImages(imgs);
    if (files.length > 0) target.addFiles(files);
    if (imgs.length > 0 || files.length > 0) target.input.focus();
  });

  els.promptAttachments.addEventListener("click", (e) => {
    const removeImgBtn = e.target && e.target.closest ? e.target.closest("[data-remove-composer-image]") : null;
    if (removeImgBtn) {
      const idx = Number(removeImgBtn.getAttribute("data-remove-composer-image"));
      if (!Number.isFinite(idx)) return;
      const next = [...(state.composerImages || [])];
      next.splice(idx, 1);
      setComposerImages(next);
      return;
    }

    const removeFileBtn = e.target && e.target.closest ? e.target.closest("[data-remove-composer-file]") : null;
    if (removeFileBtn) {
      const idx = Number(removeFileBtn.getAttribute("data-remove-composer-file"));
      if (!Number.isFinite(idx)) return;
      const next = [...(state.composerFiles || [])];
      next.splice(idx, 1);
      setComposerFiles(next);
      return;
    }

    const thumb = e.target && e.target.closest ? e.target.closest(".attachthumb") : null;
    if (!thumb) return;
    openImageDialogForThumbEl(e.target);
  });

  els.followupAttachments.addEventListener("click", (e) => {
    const removeImgBtn = e.target && e.target.closest ? e.target.closest("[data-remove-followup-image]") : null;
    if (removeImgBtn) {
      const idx = Number(removeImgBtn.getAttribute("data-remove-followup-image"));
      if (!Number.isFinite(idx)) return;
      const next = [...(state.followupImages || [])];
      next.splice(idx, 1);
      setFollowupImages(next);
      return;
    }

    const removeFileBtn = e.target && e.target.closest ? e.target.closest("[data-remove-followup-file]") : null;
    if (removeFileBtn) {
      const idx = Number(removeFileBtn.getAttribute("data-remove-followup-file"));
      if (!Number.isFinite(idx)) return;
      const next = [...(state.followupFiles || [])];
      next.splice(idx, 1);
      setFollowupFiles(next);
      return;
    }

    const thumb = e.target && e.target.closest ? e.target.closest(".attachthumb") : null;
    if (!thumb) return;
    openImageDialogForThumbEl(e.target);
  });

  els.jobDialogClose.addEventListener("click", () => {
    if (isJobMode()) {
      window.close();
      return;
    }
    els.jobDialog.close();
  });

  // Click-out (backdrop click) closes the modal.
  els.jobDialog.addEventListener("click", (e) => {
    if (isJobMode()) return;
    if (e.target === els.jobDialog) els.jobDialog.close();
  });

  // Attachment previews inside chat (user/assistant message thumbnails).
  els.jobDialogChat.addEventListener("click", (e) => {
    const thumb = e.target && e.target.closest ? e.target.closest(".attachthumb") : null;
    if (!thumb) return;
    openImageDialogForThumbEl(e.target);
  });
  if (els.jobDialogDiff) {
    els.jobDialogDiff.addEventListener("click", (e) => {
      const refreshBtn = e.target && e.target.closest ? e.target.closest("[data-job-diff-refresh]") : null;
      if (refreshBtn) {
        e.preventDefault();
        loadSelectedJobDiff({ force: true }).catch(() => {});
        return;
      }

      const fileBtn = e.target && e.target.closest ? e.target.closest("[data-job-diff-file-id]") : null;
      if (!fileBtn) return;
      e.preventDefault();

      const jobId = String(state.selectedJobId || "").trim();
      if (!jobId) return;
      const fileId = String(fileBtn.getAttribute("data-job-diff-file-id") || "").trim();
      const ui = getJobDiffUi(jobId);
      ui.selectedFileId = fileId;
      rerenderSelectedJobDiffFromCache();
    });

    els.jobDialogDiff.addEventListener("input", (e) => {
      const filterInput = e.target && e.target.closest ? e.target.closest("[data-job-diff-filter]") : null;
      if (!filterInput) return;

      const jobId = String(state.selectedJobId || "").trim();
      if (!jobId) return;
      const ui = getJobDiffUi(jobId);
      ui.filterText = String(filterInput.value || "");
      const caret = Number.isFinite(filterInput.selectionStart) ? filterInput.selectionStart : null;
      rerenderSelectedJobDiffFromCache();
      const nextInput = els.jobDialogDiff.querySelector("[data-job-diff-filter]");
      if (nextInput && typeof nextInput.focus === "function") {
        nextInput.focus();
        if (caret != null && typeof nextInput.setSelectionRange === "function") {
          try {
            nextInput.setSelectionRange(caret, caret);
          } catch {
            // ignore
          }
        }
      }
    });
  }

  // In job-popout windows, Esc should not leave you with a blank window.
  els.jobDialog.addEventListener("cancel", (e) => {
    if (!isJobMode()) return;
    e.preventDefault();
  });

  // Drop heavy arrays when the dialog closes to keep the board snappy with many jobs.
  els.jobDialog.addEventListener("close", () => {
    hideJobMoreMenu();
    clearJobSearch();

    const jobId = state.selectedJobId;
    if (!jobId) return;
    jobDiffUiState.delete(String(jobId));
    const job = state.jobs.get(jobId);
    if (!job) return;

    // Best-effort detach terminal subscription for this window.
    try {
      if (termUi.jobId && api && typeof api.termDetach === "function") api.termDetach(termUi.jobId).catch(() => {});
    } catch {
      // ignore
    }
    termUi.jobId = "";
    termUi.lastSeq = 0;

    if (job.status === "running") return;
    upsertJob(compactJobForList(job));
  });

	  if (els.settingsDialogClose) {
	    els.settingsDialogClose.addEventListener("click", () => {
	      if (els.settingsDialog) els.settingsDialog.close();
	    });
	  }

	  if (els.settingsDialog) {
	    els.settingsDialog.addEventListener("click", (e) => {
	      if (e.target === els.settingsDialog) els.settingsDialog.close();
	    });
	  }

	  if (els.settingsEditorPreset) {
	    els.settingsEditorPreset.addEventListener("change", () => {
	      applyEditorPresetToCommandInput();
	    });
	  }
	  if (els.settingsEditorCommand) {
	    els.settingsEditorCommand.addEventListener("input", () => {
	      syncEditorPresetFromCommandInput();
	    });
	  }

	  if (els.actionsDialogClose) {
	    els.actionsDialogClose.addEventListener("click", () => {
	      try {
	        if (els.actionsDialog && els.actionsDialog.open) els.actionsDialog.close();
	      } catch {
	        // ignore
	      }
	    });
	  }
	  if (els.actionsDialog) {
	    els.actionsDialog.addEventListener("click", (e) => {
	      if (e.target === els.actionsDialog) {
	        try {
	          els.actionsDialog.close();
	        } catch {
	          // ignore
	        }
	      }
	    });
	    els.actionsDialog.addEventListener("cancel", (e) => {
	      e.preventDefault();
	      try {
	        els.actionsDialog.close();
	      } catch {
	        // ignore
	      }
	    });
	  }

	  if (els.settingsActionsAddBtn) {
	    els.settingsActionsAddBtn.addEventListener("click", () => addBlankSettingsActionRow());
	  }
	  if (els.settingsActionsPromptBtn) {
	    els.settingsActionsPromptBtn.addEventListener("click", () => openActionPromptDialog());
	  }
  if (els.settingsActionsList) {
    els.settingsActionsList.addEventListener("click", (e) => {
      const rm = e.target && e.target.closest ? e.target.closest("[data-action-remove]") : null;
      if (!rm) return;
      e.preventDefault();

      const row = rm.closest("[data-action-row]");
      if (row && row.parentNode) row.parentNode.removeChild(row);

      const anyRows = els.settingsActionsList.querySelector("[data-action-row]");
      if (!anyRows) renderSettingsActions([]);
    });
  }

  if (els.actionPromptDialogClose) {
    els.actionPromptDialogClose.addEventListener("click", () => closeActionPromptDialog());
  }
  if (els.actionPromptDialog) {
    els.actionPromptDialog.addEventListener("click", (e) => {
      if (e.target === els.actionPromptDialog) closeActionPromptDialog();
    });
    els.actionPromptDialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeActionPromptDialog();
    });
  }
	  if (els.actionPromptGenerateBtn) {
	    els.actionPromptGenerateBtn.addEventListener("click", () => generateActionFromPrompt());
	  }
	  if (els.actionPromptInput) {
	    els.actionPromptInput.addEventListener("keydown", (e) => {
	      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
	        e.preventDefault();
	        generateActionFromPrompt();
	      }
	    });
	  }

	  if (els.textPromptDialogClose) {
	    els.textPromptDialogClose.addEventListener("click", () => {
	      resolveTextPromptDialog(null);
	      closeTextPromptDialog();
	    });
	  }
	  if (els.textPromptDialogCancel) {
	    els.textPromptDialogCancel.addEventListener("click", () => {
	      resolveTextPromptDialog(null);
	      closeTextPromptDialog();
	    });
	  }
	  if (els.textPromptDialogOk) {
	    els.textPromptDialogOk.addEventListener("click", () => {
	      const val = els.textPromptDialogInput ? String(els.textPromptDialogInput.value || "") : "";
	      resolveTextPromptDialog(val);
	      closeTextPromptDialog();
	    });
	  }
	  if (els.textPromptDialogInput) {
	    els.textPromptDialogInput.addEventListener("keydown", (e) => {
	      if (e.key !== "Enter") return;
	      e.preventDefault();
	      const val = els.textPromptDialogInput ? String(els.textPromptDialogInput.value || "") : "";
	      resolveTextPromptDialog(val);
	      closeTextPromptDialog();
	    });
	  }
	  if (els.textPromptDialog) {
	    els.textPromptDialog.addEventListener("click", (e) => {
	      if (e.target === els.textPromptDialog) {
	        resolveTextPromptDialog(null);
	        closeTextPromptDialog();
	      }
	    });
	    els.textPromptDialog.addEventListener("cancel", (e) => {
	      e.preventDefault();
	      resolveTextPromptDialog(null);
	      closeTextPromptDialog();
	    });
	    els.textPromptDialog.addEventListener("close", () => {
	      resolveTextPromptDialog(null);
	    });
	  }

	  if (els.projectRemoveDialogClose) {
	    els.projectRemoveDialogClose.addEventListener("click", () => {
	      resolveProjectRemoveDialog({ confirmed: false, deleteFolder: false });
	      closeProjectRemoveDialog();
	    });
	  }
	  if (els.projectRemoveDialogCancel) {
	    els.projectRemoveDialogCancel.addEventListener("click", () => {
	      resolveProjectRemoveDialog({ confirmed: false, deleteFolder: false });
	      closeProjectRemoveDialog();
	    });
	  }
	  if (els.projectRemoveDialogRemove) {
	    els.projectRemoveDialogRemove.addEventListener("click", () => {
	      const deleteFolder = !!(
	        els.projectRemoveDialogDeleteFolder &&
	        !els.projectRemoveDialogDeleteFolder.disabled &&
	        els.projectRemoveDialogDeleteFolder.checked
	      );
	      resolveProjectRemoveDialog({ confirmed: true, deleteFolder });
	      closeProjectRemoveDialog();
	    });
	  }
	  if (els.projectRemoveDialog) {
	    els.projectRemoveDialog.addEventListener("click", (e) => {
	      if (e.target === els.projectRemoveDialog) {
	        resolveProjectRemoveDialog({ confirmed: false, deleteFolder: false });
	        closeProjectRemoveDialog();
	      }
	    });
	    els.projectRemoveDialog.addEventListener("cancel", (e) => {
	      e.preventDefault();
	      resolveProjectRemoveDialog({ confirmed: false, deleteFolder: false });
	      closeProjectRemoveDialog();
	    });
	    els.projectRemoveDialog.addEventListener("close", () => {
	      resolveProjectRemoveDialog({ confirmed: false, deleteFolder: false });
	    });
	  }

	  // Settings live previews should not persist unless saved.
	  if (els.settingsDialog) {
	    els.settingsDialog.addEventListener("close", () => {
	      renderBrandLogo(FIXED_LOGO_VARIANT);
	    });
	  }

  wireAcceleratorCaptureInput(els.settingsGlobalHotkeyAccelerator);

  if (els.settingsUiModel) {
    els.settingsUiModel.addEventListener("change", () => {
      syncUiModelCustomVisibility();
    });
  }

  if (els.imageDialogClose) {
    els.imageDialogClose.addEventListener("click", () => {
      try {
        if (els.imageDialog && els.imageDialog.open) els.imageDialog.close();
      } catch {
        // ignore
      }
    });
  }
  if (els.imageDialog) {
    els.imageDialog.addEventListener("click", (e) => {
      if (e.target === els.imageDialog) els.imageDialog.close();
    });
    els.imageDialog.addEventListener("close", () => {
      if (els.imageDialogImg) {
        els.imageDialogImg.removeAttribute("src");
        els.imageDialogImg.alt = "";
      }
      if (els.imageDialogTitle) els.imageDialogTitle.textContent = "Image";
    });
  }

  const getSoundTestOverrides = () => {
    const fallbackVolumePct = clampNumber(state.settings && state.settings.soundVolume, 0, 100, 35);
    const volStr = els.settingsSoundVolume ? String(els.settingsSoundVolume.value).trim() : "";
    const volumePct = volStr === "" ? fallbackVolumePct : clampNumber(volStr, 0, 100, fallbackVolumePct);
    const preset = els.settingsSoundPreset ? els.settingsSoundPreset.value : state.settings && state.settings.soundPreset;
    return { volumePct, preset };
  };

  const saveSoundSettingsPatch = async (patch) => {
    if (!api || typeof api.settingsUpdate !== "function") return;
    const p = patch && typeof patch === "object" ? patch : {};
    try {
      state.settings = await api.settingsUpdate(p);
    } catch (err) {
      // Keep this subtle; sound settings are non-critical.
      showToast(String(err && err.message ? err.message : err) || "Failed to save sound settings.");
    }
  };

  // Sound settings are frequently tweaked while listening; persist immediately so
  // notifications use the selected preset without requiring an explicit "Save".
  if (els.settingsSoundNeedsAttention) {
    els.settingsSoundNeedsAttention.addEventListener("change", () => {
      saveSoundSettingsPatch({ soundOnNeedsAttention: !!els.settingsSoundNeedsAttention.checked });
    });
  }
  if (els.settingsSoundDone) {
    els.settingsSoundDone.addEventListener("change", () => {
      saveSoundSettingsPatch({ soundOnDone: !!els.settingsSoundDone.checked });
    });
  }
  if (els.settingsSoundPreset) {
    els.settingsSoundPreset.addEventListener("change", () => {
      const preset = normalizeSoundPreset(els.settingsSoundPreset.value);
      // Normalize in-place in case an unknown option sneaks in (e.g. via manual edits).
      if (els.settingsSoundPreset.value !== preset) els.settingsSoundPreset.value = preset;
      saveSoundSettingsPatch({ soundPreset: preset });
    });
  }
  if (els.settingsSoundVolume) {
    els.settingsSoundVolume.addEventListener("change", () => {
      const volumePct = clampNumber(els.settingsSoundVolume.value, 0, 100, 35);
      els.settingsSoundVolume.value = String(volumePct);
      saveSoundSettingsPatch({ soundVolume: volumePct });
    });
  }

  if (els.settingsTestSoundAttention) {
    els.settingsTestSoundAttention.addEventListener("click", () => {
      primeAudio();
      playSound("attention", getSoundTestOverrides());
    });
  }
  if (els.settingsTestSoundDone) {
    els.settingsTestSoundDone.addEventListener("click", () => {
      primeAudio();
      playSound("done", getSoundTestOverrides());
    });
  }

  // Easter egg: 7 quick clicks on the "Sound" label unlock the hidden "goat" preset.
  {
    const selectEl = els.settingsSoundPreset;
    const fieldEl = selectEl && selectEl.closest ? selectEl.closest("label") : null;
    const labelEl = fieldEl && fieldEl.querySelector ? fieldEl.querySelector(".field__label") : null;
    const GOAT_CLICKS = 7;
    const GOAT_WINDOW_MS = 1400;
    let times = [];
    let unlocked = false;
    if (labelEl && selectEl) {
      labelEl.addEventListener("click", () => {
        if (unlocked) return;
        const now = Date.now();
        times.push(now);
        times = times.filter((t) => now - t <= GOAT_WINDOW_MS);
        if (times.length < GOAT_CLICKS) return;
        times = [];
        unlocked = true;

        ensureSelectOption(selectEl, "goat", "Goat");
        selectEl.value = "goat";
        try {
          selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        } catch {
          // ignore
        }

        showToast("Goat sound unlocked.");
        primeAudio();
        playSound("done", { ...getSoundTestOverrides(), preset: "goat" });
      });
    }
  }

  document.querySelectorAll(".tab").forEach((t) => {
    t.addEventListener("click", () => setActiveTab(t.getAttribute("data-tab")));
  });

  els.sendFollowupBtn.addEventListener("click", () => sendFollowup());
  els.followupInput.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      sendFollowup();
    }
  });
  els.followupInput.addEventListener("input", () => {
    scheduleAutosizeFollowupInput();
    const jobId = state.selectedJobId;
    if (!jobId) return;
    const job = state.jobs.get(jobId);
    if (!job) return;
    if (els.jobDialog && els.jobDialog.open) updateJobDialogActions(job);
  });

  if (els.jobActionsMenu) {
    els.jobActionsMenu.addEventListener("click", (e) => {
      const manage = e.target && e.target.closest ? e.target.closest("[data-jobaction-manage]") : null;
      if (manage) {
        e.preventDefault();
        hideJobMoreMenu();
        openActionsDialog();
        return;
      }

      const act = e.target && e.target.closest ? e.target.closest("[data-jobaction-id]") : null;
      if (!act) return;
      e.preventDefault();
      const id = act.getAttribute("data-jobaction-id") || "";
      hideJobMoreMenu();
      runJobActionById(id).catch((err) => {
        showToast(String(err && err.message ? err.message : err) || "Failed to run action.");
      });
    });
  }
  els.cancelJobBtn.addEventListener("click", () => cancelSelectedJob());

  if (els.rerunStartBtn) {
    els.rerunStartBtn.addEventListener("click", () => startRerunFromDialog());
  }
  if (els.rerunDialogClose) {
    els.rerunDialogClose.addEventListener("click", () => {
      try {
        if (els.rerunDialog && els.rerunDialog.open) els.rerunDialog.close();
      } catch {
        // ignore
      } finally {
        state.rerunSourceJobId = null;
      }
    });
  }
  if (els.rerunDialog) {
    els.rerunDialog.addEventListener("click", (e) => {
      if (e.target === els.rerunDialog) {
        try {
          els.rerunDialog.close();
        } catch {
          // ignore
        } finally {
          state.rerunSourceJobId = null;
        }
      }
    });
    els.rerunDialog.addEventListener("cancel", () => {
      state.rerunSourceJobId = null;
    });
    els.rerunDialog.addEventListener("close", () => {
      state.rerunSourceJobId = null;
    });
  }
  if (els.rerunAgentSelect) {
    els.rerunAgentSelect.addEventListener("change", () => rerunAgentUiSync());
  }

  const saveSettings = async () => {
								    const patch = {
							      uiModel: getUiModelFromControls(),
						      uiTheme: els.settingsTheme.value,
						      uiColorScheme: els.settingsColorScheme.value,
					      editorCommand: els.settingsEditorCommand ? els.settingsEditorCommand.value.trim() : "",
					      menuBarMode: !!els.settingsMenuBarMode.checked,
					      startAtLogin: !!els.settingsStartAtLogin.checked,
					      openOnAllDisplays: !!els.settingsOpenOnAllDisplays.checked,
		      globalHotkeyEnabled: !!els.settingsGlobalHotkeyEnabled.checked,
			      globalHotkeyAccelerator: els.settingsGlobalHotkeyAccelerator.value.trim(),
			      globalHotkeyUseClipboard: !!els.settingsGlobalHotkeyUseClipboard.checked,
			      globalHotkeyStartWisprHandsFree: !!els.settingsGlobalHotkeyStartWisprHandsFree.checked,
			      soundOnNeedsAttention: !!els.settingsSoundNeedsAttention.checked,
			      soundOnDone: !!els.settingsSoundDone.checked,
					      soundPreset: normalizeSoundPreset(els.settingsSoundPreset ? els.settingsSoundPreset.value : ""),
					      soundVolume: clampNumber(els.settingsSoundVolume.value, 0, 100, 35),
					      boardDoneLimit: clampNumber(els.settingsBoardDoneLimit.value, 0, 5000, 250),
					      attentionOnQuestionPrompts: !!els.settingsAttentionOnQuestionPrompts.checked,
					      integrateAutoArchive: !!els.settingsIntegrateAutoArchive.checked,
					      agents: {
				        codex: {
				          path: els.settingsCodexPath.value.trim(),
			          model: els.settingsCodexModel.value.trim(),
		          sandboxMode: els.settingsCodexSandboxMode.value,
		          skipGitRepoCheck: !!els.settingsCodexSkipGitRepoCheck.checked,
		          bypassApprovalsAndSandbox: !!els.settingsCodexBypass.checked,
		          color: els.settingsCodexColor.value
		        },
		        claude: {
		          path: els.settingsClaudePath.value.trim(),
		          model: els.settingsClaudeModel.value.trim(),
		          permissionMode: els.settingsClaudePermissionMode ? els.settingsClaudePermissionMode.value : "acceptEdits",
		          dangerouslySkipPermissions: !!(els.settingsClaudeSkipPermissions && els.settingsClaudeSkipPermissions.checked)
		        }
		      }
		    };
        state.settings = await api.settingsUpdate(patch);
        applyThemeFromSettings(state.settings);
        applyHelperDefaultsToPanel(state.settings, { force: true });
        if (!helperPersistHistoryFromSettings(state.settings)) clearHelperHistoryNow({ toast: false });
        else syncActiveHelperSessionFromState({ touch: false });
        renderBoard();
		    els.settingsDialog.close();
		  });

	  if (els.saveActionsBtn) {
	    els.saveActionsBtn.addEventListener("click", async () => {
	      if (!api || typeof api.settingsUpdate !== "function") return;
	      try {
	        state.settings = await api.settingsUpdate({ actions: readSettingsActionsFromUi() });
	        renderBoard();
	        if (els.jobDialog && els.jobDialog.open && state.selectedJobId) {
	          const job = state.jobs.get(state.selectedJobId);
	          if (job) updateJobDialogActions(job);
	        }
	        showToast("Actions saved.");
	        if (els.actionsDialog && els.actionsDialog.open) els.actionsDialog.close();
	      } catch (err) {
	        showToast(String(err && err.message ? err.message : err) || "Failed to save actions.");
	      }
	    });
	  }

  // Done lane overflow controls.
  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest ? e.target.closest("[data-done-cap-action]") : null;
    if (!btn) return;
    e.preventDefault();
    const action = btn.getAttribute("data-done-cap-action") || "";
    if (action === "show-all") state.showAllDone = true;
    else if (action === "collapse") state.showAllDone = false;
    else return;
    renderBoard();
  });

  // Card context menu (right click).
  if (els.cardContextMenu) {
    els.cardContextMenu.addEventListener("click", async (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("[data-ctx-action]") : null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();

      const action = btn.getAttribute("data-ctx-action") || "";
      const jobId = state.cardCtxJobId;
      hideCardContextMenu();
      if (!jobId) return;

      if (action === "open") {
        openJobDialog(jobId);
        return;
      }
      if (action === "open_in_editor") {
        await openJobInEditor(jobId);
        return;
      }
      if (action === "rerun") {
        await openRerunDialog(jobId);
        return;
      }
      if (action === "stop") {
        await cancelJob(jobId);
        return;
      }
      if (action === "restore") {
        await restoreJob(jobId);
        return;
      }
      if (action === "archive") {
        await archiveJob(jobId);
        return;
      }
      if (action === "trash") {
        await trashJob(jobId);
        return;
      }
      if (action === "delete") {
        await deleteJob(jobId);
        return;
      }
    });

    document.addEventListener("contextmenu", (e) => {
      // Keep menu from triggering a native context menu.
      if (els.cardContextMenu && els.cardContextMenu.contains(e.target)) {
        e.preventDefault();
        return;
      }

      const row = e.target && e.target.closest ? e.target.closest(".card[data-job-id], .sessionrow[data-job-id]") : null;
      if (!row) {
        hideCardContextMenu();
        return;
      }
      const id = row.getAttribute("data-job-id");
      if (!id) return;
      e.preventDefault();
      openCardContextMenu(id, e.clientX, e.clientY);
    });

    // Click-out closes the menu.
    document.addEventListener(
      "click",
      (e) => {
        if (!els.cardContextMenu || els.cardContextMenu.hidden) return;
        if (els.cardContextMenu.contains(e.target)) return;
        hideCardContextMenu();
      },
      true
    );

    // Escape closes the menu.
    document.addEventListener("keydown", (e) => {
      if (!els.cardContextMenu || els.cardContextMenu.hidden) return;
      if (e.key === "Escape") hideCardContextMenu();
    });

    // Scrolling/resizing should not leave a floating menu in the wrong place.
    document.addEventListener("scroll", () => hideCardContextMenu(), true);
    window.addEventListener("resize", () => hideCardContextMenu());
  }

  // Card clicks (event delegation) to avoid re-wiring listeners during live updates.
  document.addEventListener("click", (e) => {
    if (e.ctrlKey) return; // Ctrl+click is treated like a right-click on macOS.
    const row = e.target && e.target.closest ? e.target.closest(".card[data-job-id], .sessionrow[data-job-id]") : null;
    if (!row) return;
    const id = row.getAttribute("data-job-id");
    if (!id) return;
    if (state.cardCtxJobId === id && Date.now() - state.cardCtxOpenedAt < 500) return;
    openJobDialog(id);
  });
}

let codexModelsFetchInFlight = false;
let codexModelsCache = null; // array of objects from `codex app-server model/list`

let codexModelComboboxComposer = null;
let codexModelComboboxSettings = null;
let codexModelComboboxRerun = null;

function toPositiveInt(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  const x = Math.trunc(n);
  return x > 0 ? x : 0;
}

function normalizeModelLookupValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function modelLookupVariants(value) {
  const raw = normalizeModelLookupValue(value);
  if (!raw) return [];

  const out = new Set([raw]);

  const slash = raw.lastIndexOf("/");
  if (slash >= 0 && slash < raw.length - 1) out.add(raw.slice(slash + 1));

  const colon = raw.lastIndexOf(":");
  if (colon >= 0 && colon < raw.length - 1) out.add(raw.slice(colon + 1));

  const at = raw.indexOf("@");
  if (at > 0) out.add(raw.slice(0, at));

  return Array.from(out);
}

function contextKeyScore(key) {
  const k = String(key || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (!k) return 0;
  if (k.includes("output")) return 0;

  let score = 0;
  if (k.includes("context")) score += 100;
  if (k.includes("input")) score += 60;
  if (k.includes("window")) score += 25;
  if (k.includes("token")) score += 20;
  if (k.includes("limit") || k.includes("max")) score += 10;

  if (k === "maxtokens" || k === "tokenlimit" || k === "contextlength") score += 8;
  return score;
}

function modelContextWindowFromRecord(record) {
  const root = record && typeof record === "object" ? record : null;
  if (!root) return 0;

  let bestScore = 0;
  let bestValue = 0;
  const seen = new Set();

  function visit(node, depth) {
    if (!node || typeof node !== "object" || depth > 2) return;
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      const max = Math.min(12, node.length);
      for (let i = 0; i < max; i += 1) visit(node[i], depth + 1);
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      const score = contextKeyScore(key);
      if (score > 0) {
        const parsed = toPositiveInt(value);
        if (parsed >= 1024 && (score > bestScore || (score === bestScore && parsed > bestValue))) {
          bestScore = score;
          bestValue = parsed;
        }
      }

      if (value && typeof value === "object") visit(value, depth + 1);
    }
  }

  visit(root, 0);
  return bestValue;
}

function modelContextWindowFromCodexCache(modelName) {
  const targetVariants = modelLookupVariants(modelName);
  if (targetVariants.length === 0) return 0;

  const arr = Array.isArray(codexModelsCache) ? codexModelsCache : [];
  if (arr.length === 0) return 0;

  for (const item of arr) {
    if (!item || typeof item !== "object") continue;

    const modelVariants = new Set();
    for (const source of [item.model, item.id, item.name]) {
      for (const v of modelLookupVariants(source)) modelVariants.add(v);
    }

    let matched = false;
    for (const v of targetVariants) {
      if (modelVariants.has(v)) {
        matched = true;
        break;
      }
    }
    if (!matched) continue;

    const limit = modelContextWindowFromRecord(item);
    if (limit > 0) return limit;
  }

  return 0;
}

function modelContextWindowFromHeuristic(modelName) {
  const m = normalizeModelLookupValue(modelName);
  if (!m) return 0;

  // Claude models commonly expose a 200k context window.
  if (m.includes("claude")) return 200_000;
  return 0;
}

function resolveModelContextWindow(modelName) {
  return modelContextWindowFromCodexCache(modelName) || modelContextWindowFromHeuristic(modelName);
}

function jobContextUsage(job) {
  if (!job || typeof job !== "object") return null;

  const directLimit = toPositiveInt(job.modelContextWindow);
  const model = String(job.model || "").trim();
  if (!model && directLimit <= 0) return null;

  const usage = job.usage && typeof job.usage === "object" ? job.usage : null;
  let inputTokens = usage ? toPositiveInt(usage.input_tokens) : 0;

  if (inputTokens <= 0) {
    const ut = job.usageTotal && typeof job.usageTotal === "object" ? job.usageTotal : null;
    if (ut && toIntOrZero(ut.turns) === 1) {
      inputTokens = toPositiveInt(ut.input_tokens);
    }
  }

  if (inputTokens <= 0) return null;

  const limitTokens = directLimit > 0 ? directLimit : resolveModelContextWindow(model);
  if (limitTokens <= 0) return null;

  return {
    input_tokens: inputTokens,
    limit_tokens: limitTokens,
    percent: (inputTokens / limitTokens) * 100
  };
}

function jobContextStepper(job) {
  const ctx = jobContextUsage(job);
  if (!ctx) return null;

  const rawPct = clampNumber(ctx.percent, 0, 100_000, 0);
  const fillPct = clampNumber(rawPct, 0, 100, 0);
  const tone = rawPct >= 90 ? "danger" : rawPct >= 75 ? "warning" : "normal";
  const pctText = `${Math.round(rawPct)}%`;
  const titleBits = [`context ${fmtPctCompact(rawPct)} (${ctx.input_tokens}/${ctx.limit_tokens} input)`];
  const tok = jobTokensCardText(job);
  if (tok && tok.title) titleBits.push(tok.title);
  const title = titleBits.join("  ·  ");

  return { fillPct, pctText, title, tone };
}

function renderCardContextStepper(ctx) {
  if (!ctx || typeof ctx !== "object") return "";
  const fillPct = clampNumber(ctx.fillPct, 0, 100, 0);
  const tone = String(ctx.tone || "normal");
  const toneCls = tone === "danger" ? " card__contextFill--danger" : tone === "warning" ? " card__contextFill--warning" : "";
  const pctText = typeof ctx.pctText === "string" ? ctx.pctText : "";
  const title = typeof ctx.title === "string" ? ctx.title : "";

  return `
        <div class="card__context" data-job-context title="${escapeHtml(oneLine(title))}">
          <span class="card__contextStepper" aria-hidden="true">
            <span class="card__contextFill${toneCls}" data-job-context-fill style="width:${fillPct.toFixed(2)}%"></span>
          </span>
          <span class="card__contextPct" data-job-context-pct>${escapeHtml(pctText)}</span>
        </div>
  `;
}

function historyModelStrings(agentKey) {
  const out = new Set();
  const wantAgent = agentKey ? normalizeAgentKey(agentKey) : "";
  for (const j of state.jobs.values()) {
    const agent = normalizeAgentKey(j && j.agent);
    if (wantAgent && agent !== wantAgent) continue;
    const v = String(j && j.model ? j.model : "").trim();
    if (v) out.add(v);
  }
  return Array.from(out);
}

function computeCodexModelSuggestionGroups() {
  const codexArr = Array.isArray(codexModelsCache) ? codexModelsCache : [];
  const detectedRaw = codexArr
    .filter((m) => m && typeof m === "object" && typeof m.model === "string")
    .map((m) => ({
      value: String(m.model || "").trim(),
      label: String(m.displayName || m.id || m.model || "").trim(),
      isDefault: !!m.isDefault,
      kind: "detected"
    }))
    .filter((m) => m.value);

  detectedRaw.sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return a.label.localeCompare(b.label);
  });

  const detected = [];
  const seen = new Set();
  for (const m of detectedRaw) {
    if (!m || !m.value || seen.has(m.value)) continue;
    seen.add(m.value);
    detected.push(m);
  }

  const recent = historyModelStrings("codex")
    .map((v) => String(v || "").trim())
    .filter((v) => v && !seen.has(v))
    .sort((a, b) => a.localeCompare(b))
    .map((v) => ({ value: v, label: v, isDefault: false, kind: "recent" }));

  const out = [];
  if (detected.length > 0) out.push({ title: "Detected", items: detected });
  if (recent.length > 0) out.push({ title: "Recent", items: recent });
  return out;
}

function attachCodexModelCombobox(inputEl, { ariaLabel = "Show models" } = {}) {
  if (!inputEl) return null;
  if (inputEl.__agentHeavenComboAttached) return inputEl.__agentHeavenComboAttached;

  const wrap = document.createElement("div");
  wrap.className = "combo";

  // Wrap the existing input in a combo container so we can overlay a button + popover menu.
  const parent = inputEl.parentNode;
  if (!parent) return null;
  parent.insertBefore(wrap, inputEl);
  wrap.appendChild(inputEl);

  inputEl.classList.add("combo__input");
  inputEl.setAttribute("autocomplete", "off");
  inputEl.setAttribute("spellcheck", "false");
  inputEl.setAttribute("aria-expanded", "false");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "combo__btn";
  btn.setAttribute("aria-label", ariaLabel);
  btn.innerHTML = `<span class="combo__chev" aria-hidden="true"></span>`;
  wrap.appendChild(btn);

  const menu = document.createElement("div");
  menu.className = "combo__menu";
  menu.hidden = true;
  menu.setAttribute("role", "listbox");
  wrap.appendChild(menu);

  let enabled = true;
  let open = false;
  let activeValue = "";
  let visibleValues = [];
  let docWired = false;
  let suppressFocusOpen = false;

  function matchesQuery(item, q) {
    if (!q) return true;
    const v = String(item && item.value ? item.value : "").toLowerCase();
    const l = String(item && item.label ? item.label : "").toLowerCase();
    return v.includes(q) || l.includes(q);
  }

  function ensureMenuPosition() {
    // Flip upwards if we're near the bottom edge (common in the Settings dialog).
    menu.style.top = "";
    menu.style.bottom = "";
    const r = wrap.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    if (spaceBelow < 220 && spaceAbove > spaceBelow) {
      menu.style.top = "auto";
      menu.style.bottom = "calc(100% + 6px)";
    } else {
      menu.style.top = "calc(100% + 6px)";
      menu.style.bottom = "auto";
    }
  }

  function applyActive() {
    let activeEl = null;
    menu.querySelectorAll(".combo__item").forEach((el) => {
      const isActive = el.getAttribute("data-value") === activeValue;
      el.classList.toggle("combo__item--active", isActive);
      if (isActive) activeEl = el;
    });
    if (activeEl && typeof activeEl.scrollIntoView === "function") {
      try {
        activeEl.scrollIntoView({ block: "nearest" });
      } catch {
        // ignore
      }
    }
  }

  function renderMenu() {
    const q = String(inputEl.value || "").trim().toLowerCase();
    const groups = computeCodexModelSuggestionGroups();
    const frag = document.createDocumentFragment();
    visibleValues = [];

    for (const g of groups) {
      const items = Array.isArray(g.items) ? g.items.filter((it) => matchesQuery(it, q)) : [];
      if (items.length === 0) continue;

      const title = String(g.title || "").trim();
      if (title) {
        const h = document.createElement("div");
        h.className = "combo__group";
        h.textContent = title;
        frag.appendChild(h);
      }

      for (const it of items) {
        if (!it || !it.value) continue;
        visibleValues.push(it.value);

        const row = document.createElement("button");
        row.type = "button";
        row.className = "combo__item";
        row.setAttribute("data-value", it.value);

        const main = document.createElement("span");
        main.className = "combo__itemMain";

        const v = document.createElement("span");
        v.className = "combo__itemValue";
        v.textContent = it.value;
        main.appendChild(v);

        const lbl = String(it.label || "").trim();
        const lblText =
          lbl && lbl !== it.value ? lbl : it.kind === "recent" ? "Recently used" : it.isDefault ? "Default model" : "";
        if (lblText) {
          const l = document.createElement("span");
          l.className = "combo__itemLabel";
          l.textContent = lblText;
          main.appendChild(l);
        }

        row.appendChild(main);

        if (it.isDefault) {
          const b = document.createElement("span");
          b.className = "combo__badge combo__badge--default";
          b.textContent = "default";
          row.appendChild(b);
        } else if (it.kind === "recent") {
          const b = document.createElement("span");
          b.className = "combo__badge combo__badge--recent";
          b.textContent = "recent";
          row.appendChild(b);
        }

        frag.appendChild(row);
      }
    }

    if (visibleValues.length === 0) {
      const empty = document.createElement("div");
      empty.className = "combo__empty";
      empty.textContent = q ? "No matches." : "No models detected.";
      frag.appendChild(empty);
      activeValue = "";
    } else {
      const current = String(inputEl.value || "").trim();
      if (current && visibleValues.includes(current)) {
        activeValue = current;
      } else if (!activeValue || !visibleValues.includes(activeValue)) {
        activeValue = visibleValues[0];
      }
    }

    menu.textContent = "";
    menu.appendChild(frag);
    applyActive();
    ensureMenuPosition();
  }

  function openMenu() {
    if (!enabled || open) return;
    open = true;
    wrap.classList.add("combo--open");
    menu.hidden = false;
    inputEl.setAttribute("aria-expanded", "true");
    renderMenu();
    wireDocListeners();
  }

  function closeMenu() {
    if (!open) return;
    open = false;
    wrap.classList.remove("combo--open");
    menu.hidden = true;
    inputEl.setAttribute("aria-expanded", "false");
    unwireDocListeners();
  }

  function toggleMenu() {
    if (open) closeMenu();
    else openMenu();
  }

  function selectValue(value) {
    const v = String(value || "").trim();
    if (!v) return;
    inputEl.value = v;
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
    closeMenu();
    try {
      const alreadyFocused = document.activeElement === inputEl;
      if (!alreadyFocused) suppressFocusOpen = true;
      inputEl.focus();
      inputEl.setSelectionRange(v.length, v.length);
    } catch {
      // ignore
    }
  }

  const onDocPointerDown = (e) => {
    if (!open) return;
    const t = e && e.target ? e.target : null;
    if (t && (t === wrap || wrap.contains(t))) return;
    closeMenu();
  };

  const onDocKeyDown = (e) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
  };

  function wireDocListeners() {
    if (docWired) return;
    docWired = true;
    document.addEventListener("pointerdown", onDocPointerDown, true);
    document.addEventListener("keydown", onDocKeyDown, true);
  }

  function unwireDocListeners() {
    if (!docWired) return;
    docWired = false;
    document.removeEventListener("pointerdown", onDocPointerDown, true);
    document.removeEventListener("keydown", onDocKeyDown, true);
  }

  inputEl.addEventListener("focus", () => {
    if (!enabled) return;
    if (suppressFocusOpen) {
      suppressFocusOpen = false;
      return;
    }
    openMenu();
  });
  inputEl.addEventListener("input", () => {
    if (!enabled) return;
    openMenu();
    renderMenu();
  });
  inputEl.addEventListener("keydown", (e) => {
    if (!enabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      openMenu();
      if (visibleValues.length === 0) return;
      const idx = Math.max(0, visibleValues.indexOf(activeValue));
      activeValue = visibleValues[Math.min(visibleValues.length - 1, idx + 1)];
      applyActive();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      openMenu();
      if (visibleValues.length === 0) return;
      const idx = Math.max(0, visibleValues.indexOf(activeValue));
      activeValue = visibleValues[Math.max(0, idx - 1)];
      applyActive();
      return;
    }

    if (e.key === "Enter" && open && activeValue) {
      e.preventDefault();
      selectValue(activeValue);
      return;
    }

    if (e.key === "Escape" && open) {
      e.preventDefault();
      closeMenu();
    }
  });

  btn.addEventListener("pointerdown", (e) => {
    // Keep focus in the input so the menu doesn't immediately re-open on focus changes.
    e.preventDefault();
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!enabled) return;
    toggleMenu();
    try {
      inputEl.focus();
    } catch {
      // ignore
    }
  });

  menu.addEventListener("click", (e) => {
    const row = e.target && e.target.closest ? e.target.closest(".combo__item[data-value]") : null;
    if (!row) return;
    const v = row.getAttribute("data-value") || "";
    selectValue(v);
  });

  wrap.addEventListener("focusout", (e) => {
    if (!open) return;
    const next = e && "relatedTarget" in e ? e.relatedTarget : null;
    if (next && wrap.contains(next)) return;
    // Delay slightly so a click on a menu item (inside the wrap) can win.
    window.setTimeout(() => {
      if (open) closeMenu();
    }, 0);
  });

  function setEnabled(v) {
    enabled = !!v;
    wrap.classList.toggle("combo--disabled", !enabled);
    btn.hidden = !enabled;
    btn.disabled = !enabled;
    if (!enabled) closeMenu();
  }

  function refresh() {
    if (!open) return;
    renderMenu();
  }

  const apiObj = { setEnabled, refresh };
  inputEl.__agentHeavenComboAttached = apiObj;
  setEnabled(true);
  return apiObj;
}

function renderSettingsUiModelCodexGroup() {
  const selectEl = els.settingsUiModel;
  const groupEl = els.settingsUiModelCodexGroup;
  if (!groupEl || !isSelectEl(selectEl)) return;

  const current = getUiModelFromControls();

  // Clear previous Codex options.
  groupEl.textContent = "";

  const codexArr = Array.isArray(codexModelsCache) ? codexModelsCache : [];
  const models = codexArr
    .filter((m) => m && typeof m === "object" && typeof m.model === "string")
    .map((m) => ({
      model: String(m.model || "").trim(),
      displayName: String(m.displayName || m.id || m.model || "").trim(),
      isDefault: !!m.isDefault
    }))
    .filter((m) => m.model);

  models.sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });

  const used = new Set(Array.from(selectEl.options || []).map((o) => (o ? String(o.value) : "")));

  let added = 0;
  for (const m of models) {
    if (!m.model || used.has(m.model)) continue;
    used.add(m.model);
    const opt = document.createElement("option");
    opt.value = m.model;
    opt.textContent = m.isDefault ? `${m.displayName || m.model} (default)` : m.displayName || m.model;
    groupEl.appendChild(opt);
    added += 1;
  }

  if (added === 0) {
    // Keep the group visible but non-interactive when Codex isn't available.
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No Codex models detected";
    opt.disabled = true;
    groupEl.appendChild(opt);
    groupEl.disabled = true;
  } else {
    groupEl.disabled = false;
  }

  // If the user previously entered a custom value that now exists in the list, snap to it.
  setUiModelControls(current);
}

function renderCodexModelsDatalist() {
  const dl = els.codexModelsList;

  const seen = new Set();
  if (dl) dl.textContent = "";

  const codexArr = Array.isArray(codexModelsCache) ? codexModelsCache : [];
  const models = codexArr
    .filter((m) => m && typeof m === "object" && typeof m.model === "string")
    .map((m) => ({
      model: String(m.model || "").trim(),
      displayName: String(m.displayName || m.id || m.model || "").trim(),
      isDefault: !!m.isDefault
    }))
    .filter((m) => m.model);

  models.sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });

  for (const m of models) {
    if (!m.model || seen.has(m.model)) continue;
    seen.add(m.model);
    if (dl) {
      const opt = document.createElement("option");
      opt.value = m.model;
      opt.label = m.isDefault ? `${m.displayName || m.model} (default)` : m.displayName || m.model;
      dl.appendChild(opt);
    }
  }

  const hist = historyModelStrings("codex")
    .filter((v) => !seen.has(v))
    .sort((a, b) => a.localeCompare(b));
  for (const v of hist) {
    if (!v || seen.has(v)) continue;
    seen.add(v);
    if (dl) {
      const opt = document.createElement("option");
      opt.value = v;
      opt.label = `${v} (recent)`;
      dl.appendChild(opt);
    }
  }

  renderSettingsUiModelCodexGroup();

  // Keep custom combobox menus in sync (if open).
  if (codexModelComboboxComposer) codexModelComboboxComposer.refresh();
  if (codexModelComboboxSettings) codexModelComboboxSettings.refresh();
  if (codexModelComboboxRerun) codexModelComboboxRerun.refresh();
}

async function refreshCodexModelsDatalist({ showErrors = false } = {}) {
  // Always render at least "recent models" immediately.
  renderCodexModelsDatalist();

  if (!api || typeof api.codexListModels !== "function") return;
  if (codexModelsFetchInFlight) return;
  codexModelsFetchInFlight = true;
  try {
    const models = await api.codexListModels();
    codexModelsCache = Array.isArray(models) ? models : [];
    renderCodexModelsDatalist();
    if (state.selectedJobId && els.jobDialog && els.jobDialog.open) {
      const job = state.jobs.get(state.selectedJobId);
      if (job) renderJobDialogMeta(job);
    }
  } catch (err) {
    if (showErrors) showToast(`Could not load Codex models list: ${String(err && err.message ? err.message : err)}`);
  } finally {
    codexModelsFetchInFlight = false;
  }
}

let agentBinariesFetchInFlight = false;
async function refreshAgentBinaries({ showToastOnMissing = false } = {}) {
  if (!api || typeof api.agentsCheckBinaries !== "function") return;
  if (agentBinariesFetchInFlight) return;
  agentBinariesFetchInFlight = true;
  try {
    const res = await api.agentsCheckBinaries();
    state.agentBinaries = res && typeof res === "object" ? res : null;

    // Keep the status overlay fresh if it's open.
    if (els.statusDialog && els.statusDialog.open) renderStatusDialog();
    if (els.agentsInstallDialog && els.agentsInstallDialog.open) renderAgentsInstallDialog();

    if (showToastOnMissing) maybeShowMissingAgentBinariesToast(state.agentBinaries);
  } catch (err) {
    state.agentBinaries = { checkedAt: new Date().toISOString(), error: String(err && err.message ? err.message : err) };
    if (els.statusDialog && els.statusDialog.open) renderStatusDialog();
    if (els.agentsInstallDialog && els.agentsInstallDialog.open) renderAgentsInstallDialog();
  } finally {
    agentBinariesFetchInFlight = false;
  }
}

function agentBinaryMissingAgents(res) {
  const out = [];
  const codex = res && typeof res === "object" ? res.codex : null;
  const claude = res && typeof res === "object" ? res.claude : null;
  if (codex && codex.found === false) out.push("Codex");
  if (claude && claude.found === false) out.push("Claude");
  return out;
}

function maybeShowMissingAgentBinariesToast(res) {
  // Avoid noise for popout windows; keep warnings in the main board window.
  if (state.focusLane || state.focusJobId) return;

  const missing = agentBinaryMissingAgents(res);
  if (missing.length === 0) return;

  // De-dupe across multiple windows starting at the same time (open-on-all-displays).
  const now = Date.now();
  const lastAt = getStoredAgentBinariesToastAtMs();
  if (lastAt && now - lastAt < 30_000) return;
  storeAgentBinariesToastAtMs(now);

  let msg = `Missing agent CLI${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. Install now or open Settings to set the binary path${missing.length > 1 ? "s" : ""}.`;

  try {
    const codex = res && typeof res === "object" ? res.codex : null;
    const claude = res && typeof res === "object" ? res.claude : null;
    const hints = [];
    if (codex && codex.found === false && Array.isArray(codex.candidates) && codex.candidates[0]) {
      hints.push(`Codex candidate: ${String(codex.candidates[0])}`);
    }
    if (claude && claude.found === false && Array.isArray(claude.candidates) && claude.candidates[0]) {
      hints.push(`Claude candidate: ${String(claude.candidates[0])}`);
    }
    if (hints.length > 0) msg += ` (${hints.join(" · ")})`;
  } catch {
    // ignore
  }

  showToast(msg, null, 12_000, {
    actions: [
      { label: "Install...", kind: "primary", onClick: () => openAgentsInstallDialog() },
      { label: "Settings", onClick: () => openSettings() }
    ]
  });
}

function openSettings() {
  if (els.settingsSection) setView("settings");
  openSettingsDialog();
}

function closeSettings() {
  try {
    if (els.settingsDialog && els.settingsDialog.open) els.settingsDialog.close();
  } catch {
    // ignore
  }
  if (!els.settingsSection) return;
  if (state.view !== "settings") return;
  const fallback = normalizeView(state.lastMainView);
  setView(fallback === "settings" ? "board" : fallback);
}

			function openSettingsDialog() {
			  const s = state.settings || {};
			  const agents = s.agents && typeof s.agents === "object" ? s.agents : {};
			  const codex = agents.codex && typeof agents.codex === "object" ? agents.codex : {};
			  const claude = agents.claude && typeof agents.claude === "object" ? agents.claude : {};

		  els.settingsCodexPath.value = codex.path || "";
		  els.settingsCodexModel.value = codex.model || "";
				  setUiModelControls(s.uiModel || "");
				  els.settingsTheme.value = normalizeTheme(s.uiTheme);
				  els.settingsColorScheme.value = normalizeColorScheme(s.uiColorScheme);
		  if (els.settingsEditorCommand) els.settingsEditorCommand.value = editorCommandFromSettings();
				  els.settingsCodexSandboxMode.value = codex.sandboxMode || "workspace-write";
				  els.settingsCodexSkipGitRepoCheck.checked = !!codex.skipGitRepoCheck;
	  els.settingsCodexBypass.checked = !!codex.bypassApprovalsAndSandbox;
	  els.settingsCodexColor.value = codex.color || "auto";
	  els.settingsClaudePath.value = claude.path || "";
	  els.settingsClaudeModel.value = claude.model || "";
	  if (els.settingsClaudePermissionMode) els.settingsClaudePermissionMode.value = claude.permissionMode || "acceptEdits";
	  if (els.settingsClaudeSkipPermissions) els.settingsClaudeSkipPermissions.checked = !!claude.dangerouslySkipPermissions;
	  els.settingsMenuBarMode.checked = !!s.menuBarMode;
	  els.settingsStartAtLogin.checked = !!s.startAtLogin;
	  els.settingsOpenOnAllDisplays.checked = !!s.openOnAllDisplays;
	  els.settingsGlobalHotkeyEnabled.checked = !!s.globalHotkeyEnabled;
		  els.settingsGlobalHotkeyAccelerator.value = s.globalHotkeyAccelerator || "";
		  els.settingsGlobalHotkeyUseClipboard.checked = !!s.globalHotkeyUseClipboard;
		  els.settingsGlobalHotkeyStartWisprHandsFree.checked = !!s.globalHotkeyStartWisprHandsFree;
			  els.settingsSoundNeedsAttention.checked = !!s.soundOnNeedsAttention;
			  els.settingsSoundDone.checked = !!s.soundOnDone;
			  if (els.settingsSoundPreset) {
			    const preset = normalizeSoundPreset(s.soundPreset);
			    if (preset === "goat") ensureSelectOption(els.settingsSoundPreset, "goat", "Goat");
			    els.settingsSoundPreset.value = preset;
			  }
					  els.settingsSoundVolume.value = String(clampNumber(s.soundVolume, 0, 100, 35));
					  els.settingsBoardDoneLimit.value = String(clampNumber(s.boardDoneLimit, 0, 5000, 250));
					  els.settingsAttentionOnQuestionPrompts.checked = !!s.attentionOnQuestionPrompts;
					  els.settingsIntegrateAutoArchive.checked = s.integrateAutoArchive !== false;

		  refreshCodexModelsDatalist({ showErrors: true });

		  if (els.settingsDialog && typeof els.settingsDialog.showModal === "function") {
		    els.settingsDialog.showModal();
		  }

		  refreshMcpStatus();
		}

		// ── Settings page: tab switching ──────────────────────────
		function setSettingsTab(tab) {
		  document.querySelectorAll(".settingsPage__tab").forEach((btn) => {
		    const t = btn.getAttribute("data-settings-tab") || "";
		    btn.classList.toggle("settingsPage__tab--active", t === tab);
		  });
		  document.querySelectorAll(".settingsPage__panel").forEach((panel) => {
		    const p = panel.getAttribute("data-settings-panel") || "";
		    panel.hidden = p !== tab;
		  });
		  if (tab === "integrations") refreshMcpStatus();
		}

		// Wire up settings tab buttons
		document.querySelectorAll(".settingsPage__tab").forEach((btn) => {
		  btn.addEventListener("click", () => {
		    const tab = btn.getAttribute("data-settings-tab") || "general";
		    setSettingsTab(tab);
		  });
		});

		// Wire up settings page Save button (reuse same save logic)
		if (els.saveSettingsPageBtn) {
		  els.saveSettingsPageBtn.addEventListener("click", () => {
		    // Trigger the existing save handler
		    if (els.saveSettingsBtn) {
		      els.saveSettingsBtn.click();
		    }
		  });
		}

		// ── MCP server status ─────────────────────────────────────
		async function refreshMcpStatus() {
		  if (!els.mcpStatusBadge) return;
		  try {
		    const status = await api.mcpStatus();
		    const dot = els.mcpStatusBadge.querySelector(".integrations__statusDot");
		    const text = els.mcpStatusBadge.querySelector(".integrations__statusText");
		    if (dot) {
		      dot.classList.toggle("integrations__statusDot--off", !status.running);
		    }
		    if (text) {
		      text.textContent = status.running
		        ? "MCP Server running on port " + status.port + " \u2014 agents can use provider tools"
		        : "MCP Server not running";
		    }
		  } catch {
		    // IPC not available yet, ignore
		  }
		}

		function openActionsDialog() {
		  if (!els.actionsDialog) return;
		  const s = state.settings && typeof state.settings === "object" ? state.settings : {};
		  renderSettingsActions(s.actions);
		  try {
		    els.actionsDialog.showModal();
		  } catch {
		    // ignore
		  }
		}

function isWindowsPlatform() {
  try {
    const p = typeof navigator !== "undefined" ? String(navigator.platform || "") : "";
    const ua = typeof navigator !== "undefined" ? String(navigator.userAgent || "") : "";
    return /Win/i.test(p) || /Windows/i.test(ua);
  } catch {
    return false;
  }
}

function installCommandPreview(agent, method) {
  const a = normalizeAgentKey(agent);
  const m = typeof method === "string" ? method.trim() : "";

  if (a === "codex") return "npm i -g @openai/codex";

  if (a === "claude") {
    if (m === "npm") return "npm install -g @anthropic-ai/claude-code";
    if (isWindowsPlatform()) return "irm https://claude.ai/install.ps1 | iex";
    return "curl -fsSL https://claude.ai/install.sh | bash";
  }

  return "";
}

function renderAgentsInstallDialog() {
  if (!els.agentsInstallDialogMeta || !els.agentsInstallDialogBody) return;

  const res = state.agentBinaries && typeof state.agentBinaries === "object" ? state.agentBinaries : null;
  const checkedAt = res && res.checkedAt ? String(res.checkedAt) : "";
  const codex = res && res.codex && typeof res.codex === "object" ? res.codex : null;
  const claude = res && res.claude && typeof res.claude === "object" ? res.claude : null;

  const metaBits = [];
  metaBits.push("Runs install commands in a non-interactive shell on your machine.");
  if (checkedAt) metaBits.push(`checkedAt=${checkedAt}`);
  if (state.agentInstallInFlight) metaBits.push(`installing=${state.agentInstallInFlight}`);
  els.agentsInstallDialogMeta.textContent = metaBits.join("  ");

  function fmtFoundPill(found) {
    const cls = found ? "pill pill--done" : "pill pill--attn";
    const label = found ? "found" : "missing";
    return `<span class="${cls}">${escapeHtml(label)}</span>`;
  }

  function renderInstallResult(result) {
    const r = result && typeof result === "object" ? result : null;
    if (!r) return "";

    const finishedAt = r.finishedAt ? String(r.finishedAt) : "";
    const command = r.command ? String(r.command) : "";
    const exitCode = typeof r.exitCode === "number" ? String(r.exitCode) : "—";
    const timedOut = !!r.timedOut;
    const signal = r.signal ? String(r.signal) : "";
    const detectedPath = r.detectedPath ? String(r.detectedPath) : "";
    const err = r.error ? String(r.error) : "";
    const stdout = r.stdout ? String(r.stdout) : "";
    const stderr = r.stderr ? String(r.stderr) : "";
    const truncated = !!r.truncated;

    const bits = [];
    if (finishedAt) bits.push(`finishedAt=${finishedAt}`);
    bits.push(`exitCode=${exitCode}`);
    if (timedOut) bits.push("timedOut=true");
    if (signal) bits.push(`signal=${signal}`);
    if (detectedPath) bits.push(`detectedPath=${detectedPath}`);
    if (truncated) bits.push("output=truncated");

    const lines = [];
    lines.push(`<div class="logline">${escapeHtml(`Last install: ${bits.join("  ")}`)}</div>`);
    if (command) lines.push(`<div class="logline">${escapeHtml(`Command: ${command}`)}</div>`);
    if (err) lines.push(`<div class="logline logline--stderr">${escapeHtml(err)}</div>`);

    const out = [];
    if (stdout) out.push(`STDOUT:\n${stdout}`);
    if (stderr) out.push(`STDERR:\n${stderr}`);

    if (out.length === 0) return lines.join("");

    const detailsOpen = err ? " open" : "";
    lines.push(`
      <details${detailsOpen}>
        <summary>Output</summary>
        <div class="livefeed"><pre class="livefeed__pre">${escapeHtml(out.join("\n\n"))}</pre></div>
      </details>
    `);
    return lines.join("");
  }

  function renderAgentSection(agentKey, label, check, result) {
    const found = !!(check && check.found === true);
    const path = check && typeof check.path === "string" ? check.path : "";
    const spawnErr = check && check.error ? String(check.error) : "";
    const candidates = check && Array.isArray(check.candidates) ? check.candidates.filter(Boolean) : [];

    const installing = state.agentInstallInFlight === agentKey;
    const disabled = installing ? " disabled" : "";

    const cmdPrimary = installCommandPreview(agentKey, agentKey === "codex" ? "npm" : "native");
    const cmdAlt = agentKey === "claude" ? installCommandPreview(agentKey, "npm") : "";

    const hintLines = [];
    if (agentKey === "codex") hintLines.push(`Install (npm): ${cmdPrimary}`);
    else hintLines.push(`Install (native): ${cmdPrimary}`);
    if (cmdAlt) hintLines.push(`Alt (npm): ${cmdAlt}`);

    const installBtns = [];
    if (!found) {
      if (agentKey === "codex") {
        installBtns.push(
          `<button type="button" class="btn btn--primary" data-agent-install="${agentKey}" data-agent-install-method="npm"${disabled}>${
            installing ? "Installing..." : "Install Codex"
          }</button>`
        );
      } else {
        installBtns.push(
          `<button type="button" class="btn btn--primary" data-agent-install="${agentKey}" data-agent-install-method="native"${disabled}>${
            installing ? "Installing..." : "Install Claude (native)"
          }</button>`
        );
        installBtns.push(
          `<button type="button" class="btn btn--ghost" data-agent-install="${agentKey}" data-agent-install-method="npm"${disabled}>Install Claude (npm)</button>`
        );
      }
    }

    const lines = [];
    lines.push(`<div class="logline">${escapeHtml(label)}: ${fmtFoundPill(found)}  ${escapeHtml(`path=${path || "—"}`)}</div>`);
    if (!found && spawnErr) lines.push(`<div class="logline logline--stderr">${escapeHtml(`${label} error: ${spawnErr}`)}</div>`);
    if (!found && candidates.length > 0) lines.push(`<div class="logline">${escapeHtml(`${label} candidates: ${candidates.join(", ")}`)}</div>`);

    const resultHtml = renderInstallResult(result);

    return `
      <div class="statussection">
        <div class="statussection__title">${escapeHtml(label)}</div>
        <div class="statussection__hint">${escapeHtml(hintLines.join("\n"))}</div>
        ${lines.join("")}
        ${resultHtml ? `<div class="settings__divider"></div>${resultHtml}` : ""}
        <div class="settings__actions statussection__actions">
          ${installBtns.join("")}
          <button type="button" class="btn btn--ghost" data-agent-install-recheck>Recheck</button>
          <button type="button" class="btn btn--ghost" data-agent-install-open-settings>Open Settings</button>
        </div>
      </div>
    `;
  }

  const body = [];
  body.push(renderAgentSection("codex", "Codex CLI", codex, state.agentInstallResults.codex));
  body.push(renderAgentSection("claude", "Claude CLI", claude, state.agentInstallResults.claude));

  els.agentsInstallDialogBody.innerHTML = body.join("");
}

async function openAgentsInstallDialog() {
  if (!els.agentsInstallDialog) return;
  renderAgentsInstallDialog();
  try {
    els.agentsInstallDialog.showModal();
  } catch {
    // ignore
  }
  // Best-effort: refresh detection right after opening.
  refreshAgentBinaries({ showToastOnMissing: false });
}

async function runAgentInstallFromUi(agent, method) {
  const a = normalizeAgentKey(agent);
  if (a !== "codex" && a !== "claude") return;
  const m = typeof method === "string" ? method.trim() : "auto";

  if (!api || typeof api.agentsInstall !== "function") {
    showToast("Install is not supported in this build.");
    return;
  }
  if (state.agentInstallInFlight) {
    showToast(`Install already running (${state.agentInstallInFlight}).`);
    return;
  }

  const cmd = installCommandPreview(a, m);
  if (cmd) {
    const ok = window.confirm(`This will run:\n\n${cmd}\n\nContinue?`);
    if (!ok) return;
  }

  state.agentInstallInFlight = a;
  renderAgentsInstallDialog();

  try {
    const res = await api.agentsInstall({ agent: a, method: m, timeoutMs: 10 * 60_000 });
    if (a === "codex") state.agentInstallResults.codex = res;
    else state.agentInstallResults.claude = res;

    const detectedPath = res && typeof res === "object" && typeof res.detectedPath === "string" ? res.detectedPath.trim() : "";
    if (detectedPath) {
      const s = state.settings && typeof state.settings === "object" ? state.settings : {};
      const agents = s.agents && typeof s.agents === "object" ? s.agents : {};
      const cur = agents[a] && typeof agents[a] === "object" ? agents[a] : {};
      const curPath = typeof cur.path === "string" ? cur.path.trim() : "";
      if (!curPath) {
        try {
          const next = await api.settingsUpdate({ agents: { [a]: { path: detectedPath } } });
          state.settings = next;
        } catch {
          // ignore
        }
      }
    }

    await refreshAgentBinaries({ showToastOnMissing: false });

    const err = res && typeof res === "object" && res.error ? String(res.error) : "";
    if (err) showToast(err);
    else showToast(`${a === "codex" ? "Codex" : "Claude"} installed.`);
  } catch (err) {
    showToast(String(err && err.message ? err.message : err));
  } finally {
    state.agentInstallInFlight = "";
    renderAgentsInstallDialog();
  }
}

function renderStatusDialog() {
  if (!els.statusDialogMeta || !els.statusDialogBody) return;

  const view = state.view || "board";
  const jobsAll = Array.from(state.jobs.values());
  const jobs = jobsAll.filter((j) => jobVisibleInCurrentView(j));

  const running = jobs.filter((j) => pickLane(j) === "running").length;
  const attention = jobs.filter((j) => pickLane(j) === "attention").length;
  const done = jobs.filter((j) => pickLane(j) === "done").length;

  const usageView = aggregateTokenUsage(jobs);
  const usageAll = aggregateTokenUsage(jobsAll);

  const bits = [];
  bits.push(`view=${view}`);
  bits.push(`jobs=${jobs.length}`);
  bits.push(`running=${running}`);
  bits.push(`attention=${attention}`);
  bits.push(`done=${done}`);
  if (usageView.turns > 0) {
    bits.push(`tokens(view) in=${usageView.input_tokens} out=${usageView.output_tokens} turns=${usageView.turns}`);
  }
  if (usageAll.turns > 0) {
    bits.push(`tokens(all) in=${usageAll.input_tokens} out=${usageAll.output_tokens} turns=${usageAll.turns}`);
  }
  els.statusDialogMeta.textContent = bits.join("  ");

  function fmtFoundPill(found) {
    const cls = found ? "pill pill--done" : "pill pill--attn";
    const label = found ? "found" : "missing";
    return `<span class="${cls}">${escapeHtml(label)}</span>`;
  }

  function renderAgentBinariesSection() {
    const res = state.agentBinaries && typeof state.agentBinaries === "object" ? state.agentBinaries : null;
    const checkedAt = res && res.checkedAt ? String(res.checkedAt) : "";
    const codex = res && res.codex && typeof res.codex === "object" ? res.codex : null;
    const claude = res && res.claude && typeof res.claude === "object" ? res.claude : null;
    const err = res && res.error ? String(res.error) : "";

    const hintBits = [];
    hintBits.push("Checks whether Agent Heaven can spawn the CLI binaries (PATH matters for packaged apps).");
    if (checkedAt) hintBits.push(`checkedAt=${checkedAt}`);

    function renderRow(label, r) {
      const found = !!(r && r.found === true);
      const p = r && typeof r.path === "string" ? r.path : "";
      const extra = [];
      const spawnErr = r && r.error ? String(r.error) : "";
      if (!found && spawnErr) extra.push(`<div class="logline logline--stderr">${escapeHtml(`${label} error: ${spawnErr}`)}</div>`);
      const candidates = r && Array.isArray(r.candidates) ? r.candidates.filter(Boolean) : [];
      if (!found && candidates.length > 0) extra.push(`<div class="logline">${escapeHtml(`${label} candidates: ${candidates.join(", ")}`)}</div>`);
      return `<div class="logline">${escapeHtml(label)}: ${fmtFoundPill(found)}  ${escapeHtml(`path=${p || "—"}`)}</div>${extra.join("")}`;
    }

    const lines = [];
    if (!res) {
      lines.push(`<div class="logline">Not checked yet.</div>`);
    } else if (err && !codex && !claude) {
      lines.push(`<div class="logline logline--stderr">${escapeHtml(err)}</div>`);
    } else {
      lines.push(renderRow("Codex", codex));
      lines.push(renderRow("Claude", claude));
      if (err) lines.push(`<div class="logline logline--stderr">${escapeHtml(err)}</div>`);
    }

    const missing = [];
    if (codex && codex.found === false) missing.push("codex");
    if (claude && claude.found === false) missing.push("claude");
    const installBtn =
      missing.length > 0 ? `<button type="button" class="btn btn--primary" data-status-install-agents>Install...</button>` : "";

    return `
      <div class="statussection">
        <div class="statussection__title">Agent CLIs</div>
        <div class="statussection__hint">${escapeHtml(hintBits.join("  "))}</div>
        ${lines.join("")}
        <div class="settings__actions statussection__actions">
          ${installBtn}
          <button type="button" class="btn btn--ghost" data-status-open-settings>Open Settings</button>
          <button type="button" class="btn btn--ghost" data-status-refresh-agents>Recheck</button>
        </div>
      </div>
    `;
  }

  function sortUsageEntries(map) {
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const at = toIntOrZero(a[1] && a[1].input_tokens) + toIntOrZero(a[1] && a[1].output_tokens);
      const bt = toIntOrZero(b[1] && b[1].input_tokens) + toIntOrZero(b[1] && b[1].output_tokens);
      if (bt !== at) return bt - at;
      return String(a[0]).localeCompare(String(b[0]));
    });
    return entries;
  }

  function renderUsageTable({ title, keyLabel, entries }) {
    const ent = Array.isArray(entries) ? entries : [];
    if (ent.length === 0) {
      return `
        <div class="statussection">
          <div class="statussection__title">${escapeHtml(title)}</div>
          <div class="logline">No token usage yet.</div>
        </div>
      `;
    }

    const rows = [];
    rows.push(`
      <div class="statuslist__row statuslist__row--head statuslist__row--usage">
        <div>${escapeHtml(keyLabel)}</div>
        <div class="statuslist__tokens">Jobs</div>
        <div class="statuslist__tokens">Turns</div>
        <div class="statuslist__tokens">In</div>
        <div class="statuslist__tokens">Out</div>
      </div>
    `);

    for (const [key, bucket] of ent) {
      const jobsCount = toIntOrZero(bucket && bucket.jobs);
      const turns = toIntOrZero(bucket && bucket.turns);
      const inTok = toIntOrZero(bucket && bucket.input_tokens);
      const outTok = toIntOrZero(bucket && bucket.output_tokens);
      const titleText = `jobs=${jobsCount} turns=${turns} tokens in=${inTok} out=${outTok}`;

      rows.push(`
        <div class="statuslist__row statuslist__row--usage" title="${escapeHtml(titleText)}">
          <div class="statuslist__model">${escapeHtml(key)}</div>
          <div class="statuslist__tokens">${escapeHtml(String(jobsCount))}</div>
          <div class="statuslist__tokens">${escapeHtml(String(turns))}</div>
          <div class="statuslist__tokens">${escapeHtml(fmtTokCompact(inTok))}</div>
          <div class="statuslist__tokens">${escapeHtml(fmtTokCompact(outTok))}</div>
        </div>
      `);
    }

    return `
      <div class="statussection">
        <div class="statussection__title">${escapeHtml(title)}</div>
        <div class="statuslist statuslist--usage">${rows.join("")}</div>
      </div>
    `;
  }

  const laneScore = (status) => {
    const lane = pickLane(status);
    if (lane === "running") return 0;
    if (lane === "attention") return 1;
    return 2;
  };

  const sorted = [...jobs].sort((a, b) => {
    const d = laneScore(a.status) - laneScore(b.status);
    if (d) return d;
    return jobStartMs(b) - jobStartMs(a);
  });

  const rows = [];
  rows.push(`
    <div class="statuslist__row statuslist__row--head">
      <div>Status</div>
      <div>Job</div>
      <div>Model</div>
      <div>Elapsed</div>
      <div class="statuslist__tokens">Tokens</div>
    </div>
  `);

  for (const j of sorted) {
    const title = jobDisplayTitle(j) || "Job";
    const model = j.model || "";
    const elapsed = jobDurationText(j);

    const tok = jobTokenTotals(j);
    const inTok = tok ? tok.input_tokens : null;
    const outTok = tok ? tok.output_tokens : null;
    const turns = tok ? toIntOrZero(tok.turns) : 0;
    const tokText = tok ? `in ${fmtTokCompact(inTok)} out ${fmtTokCompact(outTok)}${turns > 1 ? ` (${turns}t)` : ""}` : "n/a";
    const tokTitle = tok ? `tokens in=${inTok ?? "?"} out=${outTok ?? "?"}${turns > 1 ? ` turns=${turns}` : ""}` : "";

    rows.push(`
      <div class="statuslist__row" data-status-job-id="${escapeHtml(j.id)}">
        <div>${fmtStatusPill(j)}</div>
        <div class="statuslist__title" title="${escapeHtml(oneLine(title))}">${escapeHtml(title)}</div>
        <div class="statuslist__model" title="${escapeHtml(oneLine(model))}">${escapeHtml(model || "—")}</div>
        <div class="statuslist__elapsed" data-status-elapsed="${escapeHtml(j.id)}">${escapeHtml(elapsed || "—")}</div>
        <div class="statuslist__tokens" title="${escapeHtml(oneLine(tokTitle))}">${escapeHtml(tokText)}</div>
      </div>
    `);
  }

  const body = [];

  body.push(renderAgentBinariesSection());

  if (jobsAll.length === 0) {
    body.push(`<div class="logline">No jobs yet.</div>`);
    els.statusDialogBody.innerHTML = `<div class="status">${body.join("")}</div>`;
    return;
  }

  const usageAllHint = usageAll.turns
    ? `jobs with usage ${usageAll.jobsWithUsage}/${usageAll.jobsTotal}  tokens in=${fmtTokCompact(usageAll.input_tokens)} out=${fmtTokCompact(usageAll.output_tokens)} turns=${usageAll.turns}`
    : `jobs with usage ${usageAll.jobsWithUsage}/${usageAll.jobsTotal}`;

  body.push(`
    <div class="statussection">
      <div class="statussection__title">Token usage (all jobs)</div>
      <div class="statussection__hint" title="${escapeHtml(
        `jobs with usage ${usageAll.jobsWithUsage}/${usageAll.jobsTotal} tokens in=${usageAll.input_tokens} out=${usageAll.output_tokens} turns=${usageAll.turns}`
      )}">${escapeHtml(usageAllHint)}</div>
      <div class="statussplit">
        ${renderUsageTable({ title: "By agent", keyLabel: "Agent", entries: sortUsageEntries(usageAll.byAgent) })}
        ${renderUsageTable({ title: "By model", keyLabel: "Model", entries: sortUsageEntries(usageAll.byModel) })}
      </div>
    </div>
  `);

  if (jobs.length === 0) {
    body.push(`<div class="logline">No jobs in this view.</div>`);
    els.statusDialogBody.innerHTML = `<div class="status">${body.join("")}</div>`;
    return;
  }

  body.push(`
    <div class="statussection">
      <div class="statussection__title">Jobs (this view)</div>
      <div class="statuslist">${rows.join("")}</div>
    </div>
  `);

  els.statusDialogBody.innerHTML = `<div class="status">${body.join("")}</div>`;
}

function scheduleStatusDialogRender() {
  if (!els.statusDialog || !els.statusDialog.open) return;
  if (state.statusRenderTimer) return;
  state.statusRenderTimer = window.setTimeout(() => {
    state.statusRenderTimer = null;
    if (els.statusDialog && els.statusDialog.open) renderStatusDialog();
  }, 120);
}

function openStatusDialog() {
  if (!els.statusDialog) return;
  renderStatusDialog();
  els.statusDialog.showModal();
}

function isMacPlatform() {
  try {
    const p = typeof navigator !== "undefined" ? String(navigator.platform || "") : "";
    const ua = typeof navigator !== "undefined" ? String(navigator.userAgent || "") : "";
    return /Mac|iPhone|iPad|iPod/.test(p) || /Mac OS X/.test(ua);
  } catch {
    return false;
  }
}

function formatAcceleratorForDisplay(accel) {
  const raw = String(accel || "").trim();
  if (!raw) return "";

  const isMac = isMacPlatform();
  const parts = raw
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);

  const out = [];
  for (const part of parts) {
    const low = part.toLowerCase();
    if (low === "commandorcontrol") out.push(isMac ? "⌘" : "Ctrl");
    else if (low === "command" || low === "cmd") out.push("⌘");
    else if (low === "control" || low === "ctrl") out.push("Ctrl");
    else if (low === "option" || low === "alt") out.push(isMac ? "⌥" : "Alt");
    else if (low === "shift") out.push("Shift");
    else out.push(part);
  }

  return out.join("+");
}

function renderShortcutsDialog() {
  if (!els.shortcutsDialogBody) return;

  const isMac = isMacPlatform();
  const mod = isMac ? "⌘" : "Ctrl";

  const s = state.settings && typeof state.settings === "object" ? state.settings : {};
  const globalHotkeyEnabled = !!s.globalHotkeyEnabled;
  const globalHotkeyAccel = formatAcceleratorForDisplay(s.globalHotkeyAccelerator || "");
  const globalHotkeyKeys = globalHotkeyEnabled ? globalHotkeyAccel || "(not set)" : "Global hotkey";
  const globalHotkeyNote = globalHotkeyEnabled ? "Configured in Settings" : "Disabled (enable in Settings)";

  const row = (keys, desc, note) => {
    const n = note ? `<div class="shortcutlist__note">${escapeHtml(note)}</div>` : "";
    return `<div class="shortcutlist__keys"><code class="kbdcombo">${escapeHtml(
      keys
    )}</code></div><div class="shortcutlist__desc">${escapeHtml(desc)}${n}</div>`;
  };

  const body = [];

  body.push(`
    <div class="shortcutsection">
      <div class="shortcutsection__title">Global</div>
      <div class="shortcutlist">
        ${row(globalHotkeyKeys, "Show Agent Heaven (system-wide)", globalHotkeyNote)}
        ${row(`${mod}+Shift+M`, "Move this window to a selected display")}
        ${row(`${mod}+/`, "Show shortcuts", `Also works with ${mod}+?`)}
      </div>
    </div>
  `);

  body.push(`
    <div class="shortcutsection">
      <div class="shortcutsection__title">Composer</div>
      <div class="shortcutlist">
        ${row(`${mod}+P`, "Focus the main prompt")}
        ${row(`${mod}+Enter`, "Run job (when the prompt is focused)")}
      </div>
    </div>
  `);

  body.push(`
    <div class="shortcutsection">
      <div class="shortcutsection__title">Chat</div>
      <div class="shortcutlist">
        ${row(`${mod}+K`, "Toggle chat")}
        ${row(`${mod}+Enter`, "Send question (when chat input is focused)")}
      </div>
    </div>
  `);

  body.push(`
    <div class="shortcutsection">
      <div class="shortcutsection__title">Search</div>
      <div class="shortcutlist">
        ${row(`${mod}+F`, "Focus search (board) or find-in-tab (open job)")}
        ${row(`${mod}+G`, "Next match (open job)")}
        ${row(`${mod}+Shift+G`, "Previous match (open job)")}
        ${row("Enter", "Search now (when board search is focused)")}
        ${row("Esc", "Clear search (when search is focused)")}
      </div>
    </div>
  `);

  body.push(`
    <div class="shortcutsection">
      <div class="shortcutsection__title">Job dialog</div>
      <div class="shortcutlist">
        ${row(`${mod}+Enter`, "Send follow-up (when follow-up is focused)")}
        ${row("Enter / Shift+Enter", "Next / previous match (when find-in-tab is focused)")}
        ${row("Esc", "Close menus and dialogs", "Job popout window: Esc does not close the job view")}
      </div>
    </div>
  `);

  body.push(`
    <div class="shortcutsection">
      <div class="shortcutsection__title">Cards</div>
      <div class="shortcutlist">
        ${row("Right click", "Open card actions menu", isMac ? "Ctrl+click also works on macOS" : "")}
        ${row("Esc", "Close the card actions menu (when open)")}
      </div>
    </div>
  `);

  els.shortcutsDialogBody.innerHTML = body.join("");
}

function openShortcutsDialog(opts) {
  if (!els.shortcutsDialog) return;
  const toggle = !!(opts && opts.toggle);

  try {
    if (els.shortcutsDialog.open) {
      if (toggle) els.shortcutsDialog.close();
      return;
    }
  } catch {
    // ignore
  }

  renderShortcutsDialog();
  try {
    els.shortcutsDialog.showModal();
  } catch {
    // ignore
  }
}

async function init() {
  // This can happen if the preload script failed to load (e.g. during a dev rebuild/reload).
  // Without the bridge, the UI can't talk to the main process; retry a few times automatically.
  if (!api) {
    renderBridgeMissing();
    return;
  }

  // Clear bridge retry counter after a successful load.
  try {
    sessionStorage.removeItem("agentHeaven.bridgeRetryCount");
  } catch {
    // ignore
  }

  wireUi();
  wireOfflineToast();
  wireSystemColorSchemeListener();
  state.sortMode = normalizeSortMode(getStoredSortMode());
  if (els.sortSelect) els.sortSelect.value = state.sortMode;
  state.projectFilterId = String(getStoredProjectFilterId() || "").trim();
  state.displayMode = state.focusLane ? "cards" : normalizeDisplayMode(getStoredDisplayMode());
  state.tableScope = normalizeTableScope(getStoredTableScope());
  setViewButtons(state.view);
  setDisplayModeButtons(state.displayMode);
  if (els.tableScopeSelect) els.tableScopeSelect.value = state.tableScope;
  applyViewLayout();

  if (typeof api.onQuickPrompt === "function") {
    api.onQuickPrompt((payload) => {
      const text = payload && typeof payload === "object" ? payload.text : "";
      appendQuickPromptText(text);
    });
  }

  if (typeof api.onTermEvent === "function") {
    api.onTermEvent((payload) => onTermEvent(payload));
  }

  state.settings = await api.settingsGet();
  applyThemeFromSettings(state.settings);
  applyXtermTheme();
  initHelperUi();
  if (typeof api.onSettingsChanged === "function") {
    api.onSettingsChanged((next) => {
      state.settings = next;
      applyThemeFromSettings(next);
      applyXtermTheme();
      if (!state.helperOpen && !state.helperPending) applyHelperDefaultsToPanel(next, { force: true });
      if (!helperPersistHistoryFromSettings(next)) clearHelperHistoryNow({ toast: false });
      else syncActiveHelperSessionFromState({ touch: false });
      renderBoard();
	      if (els.jobDialog && els.jobDialog.open && state.selectedJobId) {
	        const job = state.jobs.get(state.selectedJobId);
	        if (job) updateJobDialogActions(job);
	      }
	      if (els.actionsDialog && els.actionsDialog.open) renderSettingsActions(next && next.actions);
	      refreshAgentBinaries({ showToastOnMissing: false });
	    });
	  }
  state.projects = await api.projectsList();
  renderProjects();
  if (!state.projectRefreshTimer) {
    state.projectRefreshTimer = setInterval(async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (state.projectRefreshInFlight) return;
      state.projectRefreshInFlight = true;
      try {
        const nextProjects = await api.projectsList();
        const prevSig = projectListSignature(state.projects);
        const nextSig = projectListSignature(nextProjects);
        if (nextSig !== prevSig) {
          state.projects = nextProjects;
          renderProjects();
        }
      } catch {
        // ignore
      } finally {
        state.projectRefreshInFlight = false;
      }
    }, 30_000);
  }

  const jobs = await api.jobsList();
  for (const j of jobs) state.jobs.set(j.id, j);
  renderBoard();
  syncDurationTicker();
  refreshCodexModelsDatalist({ showErrors: false });
  refreshAgentBinaries({ showToastOnMissing: true });

  maybeStartFirstRunTour();

  // Job popout windows open directly into the selected job.
  if (state.focusJobId) {
    const id = state.focusJobId;
    if (!state.jobs.has(id)) {
      setHint("Unknown job (it may have been deleted).", "error");
    } else {
      try {
        await openJobDialog(id);
      } catch (err) {
        setHint(String(err && err.message ? err.message : err), "error");
      }
    }
  }

	  api.onJobEvent((payload) => {
	    const { jobId, kind } = payload;
	    if (!jobId) return;

    if (kind === "created") {
      if (payload && payload.job && !isDemoJob(payload.job)) {
        if (tour.active) stopFirstRunTour();
        else clearDemoJobs();
      }
      upsertJob(payload.job);
      return;
    }

    if (kind === "log" && payload.entry) {
      appendJobLog(jobId, payload.entry);
      return;
    }

    if (kind === "codex" && payload.entry) {
      appendJobLog(jobId, payload.entry);
      return;
    }

    if (kind === "claude" && payload.entry) {
      appendJobLog(jobId, payload.entry);
      return;
    }

    if (kind === "message" && payload.message) {
      appendJobMessage(jobId, payload.message);
      return;
    }

    if (kind === "meta" && payload.patch) {
      patchJob(jobId, payload.patch);
      return;
    }

    if (kind === "project_meta") {
      void (async () => {
        try {
          state.projects = await api.projectsList();
          renderProjects();
          renderBoard();
        } catch {
          // ignore
        }
      })();
      return;
    }

    if (kind === "deleted") {
      removeJob(jobId);
      return;
    }

    if (kind === "status" && payload.patch) {
      const prev = state.jobs.get(jobId);
      if (!prev) return;
      const prevStatus = prev.status || "";
      const nextStatus = payload.patch.status || "";
      patchJob(jobId, payload.patch);
      maybePlayStatusSound(prevStatus, nextStatus);
      // Auto-compact completed jobs to avoid keeping large logs/messages in renderer memory.
      if (nextStatus && nextStatus !== "running") {
        const isOpen = state.selectedJobId === jobId && els.jobDialog && els.jobDialog.open;
        if (!isOpen) {
          const next = state.jobs.get(jobId);
          if (next) upsertJob(compactJobForList(next));
        }
      }
      return;
    }
	  });

	  if (api.onDevNotice) {
	    api.onDevNotice((payload) => {
	      if (!payload || typeof payload !== "object") return;

      if (payload.kind === "live-reload-enabled") {
        // Keep this subtle; it's mostly to confirm you're actually in dev mode.
        setTransientHint("Live reload enabled.", "info", 2500);
        return;
      }

      if (payload.kind === "main-restarting") {
        const files = Array.isArray(payload.files) ? payload.files.filter(Boolean).join(", ") : "";
        const msg = files ? `Main process changed (${files}). Restarting…` : "Main process changed. Restarting…";
        setTransientHint(msg, "info", 5000);
        // eslint-disable-next-line no-console
        console.log("[dev]", msg);
        return;
      }

      if (payload.kind === "main-restart-required") {
        const files = Array.isArray(payload.files) ? payload.files.filter(Boolean).join(", ") : "";
        const msg = files
          ? `Main process changed (${files}). Restart the app to apply.`
          : "Main process changed. Restart the app to apply.";
        // Avoid clobbering more important UI errors.
        if (!els.composerHint.textContent) setTransientHint(msg, "info", 9000);
        // eslint-disable-next-line no-console
        console.log("[dev]", msg);
      }
    });
  }
}

init().catch((err) => {
  setHint(String(err && err.stack ? err.stack : err), "error");
});

function renderBridgeMissing() {
  const id = "ahBridgeMissing";
  if (document.getElementById(id)) return;

  const wrap = document.createElement("div");
  wrap.id = id;
  wrap.style.cssText = [
    "position:fixed",
    "inset:0",
    "display:grid",
    "place-items:center",
    "padding:24px",
    "background:linear-gradient(180deg, rgba(11,15,18,0.96), rgba(15,20,23,0.92))",
    "z-index:99999"
  ].join(";");

  wrap.innerHTML = `
    <div style="max-width:720px;border:1px solid rgba(255,255,255,0.14);border-radius:18px;padding:16px 16px 14px 16px;background:rgba(0,0,0,0.20);box-shadow:0 14px 40px rgba(0,0,0,0.45);">
      <div style="font-family:var(--serif, ui-serif);font-weight:800;font-size:18px;margin-bottom:6px;">Bridge missing</div>
      <div style="color:rgba(255,255,255,0.72);font-size:13px;line-height:1.35;">
        The renderer couldn't find <code style="font-family:var(--mono, ui-monospace);">window.agentHeaven</code>.
        This usually means the Electron preload script failed to load (common during a dev rebuild/live reload).
        Running jobs should continue in the main process; this is just the UI reconnecting.
      </div>
      <div data-retry style="margin-top:10px;color:rgba(255,255,255,0.55);font-size:12px;font-family:var(--mono, ui-monospace);"></div>
      <div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end;">
        <button data-reload class="btn btn--primary" style="padding:10px 12px;">Reload</button>
      </div>
    </div>
  `;

  document.body.appendChild(wrap);

  const reloadBtn = wrap.querySelector("[data-reload]");
  if (reloadBtn) reloadBtn.addEventListener("click", () => window.location.reload());

  const ua = String(navigator.userAgent || "");
  const isElectron = ua.includes("Electron");
  if (!isElectron) return;

  let tries = 0;
  try {
    tries = Number(sessionStorage.getItem("agentHeaven.bridgeRetryCount") || "0") || 0;
  } catch {
    tries = 0;
  }
  tries += 1;
  try {
    sessionStorage.setItem("agentHeaven.bridgeRetryCount", String(tries));
  } catch {
    // ignore
  }

  const delayMs = Math.min(5000, 600 + (tries - 1) * 700);
  const retryEl = wrap.querySelector("[data-retry]");
  if (retryEl) retryEl.textContent = tries <= 8 ? `Auto-retry in ${Math.round(delayMs / 100) / 10}s (attempt ${tries}/8)` : "Auto-retry disabled (too many attempts).";
  if (tries > 8) return;

  window.setTimeout(() => {
    try {
      window.location.reload();
    } catch {
      // ignore
    }
  }, delayMs);
}
