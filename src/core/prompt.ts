import { oneLine, truncateText } from "./text";

function cleanPromptLine(line: string): string {
  // Drop common markdown prefixes (keep the content).
  let cleaned = line.replace(/^>\s?/, "");
  cleaned = cleaned.replace(/^#{1,6}\s+/, "");
  cleaned = cleaned.replace(/^[-*+]\s+/, "");
  cleaned = cleaned.replace(/^\d+\.\s+/, "");
  return oneLine(cleaned);
}

function isFixLikePrompt(summary: string): boolean {
  const low = String(summary || "").toLowerCase();
  if (!low) return false;
  if (/\bfix\b/.test(low)) return true;
  if (/\bbug\b/.test(low)) return true;
  if (/\bbroken\b/.test(low)) return true;
  if (/\bnot\s+working\b/.test(low)) return true;
  if (/\bdoesn['’]?t\b/.test(low)) return true;
  if (low.includes("geht") && low.includes("nicht")) return true;
  if (low.includes("funktioniert") && low.includes("nicht")) return true;
  // German phrasing: "immer der gleiche sound" etc.
  if (low.includes("immer") && low.includes("gleich") && low.includes("sound")) return true;
  return false;
}

function topicTitleFromPromptSummary(summary: string): string {
  const s = oneLine(summary);
  const low = s.toLowerCase();
  if (!low) return "";

  // Card/job title summarization
  if (/\btitle(s)?\b/.test(low) && /\b(summary|summaries|summarize|zusammenfassung)\b/.test(low))
    return "Card title summaries";

  // Search across sessions/jobs/history
  if (/\b(search|suche|volltext)\b/.test(low) && /\b(session(s)?|jobs?|history)\b/.test(low)) return "Session search";

  // Theme options
  if (/\b(theme|dark|light|mode)\b/.test(low) && /\bsystem\b/.test(low)) return "Theme: system option";
  if (/\b(theme|dark|light|mode)\b/.test(low)) return "Theme";

  // Global hotkeys/shortcuts
  if (/\b(hot\s*key|hotkey|shortcut|tastenkomb[iy]|accelerator)\b/.test(low)) return "Global hotkey";

  // Sounds/notifications
  if (/(sound|sounds|notification)/.test(low)) {
    if (/\b(easter\s*egg|easteregg|goat|zieg)\b/.test(low)) return "Goat sound easter egg";
    if (/\b(volume|leise|loud)\b/.test(low) || /\b[0-9]{1,3}\s*%\b/.test(low)) return "Sound volume";
    if (/\b(select|ausw\u00e4hl|auswahl|preset)\b/.test(low)) return "Sound selection";
    return "Sounds";
  }

  // Markdown rendering
  if (/\bmarkdown\b/.test(low)) return "Markdown rendering";

  // Layout/alignment
  if (/\b(layout|verschoben|shift(ed)?|textarea|button)\b/.test(low)) return "Layout alignment";

  // Image preview
  if (/\b(preview|vorschau)\b/.test(low) && /\b(image|bild)\b/.test(low)) return "Image preview";

  // Refactor/tests/main.ts
  const hasMainTs = /\bmain\.ts\b/.test(low) || /\b1000\s*zeilen\b/.test(low);
  const hasTests = /\btests?\b/.test(low);
  if (hasMainTs && hasTests) return "Refactor main.ts + tests";
  if (hasMainTs) return "Refactor main.ts";
  if (hasTests) return "Tests";

  // Copy/branding
  if (/\byour\s+codex\b/.test(low) || /\byour\s+agents\b/.test(low)) return "Branding copy";

  return "";
}

function compactTitleFromPromptSummary(summary: string): string {
  const s = oneLine(summary);
  if (!s) return "";

  const topic = topicTitleFromPromptSummary(s);
  if (topic) {
    if (isFixLikePrompt(s)) return `Fix: ${topic}`;
    return topic;
  }

  // Fallback: keep it readable, but drop obvious filler.
  let t = s;

  // Common complaints often add a second clause after a comma.
  const commaIdx = t.indexOf(",");
  if (commaIdx > 12) {
    const head = t.slice(0, commaIdx).trim();
    if (head.length >= 8) t = head;
  }

  // Drop common "polite" / "question" prefixes in EN/DE.
  t = t.replace(/^(please|pls|plz|bitte)\b[\s,:-]*/i, "");
  t = t.replace(/^(can|could|would|will|may)\s+you\b[\s,:-]*/i, "");
  t = t.replace(/^(can|could)\s+we\b[\s,:-]*/i, "");
  t = t.replace(/^(kannst|k\u00f6nntest|k\u00f6nnen)\s+(du|ihr|wir)\b[\s,:-]*/i, "");
  t = t.replace(/^(kann\s+man)\b[\s,:-]*/i, "");
  t = t.replace(/^(das\s+bitte)\b[\s,:-]*/i, "");

  t = t.replace(/[!?]+$/, "");
  t = oneLine(t);
  return t || s;
}

export function isBoilerplatePromptLine(s: unknown): boolean {
  const t = String(s || "").trim();
  if (!t) return true;

  const low = t.toLowerCase();
  // Avoid showing prompt section labels as a "title" in cards/dialogs.
  if (low === "mined-prompt" || low === "mined prompt") return true;
  if (low === "mined_prompt") return true;
  if (low.startsWith("mined-prompt:") || low.startsWith("mined prompt:") || low.startsWith("mined_prompt:")) return true;
  if (low.includes("agents.md") && low.includes("instructions")) return true;
  if (low.includes("skill.md")) return true;
  if (low.includes("available skills")) return true;
  if (low.includes("how to use skills")) return true;
  if (low.includes("trigger rules")) return true;
  if (low.includes("context hygiene")) return true;
  if (low.includes("safety and fallback")) return true;
  if (low.includes("environment_context")) return true;
  if (low === "instructions" || low === "skills") return true;
  if (low.startsWith("cwd>") || low.startsWith("shell>")) return true;
  if (low.startsWith("cwd ") || low.startsWith("shell ")) return true;
  if (low.startsWith("cwd:") || low.startsWith("shell:")) return true;
  return false;
}

export function promptSummary(s: unknown): string {
  const raw = String(s || "").replaceAll("\r\n", "\n");
  const lines = raw.split("\n");
  const candidates: string[] = [];
  const fencedCandidates: string[] = [];
  let inFence = false;

  for (const line of lines) {
    const t = String(line || "").trim();
    if (!t) continue;

    if (t.startsWith("```")) {
      inFence = !inFence;
      continue;
    }

    // Skip XML-ish wrapper tags often used in prompts.
    if (/^<\/?[a-zA-Z0-9_-]+[^>]*>$/.test(t)) continue;

    let cleaned = cleanPromptLine(t);
    if (!cleaned) continue;
    if (cleaned.length > 280) cleaned = cleaned.slice(0, 280).trim();
    if (inFence) fencedCandidates.push(cleaned);
    else candidates.push(cleaned);
  }

  function pickLines(arr: string[]): string[] {
    const picked: string[] = [];
    let total = 0;
    let fromEnd = true;

    // Prefer the "ask" near the end of the prompt (common when prompts include big instruction preambles).
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      const line = arr[i];
      if (isBoilerplatePromptLine(line)) continue;
      if (picked.length > 0 && line === picked[picked.length - 1]) continue;
      picked.push(line);
      total += line.length;
      if (picked.length >= 3 || total >= 360) break;
    }

    // Fallback: take from the start.
    if (picked.length === 0) {
      fromEnd = false;
      total = 0;
      for (let i = 0; i < arr.length; i += 1) {
        const line = arr[i];
        if (isBoilerplatePromptLine(line)) continue;
        if (picked.length > 0 && line === picked[picked.length - 1]) continue;
        picked.push(line);
        total += line.length;
        if (picked.length >= 3 || total >= 360) break;
      }
    }

    const ordered = fromEnd ? [...picked].reverse() : picked;
    return ordered;
  }

  // Prefer non-fenced prompt text; if that yields nothing useful, fall back to fenced content.
  const ordered = pickLines(candidates);
  if (ordered.length > 0) return oneLine(ordered.join(" "));

  const fencedOrdered = pickLines(fencedCandidates);
  return oneLine(fencedOrdered.join(" "));
}

export function guessTitleFromPrompt(prompt: unknown): string {
  const JOB_TITLE_MAX_LEN = 80;

  const summary = promptSummary(prompt);
  if (summary) return truncateText(compactTitleFromPromptSummary(summary), JOB_TITLE_MAX_LEN);

  const first = (String(prompt || "").trim().split("\n")[0] || "").trim();
  const cleaned = cleanPromptLine(first);
  if (cleaned && !isBoilerplatePromptLine(cleaned)) return truncateText(compactTitleFromPromptSummary(cleaned), JOB_TITLE_MAX_LEN);

  return "Untitled";
}

export function jobDisplayTitle(job: unknown): string {
  const JOB_TITLE_MAX_LEN = 80;

  const j = job && typeof job === "object" ? (job as any) : {};
  const prompts = Array.isArray(j.prompts) ? j.prompts : [];

  // Prefer a stable "job identity" based on the earliest meaningful user prompt.
  for (const p of prompts) {
    const s = promptSummary(p && typeof p.text === "string" ? p.text : "");
    if (s) return truncateText(compactTitleFromPromptSummary(s), JOB_TITLE_MAX_LEN);
  }

  const fallback = typeof j.title === "string" ? j.title : "";
  const cleaned = oneLine(fallback);
  if (cleaned && !isBoilerplatePromptLine(cleaned)) return truncateText(compactTitleFromPromptSummary(cleaned), JOB_TITLE_MAX_LEN);

  return "Untitled";
}
