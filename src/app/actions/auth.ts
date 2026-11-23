"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { emailSchema, passwordSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Only allow same-site relative redirects. */
function safeNext(next: unknown, fallback = "/today") {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function authError(message: string) {
  if (/invalid login/i.test(message)) return "Wrong email or password.";
  if (/email not confirmed/i.test(message)) return "Please confirm your email first — check your inbox.";
  if (/already registered/i.test(message)) return "That email already has an account. Sign in instead.";
  if (/rate limit/i.test(message)) return "Too many attempts. Please wait a minute and try again.";
  return message;
}

/** Decide where to land: new members go to fill in their schedule first. */
async function landingFor(next: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return next;
  const { data } = await supabase.from("profiles").select("id").eq("id", auth.user.id).maybeSingle();
  return data ? next : "/my-schedule?welcome=1";
}

export async function signInWithPassword(
  email: string,
  password: string,
  next?: string,
): Promise<ActionResult> {
  const e = emailSchema.safeParse(email);
  if (!e.success) return { ok: false, error: e.error.issues[0].message };
  if (!password) return { ok: false, error: "Enter your password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: e.data, password });
  if (error) return { ok: false, error: authError(error.message) };

  revalidatePath("/", "layout");
  redirect(await landingFor(safeNext(next)));
}

export async function signUpWithPassword(email: string, password: string): Promise<ActionResult> {
  const e = emailSchema.safeParse(email);
  if (!e.success) return { ok: false, error: e.error.issues[0].message };
  const p = passwordSchema.safeParse(password);
  if (!p.success) return { ok: false, error: p.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: e.data,
    password: p.data,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback?next=/my-schedule?welcome=1` },
  });
  if (error) return { ok: false, error: authError(error.message) };

  // Email confirmation disabled in Supabase -> session exists right away.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/my-schedule?welcome=1");
  }
  return { ok: true, message: "Check your inbox to confirm your email, then you're in." };
}

export async function sendMagicLink(email: string, next?: string): Promise<ActionResult> {
  const e = emailSchema.safeParse(email);
  if (!e.success) return { ok: false, error: e.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: e.data,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
    },
  });
  if (error) return { ok: false, error: authError(error.message) };
  return { ok: true, message: "Magic link sent! Open it on this device to sign in." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
