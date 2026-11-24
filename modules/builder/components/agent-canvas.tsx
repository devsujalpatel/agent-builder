'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type NodeTypes,
  type OnSelectionChangeFunc,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { BuilderFlowNode } from '@/modules/builder/lib/serialize';
import { useCanvasStore } from '@/modules/builder/store/canvas-store';

import { AgentNode } from './nodes/agent-node';
import { EndNode } from './nodes/end-node';
import { StartNode } from './nodes/start-node';

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed },
};
const proOptions = { hideAttribution: true };
const fitViewOptions = { padding: 0.16, maxZoom: 1 };

const nodeTypes: NodeTypes = {
  start: StartNode,
  agent: AgentNode,
  end: EndNode,
};

export function AgentCanvas({ onConfigure }: { onConfigure: () => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReactFlowInstance<BuilderFlowNode> | null>(null);
  const nodes = useCanvasStore((state) => state.nodes);
  const edges = useCanvasStore((state) => state.edges);
  const onNodesChange = useCanvasStore((state) => state.onNodesChange);
  const onEdgesChange = useCanvasStore((state) => state.onEdgesChange);
  const onConnect = useCanvasStore((state) => state.onConnect);
  const selectNode = useCanvasStore((state) => state.selectNode);
  const onSelectionChange = useCallback<OnSelectionChangeFunc<BuilderFlowNode>>(
    ({ nodes }) => selectNode(nodes[0]?.id ?? null),
    [selectNode],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.clientWidth;
    const observer = new ResizeObserver(() => {
      const nextWidth = canvas.clientWidth;
      if (nextWidth > 0 && nextWidth !== width) {
        width = nextWidth;
        void flowRef.current?.fitView(fitViewOptions);
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={canvasRef} className="absolute inset-0">
      <ReactFlow<BuilderFlowNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        onInit={(instance) => {
          flowRef.current = instance;
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          selectNode(node.id);
          onConfigure();
        }}
        onSelectionChange={onSelectionChange}
        onPaneClick={() => selectNode(null)}
        isValidConnection={({ source, target }) => {
          const sourceType = nodes.find((node) => node.id === source)?.type;
          const targetType = nodes.find((node) => node.id === target)?.type;
          return (
            (sourceType === 'start' && targetType === 'agent') ||
            (sourceType === 'agent' && targetType === 'end')
          );
        }}
        aria-label="Agent workflow canvas"
        fitView
        fitViewOptions={fitViewOptions}
        className="[--xy-background-color:var(--muted)] [--xy-background-pattern-dots-color:var(--border)] [--xy-controls-button-background-color-hover:var(--muted)] [--xy-controls-button-background-color:var(--card)] [--xy-controls-button-border-color:var(--border)] [--xy-controls-button-color:var(--foreground)] [--xy-edge-stroke-width:1.25] [--xy-edge-stroke:var(--muted-foreground)] [--xy-handle-background-color:var(--muted-foreground)]"
      >
        <Background gap={18} size={1.5} />
        <Controls
          showInteractive={false}
          className="m-3! overflow-hidden rounded-xl border shadow-sm [&_button:focus-visible]:outline-2 [&_button:focus-visible]:-outline-offset-2"
        />
        <MiniMap className="m-3! hidden overflow-hidden rounded-xl border shadow-sm lg:block" />
      </ReactFlow>
    </div>
  );
}
