// app/api/tasks/delete/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withApiHandler } from '@/lib/api/handler';
import { success, failure } from '@/lib/api/response';
import { ERROR_CODES, ERROR_STATUS } from '@/lib/api/errors';

/**
 * POST /api/tasks/delete
 * Soft-deletes a task by setting is_deleted = true.
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
  const taskId = body?.taskId as string | undefined;

  if (!taskId) {
    return failure(
      ERROR_CODES.VALIDATION_ERROR,
      'taskId is required',
      ERROR_STATUS.VALIDATION_ERROR
    );
  }

  const { error } = await supabase
    .from('tasks')
    .update({ is_deleted: true })
    .eq('id', taskId)
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
