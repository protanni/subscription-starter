'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ListCard, MutedListCard } from '@/components/ui-kit/content-card';
import { ProtanniCheckbox } from '@/components/ui-kit/protanni-checkbox';
import {
  useTasksCategory,
  TASKS_CATEGORIES,
} from '@/components/dashboard/tasks-category-context';

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  completed_at: string | null;
};

/**
 * TaskList
 * - Category pills (visual only, no filtering).
 * - Open tasks in a card list; completed in a separate "COMPLETED" section.
 * - Round checkboxes; toggle done/undo and delete.
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
  const { category, setCategory, emptyMessage } = useTasksCategory();
  const [openTasks, setOpenTasks] = useState(initialOpen);
  const [completedTasks, setCompletedTasks] = useState(initialCompleted);

  useEffect(() => {
    setOpenTasks(initialOpen);
    setCompletedTasks(initialCompleted);
  }, [initialOpen, initialCompleted]);

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

  const noOpen = openTasks.length === 0;
  const noCompleted = completedTasks.length === 0;

  return (
    <div className="space-y-6">
      {/* Category pills – visual only, horizontally scrollable on mobile */}
      <div className="rounded-lg bg-muted/50 p-1.5 overflow-x-auto">
        <div className="flex gap-1 whitespace-nowrap">
          {TASKS_CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={cn(
                'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                category === value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground/80'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Open tasks */}
      {noOpen ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">{emptyMessage}</p>
        </div>
      ) : (
        <ListCard>
          {openTasks.map((t) => (
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

      {/* COMPLETED section */}
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
            {completedTasks.map((t) => (
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
    <div
      className={cn(
        'flex items-center gap-3 p-4',
        isDone && 'text-muted-foreground'
      )}
    >
      <ProtanniCheckbox
        checked={isDone}
        onChange={onToggle}
        disabled={isPending}
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">{task.title}</span>
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
