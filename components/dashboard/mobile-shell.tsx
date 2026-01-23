'use client';

import { usePathname } from 'next/navigation';
import { MobileBottomNav } from './mobile-bottom-nav';

function getPageTitle(pathname: string) {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/today'))
    return 'Today';
  if (pathname.startsWith('/dashboard/inbox')) return 'Inbox';
  if (pathname.startsWith('/dashboard/tasks')) return 'Tasks';
  if (pathname.startsWith('/dashboard/habits')) return 'Habits';
  if (pathname.startsWith('/dashboard/review')) return 'Review';
  if (pathname.startsWith('/account')) return 'Account';
  return 'Dashboard';
}

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-[#e4f1ed] md:hidden">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 h-14 flex items-center justify-center bg-white border-b border-black/5">
        <span className="text-[13px] font-semibold tracking-[0.22em] text-[#062323]">
          PROTANNI
        </span>
      </header>

      {/* Page title */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-semibold text-[#062323]">{title}</h1>
      </div>

      {/* Content container */}
      <main className="px-4 pb-24 max-w-3xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
