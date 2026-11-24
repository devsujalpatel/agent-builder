import { Suspense } from 'react';
import Link from 'next/link';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { getSession } from '@/modules/auth/actions';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
];

export function LandingNav() {
  return (
    <header className="bg-background/75 sticky top-0 z-40 border-b border-transparent backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo size={28} labelClassName="text-base font-semibold" eager />
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="lp-nav-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Suspense fallback={<div className="h-8 w-36" />}>
            <NavActions />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}

async function NavActions() {
  const session = await getSession();

  if (session) {
    return (
      <Button
        render={<Link href="/agents" />}
        nativeButton={false}
        variant="primary"
        className="rounded-full px-3.5"
      >
        Open dashboard
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        render={<Link href="/sign-in" />}
        nativeButton={false}
        variant="ghost"
        className="hidden rounded-full px-3 sm:inline-flex"
      >
        Sign in
      </Button>
      <Button
        render={<Link href="/agents/new" />}
        nativeButton={false}
        variant="primary"
        className="rounded-full px-3.5"
      >
        Start building
      </Button>
    </div>
  );
}
