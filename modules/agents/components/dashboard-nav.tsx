'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Add01Icon, GridViewIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { BounceSidebar } from '@/components/ui/bounce-sidebar';
import { cn } from '@/lib/utils';

const links = [
  { href: '/agents', label: 'My agents', icon: GridViewIcon },
  { href: '/agents/new', label: 'Create agent', icon: Add01Icon },
];

export function DashboardNav() {
  const pathname = usePathname();
  const activePath = pathname === '/agents/new' ? pathname : '/agents';

  return (
    <nav aria-label="Workspace">
      <p className="text-muted-foreground mb-2 hidden px-2.5 text-xs font-medium md:block">
        Workspace
      </p>
      <BounceSidebar
        items={links}
        value={links.findIndex(({ href }) => href === activePath)}
        currentHref={pathname}
        dotColor="var(--workspace-accent)"
        className="hidden md:flex [&_[data-active=true]]:font-semibold"
      />
      <div className="flex flex-wrap gap-1 md:hidden">
        {links.map(({ href, label, icon }) => (
          <Button
            key={href}
            render={<Link href={href} />}
            nativeButton={false}
            variant="ghost"
            aria-current={pathname === href ? 'page' : undefined}
            className={cn(
              'text-muted-foreground justify-start gap-2.5 rounded-full px-3 motion-reduce:transition-none',
              activePath === href && 'bg-muted text-foreground font-semibold',
            )}
          >
            <HugeiconsIcon icon={icon} aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>
    </nav>
  );
}

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const childPage =
    pathname === '/agents/new' ? 'Create agent' : 'Agent builder';

  return (
    <Breadcrumb aria-label="Breadcrumb" className="hidden md:block">
      <BreadcrumbList>
        {pathname === '/agents' ? (
          <BreadcrumbItem>
            <BreadcrumbPage>My agents</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/agents" />}>
                My agents
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{childPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
