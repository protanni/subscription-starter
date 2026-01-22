// app/dashboard/inbox/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateCaptureForm } from '@/components/dashboard/create-capture-form';
import { InboxList } from '@/components/dashboard/inbox-list';

type ViewType = 'inbox' | 'archived';

export default async function InboxPage({
  searchParams
}: {
  searchParams: { view?: string };
}) {
  // Server Component: fetches initial data on the server for fast first paint + SEO-safe rendering.
  const supabase = createSupabaseServerClient();

  // We rely on Supabase Auth session cookies (SSR) to identify the current user.
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // If no user session, return null. (In production, prefer redirect via middleware/dashboard layout guard.)
  if (!user) return null;

  // Determine view: 'inbox' (default) or 'archived'
  const view: ViewType = searchParams.view === 'archived' ? 'archived' : 'inbox';
  const statusFilter = view === 'archived' ? 'archived' : 'inbox';

  // Load captures based on the selected view
  const { data: captures, error } = await supabase
    .from('captures')
    .select('id,content,created_at,status,type')
    .eq('user_id', user.id)
    .eq('status', statusFilter)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-red-600">
        Failed to load {view}: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inbox</h1>

      {/* Quick Capture: the fastest way to get items out of your head and into the system */}
      {view === 'inbox' && <CreateCaptureForm />}

      {/* Client component: handles actions (archive/convert/restore) without full page reload */}
      <InboxList initialCaptures={captures ?? []} currentView={view} />
    </div>
  );
}
