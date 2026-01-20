import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/captures
 * Creates a new capture in the user's inbox.
 * Used by the Inbox "Quick Capture" form.
 */
export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const content = (body?.content ?? '').trim();
  const type = body?.type ?? 'note';

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('captures')
    .insert({ user_id: user.id, content, type, status: 'inbox' })
    .select('id,content,created_at,status,type')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ capture: data });
}
