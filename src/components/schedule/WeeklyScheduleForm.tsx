"use client";

import { CalendarDays, Copy, Home, School } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  DAY_LABEL,
  GOING_TIMES,
  RETURNING_TIMES,
  formatTime,
} from "@/lib/constants";
import type { ScheduleFormValues } from "@/lib/validation";
import { cn } from "@/lib/cn";

export function WeeklyScheduleForm({ today }: { today: string | null }) {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ScheduleFormValues>();
  const days = useWatch({ control, name: "days" });
  const activeCount = days.filter((d) => d.active).length;

  function copyFirstToAll() {
    const all = getValues("days");
    const source = all.find((d) => d.active && (d.going || d.returning));
    if (!source) return;
    all.forEach((d, i) => {
      if (d.active && i !== all.indexOf(source)) {
        setValue(`days.${i}.going`, source.going, { shouldDirty: true });
        setValue(`days.${i}.returning`, source.returning, { shouldDirty: true, shouldValidate: true });
      }
    });
  }

  return (
    <section className="rounded-[2rem] border border-line bg-surface p-5 shadow-card sm:p-7" aria-labelledby="week-title">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-lime text-navy">
            <CalendarDays className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id="week-title" className="font-display text-xl font-bold sm:text-2xl">
              Your week
            </h2>
            <p className="text-sm text-muted">
              Saturday to Thursday · {activeCount} class {activeCount === 1 ? "day" : "days"} on
            </p>
          </div>
        </div>
        {activeCount > 1 && (
          <button
            type="button"
            onClick={copyFirstToAll}
            className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-line px-4 text-sm font-semibold text-ink-soft transition hover:bg-surface-2 hover:text-ink"
          >
            <Copy className="size-4" aria-hidden /> Same times every day
          </button>
        )}
      </header>

      {errors.days?.root?.message || errors.days?.message ? (
        <p className="mb-4 rounded-2xl bg-[#fdecea] px-4 py-3 text-sm font-medium text-[#a93226]" role="alert">
          {errors.days?.root?.message ?? errors.days?.message}
        </p>
      ) : null}

      <ol className="space-y-3">
        {days.map((d, i) => {
          const dayError = errors.days?.[i]?.going?.message;
          return (
            <li
              key={d.day}
              className={cn(
                "rounded-3xl border p-4 transition-all duration-300 sm:p-5",
                d.active ? "border-brand/30 bg-brand-soft/30" : "border-line bg-surface-2/40",
                dayError && "border-[#d9534f]/60",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-xl font-display text-sm font-extrabold uppercase",
                      d.active ? "bg-navy text-lime dark:bg-lime dark:text-navy" : "bg-surface text-muted",
                    )}
                    aria-hidden
                  >
                    {d.day.slice(0, 2)}
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold leading-tight">
                      {DAY_LABEL[d.day]}
                      {today === d.day && (
                        <span className="ml-2 rounded-full bg-lime px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-navy">
                          Today
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {d.active
                        ? `${d.going ? formatTime(d.going) : "—"} → ${d.returning ? formatTime(d.returning) : "—"}`
                        : "No class"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                  <span className="hidden sm:inline">Class today?</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={d.active}
                    aria-label={`I have class on ${DAY_LABEL[d.day]}`}
                    onClick={() =>
                      setValue(`days.${i}.active`, !d.active, { shouldDirty: true, shouldValidate: true })
                    }
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors duration-200",
                      d.active ? "bg-brand" : "bg-line",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200",
                        d.active && "translate-x-5",
                      )}
                    />
                  </button>
                </div>
              </div>

              {d.active && (
                <div className="mt-4 grid gap-4 animate-rise md:grid-cols-2">
                  <TimeChoice
                    label="Going to University"
                    sub="Bus departure"
                    kind="going"
                    options={GOING_TIMES}
                    value={d.going}
                    onChange={(v) =>
                      setValue(`days.${i}.going`, v as ScheduleFormValues["days"][number]["going"], {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <TimeChoice
                    label="Returning Home"
                    sub="Bus departure"
                    kind="returning"
                    options={RETURNING_TIMES}
                    value={d.returning}
                    onChange={(v) => {
                      setValue(`days.${i}.returning`, v as ScheduleFormValues["days"][number]["returning"], {
                        shouldDirty: true,
                      });
                      // Re-validate the day-level "at least one time" rule.
                      setValue(`days.${i}.going`, getValues(`days.${i}.going`), { shouldValidate: true });
                    }}
                  />
                </div>
              )}
              {d.active && dayError && (
                <p className="mt-3 text-sm font-medium text-[#c0392b]" role="alert">
                  {dayError}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function TimeChoice({
  label,
  sub,
  kind,
  options,
  value,
  onChange,
}: {
  label: string;
  sub: string;
  kind: "going" | "returning";
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const going = kind === "going";
  const Icon = going ? School : Home;
  return (
    <fieldset className="rounded-2xl border border-line bg-surface p-3">
      <legend className="sr-only">{label}</legend>
      <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-ink" aria-hidden>
        <Icon className={cn("size-4", going ? "text-going-dot" : "text-return-dot")} />
        {label}
        <span className="text-xs font-medium text-muted">· {sub}</span>
      </p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((t) => {
          const on = value === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(on ? "" : t)}
              className={cn(
                "h-10 rounded-xl border px-3 text-sm font-semibold tabular-nums transition-all duration-150 active:scale-95",
                on
                  ? going
                    ? "border-going-dot bg-going-bg text-going-fg shadow-card ring-2 ring-going-dot/20"
                    : "border-return-dot bg-return-bg text-return-fg shadow-card ring-2 ring-return-dot/20"
                  : "border-line bg-surface-2/50 text-ink-soft hover:border-brand/40 hover:text-ink",
              )}
            >
              {formatTime(t)}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={value === ""}
          onClick={() => onChange("")}
          className={cn(
            "h-10 rounded-xl border border-dashed px-3 text-sm font-medium transition",
            value === "" ? "border-ink-soft/40 bg-surface-2 text-ink" : "border-line text-muted hover:text-ink",
          )}
        >
          Not needed
        </button>
      </div>
    </fieldset>
  );
}
