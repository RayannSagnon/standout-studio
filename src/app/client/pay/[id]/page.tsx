// Demo only: stands in for the Stripe checkout page.

import { notFound, redirect } from "next/navigation";
import { demoPayAction } from "@/app/client/actions";
import { Bar, Primary, Title } from "@/components/portal/ui";
import { money } from "@/lib/portal/emails";
import { portal } from "@/lib/portal/server";
import * as svc from "@/lib/portal/service";
import { invoiceTotal, type Lang } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

export default async function DemoPay({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { id } = await params;
  const lang: Lang = (await searchParams).lang === "en" ? "en" : "fr";
  const home = lang === "fr" ? "/fr/client" : "/client";
  const { mode, ctx } = await portal();
  if (mode !== "demo") notFound();
  if (!ctx.viewer) redirect(`${home}/login`);
  let found;
  try {
    found = await svc.payableInvoice(ctx, id);
  } catch {
    redirect(`${home}#invoices`);
  }
  const { invoice } = found;
  const fr = lang === "fr";
  return (
    <div className="pt" lang={lang}>
      <p className="pt-demo">{fr ? "Démo : aucune carte n'est débitée." : "Demo: no card is charged."}</p>
      <Bar area={fr ? "Paiement" : "Payment"} home={home} />
      <main className="pt-login" id="main">
        <div className="pt-login-copy">
          <Title>{money(invoiceTotal(invoice), lang)}</Title>
          <p className="pt-sub">
            {invoice.number} · {invoice.label}
          </p>
        </div>
        <div className="pt-login-side">
          <p>
            {fr
              ? "En vrai, c'est la page de Stripe qui s'ouvre ici. Une fois la carte acceptée, la facture passe à « payée » toute seule."
              : "For real, Stripe's own page opens here. Once the card goes through, the invoice turns to paid on its own."}
          </p>
          <form action={demoPayAction} className="pt-form">
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="invoice_id" value={invoice.id} />
            <Primary>{fr ? "Simuler un paiement réussi" : "Simulate a successful payment"}</Primary>
          </form>
          <a className="link pt-small" href={`${home}?ok=payCanceled#invoices`}>
            {fr ? "Annuler" : "Cancel"}
          </a>
        </div>
      </main>
    </div>
  );
}
