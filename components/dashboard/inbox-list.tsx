'use client';

// components/dashboard/inbox-list.tsx
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Capture = {
  id: string;
  content: string;
  created_at: string;
  status: string;
  type: string;
};

export function InboxList({ initialCaptures }: { initialCaptures: Capture[] }) {
  const supabase = createSupabaseBrowserClient();
  const [items, setItems] = useState(initialCaptures);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function processCapture(id: string) {
    setBusyId(id);
    const { error } = await supabase
      .from('captures')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('id', id);

    setBusyId(null);

    if (error) {
      alert(error.message);
      return;
    }

    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  if (!items.length) {
    return <div className="text-sm text-muted-foreground">Inbox vazia 🎉</div>;
  }

  return (
    <ul className="space-y-2">
      {items.map((c) => (
        <li key={c.id} className="rounded-md border p-3">
          <div className="whitespace-pre-wrap">{c.content}</div>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => processCapture(c.id)}
              disabled={busyId === c.id}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-60"
            >
              {busyId === c.id ? 'Processando...' : 'Processar'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
