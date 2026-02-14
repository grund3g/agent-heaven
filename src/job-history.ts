import * as fs from "node:fs";
import * as path from "node:path";

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function atomicWriteFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  fs.renameSync(tmp, filePath);
}

export class JobHistory {
  dirPath: string;

  constructor(dirPath) {
    this.dirPath = dirPath;
  }

  jobPath(jobId) {
    return path.join(this.dirPath, `${jobId}.json`);
  }

  loadAll() {
    try {
      const st = fs.statSync(this.dirPath);
      if (!st.isDirectory()) return [];
    } catch {
      return [];
    }

    let entries = [];
    try {
      entries = fs.readdirSync(this.dirPath, { withFileTypes: true });
    } catch {
      return [];
    }

    const jobs = [];
    for (const ent of entries) {
      if (!ent || !ent.isFile()) continue;
      if (!ent.name.endsWith(".json")) continue;
      if (ent.name.endsWith(".tmp")) continue;

      const p = path.join(this.dirPath, ent.name);
      let raw = "";
      try {
        raw = fs.readFileSync(p, "utf8");
      } catch {
        continue;
      }

      const parsed = safeJsonParse(raw);
      if (!parsed || typeof parsed !== "object") continue;
      if (!parsed.id || typeof parsed.id !== "string") continue;
      jobs.push(parsed);
    }

    return jobs;
  }

  save(job) {
    if (!job || typeof job !== "object") return false;
    const id = typeof job.id === "string" ? job.id : "";
    if (!id) return false;

    const json = JSON.stringify(job, null, 2);
    ensureDir(this.dirPath);
    atomicWriteFile(this.jobPath(id), json);
    return true;
  }

  remove(jobId) {
    const id = typeof jobId === "string" ? jobId : "";
    if (!id) return false;
    try {
      fs.unlinkSync(this.jobPath(id));
      return true;
    } catch {
      return false;
    }
  }
}
