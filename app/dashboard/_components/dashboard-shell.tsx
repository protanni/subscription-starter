'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileShell } from '@/components/dashboard/mobile-shell';

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const m = window.matchMedia('(max-width: 767px)');
    setIsMobile(m.matches);
    const listener = () => setIsMobile(m.matches);
    m.addEventListener('change', listener);
    return () => m.removeEventListener('change', listener);
  }, []);
  return isMobile;
}

const nav = [
  { href: '/dashboard/today', label: 'Today' },
  { href: '/dashboard/inbox', label: 'Inbox' },
  { href: '/dashboard/tasks', label: 'Tasks' },
  { href: '/dashboard/habits', label: 'Habits' },
  { href: '/dashboard/review', label: 'Review' }
];

function getPageTitle(pathname: string) {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/today')) return 'Today';
  if (pathname.startsWith('/dashboard/inbox')) return 'Inbox';
  if (pathname.startsWith('/dashboard/tasks')) return 'Tasks';
  if (pathname.startsWith('/dashboard/habits')) return 'Habits';
  if (pathname.startsWith('/dashboard/review')) return 'Review';
  return 'Dashboard';
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="md:hidden">
        <MobileShell>{children}</MobileShell>
      </div>
    );
  }

  return (
    <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white border-r border-black/5">
          <div className="h-16 flex items-center justify-center px-4">
            <span className="text-[13px] font-semibold tracking-[0.22em] text-[#062323]">
              PROTANNI
            </span>
          </div>

          <nav className="px-3 py-2">
            <ul className="space-y-1">
              {nav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        'block rounded-md px-3 py-2 text-sm',
                        isActive
                          ? 'bg-[#F8FCFB] text-[#062323] ring-1 ring-black/5'
                          : 'text-[#2B4040] hover:bg-[#F8FCFB] hover:text-[#062323]'
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Topbar */}
          <header className="h-16 flex items-center px-6 bg-white border-b border-black/5">
            <h1 className="text-base font-semibold text-[#062323]">{title}</h1>
          </header>

          <main className="px-6 py-6">{children}</main>
        </div>
    </div>
  );
}
