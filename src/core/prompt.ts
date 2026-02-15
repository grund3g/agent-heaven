import { oneLine, truncateText } from "./text";

function cleanPromptLine(line: string): string {
  // Drop common markdown prefixes (keep the content).
  let cleaned = line.replace(/^>\s?/, "");
  cleaned = cleaned.replace(/^#{1,6}\s+/, "");
  cleaned = cleaned.replace(/^[-*+]\s+/, "");
  cleaned = cleaned.replace(/^\d+\.\s+/, "");
  return oneLine(cleaned);
}

function looksLikeLowSignalIntro(s: string): boolean {
  const t = oneLine(s).toLowerCase();
  if (!t) return false;
  // Polite "can you …" / "kannst du …" scaffolding (often appears in bad LLM titles).
  if (/^(can|could|would|will|may)\s+you\b/.test(t)) return true;
  if (/^(kannst|k\u00f6nntest|k\u00f6nnen)\s+(du|ihr|wir)\b/.test(t)) return true;
  // Purpose clauses ("so that I can …") are rarely meaningful as titles.
  if (/^(damit|so\s+that|so\s+i\s+can|so\s+we\s+can|to\s+(be\s+)?able\s+to)\b/.test(t)) return true;

  // EN: "I tried/attempted/tested …"
  if (/^(i\s+)?(have\s+)?(now\s+|just\s+)?(tried|attempted|tested)\b/.test(t)) return true;
  // DE: "Ich habe jetzt mal versucht/probiert/getestet ..."
  if (/^(ich\s+)?hab(e)?\s+(jetzt\s+)?(mal\s+)?(versucht|probiert|getestet|gecheckt|gepr\u00fcft)\b/.test(t)) return true;

  // DE/EN: urgency-only fragments that are rarely meaningful as titles.
  if (/^(mir|uns)\s+(bitte\s+)?(kurz?fristig|kurz|mal|schnell|dringend)\b/.test(t)) return true;
  if (/^(bitte\s+)?(kurz?fristig|schnell|dringend|asap|quick(ly)?|soon)\b$/.test(t)) return true;
  return false;
}

function looksLikeLowSignalOutro(s: string): boolean {
  const t = oneLine(s).toLowerCase();
  if (!t) return false;

  // Generic questions / sign-offs that add little signal.
  if (/^(any(\s+(other|more))?\s+ideas|any\s+ideas|any\s+thoughts|anything\s+else|what\s+else|what\s+can\s+we\s+do)\b/.test(t))
    return true;
  if (/^(what\s+do\s+we\s+need|what\s+should\s+we\s+do|what\s+could\s+we\s+do)\b/.test(t)) return true;
  if (/^(was\s+kann\s+man|was\s+k\u00f6nnte\s+man|was\s+meinst\s+du|irgendwelche\s+ideen)\b/.test(t)) return true;
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

function looksLikeLowSignalLeadInChunk(s: string): boolean {
  const t = oneLine(s).toLowerCase();
  if (!t) return true;

  // Purpose clauses usually precede the actual request.
  if (/^(damit|so\s+that|so\s+i\s+can|so\s+we\s+can|to\s+(be\s+)?able\s+to)\b/.test(t)) return true;

  // Urgency or scheduling filler.
  if (/^(mir|uns)\s+(bitte\s+)?(kurz?fristig|kurz|mal|schnell|dringend|asap|quick(ly)?|soon)\b/.test(t)) return true;
  if (/^(bitte\s+)?(kurz?fristig|kurz|mal|schnell|dringend|asap|quick(ly)?|soon)\b$/.test(t)) return true;

  // Generic scaffolding: "a way to …" / "eine Möglichkeit …"
  if (/^(eine|einen|ein|a|an)\s+(m\u00f6glichkeit|option|way|possibility)\b/.test(t)) return true;

  return false;
}

function titlePartSignalScore(s: string): number {
  const low = oneLine(s).toLowerCase();
  if (!low) return -1e9;

  let score = 0;

  // Prefer "real" content over purpose/urgency/polite lead-ins.
  if (looksLikeLowSignalIntro(low)) score -= 8;
  if (looksLikeLowSignalLeadInChunk(low)) score -= 8;
  if (looksLikeLowSignalOutro(low)) score -= 8;

  // Reward action-y language.
  if (/\b(fix|add|implement|refactor|create|build|enable|allow|investigate|debug)\b/.test(low)) score += 5;
  if (/\b(fixen|hinzuf\u00fcg|hinzufueg|implementier|refaktor|erstell|bau|aktivier|erlaub)\w*\b/.test(low)) score += 5;

  // Reward "anchor" nouns that often reflect the actual task.
  if (/\b(demo|mock|job|jobs|project|projects|session|history|theme|hotkey|shortcut)\b/.test(low)) score += 4;

  // Prefer slightly longer parts, but cap the impact.
  score += Math.min(160, low.length) / 40;

  return score;
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

    // "… mir kurzfristig …" is usually just urgency, not the actual subject.
    t = t.replace(/^(mir|uns)\s+(bitte\s+)?(kurz?fristig|kurz|mal|schnell|dringend|asap)\b[\s,:-]*/i, "");
    t = t.replace(/^(bitte\s+)?(kurz?fristig|schnell|dringend|asap|quick(ly)?|soon)\b[\s,:-]*/i, "");

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
    // Pick the best sentence, not necessarily the first one.
    // This avoids bad splits on abbreviations like "bzw." / "etc." where the first fragment is incomplete.
    const kept = sentences
      .map((s, idx) => ({ s, idx, score: titlePartSignalScore(s) - idx * 0.15 }))
      .filter((x) => x.s.length >= 8)
      .sort((a, b) => b.score - a.score);
    if (kept.length > 0) t = kept[0].s;
    else if (sentences[0]) t = sentences[0];
  }

  // Common complaints often add a second clause after a comma.
  // Skip stacked low-signal lead-ins like:
  // "kannst du mir kurzfristig, damit ich ..., eine m\u00f6glichkeit ..., <real ask>"
  for (let i = 0; i < 4; i += 1) {
    const commaIdx = t.indexOf(",");
    if (commaIdx <= 12) break;
    const head = t.slice(0, commaIdx).trim();
    const tail = t.slice(commaIdx + 1).trim();
    if (!tail) break;

    const headScore = titlePartSignalScore(head);
    const tailScore = titlePartSignalScore(tail);

    // Prefer the tail if the head is low-signal, too short, or clearly less "task-like" than the tail.
    if (head.length < 8 || looksLikeLowSignalIntro(head) || looksLikeLowSignalLeadInChunk(head) || headScore + 1.2 < tailScore) {
      t = tail;
      continue;
    }

    t = head;
    break;
  }

  t = t.replace(/[!?]+$/, "");
  t = oneLine(t);
  return t || s;
}

export function isBoilerplatePromptLine(s: unknown): boolean {
  const t = String(s || "").trim();
  if (!t) return true;

  const low = t.toLowerCase();
  // Avoid showing prompt section labels as content in summaries.
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
  if (low === "-----") return true;
  if (low.includes("[agent heaven internal]")) return true;
  if (low.startsWith("ah_status:") || low.startsWith("ah status:")) return true;
  if (low.includes("at the very end of your final reply")) return true;
  if (low.includes("do not add any other text after the ah_status line")) return true;
  if (/^status=[^\s]+(?:\s+[a-z0-9_-]+=[^\s]+){3,}$/i.test(low)) return true;
  if (low.includes("status=") && low.includes("thread=") && low.includes("model=")) return true;
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

    // Prefer the "ask" near the end of the prompt, but avoid low-signal lines.
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

export function jobDisplayTitle(job: unknown): string {
  const JOB_TITLE_MAX_LEN = 120;
  const j = job && typeof job === "object" ? (job as any) : {};

  const llmTitle = typeof j.titleLlm === "string" ? oneLine(j.titleLlm) : "";
  if (llmTitle) return truncateText(llmTitle, JOB_TITLE_MAX_LEN);

  const fallback = typeof j.title === "string" ? oneLine(j.title) : "";
  if (fallback) return truncateText(fallback, JOB_TITLE_MAX_LEN);

  return "Untitled";
}
