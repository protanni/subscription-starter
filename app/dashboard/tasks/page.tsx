// app/dashboard/tasks/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateTaskForm } from '@/components/dashboard/create-task-form';
import { TaskList } from '@/components/dashboard/task-list';

type ViewType = 'todo' | 'done';

export default async function TasksPage({
  searchParams
}: {
  searchParams: { view?: string };
}) {
  // Server Component: fetch initial tasks list on the server.
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  // Determine view: 'todo' (default) or 'done'
  const view: ViewType = searchParams.view === 'done' ? 'done' : 'todo';
  const statusFilter = view === 'done' ? 'done' : 'todo';

  // Fetch tasks based on the selected view
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id,title,status,priority,created_at,completed_at')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .eq('status', statusFilter)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-600">Failed to load tasks: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>

      {/* Create a task directly (bypassing inbox) */}
      {view === 'todo' && <CreateTaskForm />}

      {/* Client component: toggles done / deletes without reload */}
      <TaskList initialTasks={tasks ?? []} currentView={view} />
    </div>
  );
}
