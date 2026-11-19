import { ModeToggle } from '@/components/ui/mode-toggle';
import { AuthPreview } from '@/modules/auth/components/auth-preview';

// Shared shell for guest-only pages. No session check here: layouts don't
// re-render on navigation, so each page runs its own requireUnauth().
export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="relative grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      <main className="flex min-h-svh items-center justify-center p-6">
        {children}
      </main>

      <aside className="hidden items-center justify-center p-4 lg:flex">
        <div className="w-full max-w-150">
          <AuthPreview />
        </div>
      </aside>
    </div>
  );
}
