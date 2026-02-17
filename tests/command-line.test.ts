import { describe, expect, it } from "vitest";
import { buildEditorLaunchCommand, splitCommandLine } from "../src/core/command-line";

describe("core/command-line", () => {
  it("splits command lines with quotes and spaces", () => {
    expect(splitCommandLine("code .")).toEqual(["code", "."]);
    expect(splitCommandLine(`"code" --reuse-window`)).toEqual(["code", "--reuse-window"]);
    expect(splitCommandLine(`"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --new-window`)).toEqual([
      "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
      "--new-window"
    ]);
    expect(splitCommandLine(`"C:\\Program Files\\Microsoft VS Code\\Code.exe" --reuse-window`)).toEqual([
      "C:\\Program Files\\Microsoft VS Code\\Code.exe",
      "--reuse-window"
    ]);
  });

  it("builds editor launch command and appends target path by default", () => {
    expect(buildEditorLaunchCommand("code", "/tmp/project")).toEqual({
      command: "code",
      args: ["/tmp/project"]
    });
    expect(buildEditorLaunchCommand("code --reuse-window", "/tmp/project")).toEqual({
      command: "code",
      args: ["--reuse-window", "/tmp/project"]
    });
  });

  it("does not append target when explicit target arg is already present", () => {
    expect(buildEditorLaunchCommand("code .", "/tmp/project")).toEqual({
      command: "code",
      args: ["."]
    });
  });

  it("replaces {path} placeholder when present", () => {
    expect(buildEditorLaunchCommand("code --folder-uri {path}", "/tmp/project")).toEqual({
      command: "code",
      args: ["--folder-uri", "/tmp/project"]
    });
  });

  it("returns null for missing command or target", () => {
    expect(buildEditorLaunchCommand("", "/tmp/project")).toBe(null);
    expect(buildEditorLaunchCommand("code", "")).toBe(null);
  });
});
