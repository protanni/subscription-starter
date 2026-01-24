'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * CreateCaptureForm
 * - Client Component used on the Inbox page.
 * - Calls POST /api/captures to create an inbox item.
 * - Refreshes the route to re-fetch Server Component data.
 */
export function CreateCaptureForm() {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = content.trim();
    if (!value) return;

    const res = await fetch('/api/captures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: value, type: 'note' }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    setContent('');

    // This refresh re-runs the server-side query in app/dashboard/inbox/page.tsx
    startTransition(() => router.refresh());
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border/50 bg-card p-5 shadow-card"
    >
      <label className="text-sm font-medium text-foreground">Quick Capture</label>

      <div className="mt-3 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write anything… (press Enter)"
          className="flex-1 rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:opacity-50"
          disabled={isPending}
        />
        <button
          type="submit"
          className="rounded-xl border border-border/50 bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors shadow-sm"
          disabled={isPending}
        >
          Add
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Capture first. Process later.
      </p>
    </form>
  );
}
