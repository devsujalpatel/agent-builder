'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircleIcon,
  ArrowDown01Icon,
  Tick02Icon,
  Wrench01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { z } from 'zod';

import { AiStatus } from '@/components/ui/ai-status';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import { Message, MessageContent, MessageGroup } from '@/components/ui/message';
import MatrixOrb from '@/components/ui/matrix-orb';
import { PromptBox } from '@/components/ui/prompt-box';
import { StreamingResponse } from '@/components/ui/streaming-response';
import { WebSearch, type WebSource } from '@/components/ui/web-search';
import { canvasToBuilderDefinition } from '@/modules/builder/lib/serialize';
import { getToolLabel } from '@/modules/builder/lib/tools-catalog';
import { useCanvasStoreApi } from '@/modules/builder/store/canvas-store';
import { builderDefinitionSchema } from '@/modules/workflows/lib/schema';

import { streamAgentRun } from '../lib/stream-client';
import { MarkdownReply } from './markdown-reply';

type ToolStatus = { tool: string; status: 'running' | 'done'; query?: string };
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  tools?: ToolStatus[];
  sources?: WebSource[];
  error?: string;
};

const searchInput = z.object({ query: z.string() });
const webSource = z.object({
  url: z.url({ protocol: /^https?$/ }),
  title: z.string().optional(),
  snippet: z.string().optional(),
});
const promptEfforts = [{ id: 'default', label: 'Default', color: '#fc4c01' }];

function collectSources(output: string, sources: WebSource[]): WebSource[] {
  let value: unknown;
  try {
    value = JSON.parse(output);
  } catch {
    return sources;
  }
  const results = Array.isArray(value) ? value : [value];
  const byUrl = new Map(sources.map((source) => [source.url, source]));
  for (const result of results) {
    const { data } = webSource.safeParse(result);
    if (!data || byUrl.has(data.url)) continue;
    byUrl.set(data.url, {
      ...data,
      id: data.url,
      title: data.title?.trim() || new URL(data.url).hostname,
    });
  }
  return [...byUrl.values()];
}

function renderReply(content: string) {
  return <MarkdownReply content={content} />;
}

