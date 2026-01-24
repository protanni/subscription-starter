'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Repeat, CalendarDays, User } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Bottom navigation matching core-clarity-system BottomNav
 * Uses HSL design token colors via Tailwind classes
 */
const navItems = [
  { href: '/dashboard/today', label: 'Today', icon: Home },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/habits', label: 'Habits', icon: Repeat },
  { href: '/dashboard/review', label: 'Review', icon: CalendarDays },
  { href: '/account', label: 'Account', icon: User }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--nav-background))] border-t border-[hsl(var(--nav-border))] pb-safe md:hidden">
      <div className="container flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/dashboard/today' && pathname === '/dashboard');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              <motion.div
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      isActive
                        ? 'text-[hsl(var(--nav-active))]'
                        : 'text-[hsl(var(--nav-inactive))]'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(var(--nav-active))]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors duration-200',
                    isActive
                      ? 'text-[hsl(var(--nav-active))]'
                      : 'text-[hsl(var(--nav-inactive))]'
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
