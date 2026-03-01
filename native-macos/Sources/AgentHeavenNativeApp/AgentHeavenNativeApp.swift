import SwiftUI

@main
struct AgentHeavenNativeApp: App {
    @StateObject private var model = AHAppViewModel()

    var body: some Scene {
        WindowGroup("Agent Heaven Native") {
            ContentView(model: model)
                .frame(minWidth: 1320, minHeight: 760)
        }
        .windowResizability(.contentMinSize)

        Settings {
            SettingsView(paths: model.paths)
        }
    }
}

struct SettingsView: View {
    let paths: AHResolvedPaths

    var body: some View {
        Form {
            LabeledContent("User Data") {
                Text(paths.userDataPath.path)
                    .textSelection(.enabled)
            }
            LabeledContent("Store File") {
                Text(paths.storeFilePath.path)
                    .textSelection(.enabled)
            }
            LabeledContent("Jobs Dir") {
                Text(paths.jobsDirectoryPath.path)
                    .textSelection(.enabled)
            }
            LabeledContent("Bridge") {
                Text(AHBridgeClient.isDisabled ? "disabled" : "enabled")
            }
        }
        .padding(16)
        .frame(width: 760)
    }
}
