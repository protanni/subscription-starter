// app/api/mood/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types_db';
import { getUserTimezone } from '@/lib/profile/get-user-timezone';
import { getUserToday } from '@/lib/dates/timezone';

import { withApiHandler } from '@/lib/api/handler';
import { success, failure } from '@/lib/api/response';
import { ERROR_CODES, ERROR_STATUS } from '@/lib/api/errors';

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

export const POST = withApiHandler(async (req: Request) => {
  const supabase = createSupabaseServerClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return failure(
      ERROR_CODES.UNAUTHORIZED,
      'Unauthorized',
      ERROR_STATUS.UNAUTHORIZED
    );
  }

  const user = userData.user;
  const body = await req.json().catch(() => ({}));

  const timezone = await getUserTimezone(supabase);
  const today = getUserToday(timezone);

  const checkinDate =
    typeof (body as any).checkin_date === 'string' && (body as any).checkin_date.trim()
      ? (body as any).checkin_date.trim()
      : today;

  const mood = toMoodLevel((body as any)?.mood);
  const note = typeof (body as any)?.note === 'string' ? (body as any).note : null;

  const energy_level =
    typeof (body as any)?.energy_level === 'number' ? (body as any).energy_level : null;

  const stress_level =
    typeof (body as any)?.stress_level === 'number' ? (body as any).stress_level : null;

  const { data, error } = await supabase
    .from('mood_checkins')
    .upsert(
      {
        user_id: user.id,
        checkin_date: checkinDate,
        mood,
        note,
        energy_level,
        stress_level,
      },
      { onConflict: 'user_id,checkin_date' }
    )
    .select('id,mood,note,checkin_date')
    .maybeSingle();

  if (error) {
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      error.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  return success({ data });
});
