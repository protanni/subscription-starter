import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/tasks/toggle
 * Toggles todo <-> done, and sets completed_at for analytics.
 */
export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const taskId = body?.taskId as string | undefined;

  if (!taskId) return NextResponse.json({ error: 'taskId is required' }, { status: 400 });

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id,status')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single();

  if (taskError || !task) {
    return NextResponse.json(
      { error: taskError?.message ?? 'Task not found' },
      { status: 404 }
    );
  }

  const isDone = task.status === 'done';
  const nextStatus = isDone ? 'todo' : 'done';

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: nextStatus,
      completed_at: isDone ? null : new Date().toISOString(),
    })
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ ok: true, status: nextStatus });
}
