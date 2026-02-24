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

function normalizeLinearLabels(
  nodes: unknown,
  opts?: {
    fallbackTeam?: { id?: string; key?: string; name?: string } | null;
    query?: string;
    limit?: number;
  }
): Array<{
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  isGroup: boolean;
  team: { id: string | null; key: string | null; name: string | null } | null;
}> {
  const fallbackTeam = opts && opts.fallbackTeam ? opts.fallbackTeam : null;
  const rawQuery = String((opts && opts.query) || "").trim().toLowerCase();
  const limit = Math.min(Math.max(Number((opts && opts.limit) || 100) || 100, 1), 250);

  const list = Array.isArray(nodes) ? nodes : [];
  const seen = new Set<string>();
  const out: Array<{
    id: string;
    name: string;
    color: string | null;
    description: string | null;
    isGroup: boolean;
    team: { id: string | null; key: string | null; name: string | null } | null;
  }> = [];

  for (const node of list) {
    const id = String(node && (node as any).id ? (node as any).id : "").trim();
    const name = String(node && (node as any).name ? (node as any).name : "").trim();
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);

    if (rawQuery && !name.toLowerCase().includes(rawQuery)) continue;

    const color = String(node && (node as any).color ? (node as any).color : "").trim() || null;
    const description = String(node && (node as any).description ? (node as any).description : "").trim() || null;
    const labelTeam =
      node && (node as any).team && typeof (node as any).team === "object"
        ? ((node as any).team as any)
        : fallbackTeam && typeof fallbackTeam === "object"
          ? fallbackTeam
          : null;
    const teamId = String(labelTeam && (labelTeam as any).id ? (labelTeam as any).id : "").trim() || null;
    const teamKey = String(labelTeam && (labelTeam as any).key ? (labelTeam as any).key : "").trim() || null;
    const teamName = String(labelTeam && (labelTeam as any).name ? (labelTeam as any).name : "").trim() || null;

    out.push({
      id,
      name,
      color,
      description,
      isGroup: !!(node && (node as any).isGroup),
      team: teamId || teamKey || teamName ? { id: teamId, key: teamKey, name: teamName } : null
    });

    if (out.length >= limit) break;
  }

  return out.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
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
    "linear_list_labels",
    "List Linear issue labels. Optionally scope by team and filter by name.",
    {
      teamId: z.string().optional().describe("Linear team ID (UUID). Use this or teamKey to scope labels to one team."),
      teamKey: z.string().optional().describe("Linear team key like ENG. Used when teamId is not provided."),
      query: z.string().optional().describe("Optional case-insensitive text filter for label names."),
      limit: z.number().int().min(1).max(250).optional().describe("Max results (default 100)")
    },
    async ({ teamId, teamKey, query, limit }) => {
      const cfg = resolveLinearConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      try {
        const normalizedLimit = Math.min(Math.max(Number(limit || 100), 1), 250);
        const hasTeamScope = !!String(teamId || "").trim() || !!String(teamKey || "").trim();

        if (hasTeamScope) {
          const resolvedTeam = await resolveLinearTeamId(cfg, teamId, teamKey);
          if (!resolvedTeam.ok) {
            const errorText = (resolvedTeam as { error: string }).error;
            return { content: [{ type: "text" as const, text: errorText }], isError: true };
          }

          const data = await linearGraphql(
            cfg.apiBaseUrl,
            cfg.token,
            `query ($teamId: String!, $first: Int!) {
              team(id: $teamId) {
                id
                key
                name
                labels(first: $first, includeArchived: false) {
                  nodes {
                    id
                    name
                    color
                    description
                    isGroup
                  }
                }
              }
            }`,
            { teamId: resolvedTeam.teamId, first: 250 }
          );

          const team = data && (data as any).team && typeof (data as any).team === "object" ? ((data as any).team as any) : null;
          if (!team) {
            return { content: [{ type: "text" as const, text: `No Linear team found for ID "${resolvedTeam.teamId}".` }], isError: true };
          }

          const labels = normalizeLinearLabels(team && (team as any).labels && (team as any).labels.nodes, {
            fallbackTeam: {
              id: String((team as any).id || "").trim(),
              key: String((team as any).key || "").trim(),
              name: String((team as any).name || "").trim()
            },
            query: String(query || ""),
            limit: normalizedLimit
          });

          if (labels.length === 0) {
            const teamRef = String((team as any).key || (team as any).name || resolvedTeam.teamId || "").trim();
            const filterText = String(query || "").trim();
            return {
              content: [
                {
                  type: "text" as const,
                  text: filterText
                    ? `No labels found for team "${teamRef}" matching "${filterText}".`
                    : `No labels found for team "${teamRef}".`
                }
              ]
            };
          }

          return { content: [{ type: "text" as const, text: JSON.stringify(labels, null, 2) }] };
        }

        const data = await linearGraphql(
          cfg.apiBaseUrl,
          cfg.token,
          `query ($first: Int!) {
            issueLabels(first: $first, includeArchived: false) {
              nodes {
                id
                name
                color
                description
                isGroup
                team {
                  id
                  key
                  name
                }
              }
            }
          }`,
          { first: 250 }
        );

        const labels = normalizeLinearLabels(data && (data as any).issueLabels && (data as any).issueLabels.nodes, {
          query: String(query || ""),
          limit: normalizedLimit
        });
        if (labels.length === 0) {
          const filterText = String(query || "").trim();
          return {
            content: [
              {
                type: "text" as const,
                text: filterText ? `No labels found matching "${filterText}".` : "No labels found."
              }
            ]
          };
        }

        return { content: [{ type: "text" as const, text: JSON.stringify(labels, null, 2) }] };
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
