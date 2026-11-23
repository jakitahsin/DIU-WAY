import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";

/** Supabase client bound to the signed-in user's cookies (RLS applies). */
export async function createClient() {
  // Read cookies first: marks the route as dynamic (never prerendered).
  const cookieStore = await cookies();
  const { url, key } = requireSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — the proxy refreshes sessions instead.
        }
      },
    },
  });
}

/** The current user, verified with Supabase Auth (not just the cookie). */
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
}
