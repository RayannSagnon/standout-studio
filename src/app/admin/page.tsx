import { resetDemoAction, runRemindersAction } from "@/app/admin/actions";
import AdminShell, { adminEventText, adminPage } from "@/components/portal/AdminShell";
import { Ghost, Pill, Title } from "@/components/portal/ui";
import { money } from "@/lib/portal/emails";
import { fmtDate, INVOICE_LABEL, STAGE_LABEL } from "@/lib/portal/labels";
import * as svc from "@/lib/portal/service";
import { invoiceTotal, type ClientStatus } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

const STATUS: Record<ClientStatus, string> = { prospect: "Prospect", active: "Actif", care: "Entretien", archived: "Archivé" };

export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ctx, mode } = await adminPage();
  const o = await svc.adminOverview(ctx);
  const unpaidTotal = o.unpaid.reduce((s, i) => s + invoiceTotal(i), 0);
  const firstName = ctx.viewer!.name.split(" ")[0];

  return (
    <AdminShell mode={mode} current="home" search={await searchParams}>
      <div className="pt-head">
        <Title>{`Bonjour, ${firstName}`}</Title>
        <p className="pt-sub">Ce qui demande votre attention aujourd&apos;hui.</p>
      </div>

      <div className="pt-stats">
        <a className="pt-stat" href="#prospects" data-hot={o.prospects.length ? "" : undefined}>
          <b>{o.prospects.length}</b>
          <span>Nouveaux prospects</span>
        </a>
        <a className="pt-stat" href="#a-faire" data-hot={o.waitingOnStudio.length ? "" : undefined}>
          <b>{o.waitingOnStudio.length}</b>
          <span>Projets en attente de vous</span>
        </a>
        <a className="pt-stat" href="#chez-le-client">
          <b>{o.waitingOnClient.length}</b>
          <span>En attente du client</span>
        </a>
        <a className="pt-stat" href="#impayes">
          <b>{money(unpaidTotal, "fr")}</b>
          <span>À encaisser ({o.unpaid.length})</span>
        </a>
      </div>

      <div className="pt-grid">
        <div className="pt-col">
          <section className="pt-card" id="a-faire">
            <h2 className="pt-h2">À faire de votre côté</h2>
            {o.waitingOnStudio.length === 0 ? (
              <p className="pt-empty">Rien en attente. Bravo.</p>
            ) : (
              <ul className="pt-rows">
                {o.waitingOnStudio.map((p) => (
                  <li className="pt-row" key={p.id}>
                    <div className="pt-row-main">
                      <a className="link" href={`/admin/clients/${p.client_id}#projets`}>
                        {p.clientName}
                      </a>
                      <span className="pt-small pt-muted">{p.next_action_fr || "Pas de prochaine étape écrite."}</span>
                    </div>
                    <Pill>{STAGE_LABEL.fr[p.stage]}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pt-card" id="prospects">
            <h2 className="pt-h2">Prospects</h2>
            {o.prospects.length === 0 ? (
              <p className="pt-empty">Aucun prospect. Ils arrivent ici tout seuls depuis le formulaire du site.</p>
            ) : (
              <ul className="pt-rows">
                {o.prospects.map((c) => (
                  <li className="pt-row" key={c.id}>
                    <div className="pt-row-main">
                      <a className="link" href={`/admin/clients/${c.id}`}>
                        {c.name}
                      </a>
                      {c.source_message && <span className="pt-small pt-muted">{c.source_message.replace(/\s*\n+\s*/g, " · ").slice(0, 160)}{c.source_message.length > 160 ? "…" : ""}</span>}
                    </div>
                    <span className="pt-small pt-muted">{fmtDate(c.created_at, "fr")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pt-card" id="chez-le-client">
            <h2 className="pt-h2">En attente du client</h2>
            {o.waitingOnClient.length === 0 ? (
              <p className="pt-empty">Aucun.</p>
            ) : (
              <ul className="pt-rows">
                {o.waitingOnClient.map((p) => (
                  <li className="pt-row" key={p.id}>
                    <div className="pt-row-main">
                      <a className="link" href={`/admin/clients/${p.client_id}#projets`}>
                        {p.clientName}
                      </a>
                      <span className="pt-small pt-muted">{p.next_action_fr}</span>
                    </div>
                    <Pill tone="wait">{STAGE_LABEL.fr[p.stage]}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pt-card">
            <div className="pt-card-head">
              <h2 className="pt-h2">Tous les clients</h2>
              <a className="link pt-small" href="/admin/clients/new">
                Nouveau client
              </a>
            </div>
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
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
                      <Pill tone={c.status === "prospect" ? "wait" : c.status === "care" ? "ok" : undefined}>{STATUS[c.status]}</Pill>
                    </td>
                    <td className="pt-small pt-muted">{fmtDate(c.created_at, "fr")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="pt-col">
          <section className="pt-card" id="impayes">
            <h2 className="pt-h2">Factures à encaisser</h2>
            {o.unpaid.length === 0 ? (
              <p className="pt-empty">Tout est payé.</p>
            ) : (
              <ul className="pt-rows">
                {o.unpaid.map((i) => (
                  <li className="pt-row" key={i.id}>
                    <div className="pt-row-main">
                      <a className="link" href={`/admin/clients/${i.client_id}#factures`}>
                        {i.clientName}
                      </a>
                      <span className="pt-small pt-muted">
                        {i.number}
                        {i.due_date ? ` · avant le ${fmtDate(i.due_date, "fr")}` : ""}
                      </span>
                    </div>
                    <div className="pt-row-end">
                      <span className="pt-amount">{money(invoiceTotal(i), "fr")}</span>
                      <Pill tone={i.status === "overdue" ? "warn" : "wait"}>{INVOICE_LABEL.fr[i.status]}</Pill>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pt-card">
            <h2 className="pt-h2">Derniers événements</h2>
            <ol className="pt-timeline">
              {o.events.map((e) => (
                <li key={e.id}>
                  <time dateTime={e.created_at}>{fmtDate(e.created_at, "fr", true)}</time>
                  <span>
                    {e.clientName && (
                      <>
                        <a className="link" href={`/admin/clients/${e.client_id}`}>
                          {e.clientName}
                        </a>{" "}
                        :{" "}
                      </>
                    )}
                    <span className={e.type === "email.failed" ? "pt-danger" : undefined}>{adminEventText(e)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="pt-card">
            <h2 className="pt-h2">Relances automatiques</h2>
            <p className="pt-small pt-muted">
              Elles partent chaque matin : commentaires attendus depuis 5 jours, factures en retard (au plus une fois par semaine). Vous pouvez les lancer maintenant.
            </p>
            <form action={runRemindersAction}>
              <Ghost small>Lancer les relances</Ghost>
            </form>
            {mode === "demo" && (
              <form action={resetDemoAction}>
                <Ghost small>Remettre la démo à zéro</Ghost>
              </form>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
