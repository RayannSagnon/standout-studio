// The link from the sign-in email lands here: open the session, then go on.

import { NextResponse, type NextRequest } from "next/server";
import { confirmSignIn } from "@/lib/portal/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = await confirmSignIn(params);
  const fr = (params.get("next") || "").startsWith("/fr") || params.get("lang") === "fr";
  const target = next ?? `${fr ? "/fr" : ""}/client/login?error=link`;
  return NextResponse.redirect(new URL(target, request.nextUrl.origin), { status: 303 });
}
