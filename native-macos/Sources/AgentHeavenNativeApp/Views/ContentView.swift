import SwiftUI

struct ContentView: View {
    @ObservedObject var model: AHAppViewModel

    var body: some View {
        NavigationSplitView {
            sidebar
                .navigationTitle("Projects")
        } content: {
            VStack(spacing: 10) {
                composer
                board
            }
            .padding(10)
            .navigationTitle("Board")
        } detail: {
            JobDetailView(model: model)
        }
        .safeAreaInset(edge: .bottom) {
            HStack {
                Text(model.statusLine.isEmpty ? "Ready" : model.statusLine)
                    .lineLimit(1)
                Spacer()
                Text("Source: \(model.dataSource.rawValue)")
                    .foregroundStyle(.secondary)
            }
            .font(.caption)
            .padding(8)
            .background(.thinMaterial)
        }
        .task {
            model.startRefreshLoop()
        }
        .onDisappear {
            model.stopRefreshLoop()
        }
    }

    private var sidebar: some View {
        List(selection: $model.selectedProjectId) {
            Text("All Projects")
                .tag("")

            ForEach(model.projects) { project in
                VStack(alignment: .leading, spacing: 2) {
                    Text(project.name)
                        .font(.body)
                    Text(project.path)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                .tag(project.id)
            }

            Section("Visibility") {
                Toggle("Include Archive", isOn: $model.includeArchived)
                Toggle("Include Trash", isOn: $model.includeTrash)
            }
        }
    }

    private var composer: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 12) {
                Picker("Agent", selection: $model.composerAgent) {
                    Text("Codex").tag("codex")
                    Text("Claude").tag("claude")
                    Text("Gemini").tag("gemini")
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 320)

                TextField("Model (optional)", text: $model.composerModel)
                    .textFieldStyle(.roundedBorder)

                Button("Start Job") {
                    Task { await model.startJob() }
                }
                .keyboardShortcut(.return, modifiers: [.command])
                .disabled(model.composerPrompt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }

            TextEditor(text: $model.composerPrompt)
                .font(.body.monospaced())
                .frame(minHeight: 100, maxHeight: 140)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(.quaternary, lineWidth: 1)
                )
        }
        .padding(10)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(.ultraThinMaterial)
        )
    }

    private var board: some View {
        let groups = model.groupedJobs
        return ScrollView(.horizontal) {
            HStack(alignment: .top, spacing: 12) {
                ForEach(Array(groups.enumerated()), id: \.offset) { _, group in
                    jobColumn(status: group.0, jobs: group.1)
                }
            }
            .padding(.vertical, 4)
        }
    }

    private func jobColumn(status: AHJobStatus, jobs: [AHJob]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(status.displayTitle)
                    .font(.headline)
                Spacer()
                Text("\(jobs.count)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            ScrollView {
                LazyVStack(alignment: .leading, spacing: 8) {
                    ForEach(jobs) { job in
                        Button {
                            Task { await model.selectJob(id: job.id) }
                        } label: {
                            JobCardView(job: job, selected: model.selectedJobId == job.id)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.trailing, 2)
            }
        }
        .padding(10)
        .frame(width: 320)
        .frame(minHeight: 480)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(.thinMaterial)
        )
    }
}

struct JobCardView: View {
    let job: AHJob
    let selected: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(job.effectiveTitle)
                .font(.body.weight(.semibold))
                .lineLimit(2)

            if !job.promptPreview.isEmpty {
                Text(job.promptPreview)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
            }

            HStack(spacing: 8) {
                Text(job.agent.isEmpty ? "agent" : job.agent)
                if !job.model.isEmpty { Text(job.model) }
            }
            .font(.caption2)
            .foregroundStyle(.secondary)

            Text(AHDate.display(job.startedAt.isEmpty ? job.createdAt : job.startedAt))
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding(8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(selected ? Color.accentColor.opacity(0.2) : Color.secondary.opacity(0.1))
        )
    }
}

struct JobDetailView: View {
    @ObservedObject var model: AHAppViewModel

