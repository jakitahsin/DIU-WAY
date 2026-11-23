import Image from "next/image";
import { ArrowRight, CalendarCheck2, Search, UsersRound } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { StatsGrid } from "@/components/StatsGrid";
import { TodayColumn } from "@/components/TodayBoard";
import { ButtonLink } from "@/components/ui/Button";
import { CAMPUS_IMAGES, DAY_LABEL } from "@/lib/constants";
import { getCommuteStats, getRidersForDay, type DayRider } from "@/lib/data";
import { getDhakaClassDay, getDhakaDateLabel } from "@/lib/date";
import { getUser } from "@/lib/supabase/server";

export default async function HomePage() {
  const day = getDhakaClassDay();
  const [stats, { user }] = await Promise.all([getCommuteStats(day), getUser()]);

  let riders: DayRider[] = [];
  if (user && day) {
    riders = await getRidersForDay(day).catch(() => []);
  }

  const steps = [
    {
      icon: CalendarCheck2,
      title: "Add your week",
      body: "Toggle your class days from Saturday to Thursday and tap your bus times. Takes a minute.",
    },
    {
      icon: Search,
      title: "Find your people",
      body: "Filter by day, department, or bus slot to see exactly who's on your ride.",
    },
    {
      icon: UsersRound,
      title: "Ride together",
      body: "Check “Who's going today?” each morning and never wait at the stop alone again.",
    },
  ];

  return (
    <>
      <HeroSection
        dateLabel={getDhakaDateLabel()}
        popularTime={stats?.popular_going ?? null}
        popularCount={stats?.popular_going_count ?? null}
        isFriday={!day}
      />

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:-mt-14 sm:px-6">
        <StatsGrid stats={stats} isFriday={!day} />
        {!stats && (
          <p className="mt-3 text-center text-xs text-muted">
            Live numbers appear once the database is set up (see README → Supabase setup).
          </p>
        )}
      </div>

      {/* How it works */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6" aria-labelledby="how-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">How it works</p>
            <h2 id="how-title" className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Different classes.
              <br />
              <span className="text-brand">Same bus.</span>
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Everyone&apos;s routine is different — 7 AM labs, noon lectures, late returns. DIU WAY
              lines up the crew so you always know who&apos;s on your ride.
            </p>
            <ol className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-navy text-lime dark:bg-lime dark:text-navy">
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">
                      <span className="mr-2 text-muted">0{i + 1}</span>
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift sm:aspect-[5/5]">
              <Image
                src={CAMPUS_IMAGES.students}
                alt="DIU students walking together on the green campus"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover object-[55%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" aria-hidden />
              <p className="absolute bottom-6 left-6 right-6 font-display text-2xl font-bold text-white">
                “Your Campus. Your Friends. <span className="text-lime">Your Ride.</span>”
              </p>
            </div>
            <div className="absolute -left-4 top-8 hidden rounded-2xl border border-line bg-surface/90 p-3 shadow-lift backdrop-blur animate-float sm:block">
              <p className="text-xs font-semibold text-muted">Next to campus</p>
              <p className="font-display text-xl font-extrabold text-going-fg">8:30 AM</p>
            </div>
            <div
              className="absolute -right-3 bottom-24 hidden rounded-2xl border border-line bg-surface/90 p-3 shadow-lift backdrop-blur animate-float sm:block"
              style={{ animationDelay: "1.5s" }}
            >
              <p className="text-xs font-semibold text-muted">Heading home</p>
              <p className="font-display text-xl font-extrabold text-return-fg">4:20 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Today preview */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6" aria-labelledby="today-preview">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              {day ? DAY_LABEL[day] : "Friday"} in Dhaka
            </p>
            <h2 id="today-preview" className="mt-3 font-display text-4xl font-extrabold tracking-tight">
              Today on the road
            </h2>
          </div>
          <ButtonLink href="/today" variant="secondary">
            Full today board <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>

        {!user ? (
          <div className="rounded-[2rem] border border-line bg-surface p-8 text-center shadow-card">
            <h3 className="font-display text-2xl font-bold">Sign in to see who&apos;s riding</h3>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Names and schedules are only visible to crew members. Join with your email — it&apos;s
              free and takes seconds.
            </p>
            <ButtonLink href="/login" className="mt-6">
              Join the crew <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
        ) : !day ? (
          <div className="rounded-[2rem] border border-line bg-surface p-8 text-center shadow-card">
            <h3 className="font-display text-2xl font-bold">It&apos;s Friday — campus is resting.</h3>
            <p className="mt-2 text-muted">Check back tomorrow for Saturday&apos;s rides.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <TodayColumn kind="going" riders={riders} meId={user.id} hideEmpty />
            <TodayColumn kind="returning" riders={riders} meId={user.id} hideEmpty />
          </div>
        )}
      </section>

      {/* Campus band */}
      <section className="mx-auto mt-24 max-w-7xl px-3 sm:px-6" aria-label="DIU campus">
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
          <Image
            src={CAMPUS_IMAGES.aerial}
            alt="Aerial view of Daffodil International University's green permanent campus"
            width={2048}
            height={618}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="h-72 w-full object-cover sm:h-96"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/50 to-transparent" aria-hidden />
          <div className="absolute inset-0 flex flex-col justify-center gap-4 p-8 sm:p-14">
            <h2 className="max-w-lg font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl">
              One campus. <span className="text-lime">One crew.</span> Every ride.
            </h2>
            <div>
              <ButtonLink href="/my-schedule" variant="lime">
                Add My Schedule <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
