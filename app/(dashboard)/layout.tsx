import { Suspense, type ReactNode } from 'react';

import { Logo } from '@/components/logo';
import { ModeToggle } from '@/components/ui/mode-toggle';
import {
  DashboardBreadcrumb,
  DashboardNav,
} from '@/modules/agents/components/dashboard-nav';
import { requireAuth } from '@/modules/auth/actions';
import { UserButton } from '@/modules/auth/components/user-button';

type DashboardLayoutProps = { children: ReactNode };

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={null}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}

async function AuthenticatedDashboard({ children }: DashboardLayoutProps) {
  const { user } = await requireAuth();

  return (
    <div className="bg-sidebar grid flex-1 grid-cols-[minmax(0,1fr)_auto] grid-rows-[3.75rem_auto_1fr] md:grid-cols-[14rem_minmax(0,1fr)] md:grid-rows-[3.75rem_1fr]">
      <div className="flex items-center border-b px-4 md:border-r md:px-6">
        <Logo
          href="/agents"
          size={28}
          eager
          className="focus-visible:outline-ring rounded-lg focus-visible:outline-2"
          labelClassName="text-base font-semibold"
        />
      </div>
      <header className="bg-sidebar flex min-w-0 items-center justify-end gap-3 border-b pr-4 md:justify-between md:px-7">
        <Suspense fallback={null}>
          <DashboardBreadcrumb />
        </Suspense>
        <div className="flex min-w-0 items-center gap-3">
          <ModeToggle />
          <UserButton user={user} />
        </div>
      </header>
      <div className="col-span-2 border-b px-4 py-2 md:col-span-1 md:border-r md:border-b-0 md:px-4 md:py-7">
        <Suspense fallback={null}>
          <DashboardNav />
        </Suspense>
      </div>
      <main className="bg-background col-span-2 flex min-w-0 flex-col md:col-span-1">
        {children}
      </main>
    </div>
  );
}
