// app/api/captures/convert-to-task/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types_db';

type CaptureStatus = Database['public']['Enums']['capture_status'];
type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient(); // ✅ SEMPRE dentro do handler

  // 1) Auth
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 401 });
  }
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Body
  const body = await req.json().catch(() => null);
  const captureId = body?.captureId as string | undefined;

  if (!captureId) {
    return NextResponse.json({ error: 'captureId is required' }, { status: 400 });
  }

  // 3) Load capture (must belong to user)
  const { data: capture, error: captureError } = await supabase
    .from('captures')
    .select('id,user_id,content,status,linked_task_id')
    .eq('id', captureId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (captureError) {
    return NextResponse.json({ error: captureError.message }, { status: 400 });
  }

  if (!capture) {
    return NextResponse.json({ error: 'Capture not found' }, { status: 404 });
  }

  if (capture.status !== ('inbox' as CaptureStatus)) {
    return NextResponse.json(
      { error: `Capture status must be inbox (current: ${capture.status})` },
      { status: 400 }
    );
  }

  // 4) Create task
  // Ajuste aqui se seus enums forem diferentes (ex: 'normal' ao invés de 'medium')
  const defaultStatus = 'todo' as TaskStatus;
  const defaultPriority = 'medium' as TaskPriority;

  const title = (capture.content ?? '').trim().slice(0, 200);
  if (!title) {
    return NextResponse.json({ error: 'Capture content is empty' }, { status: 400 });
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title,
      status: defaultStatus,
      priority: defaultPriority,
      is_deleted: false,
    })
    .select('id,title,status,priority,created_at')
    .single();

  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 400 });
  }

  // 5) Mark capture processed + link task
  const { error: updateError } = await supabase
    .from('captures')
    .update({
      status: 'processed' as CaptureStatus,
      processed_at: new Date().toISOString(),
      linked_task_id: task.id,
    })
    .eq('id', capture.id)
    .eq('user_id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, task });
}
