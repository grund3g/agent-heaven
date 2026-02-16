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
});
