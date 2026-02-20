import { normalizeIntegrationsSettings } from "./settings";
import type {
  IntegrationBinding,
  IntegrationConnector,
  IntegrationMessage,
  JobCompletionContext,
  PromptEnrichmentContext
} from "./types";

function normalizeBinding(input: any): IntegrationBinding | null {
  if (!input || typeof input !== "object") return null;

  const connectorId = typeof input.connectorId === "string" ? input.connectorId.trim() : "";
  const capability = typeof input.capability === "string" ? input.capability.trim() : "";
  const resourceType = typeof input.resourceType === "string" ? input.resourceType.trim() : "";
  const resourceId = typeof input.resourceId === "string" ? input.resourceId.trim() : "";
  const externalRef = typeof input.externalRef === "string" ? input.externalRef.trim() : "";

  if (!connectorId || !capability || !resourceType || !resourceId || !externalRef) return null;

  const out: IntegrationBinding = {
    connectorId,
    capability,
    resourceType,
    resourceId,
    externalRef
  };

  const url = typeof input.url === "string" ? input.url.trim() : "";
  if (url) out.url = url;

  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (title) out.title = title;

  if (input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata)) {
    out.metadata = input.metadata;
  }

  return out;
}

function dedupeBindings(input: IntegrationBinding[]): IntegrationBinding[] {
  const out: IntegrationBinding[] = [];
  const seen = new Set<string>();

  for (const b of input) {
    const norm = normalizeBinding(b);
    if (!norm) continue;
    const key = `${norm.connectorId}|${norm.capability}|${norm.resourceType}|${norm.resourceId}|${norm.externalRef}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(norm);
  }

  return out;
}

function normalizeMessage(input: any, fallbackConnectorId: string): IntegrationMessage | null {
  if (!input || typeof input !== "object") return null;

  const connectorId =
    typeof input.connectorId === "string" && input.connectorId.trim() ? input.connectorId.trim() : fallbackConnectorId;
  if (!connectorId) return null;

  const rawLevel = typeof input.level === "string" ? input.level.trim().toLowerCase() : "";
  const level = rawLevel === "error" || rawLevel === "warning" ? rawLevel : "info";

  const text = typeof input.text === "string" ? input.text.trim() : "";
  if (!text) return null;

  return { connectorId, level, text };
}

function normalizeMessages(values: any, fallbackConnectorId: string): IntegrationMessage[] {
  const arr = Array.isArray(values) ? values : [];
  const out: IntegrationMessage[] = [];
  for (const item of arr) {
    const msg = normalizeMessage(item, fallbackConnectorId);
    if (!msg) continue;
    out.push(msg);
    if (out.length >= 30) break;
  }
  return out;
}

function clipPromptPrefix(value: unknown, maxChars = 7_000): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}\n...[truncated]`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimeout: () => T): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(onTimeout()), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function buildPromptWithContext(userPrompt: string, contextBlocks: string[]): string {
  const blocks = contextBlocks.map((x) => String(x || "").trim()).filter(Boolean);
  if (blocks.length === 0) return userPrompt;

  const header =
    "Connected system context (read-only, fetched automatically). Use this context when implementing the user request.";

  const merged: string[] = [header];
  for (let i = 0; i < blocks.length; i += 1) {
    merged.push(`Source ${i + 1}:\n${blocks[i]}`);
  }

  return `${merged.join("\n\n")}\n\n-----\nUser request:\n${String(userPrompt || "").trim()}`;
}

export type RuntimePreparePromptResult = {
  prompt: string;
  bindings: IntegrationBinding[];
  messages: IntegrationMessage[];
};

export type RuntimeCompletionResult = {
  bindings: IntegrationBinding[];
  messages: IntegrationMessage[];
};

export class IntegrationRuntime {
  private connectors: IntegrationConnector[];

  constructor(connectors: IntegrationConnector[]) {
    this.connectors = Array.isArray(connectors) ? connectors.filter(Boolean) : [];
  }

  async preparePrompt(ctx: PromptEnrichmentContext): Promise<RuntimePreparePromptResult> {
    const settings = normalizeIntegrationsSettings(ctx && (ctx as any).settings);
    const basePrompt = String(ctx && (ctx as any).prompt ? (ctx as any).prompt : "");

    const out: RuntimePreparePromptResult = {
      prompt: basePrompt,
      bindings: [],
      messages: []
    };

    if (!settings.enabled || !settings.autoEnrichPrompt) return out;

    const prefixes: string[] = [];

    for (const connector of this.connectors) {
      if (!connector || typeof connector !== "object") continue;
      if (typeof connector.enrichPrompt !== "function") continue;

      try {
        const timedOutResult: any = {
          messages: [
            {
              connectorId: connector.id,
              level: "warning",
              text: `Prompt enrichment timed out after ${settings.requestTimeoutMs}ms.`
            }
          ]
        };
        const res = await withTimeout(
          Promise.resolve(connector.enrichPrompt(ctx)),
          settings.requestTimeoutMs,
          () => timedOutResult
        );

        if (!res || typeof res !== "object") continue;

        const prefix = clipPromptPrefix((res as any).promptPrefix);
        if (prefix) prefixes.push(prefix);

        const bindings = dedupeBindings(Array.isArray((res as any).bindings) ? (res as any).bindings : []);
        if (bindings.length > 0) out.bindings.push(...bindings);

        const messages = normalizeMessages((res as any).messages, connector.id);
        if (messages.length > 0) out.messages.push(...messages);
      } catch (err: any) {
        const text = String(err && err.message ? err.message : err || "Unknown integration error").trim();
        out.messages.push({
          connectorId: connector.id,
          level: "error",
          text: text || "Unknown integration error"
        });
      }
    }

    out.bindings = dedupeBindings(out.bindings);

    const MAX_PREFIX_TOTAL = 24_000;
    let total = 0;
    const limited: string[] = [];
    for (const p of prefixes) {
      if (!p) continue;
      if (total >= MAX_PREFIX_TOTAL) break;
      const remaining = MAX_PREFIX_TOTAL - total;
      if (p.length <= remaining) {
        limited.push(p);
        total += p.length;
      } else {
        limited.push(`${p.slice(0, remaining).trimEnd()}\n...[truncated]`);
        total = MAX_PREFIX_TOTAL;
      }
    }

    out.prompt = buildPromptWithContext(basePrompt, limited);
    return out;
  }

  async notifyRunCompleted(ctx: JobCompletionContext): Promise<RuntimeCompletionResult> {
    const settings = normalizeIntegrationsSettings(ctx && (ctx as any).settings);
    const out: RuntimeCompletionResult = {
      bindings: dedupeBindings(Array.isArray(ctx && (ctx as any).bindings) ? (ctx as any).bindings : []),
      messages: []
    };

    if (!settings.enabled || !settings.autoCommentOnComplete) return out;

    for (const connector of this.connectors) {
      if (!connector || typeof connector !== "object") continue;
      if (typeof connector.notifyRunCompleted !== "function") continue;

      const subset = out.bindings.filter((b) => b.connectorId === connector.id);
      if (subset.length === 0) continue;

      try {
        const timedOutResult: any = {
          messages: [
            {
              connectorId: connector.id,
              level: "warning",
              text: `Completion hook timed out after ${settings.requestTimeoutMs}ms.`
            }
          ]
        };
        const res = await withTimeout(
          Promise.resolve(connector.notifyRunCompleted({ ...ctx, bindings: subset })),
          settings.requestTimeoutMs,
          () => timedOutResult
        );

        if (!res || typeof res !== "object") continue;

        const nextBindings = dedupeBindings(Array.isArray((res as any).bindings) ? (res as any).bindings : []);
        if (nextBindings.length > 0) {
          out.bindings = dedupeBindings([...out.bindings, ...nextBindings]);
        }

        const messages = normalizeMessages((res as any).messages, connector.id);
        if (messages.length > 0) out.messages.push(...messages);
      } catch (err: any) {
        const text = String(err && err.message ? err.message : err || "Unknown integration error").trim();
        out.messages.push({
          connectorId: connector.id,
          level: "error",
          text: text || "Unknown integration error"
        });
      }
    }

    return out;
  }
}
