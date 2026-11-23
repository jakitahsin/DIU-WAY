import Image from "next/image";
import { ArrowRight, CalendarPlus, MapPin, Search, Sparkles } from "lucide-react";
import { CAMPUS_IMAGES, formatTime } from "@/lib/constants";
import { ButtonLink } from "./ui/Button";

type Props = {
  dateLabel: string;
  popularTime: string | null;
  popularCount: number | null;
  isFriday: boolean;
};

export function HeroSection({ dateLabel, popularTime, popularCount, isFriday }: Props) {
  return (
    <section className="px-3 pt-2 sm:px-6">
      <div className="relative mx-auto min-h-[600px] max-w-7xl overflow-hidden rounded-[2rem] bg-navy sm:min-h-[640px] sm:rounded-[2.5rem]">
        <Image
          src={CAMPUS_IMAGES.building}
          alt="Daffodil International University permanent campus building at Daffodil Smart City, Ashulia"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-[60%_center] opacity-90"
        />
        {/* Overlays for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1a2b]/95 via-[#10243a]/75 to-[#10243a]/10" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a2b]/90 via-transparent to-transparent" aria-hidden />
        <div className="absolute -left-24 top-10 size-80 rounded-full bg-brand/40 blur-3xl" aria-hidden />

        <div className="relative z-10 flex min-h-[600px] flex-col justify-between gap-10 px-6 pb-20 pt-12 sm:pb-24 sm:min-h-[640px] sm:px-12 sm:pt-16 lg:px-16">
          <div className="max-w-2xl animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <MapPin className="size-3.5 text-lime" aria-hidden />
              Daffodil Smart City · Ashulia
            </span>
            <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Going to DIU?
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-lime">Let&apos;s Go Together.</span>
                <span className="absolute -bottom-1 left-0 right-0 h-1.5 rounded-full road-line opacity-80" aria-hidden />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Know who&apos;s heading to campus, when they&apos;re going, and when they&apos;re coming
              back. Coordinate your commute with your friends effortlessly.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/find" variant="lime" size="lg">
                <Search className="size-5" aria-hidden /> Find Your Friends
              </ButtonLink>
              <ButtonLink
                href="/my-schedule"
                size="lg"
                variant="secondary"
                className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <CalendarPlus className="size-5" aria-hidden /> Add My Schedule
              </ButtonLink>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div
              className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md animate-rise sm:w-auto"
              style={{ animationDelay: "150ms" }}
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/60">
                <Sparkles className="size-3.5 text-lime" aria-hidden /> {dateLabel}
              </p>
              {isFriday ? (
                <p className="mt-2 font-display text-xl font-bold">Friday — no classes. Rest up!</p>
              ) : popularTime ? (
                <p className="mt-2 font-display text-xl font-bold">
                  Crowd favourite bus:{" "}
                  <span className="text-lime">{formatTime(popularTime)}</span>
                  <span className="block text-sm font-medium text-white/70">
                    {popularCount} {popularCount === 1 ? "friend is" : "friends are"} taking it today
                  </span>
                </p>
              ) : (
                <p className="mt-2 font-display text-xl font-bold">
                  Nobody&apos;s posted today yet — be the first.
                </p>
              )}
            </div>
            <a
              href="#stats"
              className="hidden items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-lime sm:inline-flex"
            >
              See today&apos;s numbers <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
