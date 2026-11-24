'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { ArrowUpRight01Icon, BotIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DeleteButton } from '@/components/ui/delete-button';
import { toast } from '@/components/ui/toast';
import { useDeleteAgent } from '@/modules/agents/hooks/use-agents';

type AgentCardProps = {
  agent: {
    id: string;
    name: string;
    description: string;
    icon: string;
    updatedAt: Date;
  };
};

export function AgentCard({ agent }: AgentCardProps) {
  const deleteAgent = useDeleteAgent();
  const [confirming, setConfirming] = useState(false);
  const descriptionId = useId();

  return (
    <Card
      data-confirming={confirming || undefined}
      className="workspace-surface relative isolate h-full overflow-visible rounded-3xl ring-0 [--card-spacing:--spacing(5)] data-confirming:z-10"
    >
      <CardHeader className="gap-1.5">
        <span
          aria-hidden="true"
          className="bg-muted text-foreground mb-2 grid size-12 place-items-center rounded-2xl text-xl"
        >
          {agent.icon && agent.icon !== '🤖' ? (
            agent.icon
          ) : (
            <HugeiconsIcon icon={BotIcon} className="size-5" />
          )}
        </span>
        <CardTitle className="text-[17px] font-semibold tracking-tight">
          <h2 className="line-clamp-2 wrap-anywhere">{agent.name}</h2>
        </CardTitle>
        <CardDescription className="line-clamp-2 wrap-anywhere">
          {agent.description || 'No description yet'}
        </CardDescription>
      </CardHeader>
      <div className="absolute top-5 right-5 z-10 flex flex-col items-end">
        <DeleteButton
          expandFrom="end"
          triggerLabel={`Delete ${agent.name}`}
          confirmationDescriptionId={descriptionId}
          onOpenChange={setConfirming}
          onConfirm={() =>
            deleteAgent.mutateAsync(agent.id, {
              onSuccess: () => toast.success('Agent deleted'),
              onError: () =>
                toast.error('Couldn’t delete the agent. Try again.'),
            })
          }
        />
        {confirming && (
          <p
            id={descriptionId}
            className="bg-popover text-popover-foreground border-border absolute right-0 bottom-full mb-2 w-48 rounded-xl border px-3 py-2 text-xs leading-relaxed shadow-md"
          >
            Permanently deletes this agent and its test chats.
          </p>
        )}
      </div>
      <CardFooter className="mt-auto justify-between gap-2 rounded-b-3xl bg-transparent py-3">
        <p className="text-muted-foreground min-w-0 text-xs tabular-nums">
          Updated {formatDistanceToNow(agent.updatedAt, { addSuffix: true })}
        </p>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/agents/${agent.id}/builder`} />}
          nativeButton={false}
          aria-label={`Open ${agent.name}`}
          className="rounded-full px-3 motion-reduce:transition-none"
        >
          Open
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            data-icon="inline-end"
            aria-hidden="true"
          />
        </Button>
      </CardFooter>
    </Card>
  );
}
