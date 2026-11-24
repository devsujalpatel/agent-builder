'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

const noop = () => () => {};

/**
 * The stage theme for the current color mode. Null on the server and the
 * first client render: the theme is only known in the browser, so the
 * illustrations wait a frame rather than flash the wrong one.
 */
export function useStageTheme() {
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const { resolvedTheme } = useTheme();
  if (!mounted) return null;
  return resolvedTheme === 'dark' ? 'dark' : 'light';
}
