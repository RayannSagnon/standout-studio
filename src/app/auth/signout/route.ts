import { NextResponse, type NextRequest } from "next/server";
import { signOut } from "@/lib/portal/server";

export async function POST(request: NextRequest) {
  await signOut();
  return NextResponse.redirect(new URL("/fr/client/login", request.nextUrl.origin), { status: 303 });
}
