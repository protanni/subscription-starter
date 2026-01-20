import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/captures/archive
 * Archives a capture (removes from inbox) using a status flag.
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
    .update({ status: 'archived', archived_at: new Date().toISOString() })
    .eq('id', captureId)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
