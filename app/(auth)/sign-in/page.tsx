import type { Metadata } from 'next';
import { Suspense } from 'react';

import { requireUnauth } from '@/modules/auth/actions';
import { SignInForm } from '@/modules/auth/components/sign-in-form';
import { CALLBACK_PARAM } from '@/modules/auth/lib/constants';
import { getSafeCallbackURL } from '@/modules/auth/lib/utils';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function SignInPage({ searchParams }: PageProps<'/sign-in'>) {
  // With cacheComponents, reading the session and searchParams must happen
  // behind Suspense.
  return (
    <Suspense>
      <GuestOnly searchParams={searchParams} />
    </Suspense>
  );
}

async function GuestOnly({
  searchParams,
}: Pick<PageProps<'/sign-in'>, 'searchParams'>) {
  // Set by proxy.ts when it bounces a guest off a protected page.
  const callbackURL = getSafeCallbackURL((await searchParams)[CALLBACK_PARAM]);

  // Signed-in users are redirected away before the form ever renders.
  await requireUnauth(callbackURL);
  return <SignInForm callbackURL={callbackURL} />;
}
