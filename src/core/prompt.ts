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
  // Polite "can you ..." / "kannst du ..." scaffolding.
  if (/^(can|could|would|will|may)\s+you\b/.test(t)) return true;
  if (/^(kannst|k\u00f6nntest|k\u00f6nnen)\s+(du|ihr|wir)\b/.test(t)) return true;
  // Purpose clauses are usually context, not the request itself.
  if (/^(damit|so\s+that|so\s+i\s+can|so\s+we\s+can|to\s+(be\s+)?able\s+to)\b/.test(t)) return true;

  // EN: "I tried/attempted/tested ..."
  if (/^(i\s+)?(have\s+)?(now\s+|just\s+)?(tried|attempted|tested)\b/.test(t)) return true;
  // DE: "Ich habe jetzt mal versucht/probiert/getestet ..."
  if (/^(ich\s+)?hab(e)?\s+(jetzt\s+)?(mal\s+)?(versucht|probiert|getestet|gecheckt|gepr\u00fcft)\b/.test(t)) return true;

  // DE/EN urgency-only fragments.
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
