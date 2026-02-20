import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { normalizeIntegrationsSettings } from "../integrations/settings";
import { notionToken, normalizeNotionPageId } from "../integrations/providers/notion";
import { fetchJson, clipText } from "../integrations/providers/http";

function resolveNotionConfig(getSettings: () => any) {
  const all = normalizeIntegrationsSettings(getSettings());
  const cfg = all.providers.notion;
  if (!cfg.enabled) return { ok: false as const, error: "Notion integration is not enabled in Agent Heaven settings." };
  const token = notionToken(cfg.token, cfg.tokenEnvVar);
  if (!token) return { ok: false as const, error: "No Notion API token configured. Set one in Agent Heaven settings or via the NOTION_API_KEY environment variable." };
  return { ok: true as const, token, apiBaseUrl: cfg.apiBaseUrl, notionVersion: cfg.notionVersion };
}

function notionHeaders(token: string, notionVersion: string): Record<string, string> {
  return {
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    "Notion-Version": notionVersion,
    "Content-Type": "application/json"
  };
}

export function registerNotionTools(server: McpServer, getSettings: () => any) {
  server.tool(
    "notion_get_page",
    "Fetch a Notion page by its ID. Returns page properties and metadata.",
    { pageId: z.string().describe("Notion page ID (UUID format, with or without dashes)") },
    async ({ pageId }) => {
      const cfg = resolveNotionConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      const normalized = normalizeNotionPageId(pageId);
      if (!normalized) return { content: [{ type: "text" as const, text: `Invalid Notion page ID: "${pageId}".` }], isError: true };

      const page = await fetchJson(
        `${cfg.apiBaseUrl}/pages/${normalized}`,
        { method: "GET", headers: notionHeaders(cfg.token, cfg.notionVersion) }
      );

      if (!page || typeof page !== "object") return { content: [{ type: "text" as const, text: `No page found for ID "${pageId}".` }], isError: true };

      return { content: [{ type: "text" as const, text: JSON.stringify(page, null, 2) }] };
    }
  );

  server.tool(
    "notion_create_comment",
    "Post a comment on a Notion page.",
    {
      pageId: z.string().describe("Notion page ID (UUID format, with or without dashes)"),
      body: z.string().describe("Comment text")
    },
    async ({ pageId, body }) => {
      const cfg = resolveNotionConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      const normalized = normalizeNotionPageId(pageId);
      if (!normalized) return { content: [{ type: "text" as const, text: `Invalid Notion page ID: "${pageId}".` }], isError: true };

      await fetchJson(
        `${cfg.apiBaseUrl}/comments`,
        {
          method: "POST",
          headers: notionHeaders(cfg.token, cfg.notionVersion),
          body: JSON.stringify({
            parent: { page_id: normalized },
            rich_text: [{ type: "text", text: { content: clipText(body, 2_000) } }]
          })
        },
        12_000
      );

      return { content: [{ type: "text" as const, text: `Comment posted to Notion page ${normalized}.` }] };
    }
  );
}
