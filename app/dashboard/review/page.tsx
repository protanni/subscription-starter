import { ReviewMobileView } from '@/components/dashboard/review-mobile-view';

export default function ReviewPage() {
  // Placeholder data - will be populated when backend is ready
  const daysShowedUp = 0;
  const habitCompletions = 0;
  const areasTouched: string[] = [];
  const dominantMood: string | null = null;

  return (
    <>
      {/* Mobile View - hidden on md+ */}
      <div className="md:hidden">
        <ReviewMobileView
          daysShowedUp={daysShowedUp}
          habitCompletions={habitCompletions}
          areasTouched={areasTouched}
          dominantMood={dominantMood}
        />
      </div>

      {/* Desktop View - hidden on mobile */}
      <div className="hidden md:block bg-background min-h-screen text-foreground space-y-6">
        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Weekly Review
          </h2>
          <p className="text-sm text-muted-foreground">
            Your weekly review will appear here. Track your progress, celebrate
            wins, and plan for the week ahead.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-5 text-center">
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
      </div>
    </>
  );
}
