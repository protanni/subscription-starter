// app/dashboard/inbox/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateCaptureForm } from '@/components/dashboard/create-capture-form';
import { InboxList } from '@/components/dashboard/inbox-list';

export default async function InboxPage() {
  // Server Component: fetches initial data on the server for fast first paint + SEO-safe rendering.
  const supabase = createSupabaseServerClient();

  // We rely on Supabase Auth session cookies (SSR) to identify the current user.
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // If no user session, return null. (In production, prefer redirect via middleware/dashboard layout guard.)
  if (!user) return null;

  // Load the user's inbox captures (status = 'inbox').
  const { data: captures, error } = await supabase
    .from('captures')
    .select('id,content,created_at,status,type')
    .eq('user_id', user.id)
    .eq('status', 'inbox')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-red-600">
        Failed to load inbox: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inbox</h1>

      {/* Quick Capture: the fastest way to get items out of your head and into the system */}
      <CreateCaptureForm />

      {/* Client component: handles actions (archive/convert) without full page reload */}
      <InboxList initialCaptures={captures ?? []} />
    </div>
  );
}
