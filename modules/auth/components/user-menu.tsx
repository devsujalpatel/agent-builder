import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentSession } from '../lib/session';
import { UserMenuDropdown } from './user-menu-dropdown';

/**
 * The signed-in user's avatar and account menu. Reads the session, so render
 * it inside <Suspense fallback={<UserMenuSkeleton />}> (cacheComponents).
 * Renders nothing for guests; access control stays with requireAuth().
 */
export async function UserMenu() {
  const session = await getCurrentSession();
  if (!session) return null;

  const { name, email, image } = session.user;
  return <UserMenuDropdown user={{ name, email, image }} />;
}

/** Same footprint as the avatar trigger, so nothing shifts when it streams in. */
export function UserMenuSkeleton() {
  return <Skeleton className="size-8 rounded-full" />;
}
