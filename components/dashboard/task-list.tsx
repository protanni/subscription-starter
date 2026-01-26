'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ListCard, MutedListCard } from '@/components/ui-kit/content-card';
import { ProtanniCheckbox } from '@/components/ui-kit/protanni-checkbox';
import { useTasksCategory } from '@/components/dashboard/tasks-category-context';

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  completed_at: string | null;
  area?: string | null;
};

/**
 * TaskList
 * - Open tasks in a card list; completed in a separate "COMPLETED" section.
 * - Client-side filtering by category (area).
 * - "All" shows all tasks including those with area NULL.
 * - Other tabs show only tasks with matching area (strict equality).
 */
export function TaskList({
  openTasks: initialOpen,
  completedTasks: initialCompleted,
}: {
  openTasks: Task[];
  completedTasks: Task[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { category, emptyMessage } = useTasksCategory();

  const [openTasks, setOpenTasks] = useState(initialOpen);
  const [completedTasks, setCompletedTasks] = useState(initialCompleted);

  useEffect(() => {
    setOpenTasks(initialOpen);
    setCompletedTasks(initialCompleted);
  }, [initialOpen, initialCompleted]);

  // Client-side filtering based on selected category
  const filteredOpenTasks = useMemo(() => {
    if (category === 'all') return openTasks;
    return openTasks.filter((t) => t.area === category);
  }, [openTasks, category]);

  const filteredCompletedTasks = useMemo(() => {
    if (category === 'all') return completedTasks;
    return completedTasks.filter((t) => t.area === category);
  }, [completedTasks, category]);

  async function toggle(taskId: string, currentlyDone: boolean) {
    const res = await fetch('/api/tasks/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    if (currentlyDone) {
      setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      setOpenTasks((prev) => prev.filter((t) => t.id !== taskId));
    }

    startTransition(() => router.refresh());
  }

  async function deleteTask(taskId: string) {
    const res = await fetch('/api/tasks/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    setOpenTasks((prev) => prev.filter((t) => t.id !== taskId));
    setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));
    startTransition(() => router.refresh());
  }

  const noOpen = filteredOpenTasks.length === 0;
  const noCompleted = filteredCompletedTasks.length === 0;

  return (
    <div className="space-y-6">
      {/* Open tasks (filtered) */}
      {noOpen ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">{emptyMessage}</p>
        </div>
      ) : (
        <ListCard>
          {filteredOpenTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              isDone={false}
              isPending={isPending}
              onToggle={() => toggle(t.id, false)}
              onDelete={() => deleteTask(t.id)}
            />
          ))}
        </ListCard>
      )}

      {/* COMPLETED section (filtered) */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
          COMPLETED
        </h3>

        {noCompleted ? (
          <div className="rounded-xl border border-border/50 bg-muted/30 py-8 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">No completed tasks yet.</p>
          </div>
        ) : (
          <MutedListCard className="shadow-sm">
            {filteredCompletedTasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                isDone
                isPending={isPending}
                onToggle={() => toggle(t.id, true)}
                onDelete={() => deleteTask(t.id)}
              />
            ))}
          </MutedListCard>
        )}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  isDone,
  isPending,
  onToggle,
  onDelete,
}: {
  task: Task;
  isDone: boolean;
  isPending: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={cn('flex items-center gap-3 p-4', isDone && 'text-muted-foreground')}>
      <ProtanniCheckbox checked={isDone} onChange={onToggle} disabled={isPending} />

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-medium truncate">{task.title}</span>

        {/* Optional label (requires tasks.area to be selected in queries) */}
        {task.area && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground shrink-0">
            {task.area[0].toUpperCase() + task.area.slice(1)}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-40 transition-colors"
        title="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
