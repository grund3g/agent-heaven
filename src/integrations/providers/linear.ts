import { basename } from "node:path";
import { normalizeIntegrationsSettings } from "../settings";
import type { IntegrationBinding, IntegrationConnector } from "../types";
import { clipText, fetchJson } from "./http";

const ISSUE_IDENTIFIER_RE = /\b[A-Z][A-Z0-9]{1,11}-\d+\b/g;

function collectIssueIdentifiers(prompt: string, maxCount: number): string[] {
  const raw = String(prompt || "");
  const matches = raw.match(ISSUE_IDENTIFIER_RE) || [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of matches) {
    const key = String(m || "").trim().toUpperCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
    if (out.length >= maxCount) break;
  }
  return out;
}

export function linearAuthToken(token: string, envVar: string): string {
  const direct = String(token || "").trim();
  if (direct) return direct;
  const name = String(envVar || "").trim();
  if (!name) return "";
  return String(process.env[name] || "").trim();
}

function linearMissingTokenHint(envVar: string): string {
  const name = String(envVar || "").trim();
  if (name) return `no token configured (token field empty and env var ${name} not set).`;
  return "no token configured.";
}

export async function linearGraphql(url: string, token: string, query: string, variables: Record<string, any>): Promise<any> {
  const payload = await fetchJson(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables })
    },
    12_000
  );

  if (payload && Array.isArray((payload as any).errors) && (payload as any).errors.length > 0) {
    const first = (payload as any).errors[0];
    const msg = first && typeof first === "object" ? String((first as any).message || "Linear GraphQL error") : "Linear GraphQL error";
    throw new Error(msg);
  }

  return payload && typeof payload === "object" ? (payload as any).data : null;
}

function issuePromptLine(issue: any, includeDescription: boolean): string {
  const identifier = typeof issue.identifier === "string" ? issue.identifier : "";
  const title = clipText(issue.title, 200);
  const state = issue && issue.state && typeof issue.state.name === "string" ? clipText(issue.state.name, 80) : "";
  const url = typeof issue.url === "string" ? issue.url : "";
  const team = issue && issue.team && typeof issue.team.key === "string" ? issue.team.key : "";
  const parts = [`- ${identifier}: ${title}`];
  if (state) parts.push(`  state: ${state}`);
  if (team) parts.push(`  team: ${team}`);
  if (url) parts.push(`  url: ${url}`);

  if (includeDescription) {
    const description = clipText(issue.description, 1_400);
    if (description) parts.push(`  description: ${description}`);
  }

  return parts.join("\n");
}

function completionComment(opts: {
  jobId: string;
  status: string;
  finishedAt: string;
  exitCode: number | null;
  projectPath: string;
  summary: string;
}): string {
  const lines = [
    "Agent Heaven run update",
    "",
    `- job: ${opts.jobId}`,
    `- status: ${opts.status}`,
    `- finished: ${opts.finishedAt || "n/a"}`,
    `- project: ${basename(opts.projectPath || "") || opts.projectPath || "n/a"}`,
    `- exit code: ${typeof opts.exitCode === "number" ? String(opts.exitCode) : "n/a"}`,
    "",
    "Summary:",
    clipText(opts.summary, 6_000) || "(no assistant summary)"
  ];
  return lines.join("\n");
}

function isCommentableStatus(status: string): boolean {
  const s = String(status || "").trim().toLowerCase();
  return s === "done" || s === "needs_attention" || s === "failed";
}

function bindingToIssueId(binding: IntegrationBinding): string {
  return typeof binding.resourceId === "string" ? binding.resourceId.trim() : "";
}

