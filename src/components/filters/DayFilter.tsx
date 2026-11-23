"use client";

import { DAYS, DAY_LABEL, DAY_SHORT, type Day } from "@/lib/constants";
import { cn } from "@/lib/cn";

/** Multi-select day chips (Saturday–Thursday). */
export function DayFilter({
  value,
  onChange,
  today,
}: {
  value: Day[];
  onChange: (days: Day[]) => void;
  today?: Day | null;
}) {
  function toggle(day: Day) {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : DAYS.filter((d) => d === day || value.includes(d)));
  }

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Day</legend>
      <div className="grid grid-cols-6 gap-1.5">
        {DAYS.map((d) => {
          const on = value.includes(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              aria-label={DAY_LABEL[d]}
              onClick={() => toggle(d)}
              className={cn(
                "relative h-11 rounded-xl border text-sm font-bold transition-all duration-200 active:scale-95",
                on
                  ? "border-navy bg-navy text-lime shadow-card dark:border-lime dark:bg-lime dark:text-navy"
                  : "border-line bg-surface text-ink-soft hover:border-brand/40 hover:text-ink",
              )}
            >
              {DAY_SHORT[d]}
              {d === today && (
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-brand" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
