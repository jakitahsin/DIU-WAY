import { DAY_LABEL, DAY_SHORT } from "@/lib/constants";
import type { ScheduleEntry } from "@/lib/types";
import { cn } from "@/lib/cn";
import { TimeBadge } from "./TimeBadge";

/** One day of someone's commute: day + going + returning. */
export function ScheduleCard({
  entry,
  highlight = false,
  compact = false,
}: {
  entry: ScheduleEntry;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors",
        highlight ? "border-brand/40 bg-brand-soft/60" : "border-line bg-surface-2/60",
      )}
    >
      <span
        className={cn(
          "w-12 shrink-0 text-xs font-bold uppercase tracking-wider",
          highlight ? "text-brand-strong" : "text-muted",
        )}
      >
        <span className="sm:hidden">{DAY_SHORT[entry.day_of_week]}</span>
        <span className="hidden sm:inline">{compact ? DAY_SHORT[entry.day_of_week] : DAY_LABEL[entry.day_of_week].slice(0, 3)}</span>
        <span className="sr-only">{DAY_LABEL[entry.day_of_week]}</span>
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        <TimeBadge kind="going" time={entry.going_time} size="sm" />
        <span className="text-line" aria-hidden>
          →
        </span>
        <TimeBadge kind="returning" time={entry.returning_time} size="sm" />
      </div>
      {highlight && (
        <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
          Today
        </span>
      )}
    </li>
  );
}
