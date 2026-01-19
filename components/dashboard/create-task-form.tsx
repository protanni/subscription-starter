'use client';

// components/dashboard/create-task-form.tsx
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function CreateTaskForm() {
  const supabase = createSupabaseBrowserClient();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;

    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      setLoading(false);
      alert('Você precisa estar logada.');
      return;
    }

    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: value,
      status: 'todo',
      priority: 'medium',
      is_deleted: false,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle('');
    window.location.reload();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border p-4 flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 rounded-md border px-3 py-2"
        placeholder="Nova task..."
      />
      <button
        disabled={loading}
        className="rounded-md bg-black px-3 py-2 text-white disabled:opacity-60"
      >
        {loading ? '...' : 'Adicionar'}
      </button>
    </form>
  );
}
