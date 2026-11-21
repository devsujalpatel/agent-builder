'use client';

import Link from 'next/link';
import { AlertCircleIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgent } from '@/modules/agents/hooks/use-agents';
import { AgentBuilder } from '@/modules/builder/components/agent-builder';

const pageClassName =
  'mx-auto w-full max-w-6xl px-4 py-8 sm:px-7 md:py-10 lg:px-10';

export function BuilderPageContent({ agentId }: { agentId: string }) {
  const {
    data: agent,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useAgent(agentId);

  if (isPending) {
    return <BuilderPageLoading />;
  }

  if (!agent) {
    return (
      <div className={pageClassName}>
        <BackToAgents />
        <Alert className="mt-5" variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} aria-hidden="true" />
          <AlertTitle>
            {isError ? 'Couldn’t load this agent.' : 'Agent not found.'}
          </AlertTitle>
        </Alert>
        {isError && (
          <Button
            variant="outline"
            className="mt-4 motion-reduce:transition-none"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Retrying…' : 'Try again'}
          </Button>
        )}
      </div>
    );
  }

  return <AgentBuilder key={agent.id} agent={agent} />;
}

export function BuilderPageLoading() {
  return (
    <div className={pageClassName} role="status">
      <span className="sr-only">Loading agent</span>
      <Skeleton className="h-9 w-52 max-w-full motion-reduce:animate-none" />
      <Skeleton className="mt-7 h-80 motion-reduce:animate-none" />
    </div>
  );
}

function BackToAgents() {
  return (
    <Button
      variant="ghost"
      size="sm"
      render={<Link href="/agents" />}
      nativeButton={false}
      className="text-muted-foreground -ml-2 motion-reduce:transition-none"
    >
      <HugeiconsIcon
        icon={ArrowLeft01Icon}
        data-icon="inline-start"
        aria-hidden="true"
      />
      My agents
    </Button>
  );
}
