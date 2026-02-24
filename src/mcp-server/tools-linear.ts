import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { normalizeIntegrationsSettings } from "../integrations/settings";
import { linearAuthToken, linearGraphql } from "../integrations/providers/linear";
import { clipText } from "../integrations/providers/http";

function linearToolFailureMessage(err: unknown): string {
  const msg = String(err && (err as any).message ? (err as any).message : err || "Linear request failed").trim();
  const low = msg.toLowerCase();
  const configLike =
    low.includes("auth") ||
    low.includes("token") ||
    low.includes("unauthor") ||
    low.includes("forbidden") ||
    low.includes("permission") ||
    low.includes("integration is not enabled") ||
    low.includes("no linear api token configured");

  if (configLike) {
    return [
      `Linear access is not configured: ${msg}`,
      "Action: ask the user to enable/fix Linear integration in Agent Heaven settings.",
      "Do not try alternate endpoints or local token hunting."
    ].join("\n");
  }
  return `Linear request failed: ${msg}`;
}

function resolveLinearConfig(getSettings: () => any) {
  const all = normalizeIntegrationsSettings(getSettings());
  const cfg = all.providers.linear;
  if (!cfg.enabled) {
    return {
      ok: false as const,
      error: [
        "Linear integration is not enabled in Agent Heaven settings.",
        "Action: ask the user to enable Linear integration in Agent Heaven settings.",
        "Do not try alternate endpoints or local token hunting."
      ].join("\n")
    };
  }
  const token = linearAuthToken(cfg.token, cfg.tokenEnvVar);
  if (!token) {
    return {
      ok: false as const,
      error: [
        "No Linear API token configured. Set one in Agent Heaven settings or via the LINEAR_API_KEY environment variable.",
        "Action: ask the user to set a Linear token in settings/env.",
        "Do not try alternate endpoints or local token hunting."
      ].join("\n")
    };
  }
  return { ok: true as const, token, apiBaseUrl: cfg.apiBaseUrl };
}

async function resolveLinearTeamId(
  cfg: { apiBaseUrl: string; token: string },
  teamId: unknown,
  teamKey: unknown
): Promise<{ ok: true; teamId: string } | { ok: false; error: string }> {
  const directTeamId = String(teamId || "").trim();
  if (directTeamId) return { ok: true, teamId: directTeamId };

  const normalizedTeamKey = String(teamKey || "").trim().toUpperCase();
  if (!normalizedTeamKey) {
    return {
      ok: false,
      error: 'Missing team information. Provide either "teamId" or "teamKey" (for example "ENG").'
    };
  }

  const data = await linearGraphql(
    cfg.apiBaseUrl,
    cfg.token,
    `query ($first: Int!) {
      teams(first: $first) {
        nodes { id key name }
      }
    }`,
    { first: 250 }
  );

  const nodes = data && (data as any).teams && Array.isArray((data as any).teams.nodes) ? ((data as any).teams.nodes as any[]) : [];
  const team =
    nodes.find((node) => String(node && (node as any).key ? (node as any).key : "").trim().toUpperCase() === normalizedTeamKey) || null;
  const resolvedTeamId = team && typeof (team as any).id === "string" ? String((team as any).id || "").trim() : "";
  if (!resolvedTeamId) {
    return { ok: false, error: `No Linear team found for key "${normalizedTeamKey}".` };
  }

  return { ok: true, teamId: resolvedTeamId };
}

