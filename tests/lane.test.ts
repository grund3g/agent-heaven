import { describe, expect, it } from "vitest";
import { normalizeLaneKey } from "../src/core/lane";

describe("core/lane", () => {
  it("normalizes lane keys", () => {
    expect(normalizeLaneKey("running")).toBe("running");
    expect(normalizeLaneKey("done")).toBe("done");
    expect(normalizeLaneKey("needs-attention")).toBe("attention");
    expect(normalizeLaneKey("needs_attention")).toBe("attention");
    expect(normalizeLaneKey("attn")).toBe("attention");
    expect(normalizeLaneKey("unknown")).toBe("");
  });
});

