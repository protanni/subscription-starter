// components/dashboard/task-list.tsx
'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ListCard, MutedListCard } from '@/components/ui-kit/content-card';
import { ProtanniCheckbox } from '@/components/ui-kit/protanni-checkbox';
import { useTasksCategory } from '@/components/dashboard/tasks-category-context';
import { apiFetch } from '@/lib/api/clients';

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
  const [, startTransition] = useTransition();
  const { category, emptyMessage } = useTasksCategory();

  // Mount-only init to avoid refresh/props overwriting optimistic/local state mid-mutation.
  const [openTasks, setOpenTasks] = useState(() => initialOpen);
  const [completedTasks, setCompletedTasks] = useState(() => initialCompleted);

  // Pending lock per task id (prevents duplicate mutations per item).
  const [pendingById, setPendingById] = useState<Record<string, true>>({});

  // "Latest wins" sequence per task id (guards against out-of-order responses).
  const seqByIdRef = useRef<Record<string, number>>({});

  const isTaskPending = (taskId: string) => pendingById[taskId] === true;

  const lock = (taskId: string) => {
    setPendingById((prev) => (prev[taskId] ? prev : { ...prev, [taskId]: true }));
  };

  const unlock = (taskId: string) => {
    setPendingById((prev) => {
      if (!prev[taskId]) return prev;
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const nextSeq = (taskId: string) => {
    const curr = seqByIdRef.current[taskId] ?? 0;
    const next = curr + 1;
    seqByIdRef.current[taskId] = next;
    return next;
  };

  const isLatest = (taskId: string, seq: number) => (seqByIdRef.current[taskId] ?? 0) === seq;

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
    if (isTaskPending(taskId)) return;

    const seq = nextSeq(taskId);
    lock(taskId);

    try {
      await apiFetch<{ status: string }>('/api/tasks/toggle', {
        method: 'POST',
        body: JSON.stringify({ taskId }),
      });

      // If a newer mutation happened, ignore this response.
      if (!isLatest(taskId, seq)) return;

      // Update local state to match expected server result.
      if (currentlyDone) {
        setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        setOpenTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error('Toggle task failed', err);
      return;
    } finally {
      unlock(taskId);
      startTransition(() => router.refresh());
    }
  }

  async function deleteTask(taskId: string) {
    if (isTaskPending(taskId)) return;

    const seq = nextSeq(taskId);
    lock(taskId);

    try {
      await apiFetch<{ ok: true }>('/api/tasks/delete', {
        method: 'POST',
        body: JSON.stringify({ taskId }),
      });

      if (!isLatest(taskId, seq)) return;

      setOpenTasks((prev) => prev.filter((t) => t.id !== taskId));
      setCompletedTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Delete task failed', err);
      return;
    } finally {
      unlock(taskId);
      startTransition(() => router.refresh());
    }
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
              isPending={isTaskPending(t.id)}
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
                isPending={isTaskPending(t.id)}
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
        isDone && 'text-muted-foreground',
        isPending && 'opacity-60'
      )}
      aria-busy={isPending}
    >
      <ProtanniCheckbox checked={isDone} onChange={onToggle} disabled={isPending} />

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-medium truncate">{task.title}</span>

        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}

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