export function registerLinearTools(server: McpServer, getSettings: () => any) {
  server.tool(
    "linear_get_issue",
    "Fetch a Linear issue by its identifier (e.g. ENG-123). Returns issue details including title, state, team, description, and URL.",
    { identifier: z.string().describe("Issue identifier like ENG-123") },
    async ({ identifier }) => {
      const cfg = resolveLinearConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      try {
        const normalizedIdentifier = String(identifier || "").trim().toUpperCase();
        if (!normalizedIdentifier) {
          return { content: [{ type: "text" as const, text: "Missing issue identifier." }], isError: true };
        }

        const data = await linearGraphql(
          cfg.apiBaseUrl,
          cfg.token,
          `query ($term: String!, $first: Int!) {
            searchIssues(term: $term, first: $first) {
              nodes {
                id identifier title description url
                state { id name }
                team { key name }
                assignee { name email }
                priority priorityLabel
                labels { nodes { name } }
                createdAt updatedAt
              }
            }
          }`,
          { term: normalizedIdentifier, first: 25 }
        );

        const nodes =
          data && (data as any).searchIssues && Array.isArray((data as any).searchIssues.nodes)
            ? ((data as any).searchIssues.nodes as any[])
            : [];
        const issue =
          nodes.find((node) => String(node && (node as any).identifier ? (node as any).identifier : "").trim().toUpperCase() === normalizedIdentifier) ||
          null;

        if (!issue) return { content: [{ type: "text" as const, text: `No issue found for identifier "${identifier}".` }], isError: true };

        return { content: [{ type: "text" as const, text: JSON.stringify(issue, null, 2) }] };
      } catch (err: any) {
        return { content: [{ type: "text" as const, text: linearToolFailureMessage(err) }], isError: true };
      }
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

      try {
        const data = await linearGraphql(
          cfg.apiBaseUrl,
          cfg.token,
          `query ($term: String!, $first: Int!) {
            searchIssues(term: $term, first: $first) {
              nodes {
                id identifier title url
                state { name }
                team { key }
                assignee { name }
                priority priorityLabel
              }
            }
          }`,
          { term: String(query || ""), first: Math.min(limit || 10, 50) }
        );

        const nodes = data && (data as any).searchIssues && Array.isArray((data as any).searchIssues.nodes) ? (data as any).searchIssues.nodes : [];
        if (nodes.length === 0) return { content: [{ type: "text" as const, text: `No issues found for query "${query}".` }] };

        return { content: [{ type: "text" as const, text: JSON.stringify(nodes, null, 2) }] };
      } catch (err: any) {
        return { content: [{ type: "text" as const, text: linearToolFailureMessage(err) }], isError: true };
      }
    }
  );

  server.tool(
    "linear_create_issue",
    "Create a Linear issue. Provide either teamId (UUID) or teamKey (e.g. ENG), plus a title.",
    {
      title: z.string().describe("Issue title"),
      teamId: z.string().optional().describe("Linear team ID (UUID). Use this or teamKey."),
      teamKey: z.string().optional().describe("Linear team key like ENG. Used when teamId is not provided."),
      description: z.string().optional().describe("Issue description in markdown"),
      priority: z.number().int().min(0).max(4).optional().describe("Priority (0 none, 1 urgent, 2 high, 3 normal, 4 low)"),
      stateId: z.string().optional().describe("Workflow state ID (UUID)"),
      assigneeId: z.string().optional().describe("Assignee user ID (UUID)"),
      projectId: z.string().optional().describe("Project ID (UUID)"),
      labelIds: z.array(z.string()).max(30).optional().describe("Label IDs (UUID array)")
    },
    async ({ title, teamId, teamKey, description, priority, stateId, assigneeId, projectId, labelIds }) => {
      const cfg = resolveLinearConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      try {
        const resolvedTeam = await resolveLinearTeamId(cfg, teamId, teamKey);
        if (!resolvedTeam.ok) {
          const errorText = (resolvedTeam as { error: string }).error;
          return { content: [{ type: "text" as const, text: errorText }], isError: true };
        }

        const normalizedTitle = clipText(String(title || "").trim(), 512);
        if (!normalizedTitle) {
          return { content: [{ type: "text" as const, text: "Missing issue title." }], isError: true };
        }

        const input: Record<string, any> = {
          teamId: resolvedTeam.teamId,
          title: normalizedTitle
        };
        const normalizedDescription = clipText(String(description || "").trim(), 10_000);
        if (normalizedDescription) input.description = normalizedDescription;
        if (typeof priority === "number") input.priority = priority;

        const normalizedStateId = String(stateId || "").trim();
        if (normalizedStateId) input.stateId = normalizedStateId;

        const normalizedAssigneeId = String(assigneeId || "").trim();
        if (normalizedAssigneeId) input.assigneeId = normalizedAssigneeId;

        const normalizedProjectId = String(projectId || "").trim();
        if (normalizedProjectId) input.projectId = normalizedProjectId;

        const normalizedLabelIds = Array.from(
          new Set((Array.isArray(labelIds) ? labelIds : []).map((id) => String(id || "").trim()).filter(Boolean))
        ).slice(0, 30);
        if (normalizedLabelIds.length > 0) input.labelIds = normalizedLabelIds;

        const data = await linearGraphql(
          cfg.apiBaseUrl,
          cfg.token,
          `mutation ($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              success
              issue {
                id
                identifier
                title
                description
                url
                state { id name }
                team { id key name }
                assignee { id name email }
                priority
                priorityLabel
                createdAt
                updatedAt
              }
            }
          }`,
          { input }
        );

        const payload = data && (data as any).issueCreate && typeof (data as any).issueCreate === "object" ? (data as any).issueCreate : null;
        const issue = payload && typeof (payload as any).issue === "object" ? (payload as any).issue : null;
        if (!issue) {
          return { content: [{ type: "text" as const, text: "Linear issue creation failed." }], isError: true };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: payload ? (payload as any).success !== false : true, issue }, null, 2)
            }
          ]
        };
      } catch (err: any) {
        return { content: [{ type: "text" as const, text: linearToolFailureMessage(err) }], isError: true };
      }
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

      try {
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
      } catch (err: any) {
        return { content: [{ type: "text" as const, text: linearToolFailureMessage(err) }], isError: true };
      }
    }
  );
}