function ToolActivity({
  tools,
  pending,
}: {
  tools: ToolStatus[];
  pending: boolean;
}) {
  const activeTool = pending
    ? tools.findLast((tool) => tool.status === 'running')
    : undefined;

  return (
    <details className="group/activity border-border bg-card max-w-full self-start rounded-lg border">
      <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex cursor-pointer list-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus-visible:ring-3 [&::-webkit-details-marker]:hidden">
        <HugeiconsIcon
          icon={Wrench01Icon}
          className="size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span className="min-w-0 wrap-anywhere">
          {activeTool
            ? `Using ${getToolLabel(activeTool.tool)}`
            : `${tools.length} tool ${tools.length === 1 ? 'call' : 'calls'}`}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="ml-auto size-3.5 shrink-0 group-open/activity:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul className="border-t px-2.5 py-1.5">
        {tools.map((tool, index) => (
          <li key={index} className="flex items-start gap-2 py-1 text-xs">
            {tool.status === 'done' ? (
              <HugeiconsIcon
                icon={Tick02Icon}
                className="mt-px size-3.5 shrink-0 text-emerald-700 dark:text-emerald-400"
                aria-hidden="true"
              />
            ) : (
              <span
                aria-hidden="true"
                className="border-muted-foreground mt-1 size-2.5 shrink-0 rounded-full border"
              />
            )}
            <span className="min-w-0 flex-1 wrap-anywhere">
              {getToolLabel(tool.tool)}
            </span>
            <span className="text-muted-foreground">
              {tool.status === 'done'
                ? 'Done'
                : pending
                  ? 'Running'
                  : 'Interrupted'}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function ChatPanel({
  agentId,
  welcomeMessage,
  starterPrompts = [],
}: {
  agentId: string;
  welcomeMessage?: string;
  starterPrompts?: string[];
}) {
  const store = useCanvasStoreApi();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);
  const [validationError, setValidationError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const followsReply = useRef(true);
  const requestRef = useRef<AbortController>(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll && followsReply.current) scroll.scrollTop = scroll.scrollHeight;
  }, [messages]);

  function updateLastMessage(patch: Partial<ChatMessage>) {
    setMessages((previous) => {
      const last = previous.at(-1);
      return last
        ? [...previous.slice(0, -1), { ...last, ...patch }]
        : previous;
    });
  }

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || requestRef.current) return;

    const { nodes, edges, definition } = store.getState();
    const draft = builderDefinitionSchema.safeParse(
      canvasToBuilderDefinition(nodes, edges, definition),
    );
    if (!draft.success) {
      setValidationError('Set a model ID in Agent settings before testing.');
      return;
    }

    const request = new AbortController();
    requestRef.current = request;
    followsReply.current = true;
    setInput('');
    setValidationError('');
    setIsRunning(true);
    setMessages((previous) => [
      ...previous,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    let reply = '';
    let tools: ToolStatus[] = [];
    let sources: WebSource[] = [];

    try {
      await streamAgentRun(
        agentId,
        { message, conversationId, definition: draft.data },
        (event) => {
          if (request.signal.aborted) return;

          switch (event.type) {
            case 'text_delta':
              reply += event.text;
              updateLastMessage({ content: reply });
              break;
            case 'tool_started': {
              const query =
                event.tool === 'web_search'
                  ? searchInput.safeParse(event.input).data?.query
                  : undefined;
              tools = [
                ...tools,
                { tool: event.tool, status: 'running', query },
              ];
              updateLastMessage({ tools });
              break;
            }
            case 'tool_completed': {
              const index = tools.findIndex(
                (tool) => tool.tool === event.tool && tool.status === 'running',
              );
              tools = tools.map((tool, i) =>
                i === index ? { ...tool, status: 'done' } : tool,
              );
              if (
                event.tool === 'web_search' ||
                event.tool === 'read_webpage'
              ) {
                sources = collectSources(event.output, sources);
              }
              updateLastMessage({ tools, sources });
              break;
            }
            case 'run_completed':
              setConversationId(event.conversationId);
              if (!reply.trim()) {
                updateLastMessage({
                  error: 'The agent returned an empty reply.',
                });
              }
              break;
            case 'run_failed':
              if (event.conversationId) setConversationId(event.conversationId);
              updateLastMessage({ error: event.error });
              break;
          }
        },
        request.signal,
      );
    } finally {
      requestRef.current = null;
      if (!request.signal.aborted) setIsRunning(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={(event) => {
          const scroll = event.currentTarget;
          followsReply.current =
            scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 40;
        }}
        className="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:var(--ring)_transparent] overflow-y-auto overscroll-contain px-4 sm:px-6"
      >
        {messages.length === 0 && (
          <div className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-center space-y-4 py-8 text-center">
            <MatrixOrb
              size={76}
              color="#fc4c01"
              labels={{ idle: '' }}
              aria-hidden="true"
              className="gap-0"
            />
            <p className="text-muted-foreground text-sm leading-relaxed wrap-anywhere whitespace-pre-wrap">
              {welcomeMessage || 'Send a message to test your agent.'}
            </p>
            {starterPrompts.length > 0 && (
              <div className="grid w-full gap-2">
                {starterPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto min-h-9 w-full justify-start rounded-2xl px-3 py-2 text-left wrap-anywhere whitespace-normal motion-reduce:transition-none"
                    onClick={() => void sendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <MessageGroup
          role="log"
          aria-label="Test messages"
          className="gap-5 py-5 empty:hidden"
        >
          {messages.map((message, index) => {
            const fromUser = message.role === 'user';
            const pending =
              !fromUser &&
              !message.error &&
              isRunning &&
              index === messages.length - 1;
            const activeTool = pending
              ? message.tools?.findLast((tool) => tool.status === 'running')
              : undefined;
            const searching = activeTool?.tool === 'web_search';
            const sources = message.sources ?? [];
            const showSearch = searching || sources.length > 0;
            const otherTools = showSearch
              ? message.tools?.filter(
                  ({ tool }) =>
                    tool !== 'web_search' && tool !== 'read_webpage',
                )
              : message.tools;
            if (
              !message.content &&
              !message.tools?.length &&
              !message.error &&
              !pending
            )
              return null;

            return (
              <Message
                key={index}
                align={fromUser ? 'end' : 'start'}
                role="group"
                aria-label={fromUser ? 'You' : 'Agent'}
              >
                {fromUser ? (
                  <MessageContent className="max-w-[87%]">
                    <Bubble align="end" variant="muted">
                      <BubbleContent className="rounded-br-sm px-3.5 py-2.5 wrap-anywhere whitespace-pre-wrap">
                        {message.content}
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                ) : (
                  <MessageContent>
                    {showSearch && (
                      <WebSearch
                        sources={sources}
                        status={searching ? 'searching' : 'done'}
                        query={activeTool?.query}
                        label={
                          searching
                            ? undefined
                            : `${sources.length} web ${sources.length === 1 ? 'source' : 'sources'}`
                        }
                        defaultOpen={false}
                        className="w-full font-sans"
                      />
                    )}
                    {!!otherTools?.length && (
                      <ToolActivity tools={otherTools} pending={pending} />
                    )}
                    {message.content && (
                      <StreamingResponse
                        text={message.content}
                        status={
                          pending
                            ? 'streaming'
                            : message.error
                              ? 'stopped'
                              : 'done'
                        }
                        renderContent={renderReply}
                        showFeedback={false}
                      />
                    )}
                    {pending &&
                      !message.content &&
                      (!activeTool || activeTool.tool === 'read_webpage') && (
                        <AiStatus
                          state={
                            activeTool?.tool === 'read_webpage'
                              ? 'researching'
                              : 'thinking'
                          }
                          label={
                            activeTool?.tool === 'read_webpage'
                              ? 'Reading webpages'
                              : undefined
                          }
                          timer={false}
                        />
                      )}
                    {message.error && (
                      <p
                        role="alert"
                        className="border-destructive/25 bg-destructive/10 text-foreground flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm wrap-anywhere"
                      >
                        <HugeiconsIcon
                          icon={AlertCircleIcon}
                          className="text-destructive mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="min-w-0">{message.error}</span>
                      </p>
                    )}
                  </MessageContent>
                )}
              </Message>
            );
          })}
        </MessageGroup>
      </div>

      <div className="bg-card space-y-2 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        {validationError && (
          <p role="alert" className="text-destructive text-xs">
            {validationError}
          </p>
        )}
        <PromptBox
          value={input}
          onValueChange={setInput}
          onSubmit={(text) => void sendMessage(text)}
          clearOnSubmit={false}
          status={isRunning ? 'streaming' : 'idle'}
          efforts={promptEfforts}
          placeholder="Ask your agent…"
          inputProps={{ 'aria-label': 'Message', className: 'text-base' }}
          className="border-input bg-card focus-within:border-ring dark:bg-card w-full font-sans"
        />
      </div>
    </div>
  );
}
