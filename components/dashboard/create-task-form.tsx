'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

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
    <form onSubmit={onSubmit} className="relative">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border px-3 py-2 pr-10"
        placeholder="New task…"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Add task"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
