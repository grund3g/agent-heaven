import { describe, expect, it } from "vitest";
import { isFalseyEnv, isTruthyEnv } from "../src/core/env";

describe("core/env", () => {
  it("parses truthy/falsey env vars", () => {
    const key = "AGENT_HEAVEN_TEST_ENV";
    const prev = process.env[key];

    try {
      process.env[key] = "1";
      expect(isTruthyEnv(key)).toBe(true);
      expect(isFalseyEnv(key)).toBe(false);

      process.env[key] = "true";
      expect(isTruthyEnv(key)).toBe(true);

      process.env[key] = " YES ";
      expect(isTruthyEnv(key)).toBe(true);

      process.env[key] = "0";
      expect(isFalseyEnv(key)).toBe(true);
      expect(isTruthyEnv(key)).toBe(false);

      process.env[key] = "off";
      expect(isFalseyEnv(key)).toBe(true);
    } finally {
      if (prev === undefined) delete process.env[key];
      else process.env[key] = prev;
    }
  });
});

