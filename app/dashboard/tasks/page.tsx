// app/dashboard/tasks/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CreateTaskForm } from '@/components/dashboard/create-task-form';
import { TaskList } from '@/components/dashboard/task-list';

export default async function TasksPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id,title,status,priority,created_at')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-600">Erro ao carregar tasks: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <CreateTaskForm />
      <TaskList initialTasks={tasks ?? []} />
    </div>
  );
}
