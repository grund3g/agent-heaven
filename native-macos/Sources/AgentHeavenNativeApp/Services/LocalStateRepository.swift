import Foundation

enum AHLocalStateError: LocalizedError {
    case storeFileMissing(String)
    case storeDecodeFailed(String)

    var errorDescription: String? {
        switch self {
        case .storeFileMissing(let path):
            return "Store file not found: \(path)"
        case .storeDecodeFailed(let message):
            return "Failed to decode store JSON: \(message)"
        }
    }
}

final class AHLocalStateRepository {
    private let fileManager = FileManager.default
    private let decoder = JSONDecoder()

    private struct StorePayload: Decodable {
        let projects: [AHProject]
    }

    func loadProjects(paths: AHResolvedPaths) throws -> [AHProject] {
        guard fileManager.fileExists(atPath: paths.storeFilePath.path) else {
            throw AHLocalStateError.storeFileMissing(paths.storeFilePath.path)
        }

        do {
            let data = try Data(contentsOf: paths.storeFilePath)
            let payload = try decoder.decode(StorePayload.self, from: data)
            return payload.projects
        } catch {
            throw AHLocalStateError.storeDecodeFailed(error.localizedDescription)
        }
    }

    func loadJobs(paths: AHResolvedPaths) -> [AHJob] {
        guard fileManager.fileExists(atPath: paths.jobsDirectoryPath.path) else {
            return []
        }

        guard let enumerator = fileManager.enumerator(
            at: paths.jobsDirectoryPath,
            includingPropertiesForKeys: [.isRegularFileKey],
            options: [.skipsHiddenFiles]
        ) else {
            return []
        }

        var jobs: [AHJob] = []
        for case let fileURL as URL in enumerator {
            guard fileURL.pathExtension == "json" else { continue }
            if fileURL.lastPathComponent.hasSuffix(".tmp") { continue }

            do {
                let data = try Data(contentsOf: fileURL)
                let job = try decoder.decode(AHJob.self, from: data)
                jobs.append(job)
            } catch {
                // Ignore malformed job files to keep app resilient.
                continue
            }
        }

        jobs.sort { lhs, rhs in
            if lhs.sortTimestamp == rhs.sortTimestamp { return lhs.id < rhs.id }
            return lhs.sortTimestamp > rhs.sortTimestamp
        }

        return jobs
    }
}
