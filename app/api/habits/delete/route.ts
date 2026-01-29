// app/api/habits/delete/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withApiHandler } from '@/lib/api/handler';
import { success, failure } from '@/lib/api/response';
import { ERROR_CODES, ERROR_STATUS } from '@/lib/api/errors';

/**
 * POST /api/habits/delete
 * Soft-deletes a habit by setting is_active = false.
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

  const { error } = await supabase
    .from('habits')
    .update({ is_active: false })
    .eq('id', habitId)
    .eq('user_id', user.id);

  if (error) {
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      error.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  return success({ ok: true });
});
