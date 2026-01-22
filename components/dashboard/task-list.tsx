'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  completed_at: string | null;
};

type ViewType = 'todo' | 'done';

/**
 * TaskList
 * - Client Component for toggling tasks (done/undo) and deleting.
 * - Calls POST /api/tasks/toggle and POST /api/tasks/delete
 */
export function TaskList({
  initialTasks,
  currentView
}: {
  initialTasks: Task[];
  currentView: ViewType;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tasks, setTasks] = useState(initialTasks);

  // Sync local state when initialTasks changes (e.g., when switching views)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Toggle between todo and done views
  function switchView(view: ViewType) {
    if (view === 'done') {
      router.push('/dashboard/tasks?view=done');
    } else {
      router.push('/dashboard/tasks');
    }
  }

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

    // Optimistically remove from current list
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    // Refresh to get updated data
    startTransition(() => router.refresh());
  }

  async function deleteTask(taskId: string) {
    const res = await fetch('/api/tasks/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    // Optimistically remove from current list
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    // Refresh to get updated data
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => switchView('todo')}
          className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
            currentView === 'todo'
              ? 'bg-gray-200 text-gray-900'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          To do
        </button>
        <button
          onClick={() => switchView('done')}
          className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
            currentView === 'done'
              ? 'bg-gray-200 text-gray-900'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Done
        </button>
      </div>

      {/* Empty State */}
      {!tasks.length && (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          {currentView === 'done'
            ? 'No completed tasks yet.'
            : 'No tasks yet. Create your first task above.'}
        </div>
      )}

      {/* Tasks List */}
      {tasks.length > 0 && (
        <ul className="space-y-1">
          {tasks.map((t) => {
            const done = t.status === 'done';
            return (
              <li key={t.id} className="rounded-md border p-3">
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggle(t.id)}
                    disabled={isPending}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  />

                  {/* Task Text */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium ${
                        done ? 'line-through opacity-70' : ''
                      }`}
                    >
                      {t.title}
                    </div>
                  </div>

                  {/* Trash Icon */}
                  <button
                    onClick={() => deleteTask(t.id)}
                    disabled={isPending}
                    className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-40"
                    title="Delete task"
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
