import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// TODO: Use user timezone from profile to avoid day drift for global users.
const today = new Date().toISOString().slice(0, 10);
/**
 * GET /api/mood
 * Gets today's mood check-in for the current user.
 */
export async function GET(_req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Use user timezone from profile to avoid day drift for global users.
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

const MOOD_VALID: readonly string[] = [
  'great',
  'good',
  'neutral',
  'low',
  'bad',
];

/**
 * POST /api/mood
 * Upserts today's mood check-in for the current user.
 * Body: { mood: 'great'|'good'|'neutral'|'low'|'bad', note?: string }
 */
export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const moodRaw = body?.mood;
  const noteRaw = body?.note;

  const mood =
    typeof moodRaw === 'string' && MOOD_VALID.includes(moodRaw) ? moodRaw : null;
  const note = typeof noteRaw === 'string' ? noteRaw : undefined;

  if (!mood) {
    return NextResponse.json(
      { error: "Mood must be one of: 'great', 'good', 'neutral', 'low', 'bad'" },
      { status: 400 }
    );
  }

  // TODO: Use user timezone from profile to avoid day drift for global users.
const today = new Date().toISOString().slice(0, 10);

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
