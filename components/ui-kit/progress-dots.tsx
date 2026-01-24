'use client';

import { cn } from '@/utils/cn';

interface ProgressDotsProps {
  completedDates: string[];
  days?: number;
  className?: string;
}

function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * 7-day progress dots for habit streaks
 * Ported from core-clarity-system ProgressDots
 */
export function ProgressDots({
  completedDates,
  days = 7,
  className
}: ProgressDotsProps) {
  const lastDays = getLastNDays(days);
  const completedSet = new Set(completedDates);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {lastDays.map((date) => {
        const isCompleted = completedSet.has(date);
        return (
          <div
            key={date}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors',
              isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
            )}
          />
        );
      })}
    </div>
  );
}
