import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { app, BrowserWindow, ipcMain, dialog, globalShortcut, nativeTheme, screen, shell, session } from "electron";
import type { OpenDialogOptions } from "electron";
import type { WebContents } from "electron";
import { Store } from "../store";
import { JobHistory } from "../job-history";
import { runCodexExec, runCodexResume } from "../codex-runner";
import { runClaudeExec, runClaudeResume } from "../claude-runner";
import { needsAttentionHeuristic } from "../needs-attention";
import { newId } from "../core/id";
import { normalizeColorScheme, windowBgForSettings } from "../core/theme";
import { sendDevNotice, sendJobEvent, sendSettingsChanged } from "./broadcast";
import { startDevLiveReload } from "./dev-live-reload";
import { HotkeyManager } from "./hotkey-manager";
import { JobsManager } from "./jobs-manager";
import { TerminalManager } from "./terminal-manager";
import { TrayManager } from "./tray-manager";
import { WindowManager } from "./window-manager";
import { ensureMacAppMenu } from "./mac-app-menu";
import { listCodexModels } from "./codex-models";
import { checkAgentBinaries, resolveClaudeCliPathFromSettings, resolveCodexCliPathFromSettings } from "../agent-binaries";
import { installAgentCli } from "../agent-install";
import { inferCommitMessageStyleFromSubjects, suggestCommitMessage } from "../core/commit-message";
import { jobDisplayTitle } from "../core/prompt";
import { spawnPlatform } from "../platform-spawn";
import {
  addAll,
  cherryPick,
  commitWithMessage,
  detectDefaultBranch,
  findWorktreePathForBranch,
  getGitCommonDir,
  getGitInfo,
  listChangedPaths,
  listCommitsInRange,
  listRecentCommitSubjects,
  pushCurrentBranch,
  removeWorktree,
  switchBranch
} from "./git";

function isMenuBarMode(settings: any) {
  return process.platform === "darwin" && !!(settings && settings.menuBarMode);
}

function normalizeTemporaryProjectPrefix(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "temp";
  const safe = raw
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return safe || "temp";
}

function temporaryProjectTimestamp(d: Date): string {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function safeParseUrl(rawUrl: unknown): URL | null {
  const s = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!s) return null;
  try {
    return new URL(s);
  } catch {
    return null;
  }
}

function isTrustedRendererUrl(rawUrl: unknown): boolean {
  const u = safeParseUrl(rawUrl);
  if (!u) return false;
  if (u.protocol !== "file:") return false;
  // All app windows load the same renderer entrypoint (with optional query params).
  return u.pathname.endsWith("/renderer/index.html");
}

function senderUrlFromIpcEvent(evt: any): string {
  if (!evt || typeof evt !== "object") return "";
  try {
    const sf = (evt as any).senderFrame;
    if (sf && typeof sf.url === "string") return sf.url;
  } catch {
    // ignore
  }
  try {
    const sender = (evt as any).sender;
    if (sender && typeof sender.getURL === "function") return sender.getURL() || "";
  } catch {
    // ignore
  }
  return "";
}

function assertTrustedIpcSender(evt: any) {
  const url = senderUrlFromIpcEvent(evt);
  if (isTrustedRendererUrl(url)) return;
  throw new Error(`Untrusted IPC sender (${url || "unknown"})`);
}

function isPlainObject(value: any): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function stripMarkdownCodeFences(raw: string): string {
  let s = String(raw || "").trim();
  if (!s) return "";
  // Strip a single wrapping ```...``` fence if present.
  s = s.replace(/^```[a-zA-Z0-9_-]*\s*/i, "").replace(/```$/i, "").trim();
  return s;
}

function tryParseJson(raw: string): any | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractJsonFromText(raw: string): any | null {
  const s = stripMarkdownCodeFences(raw);
  if (!s) return null;

  // Best case: model returns JSON only.
  const direct = tryParseJson(s);
  if (direct != null) return direct;

  // Fallback: look for a JSON object or array embedded in surrounding text.
  const objStart = s.indexOf("{");
  const objEnd = s.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    const parsed = tryParseJson(s.slice(objStart, objEnd + 1));
    if (parsed != null) return parsed;
  }

  const arrStart = s.indexOf("[");
  const arrEnd = s.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    const parsed = tryParseJson(s.slice(arrStart, arrEnd + 1));
    if (parsed != null) return parsed;
  }

  return null;
}

function normalizeGeneratedAction(parsed: any): { name: string; command: string } | null {
  let obj: any = parsed;
  if (Array.isArray(obj)) obj = obj[0];
  if (!isPlainObject(obj)) return null;

  const rawName = typeof obj.name === "string" ? obj.name.trim() : "";
  let command = typeof obj.command === "string" ? obj.command : "";
  command = command.replaceAll("\r\n", "\n").trimEnd();
  if (!command) return null;

  const MAX_NAME = 80;
  const MAX_CMD = 20_000;

  let name = rawName;
  if (!name) {
    const first = (command.split("\n")[0] || "").trim();
    name = first.slice(0, MAX_NAME) || "Action";
  }
  if (name.length > MAX_NAME) name = name.slice(0, MAX_NAME);
  if (command.length > MAX_CMD) command = command.slice(0, MAX_CMD);

  return { name, command };
}

type UiTextGenPlan = {
  ok: true;
  agent: "codex" | "claude";
  model: string;
  codexSettings: any;
  claudeSettings: any;
};

async function pickUiTextGenPlan(settings: any): Promise<UiTextGenPlan | { ok: false; error: string }> {
  const agents =
    settings && typeof settings === "object" && (settings as any).agents && typeof (settings as any).agents === "object"
      ? (settings as any).agents
      : {};
  const codexSettings = agents && typeof agents.codex === "object" ? agents.codex : {};
  const claudeSettings = agents && typeof agents.claude === "object" ? agents.claude : {};

  let binaries: any = null;
  try {
    binaries = await checkAgentBinaries(settings, { timeoutMs: 1200 });
  } catch {
    binaries = null;
  }
  const codexFound = !!(binaries && binaries.codex && binaries.codex.found);
  const claudeFound = !!(binaries && binaries.claude && binaries.claude.found);

  const uiModelRaw = settings && typeof settings === "object" ? String((settings as any).uiModel || "").trim() : "";
  const uiModelLow = uiModelRaw.toLowerCase();
  const uiAgent = uiModelRaw ? (uiModelLow === "opus" || uiModelLow === "sonnet" || uiModelLow === "haiku" ? "claude" : "codex") : "";
  const preferredAgent = uiAgent || "codex";

  let agent: "codex" | "claude" = "codex";
  if (preferredAgent === "claude" && claudeFound) agent = "claude";
  else if (preferredAgent === "codex" && codexFound) agent = "codex";
  else if (codexFound) agent = "codex";
  else if (claudeFound) agent = "claude";
  else return { ok: false, error: "No agent CLI found (install Codex and/or Claude, or set the binary path in Settings)." };

  let model = "";
  if (uiAgent === agent && uiModelRaw) {
    model = uiModelRaw;
  } else if (agent === "claude") {
    model = typeof claudeSettings.model === "string" ? String(claudeSettings.model || "").trim() : "";
  } else {
    model = typeof codexSettings.model === "string" ? String(codexSettings.model || "").trim() : "";
  }

  return { ok: true, agent, model, codexSettings, claudeSettings };
}

