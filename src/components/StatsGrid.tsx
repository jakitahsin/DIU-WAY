import { Clock, Home, School, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatTime } from "@/lib/constants";
import type { CommuteStats } from "@/lib/types";
import { cn } from "@/lib/cn";

type Stat = { label: string; value: string; hint: string; icon: LucideIcon; tone: string };

export function StatsGrid({ stats, isFriday }: { stats: CommuteStats | null; isFriday: boolean }) {
  const items: Stat[] = [
    {
      label: "Friends registered",
      value: stats ? String(stats.total_friends) : "—",
      hint: "in the DIU WAY crew",
      icon: Users,
      tone: "bg-navy text-lime dark:bg-lime dark:text-navy",
    },
    {
      label: "Going today",
      value: stats ? String(stats.going_today) : "—",
      hint: isFriday ? "Friday is off" : "heading to campus",
      icon: School,
      tone: "bg-going-bg text-going-fg",
    },
    {
      label: "Returning today",
      value: stats ? String(stats.returning_today) : "—",
      hint: isFriday ? "Friday is off" : "riding back home",
      icon: Home,
      tone: "bg-return-bg text-return-fg",
    },
    {
      label: "Popular departure",
      value: stats?.popular_going ? formatTime(stats.popular_going) : "—",
      hint: stats?.popular_going ? `${stats.popular_going_count} riding together` : "no rides yet today",
      icon: Clock,
      tone: "bg-lime text-navy",
    },
  ];

  return (
    <div id="stats" className="grid scroll-mt-24 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((s, i) => (
        <div
          key={s.label}
          className="group rounded-3xl border border-line bg-surface p-4 shadow-card transition-all duration-300 animate-rise hover:-translate-y-1 hover:shadow-lift sm:p-6"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <div className={cn("grid size-10 place-items-center rounded-2xl transition-transform group-hover:scale-110", s.tone)}>
            <s.icon className="size-5" aria-hidden />
          </div>
          <p className="mt-4 font-display text-3xl font-extrabold tabular-nums tracking-tight text-ink sm:text-4xl">
            {s.value}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">{s.label}</p>
          <p className="text-xs text-muted">{s.hint}</p>
        </div>
      ))}
    </div>
  );
}
