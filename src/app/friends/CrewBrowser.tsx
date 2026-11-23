"use client";

import { ArrowDownAZ, ChevronDown, RotateCcw, UserPlus } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FriendCard } from "@/components/FriendCard";
import { DayFilter } from "@/components/filters/DayFilter";
import { DepartmentFilter } from "@/components/filters/DepartmentFilter";
import { SearchBar } from "@/components/filters/SearchBar";
import { ButtonLink } from "@/components/ui/Button";
import type { Day } from "@/lib/constants";
import type { Department, Friend } from "@/lib/types";

type Sort = "az" | "za" | "days" | "dept";

const SORTS: { value: Sort; label: string }[] = [
  { value: "az", label: "Name A → Z" },
  { value: "za", label: "Name Z → A" },
  { value: "days", label: "Most class days" },
  { value: "dept", label: "Department" },
];

export function CrewBrowser({
  friends,
  departments,
  meId,
  today,
}: {
  friends: Friend[];
  departments: Department[];
  meId: string | null;
  today: Day | null;
}) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [days, setDays] = useState<Day[]>([]);
  const [sort, setSort] = useState<Sort>("az");
  const query = useDeferredValue(q);

  const usedDepartments = useMemo(() => {
    const ids = new Set(friends.map((f) => f.department.id));
    return departments.filter((d) => ids.has(d.id));
  }, [friends, departments]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = friends.filter((f) => {
      if (needle && !f.full_name.toLowerCase().includes(needle)) return false;
      if (dept && f.department.id !== dept) return false;
      if (days.length && !days.every((d) => f.schedules.some((s) => s.day_of_week === d))) return false;
      return true;
    });
    const byName = (a: Friend, b: Friend) => a.full_name.localeCompare(b.full_name);
    return [...list].sort((a, b) => {
      if (sort === "za") return -byName(a, b);
      if (sort === "days") return b.schedules.length - a.schedules.length || byName(a, b);
      if (sort === "dept") return a.department.name.localeCompare(b.department.name) || byName(a, b);
      return byName(a, b);
    });
  }, [friends, query, dept, days, sort]);

  const filtered = q || dept || days.length;

  if (friends.length === 0) {
    return (
      <EmptyState
        icon={UserPlus}
        title="The crew is empty — for now"
        description="Be the first to add your weekly schedule and invite your friends to join."
        action={<ButtonLink href="/my-schedule">Add my schedule</ButtonLink>}
      />
    );
  }

  return (
    <>
      <div className="mb-6 rounded-[2rem] border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_auto]">
          <SearchBar value={q} onChange={setQ} suggestions={friends.map((f) => f.full_name)} />
          <DepartmentFilter departments={usedDepartments} value={dept} onChange={setDept} />
          <div className="relative">
            <label htmlFor="crew-sort" className="sr-only">
              Sort
            </label>
            <ArrowDownAZ className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <select
              id="crew-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-12 w-full appearance-none rounded-2xl border border-line bg-surface pl-12 pr-10 text-sm font-medium text-ink shadow-card outline-none focus:border-brand focus:ring-4 focus:ring-brand/15 md:w-52"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <DayFilter value={days} onChange={setDays} today={today} />
          </div>
          {filtered ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setDept("");
                setDays([]);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <RotateCcw className="size-4" aria-hidden /> Clear
            </button>
          ) : null}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted" aria-live="polite">
        Showing <strong className="text-ink">{visible.length}</strong> of {friends.length}
      </p>

      {visible.length === 0 ? (
        <EmptyState title="No one matches" description="Try a different name, department or day." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((f, i) => (
            <FriendCard key={f.id} friend={f} today={today} index={i} isMe={f.id === meId} />
          ))}
        </div>
      )}
    </>
  );
}
