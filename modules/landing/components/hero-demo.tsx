'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  ArrowUp02Icon,
  BotIcon,
  Calculator01Icon,
  Flag01Icon,
  GlobeIcon,
  PlayIcon,
  RepeatIcon,
  SearchIcon,
  SourceCodeIcon,
  SunCloud01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';

import {
  Badge,
  Bar,
  Button,
  Check,
  Chip,
  Collapse,
  Connector,
  Field,
  Popover,
  Spinner,
  Stage,
  States,
  Stream,
  Text,
  Window,
  type Act,
  type Rect,
} from '@/components/stageshow/kit';
import { useStageTheme } from '../hooks/use-stage-theme';
import { ToolGlyph } from './tool-glyph';
import './hero-demo.css';

// The landing hero (stageshow, "how it feels to use"): the builder's canvas
// with a three-node workflow, and its Test chat straddling the window's
// right edge over empty canvas. Five beats, played once:
//
//   1. The cursor opens Add tool on the agent node; the tool picker drops.
//   2. It picks Web Search; the chip opens its width on the node.
//   3. It types a question into Test chat and sends it.
//   4. The node turns Running while the Web Search call resolves in the chat.
//   5. The answer streams in; the node settles on Done. Payoff holds.
//
// Real strings: the node names, the model, the tools, the question, the
// answer. The earlier turn in the chat is placeholder.

const Q = "Summarize this week's AI agent news";
const A =
  'Three threads stood out. Agent frameworks shipped built-in tracing, more teams now put risky tool calls behind an approval step, and small, fast models are taking over routing work.';
const WORDS = A.split(' ').length;

type Run = 'idle' | 'running' | 'done';

type S = {
  picker: boolean;
  added: boolean;
  focused: boolean;
  draft: string;
  sent: boolean;
  tool: Run;
  run: Run;
  words: number;
};

const initial: S = {
  picker: false,
  added: false,
  focused: false,
  draft: '',
  sent: false,
  tool: 'idle',
  run: 'idle',
  words: 0,
};

const POSTER: S = {
  ...initial,
  added: true,
  sent: true,
  tool: 'done',
  run: 'done',
  words: WORDS,
};

const PICKER_WIDTH = 224;

const REST = { wide: { x: 560, y: 128 }, compact: { x: 312, y: 132 } };

const PICKS = [
  { id: 'pick-search', label: 'Web Search', icon: SearchIcon, tone: 'search' },
  { id: 'pick-math', label: 'Calculator', icon: Calculator01Icon, tone: 'math' },
  { id: 'pick-weather', label: 'Weather', icon: SunCloud01Icon, tone: 'weather' },
  { id: 'pick-code', label: 'GitHub Search Code', icon: SourceCodeIcon, tone: 'code' },
] as const;

async function script(a: Act<S>) {
  await a.wait(900);

  // 1. Open the tool picker on the agent node
  await a.move({ at: 'add-tool', x: 0.5, y: 0.5 });
  await a.wait(180);
  await a.click();
  await a.set({ picker: true });
  await a.wait(650);

  // 2. Pick Web Search; the picker closes and the chip opens on the node
  await a.move({ at: 'pick-search', x: 0.78, y: 0.5 });
  await a.wait(260);
  await a.click();
  await a.set({ picker: false });
  await a.wait(140);
  await a.set({ added: true });
  await a.wait(800);

  // 3. Ask the agent something in Test chat
  await a.move({ at: 'composer', x: 0.3, y: 0.5 });
  await a.click();
  await a.set({ focused: true });
  await a.wait(200);
  await a.type('draft', Q, { interval: 34 });
  await a.wait(260);
  await a.move({ at: 'send', x: 0.5, y: 0.5 });
  await a.click();
  await a.set({ sent: true, draft: '', focused: false, run: 'running' });

  // 4. The call runs: Web Search resolves in the chat, the node reports it
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide);
  await a.wait(420);
  await a.set({ tool: 'running' });
  await a.wait(1400);
  await a.set({ tool: 'done' });
  await a.wait(380);

  // 5. The answer streams in, and the node settles
  for (let i = 1; i <= WORDS; i++) {
    a.put({ words: i });
    await a.wait(42);
  }
  await a.wait(240);
  await a.set({ run: 'done' });
  await a.wait(3000);
}

