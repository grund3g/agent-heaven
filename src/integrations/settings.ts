function isPlainObject(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function normalizeFlag(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value == null) return fallback;
  const raw = String(value).trim().toLowerCase();
  if (!raw) return fallback;
  if (raw === "1" || raw === "true" || raw === "yes" || raw === "on") return true;
  if (raw === "0" || raw === "false" || raw === "no" || raw === "off") return false;
  return fallback;
}

function normalizeString(value: unknown, fallback: string, maxLen = 200): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return fallback;
  if (raw.length <= maxLen) return raw;
  return raw.slice(0, maxLen);
}

function normalizePositiveInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.trunc(n);
  if (i < min) return min;
  if (i > max) return max;
  return i;
}

function normalizeApiBaseUrl(value: unknown, fallback: string): string {
  const raw = normalizeString(value, fallback, 500);
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return fallback;
    return u.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export type LinearProviderSettings = {
  enabled: boolean;
  apiBaseUrl: string;
  tokenEnvVar: string;
  maxIssuesPerPrompt: number;
  includeDescription: boolean;
};

export type GithubProviderSettings = {
  enabled: boolean;
  apiBaseUrl: string;
  tokenEnvVar: string;
  maxIssuesPerPrompt: number;
};

export type NotionProviderSettings = {
  enabled: boolean;
  apiBaseUrl: string;
  tokenEnvVar: string;
  notionVersion: string;
  maxPagesPerPrompt: number;
};

export type IntegrationsSettings = {
  enabled: boolean;
  autoEnrichPrompt: boolean;
  autoCommentOnComplete: boolean;
  requestTimeoutMs: number;
  providers: {
    linear: LinearProviderSettings;
    github: GithubProviderSettings;
    notion: NotionProviderSettings;
  };
};

export function normalizeIntegrationsSettings(settings: any): IntegrationsSettings {
  const root = isPlainObject(settings) ? settings : {};
  const raw = isPlainObject(root.integrations) ? root.integrations : {};
  const providers = isPlainObject(raw.providers) ? raw.providers : {};

  const linearRaw = isPlainObject(providers.linear) ? providers.linear : {};
  const githubRaw = isPlainObject(providers.github) ? providers.github : {};
  const notionRaw = isPlainObject(providers.notion) ? providers.notion : {};

  return {
    enabled: normalizeFlag(raw.enabled, false),
    autoEnrichPrompt: normalizeFlag(raw.autoEnrichPrompt, true),
    autoCommentOnComplete: normalizeFlag(raw.autoCommentOnComplete, true),
    requestTimeoutMs: normalizePositiveInt(raw.requestTimeoutMs, 12_000, 1_000, 60_000),
    providers: {
      linear: {
        enabled: normalizeFlag(linearRaw.enabled, false),
        apiBaseUrl: normalizeApiBaseUrl(linearRaw.apiBaseUrl, "https://api.linear.app/graphql"),
        tokenEnvVar: normalizeString(linearRaw.tokenEnvVar, "LINEAR_API_KEY", 80),
        maxIssuesPerPrompt: normalizePositiveInt(linearRaw.maxIssuesPerPrompt, 3, 1, 10),
        includeDescription: normalizeFlag(linearRaw.includeDescription, true)
      },
      github: {
        enabled: normalizeFlag(githubRaw.enabled, false),
        apiBaseUrl: normalizeApiBaseUrl(githubRaw.apiBaseUrl, "https://api.github.com"),
        tokenEnvVar: normalizeString(githubRaw.tokenEnvVar, "GITHUB_TOKEN", 80),
        maxIssuesPerPrompt: normalizePositiveInt(githubRaw.maxIssuesPerPrompt, 3, 1, 10)
      },
      notion: {
        enabled: normalizeFlag(notionRaw.enabled, false),
        apiBaseUrl: normalizeApiBaseUrl(notionRaw.apiBaseUrl, "https://api.notion.com/v1"),
        tokenEnvVar: normalizeString(notionRaw.tokenEnvVar, "NOTION_API_KEY", 80),
        notionVersion: normalizeString(notionRaw.notionVersion, "2022-06-28", 40),
        maxPagesPerPrompt: normalizePositiveInt(notionRaw.maxPagesPerPrompt, 2, 1, 8)
      }
    }
  };
}
