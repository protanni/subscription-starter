'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Habit = {
  id: string;
  name: string;
  done_today: boolean;
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

    // Optimistically update the done_today state
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, done_today: !h.done_today } : h
      )
    );

    // Refresh to get updated data
    startTransition(() => router.refresh());
  }

  if (!habits.length) {
    return (
      <div className="text-sm text-muted-foreground">No habits set up yet.</div>
    );
  }

  return (
    <ul className="space-y-1">
      {habits.map((h) => {
        const done = h.done_today;
        return (
          <li key={h.id} className="rounded-md border p-3">
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={done}
                onChange={() => toggle(h.id)}
                disabled={isPending}
                className="h-4 w-4 rounded-full border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0"
              />

              {/* Habit Name */}
              <div className="flex-1 min-w-0">
                <div className={done ? 'font-medium text-muted-foreground' : 'font-medium'}>
                  {h.name}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
