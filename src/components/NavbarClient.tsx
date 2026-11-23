"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  Home,
  LogIn,
  LogOut,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { NAV_LINKS } from "@/lib/constants";
import { avatarTone, cn, initials } from "@/lib/cn";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const ICONS = {
  home: Home,
  today: CalendarClock,
  friends: Users,
  find: Search,
  schedule: CalendarDays,
} as const;

type Session = { email: string; name: string | null } | null;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function NavbarClient({ session }: { session: Session }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-lime px-4 py-2 font-semibold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-line/80 bg-bg/80 shadow-[0_1px_0_rgb(16_36_58/0.03)] backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <nav
          className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
          aria-label="Main"
        >
          <Logo />

          <ul className="hidden items-center gap-1 rounded-full border border-line bg-surface/70 p-1 shadow-card backdrop-blur md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                      active
                        ? "bg-navy text-white shadow-sm dark:bg-lime dark:text-navy"
                        : "text-ink-soft hover:bg-surface-2 hover:text-ink",
                    )}
                  >
                    {link.label === "Today" ? "Today's Schedule" : link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <AccountMenu key={pathname} session={session} />
          </div>
        </nav>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-3 bottom-3 z-50 rounded-3xl border border-line bg-surface/90 p-1.5 shadow-lift backdrop-blur-xl md:hidden"
        aria-label="Mobile"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        <ul className="grid grid-cols-5">
          {NAV_LINKS.map((link) => {
            const Icon = ICONS[link.icon];
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-semibold transition-colors",
                    active ? "bg-navy text-lime dark:bg-lime dark:text-navy" : "text-muted",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {link.label === "All Friends" ? "Crew" : link.label === "Find Friends" ? "Find" : link.label === "My Schedule" ? "Mine" : link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

function AccountMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!session) {
    return (
      <Link
        href="/login"
        className="inline-flex h-10 items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lift dark:bg-lime dark:text-navy"
      >
        <LogIn className="size-4" aria-hidden /> Sign in
      </Link>
    );
  }

  const label = session.name ?? session.email;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="grid size-10 place-items-center rounded-full ring-2 ring-transparent transition hover:ring-brand/30"
      >
        {session.name ? (
          <span
            className={cn(
              "grid size-9 place-items-center rounded-full font-display text-sm font-bold",
              avatarTone(session.name),
            )}
          >
            {initials(session.name)}
          </span>
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-ink-soft">
            <UserRound className="size-5" />
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-lift animate-rise"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink">{label}</p>
            {session.name && <p className="truncate text-xs text-muted">{session.email}</p>}
          </div>
          <div className="my-1 h-px bg-line" />
          <Link
            role="menuitem"
            href="/my-schedule"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
          >
            <CalendarDays className="size-4" /> {session.name ? "Edit my schedule" : "Set up my schedule"}
          </Link>
          <form action={signOut}>
            <button
              role="menuitem"
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
