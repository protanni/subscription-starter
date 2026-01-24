'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ProtanniCheckbox } from '@/components/ui-kit';

type Habit = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  done_today: boolean;
};

/**
 * HabitList
 * - Client Component for toggling habit completion (done/undo) and deleting.
 * - Calls POST /api/habits/toggle and POST /api/habits/delete
 */
export function HabitList({ initialHabits }: { initialHabits: Habit[] }) {
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

  async function deleteHabit(habitId: string) {
    const res = await fetch('/api/habits/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    // Optimistically remove from current list
    setHabits((prev) => prev.filter((h) => h.id !== habitId));

    // Refresh to get updated data
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {/* Empty State */}
      {!habits.length && (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          No habits yet. Create your first habit above.
        </div>
      )}

      {/* Habits List */}
      {habits.length > 0 && (
        <ul className="space-y-1">
          {habits.map((h) => {
            const done = h.done_today;
            return (
              <li key={h.id} className="rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <ProtanniCheckbox
                    checked={done}
                    onChange={() => toggle(h.id)}
                    disabled={isPending}
                  />

                  {/* Habit Name */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium ${
                        done ? 'line-through opacity-70' : ''
                      }`}
                    >
                      {h.name}
                    </div>
                  </div>

                  {/* Trash Icon */}
                  <button
                    onClick={() => deleteHabit(h.id)}
                    disabled={isPending}
                    className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-40"
                    title="Delete habit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
