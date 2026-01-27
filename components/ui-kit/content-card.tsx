'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';
import { itemVariants } from './motion-presets';

interface ContentCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  label?: string;
  noPadding?: boolean;
}

/**
 * Content card with shadow-card styling
 * Ported from core-clarity-system card pattern
 */
export function ContentCard({
  children,
  label,
  noPadding = false,
  className,
  ...props
}: ContentCardProps) {
  return (
    <motion.section
      variants={itemVariants}
      className={cn(
        'bg-card rounded-xl shadow-card border border-border/50',
        !noPadding && 'p-5',
        className
      )}
      {...props}
    >
      {label && (
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          {label}
        </label>
      )}
      {children}
    </motion.section>
  );
}

/**
 * List card with divide-y styling for list items
 */
export function ListCard({
  children,
  
  className,
  ...props
}: Omit<ContentCardProps, 'noPadding' | 'label'>) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'bg-card rounded-xl shadow-card border border-border/50 divide-y divide-border/50',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Muted list card for completed/secondary items
 */
export function MutedListCard({
  children,
  className,
  ...props
}: Omit<ContentCardProps, 'noPadding' | 'label'>) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'bg-card/60 rounded-xl border border-border/30 divide-y divide-border/30',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
