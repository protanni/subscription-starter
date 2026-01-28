// components/dashboard/today-mobile-view.tsx
'use client';

import type { MoodCheckinRow } from '@/components/dashboard/today-types';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Pencil } from 'lucide-react';
import {
  containerVariants,
  itemVariants,
  ScreenHeader,
  ContentCard,
  ListCard,
  SectionHeader,
  MoodCard,
  MOOD_LEVELS,
  ProtanniCheckbox,
} from '@/components/ui-kit';
import type { MoodLevel } from '@/components/ui-kit/mood-card';
import { TodayHabits } from '@/components/dashboard/today-habits';
import Input from '@/components/ui/Input';

type HabitWithState = {
  id: string;
  name: string;
  done_today: boolean;
  completedDates: string[];
};

type DailyFocus = { text: string | null; updatedAt: string | null };

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function isFocusToday(updatedAt: string | null): boolean {
  if (!updatedAt) return false;
  const d = new Date(updatedAt);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export interface TodayMobileViewProps {
  openTasks: Array<{ id: string; title: string; status: string }>;
  habitsWithState: HabitWithState[];
  moodCheckin: MoodCheckinRow;
  dailyFocus: DailyFocus;
}

/**
 * Mobile Today view matching Lovable composition.
 * Order: ScreenHeader → Daily Focus → Open Tasks → Today's Habits → Mood.
 * No metrics grid, no events.
 *
 * Stability rules (Sprint 1):
 * - Lock per entity during mutation (focus, tasks per id, mood)
 * - Prevent duplicate mutations and out-of-order overwrites
 * - Refresh only after settle
 */
export function TodayMobileView({
  openTasks: initialOpenTasks,
  habitsWithState,
  moodCheckin,
  dailyFocus,
}: TodayMobileViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(() => {
    const raw = moodCheckin?.mood;
    return typeof raw === 'string' && MOOD_LEVELS.includes(raw as MoodLevel)
      ? (raw as MoodLevel)
      : null;
  });

  // Mount-only init (do not resync from props during mutations)
  const [openTasks, setOpenTasks] = useState(() => initialOpenTasks);

  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [focusInput, setFocusInput] = useState('');

  // ---- Locks (scoped) ----
  const [isSavingFocus, setIsSavingFocus] = useState(false);

  const [pendingTaskById, setPendingTaskById] = useState<Record<string, true>>({});
  const taskSeqRef = useRef<Record<string, number>>({});

  const [isSavingMood, setIsSavingMood] = useState(false);
  const moodSeqRef = useRef(0);

  const greeting = getGreeting();
  const dateString = formatDate();
  const completedHabits = habitsWithState.filter((h) => h.done_today).length;

  const hasFocusToday =
    isFocusToday(dailyFocus.updatedAt) && (dailyFocus.text ?? '').trim().length > 0;
  const currentFocusText = hasFocusToday ? (dailyFocus.text ?? '').trim() : '';

  // ---- Focus mutation ----
  async function saveDailyFocus() {
    if (isSavingFocus) return;

    const text = focusInput.trim();
    setIsSavingFocus(true);

    try {
      const res = await fetch('/api/profile/daily-focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) return;

      setIsEditingFocus(false);
    } finally {
      setIsSavingFocus(false);
      startTransition(() => router.refresh());
    }
  }

  function handleStartEditFocus() {
    setFocusInput(currentFocusText);
    setIsEditingFocus(true);
  }

  function handleFocusKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') saveDailyFocus();
  }

  // ---- Task toggle mutation (lock per task id) ----
  const isTaskPending = (taskId: string) => pendingTaskById[taskId] === true;

  const lockTask = (taskId: string) => {
    setPendingTaskById((prev) => (prev[taskId] ? prev : { ...prev, [taskId]: true }));
  };

  const unlockTask = (taskId: string) => {
    setPendingTaskById((prev) => {
      if (!prev[taskId]) return prev;
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const nextTaskSeq = (taskId: string) => {
    const curr = taskSeqRef.current[taskId] ?? 0;
    const next = curr + 1;
    taskSeqRef.current[taskId] = next;
    return next;
  };

  const isLatestTaskSeq = (taskId: string, seq: number) =>
    (taskSeqRef.current[taskId] ?? 0) === seq;

  async function toggleTask(taskId: string) {
    if (isTaskPending(taskId)) return;

    const seq = nextTaskSeq(taskId);
    lockTask(taskId);

    // Optimistic remove (task disappears as "completed")
    const snapshot = openTasks;
    setOpenTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const res = await fetch('/api/tasks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (!res.ok) {
        // rollback only if still latest for this task
        if (isLatestTaskSeq(taskId, seq)) {
          setOpenTasks(snapshot);
        }
        return;
      }

      if (!isLatestTaskSeq(taskId, seq)) return;
    } finally {
      unlockTask(taskId);
      startTransition(() => router.refresh());
    }
  }

  // ---- Mood mutation (single entity lock + latest wins) ----
  async function selectMood(level: MoodLevel) {
    if (isSavingMood) return;

    const seq = (moodSeqRef.current += 1);
    setIsSavingMood(true);

    const prev = selectedMood;

    // Optimistic UI
    setSelectedMood(level);

    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: level }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('POST /api/mood failed', res.status, err);

        if (moodSeqRef.current === seq) {
          setSelectedMood(prev);
        }
        return;
      }

      if (moodSeqRef.current !== seq) return;
    } finally {
      if (moodSeqRef.current === seq) {
        setIsSavingMood(false);
        startTransition(() => router.refresh());
      }
    }
  }

  const selectedLevel = selectedMood;

  // Show pencil if we have a mood for today (server checkin exists OR selectedMood not null)
  const hasMoodToday = moodCheckin != null || selectedMood != null;

  return (
    <motion.div
      className="py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <ScreenHeader title={greeting} subtitle={dateString} systemLabel="Daily Control Layer" />

      {/* Daily Focus – Lovable UX + Supabase persistence */}
      <motion.section variants={itemVariants}>
        <ContentCard label="Daily Focus">
          {!hasFocusToday && !isEditingFocus ? (
            <button
              type="button"
              onClick={() => {
                setFocusInput('');
                setIsEditingFocus(true);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              disabled={isSavingFocus}
            >
              <Plus className="w-4 h-4" />
              Set daily focus
            </button>
          ) : isEditingFocus ? (
            <Input
              variant="light"
              type="text"
              placeholder="What matters most today?"
              value={focusInput}
              onChange={(v) => setFocusInput(v)}
              onBlur={saveDailyFocus}
              onKeyDown={handleFocusKeyDown}
              autoFocus
              disabled={isSavingFocus}
            />
          ) : (
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-foreground leading-relaxed">{currentFocusText}</p>
              <button
                type="button"
                onClick={handleStartEditFocus}
                className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Edit focus"
                disabled={isSavingFocus}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </ContentCard>
      </motion.section>

      {/* Open Tasks – circular checkbox, toggle complete -> disappear */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader title="Open Tasks" viewAllHref="/dashboard/tasks" viewAllLabel="View all" />
        {openTasks.length > 0 ? (
          <ListCard>
            {openTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-4">
                <ProtanniCheckbox
                  checked={false}
                  onChange={() => toggleTask(task.id)}
                  disabled={isTaskPending(task.id)}
                />
                <span className="text-sm text-foreground">{task.title}</span>
              </div>
            ))}
          </ListCard>
        ) : (
          <ContentCard>
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">No open tasks</p>
              <Link
                href="/dashboard/tasks"
                className="text-xs text-primary font-medium mt-1 inline-block no-underline hover:underline focus-visible:underline active:underline visited:no-underline underline-offset-4"
              >
                Add a task
              </Link>
            </div>
          </ContentCard>
        )}
      </motion.section>

      {/* Today's Habits */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader
          title="Today's Habits"
          viewAllHref="/dashboard/habits"
          viewAllLabel="View all"
          count={
            habitsWithState.length > 0
              ? { done: completedHabits, total: habitsWithState.length }
              : undefined
          }
        />
        {habitsWithState.length > 0 ? (
          <ContentCard noPadding>
            <TodayHabits initialHabits={habitsWithState} />
          </ContentCard>
        ) : (
          <ContentCard>
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">No habits yet</p>
              <Link
                href="/dashboard/habits"
                className="text-xs text-primary font-medium mt-1 inline-block no-underline hover:underline focus-visible:underline active:underline visited:no-underline underline-offset-4"
              >
                Add a habit
              </Link>
            </div>
          </ContentCard>
        )}
      </motion.section>

      {/* Mood – Lovable-style pastel pills */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Mood
            </span>
            <h2 className="text-sm font-medium text-foreground">How are you feeling?</h2>
          </div>
          {hasMoodToday && (
            <Pencil
              className="w-4 h-4 shrink-0 text-muted-foreground mt-1"
              strokeWidth={2}
              aria-hidden
            />
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {MOOD_LEVELS.map((level) => (
            <MoodCard
              key={level}
              level={level}
              isSelected={selectedLevel === level}
              onSelect={() => selectMood(level)}
              disabled={isSavingMood}
            />
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
