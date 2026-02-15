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

function looksLikeLowSignalIntro(s: string): boolean {
  const t = oneLine(s).toLowerCase();
  if (!t) return false;
  // EN: "I tried/attempted/tested …"
  if (/^(i\s+)?(have\s+)?(now\s+|just\s+)?(tried|attempted|tested)\b/.test(t)) return true;
  // DE: "Ich hab(e) jetzt mal versucht/probiert/getestet …"
  if (/^(ich\s+)?hab(e)?\s+(jetzt\s+)?(mal\s+)?(versucht|probiert|getestet|gecheckt|gepr\u00fcft)\b/.test(t)) return true;
  return false;
}

function looksLikeLowSignalOutro(s: string): boolean {
  const t = oneLine(s).toLowerCase();
  if (!t) return false;

  // Generic questions / sign-offs that add little to a title.
  if (/^(any(\s+(other|more))?\s+ideas|any\s+ideas|any\s+thoughts|anything\s+else|what\s+else|what\s+can\s+we\s+do)\b/.test(t))
    return true;
  if (/^(what\s+do\s+we\s+need|what\s+should\s+we\s+do|what\s+could\s+we\s+do)\b/.test(t)) return true;
  if (/^(was\s+kann\s+man|was\s+k\u00f6nnte\s+man|was\s+meinst\s+du|irgendwelche\s+ideen)\b/.test(t)) return true;
  // DE: ultra-generic follow-up questions without an object/context.
  if (/^was\s+br\u00e4uchten\s+wir(\s+(daf\u00fcr|dafuer))?\s*[.!?]*$/.test(t)) return true;
  if (/^was\s+braeuchten\s+wir(\s+(daf\u00fcr|dafuer))?\s*[.!?]*$/.test(t)) return true;
  if (/^was\s+brauchen\s+wir(\s+(daf\u00fcr|dafuer))?\s*[.!?]*$/.test(t)) return true;
  if (/^was\s+wir\s+machen\s+k\u00f6nnten(\s+(jetzt|noch|da))?\s*[.!?]*$/.test(t)) return true;
  if (/^was\s+wir\s+machen\s+koennten(\s+(jetzt|noch|da))?\s*[.!?]*$/.test(t)) return true;
  if (/^was\s+k\u00f6nnten\s+wir\s+machen(\s+(jetzt|noch|da))?\s*[.!?]*$/.test(t)) return true;
  if (/^was\s+koennten\s+wir\s+machen(\s+(jetzt|noch|da))?\s*[.!?]*$/.test(t)) return true;
  if (/^was\s+k\u00f6nnen\s+wir\s+machen(\s+(jetzt|noch|da))?\s*[.!?]*$/.test(t)) return true;
  if (/^was\s+koennen\s+wir\s+machen(\s+(jetzt|noch|da))?\s*[.!?]*$/.test(t)) return true;
  if (/^(danke|thanks|thx)\b/.test(t)) return true;
  return false;
}

function stripLowSignalLeadIn(s: string): string {
  let t = String(s || "");

  // Strip multiple stacked prefixes (e.g. "Kannst du bitte …").
  for (let i = 0; i < 4; i += 1) {
    const prev = t;

    t = t.replace(/^(title|titel|summary|zusammenfassung)\s*[:\-]\s*/i, "");

    // Drop common "polite" / "question" prefixes in EN/DE.
    t = t.replace(/^(and|und|also|so|ok|okay)\b[\s,:-]*/i, "");
    t = t.replace(/^(hi|hey|hello|hallo)\b[\s,:-]*/i, "");
    t = t.replace(/^(please|pls|plz|bitte)\b[\s,:-]*/i, "");
    t = t.replace(/^(can|could|would|will|may)\s+you\b[\s,:-]*/i, "");
    t = t.replace(/^(can|could)\s+we\b[\s,:-]*/i, "");
    t = t.replace(/^(kannst|k\u00f6nntest|k\u00f6nnen)\s+(du|ihr|wir)\b[\s,:-]*/i, "");
    t = t.replace(/^(kann\s+man)\b[\s,:-]*/i, "");
    t = t.replace(/^(das\s+bitte)\b[\s,:-]*/i, "");

    // Drop low-signal intros that frequently precede the actual problem statement.
    t = t.replace(/^(i\s+)?(have\s+)?(now\s+|just\s+)?(tried|attempted|tested)\b[\s,:-]*/i, "");
    t = t.replace(/^(ich\s+)?hab(e)?\s+(jetzt\s+)?(mal\s+)?(versucht|probiert|getestet|gecheckt|gepr\u00fcft)\b[\s,:-]*/i, "");

    // Drop hedge words that rarely help as a title.
    t = t.replace(/^(irgendwie|einfach|halt|kurz|mal)\b[\s,:-]*/i, "");

    if (t === prev) break;
  }

  return t;
}

