import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "lime" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 select-none " +
  "active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_8px_20px_-8px_rgb(20_125_80/0.6)] hover:bg-brand-strong hover:-translate-y-0.5 dark:text-[#06240f]",
  lime: "bg-lime text-navy shadow-[0_8px_20px_-8px_rgb(140_190_40/0.7)] hover:brightness-95 hover:-translate-y-0.5",
  secondary:
    "bg-surface text-ink border border-line hover:border-brand/40 hover:bg-brand-soft hover:-translate-y-0.5",
  ghost: "text-ink-soft hover:bg-surface-2 hover:text-ink",
  danger: "bg-[#c0392b] text-white hover:bg-[#a93226]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...props
}: Common & ComponentProps<"button"> & { loading?: boolean }) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
