import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUser, getProfile } from '@/utils/supabase/queries';
import { DashboardShell } from './_components/dashboard-shell';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const user = await getUser(supabase);
  if (!user) {
    redirect('/signin?redirectTo=/dashboard');
  }

  const profile = await getProfile(supabase, user.id);
  const isPaid = profile?.is_paid === true;

  if (!isPaid) {
    redirect('/pricing?paywall=1');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
