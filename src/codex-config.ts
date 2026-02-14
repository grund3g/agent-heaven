import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

type CachedModel = { path: string; mtimeMs: number; model: string } | null;
let CACHE: CachedModel = null;

function stripTomlInlineComment(value: string): string {
  // Remove `# ...` only when it's outside of quotes.
  const s = typeof value === "string" ? value : "";
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (inDouble && ch === "\\") {
      i += 1; // skip escaped char
      continue;
    }
    if (!inSingle && ch === "\"") {
      inDouble = !inDouble;
      continue;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && !inDouble && ch === "#") {
      return s.slice(0, i).trimEnd();
    }
  }
  return s.trimEnd();
}

function parseTomlStringValue(raw: string): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return "";

  // TOML strings are quoted; accept a few common forms.
  if (s.startsWith("\"") && s.endsWith("\"")) {
    try {
      const parsed = JSON.parse(s);
      return typeof parsed === "string" ? parsed : "";
    } catch {
      return s.slice(1, -1);
    }
  }
  if (s.startsWith("'") && s.endsWith("'")) {
    return s.slice(1, -1);
  }

  // Not a string literal; keep as-is (best-effort).
  return s;
}

export function parseTopLevelCodexModelFromConfigToml(text: string): string {
  const src = typeof text === "string" ? text : "";
  if (!src.trim()) return "";

  let inRoot = true;
  for (const line of src.split(/\r?\n/g)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("[")) {
      // Once a table starts, remaining kv-pairs belong to a table in valid TOML.
      inRoot = false;
      continue;
    }

    if (!inRoot) continue;

    const m = trimmed.match(/^model\s*=\s*(.+)$/);
    if (!m) continue;

    const rhs = stripTomlInlineComment(m[1] || "").trim();
    return parseTomlStringValue(rhs);
  }

  return "";
}

export function codexConfigTomlPath(): string {
  const override = String(process.env.AGENT_HEAVEN_CODEX_CONFIG_TOML || "").trim();
  if (override) return override;
  return path.join(os.homedir(), ".codex", "config.toml");
}

export function readCodexDefaultModelFromConfigToml(configPath?: string): string {
  const p = String(configPath || codexConfigTomlPath() || "").trim();
  if (!p) return "";

  try {
    const st = fs.statSync(p);
    const mtimeMs = typeof st.mtimeMs === "number" ? st.mtimeMs : 0;
    if (CACHE && CACHE.path === p && CACHE.mtimeMs === mtimeMs) return CACHE.model;

    const txt = fs.readFileSync(p, { encoding: "utf8" });
    const model = parseTopLevelCodexModelFromConfigToml(txt);
    CACHE = { path: p, mtimeMs, model };
    return model;
  } catch {
    return "";
  }
}

export function _resetCodexConfigCacheForTests() {
  CACHE = null;
}

