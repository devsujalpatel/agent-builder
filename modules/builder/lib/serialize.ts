import type { Edge, Node } from '@xyflow/react';

import {
  loadBuilderDefinition,
  migrateV1CanvasToV2,
} from '@/modules/workflows/lib/migrate-v1';
import type {
  AgentNodeConfig,
  BuilderDefinition,
  GithubConfig,
} from '@/modules/workflows/lib/schema';
import { savedCanvasSchema, type SavedCanvas } from './schema';

export const defaultGithubConfig: GithubConfig = {
  owner: '',
  repo: '',
  defaultPrNumber: '',
};

export type AgentFlowNode = Node<
  Omit<AgentNodeConfig, 'github'> & {
    github: GithubConfig;
    memoryEnabled: boolean;
  },
  'agent'
>;
type StartFlowNode = Node<{ label: string }, 'start'>;
type EndFlowNode = Node<{ label: string }, 'end'>;

export type BuilderFlowNode = StartFlowNode | AgentFlowNode | EndFlowNode;

const defaultPositions = {
  start: { x: 0, y: 0 },
  agent: { x: 0, y: 136 },
  end: { x: 0, y: 344 },
};

export function loadCanvasFromDraft(
  draftDefinition: unknown,
  savedCanvas: unknown,
) {
  const canvas = savedCanvasSchema.safeParse(savedCanvas);
  const originalDefinition = loadBuilderDefinition(draftDefinition);
  const definition = canvas.success
    ? originalDefinition
    : migrateV1CanvasToV2(savedCanvas, originalDefinition);
  const positions = new Map(
    canvas.success
      ? canvas.data.nodes.map((node) => [node.id, node.position])
      : [],
  );
  const nodes: BuilderFlowNode[] = definition.nodes.map((node) => {
    const position = positions.get(node.id) ?? defaultPositions[node.type];

    if (node.type === 'agent') {
      return {
        id: node.id,
        type: node.type,
        position,
        deletable: false,
        data: {
          ...node.config,
          github: node.config.github ?? defaultGithubConfig,
          memoryEnabled: definition.memory.enabled,
        },
      };
    }

    return {
      id: node.id,
      type: node.type,
      position,
      deletable: false,
      data: { label: node.label ?? (node.type === 'start' ? 'Start' : 'End') },
    };
  });

  const edges = canvas.success ? canvas.data.edges : definition.edges;
  const ids = new Set(nodes.map((node) => node.id));

  return {
    definition,
    nodes,
    edges: edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)),
  };
}

export function serializeCanvas(
  nodes: BuilderFlowNode[],
  edges: Edge[],
): SavedCanvas {
  return {
    nodes: nodes.map(({ id, type, position }) => ({ id, type, position })),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
      id,
      source,
      target,
      sourceHandle,
      targetHandle,
    })),
  };
}

export function canvasToBuilderDefinition(
  nodes: BuilderFlowNode[],
  edges: Edge[],
  definition: BuilderDefinition,
): BuilderDefinition {
  const memory = nodes.find((node) => node.type === 'agent')?.data
    .memoryEnabled;

  return {
    ...definition,
    nodes: nodes.map((node) => {
      if (node.type === 'agent') {
        const { label, instructions, modelId, tools, github } = node.data;
        return {
          id: node.id,
          type: node.type,
          config: { label, instructions, modelId, tools, github },
        };
      }

      return { id: node.id, type: node.type, label: node.data.label };
    }),
    edges: edges.map(({ id, source, target }) => ({ id, source, target })),
    memory: { enabled: memory ?? definition.memory.enabled },
  };
}
