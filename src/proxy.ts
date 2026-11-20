import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PORTAL = /^\/(?:fr\/)?client(?:\/|$)|^\/(?:admin|auth)(?:\/|$)/;

export async function proxy(request: NextRequest) {
  const locale = request.nextUrl.pathname.startsWith("/fr") ? "fr" : "en";
  const forward = new Headers(request.headers);
  forward.set("x-locale", locale);
  let response = NextResponse.next({ request: { headers: forward } });
  response.headers.set("x-locale", locale);

  // Client and admin areas: keep the Supabase session fresh (Server Components cannot write cookies).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key && PORTAL.test(request.nextUrl.pathname)) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: forward } });
          response.headers.set("x-locale", locale);
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
  }
  if (PORTAL.test(request.nextUrl.pathname)) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  // Exclude PostHog proxy path so rewrites are not intercepted.
  matcher: ["/((?!api|ss-ph|_next/static|_next/image|.*\\..*).*)"],
};
