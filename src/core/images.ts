import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export function normalizeImagePaths(value: unknown, baseDir: string): string[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  const out: string[] = [];
  for (const v of raw) {
    if (typeof v !== "string") continue;
    let p = v.trim();
    if (!p) continue;

    // Common terminal-friendly shorthand.
    if (p.startsWith("~/")) p = path.join(os.homedir(), p.slice(2));

    if (!path.isAbsolute(p)) p = path.resolve(baseDir || process.cwd(), p);
    out.push(p);
  }
  return [...new Set(out)];
}

export function validateImagePaths(imagePaths: unknown): string {
  const paths = Array.isArray(imagePaths) ? imagePaths : [];
  for (const p of paths) {
    const filePath = typeof p === "string" ? p : "";
    try {
      const st = fs.statSync(filePath);
      if (!st.isFile()) return `Image path is not a file: ${filePath}`;
    } catch {
      return `Image file not found: ${filePath}`;
    }
  }
  return "";
}

