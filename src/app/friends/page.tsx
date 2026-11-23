import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getAllFriends, getDepartments } from "@/lib/data";
import { getDhakaClassDay } from "@/lib/date";
import { getUser } from "@/lib/supabase/server";
import { CrewBrowser } from "./CrewBrowser";

export const metadata: Metadata = { title: "Our Travel Crew" };

export default async function FriendsPage() {
  const [{ user }, friends, departments] = await Promise.all([
    getUser(),
    getAllFriends(),
    getDepartments(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="All friends"
        title="Our Travel Crew"
        description="Everyone who rides to DIU with us, with their weekly plan at a glance."
      >
        <div className="flex items-center gap-3 rounded-3xl border border-line bg-surface px-5 py-3 shadow-card">
          <span className="grid size-10 place-items-center rounded-2xl bg-navy text-lime dark:bg-lime dark:text-navy">
            <Users className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold leading-none tabular-nums">{friends.length}</p>
            <p className="text-xs font-semibold text-muted">registered members</p>
          </div>
        </div>
      </PageHeader>

      <CrewBrowser friends={friends} departments={departments} meId={user?.id ?? null} today={getDhakaClassDay()} />
    </div>
  );
}
