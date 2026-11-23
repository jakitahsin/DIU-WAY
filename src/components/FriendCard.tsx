import { CalendarDays } from "lucide-react";
import { DAYS, DAY_SHORT, type Day } from "@/lib/constants";
import type { Friend } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Avatar } from "./Avatar";
import { DepartmentBadge } from "./DepartmentBadge";
import { ScheduleCard } from "./ScheduleCard";

type Props = {
  friend: Friend;
  today?: Day | null;
  index?: number;
  isMe?: boolean;
  /** When set, the card notes these are only the matching days. */
  matchNote?: string;
};

export function FriendCard({ friend, today, index = 0, isMe = false, matchNote }: Props) {
  const activeDays = new Set(friend.schedules.map((s) => s.day_of_week));
  const subtitle =
    friend.department.long_name && friend.department.long_name !== friend.department.name
      ? friend.department.long_name
      : null;

  return (
    <article
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-card transition-all duration-300 animate-rise hover:-translate-y-1 hover:shadow-lift"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-lime/25 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <header className="flex items-start gap-3">
        <Avatar name={friend.full_name} />
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold leading-tight text-ink">
            <span className="truncate">{friend.full_name}</span>
            {isMe && (
              <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy">
                You
              </span>
            )}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <DepartmentBadge department={friend.department} />
            {subtitle && <span className="truncate text-xs text-muted">{subtitle}</span>}
          </div>
        </div>
      </header>

      {/* Week strip */}
      <div className="flex items-center gap-1" aria-label={`Class days: ${friend.schedules.length} of 6`}>
        {DAYS.map((d) => (
          <span
            key={d}
            className={cn(
              "flex-1 rounded-lg py-1 text-center text-[11px] font-bold uppercase tracking-wide",
              activeDays.has(d) ? "bg-navy text-lime dark:bg-lime dark:text-navy" : "bg-surface-2 text-muted/60",
              d === today && "ring-2 ring-brand ring-offset-1 ring-offset-surface",
            )}
            aria-hidden
          >
            {DAY_SHORT[d].slice(0, 2)}
          </span>
        ))}
      </div>

      {friend.schedules.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {friend.schedules.map((s) => (
            <ScheduleCard key={s.day_of_week} entry={s} highlight={s.day_of_week === today} />
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 rounded-2xl bg-surface-2 px-3 py-3 text-sm text-muted">
          <CalendarDays className="size-4" aria-hidden /> No class days added yet.
        </p>
      )}

      {matchNote && <p className="text-xs font-medium text-muted">{matchNote}</p>}
    </article>
  );
}
