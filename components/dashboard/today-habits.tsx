'use client';

import { useRef, useState, useTransition } from 'react';
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
 *
 * Stability rules:
 * - Lock per habit id (prevents duplicate mutations on rapid taps)
 * - "Latest wins" per habit id (guards against out-of-order responses)
 * - Refresh only AFTER settle (never mid-optimistic)
 */
export function TodayHabits({ initialHabits }: { initialHabits: Habit[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Mount-only init to avoid refresh/props overwriting local state mid-mutation.
  const [habits, setHabits] = useState(() => initialHabits);

  // Pending lock per habit id
  const [pendingById, setPendingById] = useState<Record<string, true>>({});

  // "Latest wins" sequence per habit id
  const seqByIdRef = useRef<Record<string, number>>({});

  const isPending = (habitId: string) => pendingById[habitId] === true;

  const lock = (habitId: string) => {
    setPendingById((prev) => (prev[habitId] ? prev : { ...prev, [habitId]: true }));
  };

  const unlock = (habitId: string) => {
    setPendingById((prev) => {
      if (!prev[habitId]) return prev;
      const next = { ...prev };
      delete next[habitId];
      return next;
    });
  };

  const nextSeq = (habitId: string) => {
    const curr = seqByIdRef.current[habitId] ?? 0;
    const next = curr + 1;
    seqByIdRef.current[habitId] = next;
    return next;
  };

  const isLatest = (habitId: string, seq: number) => (seqByIdRef.current[habitId] ?? 0) === seq;

  async function toggle(habitId: string) {
    if (isPending(habitId)) return;

    const seq = nextSeq(habitId);
    lock(habitId);

    // Optimistic flip
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, done_today: !h.done_today } : h))
    );

    try {
      const res = await fetch('/api/habits/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(errText || `POST /api/habits/toggle failed (${res.status})`);

        // Rollback if still latest
        if (isLatest(habitId, seq)) {
          setHabits((prev) =>
            prev.map((h) => (h.id === habitId ? { ...h, done_today: !h.done_today } : h))
          );
        }
        return;
      }

      if (!isLatest(habitId, seq)) return;

      // Keep optimistic state; server truth will be reflected on refresh after settle.
    } finally {
      unlock(habitId);
      startTransition(() => router.refresh());
    }
  }

  if (!habits.length) {
    return <div className="py-4 text-sm text-muted-foreground">No habits set up yet.</div>;
  }

  return (
    <div className="divide-y divide-border/50">
      {habits.map((h) => {
        const done = h.done_today;
        const rowPending = isPending(h.id);

        return (
          <div
            key={h.id}
            className={`flex items-center gap-3 p-4 ${done ? 'text-muted-foreground' : ''}`}
          >
            <ProtanniCheckbox
              checked={done}
              onChange={() => toggle(h.id)}
              disabled={rowPending}
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
