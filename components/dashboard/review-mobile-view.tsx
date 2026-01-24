'use client';

import { motion } from 'framer-motion';
import {
  containerVariants,
  itemVariants,
  ScreenHeader,
  ContentCard
} from '@/components/ui-kit';

interface ReviewMobileViewProps {
  daysShowedUp: number;
  habitCompletions: number;
  areasTouched: string[];
  dominantMood: string | null;
}

const areaLabels: Record<string, string> = {
  work: 'Work',
  personal: 'Personal',
  mind: 'Mind',
  body: 'Body',
  relationships: 'Relationships'
};

/**
 * Mobile view for Weekly Review page using ui-kit components
 * Matches core-clarity-system WeeklyReview page layout
 */
export function ReviewMobileView({
  daysShowedUp,
  habitCompletions,
  areasTouched,
  dominantMood
}: ReviewMobileViewProps) {
  return (
    <motion.div
      className="py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <ScreenHeader
        title="Weekly Review"
        subtitle="Reflect, realign, and prepare for the next week."
      />

      {/* Consistency Overview */}
      <ContentCard label="Consistency Overview">
        <div className="space-y-2">
          <p className="text-sm text-foreground">
            You showed up{' '}
            <span className="font-medium text-primary">{daysShowedUp}</span> of 7
            days.
          </p>
          <p className="text-sm text-foreground">
            Habits practiced:{' '}
            <span className="font-medium text-primary">{habitCompletions}</span>{' '}
            times.
          </p>
        </div>
      </ContentCard>

      {/* Life Areas Touched */}
      <ContentCard label="Life Areas Touched">
        {areasTouched.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {['work', 'personal', 'mind', 'body', 'relationships'].map(
                (area) => {
                  const isTouched = areasTouched.includes(area);
                  return (
                    <div
                      key={area}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        isTouched
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-muted/50 text-muted-foreground/50 border border-transparent'
                      }`}
                    >
                      {areaLabels[area]}
                    </div>
                  );
                }
              )}
            </div>
            <p className="text-xs text-muted-foreground pt-3">
              Your life is being touched across {areasTouched.length} area
              {areasTouched.length !== 1 ? 's' : ''}.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Assign areas to tasks and habits to see your life balance.
          </p>
        )}
      </ContentCard>

      {/* Emotional Summary */}
      <ContentCard label="Emotional Summary">
        {dominantMood ? (
          <p className="text-sm text-foreground">
            Your mood this week was mostly:{' '}
            <span className="font-medium text-primary capitalize">
              {dominantMood}
            </span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No mood entries this week. Check in daily to see your emotional
            patterns.
          </p>
        )}
      </ContentCard>

      {/* Gentle Reflection */}
      <ContentCard label="Gentle Reflection">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-foreground">
              What went well this week?
            </label>
            <textarea
              placeholder="Take a moment to acknowledge your wins..."
              className="w-full min-h-[80px] p-3 rounded-lg bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-foreground">
              What matters most next week?
            </label>
            <textarea
              placeholder="Set your intention for the week ahead..."
              className="w-full min-h-[80px] p-3 rounded-lg bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>
      </ContentCard>

      {/* Coming Soon Notice */}
      <motion.div
        variants={itemVariants}
        className="rounded-lg border border-dashed border-border/50 bg-muted/30 p-4 text-center"
      >
        <p className="text-xs text-muted-foreground">
          Full weekly review with data insights coming soon
        </p>
      </motion.div>
    </motion.div>
  );
}
