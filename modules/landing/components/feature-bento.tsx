'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Airplane01Icon,
  ApiIcon,
  Calculator01Icon,
  CloudIcon,
  GitPullRequestIcon,
  PencilEdit01Icon,
  Search01Icon,
  SearchIcon,
  SourceCodeIcon,
  SunCloud01Icon,
  TextCheckIcon,
} from '@hugeicons/core-free-icons';

import {
  Bar,
  Badge,
  Check,
  Code,
  Connector,
  Count,
  Stage,
  Text,
  Toggle,
  useReducedMotion,
  type Act,
  type Rect,
} from '@/components/stageshow/kit';
import { useStageTheme } from '../hooks/use-stage-theme';
import { ToolGlyph, type GlyphTone } from './tool-glyph';
import './feature-bento.css';

// The features grid (stageshow, references/bento.md). Five tiles, hero and
// strip:
//
//   Tile        Span   Kind        The one thing                      Moves
//   Workflow    2 × 1  Diagram     three agents passing work along    each runs, then hands off
//   Tools       1 × 1  Stat        "8", on the one inverted tile      counts up from 0
//   Switches    1 × 1  Component   three tools, each a switch         Calculator switches on
//   Your API    1 × 1  Object      a custom tool's request            the response arrives
//   Templates   1 × 1  Collection  six starting agents, off the edge  tiles rise in
//
// No window chrome anywhere in the grid: the hero above already has the one
// window on the page. Each picture is its own Stage at 1:1, pinned to its
// tile's bottom. Each tile plays one beat, once, as it scrolls in, 110ms
// after the tile before it.

const STEP = 110;
const LEAD = 450;

type Theme = 'light' | 'dark' | null;

function usePictureWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () =>
      setWidth(Math.round(Math.max(1, node.getBoundingClientRect().width)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function Tile({
  area,
  title,
  children,
  picture,
  inverted,
}: {
  area: string;
  title?: ReactNode;
  children?: ReactNode;
  picture?: ReactNode;
  inverted?: boolean;
}) {
  return (
    <section
      className={`lp-tile lp-tile--${area}`}
      data-inverted={inverted || undefined}
      data-reveal
    >
      {title ? (
        <p className="lp-tile__copy">
          <b>{title}</b> {children}
        </p>
      ) : (
        children
      )}
      {picture}
    </section>
  );
}

/* ---------------- Workflow (hero, diagram) ---------------- */

type Flow = { step: number };

const AGENTS: { name: string; icon: typeof SearchIcon; tone: GlyphTone; bar: number }[] = [
  { name: 'Researcher', icon: SearchIcon, tone: 'search', bar: 64 },
  { name: 'Writer', icon: PencilEdit01Icon, tone: 'write', bar: 48 },
  { name: 'Editor', icon: TextCheckIcon, tone: 'review', bar: 56 },
];

async function flowScript(a: Act<Flow>) {
  await a.wait(LEAD);
  for (let step = 1; step <= AGENTS.length + 1; step++) {
    await a.set({ step });
    await a.wait(step === 1 ? 900 : 1100);
  }
}

function Workflow({ theme }: { theme: Theme }) {
  const [picture, width] = usePictureWidth();
  const compact = width < 560;
  const height = compact ? 268 : 252;

  return (
    <Tile
      area="flow"
      title="Chain agents into one workflow."
      picture={
        <div ref={picture} className="lp-picture lp-picture--full">
          {width > 0 && theme && (
            <Stage<Flow>
              key={compact ? 'c' : 'w'}
              width={width}
              height={height}
              initial={{ step: 0 }}
              poster={{ step: AGENTS.length + 1 }}
              script={flowScript}
              play="once"
              theme={theme}
              greys="cool"
              className="lp-stage"
            >
              {(s, rect) => (
                <FlowDiagram s={s} rect={rect} width={width} compact={compact} />
              )}
            </Stage>
          )}
        </div>
      }
    >
      Each agent hands its answer to the next, so research, drafting and
      review run as one.
    </Tile>
  );
}

const NODE_W = 196;

function FlowDiagram({
  s,
  rect,
  width,
  compact,
}: {
  s: Flow;
  rect: (n: string) => Rect;
  width: number;
  compact: boolean;
}) {
  const pad = compact ? 24 : 28;
  const nodeW = compact ? 188 : NODE_W;
  const span = Math.max(0, width - pad * 2 - nodeW);
  const place = (i: number) =>
    compact
      ? { left: pad + Math.min(56, span / 2) * i, top: 18 + i * 84 }
      : { left: pad + (span / 2) * i, top: i % 2 ? 132 : 40 };

  return (
    <div className="lp-flow">
      {AGENTS.map((agent, i) => {
        const state = s.step > i + 1 ? 'done' : s.step === i + 1 ? 'running' : 'idle';
        return (
          <div
            key={agent.name}
            className="lp-flow__node"
            data-target={`agent-${i}`}
            data-state={state}
            style={{ ...place(i), width: nodeW }}
          >
            <ToolGlyph icon={agent.icon} tone={agent.tone} size={30} />
            <span className="lp-flow__text">
              <Text className="lp-flow__name">{agent.name}</Text>
              <Bar w={agent.bar} h={5} tone={2} />
            </span>
            <Check on={state === 'done'} pending={state === 'running'} size={16} className="lp-flow__check" />
          </div>
        );
      })}
      {AGENTS.slice(1).map((_, i) => {
        const from = rect(`agent-${i}`);
        const to = rect(`agent-${i + 1}`);
        if (!from.width || !to.width) return null;
        const show = s.step > i + 1;
        if (compact) {
          const x = to.x + 28;
          return (
            <Connector
              key={i}
              show={show}
              route="straight"
              arrow
              from={{ x, y: from.y + from.height }}
              to={{ x, y: to.y }}
              className="lp-flow__edge"
            />
          );
        }
        return (
          <Connector
            key={i}
            show={show}
            route="curve"
            arrow
            from={{ x: from.x + from.width, y: from.y + from.height / 2 }}
            to={{ x: to.x, y: to.y + to.height / 2 }}
            className="lp-flow__edge"
          />
        );
      })}
    </div>
  );
}

/* ---------------- Tools (stat, inverted) ---------------- */

function useInView<T extends Element>(delay: number) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        t = window.setTimeout(() => setSeen(true), delay);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [delay]);
  return [ref, seen] as const;
}

