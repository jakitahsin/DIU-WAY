"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Mail, MailCheck, Wand2 } from "lucide-react";
import { resendConfirmation, sendMagicLink, signInWithPassword, signUpWithPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup" | "magic";

const TABS: { mode: Mode; label: string }[] = [
  { mode: "signin", label: "Sign in" },
  { mode: "signup", label: "Create account" },
  { mode: "magic", label: "Magic link" },
];

export function LoginForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [sentKind, setSentKind] = useState<Mode>("signin");
  const [pending, start] = useTransition();
  const [resending, startResend] = useTransition();

  function resend() {
    startResend(async () => {
      const r = await resendConfirmation(email);
      if (r.ok) toast.success(r.message ?? "Sent again");
      else toast.error("Couldn't resend", { description: r.error });
    });
  }

  const needsConfirm = Boolean(error && /confirm your email/i.test(error));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const result =
        mode === "signin"
          ? await signInWithPassword(email, password, next)
          : mode === "signup"
            ? await signUpWithPassword(email, password)
            : await sendMagicLink(email, next);
      // A successful sign-in redirects on the server and never returns here.
      if (!result) return;
      if (result.ok) {
        setSentKind(mode);
        setSent(result.message ?? "Check your inbox.");
        toast.success(result.message ?? "Done");
      } else {
        setError(result.error);
      }
    });
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-3xl border border-line bg-surface p-8 text-center shadow-card animate-rise">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-lime text-navy">
          <MailCheck className="size-7" aria-hidden />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold">Check your email</h2>
        <p className="mt-2 text-muted">{sent}</p>
        <p className="mt-1 text-sm text-muted">Sent to <strong className="text-ink">{email}</strong></p>
        <div className="mt-6 flex flex-col items-center gap-2">
          {sentKind === "signup" && (
            <Button variant="secondary" onClick={resend} loading={resending}>
              Resend confirmation email
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              setSent(null);
              setMode("signin");
            }}
          >
            I&apos;ve confirmed — sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
      <div role="tablist" aria-label="Sign-in method" className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1">
        {TABS.map((t) => (
          <button
            key={t.mode}
            type="button"
            role="tab"
            aria-selected={mode === t.mode}
            onClick={() => {
              setMode(t.mode);
              setError(null);
            }}
            className={cn(
              "h-10 rounded-xl text-sm font-semibold transition-all",
              mode === t.mode ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@diu.edu.bd"
            className="h-12 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-base text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </div>
      </div>

      {mode !== "magic" && (
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold">
            Password
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              className="h-12 w-full rounded-2xl border border-line bg-surface pl-12 pr-12 text-base text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      )}

      {mode === "magic" && (
        <p className="flex items-start gap-2 rounded-2xl bg-lime-soft px-4 py-3 text-sm text-ink">
          <Wand2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          No password needed — we&apos;ll email you a one-tap sign-in link.
        </p>
      )}

      {error && (
        <p className="rounded-2xl bg-[#fdecea] px-4 py-3 text-sm font-medium text-[#a93226]" role="alert">
          {error}
          {needsConfirm && (
            <button type="button" onClick={resend} disabled={resending} className="mt-2 block font-semibold underline">
              {resending ? "Sending…" : "Resend confirmation email"}
            </button>
          )}
        </p>
      )}

      <Button type="submit" size="lg" loading={pending} className="w-full">
        {mode === "signin" ? "Sign in" : mode === "signup" ? "Create my account" : "Send magic link"}
      </Button>
    </form>
  );
}
