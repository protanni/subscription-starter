'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import {
  containerVariants,
  itemVariants,
  ScreenHeader,
  ListCard,
  MutedListCard,
  EmptyState
} from '@/components/ui-kit';

interface TasksMobileViewProps {
  totalIncomplete: number;
  totalCompleted: number;
  currentView: 'todo' | 'done';
  children: React.ReactNode; // For CreateTaskForm and TaskList
}

/**
 * Mobile view for Tasks page using ui-kit components
 * Matches core-clarity-system Tasks page layout
 */
export function TasksMobileView({
  totalIncomplete,
  totalCompleted,
  currentView,
  children
}: TasksMobileViewProps) {
  return (
    <motion.div
      className="py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <ScreenHeader
        title="Tasks"
        subtitle={`${totalIncomplete} open · ${totalCompleted} completed`}
      />

      {/* Children contains CreateTaskForm and TaskList with their existing logic */}
      <motion.div variants={itemVariants} className="space-y-4">
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Enhanced task list wrapper for mobile styling
 */
export function TaskListMobileWrapper({
  isEmpty,
  isCompletedView,
  children
}: {
  isEmpty: boolean;
  isCompletedView: boolean;
  children: React.ReactNode;
}) {
  if (isEmpty) {
    return (
      <EmptyState
        message={
          isCompletedView
            ? 'No completed tasks yet.'
            : 'No tasks yet. Add one above.'
        }
        icon={Plus}
      />
    );
  }

  // Use MutedListCard for completed tasks
  if (isCompletedView) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
          Completed
        </h3>
        <MutedListCard>{children}</MutedListCard>
      </div>
    );
  }

  return <ListCard>{children}</ListCard>;
}
