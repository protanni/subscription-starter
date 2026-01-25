'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressDots, ProtanniCheckbox } from '@/components/ui-kit';

type Habit = {
  id: string;
  name: string;
  done_today: boolean;
  completedDates?: string[];
};

/**
 * TodayHabits
 * - Client Component for toggling habit completion for today only.
 * - Simplified version of HabitList for Today page.
 */
export function TodayHabits({ initialHabits }: { initialHabits: Habit[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [habits, setHabits] = useState(initialHabits);

  // Sync local state when initialHabits changes
  useEffect(() => {
    setHabits(initialHabits);
  }, [initialHabits]);

  const today = new Date().toISOString().slice(0, 10);

  async function toggle(habitId: string) {
    const res = await fetch('/api/habits/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const next = !h.done_today;
        const dates = h.completedDates ?? [];
        const nextDates = next
          ? dates.includes(today)
            ? dates
            : [...dates, today]
          : dates.filter((d: string) => d !== today);
        return { ...h, done_today: next, completedDates: nextDates };
      })
    );

    startTransition(() => router.refresh());
  }

  if (!habits.length) {
    return (
      <div className="py-4 text-sm text-muted-foreground">No habits set up yet.</div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {habits.map((h) => {
        const done = h.done_today;
        return (
          <div
            key={h.id}
            className={`flex items-center gap-3 p-4 ${done ? 'text-muted-foreground' : ''}`}
          >
            <ProtanniCheckbox
              checked={done}
              onChange={() => toggle(h.id)}
              disabled={isPending}
              aria-label={done ? `Mark ${h.name} incomplete` : `Mark ${h.name} complete`}
            />
            <div className="flex-1 min-w-0 space-y-1">
              <div className={done ? 'font-medium text-muted-foreground' : 'font-medium text-sm'}>
                {h.name}
              </div>
              <ProgressDots
                completedDates={h.completedDates ?? []}
                days={7}
                className="shrink-0"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
