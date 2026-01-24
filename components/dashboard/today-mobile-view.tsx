'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
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

type HabitWithState = { id: string; name: string; done_today: boolean };
type MoodCheckinRow = { id: string; mood: number; note: string | null; checkin_date: string } | null;

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

export interface TodayMobileViewProps {
  openTasks: Array<{ id: string; title: string; status: string }>;
  habitsWithState: HabitWithState[];
  moodCheckin: MoodCheckinRow;
}

/**
 * Mobile Today view matching Lovable composition.
 * Order: ScreenHeader → Daily Focus → Open Tasks → Today's Habits → Mood.
 * No metrics grid, no events.
 */
export function TodayMobileView({
  openTasks,
  habitsWithState,
  moodCheckin,
}: TodayMobileViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMood, setSelectedMood] = useState<number | null>(moodCheckin?.mood ?? null);

  const greeting = getGreeting();
  const dateString = formatDate();
  const completedHabits = habitsWithState.filter((h) => h.done_today).length;

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

      {/* Daily Focus – placeholder only */}
      <motion.section variants={itemVariants}>
        <ContentCard label="Daily Focus">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <Plus className="w-4 h-4" />
            Set daily focus
          </button>
        </ContentCard>
      </motion.section>

      {/* Open Tasks */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader title="Open Tasks" viewAllHref="/dashboard/tasks" viewAllLabel="View all" />
        {openTasks.length > 0 ? (
          <ListCard>
            {openTasks.map((task) => (
              <div key={task.id} className="p-4">
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
                className="text-xs text-primary hover:underline mt-1 inline-block"
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
                className="text-xs text-primary hover:underline mt-1 inline-block"
              >
                Add a habit
              </Link>
            </div>
          </ContentCard>
        )}
      </motion.section>

      {/* Mood – Lovable-style pastel pills */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-foreground">How are you feeling?</h2>
          <p className="text-xs text-muted-foreground">Emotional signal for today</p>
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
