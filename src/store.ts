import * as fs from "node:fs";
import * as path from "node:path";

const PROJECT_COLOR_PALETTE = [
  "#64d8a3", // green
  "#4bb6ff", // blue
  "#ff5b6e", // red
  "#ffd166", // yellow
  "#ff9f1c", // orange
  "#b693ff", // lavender
  "#2ec4b6", // teal
  "#f15bb5", // pink
  "#00bbf9", // cyan
  "#8ac926" // lime
];

export const DEFAULT_STATE = {
  settings: {
    uiModel: "",
    uiTheme: "heaven", // heaven | nord | gruvbox | solarized | dracula | ocean
    uiColorScheme: "dark", // system | dark | light
    uiLogoVariant: "v1", // v1..v10

    // Global shortcuts
    globalHotkeyEnabled: false,
    globalHotkeyAccelerator: "CommandOrControl+Shift+P",
    // Default off: prevents accidental/sensitive clipboard dumps when the hotkey is used just to start prompting.
    globalHotkeyUseClipboard: false,
    // macOS: optionally kick off Wispr Flow hands-free dictation after focusing the prompt.
    globalHotkeyStartWisprHandsFree: false,

    // macOS UX (best-effort; some options require a packaged app)
    menuBarMode: false, // show a menu bar item + close-to-hide; hides Dock icon on macOS
    startAtLogin: false,

    // Multi-monitor UX
    openOnAllDisplays: false, // create a window on every display

    // UI notifications (renderer)
    soundOnNeedsAttention: false,
    soundOnDone: false,
    soundPreset: "classic", // classic | chime | pop | bell | arcade | goat (easter egg)
    soundVolume: 35, // 0..100
    boardDoneLimit: 250, // 0 = unlimited (limits Done lane rendering on Board)
    attentionOnQuestionPrompts: true, // send Q&A style prompts to Needs Attention on success

    // Per-agent settings (Codex, Claude, ...)
    agents: {
      codex: {
        path: "", // empty => use PATH resolution ("codex")
        model: "",
        sandboxMode: "workspace-write", // read-only | workspace-write | danger-full-access
        bypassApprovalsAndSandbox: false,
        skipGitRepoCheck: false,
        color: "auto" // auto | always | never
      },
      claude: {
        path: "", // empty => use PATH resolution ("claude")
        model: "",
        permissionMode: "acceptEdits", // default | acceptEdits | bypassPermissions | plan
        dangerouslySkipPermissions: false
      }
    }
  },
  projects: []
};