async function runUiTextPrompt(opts: {
  settings: any;
  codexSettings: any;
  claudeSettings: any;
  agent: "codex" | "claude";
  model: string;
  prompt: string;
}): Promise<string> {
  const { settings, codexSettings, claudeSettings, agent, model, prompt } = opts;
  if (agent === "claude") {
    const claudePath = resolveClaudeCliPathFromSettings(settings);
    const safeClaudeSettings = { ...(claudeSettings || {}), permissionMode: "plan", dangerouslySkipPermissions: false };
    return await runClaudeUiPrompt({
      claudePath,
      settings: safeClaudeSettings,
      projectPath: process.cwd(),
      model,
      prompt
    });
  }

  const codexPath = resolveCodexCliPathFromSettings(settings);
  const safeCodexSettings = {
    ...(codexSettings || {}),
    sandboxMode: "read-only",
    bypassApprovalsAndSandbox: false,
    skipGitRepoCheck: true
  };
  return await runCodexUiPrompt({
    codexPath,
    settings: safeCodexSettings,
    projectPath: process.cwd(),
    model,
    prompt
  });
}

function truncateCommitSubjectLine(s: string, max = 72): string {
  const str = String(s || "").replaceAll(/\s+/g, " ").trim();
  if (!str) return "";
  const m = Math.max(1, Math.trunc(max));
  if (str.length <= m) return str;
  const head = str.slice(0, m);
  for (let i = head.length - 1; i >= Math.floor(m * 0.6); i -= 1) {
    const ch = head[i];
    if (ch === " " || ch === "\t") return head.slice(0, i).trimEnd();
  }
  return head.trimEnd();
}

function normalizeGeneratedCommitSubject(raw: string): string {
  let s = stripMarkdownCodeFences(String(raw || "")).trim();
  if (!s) return "";

  const first = s
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => !!line);
  s = String(first || "").trim();
  if (!s) return "";

  s = s
    .replace(/^commit\s+message\s*:\s*/i, "")
    .replace(/^commit\s+subject\s*:\s*/i, "")
    .replace(/^subject\s*:\s*/i, "")
    .trim();

  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith("`") && s.endsWith("`"))
  ) {
    s = s.slice(1, -1).trim();
  }

  return truncateCommitSubjectLine(s, 72);
}

function buildCommitMessageGeneratorPrompt(opts: {
  style: "conventional" | "plain";
  changedPaths: string[];
  recentSubjects: string[];
  forceEnglish?: boolean;
}): string {
  const style = opts.style === "conventional" ? "conventional" : "plain";
  const forceEnglish = !!opts.forceEnglish;
  const changedPaths = Array.isArray(opts.changedPaths)
    ? opts.changedPaths.map((p) => String(p || "").trim()).filter(Boolean).slice(0, 180)
    : [];
  const recentSubjects = Array.isArray(opts.recentSubjects)
    ? opts.recentSubjects.map((s) => String(s || "").trim()).filter(Boolean).slice(0, 25)
    : [];

  const changedBlock = changedPaths.length > 0 ? changedPaths.map((p) => `- ${p}`).join("\n") : "- (no changed paths reported)";
  const recentBlock = recentSubjects.length > 0 ? recentSubjects.map((s) => `- ${s}`).join("\n") : "- (none)";
  const styleHint =
    style === "conventional"
      ? "Use Conventional Commits style: type(scope?): subject"
      : "Use a plain imperative subject line (no Conventional Commit prefix).";

  return [
    "You generate a single git commit subject line.",
    "",
    "Output format (STRICT):",
    "- Return ONLY the commit subject line.",
    "- No markdown, no code fences, no quotes, no explanations.",
    "- Max length: 72 characters.",
    "",
    "Rules:",
    `- ${styleHint}`,
    "- Base the subject on the actual file changes listed below.",
    "- Keep wording concise and specific.",
    forceEnglish
      ? "- Write the subject in English only (never use another language)."
      : "- Match the repository language/style from recent subjects when possible.",
    forceEnglish
      ? "- Use recent subjects only as style/format reference, not as language reference."
      : "- Prefer repository wording/style when possible.",
    "",
    "Changed files:",
    changedBlock,
    "",
    "Recent commit subjects (style reference):",
    recentBlock
  ].join("\n");
}

function buildActionGeneratorPrompt(opts: { userPrompt: string; platform: string; shell: string }): string {
  const userPrompt = String(opts.userPrompt || "").trim();
  const platform = String(opts.platform || "").trim();
  const shell = String(opts.shell || "").trim();

  return [
    "You generate a saved shell Action for an Electron desktop app.",
    "The action will be executed by pasting it into an interactive shell in the project's working directory (often a git repo).",
    "",
    "Environment:",
    `- platform: ${platform || "unknown"}`,
    `- shell: ${shell || "unknown"}`,
    "",
    "Task:",
    userPrompt,
    "",
    "Output format (STRICT):",
    "- Return ONLY valid JSON (no markdown, no commentary).",
    "- Shape: {\"name\":\"...\",\"command\":\"...\"}",
    "- \"name\": max 80 chars, same language as the task.",
    "- \"command\": shell command(s) to run. Use \\n for newlines inside the JSON string.",
    "",
    "Rules:",
    "- Do NOT run commands or inspect files; this is a text-only generation task.",
    "- Do NOT include triple backticks.",
    "- Avoid destructive commands unless explicitly asked.",
    "- Prefer safe defaults (e.g. no force-push).",
    "- If git commit is requested and no message is given, prefer opening the editor (git commit) over inventing a message."
  ].join("\n");
}

function claudeMessageToText(message: any): string {
  if (!message || typeof message !== "object") return "";
  const content = (message as any).content;
  if (typeof content === "string") return content;
  const blocks = Array.isArray(content) ? content : [];
  const parts: string[] = [];
  for (const b of blocks) {
    if (!b || typeof b !== "object") continue;
    if ((b as any).type === "text" && typeof (b as any).text === "string") parts.push((b as any).text);
  }
  return parts.join("");
}

function runCodexUiPrompt(opts: {
  codexPath: string;
  settings: any;
  projectPath: string;
  model: string;
  prompt: string;
}): Promise<string> {
  const { codexPath, settings, projectPath, model, prompt } = opts;
  return new Promise((resolve) => {
    let out = "";
    let resolved = false;

    const child = runCodexExec({
      codexPath,
      settings,
      projectPath,
      model,
      prompt,
      images: [],
      onEvent: (ev: any) => {
        if (!ev || ev.kind !== "codex") return;
        const data = ev.data || {};
        if (data.type === "item.completed" && data.item && data.item.type === "agent_message") {
          const text = typeof data.item.text === "string" ? data.item.text : "";
          if (text) out += (out ? "\n" : "") + text;
        }
      }
    });

    const timeout = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore
      }
      resolve(out);
    }, 25_000);

    child.once("error", () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      resolve(out);
    });
    child.once("close", () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      resolve(out);
    });
  });
}

