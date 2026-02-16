import { promptSummary } from "./prompt";
import { oneLine } from "./text";

export type CommitMessageStyle = "conventional" | "plain";

const CONVENTIONAL_TYPES = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test"
] as const;

type ConventionalType = (typeof CONVENTIONAL_TYPES)[number];

function isConventionalType(value: string): value is ConventionalType {
  return (CONVENTIONAL_TYPES as readonly string[]).includes(value);
}

export function looksLikeConventionalCommitSubject(subject: unknown): boolean {
  const s = oneLine(subject);
  if (!s) return false;
  return /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([^)]+\))?: .+/.test(s);
}

export function inferCommitMessageStyleFromSubjects(subjects: unknown): CommitMessageStyle {
  const arr = Array.isArray(subjects) ? subjects : [];
  const cleaned = arr.map(oneLine).filter(Boolean);
  if (cleaned.length === 0) return "plain";

  const hits = cleaned.filter(looksLikeConventionalCommitSubject).length;
  // Require a majority and at least a few samples.
  if (hits >= Math.max(3, Math.ceil(cleaned.length * 0.5))) return "conventional";
  return "plain";
}

function truncateCommitLineAscii(s: string, maxLen = 72): string {
  const str = oneLine(s);
  if (!str) return "";
  const max = Math.max(1, Math.trunc(maxLen));
  if (str.length <= max) return str;

  const head = str.slice(0, max);
  // Prefer truncating at whitespace to keep the line readable.
  for (let i = head.length - 1; i >= Math.floor(max * 0.6); i -= 1) {
    const ch = head[i];
    if (ch === " " || ch === "\t") return head.slice(0, i).trimEnd();
  }
  return head.trimEnd();
}

function lowerCaseFirstLetter(s: string): string {
  if (!s) return "";
  const first = s[0];
  if (!first) return s;
  // Only lower-case ASCII letters; avoid messing with non-Latin scripts / emoji.
  if (first >= "A" && first <= "Z") return first.toLowerCase() + s.slice(1);
  return s;
}

function sentenceCaseAscii(s: string): string {
  if (!s) return "";
  const str = oneLine(s);
  if (!str) return "";
  const first = str[0];
  if (first >= "a" && first <= "z") return first.toUpperCase() + str.slice(1);
  return str;
}

function normalizeChangedPaths(value: unknown): string[] {
  const arr = Array.isArray(value) ? value : [];
  const out: string[] = [];
  for (const v of arr) {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s) continue;
    // Normalize Windows paths to git-style for heuristics.
    const n = s.replaceAll("\\", "/").replace(/^\.\/+/, "");
    out.push(n);
  }
  return Array.from(new Set(out));
}

function basename(p: string): string {
  const s = String(p || "");
  const idx = s.lastIndexOf("/");
  return (idx === -1 ? s : s.slice(idx + 1)).trim();
}

function isReadmePath(p: string): boolean {
  const b = basename(p).toLowerCase();
  return b === "readme" || b.startsWith("readme.");
}

function isMarkdownPath(p: string): boolean {
  const low = String(p || "").toLowerCase();
  if (isReadmePath(low)) return true;
  return low.endsWith(".md") || low.endsWith(".mdx") || low.endsWith(".rst");
}

function isDocsPath(p: string): boolean {
  const low = String(p || "").toLowerCase();
  if (isMarkdownPath(low)) return true;
  if (low.startsWith("docs/")) return true;
  return false;
}

function isTestPath(p: string): boolean {
  const low = String(p || "").toLowerCase();
  if (low.startsWith("tests/")) return true;
  if (low.includes("/__tests__/")) return true;
  if (/\.(test|spec)\.[a-z0-9]+$/.test(low)) return true;
  return false;
}

function isCiPath(p: string): boolean {
  const low = String(p || "").toLowerCase();
  if (low.startsWith(".github/")) return true;
  if (low.includes("/.github/")) return true;
  return false;
}

function isDepsPath(p: string): boolean {
  const low = basename(p).toLowerCase();
  if (low === "package.json") return true;
  if (low === "package-lock.json") return true;
  if (low === "yarn.lock") return true;
  if (low === "pnpm-lock.yaml") return true;
  if (low === "bun.lockb") return true;
  if (low === "cargo.lock") return true;
  if (low === "go.sum") return true;
  return false;
}

