import type { LegacyDefinition } from '@/modules/builder/lib/schema';

export type AgentDefinition = LegacyDefinition;

export function defaultDefinition(): AgentDefinition {
  return {
    schemaVersion: 1,
    instructions: 'You are a helpful assistant.',
    model: { provider: 'inception', modelId: 'mercury-3' },
    tools: [],
    memory: { enabled: false },
    limits: { maxToolCalls: 5, timeoutMs: 60000 },
  };
}
