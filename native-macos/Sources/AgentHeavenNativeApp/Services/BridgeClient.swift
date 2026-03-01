import Foundation

enum AHBridgeError: LocalizedError {
    case invalidBaseURL(String)
    case requestFailed(String)
    case badStatus(Int, String)
    case decodeFailed(String)

    var errorDescription: String? {
        switch self {
        case .invalidBaseURL(let value):
            return "Invalid bridge base URL: \(value)"
        case .requestFailed(let message):
            return "Bridge request failed: \(message)"
        case .badStatus(let code, let body):
            if body.isEmpty { return "Bridge returned HTTP \(code)" }
            return "Bridge returned HTTP \(code): \(body)"
        case .decodeFailed(let message):
            return "Bridge decode failed: \(message)"
        }
    }
}

final class AHBridgeClient {
    private let session: URLSession
    private let baseURL: URL
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    init() throws {
        let env = ProcessInfo.processInfo.environment
        let base = env["AH_BRIDGE_BASE_URL"]?.trimmingCharacters(in: .whitespacesAndNewlines)
            ?? "http://127.0.0.1:7788"

        guard let url = URL(string: base) else {
            throw AHBridgeError.invalidBaseURL(base)
        }
        self.baseURL = url

        let config = URLSessionConfiguration.ephemeral
        config.timeoutIntervalForRequest = 2.0
        config.timeoutIntervalForResource = 4.0
        self.session = URLSession(configuration: config)
    }

    static var isDisabled: Bool {
        ProcessInfo.processInfo.environment["AH_BRIDGE_DISABLED"] == "1"
    }

    func isHealthy() async -> Bool {
        do {
            let _: AHBridgeActionResponse = try await request(path: "/health")
            return true
        } catch {
            return false
        }
    }

    func fetchState() async throws -> AHBridgeStateResponse {
        try await request(path: "/state")
    }

    func fetchProjects() async throws -> [AHProject] {
        let payload: AHBridgeProjectsResponse = try await request(path: "/projects")
        return payload.projects
    }

    func fetchJobs(limit: Int = 500, projectId: String? = nil, box: String? = nil) async throws -> [AHJob] {
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "full", value: "0"),
            URLQueryItem(name: "limit", value: String(max(1, min(limit, 1000))))
        ]
        let p = (projectId ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        if !p.isEmpty { queryItems.append(URLQueryItem(name: "projectId", value: p)) }
        let b = (box ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        if !b.isEmpty { queryItems.append(URLQueryItem(name: "box", value: b)) }

        let payload: AHBridgeJobsResponse = try await request(path: "/jobs", queryItems: queryItems)
        return payload.jobs.sorted { lhs, rhs in
            if lhs.sortTimestamp == rhs.sortTimestamp { return lhs.id < rhs.id }
            return lhs.sortTimestamp > rhs.sortTimestamp
        }
    }

    func fetchJob(id: String) async throws -> AHJob {
        let payload: AHBridgeJobResponse = try await request(path: "/jobs/\(urlEncode(id))")
        if let job = payload.job { return job }
        throw AHBridgeError.requestFailed(payload.error ?? "Job not found")
    }

    func startJob(projectId: String, prompt: String, agent: String, model: String, mode: String = "single") async throws -> String {
        let payload = AHStartJobRequest(
            projectId: projectId,
            prompt: prompt,
            agent: agent,
            model: model,
            mode: mode
        )
        let response: AHBridgeActionResponse = try await request(path: "/jobs/start", method: "POST", body: payload)
        if response.ok == false {
            throw AHBridgeError.requestFailed(response.error ?? "Could not start job")
        }
        guard let id = response.jobId, !id.isEmpty else {
            throw AHBridgeError.requestFailed("No jobId returned")
        }
        return id
    }

    func sendPrompt(jobId: String, prompt: String, images: [String] = []) async throws {
        let payload = AHSendPromptRequest(prompt: prompt, images: images)
        let response: AHBridgeActionResponse = try await request(
            path: "/jobs/\(urlEncode(jobId))/send",
            method: "POST",
            body: payload
        )
        if response.ok == false {
            throw AHBridgeError.requestFailed(response.error ?? "Could not send prompt")
        }
    }

    func cancelJob(jobId: String) async throws {
        let response: AHBridgeActionResponse = try await request(path: "/jobs/\(urlEncode(jobId))/cancel", method: "POST")
        if response.ok == false {
            throw AHBridgeError.requestFailed(response.error ?? "Could not cancel job")
        }
    }

    func archiveJob(jobId: String) async throws {
        let response: AHBridgeActionResponse = try await request(path: "/jobs/\(urlEncode(jobId))/archive", method: "POST")
        if response.ok == false {
            throw AHBridgeError.requestFailed(response.error ?? "Could not archive job")
        }
    }

    func trashJob(jobId: String) async throws {
        let response: AHBridgeActionResponse = try await request(path: "/jobs/\(urlEncode(jobId))/trash", method: "POST")
        if response.ok == false {
            throw AHBridgeError.requestFailed(response.error ?? "Could not trash job")
        }
    }

    func restoreJob(jobId: String) async throws {
        let response: AHBridgeActionResponse = try await request(path: "/jobs/\(urlEncode(jobId))/restore", method: "POST")
        if response.ok == false {
            throw AHBridgeError.requestFailed(response.error ?? "Could not restore job")
        }
    }

    func deleteJob(jobId: String) async throws {
        let response: AHBridgeActionResponse = try await request(path: "/jobs/\(urlEncode(jobId))", method: "DELETE")
        if response.ok == false {
            throw AHBridgeError.requestFailed(response.error ?? "Could not delete job")
        }
    }

    private func request<T: Decodable>(
        path: String,
        method: String = "GET",
        queryItems: [URLQueryItem]? = nil,
        body: (any Encodable)? = nil
    ) async throws -> T {
        guard var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: true) else {
            throw AHBridgeError.requestFailed("Could not build URL components")
        }

        if path.hasPrefix("/") {
            let basePath = components.path
            if basePath.isEmpty || basePath == "/" {
                components.path = path
            } else {
                components.path = basePath + path
            }
        } else {
            components.path += "/\(path)"
        }

        if let queryItems, !queryItems.isEmpty {
            components.queryItems = queryItems
        }

        guard let url = components.url else {
            throw AHBridgeError.requestFailed("Could not build request URL")
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try encoder.encode(AnyEncodable(body))
        }

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw AHBridgeError.requestFailed(error.localizedDescription)
        }

        guard let http = response as? HTTPURLResponse else {
            throw AHBridgeError.requestFailed("Missing HTTP response")
        }

        if !(200...299).contains(http.statusCode) {
            let bodyText = String(data: data, encoding: .utf8) ?? ""
            throw AHBridgeError.badStatus(http.statusCode, bodyText)
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw AHBridgeError.decodeFailed(error.localizedDescription)
        }
    }

    private func urlEncode(_ value: String) -> String {
        value.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? value
    }
}

private struct AnyEncodable: Encodable {
    private let encodeFn: (Encoder) throws -> Void

    init(_ wrapped: any Encodable) {
        self.encodeFn = { encoder in
            try wrapped.encode(to: encoder)
        }
    }

    func encode(to encoder: Encoder) throws {
        try encodeFn(encoder)
    }
}
