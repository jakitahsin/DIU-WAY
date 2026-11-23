import { Home, School } from "lucide-react";
import { GOING_TIMES, RETURNING_TIMES, formatTime } from "@/lib/constants";
import type { DayRider } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Avatar } from "./Avatar";

type Kind = "going" | "returning";

function groupBy(riders: DayRider[], kind: Kind) {
  const slots = kind === "going" ? GOING_TIMES : RETURNING_TIMES;
  return slots.map((time) => ({
    time,
    riders: riders.filter((r) => (kind === "going" ? r.going_time : r.returning_time) === time),
  }));
}

export function TodayColumn({
  kind,
  riders,
  meId,
  hideEmpty = false,
}: {
  kind: Kind;
  riders: DayRider[];
  meId?: string | null;
  hideEmpty?: boolean;
}) {
  const going = kind === "going";
  const groups = groupBy(riders, kind).filter((g) => !hideEmpty || g.riders.length > 0);
  const total = riders.filter((r) => (going ? r.going_time : r.returning_time)).length;
  const Icon = going ? School : Home;

  return (
    <section
      aria-labelledby={`${kind}-title`}
      className="rounded-[2rem] border border-line bg-surface p-5 shadow-card sm:p-7"
    >
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-11 place-items-center rounded-2xl",
              going ? "bg-going-bg text-going-fg" : "bg-return-bg text-return-fg",
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id={`${kind}-title`} className="font-display text-xl font-bold sm:text-2xl">
              {going ? "Who's Going Today?" : "Who's Coming Back Today?"}
            </h2>
            <p className="text-sm text-muted">
              {going ? "Grouped by bus to campus" : "Grouped by bus back home"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-bold tabular-nums text-ink">
          {total}
        </span>
      </header>

      <ol className="relative space-y-4">
        <span
          className={cn(
            "absolute bottom-3 left-[1.15rem] top-3 w-0.5 rounded-full",
            going ? "bg-going-dot/25" : "bg-return-dot/25",
          )}
          aria-hidden
        />
        {groups.map((g, i) => {
          const empty = g.riders.length === 0;
          return (
            <li
              key={g.time}
              className="relative grid grid-cols-[2.3rem_1fr] gap-3 animate-rise"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span
                className={cn(
                  "relative z-10 mt-1 grid size-9 place-items-center rounded-full border-4 border-surface",
                  empty ? "bg-line" : going ? "bg-going-dot" : "bg-return-dot",
                )}
                aria-hidden
              >
                {!empty && <span className="size-2 rounded-full bg-white" />}
              </span>
              <div
                className={cn(
                  "rounded-2xl border p-4 transition-colors",
                  empty ? "border-dashed border-line" : "border-line bg-surface-2/50",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={cn(
                      "font-display text-2xl font-extrabold tabular-nums tracking-tight",
                      empty ? "text-muted/60" : "text-ink",
                    )}
                  >
                    {formatTime(g.time)}
                  </p>
                  <p className="text-xs font-semibold text-muted">
                    {empty ? "No one yet" : `${g.riders.length} ${g.riders.length === 1 ? "friend" : "friends"}`}
                  </p>
                </div>
                {!empty && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {g.riders.map((r) => (
                      <li
                        key={r.id}
                        className={cn(
                          "flex items-center gap-2 rounded-full border bg-surface py-1 pl-1 pr-3 text-sm transition hover:-translate-y-0.5 hover:shadow-card",
                          r.id === meId ? "border-brand ring-2 ring-brand/20" : "border-line",
                        )}
                      >
                        <Avatar name={r.full_name} size="sm" className="!rounded-full !ring-0" />
                        <span className="font-semibold text-ink">{r.full_name}</span>
                        <span className="text-muted">— {r.department.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
