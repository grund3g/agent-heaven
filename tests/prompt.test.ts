import { describe, expect, it } from "vitest";
import { guessTitleFromPrompt, isBoilerplatePromptLine, jobDisplayTitle, promptSummary } from "../src/core/prompt";

describe("core/prompt", () => {
  it("detects boilerplate-ish lines", () => {
    expect(isBoilerplatePromptLine("AGENTS.md instructions")).toBe(true);
    expect(isBoilerplatePromptLine("Available skills")).toBe(true);
    expect(isBoilerplatePromptLine("")).toBe(true);
    expect(isBoilerplatePromptLine("Fix store migration")).toBe(false);
  });

  it("summarizes prompts and prefers the 'ask' near the end", () => {
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

  it("guesses stable titles", () => {
    expect(guessTitleFromPrompt("")).toBe("Untitled");
    expect(guessTitleFromPrompt("# Skills")).toBe("Untitled");
    expect(guessTitleFromPrompt("Fix store migration bug")).toBe("Fix store migration bug");
  });

  it("creates compact titles for common prompts", () => {
    expect(guessTitleFromPrompt("Title summaries are still broken; card titles show the first lines of my prompt")).toBe(
      "Fix: Card title summaries"
    );
    expect(guessTitleFromPrompt("Can we implement search across old sessions and jobs?")).toBe("Session search");
    expect(guessTitleFromPrompt("Please add a system option to dark/light mode")).toBe("Theme: system option");
  });

  it("drops low-signal intros (EN/DE)", () => {
    expect(guessTitleFromPrompt("Ich habe jetzt mal versucht, Wispr Flow klaut beim Start den Fokus")).toBe(
      "Wispr Flow klaut beim Start den Fokus"
    );
    expect(guessTitleFromPrompt("I just tried, the card title is useless")).toBe("the card title is useless");
  });

  it("strips stacked prefixes (e.g. 'Kannst du bitte …')", () => {
    expect(guessTitleFromPrompt("Kannst du bitte Fix store migration bug")).toBe("Fix store migration bug");
  });

  it("drops generic outro questions/sign-offs", () => {
    expect(guessTitleFromPrompt("Fix store migration bug. Any ideas?")).toBe("Fix store migration bug");
    expect(guessTitleFromPrompt("Fix store migration bug. Thanks!")).toBe("Fix store migration bug");
    expect(guessTitleFromPrompt("Fix store migration bug. Was könnte man da noch machen?")).toBe("Fix store migration bug");

    // Same idea, but split across lines without punctuation between them.
    expect(guessTitleFromPrompt(["Fix store migration bug", "Any ideas?"].join("\n"))).toBe("Fix store migration bug");
    expect(guessTitleFromPrompt(["Fix store migration bug", "Was br\u00e4uchten wir?"].join("\n"))).toBe("Fix store migration bug");
    expect(guessTitleFromPrompt(["Fix store migration bug", "Was wir machen k\u00f6nnten?"].join("\n"))).toBe("Fix store migration bug");
  });

  it("derives display titles from earliest meaningful prompt", () => {
    const job = {
      title: "Fallback title",
      prompts: [{ ts: "t1", text: "AGENTS.md instructions" }, { ts: "t2", text: "Fix store migration bug" }]
    };
    expect(jobDisplayTitle(job)).toBe("Fix store migration bug");
  });

  it("prefers LLM titles when available", () => {
    const job = {
      title: "Fallback title",
      titleLlm: "Fix store migration bug",
      prompts: [{ ts: "t1", text: "AGENTS.md instructions" }, { ts: "t2", text: "Something else" }]
    };
    expect(jobDisplayTitle(job)).toBe("Fix store migration bug");
  });

  it("ignores low-signal LLM titles", () => {
    const job = {
      title: "Fallback title",
      titleLlm: "Was br\u00e4uchten wir?",
      prompts: [{ ts: "t1", text: "Fix store migration bug" }]
    };
    expect(jobDisplayTitle(job)).toBe("Fix store migration bug");
  });
});
