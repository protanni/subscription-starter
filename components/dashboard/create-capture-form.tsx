'use client';

// components/dashboard/create-capture-form.tsx
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function CreateCaptureForm() {
  const supabase = createSupabaseBrowserClient();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = content.trim();
    if (!value) return;

    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
      setLoading(false);
      alert('Você precisa estar logada.');
      return;
    }

    const { error } = await supabase.from('captures').insert({
      user_id: user.id,
      content: value,
      status: 'inbox',
      type: 'note',
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setContent('');
    // simples: reload pra refletir — depois a gente melhora com optimistic UI
    window.location.reload();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border p-4 space-y-3">
      <div className="font-medium">Quick capture</div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-md border p-2"
        rows={3}
        placeholder="Tira da cabeça e joga aqui..."
      />
      <button
        disabled={loading}
        className="rounded-md bg-black px-3 py-2 text-white disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Adicionar'}
      </button>
    </form>
  );
}
