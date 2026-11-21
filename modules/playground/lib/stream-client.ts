import { z } from 'zod';

import type { BuilderDefinition } from '@/modules/workflows/lib/schema';

const streamEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text_delta'), text: z.string() }),
  z.object({
    type: z.literal('tool_started'),
    tool: z.string(),
    input: z.unknown(),
  }),
  z.object({
    type: z.literal('tool_completed'),
    tool: z.string(),
    output: z.string(),
  }),
  z.object({ type: z.literal('run_completed'), conversationId: z.string() }),
  z.object({
    type: z.literal('run_failed'),
    error: z.string(),
    conversationId: z.string().optional(),
  }),
]);

export type StreamEvent = z.infer<typeof streamEventSchema>;

type RunInput = {
  message: string;
  conversationId?: string;
  definition: BuilderDefinition;
};

export async function streamAgentRun(
  agentId: string,
  body: RunInput,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
) {
  function fail(error: string) {
    if (!signal?.aborted) onEvent({ type: 'run_failed', error });
  }

  try {
    const response = await fetch(
      `/api/agents/${encodeURIComponent(agentId)}/runs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(body),
        signal,
      },
    );

    if (!response.ok || !response.body) {
      fail(
        response.status === 404
          ? 'Test chat isn’t available yet.'
          : 'Couldn’t start the test. Try again.',
      );
      return;
    }

    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();
    let buffer = '';
    let eventLines: string[] = [];
    let receivedOutcome = false;

    function flushEvent() {
      if (!eventLines.length) return;
      const data: unknown = JSON.parse(eventLines.join('\n'));
      eventLines = [];
      const result = streamEventSchema.safeParse(data);
      if (!result.success) return;
      const event = result.data;
      receivedOutcome ||=
        event.type === 'run_completed' || event.type === 'run_failed';
      onEvent(event);
    }

    function consumeLine(line: string) {
      if (!line) flushEvent();
      else if (line.startsWith('data:'))
        eventLines.push(line.slice(5).replace(/^ /, ''));
    }

    try {
      while (!receivedOutcome) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += chunk.value;
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) consumeLine(line.replace(/\r$/, ''));
      }
      if (!receivedOutcome) {
        consumeLine(buffer.replace(/\r$/, ''));
        flushEvent();
      }
      if (!receivedOutcome) fail('The reply ended early. Try again.');
    } finally {
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
    }
  } catch {
    fail('Couldn’t read the reply. Try again.');
  }
}
