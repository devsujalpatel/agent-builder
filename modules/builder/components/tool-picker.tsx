'use client';

import { Add01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { AppIcon } from '@/components/app-icon';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

import { toolsCatalog } from '../lib/tools-catalog';
import { useCanvasStore } from '../store/canvas-store';

const groups = [
  {
    label: 'General tools',
    tools: toolsCatalog.filter(({ id }) => !id.startsWith('github_')),
  },
  {
    label: 'GitHub tools',
    tools: toolsCatalog.filter(({ id }) => id.startsWith('github_')),
  },
];

export function ToolPicker({
  onEditCustomTool,
}: {
  onEditCustomTool: () => void;
}) {
  const node = useCanvasStore((state) =>
    state.nodes.find((item) => item.type === 'agent'),
  );
  const addTool = useCanvasStore((state) => state.addTool);
  const addCustomTool = useCanvasStore((state) => state.addCustomTool);
  const toggleMemory = useCanvasStore((state) => state.toggleMemory);

  if (!node) return null;

  const added = new Set(node.data.tools.map(({ toolId }) => toolId));

  return (
    <div className="space-y-6">
      {groups.map(({ label, tools }) => (
        <section key={label} className="space-y-2">
          <h2 className="text-sm font-semibold">{label}</h2>
          <ul className="workspace-surface divide-y overflow-hidden rounded-2xl">
            {tools.map((tool) => {
              const isAdded = added.has(tool.id);
              return (
                <li
                  key={tool.id}
                  className="flex min-w-0 items-center justify-between gap-3 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <AppIcon
                      name={tool.icon}
                      badge
                      className="size-8 rounded-xl [&_svg]:size-4"
                    />
                    <span className="text-sm wrap-anywhere">{tool.label}</span>
                  </span>
                  {isAdded ? (
                    <span className="text-muted-foreground flex shrink-0 items-center gap-1 px-2 text-xs">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="size-3.5"
                        aria-hidden="true"
                      />
                      Added
                    </span>
                  ) : (
                    <Button
                      aria-label={`Add ${tool.label}`}
                      variant="outline"
                      size="xs"
                      className="rounded-full px-2.5 motion-reduce:transition-none"
                      onClick={() => addTool(tool.id)}
                    >
                      Add
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Custom tool</h2>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Connect an HTTP endpoint with your own headers and parameters.
        </p>
        <Button
          variant="neutral"
          size="sm"
          className="rounded-full px-3 motion-reduce:transition-none"
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
        className="workspace-surface items-center justify-between rounded-2xl px-3 py-3"
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
