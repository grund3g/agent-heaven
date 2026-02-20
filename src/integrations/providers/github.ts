import { basename } from "node:path";
import { normalizeIntegrationsSettings } from "../settings";
import type { IntegrationBinding, IntegrationConnector } from "../types";
import { clipText, fetchJson } from "./http";

const ISSUE_URL_RE = /https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/issues\/(\d+)/g;
const SHORTHAND_RE = /\b([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)#(\d+)\b/g;

type IssueRef = { owner: string; repo: string; number: number };

function collectIssueRefs(prompt: string, maxCount: number): IssueRef[] {
  const text = String(prompt || "");
  const out: IssueRef[] = [];
  const seen = new Set<string>();

  const push = (owner: string, repo: string, n: string) => {
    const o = String(owner || "").trim();
    const r = String(repo || "").trim();
    const num = Number.parseInt(String(n || "").trim(), 10);
    if (!o || !r || !Number.isFinite(num) || num <= 0) return;
    const key = `${o}/${r}#${num}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ owner: o, repo: r, number: num });
  };

  for (const m of text.matchAll(ISSUE_URL_RE)) {
    push(m[1], m[2], m[3]);
    if (out.length >= maxCount) return out;
  }

  for (const m of text.matchAll(SHORTHAND_RE)) {
    push(m[1], m[2], m[3]);
    if (out.length >= maxCount) return out;
  }

  return out;
}

function githubToken(envVar: string): string {
  const name = String(envVar || "").trim();
  if (!name) return "";
  return String(process.env[name] || "").trim();
}

async function githubIssue(baseUrl: string, token: string, ref: IssueRef): Promise<any> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json"
  };

  if (token) {
    headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  return await fetchJson(`${baseUrl}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/issues/${ref.number}`, {
    method: "GET",
    headers
  });
}

function issuePromptLine(issue: any): string {
  const number = typeof issue.number === "number" ? issue.number : 0;
  const title = clipText(issue.title, 220);
  const state = typeof issue.state === "string" ? issue.state : "";
  const url = typeof issue.html_url === "string" ? issue.html_url : "";
  const repoUrl = typeof issue.repository_url === "string" ? issue.repository_url : "";
  let repoRef = "";
  const m = repoUrl.match(/\/repos\/([^/]+)\/([^/]+)$/);
  if (m) repoRef = `${m[1]}/${m[2]}`;

  const lines = [`- ${repoRef ? `${repoRef}#${number}` : `#${number}`}: ${title}`];
  if (state) lines.push(`  state: ${state}`);
  if (url) lines.push(`  url: ${url}`);
  const body = clipText(issue.body, 1_200);
  if (body) lines.push(`  body: ${body}`);
  return lines.join("\n");
}

function commentBody(opts: {
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
    clipText(opts.summary, 6_000) || "(no assistant summary)"
  ].join("\n");
}

function parseBindingRef(binding: IntegrationBinding): IssueRef | null {
  const meta = binding && typeof binding.metadata === "object" ? (binding.metadata as any) : {};
  const owner = typeof meta.owner === "string" ? meta.owner.trim() : "";
  const repo = typeof meta.repo === "string" ? meta.repo.trim() : "";
  const number = typeof meta.number === "number" ? meta.number : Number(meta.number);
  if (!owner || !repo || !Number.isFinite(number) || number <= 0) return null;
  return { owner, repo, number };
}

function isCommentableStatus(status: string): boolean {
  const s = String(status || "").trim().toLowerCase();
  return s === "done" || s === "needs_attention" || s === "failed";
}

export const githubConnector: IntegrationConnector = {
  id: "github",
  displayName: "GitHub",
  capabilities: ["ticket.read", "ticket.comment"],

  async enrichPrompt(ctx) {
    const all = normalizeIntegrationsSettings(ctx.settings);
    const cfg = all.providers.github;
    if (!cfg.enabled) return null;

    const refs = collectIssueRefs(ctx.prompt, cfg.maxIssuesPerPrompt);
    if (refs.length === 0) return null;

    const token = githubToken(cfg.tokenEnvVar);
    const issues: any[] = [];

    for (const ref of refs) {
      const issue = await githubIssue(cfg.apiBaseUrl, token, ref);
      if (issue && typeof issue === "object") issues.push(issue);
    }

    if (issues.length === 0) {
      return {
        messages: [
          {
            connectorId: "github",
            level: "warning",
            text: "Issue reference detected, but GitHub issue details could not be fetched."
          }
        ]
      };
    }

    const promptPrefix = ["GitHub issue context:", ...issues.map((issue) => issuePromptLine(issue))].join("\n\n");

    const bindings: IntegrationBinding[] = issues
      .map((issue) => {
        const owner = issue && issue.repository_url ? String(issue.repository_url).split("/repos/")[1]?.split("/")[0] : "";
        const repo = issue && issue.repository_url ? String(issue.repository_url).split("/repos/")[1]?.split("/")[1] : "";
        const number = typeof issue.number === "number" ? issue.number : 0;
        if (!owner || !repo || !number) return null;
        const externalRef = `${owner}/${repo}#${number}`;
        return {
          connectorId: "github",
          capability: "ticket.comment",
          resourceType: "issue",
          resourceId: externalRef,
          externalRef,
          url: typeof issue.html_url === "string" ? issue.html_url : "",
          title: typeof issue.title === "string" ? issue.title : "",
          metadata: { owner, repo, number }
        } as IntegrationBinding;
      })
      .filter(Boolean) as IntegrationBinding[];

    return {
      promptPrefix,
      bindings,
      messages: [
        {
          connectorId: "github",
          level: "info",
          text: `Attached ${bindings.length} GitHub issue context block${bindings.length > 1 ? "s" : ""}.`
        }
      ]
    };
  },

  async notifyRunCompleted(ctx) {
    const all = normalizeIntegrationsSettings(ctx.settings);
    const cfg = all.providers.github;
    if (!cfg.enabled) return null;
    if (!isCommentableStatus(ctx.status)) return null;

    const token = githubToken(cfg.tokenEnvVar);
    if (!token) {
      return {
        messages: [
          {
            connectorId: "github",
            level: "warning",
            text: `Skipping GitHub completion comments because ${cfg.tokenEnvVar} is not set.`
          }
        ]
      };
    }

    const messages: Array<{ connectorId: string; level: "info" | "warning" | "error"; text: string }> = [];

    for (const binding of ctx.bindings) {
      if (binding.connectorId !== "github" || binding.resourceType !== "issue") continue;
      const ref = parseBindingRef(binding);
      if (!ref) continue;

      await fetchJson(
        `${cfg.apiBaseUrl}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/issues/${ref.number}/comments`,
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            body: commentBody({
              jobId: ctx.jobId,
              status: ctx.status,
              finishedAt: ctx.finishedAt,
              exitCode: ctx.exitCode,
              projectPath: ctx.projectPath,
              summary: ctx.assistantSummary
            })
          })
        },
        12_000
      );

      messages.push({
        connectorId: "github",
        level: "info",
        text: `Posted completion comment to GitHub issue ${ref.owner}/${ref.repo}#${ref.number}.`
      });
    }

    return { messages };
  }
};
