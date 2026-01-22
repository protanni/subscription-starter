import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { getProfile, getUser } from '@/utils/supabase/queries';

export default async function HomePage() {
  const supabase = createClient();

  const user = await getUser(supabase);

  // Logged in -> route based on paid entitlement (no Stripe)
  if (user) {
    const profile = await getProfile(supabase, user.id);
    const isPaid = profile?.is_paid === true;

    if (isPaid) {
      redirect('/dashboard/today');
    }

    redirect('/pricing?paywall=1');
  }

  // Logged out -> show lightweight landing
  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-[#062323]">PROTANNI</h1>

      <p className="mt-3 text-sm text-[#577575]">
        A personal operating system for execution — inbox, tasks, habits, and
        journaling.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/signin"
          className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm text-[#062323] hover:bg-[#F8FCFB]"
        >
          Sign in
        </Link>

        <Link
          href="/signin/signup"
          className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm text-[#062323] hover:bg-[#F8FCFB]"
        >
          Create account
        </Link>
      </div>

      <p className="mt-6 text-sm text-[#577575]">
        Start building your second brain and execution system.
      </p>
    </main>
  );
}
