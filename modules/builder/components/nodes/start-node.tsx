'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

import type { BuilderFlowNode } from '@/modules/builder/lib/serialize';
import { FlowNodeCard } from './flow-node-card';

export function StartNode({
  id,
  data,
  selected,
}: NodeProps<Extract<BuilderFlowNode, { type: 'start' }>>) {
  return (
    <FlowNodeCard
      id={id}
      selected={selected}
      kind="Start"
      label={data.label === 'Start' ? 'User message' : data.label}
      icon="play"
    >
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="size-2.5!"
      />
    </FlowNodeCard>
  );
}
