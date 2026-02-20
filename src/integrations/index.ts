import { IntegrationRuntime } from "./runtime";
import { githubConnector } from "./providers/github";
import { linearConnector } from "./providers/linear";
import { notionConnector } from "./providers/notion";

export { IntegrationRuntime };
export * from "./types";
export * from "./settings";

export function createDefaultIntegrationRuntime() {
  return new IntegrationRuntime([linearConnector, githubConnector, notionConnector]);
}
