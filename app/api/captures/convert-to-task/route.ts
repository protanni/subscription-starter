// app/api/captures/convert-to-task/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const captureId = body?.captureId as string | undefined;

  if (!captureId) {
    return NextResponse.json({ error: 'captureId is required' }, { status: 400 });
  }

  const { data: task, error } = await supabase.rpc(
    'convert_capture_to_task',
    {
      p_capture_id: captureId,
      p_user_id: user.id,
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ task });
}
