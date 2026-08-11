import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const locale = request.nextUrl.pathname.startsWith("/fr") ? "fr" : "en";
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  return response;
}

export const config = {
  // Exclude PostHog proxy path so rewrites are not intercepted.
  matcher: ["/((?!api|ss-ph|_next/static|_next/image|.*\\..*).*)"],
};
