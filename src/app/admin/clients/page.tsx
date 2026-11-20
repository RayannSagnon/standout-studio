import AdminShell, { adminPage } from "@/components/portal/AdminShell";
import { Section, Status, Title } from "@/components/portal/ui";
import { money } from "@/lib/portal/emails";
import { fmtDate, STAGE_LABEL } from "@/lib/portal/labels";
import * as svc from "@/lib/portal/service";
import { invoiceTotal, type ClientStatus } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

const STATUS: Record<ClientStatus, string> = { prospect: "Prospect", active: "Actif", care: "Entretien", archived: "Archivé" };

export default async function AdminClients({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ctx, mode } = await adminPage();
  const o = await svc.adminOverview(ctx);
  const projectOf = new Map<string, (typeof o.waitingOnClient)[number]>();
  for (const p of [...o.waitingOnStudio, ...o.waitingOnClient]) if (!projectOf.has(p.client_id)) projectOf.set(p.client_id, p);
  const dueOf = new Map<string, number>();
  for (const i of o.unpaid) dueOf.set(i.client_id, (dueOf.get(i.client_id) ?? 0) + invoiceTotal(i));

  return (
    <AdminShell mode={mode} current="clients" search={await searchParams}>
      <div className="pt-head">
        <Title>Clients</Title>
        <p className="pt-sub">
          {o.clients.length} au total.{" "}
          <a className="link" href="/admin/clients/new">
            Ajouter un client
          </a>
        </p>
      </div>

      <Section title="Tous les clients">
        <table className="pt-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Statut</th>
              <th>Projet</th>
              <th>À payer</th>
              <th>Depuis</th>
            </tr>
          </thead>
          <tbody>
            {o.clients.map((c) => {
              const p = projectOf.get(c.id);
              const due = dueOf.get(c.id);
              return (
                <tr key={c.id}>
                  <td>
                    <a href={`/admin/clients/${c.id}`}>{c.name}</a>
                    <div className="pt-small pt-muted">{c.company || c.email}</div>
                  </td>
                  <td>
                    <Status tone={c.status === "prospect" ? "wait" : c.status === "care" ? "ok" : undefined}>{STATUS[c.status]}</Status>
                  </td>
                  <td className="pt-small">
                    {p ? (
                      <>
                        {STAGE_LABEL.fr[p.stage]}
                        <div className="pt-muted">{p.waiting_on === "client" ? "Chez le client" : "À nous"}</div>
                      </>
                    ) : (
                      <span className="pt-muted">Aucun en cours</span>
                    )}
                  </td>
                  <td className="pt-small">{due ? <span className="pt-amount">{money(due, "fr")}</span> : <span className="pt-muted">Rien</span>}</td>
                  <td className="pt-small pt-muted">{fmtDate(c.created_at, "fr", true)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>
    </AdminShell>
  );
}
