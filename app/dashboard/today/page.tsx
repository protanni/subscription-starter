// app/dashboard/today/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { TodayHabits } from '@/components/dashboard/today-habits';
import { MoodCheckin } from '@/components/dashboard/mood-checkin';
import { TodayMobileView } from '@/components/dashboard/today-mobile-view';

export default async function TodayPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return null;

  // Get UTC date string (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  // View `v_today_summary` is expected to exist in your DB.
  // It aggregates today's key KPIs (tasks due, habits logged, mood, events count).
  const { data: summary } = await supabase
    .from('v_today_summary')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Fetch open tasks (status = 'todo')
  const { data: openTasks } = await supabase
    .from('tasks')
    .select('id,title,status')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .eq('status', 'todo')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch active habits with today's completion state
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
          .select('habit_id')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .in('habit_id', habitIds)
      : { data: null };

  const completedIds = new Set(logs?.map((log) => log.habit_id) ?? []);
  const habitsWithState = (habits ?? []).map((habit) => ({
    id: habit.id,
    name: habit.name,
    done_today: completedIds.has(habit.id),
  }));

  // Fetch today's mood check-in
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

  // Shared components for habits and mood
  const habitsSection = (
    <section className="space-y-2 md:space-y-3">
      <h2 className="text-lg font-semibold md:block hidden">Habits</h2>
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Today’s Habits</h2>
        </div>
      </div>
      <TodayHabits initialHabits={habitsWithState} />
    </section>
  );

  const moodSection = (
    <section className="space-y-2 md:space-y-3">
      <h2 className="text-lg font-semibold md:block hidden">Mood</h2>
      <div className="md:hidden">
        <div className="space-y-1 mb-3">
          <h2 className="text-sm font-medium text-foreground">How are you feeling?</h2>
          <p className="text-xs text-muted-foreground">Emotional signal for today</p>
        </div>
      </div>
      <MoodCheckin initialCheckin={moodCheckin} />
    </section>
  );

  return (
    <>
      {/* Mobile View - hidden on md+ */}
      <div className="md:hidden">
        <TodayMobileView
          greeting=""
          dateString=""
          summary={summary}
          openTasks={openTasks ?? []}
          events={events ?? []}
        >
          {habitsSection}
          {moodSection}
        </TodayMobileView>
      </div>

      {/* Desktop View - hidden on mobile */}
      <div className="hidden md:block space-y-6">
        <h1 className="text-2xl font-semibold">Today</h1>

        <section className="grid gap-3 md:grid-cols-4">
          <StatCard title="Tasks due today" value={summary?.tasks_due_today ?? 0} />
          <StatCard title="Habits logged" value={summary?.habits_logged_today ?? 0} />
          <StatCard title="Mood" value={summary?.mood_today ?? '—'} />
          <StatCard title="Events" value={summary?.events_today ?? 0} />
        </section>

        {/* Open Tasks */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Open Tasks</h2>
          {!openTasks?.length ? (
            <div className="text-sm text-muted-foreground">No open tasks.</div>
          ) : (
            <ul className="space-y-1">
              {openTasks.map((task) => (
                <li key={task.id} className="rounded-md border p-3">
                  <div className="font-medium">{task.title}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Habits for Today */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Habits</h2>
          <TodayHabits initialHabits={habitsWithState} />
        </section>

        {/* Mood Check-in */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Mood</h2>
          <MoodCheckin initialCheckin={moodCheckin} />
        </section>

        {/* Events */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Events</h2>
          {!events?.length ? (
            <div className="text-sm text-muted-foreground">No events today.</div>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className="rounded-md border p-3">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatEventTime(e)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{String(value)}</div>
    </div>
  );
}

function formatEventTime(e: { all_day: boolean; starts_at: string; ends_at: string | null }) {
  // Avoid showing raw ISO strings in the UI.
  if (e.all_day) return 'All day';

  const start = new Date(e.starts_at);
  const end = e.ends_at ? new Date(e.ends_at) : null;

  const fmt = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return end ? `${fmt(start)} → ${fmt(end)}` : fmt(start);
}