function NodeCard({
  kind,
  label,
  icon,
  tone,
  target,
  className,
  children,
  aside,
}: {
  kind: string;
  label: string;
  icon: typeof BotIcon;
  tone: 'agent' | 'start' | 'end';
  target: string;
  className?: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className={`lp-node ${className ?? ''}`} data-target={target}>
      <div className="lp-node__head">
        <ToolGlyph icon={icon} tone={tone} size={30} />
        <div className="lp-node__text">
          <Text className="lp-node__kind">{kind}</Text>
          <Text className="lp-node__label">{label}</Text>
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Scene({ s, rect, layout }: { s: S; rect: (n: string) => Rect; layout: 'wide' | 'compact' }) {
  const wide = layout === 'wide';
  const start = rect('n-start');
  const agent = rect('n-agent');
  const end = rect('n-end');
  const add = rect('add-tool');
  const bottom = (r: Rect) => ({ x: r.x + r.width / 2, y: r.y + r.height });
  const top = (r: Rect, x: number) => ({ x, y: r.y });
  const linked = wide && start.width > 0 && agent.width > 0 && end.width > 0;

  return (
    <>
      <Window
        title="News digest"
        className="lp-hero-window"
        toolbar={
          wide ? (
            <span className="lp-hero-tools">
              <Bar w={64} h={24} r={7} tone={1} />
              <Button size="small" variant="secondary">
                Save
              </Button>
            </span>
          ) : undefined
        }
        body={{ className: 'lp-canvas' }}
      >
        {wide && (
          <NodeCard
            kind="Start"
            label="User message"
            icon={PlayIcon}
            tone="start"
            target="n-start"
            className="lp-node--start"
          />
        )}

        <NodeCard
          kind="Agent"
          label="Researcher"
          icon={BotIcon}
          tone="agent"
          target="n-agent"
          className="lp-node--agent"
          aside={
            <States
              value={s.run}
              align="end"
              className="lp-node__status"
              states={{
                idle: <span />,
                running: (
                  <Badge tone="accent" icon={<Spinner size={12} />}>
                    Running
                  </Badge>
                ),
                done: (
                  <Badge
                    tone="success"
                    icon={<HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={2.4} />}
                  >
                    Done
                  </Badge>
                ),
              }}
            />
          }
        >
          <div className="lp-node__body">
            <Text className="lp-node__model">mercury-2</Text>
            <div className="lp-node__tools">
              <span className="lp-tool-chip">
                <HugeiconsIcon icon={GlobeIcon} size={12} strokeWidth={2} />
                Read Webpage
              </span>
              <Chip show={s.added} gap={6} className="lp-tool-chip-slot">
                <span className="lp-tool-chip" data-new>
                  <HugeiconsIcon icon={SearchIcon} size={12} strokeWidth={2} />
                  Web Search
                </span>
              </Chip>
              <span
                className="lp-add-tool"
                data-target="add-tool"
                data-cursor="pointer"
                data-open={s.picker || undefined}
                aria-label="Add tool"
              >
                <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
              </span>
            </div>
          </div>
        </NodeCard>

        {wide && (
          <NodeCard
            kind="End"
            label="Reply"
            icon={Flag01Icon}
            tone="end"
            target="n-end"
            className="lp-node--end"
          />
        )}
      </Window>

      {linked && (
        <>
          <Connector
            show
            route="straight"
            arrow
            from={bottom(start)}
            to={top(agent, start.x + start.width / 2)}
            className="lp-edge"
          />
          <Connector
            show
            route="straight"
            arrow
            from={bottom(agent)}
            to={top(end, agent.x + agent.width / 2)}
            className="lp-edge"
          />
        </>
      )}

      <div className="lp-chat" data-target="chat">
        <div className="lp-chat__head">
          <Text className="lp-chat__title">Test chat</Text>
          <Bar w={46} h={6} tone={2} />
        </div>
        <div className="lp-chat__thread">
          {wide && (
            <div className="lp-chat__past">
              <Bar w={168} h={30} r={12} tone={1} className="lp-chat__past-q" />
              <Bar w="88%" h={6} tone={2} />
              <Bar w="64%" h={6} tone={2} />
            </div>
          )}
          <Collapse open={s.sent} reveal="drop" from="below">
            <div className="lp-q">
              <Text wrap>{Q}</Text>
            </div>
          </Collapse>
          <Collapse open={s.tool !== 'idle'}>
            <div className="lp-call">
              <ToolGlyph icon={SearchIcon} tone="search" size={22} />
              <Text className="lp-call__name">Web Search</Text>
              <States
                value={s.tool === 'done' ? 'done' : 'running'}
                align="start"
                className="lp-call__meta"
                states={{ running: 'Searching', done: '6 results' }}
              />
              <Check on={s.tool === 'done'} pending={s.tool === 'running'} size={15} className="lp-call__check" />
            </div>
          </Collapse>
          <Collapse open={s.words > 0}>
            <div className="lp-answer">
              <Stream text={A} count={s.words} />
            </div>
          </Collapse>
        </div>
        <div className="lp-chat__composer">
          <Field
            value={s.draft}
            placeholder="Message Researcher"
            focused={s.focused}
            className="lp-composer"
            box={{ 'data-target': 'composer', 'data-cursor': 'ibeam' }}
            trailing={
              <span className="lp-send" data-target="send" data-cursor="pointer" data-ready={s.draft ? '' : undefined}>
                <HugeiconsIcon icon={ArrowUp02Icon} size={14} strokeWidth={2.2} />
              </span>
            }
          />
        </div>
      </div>

      {add.width > 0 && (
        // Hung from the + button's right edge, so it opens over the canvas
        // and never under the chat panel
        <Popover
          show={s.picker}
          origin="top right"
          className="lp-picker"
          style={{
            left: add.x + add.width + 6 - PICKER_WIDTH,
            top: add.y + add.height + 8,
            width: PICKER_WIDTH,
          }}
        >
          <Text className="lp-picker__title">Add a tool</Text>
          {PICKS.map((p) => (
            <div key={p.id} className="lp-picker__row" data-target={p.id} data-cursor="pointer">
              <ToolGlyph icon={p.icon} tone={p.tone} size={22} />
              <Text>{p.label}</Text>
            </div>
          ))}
        </Popover>
      )}
    </>
  );
}

export function HeroDemo() {
  const theme = useStageTheme();
  const [run, setRun] = useState(0);

  return (
    <div className="lp-hero-demo">
      <div className="lp-hero-slot" aria-hidden>
        {theme && (
          <Stage<S>
            key={run}
            width={1080}
            height={580}
            compact={{ below: 720, width: 380, height: 540 }}
            initial={initial}
            poster={POSTER}
            script={script}
            play="once"
            cursor={{ at: REST, ripple: true }}
            theme={theme}
            greys="cool"
            fidelity="realistic"
            className="lp-hero-stage"
          >
            {(s, rect, layout) => <Scene s={s} rect={rect} layout={layout} />}
          </Stage>
        )}
      </div>
      <button
        type="button"
        className="lp-replay"
        onClick={() => setRun((n) => n + 1)}
      >
        <HugeiconsIcon icon={RepeatIcon} size={14} strokeWidth={2} aria-hidden />
        Replay demo
      </button>
    </div>
  );
}
