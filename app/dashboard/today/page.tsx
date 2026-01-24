// app/dashboard/today/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { TodayViewSwitcher } from '@/components/dashboard/today-view-switcher';

export default async function TodayPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);

  const { data: summary } = await supabase
    .from('v_today_summary')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: openTasks } = await supabase
    .from('tasks')
    .select('id,title,status')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .eq('status', 'todo')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: habits } = await supabase
    .from('habits')
    .select('id,name,is_active,created_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const habitIds = habits?.map((h) => h.id) ?? [];
  const { data: logs } =
    habitIds.length > 0
      ? await supabase
          .from('habit_logs')
          .select('habit_id,log_date')
          .eq('log_date', today)
          .in('habit_id', habitIds)
      : { data: null };

  const completedIds = new Set(logs?.map((log) => log.habit_id) ?? []);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const { data: weeklyLogs } =
    habitIds.length > 0
      ? await supabase
          .from('habit_logs')
          .select('habit_id,log_date')
          .gte('log_date', weekStartStr)
          .lte('log_date', today)
          .in('habit_id', habitIds)
      : { data: null };

  const completedByHabit = new Map<string, string[]>();
  for (const log of weeklyLogs ?? []) {
    const arr = completedByHabit.get(log.habit_id) ?? [];
    arr.push(log.log_date);
    completedByHabit.set(log.habit_id, arr);
  }

  const habitsWithState = (habits ?? []).map((habit) => ({
    id: habit.id,
    name: habit.name,
    done_today: completedIds.has(habit.id),
    completedDates: completedByHabit.get(habit.id) ?? [],
  }));

  const { data: moodCheckin } = await supabase
    .from('mood_checkins')
    .select('id,mood,note,checkin_date')
    .eq('user_id', user.id)
    .eq('checkin_date', today)
    .maybeSingle();

  const { data: events } = await supabase
    .from('calendar_events')
    .select('id,title,starts_at,ends_at,all_day')
    .eq('user_id', user.id)
    .gte('starts_at', `${today}T00:00:00.000Z`)
    .lt('starts_at', `${today}T23:59:59.999Z`)
    .order('starts_at', { ascending: true });

  const { data: profile } = await supabase
    .from('profiles')
    .select('daily_focus_text,daily_focus_updated_at')
    .eq('id', user.id)
    .maybeSingle();

  const dailyFocus = {
    text: profile?.daily_focus_text ?? null,
    updatedAt: profile?.daily_focus_updated_at ?? null,
  };

  return (
    <TodayViewSwitcher
      summary={summary}
      openTasks={openTasks ?? []}
      events={events ?? []}
      habitsWithState={habitsWithState}
      moodCheckin={moodCheckin}
      dailyFocus={dailyFocus}
    />
  );
}
