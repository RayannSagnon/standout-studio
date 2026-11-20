// A printable invoice or receipt. "Enregistrer en PDF" uses the browser's print dialog.

import { money } from "@/lib/portal/emails";
import { fmtDate } from "@/lib/portal/labels";
import { invoiceTotal, type Client, type Invoice, type Lang } from "@/lib/portal/types";
import PrintButton from "./PrintButton";

const T = {
  fr: {
    invoice: "Facture",
    receipt: "Reçu",
    billedTo: "Facturé à",
    issued: "Émise le",
    due: "À payer avant le",
    paid: "Payée le",
    item: "Description",
    amount: "Montant",
    subtotal: "Sous-total",
    taxes: (r: number) => `Taxes (${r} %)`,
    total: "Total",
    paidStamp: "Payée",
    thanks: "Merci de votre confiance.",
    print: "Enregistrer en PDF ou imprimer",
    back: "Retour",
  },
  en: {
    invoice: "Invoice",
    receipt: "Receipt",
    billedTo: "Billed to",
    issued: "Issued on",
    due: "Due by",
    paid: "Paid on",
    item: "Description",
    amount: "Amount",
    subtotal: "Subtotal",
    taxes: (r: number) => `Tax (${r}%)`,
    total: "Total",
    paidStamp: "Paid",
    thanks: "Thank you for your trust.",
    print: "Save as PDF or print",
    back: "Back",
  },
};

export default function InvoiceDoc({ invoice: i, client: c, lang, back }: { invoice: Invoice; client: Client; lang: Lang; back: string }) {
  const t = T[lang];
  const paid = i.status === "paid";
  const tax = invoiceTotal(i) - i.amount_cents;
  return (
    <>
      <div className="pt-doc-tools">
        <a href={back}>{t.back}</a>
        <PrintButton label={t.print} />
      </div>
      <article className="pt-doc" lang={lang}>
        <header className="pt-doc-head">
          <div>
            <p className="pt-mark">
              Standout Studio<i aria-hidden="true" />
            </p>
            <p className="pt-small pt-muted">
              Ottawa, Canada
              <br />
              standout.studio.ottawa@gmail.com
              <br />
              standoutstudio.ca
            </p>
          </div>
          <div className="pt-doc-title">
            <h1>{paid ? t.receipt : t.invoice}</h1>
            <p>{i.number}</p>
          </div>
        </header>

        <div className="pt-doc-meta">
          <div>
            <p className="pt-small pt-muted">{t.billedTo}</p>
            <p>
              {c.name}
              {c.company && (
                <>
                  <br />
                  {c.company}
                </>
              )}
              <br />
              {c.email}
            </p>
          </div>
          <dl>
            {i.sent_at && (
              <>
                <dt>{t.issued}</dt>
                <dd>{fmtDate(i.sent_at, lang)}</dd>
              </>
            )}
            {!paid && i.due_date && (
              <>
                <dt>{t.due}</dt>
                <dd>{fmtDate(i.due_date, lang)}</dd>
              </>
            )}
            {paid && i.paid_at && (
              <>
                <dt>{t.paid}</dt>
                <dd>{fmtDate(i.paid_at, lang)}</dd>
              </>
            )}
          </dl>
        </div>

        <table className="pt-doc-lines">
          <thead>
            <tr>
              <th>{t.item}</th>
              <th>{t.amount}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{i.label}</td>
              <td>{money(i.amount_cents, lang)}</td>
            </tr>
          </tbody>
          <tfoot>
            {i.tax_rate > 0 && (
              <>
                <tr>
                  <td>{t.subtotal}</td>
                  <td>{money(i.amount_cents, lang)}</td>
                </tr>
                <tr>
                  <td>{t.taxes(i.tax_rate)}</td>
                  <td>{money(tax, lang)}</td>
                </tr>
              </>
            )}
            <tr className="pt-doc-total">
              <td>{t.total}</td>
              <td>{money(invoiceTotal(i), lang)}</td>
            </tr>
          </tfoot>
        </table>

        {paid && <p className="pt-doc-stamp">{t.paidStamp}</p>}
        <p className="pt-small pt-muted">{t.thanks}</p>
      </article>
    </>
  );
}
