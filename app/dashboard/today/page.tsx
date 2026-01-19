// app/dashboard/today/page.tsx
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export default async function TodayPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return null;

  // v_today_summary existe no seu SQL :contentReference[oaicite:5]{index=5}
  const { data: summary } = await supabase
    .from('v_today_summary')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

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
          <div className="text-sm text-muted-foreground">Nenhum evento hoje.</div>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="rounded-md border p-3">
                <div className="font-medium">{e.title}</div>
                <div className="text-sm text-muted-foreground">
                  {e.all_day ? 'Dia todo' : `${e.starts_at}${e.ends_at ? ` → ${e.ends_at}` : ''}`}
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
