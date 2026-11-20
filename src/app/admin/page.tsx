import type { ReactNode } from "react";
import { resetDemoAction, runRemindersAction } from "@/app/admin/actions";
import AdminShell, { adminEventText, adminPage } from "@/components/portal/AdminShell";
import { Ghost, Section, Status, Title } from "@/components/portal/ui";
import { money } from "@/lib/portal/emails";
import { fmtDate, INVOICE_LABEL, STAGE_LABEL } from "@/lib/portal/labels";
import * as svc from "@/lib/portal/service";
import { invoiceTotal, type ClientStatus } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

const STATUS: Record<ClientStatus, string> = { prospect: "Prospect", active: "Actif", care: "Entretien", archived: "Archivé" };

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ctx, mode } = await adminPage();
  const o = await svc.adminOverview(ctx);
  const unpaidTotal = o.unpaid.reduce((s, i) => s + invoiceTotal(i), 0);
  const firstName = ctx.viewer!.name.split(" ")[0];

  // The day in one sentence. Each part links to its section below.
  const parts: ReactNode[] = [];
  if (o.prospects.length) parts.push(<a key="p" href="#prospects">{plural(o.prospects.length, "nouvelle demande", "nouvelles demandes")}</a>);
  if (o.waitingOnStudio.length) parts.push(<a key="s" href="#a-faire">{plural(o.waitingOnStudio.length, "projet attend", "projets attendent")} votre réponse</a>);
  if (o.unpaid.length) parts.push(<a key="u" href="#impayes">{money(unpaidTotal, "fr")} à encaisser</a>);
  const sentence = parts.length ? (
    <>
      Aujourd&apos;hui :{" "}
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && (i === parts.length - 1 ? " et " : ", ")}
          {p}
        </span>
      ))}
      .
    </>
  ) : (
    <>Rien ne vous attend aujourd&apos;hui.</>
  );

  return (
    <AdminShell mode={mode} current="home" search={await searchParams}>
      <div className="pt-head">
        <Title>{`Bonjour, ${firstName}`}</Title>
        <p className="pt-sentence">{sentence}</p>
      </div>

      <Section id="a-faire" title="À vous de jouer" note={o.waitingOnStudio.length ? undefined : "Rien en attente."}>
        {o.waitingOnStudio.length > 0 && (
          <ul className="pt-rows">
            {o.waitingOnStudio.map((p) => (
              <li className="pt-row" key={p.id}>
                <div className="pt-row-main">
                  <a href={`/admin/clients/${p.client_id}#projets`}>{p.clientName}</a>
                  <span className="pt-small pt-muted">{p.next_action_fr || "Pas de prochaine étape écrite."}</span>
                </div>
                <Status>{STAGE_LABEL.fr[p.stage]}</Status>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="prospects" title="Nouvelles demandes" note="Elles arrivent ici depuis le formulaire de contact.">
        {o.prospects.length === 0 ? (
          <p className="pt-empty">Aucune pour l&apos;instant.</p>
        ) : (
          <ul className="pt-rows">
            {o.prospects.map((c) => (
              <li className="pt-row" key={c.id}>
                <div className="pt-row-main">
                  <a href={`/admin/clients/${c.id}`}>{c.name}</a>
                  {c.source_message && (
                    <span className="pt-small pt-muted">
                      {c.source_message.replace(/\s*\n+\s*/g, " · ").slice(0, 160)}
                      {c.source_message.length > 160 ? "…" : ""}
                    </span>
                  )}
                </div>
                <span className="pt-small pt-muted">{fmtDate(c.created_at, "fr", true)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="impayes" title="À encaisser" note={o.unpaid.length ? undefined : "Tout est payé."}>
        {o.unpaid.length > 0 && (
          <ul className="pt-rows">
            {o.unpaid.map((i) => (
              <li className="pt-row" key={i.id}>
                <div className="pt-row-main">
                  <a href={`/admin/clients/${i.client_id}#factures`}>{i.clientName}</a>
                  <span className="pt-small pt-muted">
                    {i.number}
                    {i.due_date ? `, avant le ${fmtDate(i.due_date, "fr")}` : ""}
                  </span>
                </div>
                <div className="pt-row-end">
                  <span className="pt-amount">{money(invoiceTotal(i), "fr")}</span>
                  <Status tone={i.status === "overdue" ? "warn" : "wait"}>{INVOICE_LABEL.fr[i.status]}</Status>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="chez-le-client" title="Chez le client" note={o.waitingOnClient.length ? "On attend leur réponse." : "Personne à relancer."}>
        {o.waitingOnClient.length > 0 && (
          <ul className="pt-rows">
            {o.waitingOnClient.map((p) => (
              <li className="pt-row" key={p.id}>
                <div className="pt-row-main">
                  <a href={`/admin/clients/${p.client_id}#projets`}>{p.clientName}</a>
                  <span className="pt-small pt-muted">{p.next_action_fr}</span>
                </div>
                <Status tone="wait">{STAGE_LABEL.fr[p.stage]}</Status>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="clients" title="Clients" note={<a className="link" href="/admin/clients/new">Ajouter un client</a>}>
        <table className="pt-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Courriel</th>
              <th>Statut</th>
              <th>Depuis</th>
            </tr>
          </thead>
          <tbody>
            {o.clients.map((c) => (
              <tr key={c.id}>
                <td>
                  <a href={`/admin/clients/${c.id}`}>{c.name}</a>
                  {c.company && <div className="pt-small pt-muted">{c.company}</div>}
                </td>
                <td>{c.email}</td>
                <td>
                  <Status tone={c.status === "prospect" ? "wait" : c.status === "care" ? "ok" : undefined}>{STATUS[c.status]}</Status>
                </td>
                <td className="pt-small pt-muted">{fmtDate(c.created_at, "fr", true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section id="journal" title="Journal">
        <ol className="pt-log">
          {o.events.map((e) => (
            <li key={e.id}>
              <time dateTime={e.created_at}>{fmtDate(e.created_at, "fr", true)}</time>
              <span>
                {e.clientName && (
                  <>
                    <a className="link" href={`/admin/clients/${e.client_id}`}>
                      {e.clientName}
                    </a>
                    {" : "}
                  </>
                )}
                <span className={e.type === "email.failed" ? "pt-danger" : undefined}>{adminEventText(e)}</span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="relances" title="Relances" note="Chaque matin, vers 8 h.">
        <p className="pt-prose">
          Un client qui n&apos;a pas répondu à une version depuis 5 jours reçoit un rappel, au plus tous les 5 jours. Une facture en retard en déclenche un par semaine.
        </p>
        <div className="pt-actions">
          <form action={runRemindersAction}>
            <Ghost small>Lancer les relances</Ghost>
          </form>
          {mode === "demo" && (
            <form action={resetDemoAction}>
              <Ghost small>Remettre la démo à zéro</Ghost>
            </form>
          )}
        </div>
      </Section>
    </AdminShell>
  );
}
