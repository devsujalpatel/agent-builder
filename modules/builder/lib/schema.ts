import { z } from 'zod';

import {
  builderDefinitionSchema,
  executionEdgeSchema,
  githubConfigSchema,
  toolConfigSchema,
} from '@/modules/workflows/lib/schema';

const id = z.string().min(1);

const memorySchema = z.object({ enabled: z.boolean() });

export const legacyDefinitionSchema = z.object({
  schemaVersion: z.literal(1),
  instructions: z.string(),
  model: z.object({ provider: z.enum(['inception', 'openai']), modelId: id }),
  tools: z.array(toolConfigSchema),
  memory: memorySchema,
  limits: z.object({
    maxToolCalls: z.number().int().nonnegative(),
    timeoutMs: z.number().int().positive(),
  }),
  github: githubConfigSchema.optional(),
});

const canvasNodeSchema = z.object({
  id,
  type: z.enum(['start', 'agent', 'end']),
  position: z.object({ x: z.number(), y: z.number() }),
});

export const savedCanvasSchema = z.object({
  nodes: z.array(canvasNodeSchema),
  edges: z.array(
    executionEdgeSchema.extend({
      sourceHandle: z.string().nullable().optional(),
      targetHandle: z.string().nullable().optional(),
    }),
  ),
});

export const saveAgentInputSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string(),
  draftDefinition: builderDefinitionSchema,
  canvas: savedCanvasSchema,
});

export type LegacyDefinition = z.infer<typeof legacyDefinitionSchema>;
export type SaveAgentInput = z.infer<typeof saveAgentInputSchema>;
export type SavedCanvas = z.infer<typeof savedCanvasSchema>;
