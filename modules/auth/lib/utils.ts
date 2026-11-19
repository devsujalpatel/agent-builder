import {
  AUTH_PROVIDERS,
  AUTH_ROUTES,
  GUEST_ROUTES,
  PUBLIC_ROUTES,
  type AuthProvider,
} from './constants';

export function isAuthProvider(value: unknown): value is AuthProvider {
  return (
    typeof value === 'string' &&
    (AUTH_PROVIDERS as readonly string[]).includes(value)
  );
}

/** True for `route` itself and anything nested under it. */
function matches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export const isGuestRoute = (pathname: string) =>
  GUEST_ROUTES.some((route) => matches(pathname, route));

export const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => matches(pathname, route));

const SAME_ORIGIN = 'http://same-origin.invalid';

/**
 * Only allow same-origin paths as redirect targets so a crafted `callbackURL`
 * can't send users to another site (open redirect), and never back to a
 * guest-only page (which would bounce a signed-in user). The value is parsed
 * the way a browser would, so tricks like `/\\evil.com` or `/\t/evil.com`
 * (both resolve to `//evil.com`) are caught by the origin check.
 */
export function getSafeCallbackURL(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return AUTH_ROUTES.afterSignIn;
  }

  let url: URL;
  try {
    url = new URL(value, SAME_ORIGIN);
  } catch {
    return AUTH_ROUTES.afterSignIn;
  }

  if (url.origin !== SAME_ORIGIN || isGuestRoute(url.pathname)) {
    return AUTH_ROUTES.afterSignIn;
  }

  return url.pathname + url.search + url.hash;
}

/** "Ada Lovelace" → "AL", "ada" → "A". For avatar fallbacks. */
export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}
