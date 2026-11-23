"use client";

import { Search, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  label?: string;
  className?: string;
};

/** Name search with keyboard-friendly autocomplete (matches first, last, or partial names). */
export function SearchBar({
  value,
  onChange,
  suggestions = [],
  placeholder = "Search by name…",
  label = "Search by name",
  className,
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return suggestions
      .filter((name) => {
        const n = name.toLowerCase();
        return n.includes(q) || n.split(/\s+/).some((part) => part.startsWith(q));
      })
      .filter((name) => name.toLowerCase() !== q)
      .slice(0, 6);
  }, [value, suggestions]);

  const showList = open && matches.length > 0;

  function choose(name: string) {
    onChange(name);
    setOpen(false);
    setActive(-1);
  }

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => (a + 1) % matches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (a <= 0 ? matches.length - 1 : a - 1));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            choose(matches[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="h-12 w-full rounded-2xl border border-line bg-surface pl-12 pr-11 text-sm font-medium text-ink shadow-card outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
          aria-label="Clear name search"
        >
          <X className="size-4" />
        </button>
      )}
      {showList && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute inset-x-0 top-14 z-30 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift animate-rise"
        >
          {matches.map((name, i) => (
            <li
              key={name}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(name);
              }}
              className={cn(
                "cursor-pointer rounded-xl px-3 py-2 text-sm font-medium",
                i === active ? "bg-brand-soft text-brand-strong" : "text-ink hover:bg-surface-2",
              )}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
