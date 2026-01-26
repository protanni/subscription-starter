import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/tasks
 * Creates a new task for the current user.
 * Used by the Tasks "Quick Add" form.
 */
export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  const title = (body?.title ?? '').trim();

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  // Parse area safely: accept string | null | undefined
  const raw = body?.area;
  const areaRaw = typeof raw === 'string' ? raw.trim().toLowerCase() : null;
  const normalizedArea =
    areaRaw && ['work', 'personal', 'mind', 'body'].includes(areaRaw)
      ? areaRaw
      : null;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title,
      status: 'todo',
      priority: 'medium',
      is_deleted: false,
      area: normalizedArea,
    })
    .select('id,title,status,priority,created_at,completed_at,area')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ task: data });
}
