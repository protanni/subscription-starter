// app/api/captures/restore/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withApiHandler } from '@/lib/api/handler';
import { success, failure } from '@/lib/api/response';
import { ERROR_CODES, ERROR_STATUS } from '@/lib/api/errors';

/**
 * POST /api/captures/restore
 * Restores an archived capture back to inbox (status: 'archived' -> 'inbox').
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
  const captureId = body?.captureId as string | undefined;

  if (!captureId) {
    return failure(
      ERROR_CODES.VALIDATION_ERROR,
      'captureId is required',
      ERROR_STATUS.VALIDATION_ERROR
    );
  }

  const { error } = await supabase
    .from('captures')
    .update({ status: 'inbox', archived_at: null })
    .eq('id', captureId)
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
