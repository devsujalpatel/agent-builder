export type AgentDefinition = {
  schemaVersion: 1;
  instructions: string;
  model: { provider: 'inception'; modelId: string };
  tools: { toolId: string; config: Record<string, unknown> }[];
  memory: { enabled: boolean };
  limits: { maxToolCalls: number; timeoutMs: number };
};

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
