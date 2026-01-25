// app/dashboard/tasks/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateTaskForm } from '@/components/dashboard/create-task-form';
import { TaskList } from '@/components/dashboard/task-list';
import { TasksMobileView } from '@/components/dashboard/tasks-mobile-view';
import { TasksCategoryProvider } from '@/components/dashboard/tasks-category-context';

export default async function TasksPage() {
  const supabase = createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: openTasks, error: openError } = await supabase
    .from('tasks')
    .select('id,title,status,priority,created_at,completed_at')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .eq('status', 'todo')
    .order('created_at', { ascending: false });

  const { data: completedTasks, error: completedError } = await supabase
    .from('tasks')
    .select('id,title,status,priority,created_at,completed_at')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .eq('status', 'done')
    .order('created_at', { ascending: false });

  if (openError || completedError) {
    return (
      <div className="text-red-600">
        Failed to load tasks: {openError?.message ?? completedError?.message}
      </div>
    );
  }

  const todoCount = openTasks?.length ?? 0;
  const doneCount = completedTasks?.length ?? 0;

  const taskForm = <CreateTaskForm />;
  const taskList = (
    <TaskList
      openTasks={openTasks ?? []}
      completedTasks={completedTasks ?? []}
    />
  );

  return (
    <TasksCategoryProvider>
      {/* Mobile View - hidden on md+ */}
      <div className="md:hidden">
        <TasksMobileView
          totalIncomplete={todoCount}
          totalCompleted={doneCount}
        >
          {taskForm}
          {taskList}
        </TasksMobileView>
      </div>

      {/* Desktop View - hidden on mobile */}
      <div className="hidden md:block bg-background min-h-screen text-foreground space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          {todoCount} open · {doneCount} completed
        </p>
        {taskForm}
        {taskList}
      </div>
    </TasksCategoryProvider>
  );
}
