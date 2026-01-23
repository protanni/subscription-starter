import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/habits
 * Creates a new habit for the current user.
 */
export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? '').trim();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: user.id,
      name,
      is_active: true,
    })
    .select('id,name,is_active,created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ habit: data });
}

/**
 * GET /api/habits
 * Lists all active habits for the current user with today's completion state.
 */
export async function GET(req: Request) {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get UTC date string (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  // Fetch active habits
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('id,name,is_active,created_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (habitsError) {
    return NextResponse.json({ error: habitsError.message }, { status: 400 });
  }

  if (!habits || habits.length === 0) {
    return NextResponse.json({ habits: [] });
  }

  // Fetch today's logs for these habits
  const habitIds = habits.map((h) => h.id);
  const { data: logs, error: logsError } = await supabase
    .from('habit_logs')
    .select('habit_id')
    .eq('user_id', user.id)
    .eq('log_date', today)
    .in('habit_id', habitIds);

  if (logsError) {
    return NextResponse.json({ error: logsError.message }, { status: 400 });
  }

  // Create a set of completed habit IDs for today
  const completedIds = new Set(logs?.map((log) => log.habit_id) ?? []);

  // Add done_today flag to each habit
  const habitsWithState = habits.map((habit) => ({
    ...habit,
    done_today: completedIds.has(habit.id),
  }));

  return NextResponse.json({ habits: habitsWithState });
}
