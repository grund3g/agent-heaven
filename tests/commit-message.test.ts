import { describe, expect, test } from "vitest";
import { inferCommitMessageStyleFromSubjects, suggestCommitMessage } from "../src/core/commit-message";

describe("commit-message", () => {
  test("infers conventional commit style", () => {
    const style = inferCommitMessageStyleFromSubjects([
      "fix(renderer): replace prompt() with dialog",
      "docs: add Fathom analytics",
      "chore(main): release 0.7.0"
    ]);
    expect(style).toBe("conventional");
  });

  test("suggests docs(readme) message for README screenshot updates", () => {
    const msg = suggestCommitMessage({
      style: "conventional",
      changedPaths: ["README.md", "assets/integration.png"],
      taskText: "Integrate: add screenshot to the README"
    });
    expect(msg).toBe("docs(readme): add screenshot");
  });

  test("suggests dependency chore", () => {
    const msg = suggestCommitMessage({
      style: "conventional",
      changedPaths: ["package.json", "package-lock.json"],
      taskText: "bump dependencies"
    });
    expect(msg).toBe("chore: update dependencies");
  });

  test("does not overfit to README when code files are also changed", () => {
    const msg = suggestCommitMessage({
      style: "conventional",
      changedPaths: ["README.md", "renderer/styles.css"],
      taskText: "adjust theme action integration dialog"
    });
    expect(msg).toBe("feat: adjust theme action integration dialog");
  });

  test("plain style returns sentence-cased subject", () => {
    const msg = suggestCommitMessage({
      style: "plain",
      changedPaths: ["src/app.ts"],
      taskText: "fix crash on startup"
    });
    expect(msg).toBe("Fix crash on startup");
  });

  test("can ignore task context when requested", () => {
    const msg = suggestCommitMessage({
      style: "conventional",
      changedPaths: ["src/app.ts"],
      taskText: "fix crash on startup",
      jobTitle: "Fix crash on startup",
      allowTaskContext: false
    });
    expect(msg).toBe("feat: update app.ts");
  });

  test("uses area-based fallback instead of checkpoint placeholder", () => {
    const msg = suggestCommitMessage({
      style: "conventional",
      changedPaths: ["src/app.ts", "renderer/renderer.js"],
      allowTaskContext: false
    });
    expect(msg).toBe("feat: update src and renderer");
  });

  test("falls back to local-changes wording when no context/path is available", () => {
    const msg = suggestCommitMessage({
      style: "conventional",
      allowTaskContext: false
    });
    expect(msg).toBe("feat: update local changes");
  });

  test("ignores machine-style status metadata as task context", () => {
    const msg = suggestCommitMessage({
      style: "conventional",
      changedPaths: ["src/app.ts"],
      taskText: "status=done box=board agent=codex project=agent-heaven thread=abc model=gpt-5",
      allowTaskContext: true
    });
    expect(msg).toBe("feat: update app.ts");
  });
});
