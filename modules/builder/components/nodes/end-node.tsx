'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

import type { BuilderFlowNode } from '@/modules/builder/lib/serialize';
import { FlowNodeCard } from './flow-node-card';

export function EndNode({
  id,
  data,
  selected,
}: NodeProps<Extract<BuilderFlowNode, { type: 'end' }>>) {
  return (
    <FlowNodeCard
      id={id}
      selected={selected}
      kind="End"
      label={data.label === 'End' ? 'Final response' : data.label}
      icon="flag"
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="size-2.5!"
      />
    </FlowNodeCard>
  );
}
