// app/api/captures/convert-to-task/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withApiHandler } from '@/lib/api/handler';
import { success, failure } from '@/lib/api/response';
import { ERROR_CODES, ERROR_STATUS } from '@/lib/api/errors';

export const POST = withApiHandler(async (req: Request) => {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
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

  const { data: task, error } = await supabase.rpc('convert_capture_to_task', {
    p_capture_id: captureId,
    p_user_id: user.id,
  });

  if (error) {
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      error.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  return success({ task });
});
