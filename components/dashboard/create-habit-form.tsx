'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

/**
 * CreateHabitForm
 * - Client Component used on the Habits page.
 * - Calls POST /api/habits to create a habit.
 * - Uses router.refresh() to re-fetch Server Component data (no full reload).
 */
export function CreateHabitForm() {
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = name.trim();
    if (!value) return;

    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: value }),
    });

    if (!res.ok) {
      // MVP-level error handling. Later we can replace with a toast system.
      console.error(await res.text());
      return;
    }

    setName('');

    // Re-fetch habits list from the server without a full page reload.
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-md border px-3 py-2 pr-10"
        placeholder="New habit…"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Add habit"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