function ToolsStat() {
  const reduced = useReducedMotion();
  const [ref, seen] = useInView<HTMLDivElement>(LEAD + STEP);
  return (
    <Tile area="stat" inverted>
      <div ref={ref} className="lp-stat">
        <span className="lp-stat__lead">Ready on day one</span>
        <span className="lp-stat__number">
          <Count value={seen || reduced ? 8 : 0} duration={900} />
          <span className="lp-stat__unit">tools</span>
        </span>
        <span className="lp-stat__label">
          Web search, page reading, math, weather and GitHub, built in.
        </span>
      </div>
    </Tile>
  );
}

/* ---------------- Switches (component) ---------------- */

type Beat = { on: boolean };
const before: Beat = { on: false };
const after: Beat = { on: true };
const beat = (i: number) => async (a: Act<Beat>) => {
  await a.wait(LEAD + i * STEP + 500);
  await a.set({ on: true });
};

const SWITCHES = [
  { name: 'Web Search', icon: SearchIcon, tone: 'search', on: true },
  { name: 'Calculator', icon: Calculator01Icon, tone: 'math', on: false, flips: true },
  { name: 'Weather', icon: SunCloud01Icon, tone: 'weather', on: false },
] as const;

function Switches({ theme }: { theme: Theme }) {
  const [picture, width] = usePictureWidth();
  return (
    <Tile
      area="switch"
      title="Tools are switches."
      picture={
        <div ref={picture} className="lp-picture lp-picture--full">
          {width > 0 && theme && (
            <Stage<Beat>
              width={width}
              height={196}
              initial={before}
              poster={after}
              script={beat(2)}
              play="once"
              theme={theme}
              greys="cool"
              className="lp-stage"
            >
              {(s) => (
                <div className="lp-switches">
                  {SWITCHES.map((row) => {
                    const on = 'flips' in row ? s.on : row.on;
                    return (
                      <div key={row.name} className="lp-switch" data-on={on || undefined}>
                        <ToolGlyph icon={row.icon} tone={row.tone} size={28} />
                        <Text className="lp-switch__name">{row.name}</Text>
                        <Toggle on={on} />
                      </div>
                    );
                  })}
                  {/* Filler: the card runs on past the tile's foot */}
                  <div className="lp-switch">
                    <Bar w={28} h={28} r={8} tone={1} />
                    <Bar w={84} h={6} tone={2} className="lp-switch__name" />
                    <Bar w={36} h={20} r={10} tone={1} />
                  </div>
                </div>
              )}
            </Stage>
          )}
        </div>
      }
    >
      Flip one on and the agent can call it on the very next message.
    </Tile>
  );
}

