"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle2, RotateCcw, Save, Trash2 } from "lucide-react";
import { deleteMyProfile, saveMySchedule } from "@/app/actions/schedule";
import { DAYS } from "@/lib/constants";
import type { Department, Friend } from "@/lib/types";
import { scheduleFormSchema, type ScheduleFormValues } from "@/lib/validation";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { Button } from "../ui/Button";
import { ProfileForm } from "./ProfileForm";
import { WeeklyScheduleForm } from "./WeeklyScheduleForm";

function toFormValues(profile: Friend | null): ScheduleFormValues {
  return {
    full_name: profile?.full_name ?? "",
    department_id: profile?.department.id ?? "",
    custom_department: "",
    days: DAYS.map((day) => {
      const s = profile?.schedules.find((x) => x.day_of_week === day);
      return {
        day,
        active: Boolean(s),
        going: (s?.going_time ?? "") as ScheduleFormValues["days"][number]["going"],
        returning: (s?.returning_time ?? "") as ScheduleFormValues["days"][number]["returning"],
      };
    }),
  };
}

export function ScheduleEditor({
  profile,
  departments,
  today,
}: {
  profile: Friend | null;
  departments: Department[];
  today: string | null;
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [dialog, setDialog] = useState<null | "reset" | "delete">(null);
  const isUpdate = Boolean(profile);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: toFormValues(profile),
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(
    (values) => {
      startSaving(async () => {
        const result = await saveMySchedule(values);
        if (result.ok) {
          toast.success(isUpdate ? "Schedule updated!" : "Welcome aboard! Schedule saved.", {
            description: result.message,
            icon: <CheckCircle2 className="size-5 text-brand" />,
          });
          router.refresh();
          form.reset(values, { keepValues: true });
        } else {
          toast.error("Couldn't save", { description: result.error });
        }
      });
    },
    () => toast.error("Almost there", { description: "Please fix the highlighted fields." }),
  );

  function clearWeek() {
    DAYS.forEach((_, i) => {
      form.setValue(`days.${i}.active`, false, { shouldDirty: true });
      form.setValue(`days.${i}.going`, "", { shouldDirty: true });
      form.setValue(`days.${i}.returning`, "", { shouldDirty: true });
    });
    setDialog(null);
    toast("Week cleared", { description: "Turn on your class days, then save." });
  }

  function removeMe() {
    startDeleting(async () => {
      const result = await deleteMyProfile();
      setDialog(null);
      if (result.ok) {
        toast.success("Removed", { description: result.message });
        form.reset(toFormValues(null));
        router.refresh();
      } else {
        toast.error("Couldn't remove", { description: result.error });
      }
    });
  }

  const dirty = form.formState.isDirty;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <ProfileForm departments={departments} />
        <WeeklyScheduleForm today={today} />

        {/* Sticky action bar */}
        <div className="sticky bottom-24 z-30 md:bottom-4">
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface/90 p-3 shadow-lift backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <p className="px-2 text-sm text-muted">
              {dirty ? (
                <span className="font-semibold text-ink">You have unsaved changes</span>
              ) : isUpdate ? (
                "Everything is saved."
              ) : (
                "Fill in your details, then save."
              )}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setDialog("reset")}>
                <RotateCcw className="size-4" aria-hidden /> Clear week
              </Button>
              <Button type="submit" loading={saving} className="flex-1 sm:flex-none">
                {!saving && <Save className="size-4" aria-hidden />}
                {isUpdate ? "Update My Schedule" : "Save My Schedule"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {isUpdate && (
        <div className="mt-10 flex flex-col items-start justify-between gap-3 rounded-3xl border border-dashed border-line p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-ink">Leaving the crew?</p>
            <p className="text-sm text-muted">Removes your profile and all your class days from DIU WAY.</p>
          </div>
          <Button variant="secondary" onClick={() => setDialog("delete")}>
            <Trash2 className="size-4" aria-hidden /> Remove me
          </Button>
        </div>
      )}

      <ConfirmationDialog
        open={dialog === "reset"}
        title="Clear your whole week?"
        description="All six days will be switched off in the form. Nothing changes until you press save."
        confirmLabel="Clear week"
        onConfirm={clearWeek}
        onCancel={() => setDialog(null)}
      />
      <ConfirmationDialog
        open={dialog === "delete"}
        title="Remove yourself from DIU WAY?"
        description="Your profile and weekly schedule will be deleted for everyone. You can add them again any time."
        confirmLabel="Yes, remove me"
        destructive
        loading={deleting}
        onConfirm={removeMe}
        onCancel={() => setDialog(null)}
      />
    </FormProvider>
  );
}
