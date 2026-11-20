// Daily reminders (vercel.json cron). Vercel sends "Authorization: Bearer CRON_SECRET".

import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { cronSecret, portalMode } from "@/lib/portal/config";
import { systemCtx } from "@/lib/portal/server";
import { runReminders } from "@/lib/portal/service";

export const dynamic = "force-dynamic";

function authorized(header: string | null) {
  const secret = cronSecret();
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!authorized(request.headers.get("authorization"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (portalMode() === "off") return NextResponse.json({ skipped: "portal off" });
  const result = await runReminders(await systemCtx());
  return NextResponse.json(result);
}
