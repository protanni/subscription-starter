// components/ui-kit/mood-card.tsx
'use client';

import { motion } from 'framer-motion';
import { Smile, Meh, Frown, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type MoodLevel = 'great' | 'good' | 'neutral' | 'low' | 'bad';

interface MoodCardProps {
  level: MoodLevel;
  isSelected: boolean;
  onSelect: () => void | Promise<void>;
  size?: 'small' | 'large';
  disabled?: boolean;
}

const moodConfig: Record<
  MoodLevel,
  { label: string; icon: LucideIcon; bgClass: string; textClass: string }
> = {
  great: {
    label: 'Great',
    icon: Smile,
    bgClass: 'bg-[hsl(var(--mood-great))]',
    textClass: 'text-[hsl(var(--mood-great-foreground))]',
  },
  good: {
    label: 'Good',
    icon: Smile,
    bgClass: 'bg-[hsl(var(--mood-good))]',
    textClass: 'text-[hsl(var(--mood-good-foreground))]',
  },
  neutral: {
    label: 'Okay',
    icon: Meh,
    bgClass: 'bg-[hsl(var(--mood-neutral))]',
    textClass: 'text-[hsl(var(--mood-neutral-foreground))]',
  },
  low: {
    label: 'Low',
    icon: Frown,
    bgClass: 'bg-[hsl(var(--mood-low))]',
    textClass: 'text-[hsl(var(--mood-low-foreground))]',
  },
  bad: {
    label: 'Bad',
    icon: Frown,
    bgClass: 'bg-[hsl(var(--mood-bad))]',
    textClass: 'text-[hsl(var(--mood-bad-foreground))]',
  },
};

/**
 * Mood selection card with animation
 * Ported from core-clarity-system MoodCard
 */
export function MoodCard({
  level,
  isSelected,
  onSelect,
  size = 'small',
  disabled = false,
}: MoodCardProps) {
  const config = moodConfig[level];
  const Icon = config.icon;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={() => {
        if (disabled) return;
        onSelect();
      }}
      className={cn(
        'relative w-full flex flex-col items-center justify-center rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        config.bgClass,
        size === 'large' ? 'p-4 gap-2' : 'p-3 gap-1.5',
        isSelected
          ? 'ring-2 ring-[hsl(var(--ring))] ring-offset-2 ring-offset-background shadow-lg'
          : 'hover:shadow-md'
      )}
      aria-pressed={isSelected}
      aria-disabled={disabled ? true : undefined}
    >
      <Icon
        className={cn(config.textClass, size === 'large' ? 'w-6 h-6' : 'w-5 h-5')}
        strokeWidth={1.5}
      />
      <span
        className={cn(
          'font-medium',
          config.textClass,
          size === 'large' ? 'text-xs' : 'text-[10px]'
        )}
      >
        {config.label}
      </span>
    </motion.button>
  );
}

export const MOOD_LEVELS: MoodLevel[] = ['great', 'good', 'neutral', 'low', 'bad'];
