// app/api/tasks/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { withApiHandler } from '@/lib/api/handler';
import { success, failure } from '@/lib/api/response';
import { ERROR_CODES, ERROR_STATUS } from '@/lib/api/errors';

/**
 * POST /api/tasks
 * Creates a new task for the current user.
 * Used by the Tasks "Quick Add" form.
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

  const title = (body?.title ?? '').trim();

  if (!title) {
    return failure(
      ERROR_CODES.VALIDATION_ERROR,
      'Title is required',
      ERROR_STATUS.VALIDATION_ERROR
    );
  }

  // Parse area safely: accept string | null | undefined
  const raw = body?.area;
  const areaRaw = typeof raw === 'string' ? raw.trim().toLowerCase() : null;
  const normalizedArea =
    areaRaw && ['work', 'personal', 'mind', 'body'].includes(areaRaw)
      ? areaRaw
      : null;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title,
      status: 'todo',
      priority: 'medium',
      is_deleted: false,
      area: normalizedArea,
    })
    .select('id,title,status,priority,created_at,completed_at,area')
    .single();

  if (error) {
    return failure(
      ERROR_CODES.SUPABASE_ERROR,
      error.message,
      ERROR_STATUS.SUPABASE_ERROR
    );
  }

  // Preserve previous payload shape, now wrapped in success contract
  return success({ task: data }, 201);
});
