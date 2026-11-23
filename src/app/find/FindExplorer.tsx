"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Loader2, RotateCcw, SlidersHorizontal } from "lucide-react";
import { DayFilter } from "@/components/filters/DayFilter";
import { DepartmentFilter } from "@/components/filters/DepartmentFilter";
import { SearchBar } from "@/components/filters/SearchBar";
import { TimeFilter } from "@/components/filters/TimeFilter";
import type { Day } from "@/lib/constants";
import type { Department } from "@/lib/types";
import { cn } from "@/lib/cn";

export type FindState = {
  q: string;
  department: string;
  days: Day[];
  going: string;
  returning: string;
};

function toQuery(s: FindState) {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set("q", s.q.trim());
  if (s.department) p.set("department", s.department);
  if (s.days.length) p.set("days", s.days.join(","));
  if (s.going) p.set("going", s.going);
  if (s.returning) p.set("returning", s.returning);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export function FindExplorer({
  initial,
  departments,
  names,
  today,
  children,
}: {
  initial: FindState;
  departments: Department[];
  names: string[];
  today: Day | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<FindState>(initial);
  const [pending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const first = useRef(true);

  // Push filters to the URL → server re-queries Supabase. Name input is debounced.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      startTransition(() => router.replace(`${pathname}${toQuery(state)}`, { scroll: false }));
    }, 280);
    return () => clearTimeout(t);
  }, [state, pathname, router]);

  const activeCount =
    (state.q.trim() ? 1 : 0) +
    (state.department ? 1 : 0) +
    (state.days.length ? 1 : 0) +
    (state.going ? 1 : 0) +
    (state.returning ? 1 : 0);

  const update = (patch: Partial<FindState>) => setState((s) => ({ ...s, ...patch }));

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
      <aside className="lg:sticky lg:top-24">
        <div className="rounded-[2rem] border border-line bg-surface p-4 shadow-card sm:p-5">
          <SearchBar value={state.q} onChange={(q) => update({ q })} suggestions={names} />

          <div className="mt-3 flex items-center justify-between gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              aria-controls="find-filters"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Filters {activeCount > 0 && <span className="rounded-full bg-lime px-1.5 text-xs text-navy">{activeCount}</span>}
            </button>
            {activeCount > 0 && <ClearButton onClick={() => setState(EMPTY)} />}
          </div>

          <div id="find-filters" className={cn("mt-5 space-y-5", !showFilters && "hidden lg:block")}>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Department</p>
              <DepartmentFilter
                departments={departments}
                value={state.department}
                onChange={(department) => update({ department })}
              />
            </div>
            <DayFilter value={state.days} onChange={(days) => update({ days })} today={today} />
            <TimeFilter kind="going" value={state.going} onChange={(going) => update({ going })} />
            <TimeFilter kind="returning" value={state.returning} onChange={(returning) => update({ returning })} />
            <div className="hidden lg:block">
              <ClearButton onClick={() => setState(EMPTY)} disabled={activeCount === 0} full />
            </div>
          </div>
        </div>
      </aside>

      <section aria-live="polite" aria-busy={pending} className="relative min-h-60">
        {pending && (
          <div className="absolute inset-x-0 top-0 z-10 flex justify-center">
            <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-lime shadow-lift">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Searching…
            </span>
          </div>
        )}
        <div className={cn("transition-opacity duration-200", pending && "pointer-events-none opacity-40")}>
          {children}
        </div>
      </section>
    </div>
  );
}

const EMPTY: FindState = { q: "", department: "", days: [], going: "", returning: "" };

function ClearButton({ onClick, disabled, full }: { onClick: () => void; disabled?: boolean; full?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-ink-soft transition hover:bg-surface-2 hover:text-ink disabled:opacity-40",
        full && "w-full border border-line",
      )}
    >
      <RotateCcw className="size-4" aria-hidden /> Clear filters
    </button>
  );
}
