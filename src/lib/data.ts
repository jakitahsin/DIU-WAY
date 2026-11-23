import "server-only";
import { DAYS, isDay, type Day } from "./constants";
import { createClient } from "./supabase/server";
import type { CommuteStats, Department, Friend, ScheduleEntry } from "./types";

/* ------------------------------------------------------------------ */
/* Row mapping (PostgREST embeds can arrive as object or array)        */
/* ------------------------------------------------------------------ */

type Raw = Record<string, unknown>;

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toDepartment(raw: unknown): Department {
  const d = (one(raw as Raw | Raw[]) ?? {}) as Raw;
  return {
    id: String(d.id ?? ""),
    name: String(d.name ?? "Unknown"),
    long_name: (d.long_name as string | null) ?? null,
    is_custom: Boolean(d.is_custom),
  };
}

const dayOrder = (d: Day) => DAYS.indexOf(d);

function toSchedules(raw: unknown): ScheduleEntry[] {
  const rows = (Array.isArray(raw) ? raw : raw ? [raw] : []) as Raw[];
  return rows
    .filter((r) => isDay(r.day_of_week))
    .map((r) => ({
      day_of_week: r.day_of_week as Day,
      going_time: (r.going_time as string | null) ?? null,
      returning_time: (r.returning_time as string | null) ?? null,
    }))
    .sort((a, b) => dayOrder(a.day_of_week) - dayOrder(b.day_of_week));
}

function toFriend(raw: Raw, schedules: unknown = raw.schedules): Friend {
  return {
    id: String(raw.id),
    full_name: String(raw.full_name),
    department: toDepartment(raw.department),
    schedules: toSchedules(schedules),
  };
}

const DEPT_FIELDS = "id, name, long_name, is_custom";
const FRIEND_SELECT = `id, full_name,
  department:departments!profiles_department_id_fkey(${DEPT_FIELDS}),
  schedules:weekly_schedules(day_of_week, going_time, returning_time)`;

/* ------------------------------------------------------------------ */
/* Queries                                                            */
/* ------------------------------------------------------------------ */

export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select(DEPT_FIELDS)
    .order("is_custom", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((d) => toDepartment(d));
}

/** Aggregate counts only — works for visitors too (security-definer RPC). */
export async function getCommuteStats(day: Day | null): Promise<CommuteStats | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_commute_stats", { p_day: day ?? "friday" });
  if (error || !data) return null;
  const s = data as Raw;
  return {
    total_friends: Number(s.total_friends ?? 0),
    going_today: Number(s.going_today ?? 0),
    returning_today: Number(s.returning_today ?? 0),
    popular_going: (s.popular_going as string | null) ?? null,
    popular_going_count: s.popular_going_count == null ? null : Number(s.popular_going_count),
  };
}

export async function getAllFriends(): Promise<Friend[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(FRIEND_SELECT)
    .order("full_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toFriend(r as Raw));
}

export async function getMyFriendProfile(userId: string): Promise<Friend | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(FRIEND_SELECT)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toFriend(data as Raw) : null;
}

export type DayRider = {
  id: string;
  full_name: string;
  department: Department;
  going_time: string | null;
  returning_time: string | null;
};

/** Everyone with a class on `day`. */
export async function getRidersForDay(day: Day): Promise<DayRider[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weekly_schedules")
    .select(
      `going_time, returning_time,
       profile:profiles!inner(id, full_name,
         department:departments!profiles_department_id_fkey(${DEPT_FIELDS}))`,
    )
    .eq("day_of_week", day);
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => {
      const r = row as Raw;
      const p = (one(r.profile as Raw | Raw[]) ?? {}) as Raw;
      return {
        id: String(p.id),
        full_name: String(p.full_name),
        department: toDepartment(p.department),
        going_time: (r.going_time as string | null) ?? null,
        returning_time: (r.returning_time as string | null) ?? null,
      };
    })
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export type FriendFilters = {
  q?: string;
  department?: string;
  days?: Day[];
  going?: string;
  returning?: string;
};

/**
 * Server-side combined search. Filters run in Postgres; each friend is
 * returned once with only the schedule days that matched.
 */
export async function searchFriends(filters: FriendFilters): Promise<Friend[]> {
  const supabase = await createClient();
  const hasScheduleFilter = Boolean(filters.days?.length || filters.going || filters.returning);

  // Name / department only: search profiles, keep the whole week.
  if (!hasScheduleFilter) {
    let query = supabase.from("profiles").select(FRIEND_SELECT);
    if (filters.q) query = query.ilike("full_name", `%${escapeLike(filters.q)}%`);
    if (filters.department) query = query.eq("department_id", filters.department);
    const { data, error } = await query.order("full_name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => toFriend(r as Raw));
  }

  let query = supabase
    .from("weekly_schedules")
    .select(
      `day_of_week, going_time, returning_time,
       profiles!inner(id, full_name, department_id,
         department:departments!profiles_department_id_fkey(${DEPT_FIELDS}))`,
    );
  if (filters.days?.length) query = query.in("day_of_week", filters.days);
  if (filters.going) query = query.eq("going_time", filters.going);
  if (filters.returning) query = query.eq("returning_time", filters.returning);
  if (filters.q) query = query.ilike("profiles.full_name", `%${escapeLike(filters.q)}%`);
  if (filters.department) query = query.eq("profiles.department_id", filters.department);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const byId = new Map<string, { profile: Raw; rows: Raw[] }>();
  for (const row of (data ?? []) as Raw[]) {
    const profile = one(row.profiles as Raw | Raw[]);
    if (!profile) continue;
    const id = String(profile.id);
    const entry = byId.get(id) ?? { profile, rows: [] };
    entry.rows.push(row);
    byId.set(id, entry);
  }
  return [...byId.values()]
    .map(({ profile, rows }) => toFriend(profile, rows))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

/** Names for the autocomplete box (members only, via RLS). */
export async function getFriendNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("full_name").order("full_name");
  return (data ?? []).map((r) => String((r as Raw).full_name));
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`).replace(/[,()]/g, " ");
}
