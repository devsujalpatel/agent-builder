'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { AppIcon } from '@/components/app-icon';
import { Badge } from '@/components/ui/badge';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message, MessageContent, MessageGroup } from '@/components/ui/message';
import { Spinner } from '@/components/ui/spinner';
import { canvasToBuilderDefinition } from '@/modules/builder/lib/serialize';
import { getToolLabel } from '@/modules/builder/lib/tools-catalog';
import { useCanvasStoreApi } from '@/modules/builder/store/canvas-store';
import { builderDefinitionSchema } from '@/modules/workflows/lib/schema';

import { streamAgentRun } from '../lib/stream-client';

type ToolStatus = { tool: string; status: 'running' | 'done' };
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  tools?: ToolStatus[];
  isError?: boolean;
};

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
  const requestRef = useRef<AbortController>(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
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
            case 'tool_started':
              tools = [...tools, { tool: event.tool, status: 'running' }];
              updateLastMessage({ tools });
              break;
            case 'tool_completed': {
              const index = tools.findIndex(
                (tool) => tool.tool === event.tool && tool.status === 'running',
              );
              tools = tools.map((tool, i) =>
                i === index ? { ...tool, status: 'done' } : tool,
              );
              updateLastMessage({ tools });
              break;
            }
            case 'run_completed':
              setConversationId(event.conversationId);
              break;
            case 'run_failed':
              if (event.conversationId) setConversationId(event.conversationId);
              updateLastMessage({ content: event.error, isError: true });
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
        role="log"
        aria-label="Test messages"
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5"
      >
        {messages.length === 0 && (
          <div className="bg-card space-y-3 rounded-xl border p-4 shadow-xs">
            <AppIcon name="bot" badge />
            <p className="text-sm leading-relaxed wrap-anywhere">
              {welcomeMessage || 'Send a message to test your agent.'}
            </p>
            {starterPrompts.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-dashed pt-3">
                {starterPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto min-h-7 max-w-full justify-start py-1.5 text-left wrap-anywhere whitespace-normal motion-reduce:transition-none"
                    onClick={() => void sendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <MessageGroup>
          {messages.map((message, index) => {
            const fromUser = message.role === 'user';
            const pending = isRunning && index === messages.length - 1;
            if (!message.content && !message.tools?.length && !pending)
              return null;

            return (
              <Message
                key={index}
                align={fromUser ? 'end' : 'start'}
                aria-label={fromUser ? 'You' : 'Agent'}
              >
                <MessageContent>
                  {Boolean(message.tools?.length) && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {message.tools?.map((tool, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="motion-reduce:transition-none"
                        >
                          {getToolLabel(tool.tool)} ·{' '}
                          {tool.status === 'running' ? 'Running' : 'Done'}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {(message.content || pending) && (
                    <Bubble
                      variant={
                        message.isError
                          ? 'destructive'
                          : fromUser
                            ? 'tinted'
                            : 'muted'
                      }
                    >
                      <BubbleContent className="wrap-anywhere whitespace-pre-wrap">
                        {message.content || (
                          <Spinner
                            aria-label="Waiting for a reply"
                            className="motion-reduce:animate-none"
                          />
                        )}
                      </BubbleContent>
                    </Bubble>
                  )}
                </MessageContent>
              </Message>
            );
          })}
        </MessageGroup>
      </div>

      <form
        className="space-y-2 border-t border-dashed p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(input);
        }}
      >
        {validationError && (
          <p role="alert" className="text-destructive text-xs">
            {validationError}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Input
            aria-label="Message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask your agent…"
          />
          <Button
            type="submit"
            variant="primary"
            size="icon"
            aria-label="Send message"
            disabled={isRunning || !input.trim()}
            className="motion-reduce:transition-none"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
}
