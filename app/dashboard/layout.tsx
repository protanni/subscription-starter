// app/dashboard/layout.tsx
import { ReactNode } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  // Proteção simples: se não tem user, manda pro login do teu template
  // Ajuste para a rota real do seu starter (/sign-in, /login, /auth, etc.)
  if (!data.user) {
    return (
      <div className="p-8">
        <p>Você precisa estar logada para acessar o dashboard.</p>
      </div>
    );
  }

  // Seed das 12 áreas: só cria se não existir (sua função já protege) :contentReference[oaicite:4]{index=4}
  await supabase.rpc('seed_default_life_areas');

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
