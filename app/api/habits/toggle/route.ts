// app/api/habits/toggle/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUserTimezone } from '@/lib/profile/get-user-timezone';
import { getUserToday } from '@/lib/dates/timezone';
import { withApiHandler } from '@/lib/api/handler';
import { success, failure } from '@/lib/api/response';
import { ERROR_CODES, ERROR_STATUS } from '@/lib/api/errors';

/**
 * POST /api/habits/toggle
 * Toggles habit completion for today.
 * If log exists today → delete it (undo).
 * If no log exists → create it (mark done).
 */
export const POST = withApiHandler(async (req: Request) => {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return failure(
      ERROR_CODES.UNAUTHORIZED,
      'Unauthorized',
      ERROR_STATUS.UNAUTHORIZED
    );
  }

  const body = await req.json().catch(() => null);
  const habitId = body?.habitId as string | undefined;

  if (!habitId) {
    return failure(
      ERROR_CODES.VALIDATION_ERROR,
      'habitId is required',
      ERROR_STATUS.VALIDATION_ERROR
    );
  }

  // Verify habit belongs to user
  const { data: habit, error: habitError } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habitId)
    .eq('user_id', user.id)
    .single();

  if (habitError || !habit) {
    return failure(
      ERROR_CODES.NOT_FOUND,
      habitError?.message ?? 'Habit not found',
      ERROR_STATUS.NOT_FOUND
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
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      checkError.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  if (existingLog) {
    // Delete log (undo)
    const { error: deleteError } = await supabase
      .from('habit_logs')
      .delete()
      .eq('id', existingLog.id)
      .eq('user_id', user.id);

    if (deleteError) {
      return failure(
        ERROR_CODES.SUPABASE_ERROR,
        deleteError.message,
        ERROR_STATUS.SUPABASE_ERROR
      );
    }

    return success({ done: false });
  }

  // Create log (mark done)
  const { error: insertError } = await supabase.from('habit_logs').insert({
    habit_id: habitId,
    user_id: user.id,
    log_date: today,
  });

  if (insertError) {
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      insertError.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  return success({ done: true });
});
