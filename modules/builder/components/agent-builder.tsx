'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Add01Icon,
  ArrowLeft01Icon,
  Message01Icon,
  Settings02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { AppIcon } from '@/components/app-icon';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import type { Agent } from '@/lib/generated/prisma/client';
import { useSaveAgent } from '@/modules/agents/hooks/use-agents';
import { ChatPanel } from '@/modules/playground/components/chat-panel';

import { canvasToBuilderDefinition, serializeCanvas } from '../lib/serialize';
import {
  CanvasProvider,
  useCanvasStore,
  useCanvasStoreApi,
} from '../store/canvas-store';
import { AgentCanvas } from './agent-canvas';
import { NodeSettingsPanel } from './node-settings-panel';
import { ToolPicker } from './tool-picker';

type WorkspacePanel = 'tools' | 'settings' | 'chat' | null;

const workspaceOverlay =
  'bg-black/25 supports-backdrop-filter:backdrop-blur-none motion-reduce:transition-none';

export function AgentBuilder({ agent }: { agent: Agent }) {
  return (
    <CanvasProvider
      draftDefinition={agent.draftDefinition}
      canvas={agent.canvas}
      key={agent.id}
    >
      <BuilderWorkspace agent={agent} />
    </CanvasProvider>
  );
}

function BuilderWorkspace({ agent }: { agent: Agent }) {
  const canvasStore = useCanvasStoreApi();
  const isCanvasDirty = useCanvasStore(
    (state) => state.revision !== state.savedRevision,
  );
  const saveAgent = useSaveAgent(agent.id);

  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [panel, setPanel] = useState<WorkspacePanel>(null);

  const displayName = name.trim() || 'Untitled Agent';
  const hasUnsavedChanges =
    isCanvasDirty ||
    displayName !== agent.name ||
    description !== agent.description;
  const prompts = Array.isArray(agent.starterPrompts)
    ? agent.starterPrompts.filter(
        (prompt): prompt is string =>
          typeof prompt === 'string' && Boolean(prompt.trim()),
      )
    : [];

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  function openSettings() {
    const { nodes, selectedNodeId, selectNode } = canvasStore.getState();
    if (!selectedNodeId)
      selectNode(nodes.find((node) => node.type === 'agent')?.id ?? null);
    setPanel('settings');
  }

  function handleSave() {
    const { nodes, edges, definition, revision, markClean, selectNode } =
      canvasStore.getState();
    const node = nodes.find((candidate) => candidate.type === 'agent');

    if (node && !node.data.modelId.trim()) {
      selectNode(node.id);
      setPanel('settings');
      toast.error('Enter a model ID before saving');
      return;
    }

    saveAgent.mutate(
      {
        name: displayName,
        description,
        draftDefinition: canvasToBuilderDefinition(nodes, edges, definition),
        canvas: serializeCanvas(nodes, edges),
      },
      {
        onSuccess: () => {
          markClean(revision);
          toast.success('Agent saved');
        },
        onError: () => {
          toast.error('Couldn’t save the agent', {
            description: 'Your changes are still here. Try saving again.',
          });
        },
      },
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[92rem] flex-1 flex-col gap-5 px-4 py-6 sm:px-8 lg:px-10 lg:py-9">
      <header className="workspace-surface space-y-4 rounded-3xl px-4 py-4 sm:px-5">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          className="text-muted-foreground -ml-2 rounded-full motion-reduce:transition-none"
          render={
            <Link
              href="/agents"
              onNavigate={(event) => {
                if (
                  hasUnsavedChanges &&
                  !window.confirm('You have unsaved changes. Leave anyway?')
                ) {
                  event.preventDefault();
                }
              }}
            />
          }
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            data-icon="inline-start"
            aria-hidden="true"
          />
          My agents
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 items-center gap-3">
            {agent.icon && agent.icon !== '🤖' ? (
              <span
                aria-hidden="true"
                className="bg-muted grid size-11 shrink-0 place-items-center rounded-2xl text-xl"
              >
                {agent.icon}
              </span>
            ) : (
              <AppIcon name="bot" badge className="size-11" />
            )}
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
                {displayName}
              </h1>
              <p
                role="status"
                className="text-muted-foreground flex items-center gap-1.5 text-xs"
              >
                {hasUnsavedChanges && (
                  <span
                    aria-hidden="true"
                    className="bg-workspace-accent size-1.5 rounded-full"
                  />
                )}
                {saveAgent.isPending
                  ? 'Saving…'
                  : hasUnsavedChanges
                    ? 'Unsaved changes'
                    : 'All changes saved'}
              </p>
            </div>
          </div>

          <div className="bg-muted/75 flex max-w-full flex-wrap items-center gap-1.5 rounded-3xl p-1 sm:rounded-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPanel('tools')}
              className="rounded-full px-3 motion-reduce:transition-none"
            >
              <HugeiconsIcon
                icon={Add01Icon}
                data-icon="inline-start"
                aria-hidden="true"
              />
              Tools
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openSettings}
              className="rounded-full px-3 motion-reduce:transition-none"
            >
              <HugeiconsIcon
                icon={Settings02Icon}
                className="hidden sm:block"
                data-icon="inline-start"
                aria-hidden="true"
              />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPanel('chat')}
              className="rounded-full px-3 motion-reduce:transition-none"
            >
              <HugeiconsIcon
                icon={Message01Icon}
                className="hidden sm:block"
                data-icon="inline-start"
                aria-hidden="true"
              />
              Test chat
            </Button>
            <Button
              variant="neutral"
              size="sm"
              onClick={handleSave}
              disabled={saveAgent.isPending || !hasUnsavedChanges}
              className="w-20 rounded-full px-3 motion-reduce:transition-none"
            >
              {saveAgent.isPending && (
                <Spinner
                  data-icon="inline-start"
                  aria-hidden="true"
                  className="motion-reduce:animate-none"
                />
              )}
              Save
            </Button>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="workflow-heading"
        className="workspace-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b px-4 py-3 sm:px-5">
          <h2 id="workflow-heading" className="text-sm font-semibold">
            Workflow
          </h2>
          <p className="text-muted-foreground text-xs">
            Double-click a node to edit it.
          </p>
        </div>
        <div className="relative min-h-[28rem] flex-1 lg:min-h-[36rem]">
          <AgentCanvas onConfigure={() => setPanel('settings')} />
        </div>
      </section>

      <Sheet
        open={panel === 'tools'}
        onOpenChange={(open) => {
          if (!open)
            setPanel((current) => (current === 'tools' ? null : current));
        }}
      >
        <SheetContent
          className="gap-0 data-[side=right]:w-full motion-reduce:transition-none sm:rounded-l-3xl sm:data-[side=right]:max-w-104"
          overlayClassName={workspaceOverlay}
        >
          <SheetHeader className="border-b px-5 py-4 pr-12">
            <SheetTitle>Add capabilities</SheetTitle>
            <SheetDescription>
              Choose tools and memory for the agent.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
            <ToolPicker onEditCustomTool={() => setPanel('settings')} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={panel === 'settings'}
        onOpenChange={(open) => {
          if (!open)
            setPanel((current) => (current === 'settings' ? null : current));
        }}
      >
        <SheetContent
          className="gap-0 data-[side=right]:w-full motion-reduce:transition-none sm:rounded-l-3xl sm:data-[side=right]:max-w-112"
          overlayClassName={workspaceOverlay}
        >
          <SheetHeader className="border-b px-5 py-4 pr-12">
            <SheetTitle>Agent settings</SheetTitle>
            <SheetDescription>
              Edit the agent’s details or configure a node.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
            <section aria-labelledby="agent-details" className="space-y-3">
              <h2 id="agent-details" className="text-sm font-semibold">
                Agent details
              </h2>
              <FieldGroup className="gap-3">
                <Field>
                  <FieldLabel htmlFor="agent-name">Name</FieldLabel>
                  <Input
                    id="agent-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="agent-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    id="agent-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </Field>
              </FieldGroup>
            </section>
            <NodeSettingsPanel />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={panel === 'chat'}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
      >
        <SheetContent
          className="bg-background gap-0 data-[side=right]:w-full motion-reduce:transition-none sm:rounded-l-3xl sm:data-[side=right]:max-w-xl [&>[data-slot=sheet-close]]:top-5"
          overlayClassName={workspaceOverlay}
        >
          <SheetHeader className="flex-row items-center gap-3 border-b px-4 py-4 pr-14 sm:px-6 sm:pr-14">
            <AppIcon name="bot" badge />
            <div className="min-w-0">
              <SheetTitle className="font-semibold">Test chat</SheetTitle>
              <SheetDescription className="truncate text-xs">
                {displayName}
              </SheetDescription>
            </div>
          </SheetHeader>
          <ChatPanel
            agentId={agent.id}
            welcomeMessage={agent.welcomeMessage}
            starterPrompts={prompts}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
