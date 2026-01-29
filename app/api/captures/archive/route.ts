// app/api/captures/archive/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withApiHandler } from '@/lib/api/handler';
import { success, failure } from '@/lib/api/response';
import { ERROR_CODES, ERROR_STATUS } from '@/lib/api/errors';

export const POST = withApiHandler(async (req: Request) => {
  const supabase = createSupabaseServerClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return failure(
      ERROR_CODES.UNAUTHORIZED,
      'Unauthorized',
      ERROR_STATUS.UNAUTHORIZED
    );
  }

  const body = await req.json().catch(() => null);
  const { captureId } = (body ?? {}) as { captureId?: string };

  if (!captureId) {
    return failure(
      ERROR_CODES.VALIDATION_ERROR,
      'Missing captureId',
      ERROR_STATUS.VALIDATION_ERROR
    );
  }

  // 1) fetch capture
  const { data: capture, error: captureError } = await supabase
    .from('captures')
    .select('id,content,status')
    .eq('id', captureId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (captureError) {
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      captureError.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  if (!capture) {
    return failure(
      ERROR_CODES.NOT_FOUND,
      'Capture not found',
      ERROR_STATUS.NOT_FOUND
    );
  }

  if (capture.status !== 'inbox') {
    return failure(
      ERROR_CODES.VALIDATION_ERROR,
      'Capture must be inbox to convert',
      ERROR_STATUS.VALIDATION_ERROR
    );
  }

  // 2) create task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: capture.content.slice(0, 200),
      status: 'todo',
      priority: 'medium',
      is_deleted: false,
    })
    .select('id')
    .maybeSingle();

  if (taskError) {
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      taskError.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  if (!task?.id) {
    return failure(
      ERROR_CODES.SERVER_ERROR,
      'Task creation failed',
      ERROR_STATUS.SERVER_ERROR
    );
  }

  // 3) mark capture processed + link
  const { error: updateError } = await supabase
    .from('captures')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
      linked_task_id: task.id,
    })
    .eq('id', capture.id)
    .eq('user_id', user.id);

  if (updateError) {
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      updateError.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  return success({ taskId: task.id });
});
