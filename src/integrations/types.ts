export type IntegrationMessageLevel = "info" | "warning" | "error";

export type IntegrationMessage = {
  connectorId: string;
  level: IntegrationMessageLevel;
  text: string;
};

export type IntegrationBinding = {
  connectorId: string;
  capability: string;
  resourceType: string;
  resourceId: string;
  externalRef: string;
  url?: string;
  title?: string;
  metadata?: Record<string, any>;
};

export type PromptEnrichmentContext = {
  jobId: string;
  projectId: string;
  projectPath: string;
  prompt: string;
  settings: any;
};

export type PromptEnrichmentResult = {
  promptPrefix?: string;
  bindings?: IntegrationBinding[];
  messages?: IntegrationMessage[];
};

export type JobCompletionContext = {
  jobId: string;
  projectId: string;
  projectPath: string;
  status: string;
  finishedAt: string;
  exitCode: number | null;
  assistantSummary: string;
  settings: any;
  bindings: IntegrationBinding[];
};

export type JobCompletionResult = {
  bindings?: IntegrationBinding[];
  messages?: IntegrationMessage[];
};

export type IntegrationConnector = {
  id: string;
  displayName: string;
  capabilities: string[];
  enrichPrompt?: (ctx: PromptEnrichmentContext) => Promise<PromptEnrichmentResult | null>;
  notifyRunCompleted?: (ctx: JobCompletionContext) => Promise<JobCompletionResult | null>;
};
