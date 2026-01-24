'use client';

import { motion } from 'framer-motion';
import { Smile, Meh, Frown, Pencil, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type MoodLevel = 'great' | 'good' | 'neutral' | 'low' | 'bad';

interface MoodCardProps {
  level: MoodLevel;
  isSelected: boolean;
  onSelect: () => void;
  size?: 'small' | 'large';
}

const moodConfig: Record<
  MoodLevel,
  { label: string; icon: LucideIcon; bgClass: string; textClass: string }
> = {
  great: {
    label: 'Great',
    icon: Smile,
    bgClass: 'bg-[hsl(var(--mood-great))]',
    textClass: 'text-[hsl(var(--mood-great-foreground))]'
  },
  good: {
    label: 'Good',
    icon: Smile,
    bgClass: 'bg-[hsl(var(--mood-good))]',
    textClass: 'text-[hsl(var(--mood-good-foreground))]'
  },
  neutral: {
    label: 'Okay',
    icon: Meh,
    bgClass: 'bg-[hsl(var(--mood-neutral))]',
    textClass: 'text-[hsl(var(--mood-neutral-foreground))]'
  },
  low: {
    label: 'Low',
    icon: Frown,
    bgClass: 'bg-[hsl(var(--mood-low))]',
    textClass: 'text-[hsl(var(--mood-low-foreground))]'
  },
  bad: {
    label: 'Bad',
    icon: Frown,
    bgClass: 'bg-[hsl(var(--mood-bad))]',
    textClass: 'text-[hsl(var(--mood-bad-foreground))]'
  }
};

/**
 * Mood selection card with animation
 * Ported from core-clarity-system MoodCard
 */
export function MoodCard({
  level,
  isSelected,
  onSelect,
  size = 'small'
}: MoodCardProps) {
  const config = moodConfig[level];
  const Icon = config.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'relative w-full flex flex-col items-center justify-center rounded-xl transition-all duration-200',
        config.bgClass,
        size === 'large' ? 'p-4 gap-2' : 'p-3 gap-1.5',
        isSelected
          ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background shadow-lg'
          : 'hover:shadow-md'
      )}
    >
      {isSelected && (
        <Pencil
          className="absolute top-1.5 right-1.5 w-3 h-3 text-muted-foreground opacity-70"
          strokeWidth={2}
          aria-hidden
        />
      )}
      <Icon
        className={cn(
          config.textClass,
          size === 'large' ? 'w-6 h-6' : 'w-5 h-5'
        )}
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
