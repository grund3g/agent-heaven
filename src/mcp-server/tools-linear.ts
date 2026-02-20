import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { normalizeIntegrationsSettings } from "../integrations/settings";
import { linearAuthToken, linearGraphql } from "../integrations/providers/linear";
import { clipText } from "../integrations/providers/http";

function resolveLinearConfig(getSettings: () => any) {
  const all = normalizeIntegrationsSettings(getSettings());
  const cfg = all.providers.linear;
  if (!cfg.enabled) return { ok: false as const, error: "Linear integration is not enabled in Agent Heaven settings." };
  const token = linearAuthToken(cfg.token, cfg.tokenEnvVar);
  if (!token) return { ok: false as const, error: "No Linear API token configured. Set one in Agent Heaven settings or via the LINEAR_API_KEY environment variable." };
  return { ok: true as const, token, apiBaseUrl: cfg.apiBaseUrl };
}

export function registerLinearTools(server: McpServer, getSettings: () => any) {
  server.tool(
    "linear_get_issue",
    "Fetch a Linear issue by its identifier (e.g. ENG-123). Returns issue details including title, state, team, description, and URL.",
    { identifier: z.string().describe("Issue identifier like ENG-123") },
    async ({ identifier }) => {
      const cfg = resolveLinearConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      const data = await linearGraphql(
        cfg.apiBaseUrl,
        cfg.token,
        `query ($identifier: String!) {
          issue(identifier: $identifier) {
            id identifier title description url
            state { id name }
            team { key name }
            assignee { name email }
            priority priorityLabel
            labels { nodes { name } }
            createdAt updatedAt
          }
        }`,
        { identifier: String(identifier || "").trim().toUpperCase() }
      );

      const issue = data && typeof data === "object" ? (data as any).issue : null;
      if (!issue) return { content: [{ type: "text" as const, text: `No issue found for identifier "${identifier}".` }], isError: true };

      return { content: [{ type: "text" as const, text: JSON.stringify(issue, null, 2) }] };
    }
  );

  server.tool(
    "linear_search_issues",
    "Search Linear issues by text query. Returns matching issues with their identifiers, titles, states, and URLs.",
    {
      query: z.string().describe("Search text"),
      limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)")
    },
    async ({ query, limit }) => {
      const cfg = resolveLinearConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      const data = await linearGraphql(
        cfg.apiBaseUrl,
        cfg.token,
        `query ($query: String!, $first: Int!) {
          searchIssues(query: $query, first: $first) {
            nodes {
              id identifier title url
              state { name }
              team { key }
              assignee { name }
              priority priorityLabel
            }
          }
        }`,
        { query: String(query || ""), first: Math.min(limit || 10, 50) }
      );

      const nodes = data && (data as any).searchIssues && Array.isArray((data as any).searchIssues.nodes) ? (data as any).searchIssues.nodes : [];
      if (nodes.length === 0) return { content: [{ type: "text" as const, text: `No issues found for query "${query}".` }] };

      return { content: [{ type: "text" as const, text: JSON.stringify(nodes, null, 2) }] };
    }
  );

  server.tool(
    "linear_create_comment",
    "Post a comment on a Linear issue. Requires the internal Linear issue ID (UUID), not the identifier.",
    {
      issueId: z.string().describe("Linear issue ID (UUID)"),
      body: z.string().describe("Comment body in markdown")
    },
    async ({ issueId, body }) => {
      const cfg = resolveLinearConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      await linearGraphql(
        cfg.apiBaseUrl,
        cfg.token,
        `mutation ($issueId: String!, $body: String!) {
          commentCreate(input: { issueId: $issueId, body: $body }) {
            success
            comment { id }
          }
        }`,
        { issueId: String(issueId || "").trim(), body: clipText(body, 10_000) }
      );

      return { content: [{ type: "text" as const, text: `Comment posted to issue ${issueId}.` }] };
    }
  );
}