/* ---------------- Your API (object) ---------------- */

const RESPONSE = ['{', '  "id": "4821",', '  "status": "shipped",', '  "eta": "Thu"', '}'];

function YourApi({ theme }: { theme: Theme }) {
  const [picture, width] = usePictureWidth();
  return (
    <Tile
      area="api"
      title="Bring any API."
      picture={
        <div ref={picture} className="lp-picture lp-picture--full">
          {width > 0 && theme && (
            <Stage<Beat>
              width={width}
              height={196}
              initial={before}
              poster={after}
              script={beat(3)}
              play="once"
              theme={theme}
              greys="cool"
              className="lp-stage"
            >
              {(s) => (
                <div className="lp-request" data-on={s.on || undefined}>
                  <div className="lp-request__head">
                    <ToolGlyph icon={ApiIcon} tone="api" size={26} />
                    <Text className="lp-request__name">Order lookup</Text>
                    <Badge tone="success" className="lp-request__status">
                      200 OK
                    </Badge>
                  </div>
                  <div className="lp-request__url">
                    <span className="lp-request__method">GET</span>
                    <span className="lp-request__path">
                      /orders/<span className="lp-request__var">{'{{id}}'}</span>
                    </span>
                  </div>
                  <Code
                    lines={RESPONSE}
                    numbers={false}
                    count={s.on ? RESPONSE.length : 0}
                    className="lp-request__code"
                  />
                </div>
              )}
            </Stage>
          )}
        </div>
      }
    >
      Describe an endpoint and its parameters, and it becomes a tool.
    </Tile>
  );
}

/* ---------------- Templates (collection) ---------------- */

const TEMPLATES: { name: string; icon: typeof SearchIcon; tone: GlyphTone }[] = [
  { name: 'Web research', icon: Search01Icon, tone: 'review' },
  { name: 'Weather', icon: CloudIcon, tone: 'weather' },
  { name: 'Travel', icon: Airplane01Icon, tone: 'code' },
  { name: 'Writing', icon: PencilEdit01Icon, tone: 'math' },
  { name: 'Coding', icon: SourceCodeIcon, tone: 'web' },
  { name: 'PR review', icon: GitPullRequestIcon, tone: 'write' },
];

function Templates({ theme }: { theme: Theme }) {
  const [picture, width] = usePictureWidth();
  return (
    <Tile
      area="templates"
      title="Start from a template."
      picture={
        <div ref={picture} className="lp-picture lp-picture--full">
          {width > 0 && theme && (
            <Stage<Beat>
              width={width}
              height={196}
              initial={before}
              poster={after}
              script={beat(4)}
              play="once"
              theme={theme}
              greys="cool"
              className="lp-stage"
            >
              {(s) => (
                <div className="lp-templates" data-on={s.on || undefined}>
                  {TEMPLATES.map((t, i) => (
                    <div
                      key={t.name}
                      className="lp-template"
                      style={{ transitionDelay: `${i * 60}ms` }}
                    >
                      <ToolGlyph icon={t.icon} tone={t.tone} size={34} />
                      <Text className="lp-template__name">{t.name}</Text>
                    </div>
                  ))}
                </div>
              )}
            </Stage>
          )}
        </div>
      }
    >
      Six ready-made agents to fork, from weather to pull-request review.
    </Tile>
  );
}

export function FeatureBento() {
  const theme = useStageTheme();
  return (
    <div className="lp-bento">
      <div className="lp-bento__grid">
        <Workflow theme={theme} />
        <ToolsStat />
        <Switches theme={theme} />
        <YourApi theme={theme} />
        <Templates theme={theme} />
      </div>
    </div>
  );
}
