'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  CheckSquare,
  Repeat,
  BarChart3,
  User
} from 'lucide-react';

const navItems = [
  { href: '/dashboard/today', label: 'Today', icon: CalendarDays },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/habits', label: 'Habits', icon: Repeat },
  { href: '/dashboard/review', label: 'Review', icon: BarChart3 },
  { href: '/account', label: 'Account', icon: User }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/5 md:hidden">
      <div className="flex items-center justify-around h-16 pb-safe max-w-3xl mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/dashboard/today' && pathname === '/dashboard');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-x-2 top-1 bottom-1 bg-[#F8FCFB] rounded-lg"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35
                  }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#1f6b68]' : 'text-[#577575]'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? 'text-[#062323]' : 'text-[#577575]'
                  }`}
                >
                  {item.label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
