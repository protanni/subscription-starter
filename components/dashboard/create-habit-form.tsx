// components/dashboard/create-habit-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

/**
 * CreateHabitForm
 * - Client Component used on the Habits page.
 * - Calls POST /api/habits to create a habit.
 * - Uses router.refresh() to re-fetch Server Component data.
 * - Matches Tasks input styling: bg-card, rounded-xl, Plus icon.
 *
 * Stability rules:
 * - Prevent duplicate submits while mutation is in-flight
 * - Refresh only after settle
 */
export function CreateHabitForm() {
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;

    const value = name.trim();
    if (!value) return;

    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value }),
      });

      if (!res.ok) {
        console.error(await res.text());
        return;
      }

      setName('');
    } finally {
      // Refresh after settle to re-fetch Server Component data
      startTransition(() => router.refresh());
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:opacity-50"
        placeholder="New habit…"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Add habit"
      >
        <Plus className="h-5 w-5" />
      </button>
    </form>
  );
}
