export const agentKeys = {
  all: ['agents'] as const,
  list: () => [...agentKeys.all, 'list'] as const,
  detail: (agentId: string) => [...agentKeys.all, agentId] as const,
};
