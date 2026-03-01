import Foundation

enum AHDataSource: String {
    case bridge
    case local
}

@MainActor
final class AHAppViewModel: ObservableObject {
    @Published var paths: AHResolvedPaths
    @Published var projects: [AHProject] = []
    @Published var jobs: [AHJob] = []
    @Published var selectedProjectId: String = ""
    @Published var selectedJobId: String?
    @Published var selectedJob: AHJob?
    @Published var dataSource: AHDataSource = .local
    @Published var statusLine: String = ""
    @Published var isRefreshing: Bool = false

    @Published var composerPrompt: String = ""
    @Published var composerAgent: String = "codex"
    @Published var composerModel: String = ""
    @Published var followUpPrompt: String = ""

    @Published var includeArchived: Bool = true
    @Published var includeTrash: Bool = false

    private let localRepository = AHLocalStateRepository()
    private var bridgeClient: AHBridgeClient?
    private var refreshLoopTask: Task<Void, Never>?

    init() {
        self.paths = AHPaths.resolve()
        self.bridgeClient = try? AHBridgeClient()
    }

    deinit {
        refreshLoopTask?.cancel()
    }

    var visibleJobs: [AHJob] {
        var out = jobs
        if !selectedProjectId.isEmpty {
            out = out.filter { $0.projectId == selectedProjectId }
        }
        if !includeArchived {
            out = out.filter { $0.box != "archive" }
        }
        if !includeTrash {
            out = out.filter { $0.box != "trash" }
        }
        return out
    }

    var groupedJobs: [(AHJobStatus, [AHJob])] {
        let order: [AHJobStatus] = [.running, .needsAttention, .failed, .done, .cancelled, .unknown]
        return order.compactMap { status in
            let items = visibleJobs.filter { $0.status == status }
            return items.isEmpty ? nil : (status, items)
        }
    }

