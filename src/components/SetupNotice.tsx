import { Database } from "lucide-react";

/** Shown instead of the app when Supabase env vars are missing. */
export function SetupNotice() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <div className="rounded-3xl border border-line bg-surface p-8 shadow-card">
        <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-navy text-lime">
          <Database className="size-7" aria-hidden />
        </div>
        <h1 className="font-display text-3xl font-bold">Connect Supabase to start</h1>
        <p className="mt-3 text-muted">
          DIU WAY needs a Supabase project for sign-in and schedules. Add these to{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm">.env.local</code> (or your
          Vercel project settings) and restart:
        </p>
        <pre className="mt-5 overflow-x-auto rounded-2xl bg-navy p-4 text-sm text-lime">
{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`}
        </pre>
        <p className="mt-5 text-sm text-muted">
          Then run <code>supabase/migrations/20261123000000_init.sql</code> in the Supabase SQL
          editor. Full steps are in the README.
        </p>
      </div>
    </section>
  );
}
