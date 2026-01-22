'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/dashboard/today', label: 'Today' },
  { href: '/dashboard/inbox', label: 'Inbox' },
  { href: '/dashboard/tasks', label: 'Tasks' }
];

function getPageTitle(pathname: string) {
  if (pathname === '/dashboard' || pathname === '/dashboard/today') return 'Today';
  if (pathname.startsWith('/dashboard/inbox')) return 'Inbox';
  if (pathname.startsWith('/dashboard/tasks')) return 'Tasks';
  return 'Dashboard';
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
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
    </div>
  );
}
