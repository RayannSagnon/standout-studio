// Contact form → prospect in the admin. Called by the site next to Web3Forms,
// which stays the main delivery: if this fails, the visitor sees nothing wrong.

import { NextResponse, type NextRequest } from "next/server";
import { InputError } from "@/lib/portal/db";
import { portalMode } from "@/lib/portal/config";
import { systemCtx } from "@/lib/portal/server";
import { createLead } from "@/lib/portal/service";

export const dynamic = "force-dynamic";

const recent = new Map<string, number>();

export async function POST(request: NextRequest) {
  if (portalMode() === "off") return new NextResponse(null, { status: 204 });
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) return NextResponse.json({ error: "origin" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "json" }, { status: 400 });
  }
  // Honeypot field (bots fill every input)
  if (body.botcheck) return new NextResponse(null, { status: 204 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const last = recent.get(ip) ?? 0;
  if (Date.now() - last < 20_000) return NextResponse.json({ error: "slow_down" }, { status: 429 });
  recent.set(ip, Date.now());

  try {
    await createLead(await systemCtx(), body);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof InputError) return NextResponse.json({ error: err.field }, { status: 400 });
    console.error("[leads]", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
