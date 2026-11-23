"use client";

import { Home, School } from "lucide-react";
import { GOING_TIMES, RETURNING_TIMES, formatTime } from "@/lib/constants";
import { cn } from "@/lib/cn";

/** Single-select bus time chips; click the active one again to clear. */
export function TimeFilter({
  kind,
  value,
  onChange,
}: {
  kind: "going" | "returning";
  value: string;
  onChange: (value: string) => void;
}) {
  const going = kind === "going";
  const times = going ? GOING_TIMES : RETURNING_TIMES;
  const Icon = going ? School : Home;

  return (
    <fieldset>
      <legend className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted">
        <Icon className={cn("size-3.5", going ? "text-going-dot" : "text-return-dot")} aria-hidden />
        {going ? "Going time" : "Returning time"}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {times.map((t) => {
          const on = value === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? "" : t)}
              className={cn(
                "h-10 rounded-xl border px-3 text-sm font-semibold tabular-nums transition-all duration-200 active:scale-95",
                on
                  ? going
                    ? "border-going-dot bg-going-bg text-going-fg shadow-card"
                    : "border-return-dot bg-return-bg text-return-fg shadow-card"
                  : "border-line bg-surface text-ink-soft hover:border-brand/40 hover:text-ink",
              )}
            >
              {formatTime(t)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
