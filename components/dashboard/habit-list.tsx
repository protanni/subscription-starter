'use client';

import { useRef, useState, useTransition } from 'react';
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
 *
 * Stability rules:
 * - Lock per habit id (prevents duplicate mutations on rapid taps)
 * - "Latest wins" per habit id (guards against out-of-order responses)
 * - Refresh only AFTER settle (never mid-optimistic)
 */
export function HabitList({ initialHabits }: { initialHabits: Habit[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Mount-only init to avoid props/refresh overwriting local state mid-mutation.
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

    // Optimistic flip immediately (keeps UI responsive and consistent).
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
        // Roll back if the server rejected the change.
        const errText = await res.text().catch(() => '');
        console.error(errText || `POST /api/habits/toggle failed (${res.status})`);

        if (isLatest(habitId, seq)) {
          setHabits((prev) =>
            prev.map((h) => (h.id === habitId ? { ...h, done_today: !h.done_today } : h))
          );
        }
        return;
      }

      // If a newer mutation happened, ignore this response.
      if (!isLatest(habitId, seq)) return;

      // Optional: if endpoint returns { done: boolean }, you could reconcile exactly.
      // We keep optimistic as truth and refresh after settle for server truth.
    } finally {
      unlock(habitId);
      startTransition(() => router.refresh());
    }
  }

  async function deleteHabit(habitId: string) {
    if (isPending(habitId)) return;

    const seq = nextSeq(habitId);
    lock(habitId);

    // Optimistically remove
    const snapshot = habits;
    setHabits((prev) => prev.filter((h) => h.id !== habitId));

    try {
      const res = await fetch('/api/habits/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(errText || `POST /api/habits/delete failed (${res.status})`);

        // Roll back removal if still latest for this id
        if (isLatest(habitId, seq)) {
          setHabits(snapshot);
        }
        return;
      }

      if (!isLatest(habitId, seq)) return;
    } finally {
      unlock(habitId);
      startTransition(() => router.refresh());
    }
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
                />

                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm font-medium ${done ? 'line-through opacity-70' : ''}`}
                  >
                    {h.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => deleteHabit(h.id)}
                  disabled={rowPending}
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
