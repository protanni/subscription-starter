import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/mood
 * Gets today's mood check-in for the current user.
 */
export async function GET(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get UTC date string (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  const { data: checkin, error } = await supabase
    .from('mood_checkins')
    .select('id,mood,note,checkin_date')
    .eq('user_id', user.id)
    .eq('checkin_date', today)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ checkin: checkin ?? null });
}

/**
 * POST /api/mood
 * Upserts today's mood check-in for the current user.
 */
export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const mood = body?.mood as number | undefined;
  const note = body?.note as string | undefined;

  if (!mood || mood < 1 || mood > 5) {
    return NextResponse.json(
      { error: 'Mood must be an integer between 1 and 5' },
      { status: 400 }
    );
  }

  // Get UTC date string (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  // Upsert mood check-in
  const { data, error } = await supabase
    .from('mood_checkins')
    .upsert(
      {
        user_id: user.id,
        checkin_date: today,
        mood,
        note: note?.trim() || null,
      },
      {
        onConflict: 'user_id,checkin_date',
      }
    )
    .select('id,mood,note,checkin_date')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ checkin: data });
}
