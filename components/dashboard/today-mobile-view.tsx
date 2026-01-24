'use client';

import { useState, useEffect, useTransition } from 'react';
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
type MoodCheckinRow = { id: string; mood: number; note: string | null; checkin_date: string } | null;
type DailyFocus = { text: string | null; updatedAt: string | null };

const LEVEL_TO_MOOD: Record<MoodLevel, number> = {
  great: 5,
  good: 4,
  neutral: 3,
  low: 2,
  bad: 1,
};
const MOOD_TO_LEVEL: Record<number, MoodLevel> = {
  5: 'great',
  4: 'good',
  3: 'neutral',
  2: 'low',
  1: 'bad',
};

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
 */
export function TodayMobileView({
  openTasks: initialOpenTasks,
  habitsWithState,
  moodCheckin,
  dailyFocus,
}: TodayMobileViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMood, setSelectedMood] = useState<number | null>(moodCheckin?.mood ?? null);
  const [openTasks, setOpenTasks] = useState(initialOpenTasks);
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [focusInput, setFocusInput] = useState('');

  const greeting = getGreeting();
  const dateString = formatDate();
  const completedHabits = habitsWithState.filter((h) => h.done_today).length;

  const hasFocusToday =
    isFocusToday(dailyFocus.updatedAt) && (dailyFocus.text ?? '').trim().length > 0;
  const currentFocusText = hasFocusToday ? (dailyFocus.text ?? '').trim() : '';

  async function saveDailyFocus() {
    const text = focusInput.trim();
    const res = await fetch('/api/profile/daily-focus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return;
    setIsEditingFocus(false);
    startTransition(() => router.refresh());
  }

  function handleStartEditFocus() {
    setFocusInput(currentFocusText);
    setIsEditingFocus(true);
  }

  function handleFocusKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') saveDailyFocus();
  }

  useEffect(() => {
    setOpenTasks(initialOpenTasks);
  }, [initialOpenTasks]);

  async function toggleTask(taskId: string) {
    const res = await fetch('/api/tasks/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    if (!res.ok) return;
    setOpenTasks((prev) => prev.filter((t) => t.id !== taskId));
    startTransition(() => router.refresh());
  }

  async function selectMood(level: MoodLevel) {
    const mood = LEVEL_TO_MOOD[level];
    const res = await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood }),
    });
    if (!res.ok) return;
    setSelectedMood(mood);
    startTransition(() => router.refresh());
  }

  const selectedLevel =
    selectedMood != null ? (MOOD_TO_LEVEL[selectedMood] ?? null) : null;

  return (
    <motion.div
      className="py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <ScreenHeader
        title={greeting}
        subtitle={dateString}
        systemLabel="Daily Control Layer"
      />

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
            />
          ) : (
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-foreground leading-relaxed">{currentFocusText}</p>
              <button
                type="button"
                onClick={handleStartEditFocus}
                className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Edit focus"
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
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleTask(task.id)}
                  disabled={isPending}
                  className="h-4 w-4 rounded-full border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0"
                />
                <span className="text-sm text-foreground">{task.title}</span>
              </div>
            ))}
          </ListCard>
        ) : (
          <ContentCard>
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">No open tasks</p>
              <Link
                href="/dashboard/tasks"
                className="text-xs text-emerald-700 font-medium mt-1 inline-block hover:underline focus-visible:underline underline-offset-4"
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
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">No habits yet</p>
              <Link
                href="/dashboard/habits"
                className="text-xs text-emerald-700 font-medium mt-1 inline-block hover:underline focus-visible:underline underline-offset-4"
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
            <h2 className="text-sm font-medium text-foreground">How are you feeling?</h2>
            <p className="text-xs text-muted-foreground">Emotional signal for today</p>
          </div>
          {selectedLevel != null && (
            <Pencil
              className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5"
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
            />
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
