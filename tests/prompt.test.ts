import { describe, expect, it } from "vitest";
import { isBoilerplatePromptLine, jobDisplayTitle, promptSummary } from "../src/core/prompt";

describe("core/prompt", () => {
  it("detects boilerplate-ish lines", () => {
    expect(isBoilerplatePromptLine("AGENTS.md instructions")).toBe(true);
    expect(isBoilerplatePromptLine("Available skills")).toBe(true);
    expect(isBoilerplatePromptLine("AH_STATUS: done")).toBe(true);
    expect(isBoilerplatePromptLine("status=done box=board agent=codex thread=t1 model=gpt-5")).toBe(true);
    expect(isBoilerplatePromptLine("")).toBe(true);
    expect(isBoilerplatePromptLine("Fix store migration")).toBe(false);
  });

  it("summarizes prompts and prefers the ask near the end", () => {
    const s = `
      # AGENTS.md instructions
      <INSTRUCTIONS>
      lots of setup
      </INSTRUCTIONS>

      Please refactor main.ts into smaller modules and add tests.
    `;
    expect(promptSummary(s)).toContain("Please refactor main.ts into smaller modules and add tests.");
  });

  it("ignores Agent Heaven metadata lines in summaries", () => {
    const s = [
      "Bitte den Commit-Vorschlag sinnvoll machen.",
      "status=done box=board agent=codex project=agent-heaven thread=t1 model=gpt-5 tokens in=1 out=2 turns=1",
      "-----",
      "[Agent Heaven internal]",
      "At the very end of your final reply, output exactly one line:",
      "AH_STATUS: done",
      "Do not add any other text after the AH_STATUS line."
    ].join("\n");

    const summary = promptSummary(s);
    expect(summary).toContain("Bitte den Commit-Vorschlag sinnvoll machen.");
    expect(summary).not.toContain("AH_STATUS");
    expect(summary).not.toContain("status=done");
  });

  it("falls back to fenced content when non-fenced yields nothing", () => {
    const s = ["```", "Please refactor and add tests", "```"].join("\n");
    expect(promptSummary(s)).toBe("Please refactor and add tests");
  });

  it("prefers LLM titles when available", () => {
    const job = {
      title: "Fallback title",
      titleLlm: "Fix store migration bug",
      prompts: [{ ts: "t1", text: "AGENTS.md instructions" }, { ts: "t2", text: "Something else" }]
    };
    expect(jobDisplayTitle(job)).toBe("Fix store migration bug");
  });

  it("uses stored title when no LLM title exists", () => {
    const job = {
      title: "Fallback title",
      titleLlm: "",
      prompts: [{ ts: "t1", text: "Fix store migration bug" }]
    };
    expect(jobDisplayTitle(job)).toBe("Fallback title");
  });

  it("does not apply extra heuristics to LLM output", () => {
    const job = {
      title: "Fallback title",
      titleLlm: "Was braeuchten wir?",
      prompts: [{ ts: "t1", text: "Fix store migration bug" }]
    };
    expect(jobDisplayTitle(job)).toBe("Was braeuchten wir?");
  });

  it("shows a pending title label while a job is running", () => {
    expect(jobDisplayTitle({ status: "running" })).toBe("Generating title...");
  });

  it("falls back to Untitled when no title information is available and job is not running", () => {
    expect(jobDisplayTitle({})).toBe("Untitled");
    expect(jobDisplayTitle({ status: "done" })).toBe("Untitled");
  });
});
