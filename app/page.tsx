import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (user) {
    redirect('/dashboard/today');
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-3xl font-semibold">PROTANNI</h1>
      <p className="mt-3 text-gray-600">
        Seu sistema de organização e execução — inbox, tasks, hábitos e diário.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/signin"
          className="rounded-md border px-4 py-2 hover:bg-gray-50"
        >
          Entrar
        </Link>

        <Link
          href="/pricing"
          className="rounded-md border px-4 py-2 hover:bg-gray-50"
        >
          Ver planos
        </Link>
      </div>
    </main>
  );
}
