import "electron";

declare module "electron" {
  interface BrowserWindow {
    __agentHeavenRole?: "board" | "lane" | "job";
    __agentHeavenLane?: string;
    __agentHeavenJobId?: string;
    __agentHeavenWired?: boolean;
  }
}
