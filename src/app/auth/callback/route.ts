import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** Handles magic-link and email-confirmation redirects from Supabase Auth. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/today";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/today";

  const supabase = await createClient();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/login?error=link", origin));
  }

  // First visit? Send them to set up their schedule.
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user) {
    const { data } = await supabase.from("profiles").select("id").eq("id", auth.user.id).maybeSingle();
    if (!data) return NextResponse.redirect(new URL("/my-schedule?welcome=1", origin));
  }
  return NextResponse.redirect(new URL(next, origin));
}
