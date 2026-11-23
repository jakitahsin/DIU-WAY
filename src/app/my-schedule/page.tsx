import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ScheduleEditor } from "@/components/schedule/ScheduleEditor";
import { CAMPUS_IMAGES } from "@/lib/constants";
import { getDepartments, getMyFriendProfile } from "@/lib/data";
import { getDhakaClassDay } from "@/lib/date";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Schedule" };

export default async function MySchedulePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await getUser();
  if (!user) redirect("/login?next=/my-schedule");

  const [sp, profile, departments] = await Promise.all([
    searchParams,
    getMyFriendProfile(user.id),
    getDepartments(),
  ]);
  const welcome = sp.welcome === "1" && !profile;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow={profile ? "Edit schedule" : "Join the crew"}
        title={profile ? "My Schedule" : "Add My Schedule"}
        description="Pick your class days and the buses you take. Your friends see it instantly."
      />

      {welcome && (
        <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-navy p-6 text-white animate-rise sm:p-8">
          <Image
            src={CAMPUS_IMAGES.aerial}
            alt=""
            fill
            sizes="900px"
            className="object-cover opacity-25"
          />
          <div className="relative flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lime text-navy">
              <PartyPopper className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold">You&apos;re in! One last step.</h2>
              <p className="mt-1 text-white/80">
                Add your name, department and weekly bus times so the crew knows when to expect you.
              </p>
            </div>
          </div>
        </div>
      )}

      <ScheduleEditor profile={profile} departments={departments} today={getDhakaClassDay()} />
    </div>
  );
}
