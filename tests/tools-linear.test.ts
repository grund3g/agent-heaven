import { beforeEach, describe, expect, it, vi } from "vitest";

const linearGraphqlMock = vi.hoisted(() => vi.fn());

vi.mock("../src/integrations/providers/linear", async () => {
  const actual = await vi.importActual<any>("../src/integrations/providers/linear");
  return {
    ...actual,
    linearGraphql: (...args: any[]) => linearGraphqlMock(...args)
  };
});

import { registerLinearTools } from "../src/mcp-server/tools-linear";

type ToolHandler = (args: any) => Promise<any>;

function buildHandlers() {
  const handlers = new Map<string, ToolHandler>();
  const server = {
    tool: (name: string, _description: string, _schema: any, handler: ToolHandler) => {
      handlers.set(name, handler);
    }
  } as any;

  registerLinearTools(server, () => ({
    integrations: {
      providers: {
        linear: {
          enabled: true,
          token: "lin_api_test"
        }
      }
    }
  }));

  return handlers;
}

describe("mcp-server/tools-linear", () => {
  beforeEach(() => {
    linearGraphqlMock.mockReset();
  });

  it("resolves linear_get_issue via searchIssues and exact identifier match", async () => {
    linearGraphqlMock.mockResolvedValue({
      searchIssues: {
        nodes: [
          {
            id: "issue-1",
            identifier: "DEV-1106",
            title: "Fix failing lookup",
            description: "details",
            url: "https://linear.app/x/issue/DEV-1106",
            state: { id: "s1", name: "Todo" },
            team: { key: "DEV", name: "Dev" },
            assignee: { name: "A", email: "a@example.com" },
            priority: 2,
            priorityLabel: "High",
            labels: { nodes: [{ name: "bug" }] },
            createdAt: "2024-01-01",
            updatedAt: "2024-01-02"
          },
          {
            id: "issue-2",
            identifier: "DEV-11067",
            title: "Wrong issue",
            description: "",
            url: "",
            state: { id: "s1", name: "Todo" },
            team: { key: "DEV", name: "Dev" },
            assignee: null,
            priority: 0,
            priorityLabel: "None",
            labels: { nodes: [] },
            createdAt: "",
            updatedAt: ""
          }
        ]
      }
    });

    const handlers = buildHandlers();
    const getIssue = handlers.get("linear_get_issue");
    expect(getIssue).toBeTypeOf("function");

    const res = await getIssue!({ identifier: "dev-1106" });

    expect(linearGraphqlMock).toHaveBeenCalledTimes(1);
    const [, , query, variables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(query || "")).toContain("searchIssues(term:");
    expect(String(query || "")).not.toContain("issue(identifier:");
    expect(variables).toEqual({ term: "DEV-1106", first: 25 });

    expect(res && res.isError).not.toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    const issue = JSON.parse(text);
    expect(issue.identifier).toBe("DEV-1106");
  });

  it("supports linear_read_issue as alias for get_issue", async () => {
    linearGraphqlMock.mockResolvedValue({
      searchIssues: {
        nodes: [{ id: "issue-1", identifier: "SEC-51", title: "Scope review", url: "https://linear.app/x/issue/SEC-51" }]
      }
    });

    const handlers = buildHandlers();
    const readIssue = handlers.get("linear_read_issue");
    expect(readIssue).toBeTypeOf("function");

    const res = await readIssue!({ identifier: "sec-51" });
    expect(linearGraphqlMock).toHaveBeenCalledTimes(1);
    const [, , query, variables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(query || "")).toContain("searchIssues(term:");
    expect(variables).toEqual({ term: "SEC-51", first: 25 });

    expect(res && res.isError).not.toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    const issue = JSON.parse(text);
    expect(issue.identifier).toBe("SEC-51");
  });

  it("lists Linear issues for a team resolved via teamKey", async () => {
    linearGraphqlMock.mockResolvedValueOnce({
      teams: { nodes: [{ id: "team-1", key: "SEC", name: "Security" }] }
    });
    linearGraphqlMock.mockResolvedValueOnce({
      team: {
        id: "team-1",
        key: "SEC",
        name: "Security",
        issues: {
          nodes: [
            {
              id: "issue-1",
              identifier: "SEC-51",
              title: "Scope review",
              url: "https://linear.app/signteq/issue/SEC-51",
              state: { name: "Todo" },
              assignee: { name: "Simon" },
              priority: 2,
              priorityLabel: "High",
              updatedAt: "2026-02-24T19:14:10.272Z"
            }
          ]
        }
      }
    });

    const handlers = buildHandlers();
    const listIssues = handlers.get("linear_list_issues");
    expect(listIssues).toBeTypeOf("function");

    const res = await listIssues!({ teamKey: "sec", limit: 5 });

    expect(linearGraphqlMock).toHaveBeenCalledTimes(2);
    const [, , teamQuery, teamVariables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(teamQuery || "")).toContain("teams(first:");
    expect(teamVariables).toEqual({ first: 250 });

    const [, , listQuery, listVariables] = linearGraphqlMock.mock.calls[1] || [];
    expect(String(listQuery || "")).toContain("team(id: $teamId)");
    expect(String(listQuery || "")).toContain("issues(first: $first)");
    expect(listVariables).toEqual({ teamId: "team-1", first: 5 });

    expect(res && res.isError).not.toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    const issues = JSON.parse(text);
    expect(issues).toEqual([
      {
        id: "issue-1",
        identifier: "SEC-51",
        title: "Scope review",
        url: "https://linear.app/signteq/issue/SEC-51",
        state: { name: "Todo" },
        assignee: { name: "Simon" },
        priority: 2,
        priorityLabel: "High",
        updatedAt: "2026-02-24T19:14:10.272Z",
        team: { id: "team-1", key: "SEC", name: "Security" }
      }
    ]);
  });

  it("lists Linear labels for a team resolved via teamKey", async () => {
    linearGraphqlMock.mockResolvedValueOnce({
      teams: { nodes: [{ id: "team-1", key: "ORG", name: "Org Team" }] }
    });
    linearGraphqlMock.mockResolvedValueOnce({
      team: {
        id: "team-1",
        key: "ORG",
        name: "Org Team",
        labels: {
          nodes: [
            { id: "label-2", name: "Feature", color: "#1f9cf0", description: "", isGroup: false },
            { id: "label-1", name: "Bug", color: "#f24f4f", description: "Regression", isGroup: false }
          ]
        }
      }
    });

    const handlers = buildHandlers();
    const listLabels = handlers.get("linear_list_labels");
    expect(listLabels).toBeTypeOf("function");

    const res = await listLabels!({
      teamKey: "org",
      query: "bug",
      limit: 10
    });

    expect(linearGraphqlMock).toHaveBeenCalledTimes(2);
    const [, , teamQuery, teamVariables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(teamQuery || "")).toContain("teams(first:");
    expect(teamVariables).toEqual({ first: 250 });

    const [, , labelsQuery, labelsVariables] = linearGraphqlMock.mock.calls[1] || [];
    expect(String(labelsQuery || "")).toContain("team(id: $teamId)");
    expect(String(labelsQuery || "")).toContain("labels(first:");
    expect(labelsVariables).toEqual({ teamId: "team-1", first: 250 });

    expect(res && res.isError).not.toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    const labels = JSON.parse(text);
    expect(labels).toEqual([
      {
        id: "label-1",
        name: "Bug",
        color: "#f24f4f",
        description: "Regression",
        isGroup: false,
        team: { id: "team-1", key: "ORG", name: "Org Team" }
      }
    ]);
  });

  it("lists workspace labels without team scope", async () => {
    linearGraphqlMock.mockResolvedValue({
      issueLabels: {
        nodes: [
          {
            id: "label-1",
            name: "Backend",
            color: "#475569",
            description: "",
            isGroup: false,
            team: { id: "team-1", key: "ORG", name: "Org Team" }
          },
          {
            id: "label-2",
            name: "Frontend",
            color: "#0ea5e9",
            description: "UI work",
            isGroup: false,
            team: { id: "team-2", key: "WEB", name: "Web Team" }
          }
        ]
      }
    });

    const handlers = buildHandlers();
    const listLabels = handlers.get("linear_list_labels");
    expect(listLabels).toBeTypeOf("function");

    const res = await listLabels!({ limit: 5 });

    expect(linearGraphqlMock).toHaveBeenCalledTimes(1);
    const [, , labelsQuery, labelsVariables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(labelsQuery || "")).toContain("issueLabels(first:");
    expect(labelsVariables).toEqual({ first: 250 });

    expect(res && res.isError).not.toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    const labels = JSON.parse(text);
    expect(labels).toEqual([
      {
        id: "label-1",
        name: "Backend",
        color: "#475569",
        description: null,
        isGroup: false,
        team: { id: "team-1", key: "ORG", name: "Org Team" }
      },
      {
        id: "label-2",
        name: "Frontend",
        color: "#0ea5e9",
        description: "UI work",
        isGroup: false,
        team: { id: "team-2", key: "WEB", name: "Web Team" }
      }
    ]);
  });

  it("creates a Linear issue via teamKey lookup", async () => {
    linearGraphqlMock.mockResolvedValueOnce({
      teams: { nodes: [{ id: "team-1", key: "ORG", name: "Org Team" }] }
    });
    linearGraphqlMock.mockResolvedValueOnce({
      issueCreate: {
        success: true,
        issue: {
          id: "issue-1",
          identifier: "ORG-23",
          title: "Research & User Testing",
          description: "Details",
          url: "https://linear.app/signteq/issue/ORG-23",
          state: { id: "state-1", name: "Backlog" },
          team: { id: "team-1", key: "ORG", name: "Org Team" },
          assignee: null,
          priority: 0,
          priorityLabel: "No priority",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01"
        }
      }
    });

    const handlers = buildHandlers();
    const createIssue = handlers.get("linear_create_issue");
    expect(createIssue).toBeTypeOf("function");

    const res = await createIssue!({
      teamKey: "org",
      title: "Research & User Testing",
      description: "Details"
    });

    expect(linearGraphqlMock).toHaveBeenCalledTimes(2);
    const [, , teamQuery, teamVariables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(teamQuery || "")).toContain("teams(first:");
    expect(teamVariables).toEqual({ first: 250 });

    const [, , createQuery, createVariables] = linearGraphqlMock.mock.calls[1] || [];
    expect(String(createQuery || "")).toContain("issueCreate(input:");
    expect(createVariables).toEqual({
      input: {
        teamId: "team-1",
        title: "Research & User Testing",
        description: "Details"
      }
    });

    expect(res && res.isError).not.toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    const payload = JSON.parse(text);
    expect(payload.success).toBe(true);
    expect(payload.issue.identifier).toBe("ORG-23");
  });

  it("creates a Linear issue directly via teamId", async () => {
    linearGraphqlMock.mockResolvedValue({
      issueCreate: {
        success: true,
        issue: {
          id: "issue-2",
          identifier: "ORG-24",
          title: "Direct team id path",
          description: "",
          url: "https://linear.app/signteq/issue/ORG-24",
          state: { id: "state-1", name: "Backlog" },
          team: { id: "team-1", key: "ORG", name: "Org Team" },
          assignee: null,
          priority: 0,
          priorityLabel: "No priority",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01"
        }
      }
    });

    const handlers = buildHandlers();
    const createIssue = handlers.get("linear_create_issue");
    expect(createIssue).toBeTypeOf("function");

    const res = await createIssue!({
      teamId: "team-1",
      title: "Direct team id path",
      labelIds: ["label-1", "label-1", "label-2", "  "]
    });

    expect(linearGraphqlMock).toHaveBeenCalledTimes(1);
    const [, , createQuery, createVariables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(createQuery || "")).toContain("issueCreate(input:");
    expect(createVariables).toEqual({
      input: {
        teamId: "team-1",
        title: "Direct team id path",
        labelIds: ["label-1", "label-2"]
      }
    });

    expect(res && res.isError).not.toBe(true);
  });

  it("updates a Linear issue by identifier", async () => {
    linearGraphqlMock.mockResolvedValueOnce({
      searchIssues: {
        nodes: [{ id: "issue-51", identifier: "SEC-51", title: "Before update" }]
      }
    });
    linearGraphqlMock.mockResolvedValueOnce({
      issueUpdate: {
        success: true,
        issue: {
          id: "issue-51",
          identifier: "SEC-51",
          title: "After update",
          labels: { nodes: [{ id: "label-1", name: "Non-Conformity" }] }
        }
      }
    });

    const handlers = buildHandlers();
    const updateIssue = handlers.get("linear_update_issue");
    expect(updateIssue).toBeTypeOf("function");

    const res = await updateIssue!({
      identifier: "sec-51",
      title: "After update",
      priority: 2,
      labelIds: ["label-1", "label-1", " "]
    });

    expect(linearGraphqlMock).toHaveBeenCalledTimes(2);
    const [, , lookupQuery, lookupVariables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(lookupQuery || "")).toContain("searchIssues(term:");
    expect(lookupVariables).toEqual({ term: "SEC-51", first: 25 });

    const [, , updateQuery, updateVariables] = linearGraphqlMock.mock.calls[1] || [];
    expect(String(updateQuery || "")).toContain("issueUpdate(id: $id, input: $input)");
    expect(updateVariables).toEqual({
      id: "issue-51",
      input: {
        title: "After update",
        priority: 2,
        labelIds: ["label-1"]
      }
    });

    expect(res && res.isError).not.toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    const payload = JSON.parse(text);
    expect(payload.success).toBe(true);
    expect(payload.issue.identifier).toBe("SEC-51");
  });

  it("sets labels on a Linear issue via issueId", async () => {
    linearGraphqlMock.mockResolvedValue({
      issueUpdate: {
        success: true,
        issue: { id: "issue-70", identifier: "SEC-70", labels: { nodes: [{ id: "label-2", name: "NC: Minor" }] } }
      }
    });

    const handlers = buildHandlers();
    const setLabels = handlers.get("linear_set_labels");
    expect(setLabels).toBeTypeOf("function");

    const res = await setLabels!({
      issueId: "issue-70",
      labelIds: ["label-2", "label-2", " "]
    });

    expect(linearGraphqlMock).toHaveBeenCalledTimes(1);
    const [, , updateQuery, updateVariables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(updateQuery || "")).toContain("issueUpdate(id: $id, input: $input)");
    expect(updateVariables).toEqual({
      id: "issue-70",
      input: { labelIds: ["label-2"] }
    });

    expect(res && res.isError).not.toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    const payload = JSON.parse(text);
    expect(payload.success).toBe(true);
    expect(payload.labelIds).toEqual(["label-2"]);
  });

  it("adds a label while preserving existing labels", async () => {
    linearGraphqlMock.mockResolvedValueOnce({
      searchIssues: {
        nodes: [{ id: "issue-70", identifier: "SEC-70", title: "Label target" }]
      }
    });
    linearGraphqlMock.mockResolvedValueOnce({
      issue: {
        id: "issue-70",
        identifier: "SEC-70",
        labels: { nodes: [{ id: "label-1" }] }
      }
    });
    linearGraphqlMock.mockResolvedValueOnce({
      issueUpdate: {
        success: true,
        issue: { id: "issue-70", identifier: "SEC-70", labels: { nodes: [{ id: "label-1" }, { id: "label-2" }] } }
      }
    });

    const handlers = buildHandlers();
    const addLabel = handlers.get("linear_add_label");
    expect(addLabel).toBeTypeOf("function");

    const res = await addLabel!({
      identifier: "SEC-70",
      labelId: "label-2"
    });

    expect(linearGraphqlMock).toHaveBeenCalledTimes(3);
    const [, , lookupQuery, lookupVariables] = linearGraphqlMock.mock.calls[0] || [];
    expect(String(lookupQuery || "")).toContain("searchIssues(term:");
    expect(lookupVariables).toEqual({ term: "SEC-70", first: 25 });

    const [, , readQuery, readVariables] = linearGraphqlMock.mock.calls[1] || [];
    expect(String(readQuery || "")).toContain("issue(id: $id)");
    expect(readVariables).toEqual({ id: "issue-70" });

    const [, , updateQuery, updateVariables] = linearGraphqlMock.mock.calls[2] || [];
    expect(String(updateQuery || "")).toContain("issueUpdate(id: $id, input: $input)");
    expect(updateVariables).toEqual({
      id: "issue-70",
      input: { labelIds: ["label-1", "label-2"] }
    });

    expect(res && res.isError).not.toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    const payload = JSON.parse(text);
    expect(payload.success).toBe(true);
    expect(payload.labelIds).toEqual(["label-1", "label-2"]);
  });

  it("returns error when teamId and teamKey are both missing for issue creation", async () => {
    const handlers = buildHandlers();
    const createIssue = handlers.get("linear_create_issue");
    expect(createIssue).toBeTypeOf("function");

    const res = await createIssue!({ title: "Missing team" });
    expect(linearGraphqlMock).toHaveBeenCalledTimes(0);
    expect(res && res.isError).toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    expect(text).toContain("Missing team information");
  });

  it("returns not found when only partial matches exist", async () => {
    linearGraphqlMock.mockResolvedValue({
      searchIssues: {
        nodes: [{ id: "issue-2", identifier: "DEV-11067", title: "Wrong issue" }]
      }
    });

    const handlers = buildHandlers();
    const getIssue = handlers.get("linear_get_issue");
    expect(getIssue).toBeTypeOf("function");

    const res = await getIssue!({ identifier: "DEV-1106" });
    expect(res && res.isError).toBe(true);
    const text = String(res && res.content && res.content[0] && res.content[0].text ? res.content[0].text : "");
    expect(text).toContain('No issue found for identifier "DEV-1106".');
  });
});
