'use client';

import { motion } from 'framer-motion';
import { itemVariants } from './motion-presets';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  systemLabel?: string;
}

/**
 * Screen header with optional system framing label
 * Ported from core-clarity-system Today page pattern
 */
export function ScreenHeader({ title, subtitle, systemLabel }: ScreenHeaderProps) {
  return (
    <motion.header variants={itemVariants} className="space-y-1">
      {systemLabel && (
        <p className="text-[10px] font-medium text-primary/70 uppercase tracking-widest">
          {systemLabel}
        </p>
      )}
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </motion.header>
  );
}
