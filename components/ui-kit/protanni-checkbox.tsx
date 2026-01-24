'use client';

import { cn } from '@/utils/cn';

export interface ProtanniCheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

/**
 * Round, premium checkbox using shadcn/Tailwind tokens (ring, primary).
 * Use across Tasks, Today, Habits for consistent design-system checkboxes.
 */
export function ProtanniCheckbox({
  checked,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  className,
}: ProtanniCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'h-4 w-4 shrink-0 rounded-full border border-border bg-card',
        'accent-[hsl(var(--primary))]',
        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    />
  );
}
