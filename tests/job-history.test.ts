import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { JobHistory } from "../src/job-history";

describe("job-history", () => {
  let tmpDir = "";

  afterEach(() => {
    if (tmpDir) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
      tmpDir = "";
    }
  });

  it("saves, loads and removes jobs", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-jobs-"));
    const h = new JobHistory(tmpDir);

    expect(h.save({ id: "j1", foo: "bar" })).toBe(true);
    const all = h.loadAll();
    expect(all.some((j) => j && j.id === "j1")).toBe(true);
    expect(h.remove("j1")).toBe(true);
    expect(h.loadAll().some((j) => j && j.id === "j1")).toBe(false);
  });
});