function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function deepMerge(a, b) {
  const left = isPlainObject(a) ? a : {};
  const right = isPlainObject(b) ? b : {};
  const out = { ...left };
  for (const [k, v] of Object.entries(right)) {
    if (isPlainObject(v) && isPlainObject(out[k])) out[k] = deepMerge(out[k], v);
    else out[k] = v;
  }
  return out;
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
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

function normalizeShortName(value) {
  if (value == null) return "";
  const s = String(value).trim();
  if (!s) return "";
  return s.slice(0, 16);
}

function pickNextProjectColor(usedLower) {
  const used = usedLower instanceof Set ? usedLower : new Set();
  for (const c of PROJECT_COLOR_PALETTE) {
    const low = c.toLowerCase();
    if (!used.has(low)) return c;
  }
  return PROJECT_COLOR_PALETTE[used.size % PROJECT_COLOR_PALETTE.length] || "#64d8a3";
}

function ensureProjectColors(projects) {
  const arr = Array.isArray(projects) ? projects : [];

  const used = new Set();
  const normalized = arr.map((p) => normalizeHexColor(p && typeof p === "object" ? p.color : ""));
  for (const c of normalized) {
    if (c) used.add(c.toLowerCase());
  }

  let changed = false;
  const out = arr.map((p, idx) => {
    const obj = p && typeof p === "object" ? p : {};
    const c = normalized[idx];
    if (c) {
      if (obj.color !== c) changed = true;
      return { ...obj, color: c };
    }

    const picked = pickNextProjectColor(used);
    used.add(picked.toLowerCase());
    changed = true;
    return { ...obj, color: picked };
  });

  return { projects: out, changed };
}

function ensureProjectShortNames(projects) {
  const arr = Array.isArray(projects) ? projects : [];
  let changed = false;

  const out = arr.map((p) => {
    const obj = p && typeof p === "object" ? p : {};
    if (!Object.prototype.hasOwnProperty.call(obj, "shortName")) return obj;

    const next = normalizeShortName(obj.shortName);
    if (!next) {
      const { shortName: _ignored, ...rest } = obj;
      changed = true;
      return rest;
    }

    if (obj.shortName !== next) {
      changed = true;
      return { ...obj, shortName: next };
    }

    return obj;
  });

  return { projects: out, changed };
}

function ensureAgentSettings(settings) {
  const s = isPlainObject(settings) ? settings : {};
  const next = { ...s };
  let changed = false;

  const agents = isPlainObject(next.agents) ? { ...next.agents } : {};
  const codex = isPlainObject(agents.codex) ? { ...agents.codex } : {};
  const claude = isPlainObject(agents.claude) ? { ...agents.claude } : {};

  // Migrate legacy flat Codex settings into `agents.codex`.
  const codexDefaults: any =
    DEFAULT_STATE &&
    DEFAULT_STATE.settings &&
    DEFAULT_STATE.settings.agents &&
    DEFAULT_STATE.settings.agents.codex &&
    typeof DEFAULT_STATE.settings.agents.codex === "object"
      ? DEFAULT_STATE.settings.agents.codex
      : {};

  const deprecated = [
    "codexPath",
    "agentModel",
    "sandboxMode",
    "bypassApprovalsAndSandbox",
    "skipGitRepoCheck",
    "color"
  ];
  const hasLegacyKeys = deprecated.some((k) => Object.prototype.hasOwnProperty.call(s, k));

  const legacyCodexPath = typeof s.codexPath === "string" ? s.codexPath : "";
  const legacyCodexModel = typeof s.agentModel === "string" ? s.agentModel : "";
  const legacySandboxMode = typeof s.sandboxMode === "string" ? s.sandboxMode : "";
  const legacyBypass = !!s.bypassApprovalsAndSandbox;
  const legacySkipGitRepoCheck = !!s.skipGitRepoCheck;
  const legacyColor = typeof s.color === "string" ? s.color : "";

  if (typeof codex.path !== "string") {
    codex.path = "";
    changed = true;
  }
  if (hasLegacyKeys && legacyCodexPath.trim() && !codex.path.trim()) {
    codex.path = legacyCodexPath;
    changed = true;
  }

  if (typeof codex.model !== "string") {
    codex.model = "";
    changed = true;
  }
  if (hasLegacyKeys && legacyCodexModel.trim() && !codex.model.trim()) {
    codex.model = legacyCodexModel;
    changed = true;
  }

  if (typeof codex.sandboxMode !== "string") {
    codex.sandboxMode = "workspace-write";
    changed = true;
  }
  if (
    hasLegacyKeys &&
    legacySandboxMode &&
    (codex.sandboxMode === codexDefaults.sandboxMode || !codex.sandboxMode.trim())
  ) {
    codex.sandboxMode = legacySandboxMode;
    changed = true;
  }

  if (typeof codex.bypassApprovalsAndSandbox !== "boolean") {
    codex.bypassApprovalsAndSandbox = false;
    changed = true;
  }
  if (hasLegacyKeys && legacyBypass && !codex.bypassApprovalsAndSandbox) {
    codex.bypassApprovalsAndSandbox = true;
    changed = true;
  }

  if (typeof codex.skipGitRepoCheck !== "boolean") {
    codex.skipGitRepoCheck = false;
    changed = true;
  }
  if (hasLegacyKeys && legacySkipGitRepoCheck && !codex.skipGitRepoCheck) {
    codex.skipGitRepoCheck = true;
    changed = true;
  }

  if (typeof codex.color !== "string") {
    codex.color = "auto";
    changed = true;
  }
  if (hasLegacyKeys && legacyColor && codex.color === codexDefaults.color) {
    codex.color = legacyColor;
    changed = true;
  }

  if (typeof claude.path !== "string") {
    claude.path = "";
    changed = true;
  }
  if (typeof claude.model !== "string") {
    claude.model = "";
    changed = true;
  }
  {
    const raw = typeof claude.permissionMode === "string" ? claude.permissionMode.trim() : "";
    const allowed = new Set(["default", "acceptEdits", "bypassPermissions", "plan"]);
    const nextMode = allowed.has(raw) ? raw : "acceptEdits";
    if (claude.permissionMode !== nextMode) {
      claude.permissionMode = nextMode;
      changed = true;
    }
  }
  if (typeof claude.dangerouslySkipPermissions !== "boolean") {
    claude.dangerouslySkipPermissions = false;
    changed = true;
  }

  if (!isPlainObject(next.agents)) changed = true;
  if (!isPlainObject(agents.codex)) changed = true;
  if (!isPlainObject(agents.claude)) changed = true;

  agents.codex = codex;
  agents.claude = claude;
  next.agents = agents;

  // Drop deprecated flat keys (kept for backward compatibility in older store files).
  for (const k of deprecated) {
    if (Object.prototype.hasOwnProperty.call(next, k)) {
      delete next[k];
      changed = true;
    }
  }

  return { settings: next, changed };
}

function ensureGlobalHotkeySettings(settings) {
  const s = isPlainObject(settings) ? settings : {};
  const next = { ...s };
  let changed = false;

  if (typeof next.globalHotkeyEnabled !== "boolean") {
    next.globalHotkeyEnabled = false;
    changed = true;
  }

  if (typeof next.globalHotkeyUseClipboard !== "boolean") {
    next.globalHotkeyUseClipboard = false;
    changed = true;
  }

  if (typeof next.globalHotkeyStartWisprHandsFree !== "boolean") {
    next.globalHotkeyStartWisprHandsFree = false;
    changed = true;
  }

  const defAccel =
    DEFAULT_STATE && DEFAULT_STATE.settings && typeof DEFAULT_STATE.settings.globalHotkeyAccelerator === "string"
      ? DEFAULT_STATE.settings.globalHotkeyAccelerator
      : "CommandOrControl+Shift+P";
  const rawAccel = typeof next.globalHotkeyAccelerator === "string" ? next.globalHotkeyAccelerator : "";
  const accel = rawAccel.trim();
  if (!accel) {
    next.globalHotkeyAccelerator = defAccel;
    changed = true;
  } else if (accel !== rawAccel) {
    next.globalHotkeyAccelerator = accel;
    changed = true;
  }

  return { settings: next, changed };
}

function ensureSettings(settings) {
  let next = settings;
  let changed = false;

  const agentRes = ensureAgentSettings(next);
  next = agentRes.settings;
  if (agentRes.changed) changed = true;

  const hkRes = ensureGlobalHotkeySettings(next);
  next = hkRes.settings;
  if (hkRes.changed) changed = true;

  return { settings: next, changed };
}

export class Store {
  filePath: string;
  state: any;

  constructor(filePath) {
    this.filePath = filePath;
    this.state = structuredClone(DEFAULT_STATE);
  }

	  load() {
	    try {
	      const raw = fs.readFileSync(this.filePath, "utf8");
	      const parsed = safeJsonParse(raw);
      if (parsed && typeof parsed === "object") {
        // shallow merge to keep defaults for new fields
        this.state = {
          ...structuredClone(DEFAULT_STATE),
          ...parsed,
          settings: { ...structuredClone(DEFAULT_STATE.settings), ...(parsed.settings || {}) }
        };
      }
	    } catch {
	      // first run or unreadable: keep defaults
	    }

	    // Migrations / defaults for newer fields
	    let changed = false;
	    const res = ensureProjectColors(this.state.projects);
	    this.state.projects = res.projects;
	    if (res.changed) changed = true;

	    const snRes = ensureProjectShortNames(this.state.projects);
	    this.state.projects = snRes.projects;
	    if (snRes.changed) changed = true;

	    const setRes = ensureSettings(this.state.settings);
	    this.state.settings = setRes.settings;
	    if (setRes.changed) changed = true;

	    if (changed) this.save();
	  }

  save() {
    ensureDir(path.dirname(this.filePath));
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), "utf8");
    fs.renameSync(tmp, this.filePath);
  }

  getSettings() {
    return this.state.settings;
  }

  updateSettings(patch) {
    const p = patch && typeof patch === "object" ? patch : {};
    const merged = deepMerge(this.state.settings, p);
    this.state.settings = ensureSettings(merged).settings;
    this.save();
    return this.state.settings;
  }

  listProjects() {
    return this.state.projects;
  }

  addProject(project) {
    const p = project && typeof project === "object" ? { ...project } : {};
    const c = normalizeHexColor(p.color);
    if (c) {
      p.color = c;
    } else {
      const used = new Set(
        (this.state.projects || [])
          .map((x) => normalizeHexColor(x && typeof x === "object" ? x.color : ""))
          .filter(Boolean)
          .map((x) => x.toLowerCase())
      );
      p.color = pickNextProjectColor(used);
    }

    if (Object.prototype.hasOwnProperty.call(p, "shortName")) {
      p.shortName = normalizeShortName(p.shortName);
      if (!p.shortName) delete p.shortName;
    }

    this.state.projects = [...this.state.projects, p];
    this.save();
    return p;
  }

  removeProject(id) {
    const before = this.state.projects.length;
    this.state.projects = this.state.projects.filter((p) => p.id !== id);
    const removed = this.state.projects.length !== before;
    if (removed) this.save();
    return removed;
  }

  updateProject(id, patch) {
    const rawPatch = patch && typeof patch === "object" ? { ...patch } : {};
    if (Object.prototype.hasOwnProperty.call(rawPatch, "color")) {
      const c = normalizeHexColor(rawPatch.color);
      if (c) rawPatch.color = c;
      else delete rawPatch.color;
    }

    const hasShortName = Object.prototype.hasOwnProperty.call(rawPatch, "shortName");
    const nextShortName = hasShortName ? normalizeShortName(rawPatch.shortName) : "";
    if (hasShortName) delete rawPatch.shortName;

    let updated = null;
    this.state.projects = this.state.projects.map((p) => {
      if (p.id !== id) return p;
      updated = { ...p, ...rawPatch };
      if (hasShortName) {
        if (nextShortName) updated.shortName = nextShortName;
        else delete updated.shortName;
      }
      return updated;
    });
    if (updated) this.save();
    return updated;
  }
}
