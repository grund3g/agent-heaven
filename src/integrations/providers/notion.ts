import { basename } from "node:path";
import { normalizeIntegrationsSettings } from "../settings";
import type { IntegrationBinding, IntegrationConnector } from "../types";
import { clipText, fetchJson } from "./http";

const NOTION_URL_RE = /https?:\/\/(?:www\.)?notion\.so\/[^\s)]+/g;
const NOTION_PAGE_ID_RE = /([0-9a-fA-F]{32}|[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12})/;

function notionToken(token: string, envVar: string): string {
  const direct = String(token || "").trim();
  if (direct) return direct;
  const name = String(envVar || "").trim();
  if (!name) return "";
  return String(process.env[name] || "").trim();
}

function notionMissingTokenHint(envVar: string): string {
  const name = String(envVar || "").trim();
  if (name) return `no token configured (token field empty and env var ${name} not set).`;
  return "no token configured.";
}

function normalizeNotionPageId(raw: string): string {
  const s = String(raw || "").replace(/-/g, "").trim();
  if (!/^[0-9a-fA-F]{32}$/.test(s)) return "";
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`.toLowerCase();
}

function collectPageRefs(prompt: string, maxCount: number): string[] {
  const text = String(prompt || "");
  const out: string[] = [];
  const seen = new Set<string>();

  for (const url of text.match(NOTION_URL_RE) || []) {
    const m = String(url || "").match(NOTION_PAGE_ID_RE);
    if (!m) continue;
    const pageId = normalizeNotionPageId(m[1]);
    if (!pageId || seen.has(pageId)) continue;
    seen.add(pageId);
    out.push(pageId);
    if (out.length >= maxCount) break;
  }

  return out;
}

function plainTextFromRichText(value: any): string {
  const arr = Array.isArray(value) ? value : [];
  const parts: string[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    if (typeof (item as any).plain_text === "string") {
      parts.push((item as any).plain_text);
      continue;
    }
    if ((item as any).text && typeof (item as any).text.content === "string") {
      parts.push((item as any).text.content);
    }
  }
  return parts.join("").trim();
}

function notionPageTitle(page: any): string {
  if (!page || typeof page !== "object") return "";
  const props = page.properties && typeof page.properties === "object" ? page.properties : {};
  for (const key of Object.keys(props)) {
    const p = (props as any)[key];
    if (!p || typeof p !== "object") continue;
    if ((p as any).type !== "title") continue;
    const text = plainTextFromRichText((p as any).title);
    if (text) return text;
  }
  return "";
}

async function fetchPage(baseUrl: string, token: string, notionVersion: string, pageId: string): Promise<any> {
  return await fetchJson(`${baseUrl}/pages/${pageId}`, {
    method: "GET",
    headers: {
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      "Notion-Version": notionVersion
    }
  });
}

function pagePromptLine(page: any): string {
  const id = typeof page.id === "string" ? page.id : "";
  const title = clipText(notionPageTitle(page), 220);
  const url = typeof page.url === "string" ? page.url : "";
  const edited = typeof page.last_edited_time === "string" ? page.last_edited_time : "";

  const lines = [`- page ${id}: ${title || "(untitled)"}`];
  if (url) lines.push(`  url: ${url}`);
  if (edited) lines.push(`  last edited: ${edited}`);
  return lines.join("\n");
}

function completionComment(opts: {
  jobId: string;
  status: string;
  finishedAt: string;
  exitCode: number | null;
  projectPath: string;
  summary: string;
}): string {
  return [
    "Agent Heaven run update",
    "",
    `- job: ${opts.jobId}`,
    `- status: ${opts.status}`,
    `- finished: ${opts.finishedAt || "n/a"}`,
    `- project: ${basename(opts.projectPath || "") || opts.projectPath || "n/a"}`,
    `- exit code: ${typeof opts.exitCode === "number" ? String(opts.exitCode) : "n/a"}`,
    "",
    "Summary:",
    clipText(opts.summary, 2_000) || "(no assistant summary)"
  ].join("\n");
}

function parseBindingPageId(binding: IntegrationBinding): string {
  const meta = binding && typeof binding.metadata === "object" ? (binding.metadata as any) : {};
  return normalizeNotionPageId(typeof meta.pageId === "string" ? meta.pageId : "");
}

function isCommentableStatus(status: string): boolean {
  const s = String(status || "").trim().toLowerCase();
  return s === "done" || s === "needs_attention" || s === "failed";
}

export const notionConnector: IntegrationConnector = {
  id: "notion",
  displayName: "Notion",
  capabilities: ["doc.read", "doc.comment"],

  async enrichPrompt(ctx) {
    const all = normalizeIntegrationsSettings(ctx.settings);
    const cfg = all.providers.notion;
    if (!cfg.enabled) return null;

    const pageIds = collectPageRefs(ctx.prompt, cfg.maxPagesPerPrompt);
    if (pageIds.length === 0) return null;

    const token = notionToken(cfg.token, cfg.tokenEnvVar);
    if (!token) {
      return {
        messages: [
          {
            connectorId: "notion",
            level: "warning",
            text: `Notion page URL detected, but ${notionMissingTokenHint(cfg.tokenEnvVar)}`
          }
        ]
      };
    }

    const pages: any[] = [];
    for (const pageId of pageIds) {
      const page = await fetchPage(cfg.apiBaseUrl, token, cfg.notionVersion, pageId);
      if (page && typeof page === "object") pages.push(page);
    }

    if (pages.length === 0) {
      return {
        messages: [
          {
            connectorId: "notion",
            level: "warning",
            text: "No Notion page could be resolved from the prompt."
          }
        ]
      };
    }

    const promptPrefix = ["Notion page context:", ...pages.map((p) => pagePromptLine(p))].join("\n\n");

    const bindings: IntegrationBinding[] = pages
      .map((page) => {
        const pageId = normalizeNotionPageId(typeof page.id === "string" ? page.id : "");
        if (!pageId) return null;
        return {
          connectorId: "notion",
          capability: "doc.comment",
          resourceType: "page",
          resourceId: pageId,
          externalRef: pageId,
          url: typeof page.url === "string" ? page.url : "",
          title: notionPageTitle(page),
          metadata: { pageId }
        } as IntegrationBinding;
      })
      .filter(Boolean) as IntegrationBinding[];

    return {
      promptPrefix,
      bindings,
      messages: [
        {
          connectorId: "notion",
          level: "info",
          text: `Attached ${bindings.length} Notion page context block${bindings.length > 1 ? "s" : ""}.`
        }
      ]
    };
  },

  async notifyRunCompleted(ctx) {
    const all = normalizeIntegrationsSettings(ctx.settings);
    const cfg = all.providers.notion;
    if (!cfg.enabled) return null;
    if (!isCommentableStatus(ctx.status)) return null;

    const token = notionToken(cfg.token, cfg.tokenEnvVar);
    if (!token) {
      return {
        messages: [
          {
            connectorId: "notion",
            level: "warning",
            text: `Skipping Notion completion comments: ${notionMissingTokenHint(cfg.tokenEnvVar)}`
          }
        ]
      };
    }

    const messages: Array<{ connectorId: string; level: "info" | "warning" | "error"; text: string }> = [];

    for (const binding of ctx.bindings) {
      if (binding.connectorId !== "notion" || binding.resourceType !== "page") continue;
      const pageId = parseBindingPageId(binding);
      if (!pageId) continue;

      await fetchJson(
        `${cfg.apiBaseUrl}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
            "Notion-Version": cfg.notionVersion,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            parent: { page_id: pageId },
            rich_text: [
              {
                type: "text",
                text: {
                  content: completionComment({
                    jobId: ctx.jobId,
                    status: ctx.status,
                    finishedAt: ctx.finishedAt,
                    exitCode: ctx.exitCode,
                    projectPath: ctx.projectPath,
                    summary: ctx.assistantSummary
                  })
                }
              }
            ]
          })
        },
        12_000
      );

      messages.push({
        connectorId: "notion",
        level: "info",
        text: `Posted completion comment to Notion page ${pageId}.`
      });
    }

    return { messages };
  }
};
