import { z } from "zod";
import { DAYS, GOING_TIMES, RETURNING_TIMES } from "./constants";

export const OTHER_DEPARTMENT = "other";

const daySchema = z.object({
  day: z.enum(DAYS),
  active: z.boolean(),
  going: z.union([z.enum(GOING_TIMES), z.literal("")]),
  returning: z.union([z.enum(RETURNING_TIMES), z.literal("")]),
});

export const scheduleFormSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, { message: "Please enter your full name." })
      .max(80, { message: "Name is too long (80 characters max)." })
      .regex(/^[\p{L}\p{M} .'\-]+$/u, {
        message: "Use letters, spaces, dots, apostrophes or hyphens only.",
      }),
    department_id: z.string().min(1, { message: "Pick your department." }),
    custom_department: z.string().trim().max(80, { message: "80 characters max." }),
    days: z.array(daySchema).length(DAYS.length),
  })
  .superRefine((value, ctx) => {
    if (value.department_id === OTHER_DEPARTMENT && value.custom_department.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["custom_department"],
        message: "Type your department name (at least 2 characters).",
      });
    }
    value.days.forEach((d, i) => {
      if (d.active && !d.going && !d.returning) {
        ctx.addIssue({
          code: "custom",
          path: ["days", i, "going"],
          message: "Pick at least one bus time for this day.",
        });
      }
    });
    if (!value.days.some((d) => d.active)) {
      ctx.addIssue({
        code: "custom",
        path: ["days"],
        message: "Turn on at least one class day.",
      });
    }
  });

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export const emailSchema = z.string().trim().email({ message: "Enter a valid email address." });
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." })
  .max(72, { message: "Password is too long." });
