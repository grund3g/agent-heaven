import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { normalizeIntegrationsSettings } from "../integrations/settings";
import { githubToken } from "../integrations/providers/github";
import { fetchJson, clipText } from "../integrations/providers/http";

function resolveGithubConfig(getSettings: () => any) {
  const all = normalizeIntegrationsSettings(getSettings());
  const cfg = all.providers.github;
  if (!cfg.enabled) return { ok: false as const, error: "GitHub integration is not enabled in Agent Heaven settings." };
  const token = githubToken(cfg.token, cfg.tokenEnvVar);
  if (!token) return { ok: false as const, error: "No GitHub token configured. Set one in Agent Heaven settings or via the GITHUB_TOKEN environment variable." };
  return { ok: true as const, token, apiBaseUrl: cfg.apiBaseUrl };
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

export function registerGithubTools(server: McpServer, getSettings: () => any) {
  server.tool(
    "github_get_issue",
    "Fetch a GitHub issue or pull request by owner, repo, and number. Returns full issue details.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      number: z.number().int().positive().describe("Issue or PR number")
    },
    async ({ owner, repo, number }) => {
      const cfg = resolveGithubConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      const issue = await fetchJson(
        `${cfg.apiBaseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${number}`,
        { method: "GET", headers: githubHeaders(cfg.token) }
      );

      if (!issue || typeof issue !== "object") return { content: [{ type: "text" as const, text: `No issue found for ${owner}/${repo}#${number}.` }], isError: true };

      return { content: [{ type: "text" as const, text: JSON.stringify(issue, null, 2) }] };
    }
  );

  server.tool(
    "github_list_issues",
    "List issues in a GitHub repository. Returns an array of issues matching the filters.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      state: z.enum(["open", "closed", "all"]).optional().describe("Filter by state (default: open)"),
      labels: z.string().optional().describe("Comma-separated label names to filter by"),
      per_page: z.number().int().min(1).max(100).optional().describe("Results per page (default: 10)")
    },
    async ({ owner, repo, state, labels, per_page }) => {
      const cfg = resolveGithubConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      const params = new URLSearchParams();
      params.set("state", state || "open");
      params.set("per_page", String(per_page || 10));
      if (labels) params.set("labels", labels);

      const issues = await fetchJson(
        `${cfg.apiBaseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?${params}`,
        { method: "GET", headers: githubHeaders(cfg.token) }
      );

      if (!Array.isArray(issues)) return { content: [{ type: "text" as const, text: "No issues found." }] };

      const summary = issues.map((i: any) => ({
        number: i.number,
        title: i.title,
        state: i.state,
        html_url: i.html_url,
        labels: Array.isArray(i.labels) ? i.labels.map((l: any) => l.name) : [],
        assignee: i.assignee ? i.assignee.login : null,
        created_at: i.created_at
      }));

      return { content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }] };
    }
  );

  server.tool(
    "github_create_comment",
    "Post a comment on a GitHub issue or pull request.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      number: z.number().int().positive().describe("Issue or PR number"),
      body: z.string().describe("Comment body in markdown")
    },
    async ({ owner, repo, number, body }) => {
      const cfg = resolveGithubConfig(getSettings);
      if (!cfg.ok) return { content: [{ type: "text" as const, text: cfg.error }], isError: true };

      await fetchJson(
        `${cfg.apiBaseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${number}/comments`,
        {
          method: "POST",
          headers: githubHeaders(cfg.token),
          body: JSON.stringify({ body: clipText(body, 10_000) })
        },
        12_000
      );

      return { content: [{ type: "text" as const, text: `Comment posted to ${owner}/${repo}#${number}.` }] };
    }
  );
}
