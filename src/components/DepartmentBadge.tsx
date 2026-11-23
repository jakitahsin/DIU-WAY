import { GraduationCap } from "lucide-react";
import type { Department } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DepartmentBadge({
  department,
  className,
}: {
  department: Pick<Department, "name" | "long_name">;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-strong",
        className,
      )}
      title={department.long_name ?? department.name}
    >
      <GraduationCap className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{department.name}</span>
    </span>
  );
}
