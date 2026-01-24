'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useTasksCategory } from '@/components/dashboard/tasks-category-context';

/**
 * CreateTaskForm
 * - Client Component used on the Tasks page.
 * - Calls POST /api/tasks to create a task.
 * - Uses router.refresh() to re-fetch Server Component data.
 * - Placeholder adapts to selected category (visual only).
 */
export function CreateTaskForm() {
  const [title, setTitle] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { placeholder } = useTasksCategory();

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
      console.error(await res.text());
      return;
    }

    setTitle('');
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:opacity-50"
        placeholder={placeholder}
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Add task"
      >
        <Plus className="h-5 w-5" />
      </button>
    </form>
  );
}
