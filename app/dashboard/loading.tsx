export default function Loading() {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-xl px-4 py-6">
          <div className="animate-pulse space-y-4">
            {/* Header skeleton */}
            <div className="space-y-2">
              <div className="h-7 w-40 rounded-xl bg-muted/50" />
              <div className="h-4 w-64 rounded-xl bg-muted/50" />
            </div>
  
            {/* Content skeleton block 1 */}
            <div className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-28 rounded-xl bg-muted/50" />
                <div className="h-10 w-full rounded-xl bg-muted/50" />
                <div className="h-10 w-full rounded-xl bg-muted/50" />
                <div className="h-10 w-5/6 rounded-xl bg-muted/50" />
              </div>
            </div>
  
            {/* Content skeleton block 2 */}
            <div className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-36 rounded-xl bg-muted/50" />
                <div className="h-10 w-full rounded-xl bg-muted/50" />
                <div className="h-10 w-4/5 rounded-xl bg-muted/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  