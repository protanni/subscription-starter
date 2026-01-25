'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ProtanniCheckbox } from '@/components/ui-kit';
import { ListCard } from '@/components/ui-kit/content-card';

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
 * - Uses ListCard, divide-y, same surface system as Tasks.
 */
export function HabitList({ initialHabits }: { initialHabits: Habit[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [habits, setHabits] = useState(initialHabits);

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

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, done_today: !h.done_today } : h
      )
    );
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

    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      {!habits.length && (
        <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col items-center justify-center shadow-card">
          <p className="text-sm text-muted-foreground">
            No habits yet. Create your first habit above.
          </p>
        </div>
      )}

      {habits.length > 0 && (
        <ListCard>
          {habits.map((h) => {
            const done = h.done_today;
            return (
              <div
                key={h.id}
                className={`flex items-center gap-3 p-4 ${
                  done ? 'text-muted-foreground' : ''
                }`}
              >
                <ProtanniCheckbox
                  checked={done}
                  onChange={() => toggle(h.id)}
                  disabled={isPending}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm font-medium ${
                      done ? 'line-through opacity-70' : ''
                    }`}
                  >
                    {h.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteHabit(h.id)}
                  disabled={isPending}
                  className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-40 transition-colors"
                  title="Delete habit"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </ListCard>
      )}
    </div>
  );
}
