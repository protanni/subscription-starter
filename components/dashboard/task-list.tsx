'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  completed_at: string | null;
};

/**
 * TaskList
 * - Client Component for toggling tasks (done/undo).
 * - Calls POST /api/tasks/toggle
 */
export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function toggle(taskId: string) {
    const res = await fetch('/api/tasks/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    startTransition(() => router.refresh());
  }

  if (!initialTasks.length) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        No tasks yet. Create your first task above.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {initialTasks.map((t) => {
        const done = t.status === 'done';
        return (
          <li key={t.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className={`font-medium ${done ? 'line-through opacity-70' : ''}`}>
                  {t.title}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {done ? 'Completed' : 'Open'} • Priority: {t.priority}
                </div>
              </div>

              <button
                className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                onClick={() => toggle(t.id)}
                disabled={isPending}
              >
                {done ? 'Undo' : 'Done'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
