import Link from "next/link";
import { cn } from "@/lib/cn";

/** DIU WAY mark: a road bending toward campus, ending in a lime stop. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <rect width="40" height="40" rx="12" fill="#10243A" />
      <path
        d="M9 31c6-1 8-5 10-10s5-9 12-10"
        fill="none"
        stroke="#147D50"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M9 31c6-1 8-5 10-10s5-9 12-10"
        fill="none"
        stroke="#F7F9F6"
        strokeWidth="1.4"
        strokeDasharray="2.6 3"
        strokeLinecap="round"
      />
      <circle cx="31" cy="11" r="4.2" fill="#C9F56A" />
      <circle cx="9" cy="31" r="2.6" fill="#C9F56A" />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="DIU WAY home"
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg font-extrabold tracking-tight",
            light ? "text-white" : "text-ink",
          )}
        >
          DIU <span className="text-brand">WAY</span>
        </span>
        <span className={cn("text-[10px] font-medium", light ? "text-white/70" : "text-muted")}>
          Together on the Way.
        </span>
      </span>
    </Link>
  );
}
