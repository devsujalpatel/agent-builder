import { z } from 'zod';

export const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
export const paramTypes = ['string', 'number', 'boolean'] as const;

export const httpMethodSchema = z.enum(httpMethods);
export const paramTypeSchema = z.enum(paramTypes);

const customToolParamSchema = z.object({
  name: z.string(),
  type: paramTypeSchema,
  description: z.string(),
  required: z.boolean(),
});

const customToolConfigSchema = z.object({
  type: z.literal('custom'),
  name: z.string(),
  description: z.string(),
  method: httpMethodSchema,
  url: z.string(),
  headers: z.array(z.object({ key: z.string(), value: z.string() })),
  body: z.string(),
  parameters: z.array(customToolParamSchema),
  timeoutMs: z.number().int().positive(),
});

export type CustomToolParam = z.infer<typeof customToolParamSchema>;
export type CustomToolConfig = z.infer<typeof customToolConfigSchema>;

export function defaultCustomToolConfig(): CustomToolConfig {
  return {
    type: 'custom',
    name: 'My Custom Tool',
    description: 'Describe when the agent should use this tool.',
    method: 'GET',
    url: 'https://api.example.com/endpoint',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    body: '{\n  "query": "{{query}}"\n}',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'The search query',
        required: true,
      },
    ],
    timeoutMs: 10000,
  };
}

export function toToolName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'custom_tool'
  );
}

export function isCustomToolConfig(
  config: unknown,
): config is CustomToolConfig {
  return customToolConfigSchema.safeParse(config).success;
}
