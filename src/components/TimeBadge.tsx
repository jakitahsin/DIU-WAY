import { Bus, Home, School } from "lucide-react";
import { formatTime } from "@/lib/constants";
import { cn } from "@/lib/cn";

type Props = {
  kind: "going" | "returning";
  time: string | null;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
};

/** Pill showing a bus time. Green = to campus, orange = back home. */
export function TimeBadge({ kind, time, size = "md", showLabel = false, className }: Props) {
  const going = kind === "going";
  const Icon = going ? School : Home;
  const label = going ? "To campus" : "Back home";

  if (!time) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-dashed border-line text-muted",
          size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
          className,
        )}
        title={`${label}: not set`}
      >
        <Icon className="size-3.5" aria-hidden />
        <span className="sr-only">{label}: </span>—
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold tabular-nums",
        going ? "bg-going-bg text-going-fg" : "bg-return-bg text-return-fg",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
      title={`${label} bus · ${formatTime(time)}`}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />
      {showLabel ? <span className="font-medium opacity-80">{going ? "Going" : "Return"}</span> : <span className="sr-only">{label}: </span>}
      {formatTime(time)}
    </span>
  );
}

export function BusDot({ kind }: { kind: "going" | "returning" }) {
  return (
    <span
      className={cn(
        "grid size-8 place-items-center rounded-xl",
        kind === "going" ? "bg-going-bg text-going-fg" : "bg-return-bg text-return-fg",
      )}
      aria-hidden
    >
      <Bus className="size-4" />
    </span>
  );
}
