import Foundation

struct AHResolvedPaths {
    let userDataPath: URL
    let storeFilePath: URL
    let jobsDirectoryPath: URL
}

enum AHPaths {
    static func resolve() -> AHResolvedPaths {
        let fileManager = FileManager.default

        let envOverride = ProcessInfo.processInfo.environment["AH_USER_DATA_PATH"]?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if !envOverride.isEmpty {
            let base = URL(fileURLWithPath: NSString(string: envOverride).expandingTildeInPath)
            return AHResolvedPaths(
                userDataPath: base,
                storeFilePath: base.appendingPathComponent("agent-heaven.store.json"),
                jobsDirectoryPath: base.appendingPathComponent("jobs", isDirectory: true)
            )
        }

        let home = fileManager.homeDirectoryForCurrentUser
        let candidates = [
            home.appendingPathComponent("Library/Application Support/agent-heaven", isDirectory: true),
            home.appendingPathComponent("Library/Application Support/Agent Heaven", isDirectory: true)
        ]

        let selected = candidates.first(where: { fileManager.fileExists(atPath: $0.path) }) ?? candidates[0]
        return AHResolvedPaths(
            userDataPath: selected,
            storeFilePath: selected.appendingPathComponent("agent-heaven.store.json"),
            jobsDirectoryPath: selected.appendingPathComponent("jobs", isDirectory: true)
        )
    }
}
