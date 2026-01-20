import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/captures/convert-to-task
 * Converts an inbox capture into a task and marks the capture as processed.
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

  const { data: capture, error: captureError } = await supabase
    .from('captures')
    .select('id,content,status')
    .eq('id', captureId)
    .eq('user_id', user.id)
    .single();

  if (captureError || !capture) {
    return NextResponse.json(
      { error: captureError?.message ?? 'Capture not found' },
      { status: 404 }
    );
  }

  if (capture.status !== 'inbox') {
    return NextResponse.json({ error: 'Only inbox captures can be converted' }, { status: 400 });
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: capture.content.slice(0, 200),
      status: 'todo',
      priority: 'medium',
    })
    .select('id,title,status,priority,created_at,completed_at')
    .single();

  if (taskError) return NextResponse.json({ error: taskError.message }, { status: 400 });

  const { error: updateError } = await supabase
    .from('captures')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      linked_task_id: task.id,
    })
    .eq('id', captureId)
    .eq('user_id', user.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ ok: true, task });
}
