'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

type InboxCapture = {
  id: string;
  content: string;
  created_at: string;
  status: string;
  type: string;
};

/**
 * InboxList
 * - Client Component used for interactive inbox actions.
 * - Actions:
 *   - Convert to Task (POST /api/captures/convert-to-task)
 *   - Archive (POST /api/captures/archive)
 */
export function InboxList({ initialCaptures }: { initialCaptures: InboxCapture[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function archive(captureId: string) {
    const res = await fetch('/api/captures/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captureId }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    startTransition(() => router.refresh());
  }

  async function convertToTask(captureId: string) {
    const res = await fetch('/api/captures/convert-to-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captureId }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    startTransition(() => router.refresh());
  }

  if (!initialCaptures.length) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        Your inbox is empty. Add your first capture above.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {initialCaptures.map((c) => (
        <li key={c.id} className="rounded-md border p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium">{c.content}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(c.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                onClick={() => convertToTask(c.id)}
                disabled={isPending}
                title="Convert this capture into a task"
              >
                To task
              </button>

              <button
                className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                onClick={() => archive(c.id)}
                disabled={isPending}
                title="Archive this capture"
              >
                Archive
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
