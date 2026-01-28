// app/api/mood/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types_db';

type MoodLevel = Database['public']['Enums']['mood_level'];

function isMoodLevel(value: unknown): value is MoodLevel {
  return (
    value === 'great' ||
    value === 'good' ||
    value === 'neutral' ||
    value === 'low' ||
    value === 'very_low'
  );
}

/**
 * Accepts:
 * - DB enums: "great" | "good" | "neutral" | "low" | "very_low"
 * - UI numbers: 1..5  (1=great ... 5=very_low)
 * - Some legacy aliases if needed (optional)
 */
function toMoodLevel(value: unknown): MoodLevel {
  // already correct
  if (isMoodLevel(value)) return value;

  // support numeric mood input (common in your UI)
  if (typeof value === 'number') {
    if (value === 1) return 'great';
    if (value === 2) return 'good';
    if (value === 3) return 'neutral';
    if (value === 4) return 'low';
    if (value === 5) return 'very_low';
  }

  // support numeric string
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return toMoodLevel(n);
    }

    // OPTIONAL: normalize a couple legacy strings if they exist
    // if (value === 'bad') return 'very_low';
    // if (value === 'okay') return 'neutral';
  }

  // fallback (safe default)
  return 'neutral';
}

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = userData.user;
  const body = await req.json();

  const checkin_date =
    typeof body?.checkin_date === 'string'
      ? body.checkin_date
      : new Date().toISOString().slice(0, 10);

  const mood = toMoodLevel(body?.mood);
  const note = typeof body?.note === 'string' ? body.note : null;

  const energy_level =
    typeof body?.energy_level === 'number' ? body.energy_level : null;

  const stress_level =
    typeof body?.stress_level === 'number' ? body.stress_level : null;

  const { data, error } = await supabase
    .from('mood_checkins')
    .upsert(
      {
        user_id: user.id,
        checkin_date,
        mood, // ✅ now typed as MoodLevel (DB enum)
        note,
        energy_level,
        stress_level,
      },
      { onConflict: 'user_id,checkin_date' }
    )
    .select('id,mood,note,checkin_date')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
