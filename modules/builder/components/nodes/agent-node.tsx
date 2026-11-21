'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

import { AppIcon } from '@/components/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isCustomToolConfig } from '@/modules/builder/lib/custom-tool';
import type { AgentFlowNode } from '@/modules/builder/lib/serialize';
import { getToolIcon, getToolLabel } from '@/modules/builder/lib/tools-catalog';
import { useCanvasStore } from '@/modules/builder/store/canvas-store';

import { FlowNodeCard } from './flow-node-card';

export function AgentNode({ id, data, selected }: NodeProps<AgentFlowNode>) {
  const selectNode = useCanvasStore((state) => state.selectNode);
  const selectTool = useCanvasStore((state) => state.selectTool);
  const selectedTool = useCanvasStore((state) => state.selectedToolIndex);

  return (
    <FlowNodeCard
      id={id}
      selected={selected}
      kind="Agent"
      label={data.label || 'Main agent'}
      icon="bot"
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="size-2.5!"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="size-2.5!"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        className="size-2.5!"
      />
      <div className="min-w-0 space-y-2 border-t border-dashed pt-3">
        <p className="text-muted-foreground truncate font-mono text-[11px]">
          {data.modelId || 'Select a model'}
        </p>
        {(data.tools.length > 0 || data.memoryEnabled) && (
          <div className="flex flex-wrap gap-1">
            {data.tools.slice(0, 3).map(({ toolId, config }, index) => {
              const label = getToolLabel(toolId, config);
              const icon = (
                <AppIcon
                  name={getToolIcon(toolId, config)}
                  className="size-3"
                />
              );

              return isCustomToolConfig(config) ? (
                <Button
                  key={`${toolId}-${index}`}
                  variant="outline"
                  size="xs"
                  className="nodrag nopan h-5 max-w-full rounded-full motion-reduce:transition-none"
                  aria-label={`Select ${label}`}
                  aria-pressed={selectedTool === index}
                  onClick={(event) => {
                    event.stopPropagation();
                    selectNode(id);
                    selectTool(index);
                  }}
                >
                  {icon}
                  <span className="truncate">{label}</span>
                </Button>
              ) : (
                <Badge
                  key={`${toolId}-${index}`}
                  variant="secondary"
                  className="max-w-full motion-reduce:transition-none"
                >
                  {icon}
                  <span className="truncate">{label}</span>
                </Badge>
              );
            })}
            {data.tools.length > 3 && (
              <Badge
                variant="outline"
                className="motion-reduce:transition-none"
              >
                +{data.tools.length - 3} tools
              </Badge>
            )}
            {data.memoryEnabled && (
              <Badge
                variant="secondary"
                className="motion-reduce:transition-none"
              >
                <AppIcon name="memory" />
                Memory
              </Badge>
            )}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="size-2.5!"
      />
    </FlowNodeCard>
  );
}
