function stripMarkdownCode(s) {
  const raw = String(s || "");
  // Remove fenced code blocks and inline code so "?" in snippets doesn't skew detection.
  return raw.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]*`/g, " ");
}

function stripUrls(s) {
  // Avoid treating URL query params as questions (e.g. ".../path?foo=bar").
  return String(s || "")
    .replace(/\bhttps?:\/\/\S+/gi, " ")
    .replace(/\bwww\.\S+/gi, " ");
}

function countMatches(haystack, re) {
  const m = haystack.match(re);
  return m ? m.length : 0;
}

function extractQuestionTail(textWithQuestionMark) {
  const s0 = String(textWithQuestionMark || "");
  const qIdx = s0.lastIndexOf("?");
  if (qIdx === -1) return "";

  // Only consider the content up to (and including) the question mark we found.
  let s = s0.slice(0, qIdx + 1).replace(/[ \t]+/g, " ").trim();
  if (!s.endsWith("?")) return "";

  // Focus on the last "sentence-ish" fragment so we can classify e.g. "... Done. Any questions?"
  const body0 = s.slice(0, -1);
  const cut = Math.max(body0.lastIndexOf("\n"), body0.lastIndexOf("."), body0.lastIndexOf("!"), body0.lastIndexOf(":"));
  const body = (cut === -1 ? body0 : body0.slice(cut + 1)).trim();
  return body ? `${body}?` : "?";
}

function isGenericClosingQuestionTail(qTail) {
  const s = String(qTail || "")
    .trim()
    .replace(/[ \t]+/g, " ")
    .toLowerCase();
  if (!s.endsWith("?")) return false;

  const body = s.slice(0, -1).trim();
  if (!body) return false;

  // Closing questions are usually brief.
  if (body.length > 80) return false;

  const patterns = [
    // English
    /^(any questions|any more questions|questions|does that help|does this help|did that help|sound good|looks good|all good|anything else|anything more|need anything else|do you need anything else|do you need anything more|would you like anything else|would you like anything more|do you want anything else|do you want anything more)$/i,
    // German (incl. ascii fallbacks)
    /^(noch fragen|noch mehr fragen|fragen|hilft das|hilft dir das|passt das|passt das so|klingt das gut|alles klar|sonst noch was|sonst noch etwas|noch etwas|noch irgendwas|brauchst du noch was|brauchst du noch etwas|(m\u00f6chtest|moechtest|willst) du (sonst )?noch (was|etwas|irgendwas))$/i
  ];

  return patterns.some((re) => re.test(body));
}

function isOptionalFollowupQuestionTail(qTail) {
  const s = String(qTail || "")
    .trim()
    .replace(/[ \t]+/g, " ")
    .toLowerCase();
  if (!s.endsWith("?")) return false;

  const body = s.slice(0, -1).trim();
  if (!body) return false;

  const patterns = [
    // English: "offer" questions
    /\b(do you want me to|would you like me to|want me to|should i|shall i|would you like me|do you want me)\b/i,
    // German: "offer" questions (incl. ascii fallbacks)
    /\b(soll ich|willst du(?:,|\s)+dass ich|m\u00f6chtest du(?:,|\s)+dass ich|moechtest du(?:,|\s)+dass ich)\b/i
  ];

  return patterns.some((re) => re.test(body));
}

function isProceedOrChoiceQuestionTail(qTail) {
  const s = String(qTail || "")
    .trim()
    .replace(/[ \t]+/g, " ")
    .toLowerCase();
  if (!s.endsWith("?")) return false;

  const body = s.slice(0, -1).trim();
  if (!body) return false;

  // If the agent explicitly asks whether to proceed/continue or asks for a choice, treat it as attention-worthy.
  const patterns = [
    /\b(proceed|continue|move forward|go ahead)\b/i,
    /\b(which|what|prefer|preference|option|choose|select|pick)\b/i,
    /\b or \b/i,
    // German
    /\b(weitermachen|fortfahren|weitergehen|weiter\s+vor|loslegen)\b/i,
    /\b(welche|welcher|welches|was|bevorzugst|pr\u00e4ferierst|preferierst|option|w\u00e4hl|waehl|ausw\u00e4hlen|auswaehlen|entscheiden)\b/i,
    /\b oder \b/i
  ];

  return patterns.some((re) => re.test(body));
}

function isUserDirectedQuestionTail(qTail) {
  const s = String(qTail || "")
    .trim()
    .replace(/[ \t]+/g, " ")
    .toLowerCase();
  if (!s.endsWith("?")) return false;

  const body = s.slice(0, -1).trim();
  if (!body) return false;

  const patterns = [
    // Clear "asking the user" cues
    /\b(you|your|yours)\b/i,
    /\b(du|dir|dich|dein|deine|deiner|deinem|euch|ihr|ihrer|eure|euren|eurem)\b/i,
    /\bplease\b/i,
    /\bbitte\b/i,
    // Question words (common in clarifying questions)
    /^(which|what|when|where|who|how|why)\b/i,
    /^(welche|welcher|welches|was|wann|wo|wer|wie|warum)\b/i,
    /\b(prefer|preference|option|choose|select|pick)\b/i,
    /\b(bevorzugst|pr\u00e4ferierst|preferierst|option|w\u00e4hl|waehl|ausw\u00e4hlen|auswaehlen)\b/i
  ];

  return patterns.some((re) => re.test(body));
}

export function needsAttentionHeuristic(lastAssistantText) {
  const raw = String(lastAssistantText || "").trim();
  if (!raw) return false;

  const plain = stripUrls(stripMarkdownCode(raw))
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (!plain) return false;

  const strongSignals = [
    // English: explicit asks
    /please\s+(confirm|provide|share|send|paste|reply|answer|clarify|specify|choose|select)\b/i,
    /\b(can|could)\s+you\b/i,
    /\bi\s+(need|require)\s+(your\s+)?(input|confirmation|help|info|information|details|context)\b/i,
    /\b(i\s+)?(can'?t|cannot)\s+(proceed|continue|move\s+forward)\b/i,
    /\bbefore\s+i\s+can\s+(proceed|continue)\b/i,
    /\bto\s+continue,\s*please\b/i,
    /(^|\n)\s*(questions?|open questions?|clarifying questions?)\s*:\s*/i,

    // German: explicit asks (incl. ascii fallbacks)
    /bitte\s+(best\u00e4tig\w*|bestaetig\w*|gib\w*|nenn\w*|teil\w*|schick\w*|send\w*|post\w*|kopier\w*|f\u00fcg\w*|fueg\w*|antwort\w*|beantwort\w*|kl\u00e4r\w*|klaer\w*|konkretisier\w*|w\u00e4hl\w*|waehl\w*|entscheid\w*)\b/i,
    /(kannst|k\u00f6nntest|koenntest)\s+du\b/i,
    /ich\s+brauche\s+(noch\s+)?(mehr\s+)?(infos?|informationen|details|kontext|r\u00fcckmeldung|rueckmeldung)\b/i,
    /ich\s+kann\s+(nicht|nicht\s+weiter)\s*(fortfahren|weitermachen|weiter)\b/i,
    /bevor\s+ich\s+(fortfahre|weitermache)\b/i,
    /um\s+weiterzumachen,\s*bitte\b/i,
    /(^|\n)\s*(fragen|r\u00fcckfragen|rueckfragen|offene\s+fragen)\s*:\s*/i
  ];

  for (const re of strongSignals) {
    if (re.test(plain)) return true;
  }

  // Treat questions conservatively: only "real" user-directed questions should route to Needs Attention.
  const qWindow = plain.slice(Math.max(0, plain.length - 1200));
  const qCount = countMatches(qWindow, /\?/g);
  if (qCount === 0) return false;

  const parts = qWindow.split("?");
  const maxQ = Math.min(parts.length - 1, 8);
  for (let i = 0; i < maxQ; i += 1) {
    const chunk = `${parts[i]}?`;
    const tail = extractQuestionTail(chunk);
    if (!tail) continue;

    // Ignore common rhetorical patterns where the agent immediately answers itself.
    const after = String(parts[i + 1] || "")
      .replace(/[ \t]+/g, " ")
      .trimStart()
      .toLowerCase();
    const tailLow = String(tail || "").trim().toLowerCase();
    if (/^why\b/.test(tailLow) && /^(because\b|because[,:])/.test(after)) continue;
    if (/^warum\b/.test(tailLow) && /^(weil\b|weil[,:])/.test(after)) continue;

    if (isGenericClosingQuestionTail(tail)) continue;
    if (isOptionalFollowupQuestionTail(tail)) {
      if (isProceedOrChoiceQuestionTail(tail)) return true;
      continue;
    }
    if (isUserDirectedQuestionTail(tail)) return true;
  }

  return false;
}

export function promptNeedsAttentionHeuristic(promptText) {
  const raw = String(promptText || "").trim();
  if (!raw) return false;

  const plain = stripUrls(stripMarkdownCode(raw))
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (!plain) return false;

  // If the user asked a question, keep the card in Needs Attention so the answer is harder to miss.
  const qWindow = plain.slice(Math.max(0, plain.length - 1600));
  if (countMatches(qWindow, /\?/g) > 0) return true;

  // Also catch common "tell me / explain / list" prompts without question marks.
  const patterns = [
    // English
    /\b(explain|tell\s+me|show\s+me|give\s+me|list|summari[sz]e|compare|recommend)\b/i,
    /\b(can|could)\s+you\b/i,

    // German (incl. ascii fallbacks)
    /\b(erkl\u00e4r|erklaer|sag\s+mir|zeig\s+mir|gib\s+mir|liste|zusammenfass|vergleich|empfiehl)\b/i,
    /\b(kannst|k\u00f6nntest|koenntest)\s+du\b/i
  ];
  if (patterns.some((re) => re.test(plain))) return true;

  // Question-word prompts without "?" (common when writing quick commands).
  const head = plain.slice(0, 200).trim().toLowerCase();
  if (/^(what|why|how|when|where|who)\b/.test(head)) return true;
  if (/^(was|warum|wieso|wie|wann|wo|wer)\b/.test(head)) return true;

  return false;
}
