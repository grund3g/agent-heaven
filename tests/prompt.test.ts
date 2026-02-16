import { describe, expect, it } from "vitest";
import { isBoilerplatePromptLine, jobDisplayTitle, promptSummary } from "../src/core/prompt";

describe("core/prompt", () => {
  it("detects boilerplate-ish lines", () => {
    expect(isBoilerplatePromptLine("AGENTS.md instructions")).toBe(true);
    expect(isBoilerplatePromptLine("Available skills")).toBe(true);
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

  it("falls back to Untitled when no title information is available", () => {
    expect(jobDisplayTitle({})).toBe("Untitled");
  });
});
