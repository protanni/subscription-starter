import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getSubscription, getUser } from '@/utils/supabase/queries';
import { DashboardShell } from './_components/dashboard-shell';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const [user, subscription] = await Promise.all([
    getUser(supabase),
    getSubscription(supabase)
  ]);

  if (!user) {
    redirect('/signin?redirectTo=/dashboard');
  }

  const status = subscription?.status ?? null;
  const isActive = status === 'active' || status === 'trialing';

  if (!isActive) {
    redirect('/pricing?paywall=1');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
