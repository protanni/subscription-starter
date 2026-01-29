// components/dashboard/tasks-mobile-view.tsx
'use client';

import { motion } from 'framer-motion';
import { containerVariants, itemVariants, ScreenHeader } from '@/components/ui-kit';

interface TasksMobileViewProps {
  totalIncomplete: number;
  totalCompleted: number;
  children: React.ReactNode;
}

/**
 * Mobile view for Tasks page.
 * Calm, premium off-white aesthetic; bg-background from shell.
 * Generous spacing (space-y-6).
 */
export function TasksMobileView({
  totalIncomplete,
  totalCompleted,
  children,
}: TasksMobileViewProps) {
  return (
    <motion.div
      className="py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <ScreenHeader
        title="Tasks"
        subtitle={`${totalIncomplete} open · ${totalCompleted} completed`}
      />

      <motion.div variants={itemVariants} className="space-y-6">
        {children}
      </motion.div>
    </motion.div>
  );
}
