import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/captures/restore
 * Restores an archived capture back to inbox (status: 'archived' -> 'inbox').
 */
export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const captureId = body?.captureId as string | undefined;

  if (!captureId) {
    return NextResponse.json({ error: 'captureId is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('captures')
    .update({ status: 'inbox', archived_at: null })
    .eq('id', captureId)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
