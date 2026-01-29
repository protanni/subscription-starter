// components/dashboard/create-task-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { useTasksCategory } from '@/components/dashboard/tasks-category-context';
import { apiFetch } from '@/lib/api/clients';

/**
 * CreateTaskForm
 * - Calls POST /api/tasks to create a task.
 * - Saves selected category as task.area (null if "all").
 */
export function CreateTaskForm() {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { placeholder, category } = useTasksCategory();

  const disabled = isSaving || isPending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (disabled) return;

    const value = title.trim();
    if (!value) return;

    const area = category === 'all' ? null : category;

    setIsSaving(true);
    try {
      await apiFetch<{ task: unknown }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: value, area }),
      });

      setTitle('');
      startTransition(() => router.refresh());
    } catch (err) {
      console.error('Create task failed', err);
      return;
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-border/50 bg-muted/50 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:opacity-50"
        placeholder={placeholder}
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled || !title.trim()}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Add task"
        aria-busy={disabled}
      >
        {disabled ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
      </button>
    </form>
  );
}
