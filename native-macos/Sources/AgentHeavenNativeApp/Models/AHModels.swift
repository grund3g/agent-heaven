import Foundation

enum AHJobStatus: String, Codable, CaseIterable, Hashable {
    case running
    case done
    case failed
    case cancelled
    case needsAttention = "needs_attention"
    case unknown

    var displayTitle: String {
        switch self {
        case .running: return "Running"
        case .needsAttention: return "Needs Attention"
        case .failed: return "Failed"
        case .done: return "Done"
        case .cancelled: return "Cancelled"
        case .unknown: return "Unknown"
        }
    }
}

struct AHProject: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let path: String
    let shortName: String?
    let color: String?
    let defaultBranch: String?
    let checkoutMode: String?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case path
        case shortName
        case color
        case defaultBranch
        case checkoutMode
    }
}

struct AHJobPrompt: Identifiable, Codable, Hashable {
    var id: String { "\(ts)-\(text.prefix(24))" }
    let ts: String
    let text: String
    let images: [String]?
}

struct AHJobMessage: Identifiable, Codable, Hashable {
    var id: String { "\(ts)-\(role)-\(text.prefix(24))" }
    let ts: String
    let role: String
    let text: String
}

struct AHJobLogEntry: Identifiable, Codable, Hashable {
    var id: String {
        let snippet = String((text ?? "").prefix(16))
        return "\(ts)-\(stream)-\(kind)-\(snippet)"
    }
    let ts: String
    let stream: String
    let kind: String
    let text: String?
}

struct AHUsageTotal: Codable, Hashable {
    let input_tokens: Int?
    let output_tokens: Int?
    let turns: Int?
}

struct AHJob: Identifiable, Codable, Hashable {
    let id: String
    let title: String
    let promptPreview: String
    let previewText: String
    let titleLlm: String?
    let status: AHJobStatus
    let box: String
    let projectId: String
    let projectPath: String
    let mode: String?
    let agent: String
    let model: String
    let threadId: String
    let createdAt: String
    let startedAt: String
    let finishedAt: String
    let exitCode: Int?
    let queuedCount: Int
    let prompts: [AHJobPrompt]
    let messages: [AHJobMessage]
    let logs: [AHJobLogEntry]
    let usageTotal: AHUsageTotal?

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case promptPreview
        case previewText
        case titleLlm
        case status
        case box
        case projectId
        case projectPath
        case mode
        case agent
        case model
        case threadId
        case createdAt
        case startedAt
        case finishedAt
        case exitCode
        case queuedCount
        case prompts
        case messages
        case logs
        case usageTotal
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        title = try c.decodeIfPresent(String.self, forKey: .title) ?? ""
        promptPreview = try c.decodeIfPresent(String.self, forKey: .promptPreview) ?? ""
        previewText = try c.decodeIfPresent(String.self, forKey: .previewText) ?? ""
        titleLlm = try c.decodeIfPresent(String.self, forKey: .titleLlm)
        status = try c.decodeIfPresent(AHJobStatus.self, forKey: .status) ?? .unknown
        box = try c.decodeIfPresent(String.self, forKey: .box) ?? "board"
        projectId = try c.decodeIfPresent(String.self, forKey: .projectId) ?? ""
        projectPath = try c.decodeIfPresent(String.self, forKey: .projectPath) ?? ""
        mode = try c.decodeIfPresent(String.self, forKey: .mode)
        agent = try c.decodeIfPresent(String.self, forKey: .agent) ?? ""
        model = try c.decodeIfPresent(String.self, forKey: .model) ?? ""
        threadId = try c.decodeIfPresent(String.self, forKey: .threadId) ?? ""
        createdAt = try c.decodeIfPresent(String.self, forKey: .createdAt) ?? ""
        startedAt = try c.decodeIfPresent(String.self, forKey: .startedAt) ?? ""
        finishedAt = try c.decodeIfPresent(String.self, forKey: .finishedAt) ?? ""
        exitCode = try c.decodeIfPresent(Int.self, forKey: .exitCode)
        queuedCount = try c.decodeIfPresent(Int.self, forKey: .queuedCount) ?? 0
        prompts = try c.decodeIfPresent([AHJobPrompt].self, forKey: .prompts) ?? []
        messages = try c.decodeIfPresent([AHJobMessage].self, forKey: .messages) ?? []
        logs = try c.decodeIfPresent([AHJobLogEntry].self, forKey: .logs) ?? []
        usageTotal = try c.decodeIfPresent(AHUsageTotal.self, forKey: .usageTotal)
    }

    var effectiveTitle: String {
        let llm = titleLlm?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        if !llm.isEmpty { return llm }
        let t = title.trimmingCharacters(in: .whitespacesAndNewlines)
        if !t.isEmpty { return t }
        let p = promptPreview.trimmingCharacters(in: .whitespacesAndNewlines)
        if !p.isEmpty { return p }
        return id
    }

    var sortTimestamp: Date {
        AHDate.parse(startedAt) ?? AHDate.parse(createdAt) ?? .distantPast
    }
}

struct AHBridgeStateResponse: Decodable {
    let projects: [AHProject]
    let jobs: [AHJob]?
}

struct AHBridgeJobsResponse: Decodable {
    let count: Int
    let jobs: [AHJob]
}

struct AHBridgeJobResponse: Decodable {
    let ok: Bool?
    let job: AHJob?
    let error: String?
}

struct AHBridgeProjectsResponse: Decodable {
    let projects: [AHProject]
}

struct AHBridgeActionResponse: Decodable {
    let ok: Bool?
    let error: String?
    let jobId: String?
}

struct AHStartJobRequest: Encodable {
    let projectId: String
    let prompt: String
    let agent: String
    let model: String
    let mode: String
}

struct AHSendPromptRequest: Encodable {
    let prompt: String
    let images: [String]
}

enum AHDate {
    private static let fractionalFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    private static let regularFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    static func parse(_ value: String) -> Date? {
        guard !value.isEmpty else { return nil }
        return fractionalFormatter.date(from: value) ?? regularFormatter.date(from: value)
    }

    static func display(_ value: String) -> String {
        guard let date = parse(value) else { return "-" }
        return date.formatted(date: .abbreviated, time: .shortened)
    }
}
