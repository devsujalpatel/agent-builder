'use client';
import {
  addEdge,
  type Connection,
  type Edge,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import {
  createContext,
  createElement,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { createStore, useStore } from 'zustand';

import {
  defaultCustomToolConfig,
  type CustomToolConfig,
} from '../lib/custom-tool';
import type { BuilderDefinition } from '@/modules/workflows/lib/schema';
import {
  loadCanvasFromDraft,
  type AgentFlowNode,
  type BuilderFlowNode,
} from '../lib/serialize';

type CanvasData = {
  nodes: BuilderFlowNode[];
  edges: Edge[];
  definition: BuilderDefinition;
  selectedNodeId: string | null;
  selectedToolIndex: number | null;
  revision: number;
  savedRevision: number;
};

type CanvasActions = {
  markClean: (revision: number) => void;
  onNodesChange: OnNodesChange<BuilderFlowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  selectNode: (id: string | null) => void;
  updateAgentNode: (id: string, data: Partial<AgentFlowNode['data']>) => void;
  addTool: (toolId: string) => void;
  addCustomTool: () => void;
  selectTool: (index: number | null) => void;
  updateTool: (index: number, config: CustomToolConfig) => void;
  removeTool: (index: number) => void;
  toggleMemory: () => void;
};

const emptyData = {
  selectedNodeId: null,
  selectedToolIndex: null,
  revision: 0,
  savedRevision: 0,
};

function createCanvasStore(draftDefinition: unknown, canvas: unknown) {
  return createStore<CanvasData & CanvasActions>((set, get) => ({
    ...loadCanvasFromDraft(draftDefinition, canvas),
    ...emptyData,
    markClean: (revision) => set({ savedRevision: revision }),
    onNodesChange: (changes) =>
      set((state) => ({
        nodes: changes.applyTo(state.nodes),
        revision: changes
          .getByType('position')
          .some((change) => change.position)
          ? state.revision + 1
          : state.revision,
      })),
    onEdgesChange: (changes) =>
      set((state) => ({
        edges: changes.applyTo(state.edges),
        revision:
          changes.getByType('select').length !== changes.toArray().length
            ? state.revision + 1
            : state.revision,
      })),
    onConnect: (connection) =>
      set((state) => {
        const edges = addEdge(connection, state.edges);
        return edges.length !== state.edges.length
          ? { edges, revision: state.revision + 1 }
          : state;
      }),
    selectNode: (id) => set({ selectedNodeId: id, selectedToolIndex: null }),
    updateAgentNode: (id, data) =>
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id && node.type === 'agent'
            ? { ...node, data: { ...node.data, ...data } }
            : node,
        ),
        revision: state.revision + 1,
      })),
    addTool: (toolId) => {
      const node = get().nodes.find((node) => node.type === 'agent');
      if (!node || node.data.tools.some((tool) => tool.toolId === toolId))
        return;
      get().updateAgentNode(node.id, {
        tools: [...node.data.tools, { toolId, config: {} }],
      });
    },
    addCustomTool: () => {
      const node = get().nodes.find((node) => node.type === 'agent');
      if (!node) return;
      get().updateAgentNode(node.id, {
        tools: [
          ...node.data.tools,
          {
            toolId: `custom_${crypto.randomUUID()}`,
            config: defaultCustomToolConfig(),
          },
        ],
      });
      set({
        selectedNodeId: node.id,
        selectedToolIndex: node.data.tools.length,
      });
    },
    selectTool: (index) => set({ selectedToolIndex: index }),
    updateTool: (index, config) => {
      const node = get().nodes.find((node) => node.type === 'agent');
      if (!node) return;
      get().updateAgentNode(node.id, {
        tools: node.data.tools.map((tool, i) =>
          i === index ? { ...tool, config } : tool,
        ),
      });
    },
    removeTool: (index) => {
      const node = get().nodes.find((node) => node.type === 'agent');
      if (!node) return;
      get().updateAgentNode(node.id, {
        tools: node.data.tools.filter((_, i) => i !== index),
      });
      set({ selectedToolIndex: null });
    },
    toggleMemory: () => {
      const node = get().nodes.find((node) => node.type === 'agent');
      if (node)
        get().updateAgentNode(node.id, {
          memoryEnabled: !node.data.memoryEnabled,
        });
    },
  }));
}

const CanvasContext = createContext<ReturnType<
  typeof createCanvasStore
> | null>(null);

export function CanvasProvider({
  draftDefinition,
  canvas,
  children,
}: {
  draftDefinition: unknown;
  canvas: unknown;
  children: ReactNode;
}) {
  const [store] = useState(() => createCanvasStore(draftDefinition, canvas));
  return createElement(CanvasContext.Provider, { value: store }, children);
}

export function useCanvasStoreApi() {
  const store = useContext(CanvasContext);
  if (!store) throw new Error('CanvasProvider is required.');
  return store;
}

export function useCanvasStore<T>(
  select: (state: CanvasData & CanvasActions) => T,
) {
  return useStore(useCanvasStoreApi(), select);
}
