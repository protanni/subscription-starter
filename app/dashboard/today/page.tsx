// app/dashboard/today/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function TodayPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return null;

  // View `v_today_summary` is expected to exist in your DB.
  // It aggregates today's key KPIs (tasks due, habits logged, mood, events count).
  const { data: summary } = await supabase
    .from('v_today_summary')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // NOTE: This uses UTC boundaries. If you want user-local day boundaries later,
  // store user's timezone in `profiles.locale/timezone` and compute ranges accordingly.
  const today = new Date().toISOString().slice(0, 10);

  const { data: events } = await supabase
    .from('calendar_events')
    .select('id,title,starts_at,ends_at,all_day')
    .eq('user_id', user.id)
    .gte('starts_at', `${today}T00:00:00.000Z`)
    .lt('starts_at', `${today}T23:59:59.999Z`)
    .order('starts_at', { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Today</h1>

      <section className="grid gap-3 md:grid-cols-4">
        <StatCard title="Tasks due today" value={summary?.tasks_due_today ?? 0} />
        <StatCard title="Habits logged" value={summary?.habits_logged_today ?? 0} />
        <StatCard title="Mood" value={summary?.mood_today ?? '—'} />
        <StatCard title="Events" value={summary?.events_today ?? 0} />
      </section>

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
