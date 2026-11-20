// Stripe Checkout sessions for invoices and the monthly care plan.

import "server-only";
import Stripe from "stripe";
import { stripeEnv } from "./config.ts";
import { clientUrl, type Ctx } from "./service.ts";
import { CARE_PRICE_CENTS, invoiceTotal, type Client, type Invoice } from "./types.ts";

let client: Stripe | null = null;
export function stripe(): Stripe | null {
  const { secret } = stripeEnv();
  if (!secret) return null;
  return (client ??= new Stripe(secret));
}

export async function invoiceCheckoutUrl(ctx: Ctx, invoice: Invoice, c: Client, payerEmail: string): Promise<string> {
  const s = stripe();
  if (!s) throw new Error("stripe not configured");
  const session = await s.checkout.sessions.create({
    mode: "payment",
    customer_email: payerEmail,
    locale: c.lang === "fr" ? "fr-CA" : "en",
    line_items: [
      {
        quantity: 1,
        price_data: { currency: "cad", unit_amount: invoiceTotal(invoice), product_data: { name: `${invoice.number} · ${invoice.label}` } },
      },
    ],
    metadata: { kind: "invoice", invoice_id: invoice.id, client_id: c.id },
    payment_intent_data: { metadata: { kind: "invoice", invoice_id: invoice.id, client_id: c.id } },
    success_url: `${clientUrl(ctx, c.lang)}?paid=${invoice.id}#invoices`,
    cancel_url: `${clientUrl(ctx, c.lang)}#invoices`,
  });
  if (!session.url) throw new Error("stripe returned no checkout url");
  return session.url;
}

export async function careCheckoutUrl(ctx: Ctx, c: Client, payerEmail: string): Promise<string> {
  const s = stripe();
  if (!s) throw new Error("stripe not configured");
  const session = await s.checkout.sessions.create({
    mode: "subscription",
    customer_email: payerEmail,
    locale: c.lang === "fr" ? "fr-CA" : "en",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: CARE_PRICE_CENTS,
          recurring: { interval: "month" },
          product_data: { name: c.lang === "fr" ? "Hébergement et entretien Standout" : "Standout hosting and care" },
        },
      },
    ],
    metadata: { kind: "care", client_id: c.id },
    subscription_data: { metadata: { kind: "care", client_id: c.id } },
    success_url: `${clientUrl(ctx, c.lang)}?care=1#care`,
    cancel_url: `${clientUrl(ctx, c.lang)}#care`,
  });
  if (!session.url) throw new Error("stripe returned no checkout url");
  return session.url;
}

/** A link to Stripe's own page where the client manages or stops the care plan. */
export async function billingPortalUrl(ctx: Ctx, c: Client, customerId: string): Promise<string> {
  const s = stripe();
  if (!s) throw new Error("stripe not configured");
  const session = await s.billingPortal.sessions.create({ customer: customerId, return_url: `${clientUrl(ctx, c.lang)}#care` });
  return session.url;
}
