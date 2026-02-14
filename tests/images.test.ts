import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { normalizeImagePaths, validateImagePaths } from "../src/core/images";

describe("core/images", () => {
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

  it("normalizes image paths (absolute + unique)", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-images-"));
    const img = path.join(tmpDir, "a.png");
    fs.writeFileSync(img, "x");

    const out = normalizeImagePaths(["./a.png", "a.png", " ./a.png "], tmpDir);
    expect(out).toEqual([img]);
  });

  it("expands ~/", () => {
    const out = normalizeImagePaths(["~/x.png"], "/");
    expect(out[0]).toBe(path.join(os.homedir(), "x.png"));
  });

  it("validates image paths", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-images-"));
    const img = path.join(tmpDir, "a.png");
    fs.writeFileSync(img, "x");

    expect(validateImagePaths([img])).toBe("");
    expect(validateImagePaths([path.join(tmpDir, "missing.png")])).toContain("not found");
    expect(validateImagePaths([tmpDir])).toContain("not a file");
  });
});

