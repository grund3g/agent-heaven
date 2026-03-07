import * as fs from "node:fs";
import * as path from "node:path";

const DEFAULT_ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_API_KEY_ENV_VAR = "ANTHROPIC_API_KEY";

type ClaudeMessagesApiResult = {
  text: string;
  model: string;
  usage: any;
};

function normalizeApiKeyEnvVar(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw || DEFAULT_API_KEY_ENV_VAR;
}

function resolveClaudeApiKey(settings: any): string {
  const s = settings && typeof settings === "object" ? settings : {};
  const direct = typeof (s as any).apiKey === "string" ? String((s as any).apiKey || "").trim() : "";
  if (direct) return direct;
  const envName = normalizeApiKeyEnvVar((s as any).apiKeyEnvVar);
  const fromEnv = typeof process.env[envName] === "string" ? String(process.env[envName] || "").trim() : "";
  return fromEnv;
}

function normalizeClaudeMessagesModel(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  const low = raw.toLowerCase();
  if (!low || low === "sonnet") return "claude-sonnet-4-0";
  if (low === "opus") return "claude-opus-4-1";
  if (low === "haiku") return "claude-3-5-haiku-latest";
  return raw;
}

function mediaTypeForImage(filePath: string): string {
  const ext = path.extname(String(filePath || "")).trim().toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  throw new Error(`Unsupported image format for Claude Messages API: ${ext || "(unknown)"}`);
}

function imageBlockForPath(filePath: string) {
  const mediaType = mediaTypeForImage(filePath);
  const data = fs.readFileSync(filePath).toString("base64");
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: mediaType,
      data
    }
  };
}

function extractAnthropicErrorMessage(payload: any, status: number): string {
  const root = payload && typeof payload === "object" ? payload : {};
  const error = root.error && typeof root.error === "object" ? root.error : {};
  const message = typeof error.message === "string" ? error.message.trim() : "";
  if (message) return message;
  return `Anthropic Messages API request failed (${status})`;
}

function extractTextFromResponse(payload: any): string {
  const root = payload && typeof payload === "object" ? payload : {};
  const content = Array.isArray(root.content) ? root.content : [];
  const parts: string[] = [];
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    if ((block as any).type !== "text") continue;
    const text = typeof (block as any).text === "string" ? (block as any).text.trim() : "";
    if (text) parts.push(text);
  }
  return parts.join("\n\n").trim();
}

function buildImageSummaryPrompt(prompt: string, images: string[]): string {
  const fileLines = images.map((img, idx) => `${idx + 1}. ${path.basename(img)}`);
  return [
    "Summarize the attached images for a coding agent that will continue working in a Claude Code CLI session.",
    "Focus on visible UI text, filenames, terminal output, error messages, diffs, and concrete visual issues.",
    "Do not invent hidden details. If something is unclear, say that it is unclear.",
    "Keep the result concise but high-signal.",
    "",
    "User prompt:",
    prompt.trim() || "(empty prompt)",
    "",
    "Attached images:",
    fileLines.join("\n")
  ].join("\n");
}

export async function summarizeClaudeImagesWithMessagesApi(opts: {
  settings: any;
  model: string;
  prompt: string;
  images: string[];
}): Promise<ClaudeMessagesApiResult> {
  const settings = opts && typeof opts === "object" ? opts.settings : {};
  const images = Array.isArray(opts && (opts as any).images) ? (opts as any).images : [];
  const prompt = typeof (opts as any).prompt === "string" ? String((opts as any).prompt || "") : "";
  const model = normalizeClaudeMessagesModel((opts as any).model);
  const apiKey = resolveClaudeApiKey(settings);

  const body = {
    model,
    max_tokens: 1200,
    system:
      "You create faithful text summaries of user-provided images for a coding assistant. Preserve concrete visual facts and avoid speculation.",
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: buildImageSummaryPrompt(prompt, images) }, ...images.map(imageBlockForPath)]
      }
    ]
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(DEFAULT_ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "anthropic-version": DEFAULT_ANTHROPIC_VERSION,
        "x-api-key": apiKey
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(extractAnthropicErrorMessage(payload, res.status));
    }

    const text = extractTextFromResponse(payload);
    return {
      text,
      model,
      usage: payload && typeof payload === "object" ? (payload as any).usage || null : null
    };
  } finally {
    clearTimeout(timeout);
  }
}
