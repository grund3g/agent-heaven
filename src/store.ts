import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import {
  normalizeBranchName as normalizeGitBranchName,
  normalizeCheckoutMode as normalizeGitCheckoutMode
} from "./core/git-normalize";

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
    uiDesignVersion: "v1", // v1 | v2
    editorCommand: "", // command/binary for "Open in editor" (e.g. code, cursor, zed)

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
    soundPreset: "classic", // classic | chime | pop | bell | arcade | cucaracha | fun_drum | pipe | sergei | pop_wow | goat (easter egg)
    soundVolume: 35, // 0..100
    boardDoneLimit: 250, // 0 = unlimited (limits Done lane rendering on Board)
    attentionOnQuestionPrompts: true, // send Q&A style prompts to Needs Attention on success
    integrateAutoArchive: true, // auto-archive ticket after "Integrate to default branch"
    integrateToDefaultMode: "agent", // agent | cli
    helperDefaultAgent: "", // "" | claude | codex
    helperDefaultModel: "opus",
    helperPersistHistory: true,

    // Saved shell actions for quick access in the job dialog (executed via the Terminal tab).
    // Versioned seeding for built-in actions (so existing installs can pick up new defaults once).
    actionsDefaultsVersion: 0,
    actions: [
      {
        id: "ah_builtin_integrate_to_default",
        name: "Integrate to default branch",
        // Built-in command handled by the renderer (not executed in the shell).
        command: "ah:integrate-to-default"
      },
      {
        id: "ah_builtin_commit_and_push",
        name: "Commit + push",
        // Built-in command handled by the renderer (not executed in the shell).
        command: "ah:commit-and-push"
      },
      {
        id: "ah_builtin_commit_only",
        name: "Commit only",
        // Built-in command handled by the renderer (not executed in the shell).
        command: "ah:commit-only"
      }
    ],

    // Per-agent settings (Codex, Claude, ...)
    agents: {
      codex: {
        path: "", // empty => use PATH resolution ("codex")
        model: "",
        transport: "exec_json", // exec_json | app_server
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
    // Prevent prototype pollution via __proto__/constructor/prototype.
    if (k === "__proto__" || k === "constructor" || k === "prototype") continue;

    const existing = Object.prototype.hasOwnProperty.call(out, k) ? out[k] : undefined;
    if (isPlainObject(v) && isPlainObject(existing)) out[k] = deepMerge(existing, v);
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

function normalizeBranchName(value) {
  return normalizeGitBranchName(value);
}

function normalizeBranchList(value, maxLen = 100) {
  const arr = Array.isArray(value) ? value : value == null ? [] : [value];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of arr) {
    const b = normalizeBranchName(item);
    if (!b) continue;
    if (seen.has(b)) continue;
    seen.add(b);
    out.push(b);
    if (out.length >= maxLen) break;
  }
  return out;
}

function normalizeCheckoutMode(value) {
  return normalizeGitCheckoutMode(value);
}

function normalizeIntegrateToDefaultMode(value) {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!raw) return "";
  if (raw === "agent" || raw === "llm" || raw === "ai") return "agent";
  if (raw === "cli" || raw === "git" || raw === "shell" || raw === "local") return "cli";
  return "";
}

function normalizeHelperDefaultAgent(value) {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "claude" || raw === "anthropic") return "claude";
  if (raw === "codex" || raw === "openai") return "codex";
  return "";
}

