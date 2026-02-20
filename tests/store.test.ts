import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Store } from "../src/store";

describe("store", () => {
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

  it("migrates legacy codex settings into settings.agents.codex", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    const raw = {
      settings: {
        codexPath: "/bin/codex",
        agentModel: "gpt-4.1",
        sandboxMode: "read-only",
        bypassApprovalsAndSandbox: true,
        skipGitRepoCheck: true,
        color: "always",
        globalHotkeyAccelerator: "  CommandOrControl+Shift+P  "
      },
      projects: [{ id: "p1", name: "Proj", path: "/tmp", color: "ABC", shortName: "  " }]
    };
    fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), "utf8");

    const s = new Store(storePath);
    s.load();

    const settings: any = s.getSettings();
    expect(settings.agents.codex.path).toBe("/bin/codex");
    expect(settings.agents.codex.model).toBe("gpt-4.1");
    expect(settings.agents.codex.transport).toBe("exec_json");
    expect(settings.agents.codex.sandboxMode).toBe("read-only");
    expect(settings.agents.codex.bypassApprovalsAndSandbox).toBe(true);
    expect(settings.agents.codex.skipGitRepoCheck).toBe(true);
    expect(settings.agents.codex.color).toBe("always");

    // Deprecated keys should be removed.
    expect(settings.codexPath).toBeUndefined();
    expect(settings.agentModel).toBeUndefined();
    expect(settings.sandboxMode).toBeUndefined();

    // Trimmed
    expect(settings.globalHotkeyAccelerator).toBe("CommandOrControl+Shift+P");

    const projects: any[] = s.listProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0].color).toBe("#aabbcc");
    expect(Object.prototype.hasOwnProperty.call(projects[0], "shortName")).toBe(false);
  });

  it("defaults integrateAutoArchive to true and normalizes invalid values", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify(
        {
          settings: {
            integrateAutoArchive: "yes please"
          },
          projects: []
        },
        null,
        2
      ),
      "utf8"
    );

    const s = new Store(storePath);
    s.load();
    expect(s.getSettings().integrateAutoArchive).toBe(true);

    const updated = s.updateSettings({ integrateAutoArchive: false });
    expect(updated.integrateAutoArchive).toBe(false);
  });

  it("defaults uiDesignVersion to v1 and normalizes invalid values", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    // No uiDesignVersion set => defaults to v1
    fs.writeFileSync(
      storePath,
      JSON.stringify({ settings: {}, projects: [] }, null, 2),
      "utf8"
    );

    const s = new Store(storePath);
    s.load();
    expect((s.getSettings() as any).uiDesignVersion).toBe("v1");
  });

  it("normalizes uiDesignVersion to v1 for invalid values", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify({ settings: { uiDesignVersion: "v99" }, projects: [] }, null, 2),
      "utf8"
    );

    const s = new Store(storePath);
    s.load();
    expect((s.getSettings() as any).uiDesignVersion).toBe("v1");
  });

  it("preserves uiDesignVersion v2 when set", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify({ settings: { uiDesignVersion: "v2" }, projects: [] }, null, 2),
      "utf8"
    );

    const s = new Store(storePath);
    s.load();
    expect((s.getSettings() as any).uiDesignVersion).toBe("v2");
  });

  it("allows updating uiDesignVersion via updateSettings", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify({ settings: {}, projects: [] }, null, 2),
      "utf8"
    );

    const s = new Store(storePath);
    s.load();
    expect((s.getSettings() as any).uiDesignVersion).toBe("v1");

    const updated = s.updateSettings({ uiDesignVersion: "v2" });
    expect((updated as any).uiDesignVersion).toBe("v2");

    // Invalid value falls back to v1
    const updated2 = s.updateSettings({ uiDesignVersion: "garbage" });
    expect((updated2 as any).uiDesignVersion).toBe("v1");
  });

  it("ignores project id changes in updateProject patch", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify({ settings: {}, projects: [{ id: "p1", name: "One", path: "/tmp/p1" }] }, null, 2),
      "utf8"
    );

    const s = new Store(storePath);
    s.load();

    const updated = s.updateProject("p1", { id: "p2", name: "Renamed" } as any);
    expect(updated).toMatchObject({ id: "p1", name: "Renamed" });
    expect(s.listProjects()).toHaveLength(1);
    expect((s.listProjects()[0] as any).id).toBe("p1");
  });
});
