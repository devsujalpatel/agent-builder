import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';

import './tool-glyph.css';

export type GlyphTone =
  | 'search'
  | 'web'
  | 'math'
  | 'weather'
  | 'code'
  | 'agent'
  | 'start'
  | 'end'
  | 'api'
  | 'write'
  | 'review';

/**
 * The product's tinted icon tile, as the builder draws a node or tool:
 * a soft fill in the tool's color with its Hugeicons glyph on top.
 */
export function ToolGlyph({
  icon,
  tone,
  size = 24,
  className,
}: {
  icon: IconSvgElement;
  tone: GlyphTone;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`lp-glyph${className ? ` ${className}` : ''}`}
      data-tone={tone}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <HugeiconsIcon
        icon={icon}
        size={Math.round(size * 0.58)}
        strokeWidth={2}
      />
    </span>
  );
}
