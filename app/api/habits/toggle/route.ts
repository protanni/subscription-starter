import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserTimezone } from '@/lib/profile/get-user-timezone';
import { getUserToday } from '@/lib/dates/timezone';

/**
 * POST /api/habits/toggle
 * Toggles habit completion for today.
 * If log exists today → delete it (undo).
 * If no log exists → create it (mark done).
 */
export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const habitId = body?.habitId as string | undefined;

  if (!habitId) {
    return NextResponse.json({ error: 'habitId is required' }, { status: 400 });
  }

  // Verify habit belongs to user
  const { data: habit, error: habitError } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habitId)
    .eq('user_id', user.id)
    .single();

  if (habitError || !habit) {
    return NextResponse.json(
      { error: habitError?.message ?? 'Habit not found' },
      { status: 404 }
    );
  }

  const timezone = await getUserTimezone(supabase);
  const today = getUserToday(timezone);  

  // Check if log exists for today
  const { data: existingLog, error: checkError } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('user_id', user.id)
    .eq('log_date', today)
    .maybeSingle();

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 400 });
  }

  if (existingLog) {
    // Delete log (undo)
    const { error: deleteError } = await supabase
      .from('habit_logs')
      .delete()
      .eq('id', existingLog.id)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, done: false });
  } else {
    // Create log (mark done)
    const { error: insertError } = await supabase.from('habit_logs').insert({
      habit_id: habitId,
      user_id: user.id,
      log_date: today,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, done: true });
  }
}
