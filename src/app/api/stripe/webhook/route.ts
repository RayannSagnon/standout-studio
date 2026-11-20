// Stripe tells us what happened. The signature is checked before anything changes.

import { NextResponse, type NextRequest } from "next/server";
import { stripeEnv } from "@/lib/portal/config";
import { handleStripeEvent } from "@/lib/portal/payments";
import { systemCtx } from "@/lib/portal/server";
import { stripe } from "@/lib/portal/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const s = stripe();
  const { webhookSecret } = stripeEnv();
  if (!s || !webhookSecret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  const raw = await request.text();
  let event;
  try {
    event = s.webhooks.constructEvent(raw, signature ?? "", webhookSecret);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(await systemCtx(), event as unknown as Parameters<typeof handleStripeEvent>[1]);
    return NextResponse.json({ received: true, result });
  } catch (err) {
    console.error("[stripe webhook]", event.type, err);
    // 500 makes Stripe retry later
    return NextResponse.json({ error: "handler" }, { status: 500 });
  }
}