function normalizeHelperDefaultModel(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  return raw.slice(0, 160);
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

function ensureProjectCheckoutSettings(projects) {
  const arr = Array.isArray(projects) ? projects : [];
  let changed = false;

  const out = arr.map((p) => {
    const obj = p && typeof p === "object" ? { ...(p as any) } : {};

    const nextMode = normalizeCheckoutMode((obj as any).checkoutMode) || "inplace";
    if ((obj as any).checkoutMode !== nextMode) {
      (obj as any).checkoutMode = nextMode;
      changed = true;
    }

    const nextBranch = normalizeBranchName((obj as any).defaultBranch);
    if (!nextBranch) {
      if (Object.prototype.hasOwnProperty.call(obj, "defaultBranch")) {
        delete (obj as any).defaultBranch;
        changed = true;
      }
    } else if ((obj as any).defaultBranch !== nextBranch) {
      (obj as any).defaultBranch = nextBranch;
      changed = true;
    }

    {
      const curRaw = (obj as any).skipDefaultBranchConfirmBranches;
      const next = normalizeBranchList(curRaw);
      const same =
        Array.isArray(curRaw) &&
        curRaw.length === next.length &&
        curRaw.every((x: any, i: number) => x === next[i]);
      if (next.length === 0) {
        if (Object.prototype.hasOwnProperty.call(obj, "skipDefaultBranchConfirmBranches")) {
          delete (obj as any).skipDefaultBranchConfirmBranches;
          changed = true;
        }
      } else if (!same) {
        (obj as any).skipDefaultBranchConfirmBranches = next;
        changed = true;
      }
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

  {
    const raw = typeof codex.transport === "string" ? codex.transport.trim().toLowerCase() : "";
    const nextTransport = raw === "app_server" || raw === "app-server" || raw === "appserver" ? "app_server" : "exec_json";
    if (codex.transport !== nextTransport) {
      codex.transport = nextTransport;
      changed = true;
    }
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

function ensureActionsSettings(settings) {
  const s = isPlainObject(settings) ? settings : {};
  const next: any = { ...s };
  let changed = false;

  const DEFAULTS_VERSION = 2;
  {
    const raw = (next as any).actionsDefaultsVersion;
    let v = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(v) || v < 0) {
      v = 0;
      changed = true;
    }
    (next as any).actionsDefaultsVersion = Math.trunc(v);
  }

  const raw = (next as any).actions;
  const arr = Array.isArray(raw) ? raw : [];
  if (!Array.isArray(raw) && raw != null) changed = true;

  const out: any[] = [];
  const seen = new Set<string>();

  for (const item of arr) {
    const obj: any = item && typeof item === "object" ? item : {};
    let id = typeof obj.id === "string" ? obj.id.trim() : "";
    let name = typeof obj.name === "string" ? obj.name.trim() : "";
    let command = typeof obj.command === "string" ? obj.command : "";

    // Normalize newlines (renderer tends to use \n).
    command = command.replaceAll("\r\n", "\n").trimEnd();
    if (!command) {
      changed = true;
      continue;
    }

    if (!id) {
      id = randomUUID();
      changed = true;
    }
    if (seen.has(id)) {
      id = randomUUID();
      changed = true;
    }
    seen.add(id);

    if (!name) {
      const firstLine = command.split("\n")[0] || "";
      name = firstLine.trim().slice(0, 80) || "Action";
      changed = true;
    } else if (name.length > 80) {
      name = name.slice(0, 80);
      changed = true;
    }

    const MAX_CMD_CHARS = 20_000;
    if (command.length > MAX_CMD_CHARS) {
      command = command.slice(0, MAX_CMD_CHARS);
      changed = true;
    }

    out.push({ id, name, command });
  }

  const MAX_ACTIONS = 200;
  if (out.length > MAX_ACTIONS) {
    out.splice(MAX_ACTIONS);
    changed = true;
  }

  // Seed built-in actions once (versioned) so existing users get them,
  // but can remove them later without the app re-adding them.
  if ((next as any).actionsDefaultsVersion < DEFAULTS_VERSION) {
    const hasBuiltIn = (opts: { id: string; commands: string[] }) =>
      out.some((a) => a && typeof a === "object" && String((a as any).id || "").trim() === opts.id) ||
      out.some((a) => {
        const cmd = a && typeof a === "object" ? String((a as any).command || "") : "";
        const first = (cmd.replaceAll("\r\n", "\n").split("\n")[0] || "").trim();
        return opts.commands.includes(first);
      });

    const builtIns = [
      {
        id: "ah_builtin_integrate_to_default",
        name: "Integrate to default branch",
        command: "ah:integrate-to-default",
        aliases: ["ah:integrate-to-default", "ah:integrate"]
      },
      {
        id: "ah_builtin_commit_and_push",
        name: "Commit + push",
        command: "ah:commit-and-push",
        aliases: ["ah:commit-and-push", "ah:commit+push", "ah:commit-push"]
      },
      {
        id: "ah_builtin_commit_only",
        name: "Commit only",
        command: "ah:commit-only",
        aliases: ["ah:commit-only", "ah:commit"]
      }
    ];

    for (const bi of builtIns) {
      if (out.length >= MAX_ACTIONS) break;
      if (hasBuiltIn({ id: bi.id, commands: bi.aliases })) continue;
      out.push({ id: bi.id, name: bi.name, command: bi.command });
      changed = true;
    }

    (next as any).actionsDefaultsVersion = DEFAULTS_VERSION;
    changed = true;
  }

  // Always set a normalized array so the renderer can rely on the shape.
  (next as any).actions = out;

  return { settings: next, changed };
}

function ensureHelperSettings(settings) {
  const s = isPlainObject(settings) ? settings : {};
  const next: any = { ...s };
  let changed = false;

  {
    const raw = (next as any).helperDefaultAgent;
    const norm = normalizeHelperDefaultAgent(raw);
    if (raw !== norm) {
      (next as any).helperDefaultAgent = norm;
      changed = true;
    }
  }

  {
    const raw = (next as any).helperDefaultModel;
    if (typeof raw !== "string") {
      (next as any).helperDefaultModel = "opus";
      changed = true;
    } else {
      const norm = normalizeHelperDefaultModel(raw);
      if (raw !== norm) {
        (next as any).helperDefaultModel = norm;
        changed = true;
      }
    }
  }

  if (typeof (next as any).helperDefaultModel !== "string") {
    (next as any).helperDefaultModel = "opus";
    changed = true;
  }

  if (typeof (next as any).helperDefaultModel === "string" && (next as any).helperDefaultModel.length > 160) {
    (next as any).helperDefaultModel = String((next as any).helperDefaultModel).slice(0, 160);
    changed = true;
  }

  if (typeof (next as any).helperDefaultAgent !== "string") {
    (next as any).helperDefaultAgent = "";
    changed = true;
  }

  if ((next as any).helperDefaultAgent === "codex") {
    const low = String((next as any).helperDefaultModel || "").trim().toLowerCase();
    if (low === "opus" || low === "sonnet" || low === "haiku") {
      (next as any).helperDefaultModel = "";
      changed = true;
    }
  }

  if (typeof (next as any).helperPersistHistory !== "boolean") {
    (next as any).helperPersistHistory = true;
    changed = true;
  }

  return { settings: next, changed };
}

function ensureSettings(settings) {
  let next = isPlainObject(settings) ? { ...settings } : {};
  let changed = !isPlainObject(settings);

  // renderer-v2 was an experiment; drop the selector to keep settings stable.
  if (Object.prototype.hasOwnProperty.call(next, "uiRenderer")) {
    delete next.uiRenderer;
    changed = true;
  }
  // Branding is fixed; drop the old selector if it exists.
  if (Object.prototype.hasOwnProperty.call(next, "uiLogoVariant")) {
    delete next.uiLogoVariant;
    changed = true;
  }

  {
    const raw = typeof (next as any).uiDesignVersion === "string" ? (next as any).uiDesignVersion.trim().toLowerCase() : "";
    const nextVersion = raw === "v2" ? "v2" : "v1";
    if ((next as any).uiDesignVersion !== nextVersion) {
      (next as any).uiDesignVersion = nextVersion;
      changed = true;
    }
  }

  if (typeof (next as any).integrateAutoArchive !== "boolean") {
    (next as any).integrateAutoArchive = true;
    changed = true;
  }

  {
    const mode = normalizeIntegrateToDefaultMode((next as any).integrateToDefaultMode) || "agent";
    if ((next as any).integrateToDefaultMode !== mode) {
      (next as any).integrateToDefaultMode = mode;
      changed = true;
    }
  }

  if (typeof (next as any).editorCommand !== "string") {
    (next as any).editorCommand = "";
    changed = true;
  } else {
    const trimmed = String((next as any).editorCommand).trim();
    if ((next as any).editorCommand !== trimmed) {
      (next as any).editorCommand = trimmed;
      changed = true;
    }
  }

  const agentRes = ensureAgentSettings(next);
  next = agentRes.settings;
  if (agentRes.changed) changed = true;

  const hkRes = ensureGlobalHotkeySettings(next);
  next = hkRes.settings;
  if (hkRes.changed) changed = true;

  const actRes = ensureActionsSettings(next);
  next = actRes.settings;
  if (actRes.changed) changed = true;

  const helperRes = ensureHelperSettings(next);
  next = helperRes.settings;
  if (helperRes.changed) changed = true;

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

	    const coRes = ensureProjectCheckoutSettings(this.state.projects);
	    this.state.projects = coRes.projects;
	    if (coRes.changed) changed = true;

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
    const p = isPlainObject(patch) ? patch : {};
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

    {
      const mode = normalizeCheckoutMode((p as any).checkoutMode) || "inplace";
      (p as any).checkoutMode = mode;
    }
    {
      const b = normalizeBranchName((p as any).defaultBranch);
      if (b) (p as any).defaultBranch = b;
      else if (Object.prototype.hasOwnProperty.call(p, "defaultBranch")) delete (p as any).defaultBranch;
    }
    {
      const next = normalizeBranchList((p as any).skipDefaultBranchConfirmBranches);
      if (next.length > 0) (p as any).skipDefaultBranchConfirmBranches = next;
      else if (Object.prototype.hasOwnProperty.call(p, "skipDefaultBranchConfirmBranches")) delete (p as any).skipDefaultBranchConfirmBranches;
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

    const hasDefaultBranch = Object.prototype.hasOwnProperty.call(rawPatch, "defaultBranch");
    const nextDefaultBranch = hasDefaultBranch ? normalizeBranchName((rawPatch as any).defaultBranch) : "";
    if (hasDefaultBranch) delete (rawPatch as any).defaultBranch;

    const hasSkipDefaultBranchConfirmBranches = Object.prototype.hasOwnProperty.call(rawPatch, "skipDefaultBranchConfirmBranches");
    const nextSkipDefaultBranchConfirmBranches = hasSkipDefaultBranchConfirmBranches
      ? normalizeBranchList((rawPatch as any).skipDefaultBranchConfirmBranches)
      : [];
    if (hasSkipDefaultBranchConfirmBranches) delete (rawPatch as any).skipDefaultBranchConfirmBranches;

    const hasCheckoutMode = Object.prototype.hasOwnProperty.call(rawPatch, "checkoutMode");
    const nextCheckoutMode = hasCheckoutMode ? normalizeCheckoutMode((rawPatch as any).checkoutMode) || "inplace" : "";
    if (hasCheckoutMode) delete (rawPatch as any).checkoutMode;

    let updated = null;
    this.state.projects = this.state.projects.map((p) => {
      if (p.id !== id) return p;
      updated = { ...p, ...rawPatch };
      if (hasShortName) {
        if (nextShortName) updated.shortName = nextShortName;
        else delete updated.shortName;
      }
      if (hasDefaultBranch) {
        if (nextDefaultBranch) (updated as any).defaultBranch = nextDefaultBranch;
        else delete (updated as any).defaultBranch;
      }
      if (hasSkipDefaultBranchConfirmBranches) {
        if (nextSkipDefaultBranchConfirmBranches.length > 0) {
          (updated as any).skipDefaultBranchConfirmBranches = nextSkipDefaultBranchConfirmBranches;
        } else {
          delete (updated as any).skipDefaultBranchConfirmBranches;
        }
      }
      if (hasCheckoutMode) {
        (updated as any).checkoutMode = nextCheckoutMode;
      }
      return updated;
    });
    if (updated) this.save();
    return updated;
  }
}
