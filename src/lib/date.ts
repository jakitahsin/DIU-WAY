import { DAYS, type Day } from "./constants";

export const DHAKA_TZ = "Asia/Dhaka";

/** Lower-case weekday name in Bangladesh time, e.g. "sunday" or "friday". */
export function getDhakaWeekday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: DHAKA_TZ })
    .format(now)
    .toLowerCase();
}

/** Today's DIU class day in Dhaka, or null on Friday. */
export function getDhakaClassDay(now: Date = new Date()): Day | null {
  const wd = getDhakaWeekday(now);
  return (DAYS as readonly string[]).includes(wd) ? (wd as Day) : null;
}

/** Human date line, e.g. "Sunday, 23 November". */
export function getDhakaDateLabel(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: DHAKA_TZ,
  }).format(now);
}

/** Next class day after Friday (Saturday). */
export const DAY_AFTER_FRIDAY: Day = "saturday";
