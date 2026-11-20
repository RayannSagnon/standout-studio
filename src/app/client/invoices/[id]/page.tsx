import { notFound, redirect } from "next/navigation";
import InvoiceDoc from "@/components/portal/InvoiceDoc";
import Root from "@/components/portal/Root";
import { NotFoundError } from "@/lib/portal/db";
import { portal } from "@/lib/portal/server";
import * as svc from "@/lib/portal/service";
import type { Lang } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { id } = await params;
  const { mode, ctx } = await portal();
  if (mode === "off") notFound();
  if (!ctx.viewer) redirect("/fr/client/login");
  let doc;
  try {
    doc = await svc.invoiceDoc(ctx, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const lang: Lang = (await searchParams).lang === "en" ? "en" : (await searchParams).lang === "fr" ? "fr" : doc.client.lang;
  const back = `${lang === "fr" ? "/fr" : ""}/client#invoices`;
  return (
    <Root lang={lang}>
      <main className="pt-main">
        <InvoiceDoc invoice={doc.invoice} client={doc.client} lang={lang} back={back} />
      </main>
    </Root>
  );
}
