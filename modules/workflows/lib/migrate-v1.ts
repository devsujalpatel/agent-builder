import { z } from 'zod';

import { legacyDefinitionSchema } from '@/modules/builder/lib/schema';
import type { AgentDefinition } from '@/modules/agents/lib/definition';

import {
  builderDefinitionSchema,
  defaultBuilderDefinition,
  executionEdgeSchema,
  githubConfigSchema,
  toolConfigSchema,
  type BuilderDefinition,
} from './schema';

const legacyCanvasSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string().optional(),
      data: z.record(z.string(), z.unknown()).default({}),
    }),
  ),
  edges: z.array(executionEdgeSchema).default([]),
});

export function migrateV1ToV2(legacy: AgentDefinition): BuilderDefinition {
  const base = defaultBuilderDefinition({
    instructions: legacy.instructions,
    modelId: legacy.model.modelId,
    tools: legacy.tools,
    github: legacy.github,
  });

  return {
    ...base,
    memory: legacy.memory,
    limits: { ...base.limits, ...legacy.limits },
  };
}

export function migrateV1CanvasToV2(
  rawCanvas: unknown,
  base: BuilderDefinition,
) {
  const legacy = legacyCanvasSchema.safeParse(rawCanvas);
  if (!legacy.success) return base;

  const { nodes, edges } = legacy.data;
  if (nodes.some((node) => node.type === 'start')) return base;

  const legacyAgent = nodes.find((node) => node.type === 'agent');
  const model = nodes.find((node) => node.type === 'model');
  const targetId = legacyAgent?.id ?? 'agent';
  const isConnected = (sourceId: string) =>
    edges.some((edge) => edge.source === sourceId && edge.target === targetId);

  const tools = nodes.flatMap((node) => {
    if (node.type !== 'tool' || !isConnected(node.id)) return [];
    const parsed = toolConfigSchema.safeParse({
      toolId: node.data.toolId,
      config: node.data.isCustom ? node.data.config : {},
    });
    return parsed.success ? [parsed.data] : [];
  });

  const memory = nodes.find((node) => node.type === 'memory');
  const label = legacyAgent?.data.label;
  const instructions = legacyAgent?.data.instructions;
  const modelId = model?.data.modelId;
  const github = githubConfigSchema.safeParse(legacyAgent?.data.github);

  return {
    ...base,
    memory: { enabled: memory ? isConnected(memory.id) : base.memory.enabled },
    nodes: base.nodes.map((node) => {
      if (node.type !== 'agent') return node;
      const config = node.config;
      return {
        ...node,
        config: {
          label: typeof label === 'string' ? label : config.label,
          instructions:
            typeof instructions === 'string'
              ? instructions
              : config.instructions,
          modelId:
            typeof modelId === 'string' && modelId.trim()
              ? modelId
              : config.modelId,
          tools: tools.length ? tools : config.tools,
          github: github.success ? github.data : config.github,
        },
      };
    }),
  };
}

export function loadBuilderDefinition(raw: unknown): BuilderDefinition {
  const current = builderDefinitionSchema.safeParse(raw);
  if (current.success) return current.data;

  const legacy = legacyDefinitionSchema.safeParse(raw);
  return legacy.success
    ? migrateV1ToV2(legacy.data)
    : defaultBuilderDefinition();
}
