'use client';

import Link from 'next/link';
import {
  ArrowUpRight01Icon,
  BotIcon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { formatDistanceToNow } from 'date-fns';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

  return (
    <Card className="border-border h-full border shadow-xs ring-0 [--card-spacing:--spacing(5)]">
      <CardHeader className="gap-1.5">
        <span
          aria-hidden="true"
          className="mb-2 grid size-10 place-items-center rounded-xl bg-blue-50 text-lg text-blue-800 dark:bg-blue-400/15 dark:text-blue-200"
        >
          {agent.icon && agent.icon !== '🤖' ? (
            agent.icon
          ) : (
            <HugeiconsIcon icon={BotIcon} className="size-5" />
          )}
        </span>
        <CardTitle>
          <h2 className="wrap-anywhere">{agent.name}</h2>
        </CardTitle>
        <CardDescription className="line-clamp-2 wrap-anywhere">
          {agent.description || 'No description yet'}
        </CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex-wrap justify-between gap-2 rounded-none border-dashed bg-transparent py-3">
        <p className="text-muted-foreground font-mono text-[11px]">
          Updated {formatDistanceToNow(agent.updatedAt, { addSuffix: true })}
        </p>
        <div className="flex items-center gap-1">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${agent.name}`}
                  className="text-muted-foreground hover:text-destructive motion-reduce:transition-none"
                />
              }
            >
              <HugeiconsIcon icon={Delete02Icon} aria-hidden="true" />
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[calc(100%-2rem)] motion-reduce:animate-none">
              <AlertDialogHeader className="min-w-0">
                <AlertDialogTitle className="min-w-0 wrap-anywhere">
                  Delete “{agent.name}”?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the agent and all its test chats.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteAgent.isError && (
                <p role="alert" className="text-destructive text-sm">
                  Couldn’t delete the agent. Try again.
                </p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleteAgent.isPending}
                  onClick={() => deleteAgent.mutate(agent.id)}
                >
                  {deleteAgent.isPending ? 'Deleting…' : 'Delete agent'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/agents/${agent.id}/builder`} />}
            nativeButton={false}
            aria-label={`Open ${agent.name}`}
            className="motion-reduce:transition-none"
          >
            Open
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              data-icon="inline-end"
              aria-hidden="true"
            />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
