"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import Link from "next/link";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { arc } from "motion";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
const DOT_SIZE = 6;

export type BounceSidebarItem =
  | string
  | { label: string; href?: string }
  | { label: string; heading: true };

export type BounceSidebarProps = Omit<ComponentProps<"ul">, "onChange"> & {
  items: BounceSidebarItem[];
  value?: number;
  currentHref?: string;
  defaultValue?: number;
  onChange?: (index: number) => void;
  dotColor?: string;
};

export function BounceSidebar({
  items,
  value,
  currentHref,
  defaultValue = 0,
  onChange,
  dotColor = "#FC4C01",
  className,
  ...props
}: BounceSidebarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeIndex = value ?? internalValue;
  const reducedMotion = useReducedMotion();

  const [dot, animate] = useAnimate<HTMLSpanElement>();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const prevY = useRef<number | null>(null);

  const [ready, setReady] = useState(false);

  useIsomorphicLayoutEffect(() => {
    let cancelled = false;
    const snap = () => {
      const el = itemRefs.current[activeIndex];
      if (cancelled || !el || !dot.current) return;
      const dpr = window.devicePixelRatio || 1;
      const toY =
        Math.round((el.offsetTop + el.offsetHeight / 2 - DOT_SIZE / 2) * dpr) / dpr;
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      setReady(true);
    };

    snap();
    const raf = requestAnimationFrame(snap);
    document.fonts?.ready.then(snap);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (!el || !dot.current) return;

    const dpr = window.devicePixelRatio || 1;
    const toY =
      Math.round((el.offsetTop + el.offsetHeight / 2 - DOT_SIZE / 2) * dpr) /
      dpr;

    if (prevY.current === null) {
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      prevY.current = toY;
      return;
    }

    const fromY = prevY.current;
    const delta = toY - fromY;
    prevY.current = toY;
    if (delta === 0) return;
    if (reducedMotion) {
      animate(dot.current, { x: 0, y: toY }, { duration: 0 });
      return;
    }

    const distance = Math.abs(delta);
    const path = arc({
      strength: Math.min(0.8, 14 / distance),
      direction: delta > 0 ? "ccw" : "cw",
    });

    animate(
      dot.current,
      { x: 0, y: toY },
      { duration: 0.25, ease: "easeOut", path },
    );
  }, [activeIndex, animate, dot, reducedMotion]);

  const select = (index: number) => {
    if (value === undefined) setInternalValue(index);
    onChange?.(index);
  };

  return (
    <ul
      data-slot="bounce-sidebar"
      className={cn("relative flex flex-col gap-1 pl-6", className)}
      {...props}
    >
      <span
        ref={dot}
        aria-hidden
        className="absolute left-2 top-0 rounded-full transition-opacity duration-150 motion-reduce:transition-none"
        style={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          backgroundColor: dotColor,
          opacity: ready ? 1 : 0,
        }}
      />

      {items.map((item, index) => {
        const label = typeof item === "string" ? item : item.label;

        if (typeof item !== "string" && "heading" in item) {
          return (
            <li
              key={`${index}-${label}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              role="presentation"
              data-slot="bounce-sidebar-heading"
              style={{ color: dotColor }}
              className="px-1 pb-1 pt-7 text-[11px] font-semibold uppercase tracking-[0.14em] first:pt-0"
            >
              {label}
            </li>
          );
        }

        const href = typeof item === "string" ? undefined : item.href;
        const isActive = index === activeIndex;
        const itemClassName = cn(
          "flex w-full cursor-pointer items-center rounded-lg p-1 text-left text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        );

        return (
          <li
            key={`${index}-${label}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            {href ? (
              <MotionLink
                href={href}
                aria-current={currentHref === href ? "page" : undefined}
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                onClick={() => select(index)}
                className={itemClassName}
              >
                {label}
              </MotionLink>
            ) : (
              <motion.button
                type="button"
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                onClick={() => select(index)}
                className={itemClassName}
              >
                {label}
              </motion.button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
