import type { ComponentProps } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout03Icon } from '@hugeicons/core-free-icons';

import { Spinner } from '@/components/ui/spinner';
import { signOut } from '../actions';
import { SubmitButton } from './submit-button';

export function SignOutButton({
  variant = 'outline',
  ...props
}: Omit<ComponentProps<typeof SubmitButton>, 'pending' | 'children'>) {
  return (
    <form action={signOut}>
      <SubmitButton
        variant={variant}
        pending={
          <>
            <Spinner className="size-4" />
            Signing out
          </>
        }
        {...props}
      >
        <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
        Sign out
      </SubmitButton>
    </form>
  );
}
