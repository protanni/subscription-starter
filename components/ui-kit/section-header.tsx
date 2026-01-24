'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  count?: { done: number; total: number };
  viewAllHref?: string;
  viewAllLabel?: string;
}

/**
 * Section header with optional count and "View all" link
 * Ported from core-clarity-system section pattern
 */
export function SectionHeader({
  title,
  count,
  viewAllHref,
  viewAllLabel = 'View all'
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-medium text-foreground">
        {title}
        {count && (
          <span className="ml-2 text-xs text-muted-foreground font-normal">
            {count.done}/{count.total}
          </span>
        )}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {viewAllLabel}
          <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
