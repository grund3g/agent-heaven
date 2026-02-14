import { describe, expect, it } from "vitest";
import { addUsageTotals, toIntOrZero } from "../src/core/usage";

describe("core/usage", () => {
  it("coerces ints defensively", () => {
    expect(toIntOrZero(3.9)).toBe(3);
    expect(toIntOrZero("4")).toBe(4);
    expect(toIntOrZero("4.2")).toBe(4);
    expect(toIntOrZero("nope")).toBe(0);
    expect(toIntOrZero(undefined)).toBe(0);
  });

  it("adds usage totals and increments turns", () => {
    const res = addUsageTotals({ input_tokens: 1, output_tokens: 2, turns: 3 }, { input_tokens: 4, output_tokens: "5" });
    expect(res).toEqual({ input_tokens: 5, output_tokens: 7, turns: 4 });
  });
});

