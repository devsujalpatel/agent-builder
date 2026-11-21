'use client';

import { Add01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { AppIcon } from '@/components/app-icon';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

import { toolsCatalog } from '../lib/tools-catalog';
import { useCanvasStore } from '../store/canvas-store';

const toolGroups = [
  {
    id: 'general',
    name: 'General tools',
    tools: toolsCatalog.filter((tool) => !tool.id.startsWith('github_')),
  },
  {
    id: 'github',
    name: 'GitHub tools',
    tools: toolsCatalog.filter((tool) => tool.id.startsWith('github_')),
  },
];

export function ToolPicker({
  onEditCustomTool,
}: {
  onEditCustomTool: () => void;
}) {
  const node = useCanvasStore((state) =>
    state.nodes.find((candidate) => candidate.type === 'agent'),
  );
  const addTool = useCanvasStore((state) => state.addTool);
  const addCustomTool = useCanvasStore((state) => state.addCustomTool);
  const toggleMemory = useCanvasStore((state) => state.toggleMemory);

  if (!node) return null;

  const added = new Set(node.data.tools.map((tool) => tool.toolId));

  return (
    <div className="space-y-5">
      {toolGroups.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`tool-group-${group.id}`}
          className="space-y-2"
        >
          <h2 id={`tool-group-${group.id}`} className="text-sm font-semibold">
            {group.name}
          </h2>
          <ul className="bg-card divide-y rounded-xl border shadow-xs">
            {group.tools.map((tool) => {
              const isAdded = added.has(tool.id);

              return (
                <li
                  key={tool.id}
                  className="flex min-w-0 items-center justify-between gap-2 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <AppIcon
                      name={tool.icon}
                      badge
                      className="size-8 rounded-lg"
                    />
                    <span className="text-sm leading-tight">{tool.label}</span>
                  </span>
                  <Button
                    variant={isAdded ? 'ghost' : 'outline'}
                    size="xs"
                    disabled={isAdded}
                    aria-label={`${isAdded ? 'Added' : 'Add'} ${tool.label}`}
                    onClick={() => addTool(tool.id)}
                    className="motion-reduce:transition-none"
                  >
                    <HugeiconsIcon
                      icon={isAdded ? Tick02Icon : Add01Icon}
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    {isAdded ? 'Added' : 'Add'}
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="space-y-3 border-t border-dashed pt-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Custom tool</h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Configure an HTTP endpoint, headers, and parameters.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="motion-reduce:transition-none"
          onClick={() => {
            addCustomTool();
            onEditCustomTool();
          }}
        >
          <HugeiconsIcon
            icon={Add01Icon}
            data-icon="inline-start"
            aria-hidden="true"
          />
          Create custom tool
        </Button>
      </section>

      <Field
        orientation="horizontal"
        className="items-center justify-between border-t border-dashed pt-4"
      >
        <div className="space-y-1">
          <FieldLabel htmlFor="picker-memory">Memory</FieldLabel>
          <FieldDescription id="picker-memory-help">
            Keep context between messages.
          </FieldDescription>
        </div>
        <Switch
          id="picker-memory"
          aria-describedby="picker-memory-help"
          checked={node.data.memoryEnabled}
          onCheckedChange={toggleMemory}
          className="motion-reduce:transition-none [&>span]:motion-reduce:transition-none"
        />
      </Field>
    </div>
  );
}
