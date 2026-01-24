'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  containerVariants,
  itemVariants,
  ScreenHeader,
  ContentCard,
  ListCard,
  SectionHeader
} from '@/components/ui-kit';

interface TodayMobileViewProps {
  greeting: string;
  dateString: string;
  summary: {
    tasks_due_today?: number;
    habits_logged_today?: number;
    mood_today?: string;
    events_today?: number;
  } | null;
  openTasks: Array<{ id: string; title: string; status: string }>;
  events: Array<{
    id: string;
    title: string;
    starts_at: string;
    ends_at: string | null;
    all_day: boolean;
  }>;
  children: React.ReactNode; // For TodayHabits and MoodCheckin components
}

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
    day: 'numeric'
  });
}

function formatEventTime(e: {
  all_day: boolean;
  starts_at: string;
  ends_at: string | null;
}) {
  if (e.all_day) return 'All day';
  const start = new Date(e.starts_at);
  const end = e.ends_at ? new Date(e.ends_at) : null;
  const fmt = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return end ? `${fmt(start)} → ${fmt(end)}` : fmt(start);
}

/**
 * Mobile view for Today page using ui-kit components
 * Matches core-clarity-system Today page layout
 */
export function TodayMobileView({
  summary,
  openTasks,
  events,
  children
}: TodayMobileViewProps) {
  const greeting = getGreeting();
  const dateString = formatDate();

  return (
    <motion.div
      className="py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header with System Framing */}
      <ScreenHeader
        title={greeting}
        subtitle={dateString}
        systemLabel="Daily Control Layer"
      />

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-3"
      >
        <StatCard
          title="Tasks due"
          value={summary?.tasks_due_today ?? 0}
        />
        <StatCard
          title="Habits done"
          value={summary?.habits_logged_today ?? 0}
        />
        <StatCard title="Mood" value={summary?.mood_today ?? '—'} />
        <StatCard title="Events" value={summary?.events_today ?? 0} />
      </motion.div>

      {/* Open Tasks */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader
          title="Open Tasks"
          viewAllHref="/dashboard/tasks"
        />
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

      {/* Habits and Mood - rendered via children to preserve server logic */}
      {children}

      {/* Events */}
      <motion.section variants={itemVariants} className="space-y-3">
        <SectionHeader title="Today's Events" />
        {events.length > 0 ? (
          <ListCard>
            {events.map((event) => (
              <div key={event.id} className="p-4">
                <div className="text-sm font-medium text-foreground">
                  {event.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatEventTime(event)}
                </div>
              </div>
            ))}
          </ListCard>
        ) : (
          <ContentCard>
            <p className="text-sm text-muted-foreground text-center py-2">
              No events today
            </p>
          </ContentCard>
        )}
      </motion.section>
    </motion.div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wide">
        {title}
      </div>
      <div className="mt-1 text-xl font-semibold text-foreground">
        {String(value)}
      </div>
    </div>
  );
}
