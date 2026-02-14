import { describe, expect, it } from "vitest";
import { needsAttentionHeuristic, promptNeedsAttentionHeuristic } from "../src/needs-attention";

describe("needs-attention", () => {
  it("ignores generic closing questions", () => {
    expect(needsAttentionHeuristic("All set. Any questions?")).toBe(false);
  });

  it("detects explicit asks", () => {
    expect(needsAttentionHeuristic("Please choose option A or option B?")).toBe(true);
    expect(needsAttentionHeuristic("Kannst du bitte bestätigen, ob das so passt?")).toBe(true);
  });

  it("ignores some rhetorical why/because patterns", () => {
    expect(needsAttentionHeuristic("Why? Because it is faster.")).toBe(false);
    expect(needsAttentionHeuristic("Warum? Weil es schneller ist.")).toBe(false);
  });

  it("marks question prompts as needs-attention-worthy (so answers aren't missed)", () => {
    expect(promptNeedsAttentionHeuristic("What is the capital of France?")).toBe(true);
    expect(promptNeedsAttentionHeuristic("Kannst du mir sagen, wie das funktioniert?")).toBe(true);
  });

  it("ignores question marks in URLs and code blocks for prompt detection", () => {
    expect(promptNeedsAttentionHeuristic("Fetch https://example.com/?q=foo")).toBe(false);
    expect(
      promptNeedsAttentionHeuristic("Run this:\\n```js\\nconst x = a ? b : c;\\n```\\nThen report back.")
    ).toBe(false);
  });
});
