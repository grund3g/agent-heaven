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

  it("defaults integrate settings and normalizes invalid values", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify(
        {
          settings: {
            integrateAutoArchive: "yes please",
            integrateToDefaultMode: "sometimes"
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
    expect(s.getSettings().integrateToDefaultMode).toBe("agent");

    const updated = s.updateSettings({ integrateAutoArchive: false, integrateToDefaultMode: "cli" });
    expect(updated.integrateAutoArchive).toBe(false);
    expect(updated.integrateToDefaultMode).toBe("cli");
  });

  it("defaults helper settings and normalizes helper values", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify(
        {
          settings: {
            helperDefaultAgent: "anthropic",
            helperDefaultModel: "  opus  ",
            helperPersistHistory: "yes"
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
    expect((s.getSettings() as any).helperDefaultAgent).toBe("claude");
    expect((s.getSettings() as any).helperDefaultModel).toBe("opus");
    expect((s.getSettings() as any).helperPersistHistory).toBe(true);

    const updated = s.updateSettings({ helperDefaultAgent: "codex", helperDefaultModel: "sonnet", helperPersistHistory: false });
    expect((updated as any).helperDefaultAgent).toBe("codex");
    // Claude-only defaults are cleared when Codex is pinned.
    expect((updated as any).helperDefaultModel).toBe("");
    expect((updated as any).helperPersistHistory).toBe(false);
  });

  it("seeds built-in commit actions when upgrading action defaults", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify(
        {
          settings: {
            actionsDefaultsVersion: 1,
            actions: [
              {
                id: "ah_builtin_integrate_to_default",
                name: "Integrate to default branch",
                command: "ah:integrate-to-default"
              }
            ]
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

    const settings: any = s.getSettings();
    expect(settings.actionsDefaultsVersion).toBe(2);

    const actions = Array.isArray(settings.actions) ? settings.actions : [];
    const byId = new Map(actions.map((a: any) => [String(a && a.id ? a.id : ""), a]));

    expect(byId.get("ah_builtin_integrate_to_default")?.command).toBe("ah:integrate-to-default");
    expect(byId.get("ah_builtin_commit_and_push")?.command).toBe("ah:commit-and-push");
    expect(byId.get("ah_builtin_commit_only")?.command).toBe("ah:commit-only");
  });

  it("normalizes editorCommand to a trimmed string", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify(
        {
          settings: {
            editorCommand: 123
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
    expect(s.getSettings().editorCommand).toBe("");

    const updated = s.updateSettings({ editorCommand: "  code  " });
    expect(updated.editorCommand).toBe("code");
  });

  it("normalizes codex transport mode", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-heaven-store-"));
    const storePath = path.join(tmpDir, "agent-heaven.store.json");

    fs.writeFileSync(
      storePath,
      JSON.stringify(
        {
          settings: {
            agents: {
              codex: {
                transport: "app-server"
              }
            }
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
    expect((s.getSettings() as any).agents.codex.transport).toBe("app_server");

    const updated = s.updateSettings({ agents: { codex: { transport: "wat" } } });
    expect((updated as any).agents.codex.transport).toBe("exec_json");
  });
});
