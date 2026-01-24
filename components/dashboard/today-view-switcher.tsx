'use client';

import { useState, useEffect } from 'react';
import { TodayHabits } from '@/components/dashboard/today-habits';
import { MoodCheckin } from '@/components/dashboard/mood-checkin';
import { TodayMobileView } from '@/components/dashboard/today-mobile-view';

type Summary = {
  tasks_due_today?: number;
  habits_logged_today?: number;
  mood_today?: string;
  events_today?: number;
} | null;

type OpenTask = { id: string; title: string; status: string };
type HabitWithState = { id: string; name: string; done_today: boolean };
type MoodCheckinRow = { id: string; mood: number; note: string | null; checkin_date: string } | null;
type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
};

type DailyFocus = { text: string | null; updatedAt: string | null };

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(true);
  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const listener = () => setMatches(m.matches);
    m.addEventListener('change', listener);
    return () => m.removeEventListener('change', listener);
  }, [query]);
  return matches;
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{String(value)}</div>
    </div>
  );
}

function formatEventTime(e: {
  all_day: boolean;
  starts_at: string;
  ends_at: string | null;
}) {
  if (e.all_day) return 'All day';
  const start = new Date(e.starts_at);
  const end = e.ends_at ? new Date(e.ends_at) : null;
  const fmt = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return end ? `${fmt(start)} → ${fmt(end)}` : fmt(start);
}

function TodayDesktopView({
  summary,
  openTasks,
  events,
  habitsWithState,
  moodCheckin,
}: {
  summary: Summary;
  openTasks: OpenTask[];
  events: EventRow[];
  habitsWithState: HabitWithState[];
  moodCheckin: MoodCheckinRow;
}) {
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
        <h2 className="text-lg font-semibold">Open Tasks</h2>
        {!openTasks.length ? (
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

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Habits</h2>
        <TodayHabits initialHabits={habitsWithState} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Mood</h2>
        <MoodCheckin initialCheckin={moodCheckin} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Events</h2>
        {!events.length ? (
          <div className="text-sm text-muted-foreground">No events today.</div>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="rounded-md border p-3">
                <div className="font-medium">{e.title}</div>
                <div className="text-sm text-muted-foreground">{formatEventTime(e)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function TodayViewSwitcher({
  summary,
  openTasks,
  events,
  habitsWithState,
  moodCheckin,
  dailyFocus,
}: {
  summary: Summary;
  openTasks: OpenTask[];
  events: EventRow[];
  habitsWithState: HabitWithState[];
  moodCheckin: MoodCheckinRow;
  dailyFocus: DailyFocus;
}) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile) {
    return (
      <TodayMobileView
        openTasks={openTasks}
        habitsWithState={habitsWithState}
        moodCheckin={moodCheckin}
        dailyFocus={dailyFocus}
      />
    );
  }

  return (
    <TodayDesktopView
      summary={summary}
      openTasks={openTasks}
      events={events}
      habitsWithState={habitsWithState}
      moodCheckin={moodCheckin}
    />
  );
}
