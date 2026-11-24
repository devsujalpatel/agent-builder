export const AUTH_ROUTES = {
  signIn: '/sign-in',
  afterSignIn: '/agents',
  afterSignOut: '/sign-in',
} as const;

/** Only for signed-out users; signed-in users are sent on to the app. */
export const GUEST_ROUTES: readonly string[] = [AUTH_ROUTES.signIn];

/** Open to everyone. Every route not listed here or above requires auth. */
export const PUBLIC_ROUTES: readonly string[] = ['/'];

/** Search param carrying where to go after signing in. */
export const CALLBACK_PARAM = 'callbackURL';

export const AUTH_PROVIDERS = ['github'] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
