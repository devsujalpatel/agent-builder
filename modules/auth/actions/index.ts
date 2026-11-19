'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { AUTH_ROUTES, type AuthProvider } from '../lib/constants';
import { getCurrentSession } from '../lib/session';
import { getSafeCallbackURL, isAuthProvider } from '../lib/utils';

/**
 * Returns the current session (or null). Safe to call from Server Components,
 * Route Handlers and other Server Actions.
 */
export async function getSession() {
  return getCurrentSession();
}

/**
 * Starts the OAuth flow for the given provider and redirects the user to it.
 * Can be used directly as a form action:
 *   <form action={signIn.bind(null, 'github')}>...</form>
 */
export async function signIn(
  provider: AuthProvider = 'github',
  callbackURL: string = AUTH_ROUTES.afterSignIn,
) {
  if (!isAuthProvider(provider)) {
    throw new Error(`Unsupported auth provider: ${String(provider)}`);
  }

  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: getSafeCallbackURL(callbackURL),
    },
    headers: await headers(),
  });

  if (!url) {
    throw new Error(`Failed to start ${provider} sign-in`);
  }

  // redirect() throws, so it must stay outside any try/catch.
  redirect(url);
}

/**
 * Revokes the current session, clears the session cookie (via the
 * `nextCookies` plugin) and sends the user back to the sign-in page.
 */
export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect(AUTH_ROUTES.afterSignOut);
}

/**
 * Guard for protected pages/actions. Redirects to sign-in when there is no
 * session, otherwise returns the (non-null) session.
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect(AUTH_ROUTES.signIn);
  }

  return session;
}

/**
 * Guard for guest-only pages (e.g. /sign-in). Redirects signed-in users to
 * `redirectTo` (when it's a safe same-origin path) or the app's home.
 */
export async function requireUnauth(redirectTo?: string) {
  const session = await getSession();

  if (session) {
    redirect(getSafeCallbackURL(redirectTo));
  }
}
