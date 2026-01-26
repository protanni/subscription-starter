'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export type TasksCategory = 'all' | 'work' | 'personal' | 'mind' | 'body';

const VALID_CATEGORIES: TasksCategory[] = ['all', 'work', 'personal', 'mind', 'body'];

export const TASKS_CATEGORIES: { value: TasksCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'mind', label: 'Mind' },
  { value: 'body', label: 'Body' },
];

const PLACEHOLDER_MAP: Record<TasksCategory, string> = {
  all: 'Add a task…',
  work: 'Add a work task…',
  personal: 'Add a personal task…',
  mind: 'Add a mind task…',
  body: 'Add a body task…',
};

const EMPTY_MESSAGE_MAP: Record<TasksCategory, string> = {
  all: 'No tasks yet.',
  work: 'No work tasks yet.',
  personal: 'No personal tasks yet.',
  mind: 'No mind tasks yet.',
  body: 'No body tasks yet.',
};

type TasksCategoryContextValue = {
  category: TasksCategory;
  setCategory: (c: TasksCategory) => void;
  placeholder: string;
  emptyMessage: string;
};

const TasksCategoryContext = createContext<TasksCategoryContextValue | null>(null);

function parseCategory(value: string | null): TasksCategory {
  if (value && VALID_CATEGORIES.includes(value as TasksCategory)) {
    return value as TasksCategory;
  }
  return 'all';
}

export function TasksCategoryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize from URL param
  const [category, setCategoryState] = useState<TasksCategory>(() =>
    parseCategory(searchParams.get('area'))
  );

  // Sync URL when category changes
  const setCategory = useCallback(
    (c: TasksCategory) => {
      setCategoryState(c);

      const params = new URLSearchParams(searchParams.toString());
      if (c === 'all') {
        params.delete('area');
      } else {
        params.set('area', c);
      }

      const query = params.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [router, searchParams, pathname]
  );

  // Sync state if URL changes externally (e.g., back/forward)
  useEffect(() => {
    const urlCategory = parseCategory(searchParams.get('area'));
    if (urlCategory !== category) {
      setCategoryState(urlCategory);
    }
  }, [searchParams, category]);

  const value: TasksCategoryContextValue = {
    category,
    setCategory,
    placeholder: PLACEHOLDER_MAP[category],
    emptyMessage: EMPTY_MESSAGE_MAP[category],
  };

  return (
    <TasksCategoryContext.Provider value={value}>
      {children}
    </TasksCategoryContext.Provider>
  );
}

export function useTasksCategory(): TasksCategoryContextValue {
  const ctx = useContext(TasksCategoryContext);
  if (!ctx) throw new Error('useTasksCategory must be used within TasksCategoryProvider');
  return ctx;
}
