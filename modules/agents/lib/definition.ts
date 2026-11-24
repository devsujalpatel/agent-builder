import type { LegacyDefinition } from '@/modules/builder/lib/schema';

export type GithubConfig = {
  owner: string;
  repo: string;
  defaultPrNumber: string;
};

export type AgentDefinition = {
  schemaVersion: 1;
  instructions: string;
  model: LegacyDefinition['model'];
  tools: LegacyDefinition['tools'];
  memory: { enabled: boolean };
  limits: { maxToolCalls: number; timeoutMs: number };
  github?: GithubConfig;
};

export function defaultDefinition(): AgentDefinition {
  return {
    schemaVersion: 1,
    instructions: "You are a helpful assistant.",
    model: { provider: "openai", modelId: "gpt-4o-mini" },
    tools: [],
    memory: { enabled: false },
    limits: { maxToolCalls: 5, timeoutMs: 60000 },
  };
}
