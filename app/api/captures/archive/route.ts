// app/api/captures/convert-to-task/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient(); // ✅ aqui dentro

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { captureId } = body ?? {};

  if (!captureId) {
    return NextResponse.json({ error: 'Missing captureId' }, { status: 400 });
  }

  // 1) fetch capture
  const { data: capture, error: captureError } = await supabase
    .from('captures')
    .select('id,content,status')
    .eq('id', captureId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (captureError) {
    return NextResponse.json({ error: captureError.message }, { status: 400 });
  }

  if (!capture) {
    return NextResponse.json({ error: 'Capture not found' }, { status: 404 });
  }

  if (capture.status !== 'inbox') {
    return NextResponse.json({ error: 'Capture must be inbox to convert' }, { status: 400 });
  }

  // 2) create task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: capture.content.slice(0, 200),
      status: 'todo',
      priority: 'medium',
      is_deleted: false,
    })
    .select('id')
    .maybeSingle();

  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 400 });
  }

  if (!task?.id) {
    return NextResponse.json({ error: 'Task creation failed' }, { status: 500 });
  }

  // 3) mark capture processed + link
  const { error: updateError } = await supabase
    .from('captures')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      linked_task_id: task.id,
    })
    .eq('id', capture.id)
    .eq('user_id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, taskId: task.id });
}
