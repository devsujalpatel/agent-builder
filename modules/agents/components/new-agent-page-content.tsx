'use client';

import { Add01Icon, BotIcon, File01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  useCreateBlankAgent,
  useCreateFromTemplate,
} from '@/modules/agents/hooks/use-agents';
import { templates } from '@/modules/agents/lib/templates';

import { TemplateCard } from './template-card';

export function NewAgentPageContent() {
  const createBlank = useCreateBlankAgent();
  const createTemplate = useCreateFromTemplate();
  const isCreatingBlank = createBlank.isPending || createBlank.isSuccess;
  const isCreatingTemplate =
    createTemplate.isPending || createTemplate.isSuccess;
  const isCreating = isCreatingBlank || isCreatingTemplate;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 md:py-12 lg:px-12">
      <header className="mb-7 space-y-2 border-b pb-6">
        <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.045em] sm:text-[2.75rem]">
          Create an agent
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          Start with your own instructions or pick a template for the job.
        </p>
      </header>

      <Card className="workspace-surface grid gap-0 overflow-hidden rounded-3xl py-0 ring-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col items-start p-5 sm:p-7">
          <span className="bg-muted text-workspace-accent-ink mb-4 flex size-10 items-center justify-center rounded-2xl">
            <HugeiconsIcon
              icon={File01Icon}
              className="size-5"
              aria-hidden="true"
            />
          </span>
          <h2 className="text-lg font-semibold tracking-tight">
            Start from scratch
          </h2>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-relaxed">
            Create a blank agent and decide what it should do and how it should
            respond.
          </p>
          <Button
            variant="neutral"
            size="lg"
            className="mt-5 rounded-full px-4 motion-reduce:transition-none"
            onClick={() => {
              createTemplate.reset();
              createBlank.mutate();
            }}
            disabled={isCreating}
          >
            {isCreatingBlank ? (
              <Spinner
                data-icon="inline-start"
                aria-hidden="true"
                className="motion-reduce:animate-none"
              />
            ) : (
              <HugeiconsIcon
                icon={Add01Icon}
                data-icon="inline-start"
                aria-hidden="true"
              />
            )}
            {isCreatingBlank ? 'Creating…' : 'Create blank agent'}
          </Button>
        </div>
        <BlankAgentIllustration />
      </Card>

      <section
        aria-labelledby="templates-heading"
        className="mt-9 border-t border-dashed pt-7"
      >
        <div className="mb-5 space-y-1">
          <h2
            id="templates-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Agent templates
          </h2>
          <p className="text-muted-foreground text-sm">
            Start with a role and sample prompts you can build on.
          </p>
        </div>
        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              disabled={isCreating}
              isCreating={
                isCreatingTemplate && createTemplate.variables === template.id
              }
              onCreate={() => {
                createBlank.reset();
                createTemplate.mutate(template.id);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function BlankAgentIllustration() {
  return (
    <div
      aria-hidden="true"
      className="bg-muted/65 text-workspace-accent-ink relative hidden min-h-52 items-center justify-center overflow-hidden border-l sm:flex"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black,transparent_80%)] bg-size-[14px_14px] opacity-20" />
      <div className="border-border bg-muted relative rotate-6 rounded-2xl border shadow-sm">
        <div className="bg-card border-border -translate-x-2 -translate-y-2 -rotate-12 rounded-2xl border px-5 py-4 shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <span className="bg-muted grid size-9 place-items-center rounded-xl">
              <HugeiconsIcon icon={BotIcon} className="size-5" />
            </span>
            <span className="bg-foreground/20 h-2 w-16 rounded-full" />
          </div>
          <div className="space-y-2 border-t border-dashed pt-3">
            <div className="bg-muted h-1.5 w-27 rounded-full" />
            <div className="bg-muted h-1.5 w-18 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
