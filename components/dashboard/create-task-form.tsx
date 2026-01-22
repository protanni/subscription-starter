'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * CreateTaskForm
 * - Client Component used on the Tasks page.
 * - Calls POST /api/tasks to create a task.
 * - Uses router.refresh() to re-fetch Server Component data (no full reload).
 */
export function CreateTaskForm() {
  const [title, setTitle] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = title.trim();
    if (!value) return;

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: value }),
    });

    if (!res.ok) {
      // MVP-level error handling. Later we can replace with a toast system.
      console.error(await res.text());
      return;
    }

    setTitle('');

    // Re-fetch tasks list from the server without a full page reload.
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border p-4 flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 rounded-md border px-3 py-2"
        placeholder="New task…"
        disabled={isPending}
      />
      <button
        disabled={isPending}
        className="rounded-md bg-gray-700 px-3 py-2 text-white disabled:opacity-60 hover:bg-gray-600"
      >
        {isPending ? '...' : 'Add'}
      </button>
    </form>
  );
}
