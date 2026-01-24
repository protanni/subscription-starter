// components/dashboard/today-types.ts
import type { MoodLevel } from '@/components/ui-kit/mood-card';

export type MoodCheckinRow = {
    id: string;
    mood: MoodLevel | number;
    note: string | null;
    checkin_date: string;
  } | null;
  
  export type DailyFocus = {
    text: string | null;
    updatedAt: string | null;
};
  