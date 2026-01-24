'use client';

import { motion } from 'framer-motion';
import {
  containerVariants,
  itemVariants,
  ScreenHeader
} from '@/components/ui-kit';

interface HabitsMobileViewProps {
  totalHabits: number;
  completedToday: number;
  children: React.ReactNode; // For CreateHabitForm and HabitList
}

/**
 * Mobile view for Habits page using ui-kit components
 * Matches core-clarity-system Habits page layout
 */
export function HabitsMobileView({
  totalHabits,
  completedToday,
  children
}: HabitsMobileViewProps) {
  return (
    <motion.div
      className="py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <ScreenHeader
        title="Habits"
        subtitle={`${completedToday} of ${totalHabits} completed today`}
      />

      {/* Children contains CreateHabitForm and HabitList with their existing logic */}
      <motion.div variants={itemVariants} className="space-y-4">
        {children}
      </motion.div>
    </motion.div>
  );
}
