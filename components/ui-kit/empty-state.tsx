'use client';

import { motion } from 'framer-motion';
import { Plus, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { itemVariants } from './motion-presets';

interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Empty state with icon and optional action
 * Ported from core-clarity-system empty state pattern
 */
export function EmptyState({
  message,
  icon: Icon = Plus,
  actionLabel,
  actionHref
}: EmptyStateProps) {
  return (
    <motion.div variants={itemVariants} className="text-center py-12">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-xs text-primary hover:underline mt-1 inline-block"
        >
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}