function runClaudeUiPrompt(opts: {
  claudePath: string;
  settings: any;
  projectPath: string;
  model: string;
  prompt: string;
}): Promise<string> {
  const { claudePath, settings, projectPath, model, prompt } = opts;
  return new Promise((resolve) => {
    let out = "";
    let resolved = false;

    const child = runClaudeExec({
      claudePath,
      settings,
      projectPath,
      model,
      sessionId: randomUUID(),
      prompt,
      onEvent: (ev: any) => {
        if (!ev || ev.kind !== "claude") return;
        const data = ev.data || {};
        if (data.type === "assistant" && !data.parent_tool_use_id && data.message) {
          const text = claudeMessageToText(data.message);
          if (text) out += (out ? "\n" : "") + text;
        }
      }
    });

    const timeout = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      try {
        child.kill("SIGTERM");
      } catch {
        // ignore
      }
      resolve(out);
    }, 25_000);

    child.once("error", () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      resolve(out);
    });
    child.once("close", () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      resolve(out);
    });
  });
}

function maybeOpenExternal(rawUrl: unknown) {
  const u = safeParseUrl(rawUrl);
  if (!u) return;
  if (u.protocol !== "https:" && u.protocol !== "http:") return;
  try {
    void shell.openExternal(u.toString()).catch(() => {});
  } catch {
    // ignore
  }
}