export const linearConnector: IntegrationConnector = {
  id: "linear",
  displayName: "Linear",
  capabilities: ["ticket.read", "ticket.comment"],

  async enrichPrompt(ctx) {
    const all = normalizeIntegrationsSettings(ctx.settings);
    const cfg = all.providers.linear;
    if (!cfg.enabled) return null;

    const identifiers = collectIssueIdentifiers(ctx.prompt, cfg.maxIssuesPerPrompt);
    if (identifiers.length === 0) return null;

    const token = linearAuthToken(cfg.token, cfg.tokenEnvVar);
    if (!token) {
      return {
        messages: [
          {
            connectorId: "linear",
            level: "warning",
            text: `Issue reference detected (${identifiers.join(", ")}), but ${linearMissingTokenHint(cfg.tokenEnvVar)}`
          }
        ]
      };
    }

    const issues: any[] = [];
    for (const identifier of identifiers) {
      const data = await linearGraphql(
        cfg.apiBaseUrl,
        token,
        `query AgentHeavenIssueByIdentifier($identifier: String!) {
          issue(identifier: $identifier) {
            id
            identifier
            title
            description
            url
            state { name }
            team { key name }
          }
        }`,
        { identifier }
      );

      const issue = data && typeof data === "object" ? (data as any).issue : null;
      if (!issue || typeof issue !== "object") continue;
      issues.push(issue);
    }

    if (issues.length === 0) {
      return {
        messages: [
          {
            connectorId: "linear",
            level: "warning",
            text: `No Linear issue found for ${identifiers.join(", ")}.`
          }
        ]
      };
    }

    const promptPrefix = ["Linear issue context:", ...issues.map((x) => issuePromptLine(x, cfg.includeDescription))].join("\n\n");
    const bindings: IntegrationBinding[] = issues
      .map((issue) => {
        const issueId = typeof issue.id === "string" ? issue.id.trim() : "";
        const identifier = typeof issue.identifier === "string" ? issue.identifier.trim() : "";
        if (!issueId || !identifier) return null;
        return {
          connectorId: "linear",
          capability: "ticket.comment",
          resourceType: "issue",
          resourceId: issueId,
          externalRef: identifier,
          url: typeof issue.url === "string" ? issue.url : "",
          title: typeof issue.title === "string" ? issue.title : ""
        } as IntegrationBinding;
      })
      .filter(Boolean) as IntegrationBinding[];

    return {
      promptPrefix,
      bindings,
      messages: [
        {
          connectorId: "linear",
          level: "info",
          text: `Attached ${issues.length} Linear issue context block${issues.length > 1 ? "s" : ""}.`
        }
      ]
    };
  },

  async notifyRunCompleted(ctx) {
    const all = normalizeIntegrationsSettings(ctx.settings);
    const cfg = all.providers.linear;
    if (!cfg.enabled) return null;
    if (!isCommentableStatus(ctx.status)) return null;

    const token = linearAuthToken(cfg.token, cfg.tokenEnvVar);
    if (!token) {
      return {
        messages: [
          {
            connectorId: "linear",
            level: "warning",
            text: `Skipping Linear completion comment: ${linearMissingTokenHint(cfg.tokenEnvVar)}`
          }
        ]
      };
    }

    const uniqueIssueIds = new Set<string>();
    const targets = ctx.bindings.filter((b) => b.connectorId === "linear" && b.resourceType === "issue");

    const messages: Array<{ connectorId: string; level: "info" | "warning" | "error"; text: string }> = [];

    for (const binding of targets) {
      const issueId = bindingToIssueId(binding);
      if (!issueId || uniqueIssueIds.has(issueId)) continue;
      uniqueIssueIds.add(issueId);

      const body = completionComment({
        jobId: ctx.jobId,
        status: ctx.status,
        finishedAt: ctx.finishedAt,
        exitCode: ctx.exitCode,
        projectPath: ctx.projectPath,
        summary: ctx.assistantSummary
      });

      await linearGraphql(
        cfg.apiBaseUrl,
        token,
        `mutation AgentHeavenCommentCreate($issueId: String!, $body: String!) {
          commentCreate(input: { issueId: $issueId, body: $body }) {
            success
          }
        }`,
        { issueId, body }
      );

      const ref = binding.externalRef || issueId;
      messages.push({
        connectorId: "linear",
        level: "info",
        text: `Posted completion comment to Linear issue ${ref}.`
      });
    }

    return { messages };
  }
};
