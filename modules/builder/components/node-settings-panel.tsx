'use client';

import { ArrowLeft01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { AppIcon } from '@/components/app-icon';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { isCustomToolConfig } from '../lib/custom-tool';
import { popularInceptionModels } from '../lib/models';
import { getToolIcon, getToolLabel } from '../lib/tools-catalog';
import { useCanvasStore } from '../store/canvas-store';
import { CustomToolSettings } from './custom-tool-settings';
import { GithubSettings } from './github-settings';

export function NodeSettingsPanel() {
  const selectedNode = useCanvasStore((state) =>
    state.nodes.find((node) => node.id === state.selectedNodeId),
  );
  const selectedToolIndex = useCanvasStore((state) => state.selectedToolIndex);
  const updateAgentNode = useCanvasStore((state) => state.updateAgentNode);
  const removeTool = useCanvasStore((state) => state.removeTool);
  const updateTool = useCanvasStore((state) => state.updateTool);
  const selectTool = useCanvasStore((state) => state.selectTool);
  const toggleMemory = useCanvasStore((state) => state.toggleMemory);

  if (!selectedNode) return null;

  if (selectedNode.type !== 'agent') {
    return (
      <section className="space-y-2 border-t border-dashed pt-5">
        <h2 className="text-sm font-semibold">{selectedNode.data.label}</h2>
        <p className="text-muted-foreground text-sm">
          {selectedNode.type === 'start'
            ? 'Receives each new message and passes it into the workflow.'
            : 'Returns the final response to the user.'}
        </p>
      </section>
    );
  }

  const { id, data } = selectedNode;
  const selectedTool =
    selectedToolIndex === null ? undefined : data.tools[selectedToolIndex];

  if (
    selectedToolIndex !== null &&
    selectedTool &&
    isCustomToolConfig(selectedTool.config)
  ) {
    return (
      <section className="space-y-4 border-t border-dashed pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 motion-reduce:transition-none"
          onClick={() => selectTool(null)}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            data-icon="inline-start"
            aria-hidden="true"
          />
          Agent node
        </Button>
        <h2 className="text-sm font-semibold">Custom tool</h2>
        <CustomToolSettings
          config={selectedTool.config}
          onChange={(config) => updateTool(selectedToolIndex, config)}
          onRemove={() => removeTool(selectedToolIndex)}
        />
      </section>
    );
  }

  return (
    <section
      aria-labelledby="node-settings"
      className="space-y-4 border-t border-dashed pt-5"
    >
      <h2 id="node-settings" className="text-sm font-semibold">
        Agent node
      </h2>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="node-label">Node label</FieldLabel>
          <Input
            id="node-label"
            value={data.label}
            onChange={(event) =>
              updateAgentNode(id, { label: event.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="node-instructions">Instructions</FieldLabel>
          <Textarea
            id="node-instructions"
            rows={4}
            value={data.instructions}
            onChange={(event) =>
              updateAgentNode(id, { instructions: event.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="node-model">Model ID</FieldLabel>
          <Input
            id="node-model"
            value={data.modelId}
            onChange={(event) =>
              updateAgentNode(id, { modelId: event.target.value })
            }
          />
          <div
            className="flex gap-1.5 overflow-x-auto py-1 pl-1"
            role="group"
            aria-label="Model presets"
          >
            {popularInceptionModels.map((model) => (
              <Button
                key={model}
                variant="secondary"
                size="xs"
                className={cn(
                  'rounded-full font-mono motion-reduce:transition-none',
                  data.modelId === model &&
                    'bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-400/20 dark:text-blue-200',
                )}
                aria-pressed={data.modelId === model}
                onClick={() => updateAgentNode(id, { modelId: model })}
              >
                {model}
              </Button>
            ))}
          </div>
        </Field>
      </FieldGroup>

      <section
        aria-labelledby="node-tools"
        className="space-y-2 border-t border-dashed pt-4"
      >
        <h3 id="node-tools" className="text-sm font-medium">
          Tools{' '}
          <span className="text-muted-foreground font-mono text-xs">
            ({data.tools.length})
          </span>
        </h3>
        {data.tools.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Open Tools to add a capability.
          </p>
        ) : (
          <ul className="bg-card divide-y rounded-xl border shadow-xs">
            {data.tools.map((tool, index) => {
              const label = getToolLabel(tool.toolId, tool.config);
              const icon = getToolIcon(tool.toolId, tool.config);

              return (
                <li
                  key={`${tool.toolId}-${index}`}
                  className="flex min-w-0 items-center justify-between gap-2 p-2"
                >
                  {isCustomToolConfig(tool.config) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-w-0 justify-start motion-reduce:transition-none"
                      onClick={() => selectTool(index)}
                    >
                      <AppIcon name={icon} className="size-4" />
                      <span className="truncate">{label}</span>
                    </Button>
                  ) : (
                    <span className="flex min-w-0 items-center gap-2 pl-2 text-sm">
                      <AppIcon name={icon} className="size-4" />
                      <span className="truncate">{label}</span>
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${label}`}
                    onClick={() => removeTool(index)}
                    className="hover:text-destructive motion-reduce:transition-none"
                  >
                    <HugeiconsIcon icon={Delete02Icon} aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Field
        orientation="horizontal"
        className="items-center justify-between border-t border-dashed pt-4"
      >
        <div className="space-y-1">
          <FieldLabel htmlFor="node-memory">Memory</FieldLabel>
          <FieldDescription id="node-memory-help">
            Keep context between messages.
          </FieldDescription>
        </div>
        <Switch
          id="node-memory"
          aria-describedby="node-memory-help"
          checked={data.memoryEnabled}
          onCheckedChange={toggleMemory}
          className="motion-reduce:transition-none [&>span]:motion-reduce:transition-none"
        />
      </Field>

      <GithubSettings nodeId={id} github={data.github} />
    </section>
  );
}
