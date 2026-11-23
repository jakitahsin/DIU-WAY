import type { Metadata } from "next";
import { AlertTriangle, SearchX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { FriendCard } from "@/components/FriendCard";
import { PageHeader } from "@/components/PageHeader";
import { DAYS, DAY_LABEL, formatTime, isDay, isGoingTime, isReturningTime } from "@/lib/constants";
import { getDepartments, getFriendNames, searchFriends, type FriendFilters } from "@/lib/data";
import { getDhakaClassDay } from "@/lib/date";
import { getUser } from "@/lib/supabase/server";
import type { Friend } from "@/lib/types";
import { FindExplorer, type FindState } from "./FindExplorer";

export const metadata: Metadata = { title: "Find Friends" };

type SP = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

function parse(sp: Record<string, string | string[] | undefined>): FindState {
  const days = str(sp.days)
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(isDay);
  const going = str(sp.going);
  const returning = str(sp.returning);
  const department = str(sp.department);
  return {
    q: str(sp.q).slice(0, 80),
    department: /^[0-9a-f-]{36}$/i.test(department) ? department : "",
    days: DAYS.filter((d) => days.includes(d)),
    going: isGoingTime(going) ? going : "",
    returning: isReturningTime(returning) ? returning : "",
  };
}

export default async function FindPage({ searchParams }: { searchParams: SP }) {
  const state = parse(await searchParams);
  const today = getDhakaClassDay();

  const filters: FriendFilters = {
    q: state.q || undefined,
    department: state.department || undefined,
    days: state.days.length ? state.days : undefined,
    going: state.going || undefined,
    returning: state.returning || undefined,
  };

  const [{ user }, departments, names] = await Promise.all([
    getUser(),
    getDepartments().catch(() => []),
    getFriendNames().catch(() => []),
  ]);

  let results: Friend[] = [];
  let error: string | null = null;
  try {
    results = await searchFriends(filters);
  } catch (e) {
    console.error("searchFriends failed", e);
    error = "We couldn't load results from the database. Please try again in a moment.";
  }

  const scheduleFiltered = Boolean(state.days.length || state.going || state.returning);
  const summary = [
    state.days.length ? state.days.map((d) => DAY_LABEL[d]).join(", ") : null,
    state.going ? `going ${formatTime(state.going)}` : null,
    state.returning ? `returning ${formatTime(state.returning)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Search the crew"
        title="Find Friends"
        description="Mix and match filters — day, department, bus times or name — to see exactly who's riding with you."
      />

      <FindExplorer
        initial={state}
        departments={departments}
        names={names}
        today={today}
      >
        {error ? (
          <EmptyState icon={AlertTriangle} title="Something went wrong" description={error} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-muted">
                <span className="font-display text-2xl font-extrabold text-ink tabular-nums">{results.length}</span>{" "}
                {results.length === 1 ? "friend matches" : "friends match"}
                {summary && <span className="ml-1">· {summary}</span>}
              </p>
            </div>
            {results.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No matching friends"
                description="Try removing a filter or picking a different bus time. Maybe you'll be the first on that ride!"
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {results.map((f, i) => (
                  <FriendCard
                    key={f.id}
                    friend={f}
                    today={today}
                    index={i}
                    isMe={f.id === user?.id}
                    matchNote={scheduleFiltered ? "Showing only the days that match your filters." : undefined}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </FindExplorer>
    </div>
  );
}
