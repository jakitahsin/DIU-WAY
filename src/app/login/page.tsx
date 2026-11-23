import type { Metadata } from "next";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { CAMPUS_IMAGES } from "@/lib/constants";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const linkError = sp.error === "link";

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-14">
      <div className="relative hidden min-h-[560px] overflow-hidden rounded-[2.5rem] lg:block">
        <Image
          src={CAMPUS_IMAGES.students}
          alt="Friends walking together across the DIU campus"
          fill
          sizes="600px"
          className="object-cover object-[55%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <Logo light />
          <p className="mt-6 font-display text-4xl font-extrabold leading-tight text-white">
            Your Campus. Your Friends. <span className="text-lime">Your Ride.</span>
          </p>
          <p className="mt-3 text-white/75">
            Sign in to see who&apos;s on your bus and share your weekly plan with the crew.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md animate-rise">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Welcome to the crew</h1>
        <p className="mt-2 text-muted">Sign in or create an account with your email.</p>
        {linkError && (
          <p className="mt-4 rounded-2xl bg-[#fdecea] px-4 py-3 text-sm font-medium text-[#a93226]" role="alert">
            That sign-in link is invalid or expired. Please request a new one.
          </p>
        )}
        <LoginForm next={next} />
      </div>
    </div>
  );
}
