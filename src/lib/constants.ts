export const APP_NAME = "DIU WAY";
export const TAGLINE = "Together on the Way.";
export const ALT_TAGLINE = "Your Campus. Your Friends. Your Ride.";

/** DIU class days — Friday is the weekly holiday, so it is not included. */
export const DAYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
] as const;
export type Day = (typeof DAYS)[number];

export const DAY_LABEL: Record<Day, string> = {
  saturday: "Saturday",
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
};

export const DAY_SHORT: Record<Day, string> = {
  saturday: "Sat",
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
};

/** Bus departure slots to campus (stored as 24h HH:MM). */
export const GOING_TIMES = ["07:00", "08:30", "10:00", "12:00"] as const;
export type GoingTime = (typeof GOING_TIMES)[number];

/** Bus departure slots back home (stored as 24h HH:MM). */
export const RETURNING_TIMES = ["11:15", "13:20", "15:00", "16:20", "18:10"] as const;
export type ReturningTime = (typeof RETURNING_TIMES)[number];

/** "16:20" -> "4:20 PM" */
export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  const [hStr, m] = value.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}

export function isDay(value: unknown): value is Day {
  return typeof value === "string" && (DAYS as readonly string[]).includes(value);
}
export function isGoingTime(value: unknown): value is GoingTime {
  return typeof value === "string" && (GOING_TIMES as readonly string[]).includes(value);
}
export function isReturningTime(value: unknown): value is ReturningTime {
  return typeof value === "string" && (RETURNING_TIMES as readonly string[]).includes(value);
}

/** Official DIU imagery (hot-linked from daffodilvarsity.edu.bd). */
export const CAMPUS_IMAGES = {
  building: "https://daffodilvarsity.edu.bd/images/banner.png",
  students: "https://daffodilvarsity.edu.bd/images/bg.jpeg",
  aerial: "https://daffodilvarsity.edu.bd/images/faculty-banner.jpg",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/today", label: "Today", icon: "today" },
  { href: "/friends", label: "All Friends", icon: "friends" },
  { href: "/find", label: "Find Friends", icon: "find" },
  { href: "/my-schedule", label: "My Schedule", icon: "schedule" },
] as const;
