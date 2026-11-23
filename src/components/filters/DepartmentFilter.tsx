"use client";

import { ChevronDown, GraduationCap } from "lucide-react";
import { useId } from "react";
import type { Department } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DepartmentFilter({
  departments,
  value,
  onChange,
  className,
}: {
  departments: Department[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const id = useId();
  const preset = departments.filter((d) => !d.is_custom);
  const custom = departments.filter((d) => d.is_custom);

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Department
      </label>
      <GraduationCap className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-2xl border border-line bg-surface pl-12 pr-10 text-sm font-medium text-ink shadow-card outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
      >
        <option value="">All departments</option>
        <optgroup label="DIU departments">
          {preset.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
              {d.long_name && d.long_name !== d.name ? ` — ${d.long_name}` : ""}
            </option>
          ))}
        </optgroup>
        {custom.length > 0 && (
          <optgroup label="Added by friends">
            {custom.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
}
