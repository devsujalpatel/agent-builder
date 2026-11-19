'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, 'type'> & {
  /** What the button shows while its form's action is running. */
  pending: ReactNode;
};

/**
 * A submit button that crossfades to its pending content while the parent
 * <form>'s server action runs. Both states share one grid cell, so the button
 * keeps its width, and a short blur bridges the swap so it reads as one change.
 */
export function SubmitButton({
  children,
  pending: pendingContent,
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={cn(
        // Press feedback (Emil): a quick scale on :active, transform only.
        'transition-[scale,translate,background-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:opacity-100',
        className,
      )}
      {...props}
    >
      <span className="grid place-items-center *:col-start-1 *:row-start-1 *:inline-flex *:items-center *:gap-2 *:transition-[opacity,filter] *:duration-200 *:ease-out">
        <span
          className={cn(pending && 'opacity-0 blur-[2px]')}
          aria-hidden={pending}
        >
          {children}
        </span>
        <span
          className={cn(!pending && 'opacity-0 blur-[2px]')}
          aria-hidden={!pending}
        >
          {pendingContent}
        </span>
      </span>
    </Button>
  );
}
