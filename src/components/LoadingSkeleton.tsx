import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-line/70", className)} aria-hidden />;
}

export function FriendCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-10 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full rounded-2xl" />
    </div>
  );
}

/** Grid of card placeholders while data loads. */
export function LoadingSkeleton({ count = 6, withHeader = true }: { count?: number; withHeader?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6" role="status" aria-label="Loading">
      {withHeader && (
        <div className="mb-8 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <FriendCardSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
