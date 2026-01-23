'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Smile, Meh, Frown, Heart, AlertCircle } from 'lucide-react';

type MoodCheckin = {
  id: string;
  mood: number;
  note: string | null;
  checkin_date: string;
} | null;

type MoodOption = {
  value: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
};

const moodOptions: MoodOption[] = [
  {
    value: 5,
    label: 'Great',
    icon: Heart,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
  },
  {
    value: 4,
    label: 'Good',
    icon: Smile,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    value: 3,
    label: 'Neutral',
    icon: Meh,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
  },
  {
    value: 2,
    label: 'Low',
    icon: Frown,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  {
    value: 1,
    label: 'Bad',
    icon: AlertCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
];

/**
 * MoodCheckin
 * - Client Component for mood check-in (1-5 scale).
 * - Calls POST /api/mood to upsert today's mood.
 */
export function MoodCheckin({ initialCheckin }: { initialCheckin: MoodCheckin }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMood, setSelectedMood] = useState<number | null>(
    initialCheckin?.mood ?? null
  );

  async function selectMood(mood: number) {
    const res = await fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    setSelectedMood(mood);

    // Refresh to get updated data
    startTransition(() => router.refresh());
  }

  const selectedOption = selectedMood
    ? moodOptions.find((opt) => opt.value === selectedMood)
    : null;

  return (
    <div className="space-y-3">
      {selectedOption ? (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">
            Today: <span className="font-medium text-gray-900">{selectedOption.label}</span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-3">How are you feeling today?</p>
      )}

      <div className="flex gap-3 flex-wrap">
        {moodOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedMood === option.value;

          return (
            <button
              key={option.value}
              onClick={() => selectMood(option.value)}
              disabled={isPending}
              className={`
                flex-1 min-w-[90px] max-w-[130px]
                rounded-lg border-2 p-4
                transition-all duration-200
                hover:scale-[1.02] hover:shadow-sm
                disabled:opacity-40 disabled:cursor-not-allowed
                ${isSelected ? option.bgColor + ' ' + option.color + ' border-2 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}
              `}
              title={option.label}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={`h-5 w-5 ${isSelected ? option.color : 'text-gray-400'}`} />
                <span className="text-xs font-medium">{option.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