function stripLowSignalFillerWords(s: string): string {
  let t = String(s || "");
  // Conversational filler that rarely belongs in a short title.
  t = t.replace(/\b(pls|plz|please|bitte)\b/gi, "");
  t = t.replace(/\b(nochmal|noch\s+einmal|again)\b/gi, "");
  t = t.replace(/\b(find(e)?\s+ich|glaub(e)?\s+ich|i\s+think|i\s+feel)\b/gi, "");
  return oneLine(t);
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
  let t = stripLowSignalLeadIn(s);
  t = stripLowSignalFillerWords(t);

  // If we ended up with multiple sentences, drop generic outro questions/sign-offs.
  const sentences = t
    .split(/[.!?]\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (sentences.length > 1) {
    const kept = sentences.filter((x) => x.length >= 8 && !looksLikeLowSignalOutro(x));
    if (kept.length > 0) t = kept[0];
    else if (sentences[0]) t = sentences[0];
  }

  // Common complaints often add a second clause after a comma.
  const commaIdx = t.indexOf(",");
  if (commaIdx > 12) {
    const head = t.slice(0, commaIdx).trim();
    const tail = t.slice(commaIdx + 1).trim();
    if (tail && looksLikeLowSignalIntro(head)) t = tail;
    else if (head.length >= 8) t = head;
  }

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

export function isLowSignalTitleText(s: unknown): boolean {
  const t = oneLine(String(s || ""));
  if (!t) return true;
  if (isBoilerplatePromptLine(t)) return true;
  if (looksLikeLowSignalIntro(t)) return true;
  if (looksLikeLowSignalOutro(t)) return true;
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
    function pickFromEnd(allowLowSignal: boolean): string[] {
      const picked: string[] = [];
      let total = 0;
      for (let i = arr.length - 1; i >= 0; i -= 1) {
        const line = arr[i];
        if (isBoilerplatePromptLine(line)) continue;
        if (!allowLowSignal && (looksLikeLowSignalIntro(line) || looksLikeLowSignalOutro(line))) continue;
        if (picked.length > 0 && line === picked[picked.length - 1]) continue;
        picked.push(line);
        total += line.length;
        if (picked.length >= 3 || total >= 360) break;
      }
      return [...picked].reverse();
    }

    function pickFromStart(allowLowSignal: boolean): string[] {
      const picked: string[] = [];
      let total = 0;
      for (let i = 0; i < arr.length; i += 1) {
        const line = arr[i];
        if (isBoilerplatePromptLine(line)) continue;
        if (!allowLowSignal && (looksLikeLowSignalIntro(line) || looksLikeLowSignalOutro(line))) continue;
        if (picked.length > 0 && line === picked[picked.length - 1]) continue;
        picked.push(line);
        total += line.length;
        if (picked.length >= 3 || total >= 360) break;
      }
      return picked;
    }

    // Prefer the "ask" near the end of the prompt (common when prompts include big instruction preambles),
    // but avoid low-signal follow-up questions like "Any ideas?" / "Was br\u00e4uchten wir?".
    let ordered = pickFromEnd(false);
    if (ordered.length > 0) return ordered;

    ordered = pickFromStart(false);
    if (ordered.length > 0) return ordered;

    // If we skipped too aggressively, allow low-signal lines as a last resort.
    ordered = pickFromEnd(true);
    if (ordered.length > 0) return ordered;
    return pickFromStart(true);
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
  const JOB_TITLE_MAX_LEN = 120;

  const j = job && typeof job === "object" ? (job as any) : {};
  const llmTitle = typeof j.titleLlm === "string" ? oneLine(j.titleLlm) : "";
  if (llmTitle && !isLowSignalTitleText(llmTitle)) return truncateText(llmTitle, JOB_TITLE_MAX_LEN);

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
