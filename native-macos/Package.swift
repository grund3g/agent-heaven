// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "AgentHeavenNative",
    defaultLocalization: "en",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(
            name: "AgentHeavenNativeApp",
            targets: ["AgentHeavenNativeApp"]
        )
    ],
    targets: [
        .executableTarget(
            name: "AgentHeavenNativeApp",
            path: "Sources/AgentHeavenNativeApp"
        )
    ]
)
