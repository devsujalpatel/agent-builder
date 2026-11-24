'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Reveals each `[data-reveal]` inside it once, the first time it scrolls into
 * view. Items that arrive together stagger in reading order; an item that
 * arrives alone doesn't wait for ones above it. Marketing surfaces only.
 */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

    const io = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.setProperty('--reveal-delay', `${order * 90}ms`);
          el.setAttribute('data-visible', '');
          io.unobserve(el);
          order += 1;
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    for (const el of items) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} data-reveal-root>
      {children}
    </div>
  );
}
