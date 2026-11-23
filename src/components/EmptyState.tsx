import type { LucideIcon } from "lucide-react";
import { Bus } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon: Icon = Bus,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center animate-fade">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-lime/40 blur-xl" aria-hidden />
        <div className="relative grid size-16 place-items-center rounded-3xl bg-navy text-lime animate-float">
          <Icon className="size-7" aria-hidden />
        </div>
      </div>
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
