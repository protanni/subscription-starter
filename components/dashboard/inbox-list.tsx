// components/dashboard/inbox-list.tsx
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
  currentView,
}: {
  initialCaptures: InboxCapture[];
  currentView: ViewType;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  // Per-capture lock for convert action (prevents double-click / retries from re-firing)
  const [converting, setConverting] = useState<Record<string, boolean>>({});

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
    if (converting[captureId]) return;

    setConverting((p) => ({ ...p, [captureId]: true }));
    try {
      const res = await fetch('/api/captures/convert-to-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captureId }),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error(json?.error ?? json);
        return;
      }

      const taskId = json?.task?.id as string | undefined;

      // If server returns an existing/created task (idempotent),
      // navigate/open it without error.
      if (taskId) {
        router.push(`/dashboard/tasks?open=${taskId}`);
        return;
      }

      startTransition(() => router.refresh());
    } finally {
      setConverting((p) => {
        const next = { ...p };
        delete next[captureId];
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="rounded-lg bg-muted/50 p-1.5 flex gap-1">
        <button
          onClick={() => switchView('inbox')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            currentView === 'inbox'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground/80'
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => switchView('archived')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            currentView === 'archived'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground/80'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className="rounded-xl border border-border/50 bg-card p-4 text-sm text-foreground shadow-card">
          {feedback}
          <button
            onClick={() => switchView('archived')}
            className="ml-2 font-medium text-primary underline hover:no-underline"
          >
            View archived
          </button>
        </div>
      )}

      {/* Empty State */}
      {!initialCaptures.length && (
        <div className="rounded-xl border border-border/50 bg-card p-5 text-sm text-muted-foreground shadow-card">
          {currentView === 'archived'
            ? 'No archived captures yet.'
            : 'Your inbox is empty. Add your first capture above.'}
        </div>
      )}

      {/* Captures List */}
      {initialCaptures.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/50 shadow-card overflow-hidden">
          {initialCaptures.map((c) => (
            <div key={c.id} className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-foreground text-sm">{c.content}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                {currentView === 'inbox' && (
                  <>
                    <button
                      type="button"
                      className="rounded-md border border-border/50 px-3 py-1.5 text-sm text-foreground hover:bg-muted/50 disabled:opacity-40 transition-colors"
                      onClick={() => convertToTask(c.id)}
                      disabled={isPending || !!converting[c.id]}
                      title={
                        converting[c.id]
                          ? 'Converting…'
                          : 'Convert this capture into a task'
                      }
                    >
                      To task
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-border/50 px-3 py-1.5 text-sm text-foreground hover:bg-muted/50 disabled:opacity-40 transition-colors"
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
                    type="button"
                    className="rounded-md border border-border/50 px-3 py-1.5 text-sm text-foreground hover:bg-muted/50 disabled:opacity-40 transition-colors"
                    onClick={() => restore(c.id)}
                    disabled={isPending}
                    title="Restore this capture to inbox"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