    func startRefreshLoop() {
        if refreshLoopTask != nil { return }
        refreshLoopTask = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled {
                await self.refresh()
                try? await Task.sleep(nanoseconds: 2_000_000_000)
            }
        }
    }

    func stopRefreshLoop() {
        refreshLoopTask?.cancel()
        refreshLoopTask = nil
    }

    func refresh() async {
        if isRefreshing { return }
        isRefreshing = true
        defer { isRefreshing = false }

        paths = AHPaths.resolve()

        if !AHBridgeClient.isDisabled, let bridgeClient {
            let healthy = await bridgeClient.isHealthy()
            if healthy {
                do {
                    async let projectsTask = bridgeClient.fetchProjects()
                    async let jobsTask = bridgeClient.fetchJobs(limit: 800)
                    let (fetchedProjects, fetchedJobs) = try await (projectsTask, jobsTask)
                    applyNewState(projects: fetchedProjects, jobs: fetchedJobs, source: .bridge)

                    if let selectedJobId {
                        if let detailed = try? await bridgeClient.fetchJob(id: selectedJobId) {
                            selectedJob = detailed
                        }
                    }

                    statusLine = "Bridge mode: \(fetchedProjects.count) projects, \(fetchedJobs.count) jobs"
                    return
                } catch {
                    // fallback to local mode
                }
            }
        }

        do {
            let loadedProjects = try localRepository.loadProjects(paths: paths)
            let loadedJobs = localRepository.loadJobs(paths: paths)
            applyNewState(projects: loadedProjects, jobs: loadedJobs, source: .local)
            selectedJob = loadedJobs.first(where: { $0.id == selectedJobId })
            statusLine = "Local mode: \(loadedProjects.count) projects, \(loadedJobs.count) jobs"
        } catch {
            statusLine = error.localizedDescription
            projects = []
            jobs = []
            selectedJob = nil
            selectedJobId = nil
        }
    }

    func selectJob(id: String?) async {
        selectedJobId = id
        guard let id else {
            selectedJob = nil
            return
        }

        if dataSource == .bridge, let bridgeClient {
            if let detail = try? await bridgeClient.fetchJob(id: id) {
                selectedJob = detail
                return
            }
        }

        selectedJob = jobs.first(where: { $0.id == id })
    }

    func startJob() async {
        let prompt = composerPrompt.trimmingCharacters(in: .whitespacesAndNewlines)
        if prompt.isEmpty {
            statusLine = "Prompt is empty"
            return
        }

        if dataSource != .bridge || AHBridgeClient.isDisabled {
            statusLine = "Start is only available in bridge mode"
            return
        }

        guard let bridgeClient else {
            statusLine = "Bridge client unavailable"
            return
        }

        let projectId = selectedProjectId.isEmpty ? "auto" : selectedProjectId

        do {
            let jobId = try await bridgeClient.startJob(
                projectId: projectId,
                prompt: prompt,
                agent: composerAgent,
                model: composerModel.trimmingCharacters(in: .whitespacesAndNewlines),
                mode: "single"
            )
            composerPrompt = ""
            statusLine = "Started job \(jobId)"
            await refresh()
            await selectJob(id: jobId)
        } catch {
            statusLine = error.localizedDescription
        }
    }

    func sendFollowUp() async {
        guard dataSource == .bridge, let bridgeClient else {
            statusLine = "Follow-up is only available in bridge mode"
            return
        }
        guard let jobId = selectedJobId, !jobId.isEmpty else {
            statusLine = "No job selected"
            return
        }

        let prompt = followUpPrompt.trimmingCharacters(in: .whitespacesAndNewlines)
        if prompt.isEmpty {
            statusLine = "Follow-up prompt is empty"
            return
        }

        do {
            try await bridgeClient.sendPrompt(jobId: jobId, prompt: prompt)
            followUpPrompt = ""
            statusLine = "Follow-up sent"
            await refresh()
            await selectJob(id: jobId)
        } catch {
            statusLine = error.localizedDescription
        }
    }

    func cancelSelectedJob() async {
        guard let id = selectedJobId else {
            statusLine = "No job selected"
            return
        }
        guard dataSource == .bridge, let bridgeClient else {
            statusLine = "Cancel is only available in bridge mode"
            return
        }

        do {
            try await bridgeClient.cancelJob(jobId: id)
            statusLine = "Cancel requested"
            await refresh()
            await selectJob(id: id)
        } catch {
            statusLine = error.localizedDescription
        }
    }

    func archiveSelectedJob() async {
        await mutateSelectedJob(actionName: "Archive") { bridgeClient, id in
            try await bridgeClient.archiveJob(jobId: id)
        }
    }

    func trashSelectedJob() async {
        await mutateSelectedJob(actionName: "Trash") { bridgeClient, id in
            try await bridgeClient.trashJob(jobId: id)
        }
    }

    func restoreSelectedJob() async {
        await mutateSelectedJob(actionName: "Restore") { bridgeClient, id in
            try await bridgeClient.restoreJob(jobId: id)
        }
    }

    func deleteSelectedJob() async {
        guard let id = selectedJobId else {
            statusLine = "No job selected"
            return
        }
        await mutateSelectedJob(actionName: "Delete") { bridgeClient, _ in
            try await bridgeClient.deleteJob(jobId: id)
        }
        selectedJobId = nil
        selectedJob = nil
    }

    private func mutateSelectedJob(
        actionName: String,
        action: (AHBridgeClient, String) async throws -> Void
    ) async {
        guard let id = selectedJobId else {
            statusLine = "No job selected"
            return
        }
        guard dataSource == .bridge, let bridgeClient else {
            statusLine = "\(actionName) is only available in bridge mode"
            return
        }

        do {
            try await action(bridgeClient, id)
            statusLine = "\(actionName) completed"
            await refresh()
            await selectJob(id: id)
        } catch {
            statusLine = error.localizedDescription
        }
    }

    private func applyNewState(projects: [AHProject], jobs: [AHJob], source: AHDataSource) {
        self.projects = projects.sorted { lhs, rhs in
            lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
        }
        self.jobs = jobs.sorted { lhs, rhs in
            if lhs.sortTimestamp == rhs.sortTimestamp { return lhs.id < rhs.id }
            return lhs.sortTimestamp > rhs.sortTimestamp
        }
        self.dataSource = source

        if !selectedProjectId.isEmpty, !self.projects.contains(where: { $0.id == selectedProjectId }) {
            selectedProjectId = ""
        }

        if let selectedJobId, !self.jobs.contains(where: { $0.id == selectedJobId }) {
            self.selectedJobId = nil
            self.selectedJob = nil
        }
    }
}
