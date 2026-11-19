'use client';

import { useTransition } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout03Icon } from '@hugeicons/core-free-icons';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { signOut } from '../actions';
import { getInitials } from '../lib/utils';

export type UserMenuUser = {
  name: string;
  email: string;
  image?: string | null;
};

function UserAvatar({
  user,
  size,
}: {
  user: UserMenuUser;
  size?: 'default' | 'lg';
}) {
  return (
    <Avatar size={size}>
      {user.image && <AvatarImage src={user.image} alt="" />}
      <AvatarFallback className="font-medium">
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function UserMenuDropdown({ user }: { user: UserMenuUser }) {
  const [signingOut, startSignOut] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${user.name}`}
        // Press feedback (Emil): transform-only scale, fast custom ease-out.
        className="focus-visible:ring-ring/50 data-popup-open:ring-ring/30 rounded-full transition-[scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] outline-none focus-visible:ring-3 active:scale-[0.96] data-popup-open:ring-3"
      >
        <UserAvatar user={user} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <div className="flex items-center gap-3 px-2 py-2">
          <UserAvatar user={user} size="lg" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-foreground truncate text-sm font-medium">
              {user.name}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup
          className={'cursor-pointer hover:bg-red-600/20 focus:bg-red-600/20'}
        >
          <DropdownMenuItem
            // Stay open while signing out so the spinner is the feedback.
            closeOnClick={false}
            disabled={signingOut}
            onClick={() => startSignOut(() => signOut())}
          >
            {signingOut ? (
              <Spinner className="size-4" />
            ) : (
              <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
            )}
            {signingOut ? 'Signing out' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
