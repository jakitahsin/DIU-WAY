"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { OTHER_DEPARTMENT, scheduleFormSchema, type ScheduleFormValues } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function refreshAll() {
  for (const path of ["/", "/today", "/friends", "/find", "/my-schedule"]) revalidatePath(path);
}

/** Create or update the caller's profile and whole week in one transaction. */
export async function saveMySchedule(input: ScheduleFormValues): Promise<ActionResult> {
  const parsed = scheduleFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const values = parsed.data;

  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Your session expired. Please sign in again." };

  const isOther = values.department_id === OTHER_DEPARTMENT;
  if (!isOther && !UUID_RE.test(values.department_id)) {
    return { ok: false, error: "Please pick a department from the list." };
  }

  const schedule = values.days
    .filter((d) => d.active)
    .map((d) => ({ day: d.day, going: d.going || null, returning: d.returning || null }));

  const { error } = await supabase.rpc("save_my_schedule", {
    p_full_name: values.full_name,
    p_department_id: isOther ? null : values.department_id,
    p_custom_department: isOther ? values.custom_department : null,
    p_schedule: schedule,
  });

  if (error) {
    console.error("save_my_schedule failed", error);
    return { ok: false, error: friendlyDbError(error.message) };
  }

  refreshAll();
  return { ok: true, message: "Your schedule is live for the crew." };
}

/** Remove the caller's profile (schedules cascade). The login itself stays. */
export async function deleteMyProfile(): Promise<ActionResult> {
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, error: "Your session expired. Please sign in again." };

  const { error } = await supabase.from("profiles").delete().eq("id", user.id);
  if (error) return { ok: false, error: friendlyDbError(error.message) };

  refreshAll();
  return { ok: true, message: "You have been removed from the crew." };
}

function friendlyDbError(message: string) {
  if (/department/i.test(message)) return message;
  if (/check constraint|violates/i.test(message)) return "Some values were not accepted. Please review the form.";
  if (/JWT|auth/i.test(message)) return "Your session expired. Please sign in again.";
  return "Could not save right now. Please try again.";
}
