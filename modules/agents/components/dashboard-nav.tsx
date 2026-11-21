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
import { cn } from '@/lib/utils';

const links = [
  { href: '/agents', label: 'My agents', icon: GridViewIcon },
  { href: '/agents/new', label: 'Create agent', icon: Add01Icon },
];

export function DashboardNav() {
  const pathname = usePathname();
  const activePath = pathname === '/agents/new' ? pathname : '/agents';

  return (
    <nav aria-label="Workspace" className="flex flex-wrap gap-1 md:flex-col">
      <p className="text-muted-foreground mb-1 hidden px-2.5 font-mono text-[11px] tracking-wide uppercase md:block">
        Workspace
      </p>
      {links.map(({ href, label, icon }) => (
        <Button
          key={href}
          render={<Link href={href} />}
          nativeButton={false}
          variant="ghost"
          aria-current={pathname === href ? 'page' : undefined}
          className={cn(
            'text-muted-foreground justify-start gap-2.5 px-2.5 motion-reduce:transition-none',
            activePath === href &&
              'border-blue-200/60 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 dark:border-blue-400/15 dark:bg-blue-400/10 dark:text-blue-200 dark:hover:bg-blue-400/20 dark:hover:text-blue-100',
          )}
        >
          <HugeiconsIcon icon={icon} aria-hidden="true" />
          {label}
        </Button>
      ))}
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
