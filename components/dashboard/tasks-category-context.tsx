'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type TasksCategory =
  | 'all'
  | 'work'
  | 'personal'
  | 'mind'
  | 'body'
  | 'relationships';

export const TASKS_CATEGORIES: { value: TasksCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'mind', label: 'Mind' },
  { value: 'body', label: 'Body' },
  { value: 'relationships', label: 'Relationships' },
];

const PLACEHOLDER_MAP: Record<TasksCategory, string> = {
  all: 'Add a task…',
  work: 'Add a work task…',
  personal: 'Add a personal task…',
  mind: 'Add a mind task…',
  body: 'Add a body task…',
  relationships: 'Add a relationships task…',
};

const EMPTY_MESSAGE_MAP: Record<TasksCategory, string> = {
  all: 'No tasks yet.',
  work: 'No work tasks yet.',
  personal: 'No personal tasks yet.',
  mind: 'No mind tasks yet.',
  body: 'No body tasks yet.',
  relationships: 'No relationships tasks yet.',
};

type TasksCategoryContextValue = {
  category: TasksCategory;
  setCategory: (c: TasksCategory) => void;
  placeholder: string;
  emptyMessage: string;
};

const TasksCategoryContext = createContext<TasksCategoryContextValue | null>(null);

export function TasksCategoryProvider({ children }: { children: ReactNode }) {
  const [category, setCategoryState] = useState<TasksCategory>('all');
  const setCategory = useCallback((c: TasksCategory) => setCategoryState(c), []);

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
