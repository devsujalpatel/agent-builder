import { cache } from 'react';
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';

/**
 * The current session, read at most once per request. The navbar and the page
 * both need it; React's cache() dedupes the lookup so it costs one DB hit.
 * Server-only: import it from Server Components and server actions.
 */
export const getCurrentSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export type Session = NonNullable<
  Awaited<ReturnType<typeof getCurrentSession>>
>;
