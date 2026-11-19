import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

import { auth } from '@/lib/auth';
import { AUTH_ROUTES, CALLBACK_PARAM } from '@/modules/auth/lib/constants';
import {
  getSafeCallbackURL,
  isGuestRoute,
  isPublicRoute,
} from '@/modules/auth/lib/utils';

/**
 * Sends each visitor to where they're allowed to be, before the page renders:
 *
 * - Guest on a protected page  → /sign-in?callbackURL=<where they were going>
 * - Signed in on a guest page  → callbackURL (if safe) or the app home
 *
 * This is the fast first pass, not the security boundary. Pages still call
 * requireAuth() / requireUnauth(), which validate the session for real.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicRoute(pathname)) return NextResponse.next();

  // Optimistic: only checks that a session cookie exists (no DB call).
  const hasSessionCookie = getSessionCookie(request) !== null;

  if (isGuestRoute(pathname)) {
    if (!hasSessionCookie) return NextResponse.next();

    // A cookie can outlive its session (expired, revoked). Verify before
    // bouncing, or a stale cookie would loop: / → /sign-in → / → ...
    // Runs only for guest pages with a cookie present, so it's rare.
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return NextResponse.next();

    const destination = getSafeCallbackURL(
      request.nextUrl.searchParams.get(CALLBACK_PARAM),
    );
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (!hasSessionCookie) {
    const signIn = new URL(AUTH_ROUTES.signIn, request.url);
    if (pathname !== AUTH_ROUTES.afterSignIn || search) {
      signIn.searchParams.set(CALLBACK_PARAM, pathname + search);
    }
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Every path except:
     * - api (route handlers, including better-auth's /api/auth/*)
     * - _next/static, _next/image (build output, image optimizer)
     * - files with an extension (favicon.ico, robots.txt, public/ assets)
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};