    var body: some View {
        if let job = model.selectedJob {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    Text(job.effectiveTitle)
                        .font(.title2.weight(.semibold))

                    actionRow(job)
                    metaGrid(job)

                    if model.dataSource == .bridge {
                        followUpComposer
                    }

                    promptSection(job)
                    messagesSection(job)
                    logsSection(job)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .navigationTitle("Job")
        } else {
            ContentUnavailableView("No Job Selected", systemImage: "rectangle.and.text.magnifyingglass")
                .navigationTitle("Details")
        }
    }

    private func actionRow(_ job: AHJob) -> some View {
        HStack(spacing: 8) {
            Button("Refresh") {
                Task {
                    await model.refresh()
                    await model.selectJob(id: job.id)
                }
            }

            if job.status == .running {
                Button("Cancel") {
                    Task { await model.cancelSelectedJob() }
                }
            }

            if job.box != "archive" {
                Button("Archive") {
                    Task { await model.archiveSelectedJob() }
                }
            }

            if job.box != "trash" {
                Button("Trash") {
                    Task { await model.trashSelectedJob() }
                }
            } else {
                Button("Restore") {
                    Task { await model.restoreSelectedJob() }
                }
            }

            Button("Delete") {
                Task { await model.deleteSelectedJob() }
            }
        }
        .buttonStyle(.bordered)
    }

    private func metaGrid(_ job: AHJob) -> some View {
        Grid(alignment: .leading, horizontalSpacing: 16, verticalSpacing: 8) {
            row("Status", job.status.rawValue)
            row("Box", job.box)
            row("Agent", job.agent)
            row("Model", job.model)
            row("Project Path", job.projectPath)
            row("Created", AHDate.display(job.createdAt))
            row("Started", AHDate.display(job.startedAt))
            row("Finished", AHDate.display(job.finishedAt))
            row("Thread", job.threadId)
            row("Exit", job.exitCode.map(String.init) ?? "-")
            row("Queued", String(job.queuedCount))
            row("ID", job.id)
        }
    }

    @ViewBuilder
    private func row(_ key: String, _ value: String) -> some View {
        GridRow {
            Text(key)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value.isEmpty ? "-" : value)
                .textSelection(.enabled)
        }
    }

    private var followUpComposer: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Follow-up")
                .font(.headline)
            TextEditor(text: $model.followUpPrompt)
                .font(.body.monospaced())
                .frame(minHeight: 80, maxHeight: 120)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(.quaternary, lineWidth: 1)
                )
            HStack {
                Spacer()
                Button("Send Follow-up") {
                    Task { await model.sendFollowUp() }
                }
                .buttonStyle(.borderedProminent)
                .disabled(model.followUpPrompt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }

    private func promptSection(_ job: AHJob) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Prompts")
                .font(.headline)
            if job.prompts.isEmpty {
                Text("-")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(Array(job.prompts.suffix(8))) { item in
                    VStack(alignment: .leading, spacing: 3) {
                        Text(AHDate.display(item.ts))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Text(item.text)
                            .font(.body)
                            .textSelection(.enabled)
                    }
                    Divider()
                }
            }
        }
    }

    private func messagesSection(_ job: AHJob) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Messages")
                .font(.headline)
            if job.messages.isEmpty {
                Text("-")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(Array(job.messages.suffix(24))) { item in
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(item.role) • \(AHDate.display(item.ts))")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Text(item.text)
                            .font(.caption)
                            .textSelection(.enabled)
                    }
                    Divider()
                }
            }
        }
    }

    private func logsSection(_ job: AHJob) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Logs")
                .font(.headline)
            if job.logs.isEmpty {
                Text("-")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(Array(job.logs.suffix(80))) { item in
                    HStack(alignment: .top, spacing: 8) {
                        Text(AHDate.display(item.ts))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Text(item.text ?? "[\(item.kind)]")
                            .font(.caption.monospaced())
                            .textSelection(.enabled)
                        Spacer()
                    }
                }
            }
        }
    }
}
