export const EDITOR_PATH_TOKEN = "{path}";

export function splitCommandLine(raw: unknown): string[] {
  const src = typeof raw === "string" ? raw.trim() : "";
  if (!src) return [];

  const out: string[] = [];
  let buf = "";
  let quote: "" | "'" | '"' = "";
  let escaping = false;

  const push = () => {
    if (!buf) return;
    out.push(buf);
    buf = "";
  };

  for (const ch of src) {
    if (escaping) {
      buf += ch;
      escaping = false;
      continue;
    }

    if (quote) {
      if (ch === quote) {
        quote = "";
      } else {
        buf += ch;
      }
      continue;
    }

    if (ch === "\\") {
      escaping = true;
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }

    if (/\s/.test(ch)) {
      push();
      continue;
    }

    buf += ch;
  }

  if (escaping) buf += "\\";
  push();
  return out;
}

export function buildEditorLaunchCommand(editorCommand: unknown, targetPath: unknown): { command: string; args: string[] } | null {
  const target = typeof targetPath === "string" ? targetPath.trim() : "";
  if (!target) return null;

  const parts = splitCommandLine(editorCommand);
  if (parts.length === 0) return null;

  const command = String(parts[0] || "").trim();
  if (!command) return null;

  const rawArgs = parts.slice(1);
  if (rawArgs.length === 0) return { command, args: [target] };

  const hasPathToken = rawArgs.some((arg) => String(arg || "").includes(EDITOR_PATH_TOKEN));
  if (hasPathToken) {
    const args = rawArgs.map((arg) => String(arg || "").split(EDITOR_PATH_TOKEN).join(target));
    return { command, args };
  }

  const hasExplicitTargetArg = rawArgs.some((arg) => {
    const a = String(arg || "").trim();
    if (!a) return false;
    if (a === target) return true;
    if (a === "." || a === "./" || a === ".\\") return true;
    return false;
  });

  return { command, args: hasExplicitTargetArg ? rawArgs : [...rawArgs, target] };
}