function hardenWebContents(contents: WebContents) {
  if (!contents || contents.isDestroyed()) return;
  const isTrusted = () => {
    try {
      return isTrustedRendererUrl(contents.getURL());
    } catch {
      return false;
    }
  };

  // Block navigations away from the app UI (defense in depth; renderer also prevents link navigation).
  try {
    contents.on("will-navigate", (e: any, url: string) => {
      if (isTrustedRendererUrl(url)) return;
      if (!isTrusted()) return; // don't interfere with devtools / other non-app contents
      try {
        e.preventDefault();
      } catch {
        // ignore
      }
      maybeOpenExternal(url);
    });
  } catch {
    // ignore
  }

  // Also block frame navigations (e.g. if a future UI change introduces iframes).
  try {
    // Not all Electron typings include this event across versions; keep runtime behavior.
    (contents as any).on("will-frame-navigate", (e: any, url: string) => {
      if (isTrustedRendererUrl(url)) return;
      if (!isTrusted()) return;
      try {
        e.preventDefault();
      } catch {
        // ignore
      }
      maybeOpenExternal(url);
    });
  } catch {
    // ignore
  }

  // Block popups / window.open from the app UI.
  try {
    contents.setWindowOpenHandler(({ url }) => {
      if (!isTrusted()) return { action: "allow" as const };
      maybeOpenExternal(url);
      return { action: "deny" as const };
    });
  } catch {
    // ignore
  }

  // Explicitly deny <webview> usage even if a future change enables webviewTag.
  try {
    contents.on("will-attach-webview", (e: any) => {
      if (!isTrusted()) return;
      try {
        e.preventDefault();
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
}

function hardenSessionPermissions() {
  try {
    // Default-deny permissions. The app doesn't rely on camera/mic/geolocation/notifications/etc.
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler((_wc, _permission) => false);
  } catch {
    // ignore
  }
}

function setDockVisibility(settings: any) {
  if (process.platform !== "darwin") return;
  if (!app.dock) return;

  if (isMenuBarMode(settings)) {
    try {
      app.dock.hide();
    } catch {
      // ignore
    }
    return;
  }

  try {
    // show() returns a Promise on macOS.
    app.dock.show().catch(() => {});
  } catch {
    // ignore
  }
}

function setDevDockIcon() {
  if (process.platform !== "darwin") return;
  if (!app.dock) return;
  if (app.isPackaged) return;

  // In dev, Electron shows its default icon in the Dock unless we set one explicitly.
  // For packaged builds, the `.icns` is baked into the `.app` bundle by electron-builder.
  const iconPath = path.join(app.getAppPath(), "build-res", "icon.png");
  try {
    if (!fs.existsSync(iconPath)) return;
    app.dock.setIcon(iconPath);
  } catch {
    // ignore
  }
}

function setLoginItem(settings: any) {
  if (process.platform !== "darwin") return;
  if (!app.isPackaged) return;
  try {
    app.setLoginItemSettings({
      openAtLogin: !!(settings && settings.startAtLogin),
      openAsHidden: true
    });
  } catch {
    // ignore
  }
}

function applyNativeThemeFromSettings(settings: any) {
  const s = settings && typeof settings === "object" ? settings : {};
  const scheme = normalizeColorScheme(s.uiColorScheme);
  try {
    nativeTheme.themeSource = scheme;
  } catch {
    // ignore
  }
}

function pickCwdForEditorTarget(targetPath: string): string {
  const p = String(targetPath || "").trim();
  if (!p) return process.cwd();

  try {
    const st = fs.statSync(p);
    if (st.isDirectory()) return p;
  } catch {
    // ignore
  }

  const dir = path.dirname(p);
  if (!dir || dir === ".") return process.cwd();
  try {
    const st = fs.statSync(dir);
    if (st.isDirectory()) return dir;
  } catch {
    // ignore
  }

  return process.cwd();
}

export async function startApp(): Promise<void> {
  await app.whenReady();

  ensureMacAppMenu();

  app.on("web-contents-created", (_evt, contents) => {
    try {
      hardenWebContents(contents);
    } catch {
      // ignore
    }
  });
  hardenSessionPermissions();

  setDevDockIcon();

  const storePath = path.join(app.getPath("userData"), "agent-heaven.store.json");
  const store = new Store(storePath);
  store.load();

  const windowManager = new WindowManager({ getSettings: () => store.getSettings() });
  const trayManager = new TrayManager({
    windowManager,
    isMenuBarMode,
    onQuit: () => {
      windowManager.setWillQuit(true);
      app.quit();
    }
  });
  windowManager.setOnWindowsChanged(() => trayManager.updateTrayMenu());

  const hotkeyManager = new HotkeyManager({ windowManager, trayManager, getSettings: () => store.getSettings() });

  const jobsDir = path.join(app.getPath("userData"), "jobs");
  const checkoutsDir = path.join(app.getPath("userData"), "checkouts");
  const history = new JobHistory(jobsDir);
  const jobsManager = new JobsManager({
    store,
    history,
    checkoutsDir,
    sendJobEvent,
    runCodexExec,
    runCodexResume,
    runClaudeExec,
    runClaudeResume,
    needsAttentionHeuristic
  });
  const terminalManager = new TerminalManager();

  app.on("before-quit", () => {
    windowManager.setWillQuit(true);
    jobsManager.shutdown();
    terminalManager.shutdown();
  });
  app.on("will-quit", () => {
    try {
      hotkeyManager.dispose();
    } catch {
      // ignore
    }
    try {
      globalShortcut.unregisterAll();
    } catch {
      // ignore
    }
  });

  function applyRuntimeSettings(settings: any) {
    applyNativeThemeFromSettings(settings);
    windowManager.ensureWindows(settings);

    const bg = windowBgForSettings(settings, { systemScheme: nativeTheme.shouldUseDarkColors ? "dark" : "light" });
    for (const win of windowManager.liveWindows()) {
      try {
        win.setBackgroundColor(bg);
      } catch {
        // ignore
      }
    }

    setDockVisibility(settings);
    trayManager.ensureTray(settings);
    setLoginItem(settings);
    hotkeyManager.apply(settings);
    windowManager.wireAllWindows();
    trayManager.updateTrayMenu();
  }

  let codexModelsCache: { ts: number; codexPath: string; models: any[] } | null = null;
  function getCodexPathForTools() {
    return resolveCodexCliPathFromSettings(store.getSettings());
  }

  type ProjectPathIndexCacheEntry = { root: string; builtAt: number; relPaths: string[] };
  const projectPathIndexCache = new Map<string, ProjectPathIndexCacheEntry>();
  const PROJECT_PATH_CACHE_TTL_MS = 45_000;
  const PROJECT_PATH_SCAN_MAX_FILES = 40_000;
  const PROJECT_PATH_SCAN_MAX_DEPTH = 14;
  const PROJECT_PATH_SUGGEST_DEFAULT_LIMIT = 24;
  const PROJECT_PATH_SUGGEST_MAX_LIMIT = 100;
  const PATH_SUGGEST_SKIP_DIRS = new Set([
    ".git",
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".turbo",
    ".cache",
    ".idea",
    ".vscode",
    "tmp",
    "temp",
    "out"
  ]);

  function normalizePathSuggestQuery(raw: unknown): string {
    let q = typeof raw === "string" ? raw.trim() : "";
    if (!q) return "";
    q = q.replaceAll("\\", "/");
    while (q.startsWith("./")) q = q.slice(2);
    while (q.startsWith("/")) q = q.slice(1);
    while (q.startsWith("~/")) q = q.slice(2);
    while (q.startsWith("../")) q = q.slice(3);
    q = q.replaceAll(/\/{2,}/g, "/");
    return q;
  }

  function buildProjectPathIndex(projectRoot: string): string[] {
    const root = path.resolve(projectRoot);
    const out: string[] = [];
    const stack: Array<{ dir: string; depth: number }> = [{ dir: root, depth: 0 }];

    while (stack.length > 0 && out.length < PROJECT_PATH_SCAN_MAX_FILES) {
      const next = stack.pop();
      if (!next) break;

      let entries: fs.Dirent[] = [];
      try {
        entries = fs.readdirSync(next.dir, { withFileTypes: true });
      } catch {
        entries = [];
      }
      if (entries.length === 0) continue;
      entries.sort((a, b) => a.name.localeCompare(b.name));

      for (const de of entries) {
        if (!de || typeof de.name !== "string" || !de.name) continue;
        const lowName = de.name.toLowerCase();
        if (de.isDirectory() && PATH_SUGGEST_SKIP_DIRS.has(lowName)) continue;

        const absPath = path.join(next.dir, de.name);
        const relRaw = path.relative(root, absPath);
        if (!relRaw || relRaw.startsWith("..")) continue;
        const relPath = relRaw.split(path.sep).join("/");

        if (de.isDirectory()) {
          if (next.depth + 1 <= PROJECT_PATH_SCAN_MAX_DEPTH) {
            stack.push({ dir: absPath, depth: next.depth + 1 });
          }
          continue;
        }

        if (!de.isFile()) continue;
        out.push(relPath);
        if (out.length >= PROJECT_PATH_SCAN_MAX_FILES) break;
      }
    }

    return out;
  }

  function getProjectPathIndex(projectId: string, projectRoot: string): string[] {
    const id = String(projectId || "").trim();
    if (!id) return [];
    const root = path.resolve(projectRoot);
    const now = Date.now();
    const cached = projectPathIndexCache.get(id);
    if (cached && cached.root === root && now - cached.builtAt < PROJECT_PATH_CACHE_TTL_MS) return cached.relPaths;
    const relPaths = buildProjectPathIndex(root);
    projectPathIndexCache.set(id, { root, builtAt: now, relPaths });
    return relPaths;
  }

  function suggestProjectPaths(relPaths: string[], rawQuery: string, rawLimit: unknown): string[] {
    const limitNum = Number(rawLimit);
    const limitBase = Number.isFinite(limitNum) ? Math.floor(limitNum) : PROJECT_PATH_SUGGEST_DEFAULT_LIMIT;
    const limit = Math.max(1, Math.min(PROJECT_PATH_SUGGEST_MAX_LIMIT, limitBase || PROJECT_PATH_SUGGEST_DEFAULT_LIMIT));
    const q = normalizePathSuggestQuery(rawQuery).toLowerCase();

    const scored: Array<{ path: string; score: number }> = [];
    for (const relPath of relPaths) {
      const p = String(relPath || "");
      if (!p) continue;

      const low = p.toLowerCase();
      const base = low.slice(low.lastIndexOf("/") + 1);

      let score = -1;
      if (!q) score = 0;
      else if (low.startsWith(q)) score = 0;
      else if (base.startsWith(q)) score = 1;
      else if (low.includes(`/${q}`)) score = 2;
      else if (low.includes(q)) score = 3;
      if (score < 0) continue;

      scored.push({ path: p, score });
    }

    scored.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (a.path.length !== b.path.length) return a.path.length - b.path.length;
      return a.path.localeCompare(b.path);
    });

    return scored.slice(0, limit).map((it) => it.path);
  }

  ipcMain.handle("settings:get", async (evt) => {
    assertTrustedIpcSender(evt);
    return store.getSettings();
  });
  ipcMain.handle("settings:update", async (evt, patch) => {
    assertTrustedIpcSender(evt);
    const next = store.updateSettings(patch || {});
    applyRuntimeSettings(next);
    sendSettingsChanged(next);
    return next;
  });

  ipcMain.handle("actions:generate", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const userPrompt = typeof p.prompt === "string" ? p.prompt.trim() : "";
    if (!userPrompt) return { ok: false, error: "Missing prompt" };
    if (userPrompt.length > 4000) return { ok: false, error: "Prompt too long" };

    const settings = store.getSettings();
    const plan = await pickUiTextGenPlan(settings);
    if (!plan.ok) return plan;
    const { agent, model, codexSettings, claudeSettings } = plan;

    const shellPath =
      process.platform === "win32"
        ? "powershell.exe"
        : (typeof process.env.SHELL === "string" && process.env.SHELL.trim()) ||
          (process.platform === "darwin" ? "/bin/zsh" : "/bin/bash");

    const prompt = buildActionGeneratorPrompt({ userPrompt, platform: process.platform, shell: shellPath });

    try {
      const raw = await runUiTextPrompt({
        settings,
        codexSettings,
        claudeSettings,
        agent,
        model,
        prompt
      });

      const parsed = extractJsonFromText(raw || "");
      const action = normalizeGeneratedAction(parsed);
      if (!action) {
        const preview = stripMarkdownCodeFences(String(raw || "")).trim();
        const clipped = preview.length > 800 ? `${preview.slice(0, 800).trimEnd()}…` : preview;
        return { ok: false, error: `Model did not return a valid action JSON.${clipped ? ` Output:\n\n${clipped}` : ""}` };
      }

      return { ok: true, action };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("shell:openExternal", async (evt, rawUrl) => {
    assertTrustedIpcSender(evt);
    const s = String(rawUrl || "").trim();
    if (!s) return { ok: false, error: "Missing url" };

    let u: URL;
    try {
      u = new URL(s);
    } catch {
      return { ok: false, error: "Invalid url" };
    }

    if (u.protocol !== "https:" && u.protocol !== "http:") return { ok: false, error: "Blocked url protocol" };

    try {
      await shell.openExternal(u.toString());
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("shell:openPath", async (evt, rawPath) => {
    assertTrustedIpcSender(evt);
    const p = String(rawPath || "").trim();
    if (!p) return { ok: false, error: "Missing path" };

    try {
      const errMsg = await shell.openPath(p);
      if (errMsg) return { ok: false, error: errMsg };
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("editor:openPath", async (evt, rawPath) => {
    assertTrustedIpcSender(evt);
    const targetPath = String(rawPath || "").trim();
    if (!targetPath) return { ok: false, error: "Missing path" };

    const settings = store.getSettings();
    const editorCommand = settings && typeof settings === "object" ? String((settings as any).editorCommand || "").trim() : "";
    if (!editorCommand) {
      return { ok: false, error: "No editor configured. Set one in Settings -> UI -> Editor command." };
    }

    try {
      const child = spawnPlatform(editorCommand, [targetPath], {
        cwd: pickCwdForEditorTarget(targetPath),
        detached: true,
        stdio: "ignore",
        windowsHide: true
      });

      return await new Promise((resolve) => {
        let settled = false;
        const finish = (payload: any) => {
          if (settled) return;
          settled = true;
          resolve(payload);
        };

        child.once("error", (err: any) => {
          finish({ ok: false, error: String(err && err.message ? err.message : err) });
        });

        try {
          child.unref();
        } catch {
          // ignore
        }

        setTimeout(() => finish({ ok: true }), 80);
      });
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("agents:checkBinaries", async (evt) => {
    assertTrustedIpcSender(evt);
    try {
      const res = await checkAgentBinaries(store.getSettings(), { timeoutMs: 2500 });
      return { ok: true, ...res };
    } catch (err: any) {
      return { ok: true, checkedAt: new Date().toISOString(), error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("agents:install", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    try {
      const p = payload && typeof payload === "object" ? (payload as any) : {};
      const res = await installAgentCli(p.agent, { method: p.method, timeoutMs: p.timeoutMs });
      return { ok: true, ...res };
    } catch (err: any) {
      return { ok: true, finishedAt: new Date().toISOString(), error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("codex:listModels", async (evt) => {
    assertTrustedIpcSender(evt);
    const codexPath = getCodexPathForTools();
    const now = Date.now();
    if (codexModelsCache && codexModelsCache.codexPath === codexPath && now - codexModelsCache.ts < 5 * 60 * 1000) {
      return { ok: true, models: codexModelsCache.models, cached: true };
    }

    try {
      const models = await listCodexModels({ codexPath, timeoutMs: 12_000 });
      codexModelsCache = { ts: now, codexPath, models };
      return { ok: true, models, cached: false };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  ipcMain.handle("window:listDisplays", async (evt) => {
    assertTrustedIpcSender(evt);
    return { ok: true, displays: windowManager.listDisplays() };
  });

  ipcMain.handle("window:moveToDisplay", async (evt, displayId) => {
    assertTrustedIpcSender(evt);
    const win = BrowserWindow.fromWebContents(evt.sender);
    if (!win) return { ok: false, error: "Unknown window" };
    const ok = windowManager.moveWindowToDisplay(win, displayId);
    if (!ok) return { ok: false, error: "Unknown display" };
    return { ok: true };
  });

  ipcMain.handle("window:openLane", async (evt, lane, displayId) => {
    assertTrustedIpcSender(evt);
    return windowManager.openLane(lane, displayId);
  });

  ipcMain.handle("window:openJob", async (evt, jobId, displayId) => {
    assertTrustedIpcSender(evt);
    const id = String(jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };
    if (!jobsManager.hasJob(id)) return { ok: false, error: "Unknown job" };
    return windowManager.openJob(id, displayId);
  });

  ipcMain.handle("projects:list", async (evt) => {
    assertTrustedIpcSender(evt);
    const projects = store.listProjects();
    const augmented = await Promise.all(
      projects.map(async (p: any) => {
        const projectPath = p && typeof p.path === "string" ? p.path : "";
        const info = projectPath ? await getGitInfo(projectPath) : { isGitRepo: false, branch: "", sha: "", detached: false, dirty: false, error: "Missing path" };
        return {
          ...p,
          gitBranch: info.branch,
          gitSha: info.sha,
          gitDetached: info.detached,
          gitDirty: info.dirty,
          gitError: typeof info.error === "string" ? info.error : ""
        };
      })
    );
    return augmented;
  });
  ipcMain.handle("projects:addDialog", async (evt) => {
    assertTrustedIpcSender(evt);
    const parent = BrowserWindow.getFocusedWindow() || windowManager.getMainWindow();
    const options: OpenDialogOptions = { properties: ["openDirectory", "createDirectory"] };
    const res = parent ? await dialog.showOpenDialog(parent, options) : await dialog.showOpenDialog(options);
    if (res.canceled || !res.filePaths || res.filePaths.length === 0) return null;
    const dirPath = res.filePaths[0];
    const name = path.basename(dirPath);
    let defaultBranch = "";
    try {
      defaultBranch = await detectDefaultBranch(dirPath);
    } catch {
      defaultBranch = "";
    }
    const project = store.addProject({ id: newId(), name, path: dirPath, defaultBranch, checkoutMode: "inplace" });
    return project;
  });
  ipcMain.handle("projects:addTemporary", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const rawBaseDir = typeof p.baseDir === "string" ? p.baseDir.trim() : "";
    const baseDir = rawBaseDir ? path.resolve(rawBaseDir) : path.join(app.getPath("userData"), "temp-projects");
    const prefix = normalizeTemporaryProjectPrefix(p.prefix || p.name || "temp");
    fs.mkdirSync(baseDir, { recursive: true });

    let dirPath = "";
    let name = "";
    for (let i = 0; i < 25; i += 1) {
      const ts = temporaryProjectTimestamp(new Date());
      const suffix = randomUUID().slice(0, 8);
      const candidateName = `${prefix}-${ts}-${suffix}`;
      const candidatePath = path.join(baseDir, candidateName);
      try {
        fs.mkdirSync(candidatePath, { recursive: false });
        dirPath = candidatePath;
        name = candidateName;
        break;
      } catch (err: any) {
        if (err && err.code === "EEXIST") continue;
        throw err;
      }
    }
    if (!dirPath || !name) throw new Error("Could not create temporary project folder");

    const project = store.addProject({
      id: newId(),
      name,
      path: dirPath,
      checkoutMode: "inplace",
      isTemporary: true,
      temporaryCreatedAt: new Date().toISOString(),
      temporaryBaseDir: baseDir
    });
    return project;
  });
  ipcMain.handle("projects:gitInfo", async (evt, projectId) => {
    assertTrustedIpcSender(evt);
    const id = String(projectId || "").trim();
    if (!id) return { ok: false, error: "Missing projectId" };
    const project = store.listProjects().find((p: any) => p && p.id === id) || null;
    if (!project) return { ok: false, error: "Project not found" };
    const projectPath = typeof project.path === "string" ? project.path : "";
    const info = projectPath ? await getGitInfo(projectPath) : { isGitRepo: false, branch: "", sha: "", detached: false, dirty: false, error: "Missing path" };
    return { ok: true, info };
  });
  ipcMain.handle("projects:switchBranch", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const id = String(p.projectId || "").trim();
    const branch = String(p.branch || "").trim();
    if (!id) return { ok: false, error: "Missing projectId" };
    if (!branch) return { ok: false, error: "Missing branch" };
    const project = store.listProjects().find((x: any) => x && x.id === id) || null;
    if (!project) return { ok: false, error: "Project not found" };
    const projectPath = typeof project.path === "string" ? project.path : "";
    if (!projectPath) return { ok: false, error: "Missing project path" };
    try {
      await switchBranch(projectPath, branch);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });
  function parseProjectRemovePayload(payload: any): { id: string; deleteFolder: boolean } {
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      return {
        id: String((payload as any).id || "").trim(),
        deleteFolder: !!(payload as any).deleteFolder
      };
    }
    return {
      id: String(payload || "").trim(),
      deleteFolder: false
    };
  }

  function tryDeleteTemporaryProjectFolder(project: any): boolean {
    if (!project || typeof project !== "object" || !project.isTemporary) return false;

    const projectPathRaw = typeof project.path === "string" ? project.path.trim() : "";
    if (!projectPathRaw) return false;

    const projectPath = path.resolve(projectPathRaw);
    const parsed = path.parse(projectPath);
    if (!parsed.root || projectPath === parsed.root) return false;

    const rawBase = typeof project.temporaryBaseDir === "string" ? project.temporaryBaseDir.trim() : "";
    const baseDir = path.resolve(rawBase || path.join(app.getPath("userData"), "temp-projects"));
    if (!isPathWithinRoot(baseDir, projectPath)) return false;

    try {
      fs.rmSync(projectPath, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 });
      return true;
    } catch {
      return false;
    }
  }

  ipcMain.handle("projects:remove", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const parsed = parseProjectRemovePayload(payload);
    const projectId = parsed.id;
    if (projectId) projectPathIndexCache.delete(projectId);

    const project = store.listProjects().find((p: any) => p && p.id === projectId) || null;
    const removed = store.removeProject(projectId || payload);
    if (removed && parsed.deleteFolder && project && project.isTemporary) {
      tryDeleteTemporaryProjectFolder(project);
    }
    return removed;
  });
  ipcMain.handle("projects:update", async (evt, { id, patch }) => {
    assertTrustedIpcSender(evt);
    const projectId = String(id || "").trim();
    if (projectId) projectPathIndexCache.delete(projectId);
    return store.updateProject(projectId || id, patch || {});
  });
  ipcMain.handle("projects:suggestPaths", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const projectId = String(p.projectId || "").trim();
    if (!projectId || projectId === "auto") return { ok: true, items: [] };

    const project = store.listProjects().find((x: any) => x && x.id === projectId) || null;
    if (!project) return { ok: false, error: "Project not found" };
    const projectRoot = typeof project.path === "string" ? project.path.trim() : "";
    if (!projectRoot) return { ok: true, items: [] };
    if (!fs.existsSync(projectRoot)) return { ok: true, items: [] };

    try {
      const relPaths = getProjectPathIndex(projectId, projectRoot);
      const matched = suggestProjectPaths(relPaths, p.query, p.limit);
      const items: Array<{ path: string; absPath: string }> = [];
      for (const relPath of matched) {
        const absPath = path.resolve(projectRoot, relPath);
        if (!isPathWithinRoot(projectRoot, absPath)) continue;
        items.push({ path: relPath, absPath });
      }
      return { ok: true, items };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  function isPathWithinRoot(root: string, target: string): boolean {
    const r = path.resolve(root);
    const t = path.resolve(target);
    const rr = r.endsWith(path.sep) ? r : `${r}${path.sep}`;
    return t === r || t.startsWith(rr);
  }

  ipcMain.handle("checkouts:list", async (evt, projectId) => {
    assertTrustedIpcSender(evt);
    const id = String(projectId || "").trim();
    if (!id) return { ok: false, error: "Missing projectId" };

    const project = store.listProjects().find((p: any) => p && p.id === id) || null;
    if (!project) return { ok: false, error: "Project not found" };

    const root = path.resolve(checkoutsDir);
    const entries: any[] = [];
    const kinds: Array<{ kind: "worktree" | "clone"; dirName: string }> = [
      { kind: "worktree", dirName: "worktrees" },
      { kind: "clone", dirName: "clones" }
    ];

    for (const k of kinds) {
      const dir = path.join(root, k.dirName, id);
      try {
        if (!fs.existsSync(dir)) continue;
        const children = fs.readdirSync(dir, { withFileTypes: true });
        for (const de of children) {
          if (!de.isDirectory()) continue;
          const jobId = de.name;
          const p = path.join(dir, jobId);
          let st: any = null;
          try {
            st = fs.statSync(p);
          } catch {
            st = null;
          }
          entries.push({
            kind: k.kind,
            projectId: id,
            jobId,
            path: p,
            mtimeMs: st && typeof st.mtimeMs === "number" ? st.mtimeMs : 0
          });
        }
      } catch {
        // ignore
      }
    }

    entries.sort((a, b) => (Number(b.mtimeMs) || 0) - (Number(a.mtimeMs) || 0));
    return { ok: true, entries };
  });

  ipcMain.handle("checkouts:remove", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const projectId = String(p.projectId || "").trim();
    const kind = String(p.kind || "").trim();
    const jobId = String(p.jobId || "").trim();
    if (!projectId) return { ok: false, error: "Missing projectId" };
    if (!jobId) return { ok: false, error: "Missing jobId" };
    if (kind !== "worktree" && kind !== "clone") return { ok: false, error: "Invalid kind" };

    const project = store.listProjects().find((x: any) => x && x.id === projectId) || null;
    if (!project) return { ok: false, error: "Project not found" };
    const projectPath = typeof project.path === "string" ? project.path : "";
    if (!projectPath) return { ok: false, error: "Missing project path" };

    const root = path.resolve(checkoutsDir);
    const sub = kind === "worktree" ? "worktrees" : "clones";
    const target = path.resolve(root, sub, projectId, jobId);
    if (!isPathWithinRoot(root, target)) return { ok: false, error: "Invalid checkout path" };

    try {
      if (kind === "clone") {
        fs.rmSync(target, { recursive: true, force: true });
        return { ok: true };
      }

      // worktree: remove via git to keep metadata consistent
      try {
        if (fs.existsSync(target)) await removeWorktree({ repoDir: projectPath, worktreeDir: target });
      } catch (err: any) {
        if (fs.existsSync(target)) throw err;
      }

      // Best-effort: ensure the dir is gone.
      try {
        fs.rmSync(target, { recursive: true, force: true });
      } catch {
        // ignore
      }

      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  });

  function normalizeBranchName(value: unknown): string {
    const s = typeof value === "string" ? value.trim() : "";
    if (!s) return "";
    const stripped = s.startsWith("origin/") ? s.slice("origin/".length) : s;
    return stripped.slice(0, 200);
  }

  ipcMain.handle("checkouts:suggestCommitMessage", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const jobId = String(p.jobId || "").trim();
    const forceEnglish = !!p.forceEnglish;
    if (!jobId) return { ok: false, error: "Missing jobId" };

    const got = jobsManager.getJob(jobId);
    if (!got || typeof got !== "object" || (got as any).ok !== true) return got;
    const job = (got as any).job || {};

    const sourceDir = typeof job.projectPath === "string" ? job.projectPath.trim() : "";
    if (!sourceDir) return { ok: false, error: "Job is missing projectPath" };
    if (!fs.existsSync(sourceDir)) return { ok: false, error: `Checkout path does not exist: ${sourceDir}` };

    const info = await getGitInfo(sourceDir);
    if (!info.isGitRepo) return { ok: false, error: `Checkout is not a git repo: ${sourceDir}` };

    let changedPaths: string[] = [];
    try {
      changedPaths = await listChangedPaths(sourceDir);
    } catch {
      changedPaths = [];
    }

    let recentSubjects: string[] = [];
    try {
      recentSubjects = await listRecentCommitSubjects(sourceDir, 30);
    } catch {
      recentSubjects = [];
    }

    const style = inferCommitMessageStyleFromSubjects(recentSubjects);
    const heuristicFallback = suggestCommitMessage({
      style,
      changedPaths,
      taskText: "",
      // Keep integrate-flow suggestions language-stable (English), independent of localized job titles/prompts.
      allowTaskContext: false
    });

    let suggestion = heuristicFallback;
    try {
      const settings = store.getSettings();
      const plan = await pickUiTextGenPlan(settings);
      if (plan.ok) {
        const prompt = buildCommitMessageGeneratorPrompt({
          style,
          changedPaths,
          recentSubjects,
          forceEnglish
        });
        const raw = await runUiTextPrompt({
          settings,
          codexSettings: plan.codexSettings,
          claudeSettings: plan.claudeSettings,
          agent: plan.agent,
          model: plan.model,
          prompt
        });
        const llmSuggestion = normalizeGeneratedCommitSubject(raw);
        if (llmSuggestion) suggestion = llmSuggestion;
      }
    } catch {
      // Keep fallback suggestion.
    }

    return { ok: true, suggestion };
  });

  ipcMain.handle("checkouts:commit", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const jobId = String(p.jobId || "").trim();
    const commitMessage = typeof p.commitMessage === "string" ? p.commitMessage.trim() : "";
    const push = !!p.push;
    if (!jobId) return { ok: false, error: "Missing jobId" };
    if (!commitMessage) return { ok: false, error: "Missing commit message" };

    const got = jobsManager.getJob(jobId);
    if (!got || typeof got !== "object" || (got as any).ok !== true) return got;
    const job = (got as any).job || {};

    const sourceDir = typeof job.projectPath === "string" ? job.projectPath.trim() : "";
    if (!sourceDir) return { ok: false, error: "Job is missing projectPath" };
    if (!fs.existsSync(sourceDir)) return { ok: false, error: `Checkout path does not exist: ${sourceDir}` };

    const info = await getGitInfo(sourceDir);
    if (!info.isGitRepo) return { ok: false, error: `Checkout is not a git repo: ${sourceDir}` };
    if (!info.dirty) return { ok: false, error: "No local changes to commit." };
    if (push && info.detached) return { ok: false, error: "Cannot push from detached HEAD. Switch to a branch first." };

    let committedSha = "";
    try {
      await addAll(sourceDir);
      committedSha = await commitWithMessage(sourceDir, commitMessage);
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }

    if (!push) {
      return {
        ok: true,
        committedSha,
        pushed: false,
        branch: info.branch || "",
        remote: "",
        upstreamRef: "",
        setUpstream: false
      };
    }

    try {
      const pushRes = await pushCurrentBranch(sourceDir);
      return {
        ok: true,
        committedSha,
        pushed: true,
        branch: pushRes.branch || info.branch || "",
        remote: pushRes.remote || "",
        upstreamRef: pushRes.upstreamRef || "",
        setUpstream: !!pushRes.setUpstream
      };
    } catch (err: any) {
      const msg = String(err && err.message ? err.message : err);
      return {
        ok: false,
        error: `Committed ${committedSha}, but push failed.\n\n${msg}`
      };
    }
  });

  ipcMain.handle("checkouts:integrateToDefault", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const jobId = String(p.jobId || "").trim();
    const commitMessage = typeof p.commitMessage === "string" ? p.commitMessage.trim() : "";
    if (!jobId) return { ok: false, error: "Missing jobId" };

    const got = jobsManager.getJob(jobId);
    if (!got || typeof got !== "object" || (got as any).ok !== true) return got;
    const job = (got as any).job || {};

    const projectId = String(job.projectId || "").trim();
    if (!projectId) return { ok: false, error: "Job is missing projectId" };
    const project = store.listProjects().find((x: any) => x && x.id === projectId) || null;
    if (!project) return { ok: false, error: "Project not found" };

    const sourceDir = typeof job.projectPath === "string" ? job.projectPath.trim() : "";
    if (!sourceDir) return { ok: false, error: "Job is missing projectPath" };
    if (!fs.existsSync(sourceDir)) return { ok: false, error: `Checkout path does not exist: ${sourceDir}` };

    const projectPath = typeof (project as any).path === "string" ? String((project as any).path || "").trim() : "";
    if (!projectPath) return { ok: false, error: "Project is missing path" };
    if (!fs.existsSync(projectPath)) return { ok: false, error: `Project path does not exist: ${projectPath}` };

    // If this job ran in-place in the project folder, there is nothing to integrate.
    if (path.resolve(sourceDir) === path.resolve(projectPath)) {
      return { ok: false, error: "This job is using the project folder checkout (in-place). Nothing to integrate." };
    }

    const configuredBranch = normalizeBranchName((project as any).defaultBranch);
    let targetBranch = configuredBranch;
    if (!targetBranch) {
      try {
        targetBranch = await detectDefaultBranch(projectPath);
      } catch {
        targetBranch = "";
      }
    }
    if (!targetBranch) {
      return {
        ok: false,
        error: 'Could not detect default branch. Set it in Project settings ("Default branch").'
      };
    }

    // Prefer the worktree where the default branch is actually checked out (avoids switching a random worktree).
    let targetDir = projectPath;
    try {
      const wt = await findWorktreePathForBranch(projectPath, targetBranch);
      if (wt) targetDir = wt;
    } catch {
      // ignore; fall back to projectPath
    }

    const srcInfo = await getGitInfo(sourceDir);
    if (!srcInfo.isGitRepo) return { ok: false, error: `Checkout is not a git repo: ${sourceDir}` };

    const tgtInfo = await getGitInfo(targetDir);
    if (!tgtInfo.isGitRepo) return { ok: false, error: `Default-branch checkout is not a git repo: ${targetDir}` };

    // Safety: only support same-repo worktrees (clone checkouts have separate object DBs).
    try {
      const srcCommon = await getGitCommonDir(sourceDir);
      const tgtCommon = await getGitCommonDir(targetDir);
      if (!srcCommon || !tgtCommon || srcCommon !== tgtCommon) {
        return {
          ok: false,
          error:
            "This checkout does not share git objects with the project's checkout (likely a clone). Automatic integration isn't supported yet."
        };
      }
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }

    if (tgtInfo.dirty) {
      return {
        ok: false,
        error: `Default-branch checkout has uncommitted changes. Commit/stash them first:\n\n  ${targetDir}`
      };
    }
    if (tgtInfo.detached) {
      return {
        ok: false,
        error: `Default-branch checkout is in detached HEAD (${tgtInfo.sha || "?"}). Switch to ${targetBranch} first:\n\n  ${targetDir}`
      };
    }

    // Best-effort: ensure we're on the target branch in the chosen target worktree.
    if (tgtInfo.branch !== targetBranch) {
      try {
        await switchBranch(targetDir, targetBranch);
      } catch (err: any) {
        return {
          ok: false,
          error: `Failed to switch default checkout to ${targetBranch}:\n\n  ${targetDir}\n\n${String(err && err.message ? err.message : err)}`
        };
      }
    }

    let committed = false;
    let committedSha = "";
    if (srcInfo.dirty) {
      if (!commitMessage) return { ok: false, error: "Checkout has uncommitted changes. Provide a commit message first." };
      try {
        await addAll(sourceDir);
        committedSha = await commitWithMessage(sourceDir, commitMessage);
        committed = true;
      } catch (err: any) {
        return { ok: false, error: String(err && err.message ? err.message : err) };
      }
    }

    let commits: string[] = [];
    try {
      commits = await listCommitsInRange(sourceDir, `${targetBranch}..HEAD`, { noMerges: true });
    } catch (err: any) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }

    if (commits.length === 0) {
      // Mark as integrated only when this action actually created a commit.
      // For pure no-op runs ("nothing to integrate"), keep the merged badge hidden.
      if (committed) {
        jobsManager.setIntegratedToDefault(jobId, { at: new Date().toISOString(), branch: targetBranch });
      }
      return {
        ok: true,
        targetPath: targetDir,
        targetBranch,
        commitsApplied: 0,
        committed,
        committedSha
      };
    }

    try {
      await cherryPick(targetDir, commits);
      jobsManager.setIntegratedToDefault(jobId, { at: new Date().toISOString(), branch: targetBranch });
      return {
        ok: true,
        targetPath: targetDir,
        targetBranch,
        commitsApplied: commits.length,
        committed,
        committedSha
      };
    } catch (err: any) {
      const msg = String(err && err.message ? err.message : err);
      return {
        ok: false,
        error:
          `Cherry-pick failed in:\n\n  ${targetDir}\n\n` +
          `${msg}\n\n` +
          `Resolve conflicts, then run:\n\n  git cherry-pick --continue\n\n(or abort with: git cherry-pick --abort)`
      };
    }
  });

  ipcMain.handle("jobs:list", async (evt) => {
    assertTrustedIpcSender(evt);
    try {
      await jobsManager.reconcileIntegratedToDefault();
    } catch {
      // Best-effort only; stale flags should never break listing jobs.
    }
    return jobsManager.listJobMetas();
  });

  ipcMain.handle("jobs:search", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const query = p.query;
    const opts = p.opts && typeof p.opts === "object" ? p.opts : {};
    const rawLimit = typeof opts.limit === "number" ? opts.limit : Number(opts.limit);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(800, Math.trunc(rawLimit))) : undefined;
    const res = jobsManager.search(query, { includeLogs: opts.includeLogs, limit });
    return { ok: true, ...res };
  });

  ipcMain.handle("jobs:get", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    try {
      await jobsManager.reconcileIntegratedToDefault(jobId);
    } catch {
      // Best-effort only; stale flags should never break opening a job.
    }
    return jobsManager.getJob(jobId);
  });
  ipcMain.handle("jobs:start", async (evt, params) => {
    assertTrustedIpcSender(evt);
    return jobsManager.start(params);
  });
  ipcMain.handle("jobs:send", async (evt, { jobId, prompt, images }) => {
    assertTrustedIpcSender(evt);
    return jobsManager.send({ jobId, prompt, images });
  });
  ipcMain.handle("jobs:archive", async (evt, payload) => {
    assertTrustedIpcSender(evt);
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    return jobsManager.archive({ jobId: p.jobId, reason: p.reason });
  });
  ipcMain.handle("jobs:trash", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    return jobsManager.trash(jobId);
  });
  ipcMain.handle("jobs:restore", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    return jobsManager.restore(jobId);
  });
  ipcMain.handle("jobs:delete", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    const res = jobsManager.delete(jobId);
    if (res && typeof res === "object" && (res as any).ok) terminalManager.destroy(jobId);
    return res;
  });
  ipcMain.handle("jobs:cancel", async (evt, jobId) => {
    assertTrustedIpcSender(evt);
    return jobsManager.cancel(jobId);
  });

  ipcMain.handle("term:ensure", async (evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    const id = String(p.jobId || "").trim();
    if (!id) return { ok: false, error: "Missing jobId" };

    const got = jobsManager.getJob(id);
    if (!got || typeof got !== "object" || (got as any).ok !== true) return got;

    const job = (got as any).job || {};
    const cwd = typeof job.projectPath === "string" && job.projectPath.trim() ? job.projectPath.trim() : process.cwd();
    return terminalManager.ensure(id, { cwd, cols: p.cols, rows: p.rows, webContentsId: evt.sender.id });
  });

  ipcMain.handle("term:write", async (_evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    return terminalManager.write(p.jobId, p.data);
  });

  ipcMain.handle("term:resize", async (_evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    return terminalManager.resize(p.jobId, p.cols, p.rows);
  });

  ipcMain.handle("term:detach", async (evt, payload) => {
    const p = payload && typeof payload === "object" ? (payload as any) : {};
    return terminalManager.detach(p.jobId, evt.sender.id);
  });

  applyRuntimeSettings(store.getSettings());

  // If the user selected "system", keep window backgrounds in sync with OS theme changes.
  nativeTheme.on("updated", () => {
    const s = store.getSettings();
    if (normalizeColorScheme(s && typeof s === "object" ? (s as any).uiColorScheme : "") !== "system") return;
    const bg = windowBgForSettings(s, { systemScheme: nativeTheme.shouldUseDarkColors ? "dark" : "light" });
    for (const win of windowManager.liveWindows()) {
      try {
        win.setBackgroundColor(bg);
      } catch {
        // ignore
      }
    }
  });

  startDevLiveReload({ sendDevNotice, isMainRestartSafe: () => !jobsManager.hasRunningJobs() });

  let displayEnsureTimer: NodeJS.Timeout | null = null;
  function scheduleEnsureWindowsForDisplays() {
    if (displayEnsureTimer) clearTimeout(displayEnsureTimer);
    displayEnsureTimer = setTimeout(() => {
      displayEnsureTimer = null;
      const s = store.getSettings();
      if (!s || !s.openOnAllDisplays) return;
      windowManager.ensureWindows(s);
      trayManager.updateTrayMenu();
    }, 200);
  }
  screen.on("display-added", () => scheduleEnsureWindowsForDisplays());
  screen.on("display-removed", () => scheduleEnsureWindowsForDisplays());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      applyRuntimeSettings(store.getSettings());
      return;
    }
    windowManager.showAllWindows();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
