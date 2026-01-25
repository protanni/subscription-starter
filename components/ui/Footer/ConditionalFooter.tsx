'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

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

/**
 * Renders Footer everywhere except on dashboard routes when viewport is mobile.
 * Prevents ACME footer from bleeding under dashboard app on scroll.
 */
export default function ConditionalFooter() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isDashboardMobile =
    (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) && isMobile;

  if (isDashboardMobile) return null;
  return <Footer />;
}
