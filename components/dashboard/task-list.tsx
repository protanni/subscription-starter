'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
};

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const supabase = createSupabaseBrowserClient();
  const [tasks, setTasks] = useState(initialTasks);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function markDone(id: string) {
    setBusyId(id);
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done' })
      .eq('id', id);

    setBusyId(null);

    if (error) {
      alert(error.message);
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'done' } : t))
    );
  }

  if (!tasks.length) {
    return <div className="text-sm text-gray-500">Sem tasks ainda.</div>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li
          key={t.id}
          className="rounded-md border p-3 flex items-center justify-between gap-3"
        >
          <div>
            <div className={t.status === 'done' ? 'line-through opacity-70' : ''}>
              {t.title}
            </div>
            <div className="text-xs text-gray-500">
              {t.status} • {t.priority}
            </div>
          </div>

          {t.status !== 'done' && (
            <button
              onClick={() => markDone(t.id)}
              disabled={busyId === t.id}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-60"
            >
              {busyId === t.id ? '...' : 'Concluir'}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
