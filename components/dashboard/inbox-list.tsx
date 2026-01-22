'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type InboxCapture = {
  id: string;
  content: string;
  created_at: string;
  status: string;
  type: string;
};

type ViewType = 'inbox' | 'archived';

/**
 * InboxList
 * - Client Component used for interactive inbox actions.
 * - Actions:
 *   - Convert to Task (POST /api/captures/convert-to-task) - inbox only
 *   - Archive (POST /api/captures/archive) - inbox only
 *   - Restore (POST /api/captures/restore) - archived only
 */
export function InboxList({
  initialCaptures,
  currentView
}: {
  initialCaptures: InboxCapture[];
  currentView: ViewType;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  // Toggle between inbox and archived views
  function switchView(view: ViewType) {
    if (view === 'archived') {
      router.push('/dashboard/inbox?view=archived');
    } else {
      router.push('/dashboard/inbox');
    }
  }

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

    // Show feedback
    setFeedback('Archived — View archived');
    setTimeout(() => setFeedback(null), 3000);

    startTransition(() => router.refresh());
  }

  async function restore(captureId: string) {
    const res = await fetch('/api/captures/restore', {
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

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => switchView('inbox')}
          className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
            currentView === 'inbox'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => switchView('archived')}
          className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
            currentView === 'archived'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {feedback}
          <button
            onClick={() => switchView('archived')}
            className="ml-2 font-medium underline hover:no-underline"
          >
            View archived
          </button>
        </div>
      )}

      {/* Empty State */}
      {!initialCaptures.length && (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          {currentView === 'archived'
            ? 'No archived captures yet.'
            : 'Your inbox is empty. Add your first capture above.'}
        </div>
      )}

      {/* Captures List */}
      {initialCaptures.length > 0 && (
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
                  {currentView === 'inbox' && (
                    <>
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
                    </>
                  )}
                  {currentView === 'archived' && (
                    <button
                      className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                      onClick={() => restore(c.id)}
                      disabled={isPending}
                      title="Restore this capture to inbox"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
