'use client';

import Link from 'next/link';
import {
  Add01Icon,
  AlertCircleIcon,
  BotIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgents } from '@/modules/agents/hooks/use-agents';

import { AgentCard } from './agent-card';

export function AgentsPageContent() {
  const { data: agents, isPending, isError, isFetching, refetch } = useAgents();
  const hasAgents = Boolean(agents?.length);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-7 md:py-10 lg:px-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My agents
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
            Open an agent to edit its details and instructions.
          </p>
        </div>
        {(hasAgents || isPending || isError) && <CreateAgentLink />}
      </header>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <HugeiconsIcon icon={AlertCircleIcon} aria-hidden="true" />
          <AlertTitle>Couldn’t load agents</AlertTitle>
          <AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 motion-reduce:transition-none"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? 'Retrying…' : 'Try again'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isPending && (
        <div
          role="status"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <span className="sr-only">Loading agents</span>
          <Skeleton
            aria-hidden="true"
            className="h-48 rounded-xl motion-reduce:animate-none"
          />
          <Skeleton
            aria-hidden="true"
            className="h-48 rounded-xl motion-reduce:animate-none"
          />
          <Skeleton
            aria-hidden="true"
            className="hidden h-48 rounded-xl motion-reduce:animate-none xl:block"
          />
        </div>
      )}

      {hasAgents && (
        <ul className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] xl:grid-cols-3">
          {agents?.map((agent) => (
            <li key={agent.id} className="min-w-0">
              <AgentCard agent={agent} />
            </li>
          ))}
        </ul>
      )}

      {!hasAgents && !isError && !isPending && (
        <Empty className="bg-sidebar/60 min-h-80 rounded-2xl border px-5 py-12">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-13 rounded-2xl border border-blue-200/80 bg-blue-50 text-blue-800 shadow-xs dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200"
            >
              <HugeiconsIcon
                icon={BotIcon}
                className="size-6"
                aria-hidden="true"
              />
            </EmptyMedia>
            <EmptyTitle className="text-lg font-semibold">
              No agents yet
            </EmptyTitle>
            <EmptyDescription>
              Pick a template or start with a blank agent.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateAgentLink />
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}

function CreateAgentLink() {
  return (
    <Button
      render={<Link href="/agents/new" />}
      nativeButton={false}
      variant="primary"
      size="lg"
      className="motion-reduce:transition-none"
    >
      <HugeiconsIcon
        icon={Add01Icon}
        data-icon="inline-start"
        aria-hidden="true"
      />
      Create agent
    </Button>
  );
}
