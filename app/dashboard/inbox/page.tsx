// app/dashboard/inbox/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateCaptureForm } from '@/components/dashboard/create-capture-form';
import { InboxList } from '@/components/dashboard/inbox-list';

export default async function InboxPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: captures, error } = await supabase
    .from('captures')
    .select('id,content,created_at,status,type')
    .eq('user_id', user.id)
    .eq('status', 'inbox')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-600">Erro ao carregar inbox: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <CreateCaptureForm />
      <InboxList initialCaptures={captures ?? []} />
    </div>
  );
}
