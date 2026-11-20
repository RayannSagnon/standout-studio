// What a verified Stripe event changes. Kept free of the Stripe SDK so it can be
// tested; the webhook route verifies the signature before calling this.

import { findClientBySubscription, markInvoicePaid, setCareStatus, type Ctx } from "./service.ts";
import type { SubscriptionStatus } from "./types.ts";

export type StripeEventLike = {
  type: string;
  data: { object: Record<string, unknown> };
};

const str = (v: unknown) => (typeof v === "string" ? v : null);
const meta = (o: Record<string, unknown>) => (o.metadata && typeof o.metadata === "object" ? (o.metadata as Record<string, string>) : {});

function careStatus(stripeStatus: unknown): SubscriptionStatus | null {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return null;
  }
}

/** Returns what was done, for the webhook log. Unknown events are ignored. */
export async function handleStripeEvent(ctx: Ctx, event: StripeEventLike): Promise<string> {
  const o = event.data.object;
  const m = meta(o);

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    if (m.kind === "invoice" && m.invoice_id) {
      if (o.payment_status !== "paid") return "invoice: payment not settled yet";
      await markInvoicePaid(ctx, m.invoice_id, "stripe", str(o.id));
      return `invoice ${m.invoice_id} paid`;
    }
    if (m.kind === "care" && m.client_id) {
      await setCareStatus(ctx, m.client_id, "active", { customer: str(o.customer), subscription: str(o.subscription) });
      return `care active for ${m.client_id}`;
    }
    return "checkout: not ours";
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subId = str(o.id);
    const clientId = m.client_id || (subId ? await findClientBySubscription(ctx, subId) : null);
    if (!clientId) return "subscription: unknown client";
    const status = event.type === "customer.subscription.deleted" ? "canceled" : careStatus(o.status);
    if (!status) return `subscription: ignored status ${String(o.status)}`;
    await setCareStatus(ctx, clientId, status, { customer: str(o.customer), subscription: subId });
    return `care ${status} for ${clientId}`;
  }

  if (event.type === "invoice.payment_failed") {
    const subId = str(o.subscription) ?? str((o.parent as { subscription_details?: { subscription?: string } } | undefined)?.subscription_details?.subscription);
    const clientId = subId ? await findClientBySubscription(ctx, subId) : null;
    if (!clientId) return "payment failed: unknown subscription";
    await setCareStatus(ctx, clientId, "past_due");
    return `care past_due for ${clientId}`;
  }

  return `ignored ${event.type}`;
}
