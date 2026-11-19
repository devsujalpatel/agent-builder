import { Navbar } from '@/components/navbar';

// Shell for signed-in pages. No auth check here (layouts don't re-render on
// navigation); proxy.ts and each page's requireAuth() handle access.
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
