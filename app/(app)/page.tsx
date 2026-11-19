import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { requireAuth } from '@/modules/auth/actions';

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-1 px-4 py-10 sm:px-6">
      {/* With cacheComponents, reading the session must happen behind Suspense. */}
      <Suspense fallback={<Skeleton className="h-7 w-56" />}>
        <Greeting />
      </Suspense>
      <p className="text-muted-foreground text-sm">
        Your agents will show up here.
      </p>
    </div>
  );
}

async function Greeting() {
  // Guests are redirected to /sign-in before anything below renders.
  const { user } = await requireAuth();
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  return (
    <h1 className="text-xl font-semibold tracking-tight">
      Welcome back, {firstName}
    </h1>
  );
}
