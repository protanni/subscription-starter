// components/dashboard/dashboard-sidebar.tsx
import Link from 'next/link';

const nav = [
  { href: '/dashboard/today', label: 'Today' },
  { href: '/dashboard/inbox', label: 'Inbox' },
  { href: '/dashboard/tasks', label: 'Tasks' },
];

export function DashboardSidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <div className="mb-6">
        <div className="text-lg font-semibold">PROTANNI</div>
        <div className="text-sm text-muted-foreground">MVP</div>
      </div>

      <nav className="space-y-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 hover:bg-gray-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
