// app/dashboard/habits/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateHabitForm } from '@/components/dashboard/create-habit-form';
import { HabitList } from '@/components/dashboard/habit-list';
import { HabitsMobileView } from '@/components/dashboard/habits-mobile-view';

export default async function HabitsPage() {
  // Server Component: fetch initial habits list on the server.
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

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
    return (
      <div className="text-red-600">Failed to load habits: {habitsError.message}</div>
    );
  }

  // Fetch today's logs for these habits
  const habitIds = habits?.map((h) => h.id) ?? [];
  const { data: logs, error: logsError } =
    habitIds.length > 0
      ? await supabase
          .from('habit_logs')
          .select('habit_id')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .in('habit_id', habitIds)
      : { data: null, error: null };

  if (logsError) {
    return (
      <div className="text-red-600">Failed to load habit logs: {logsError.message}</div>
    );
  }

  // Create a set of completed habit IDs for today
  const completedIds = new Set(logs?.map((log) => log.habit_id) ?? []);

  // Add done_today flag to each habit
  const habitsWithState = (habits ?? []).map((habit) => ({
    ...habit,
    done_today: completedIds.has(habit.id),
  }));

  const completedToday = habitsWithState.filter((h) => h.done_today).length;

  const habitForm = <CreateHabitForm />;
  const habitList = <HabitList initialHabits={habitsWithState} />;

  return (
    <>
      {/* Mobile View - hidden on md+ */}
      <div className="md:hidden">
        <HabitsMobileView
          totalHabits={habitsWithState.length}
          completedToday={completedToday}
        >
          {habitForm}
          {habitList}
        </HabitsMobileView>
      </div>

      {/* Desktop View - hidden on mobile */}
      <div className="hidden md:block bg-background text-foreground space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Habits</h1>

        {/* Create a habit */}
        {habitForm}

        {/* Client component: toggles done / deletes without reload */}
        {habitList}
      </div>
    </>
  );
}
