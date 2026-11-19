import { Suspense } from 'react';

import { Logo } from '@/components/logo';
import { ModeToggle } from '@/components/ui/mode-toggle';
import {
  UserMenu,
  UserMenuSkeleton,
} from '@/modules/auth/components/user-menu';

export function Navbar() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo size={28} labelClassName="text-base" eager />

        <div className="flex items-center gap-3">
          <ModeToggle />
          {/* Static shell renders instantly; the avatar streams in. */}
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}