function isImagePath(p: string): boolean {
  const low = String(p || "").toLowerCase();
  return (
    low.endsWith(".png") ||
    low.endsWith(".jpg") ||
    low.endsWith(".jpeg") ||
    low.endsWith(".gif") ||
    low.endsWith(".webp") ||
    low.endsWith(".svg")
  );
}

function extractTypeHintFromSummary(summary: string): { typeHint: ConventionalType | ""; summary: string } {
  const s = oneLine(summary);
  if (!s) return { typeHint: "", summary: "" };

  // e.g. "Fix: ..." from job titles.
  const m = s.match(/^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)\s*:\s*(.+)$/i);
  if (m) {
    const t = String(m[1] || "").toLowerCase();
    const rest = oneLine(m[2] || "");
    if (isConventionalType(t) && rest) return { typeHint: t, summary: rest };
  }

  return { typeHint: "", summary: s };
}

function looksFixLikeText(s: string): boolean {
  const low = String(s || "").toLowerCase();
  if (!low) return false;
  if (/\bfix\b/.test(low)) return true;
  if (/\bbug\b/.test(low)) return true;
  if (/\bbroken\b/.test(low)) return true;
  if (/\bcrash\b/.test(low)) return true;
  if (/\bdoesn['’]?t\b/.test(low)) return true;
  if (low.includes("geht") && low.includes("nicht")) return true;
  if (low.includes("funktioniert") && low.includes("nicht")) return true;
  return false;
}

function looksRefactorLikeText(s: string): boolean {
  const low = String(s || "").toLowerCase();
  if (!low) return false;
  if (/\brefactor\b/.test(low)) return true;
  if (/\bcleanup\b/.test(low)) return true;
  if (/\bumbrella\b/.test(low)) return false;
  if (low.includes("refaktor")) return true;
  return false;
}

function looksDocsLikeText(s: string): boolean {
  const low = String(s || "").toLowerCase();
  if (!low) return false;
  if (/\bdocs?\b/.test(low)) return true;
  if (low.includes("readme")) return true;
  if (low.includes("doku")) return true;
  if (low.includes("dokument")) return true;
  return false;
}

function inferConventionalType(paths: string[], typeHint: ConventionalType | "", taskSummary: string): ConventionalType {
  const has = paths.length > 0;
  const docsOnly = has && paths.every(isDocsPath);
  if (docsOnly) return "docs";

  const testsOnly = has && paths.every(isTestPath);
  if (testsOnly) return "test";

  const ciOnly = has && paths.every(isCiPath);
  if (ciOnly) return "ci";

  const depsOnly = has && paths.every(isDepsPath);
  if (depsOnly) return "chore";

  if (typeHint) return typeHint;

  if (looksFixLikeText(taskSummary)) return "fix";
  if (looksRefactorLikeText(taskSummary)) return "refactor";
  if (looksDocsLikeText(taskSummary)) return "docs";

  return "feat";
}

function inferScope(paths: string[]): string {
  const has = paths.length > 0;
  // Keep `readme` scope for documentation-ish updates (README/docs + supporting images).
  // Mixed code+README changes should not be scoped to readme.
  const readmeDocsLikeOnly = has && paths.some(isReadmePath) && paths.every((p) => isDocsPath(p) || isImagePath(p));
  if (readmeDocsLikeOnly) return "readme";

  const allInGithub = has && paths.every((p) => String(p || "").replaceAll("\\", "/").startsWith(".github/"));
  if (allInGithub) return "github";

  const allInRenderer = has && paths.every((p) => String(p || "").replaceAll("\\", "/").startsWith("renderer/"));
  if (allInRenderer) return "renderer";

  const allInDocs = has && paths.every((p) => String(p || "").replaceAll("\\", "/").startsWith("docs/"));
  if (allInDocs) return "docs";

  const allInTests = has && paths.every((p) => String(p || "").replaceAll("\\", "/").startsWith("tests/"));
  if (allInTests) return "tests";

  return "";
}

function stripRedundantLeadingTypeVerb(subject: string, type: ConventionalType): string {
  let s = oneLine(subject);
  if (!s) return "";
  const t = String(type || "").toLowerCase();
  if (!t) return s;

  // Remove "fix:" / "fix -" / "fix " when we already encode it as the commit type.
  const re = new RegExp(`^${t}\\b\\s*[:\\-]?\\s+`, "i");
  s = s.replace(re, "");
  return oneLine(s);
}

function inferSubjectFromFiles(paths: string[], taskSummary: string, scope: string): string {
  const lowTask = String(taskSummary || "").toLowerCase();
  const hasReadme = paths.some(isReadmePath);
  const imgCount = paths.filter(isImagePath).length;
  const readmeDocsLikeOnly = hasReadme && paths.every((p) => isDocsPath(p) || isImagePath(p));
  if (readmeDocsLikeOnly) {
    const mentionsScreenshot = /\bscreenshot\b/.test(lowTask) || /\bscreen\s*shot\b/.test(lowTask) || /\bbild\b/.test(lowTask);
    if (imgCount > 0 || mentionsScreenshot) {
      // If scope already narrows to README, avoid repeating it.
      return scope === "readme" ? "add screenshot" : "add screenshot to README";
    }
    return scope === "readme" ? "update README" : "update README";
  }

  const docsOnly = paths.length > 0 && paths.every(isDocsPath);
  if (docsOnly) {
    if (paths.length === 1) return `update ${basename(paths[0])}`;
    return "update docs";
  }

  const depsOnly = paths.length > 0 && paths.every(isDepsPath);
  if (depsOnly) return "update dependencies";

  if (paths.length === 1) return `update ${basename(paths[0])}`;
  return "";
}

function normalizeSubject(summary: string, style: CommitMessageStyle, type: ConventionalType | ""): string {
  let s = oneLine(summary);
  if (!s) return "";
  s = s.replace(/[.!?]+$/, "").trim();

  if (type) s = stripRedundantLeadingTypeVerb(s, type);

  if (style === "conventional") s = lowerCaseFirstLetter(s);
  return oneLine(s);
}

export function suggestCommitMessage(opts: {
  style?: CommitMessageStyle;
  changedPaths?: unknown;
  taskText?: unknown;
  jobTitle?: unknown;
}): string {
  const style: CommitMessageStyle = opts && opts.style === "conventional" ? "conventional" : "plain";
  const paths = normalizeChangedPaths(opts && "changedPaths" in opts ? (opts as any).changedPaths : []);

  const rawTask = typeof opts.taskText === "string" ? opts.taskText : "";
  const jobTitle = typeof opts.jobTitle === "string" ? opts.jobTitle : "";

  const taskSummary = oneLine(promptSummary(rawTask) || jobTitle);
  const { typeHint, summary } = extractTypeHintFromSummary(taskSummary);

  const type = style === "conventional" ? inferConventionalType(paths, typeHint, summary) : "";
  const scope = style === "conventional" ? inferScope(paths) : "";

  const fileHint = inferSubjectFromFiles(paths, summary, scope);
  const normalizedTask = normalizeSubject(summary, style, type as any);

  let subject = "";
  if (fileHint) {
    const lowHint = fileHint.toLowerCase();
    const isGenericSingleFileUpdate =
      paths.length === 1 &&
      lowHint.startsWith("update ") &&
      !isDocsPath(paths[0]) &&
      !isDepsPath(paths[0]) &&
      !isCiPath(paths[0]) &&
      !isTestPath(paths[0]);

    // Prefer the task summary for "normal" code changes (it's usually more meaningful than "update foo.ts").
    if (isGenericSingleFileUpdate && normalizedTask) {
      subject = normalizedTask;
    } else if (lowHint === "update readme" && /\bscreenshot\b/i.test(summary)) {
      // Allow the prompt to upgrade a generic "update README" into "add screenshot" when appropriate.
      subject = inferSubjectFromFiles(paths, "screenshot", scope);
    } else {
      subject = fileHint;
    }
  } else if (normalizedTask) {
    subject = normalizedTask;
  } else if (paths.length > 0) {
    subject = inferSubjectFromFiles(paths, "", scope) || "checkpoint changes";
  } else {
    subject = "checkpoint changes";
  }

  if (style === "conventional") {
    const header = `${type}${scope ? `(${scope})` : ""}: ${subject}`;
    return truncateCommitLineAscii(header, 72);
  }

  return truncateCommitLineAscii(sentenceCaseAscii(subject), 72);
}
