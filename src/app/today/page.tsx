import type { Metadata } from "next";
import { CalendarPlus, Coffee } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { TodayColumn } from "@/components/TodayBoard";
import { ButtonLink } from "@/components/ui/Button";
import { DAY_LABEL } from "@/lib/constants";
import { getRidersForDay } from "@/lib/data";
import { DAY_AFTER_FRIDAY, getDhakaClassDay, getDhakaDateLabel } from "@/lib/date";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Today's Schedule" };

export default async function TodayPage() {
  const today = getDhakaClassDay();
  const isFriday = !today;
  const day = today ?? DAY_AFTER_FRIDAY;

  const [{ user }, riders] = await Promise.all([getUser(), getRidersForDay(day)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow={`${getDhakaDateLabel()} · Asia/Dhaka`}
        title={isFriday ? "Friday — no classes" : `${DAY_LABEL[day]}'s rides`}
        description={
          isFriday
            ? "DIU is off today. Here's who's riding tomorrow (Saturday) so you can plan ahead."
            : "Everyone with class today, grouped by the bus they're catching."
        }
      >
        <ButtonLink href="/my-schedule" variant="secondary">
          <CalendarPlus className="size-4" aria-hidden /> Update my times
        </ButtonLink>
      </PageHeader>

      {isFriday && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-lime-soft px-4 py-3 text-sm font-medium text-ink animate-fade">
          <Coffee className="size-5 text-brand" aria-hidden />
          Showing Saturday&apos;s plan.
        </div>
      )}

      {riders.length === 0 ? (
        <EmptyState
          title={`No one has class on ${DAY_LABEL[day]} yet`}
          description="When friends add this day to their schedule, they'll show up here, grouped by bus time."
          action={<ButtonLink href="/my-schedule">Add my schedule</ButtonLink>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <TodayColumn kind="going" riders={riders} meId={user?.id} />
          <TodayColumn kind="returning" riders={riders} meId={user?.id} />
        </div>
      )}
    </div>
  );
}
