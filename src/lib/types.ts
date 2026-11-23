import type { Day } from "./constants";

export type Department = {
  id: string;
  name: string;
  long_name: string | null;
  is_custom: boolean;
};

export type ScheduleEntry = {
  day_of_week: Day;
  going_time: string | null;
  returning_time: string | null;
};

export type Friend = {
  id: string;
  full_name: string;
  department: Department;
  schedules: ScheduleEntry[];
};

export type CommuteStats = {
  total_friends: number;
  going_today: number;
  returning_today: number;
  popular_going: string | null;
  popular_going_count: number | null;
};

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string };
