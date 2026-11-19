'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiBrain01Icon,
  MailSend01Icon,
  Ticket01Icon,
} from '@hugeicons/core-free-icons';

import {
  Bar,
  Check,
  Connector,
  Stage,
  Text,
  Window,
} from '@/components/stageshow/kit';
import './auth-preview.css';

// A still of the product beside the sign-in form (stageshow, corner bleed):
// an agent's workflow canvas, pinned top-left and running off the right and
// bottom, with a run card straddling the window's left edge over empty
// canvas. Real words only on the three nodes, the model and the run result.

const noop = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

const TRACE = [
  { icon: Ticket01Icon, w: 58, ms: 22 },
  { icon: AiBrain01Icon, w: 72, ms: 26 },
  { icon: MailSend01Icon, w: 50, ms: 20 },
];

function NodeIcon({
  icon,
  tone,
}: {
  icon: typeof Ticket01Icon;
  tone?: 'accent';
}) {
  return (
    <span className="ap-node__icon" data-tone={tone}>
      {/* The tile's surface is its own leaf, so its edge reads as content */}
      <span className="ap-node__tile" />
      <HugeiconsIcon icon={icon} size={14} strokeWidth={1.8} />
    </span>
  );
}

export function AuthPreview() {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  // The theme is only known on the client; render nothing on the server so
  // the illustration never flashes the wrong theme.
  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className="ap-host transition-opacity duration-500 ease-out starting:opacity-0"
    >
      <Stage
        width={600}
        height={480}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        greys="cool"
        className="ap"
      >
        {(_, rect) => {
          const a = rect('node-a');
          const b = rect('node-b');
          const c = rect('node-c');
          const ready = a.width > 0 && b.width > 0 && c.width > 0;
          const mid = (r: typeof a) => r.x + r.width / 2;

          return (
            <>
              <Window
                title="Support agent"
                className="ap-window"
                body={{ className: 'ap-canvas' }}
              >
                <div className="ap-node" data-target="node-a">
                  <NodeIcon icon={Ticket01Icon} />
                  <div className="ap-node__text">
                    <Text className="ap-node__title">New ticket</Text>
                    <Bar w={74} h={5} tone={2} />
                  </div>
                </div>

                <div className="ap-node ap-node--focus" data-target="node-b">
                  <div className="ap-node__head">
                    <NodeIcon icon={AiBrain01Icon} tone="accent" />
                    <div className="ap-node__text">
                      <Text className="ap-node__title">Triage agent</Text>
                      <Text className="ap-node__meta">Claude Sonnet 5.5</Text>
                    </div>
                  </div>
                  <div className="ap-node__body">
                    <Bar w={196} h={5} tone={2} />
                    <Bar w={168} h={5} tone={2} />
                    <Bar w={120} h={5} tone={2} />
                  </div>
                </div>

                <div className="ap-node" data-target="node-c">
                  <NodeIcon icon={MailSend01Icon} />
                  <div className="ap-node__text">
                    <Text className="ap-node__title">Send reply</Text>
                    <Bar w={64} h={5} tone={2} />
                  </div>
                </div>
              </Window>

              <div className="ap-run">
                <div className="ap-run__head">
                  <Check on size={16} />
                  <Text className="ap-run__title">Run completed</Text>
                  <Text className="ap-run__time">1.8s</Text>
                </div>
                {TRACE.map((row, i) => (
                  <div key={i} className="ap-run__row">
                    <HugeiconsIcon
                      icon={row.icon}
                      size={14}
                      strokeWidth={1.8}
                      className="ap-run__icon"
                    />
                    <Bar w={row.w} h={5} tone={3} />
                    <Bar w={row.ms} h={5} tone={2} className="ap-run__ms" />
                  </div>
                ))}
              </div>

              {ready && (
                <>
                  <Connector
                    show
                    route="straight"
                    arrow
                    from={{ x: mid(a), y: a.y + a.height }}
                    to={{ x: mid(a), y: b.y }}
                  />
                  <Connector
                    show
                    route="straight"
                    arrow
                    from={{ x: mid(c), y: b.y + b.height }}
                    to={{ x: mid(c), y: c.y }}
                  />
                </>
              )}
            </>
          );
        }}
      </Stage>
    </div>
  );
}
