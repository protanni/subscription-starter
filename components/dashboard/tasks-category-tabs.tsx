'use client';

import { cn } from '@/utils/cn';
import {
  TASKS_CATEGORIES,
  useTasksCategory,
  type TasksCategory,
} from '@/components/dashboard/tasks-category-context';

export function TasksCategoryTabs({ className }: { className?: string }) {
  const { category, setCategory } = useTasksCategory();

  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1',
        className
      )}
    >
      {TASKS_CATEGORIES.map((c) => {
        const active = c.value === category;

        return (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value as TasksCategory)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              active
                ? 'bg-[hsl(var(--nav-background))] border-border/60 text-foreground'
                : 'bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
            aria-pressed={active}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
