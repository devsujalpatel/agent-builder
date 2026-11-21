'use client';

import type { FormEvent } from 'react';
import Link from 'next/link';
import {
  AlertCircleIcon,
  ArrowLeft01Icon,
  Message01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useAgent, useUpdateAgent } from '@/modules/agents/hooks/use-agents';

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

  return <AgentEditor key={agent.id} agent={agent} />;
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

type BuilderAgent = NonNullable<ReturnType<typeof useAgent>['data']>;

function AgentEditor({ agent }: { agent: BuilderAgent }) {
  const { mutate, reset, isPending, isSuccess, isError } = useUpdateAgent(
    agent.id,
  );
  const draft = agent.draftDefinition;
  const instructions =
    draft &&
    typeof draft === 'object' &&
    !Array.isArray(draft) &&
    typeof draft.instructions === 'string'
      ? draft.instructions
      : '';
  const prompts = Array.isArray(agent.starterPrompts)
    ? agent.starterPrompts.filter(
        (prompt): prompt is string =>
          typeof prompt === 'string' && Boolean(prompt.trim()),
      )
    : [];
  const hasConversation = Boolean(agent.welcomeMessage || prompts.length);

  function saveAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();
    const instructions = String(data.get('instructions') ?? '').trim();

    if (name && instructions) {
      mutate({ name, description, instructions });
    }
  }

  return (
    <div className={pageClassName}>
      <BackToAgents />
      <header className="mt-4 mb-7 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight wrap-anywhere sm:text-4xl">
          {agent.name}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          Edit the details and instructions for this agent.
        </p>
      </header>

      <div
        className={
          hasConversation
            ? 'grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'
            : 'max-w-2xl'
        }
      >
        <form
          onSubmit={saveAgent}
          onInput={() => {
            if (isSuccess || isError) reset();
          }}
        >
          <Card className="border-border border shadow-xs ring-0 [--card-spacing:--spacing(5)]">
            <CardHeader>
              <CardTitle>
                <h2>Agent configuration</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <fieldset disabled={isPending}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="agent-name">Name</FieldLabel>
                    <Input
                      id="agent-name"
                      name="name"
                      required
                      pattern=".*\S.*"
                      defaultValue={agent.name}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="agent-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      id="agent-description"
                      name="description"
                      defaultValue={agent.description}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="agent-instructions">
                      Instructions
                    </FieldLabel>
                    <Textarea
                      id="agent-instructions"
                      name="instructions"
                      required
                      defaultValue={instructions}
                      aria-describedby="agent-instructions-help"
                      className="min-h-32"
                      onChange={(event) => {
                        const field = event.currentTarget;
                        field.setCustomValidity(
                          field.value && !field.value.trim()
                            ? 'Enter instructions for the agent.'
                            : '',
                        );
                      }}
                    />
                    <FieldDescription id="agent-instructions-help">
                      Describe what the agent should do and how it should
                      respond.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </fieldset>
            </CardContent>
            <CardFooter className="flex-wrap justify-between gap-3 rounded-none border-dashed bg-transparent py-3">
              <div className="text-sm">
                {isSuccess && (
                  <p role="status" className="text-muted-foreground">
                    Changes saved
                  </p>
                )}
                {isError && (
                  <p role="alert" className="text-destructive">
                    Couldn’t save changes. Try again.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
                className="ml-auto motion-reduce:transition-none"
              >
                {isPending && (
                  <Spinner
                    data-icon="inline-start"
                    aria-hidden="true"
                    className="motion-reduce:animate-none"
                  />
                )}
                {isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {hasConversation && (
          <Card className="border-border border shadow-xs ring-0 [--card-spacing:--spacing(5)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Message01Icon}
                  className="text-muted-foreground size-4"
                  aria-hidden="true"
                />
                <h2>Conversation preview</h2>
              </CardTitle>
              {agent.welcomeMessage && (
                <CardDescription className="wrap-anywhere">
                  {agent.welcomeMessage}
                </CardDescription>
              )}
            </CardHeader>
            {prompts.length > 0 && (
              <CardContent>
                <ul className="space-y-2">
                  {prompts.map((prompt) => (
                    <li
                      key={prompt}
                      className="bg-muted/70 text-muted-foreground rounded-lg px-3 py-2.5 text-xs leading-relaxed wrap-anywhere"
                    >
                      “{prompt}”
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        )}
      </div>
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
