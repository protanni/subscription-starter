import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';

export default async function HomePage() {
  const supabase = createClient();
  const [user, subscription] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase),
  ]);

  const status = subscription?.status ?? null;
  const isActive = status === 'active' || status === 'trialing';

  if (user && isActive) {
    redirect('/dashboard/today');
  }

  if (user && !isActive) {
    redirect('/pricing?paywall=1');
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-3xl font-semibold">PROTANNI</h1>

      <p className="mt-3 text-gray-600">
        A personal operating system for execution — inbox, tasks, habits, and journaling.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/signin" className="rounded-md border px-4 py-2 hover:bg-gray-50">
          Sign in
        </Link>

        <Link href="/signin/signup" className="rounded-md border px-4 py-2 hover:bg-gray-50">
          Create account
        </Link>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Start building your second brain and execution system.
      </p>
    </main>
  );
}
