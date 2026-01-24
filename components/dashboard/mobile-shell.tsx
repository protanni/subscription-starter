'use client';

import { MobileBottomNav } from './mobile-bottom-nav';

/**
 * Mobile shell matching core-clarity-system AppLayout
 * - Uses bg-background (warm off-white from design tokens)
 * - Container max-w-lg (32rem/512px) matches core-clarity
 * - pb-24 for bottom nav clearance
 * - pt-safe for notch clearance
 */
export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:hidden">
      {/* Content container - matches AppLayout from core-clarity */}
      <main className="container max-w-lg mx-auto pb-24 pt-safe px-4">
        {children}
      </main>

      {/* Bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
