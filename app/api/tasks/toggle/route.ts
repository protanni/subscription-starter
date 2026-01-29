// app/api/tasks/toggle/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withApiHandler } from '@/lib/api/handler';
import { success, failure } from '@/lib/api/response';
import { ERROR_CODES, ERROR_STATUS } from '@/lib/api/errors';

/**
 * POST /api/tasks/toggle
 * Toggles todo <-> done, and sets completed_at for analytics.
 */
export const POST = withApiHandler(async (req: Request) => {
  // If your withApiHandler doesn't pass req, change wrapper later (NOT NOW).
  // For now, keep the signature consistent with how you call it.
  // We'll assume you want the standard Next route signature:
  // export const POST = withApiHandler(async (req: Request) => { ... })

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

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id,status')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single();

  if (taskError || !task) {
    return failure(
      ERROR_CODES.NOT_FOUND,
      taskError?.message ?? 'Task not found',
      ERROR_STATUS.NOT_FOUND
    );
  }

  const isDone = task.status === 'done';
  const nextStatus = isDone ? 'todo' : 'done';

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: nextStatus,
      completed_at: isDone ? null : new Date().toISOString(),
    })
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (updateError) {
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      updateError.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  return success({ status: nextStatus });
});
