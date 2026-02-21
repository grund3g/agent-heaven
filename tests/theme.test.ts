import { describe, expect, it } from "vitest";
import { effectiveColorScheme, normalizeColorScheme, normalizeTheme, windowBgForSettings, windowBgForTheme } from "../src/core/theme";

describe("core/theme", () => {
  it("normalizes theme + computes background colors", () => {
    expect(normalizeTheme("Nord")).toBe("heaven");
    expect(normalizeTheme("nope")).toBe("heaven");

    expect(windowBgForTheme("nord")).toBe("#0f1417");
    expect(windowBgForTheme("heaven")).toBe("#0f1417");

    expect(normalizeColorScheme("LIGHT")).toBe("light");
    expect(normalizeColorScheme("")).toBe("dark");
    expect(normalizeColorScheme("system")).toBe("dark");

    expect(effectiveColorScheme("light", { systemScheme: "dark" })).toBe("light");

    expect(windowBgForSettings({ uiColorScheme: "light", uiTheme: "nord" })).toBe("#eef2f6");
    expect(windowBgForSettings({ uiColorScheme: "dark", uiTheme: "nord" })).toBe("#0f1417");
  });
});
