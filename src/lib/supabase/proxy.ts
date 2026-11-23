import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/** Routes anyone can open without signing in. */
const PUBLIC_PATHS = ["/", "/login", "/auth"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")));
}

/**
 * Refreshes the Supabase session cookie on every request and sends
 * signed-out visitors to /login for member-only pages.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const env = getSupabaseEnv();
  if (!env) return response; // Setup screen is shown by the app.

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname + search);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/today";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
