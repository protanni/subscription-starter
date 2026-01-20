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
    <form onSubmit={onSubmit} className="rounded-md border p-3">
      <label className="text-sm font-medium">Quick Capture</label>

      <div className="mt-2 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write anything… (press Enter)"
          className="w-full rounded-md border px-3 py-2"
          disabled={isPending}
        />
        <button
          type="submit"
          className="rounded-md border px-4 py-2 hover:bg-gray-50"
          disabled={isPending}
        >
          Add
        </button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Capture first. Process later.
      </p>
    </form>
  );
}
