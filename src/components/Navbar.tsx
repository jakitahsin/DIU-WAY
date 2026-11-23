import { getSupabaseEnv } from "@/lib/supabase/env";
import { getUser } from "@/lib/supabase/server";
import { NavbarClient } from "./NavbarClient";

/** Server wrapper: knows who is signed in, then renders the interactive bar. */
export async function Navbar() {
  let session: { email: string; name: string | null } | null = null;

  if (getSupabaseEnv()) {
    try {
      const { supabase, user } = await getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        session = {
          email: user.email ?? "",
          name: (data?.full_name as string | undefined) ?? null,
        };
      }
    } catch {
      session = null;
    }
  }

  return <NavbarClient session={session} />;
}
