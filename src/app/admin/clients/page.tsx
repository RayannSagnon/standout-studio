import AdminShell, { adminPage } from "@/components/portal/AdminShell";
import { Section, Status, Title } from "@/components/portal/ui";
import { money } from "@/lib/portal/emails";
import { fmtDate, STAGE_LABEL } from "@/lib/portal/labels";
import * as svc from "@/lib/portal/service";
import { invoiceTotal, type ClientStatus } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

const STATUS: Record<ClientStatus, string> = { prospect: "Prospect", active: "Actif", care: "Entretien", archived: "Archivé" };
const FILTERS: [string, string][] = [
  ["", "En cours"],
  ["prospect", "Demandes"],
  ["active", "Actifs"],
  ["care", "Entretien"],
  ["archived", "Archivés"],
];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminClients({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { ctx, mode } = await adminPage();
  const o = await svc.adminOverview(ctx);
  const statut = one(sp.statut) ?? "";
  const tri = one(sp.tri) === "nom" ? "nom" : "date";

  const projectOf = new Map<string, (typeof o.waitingOnClient)[number]>();
  for (const p of [...o.waitingOnStudio, ...o.waitingOnClient]) if (!projectOf.has(p.client_id)) projectOf.set(p.client_id, p);
  const dueOf = new Map<string, number>();
  for (const i of o.unpaid) dueOf.set(i.client_id, (dueOf.get(i.client_id) ?? 0) + invoiceTotal(i));

  // "En cours" hides archived clients; each other filter shows one status
  const list = o.clients
    .filter((c) => (statut ? c.status === statut : c.status !== "archived"))
    .sort((a, b) => (tri === "nom" ? a.name.localeCompare(b.name, "fr") : b.created_at.localeCompare(a.created_at)));
  const count = (s: string) => o.clients.filter((c) => (s ? c.status === s : c.status !== "archived")).length;
  const href = (p: { statut?: string; tri?: string }) => {
    const q = new URLSearchParams();
    const st = p.statut ?? statut;
    const tr = p.tri ?? tri;
    if (st) q.set("statut", st);
    if (tr === "nom") q.set("tri", "nom");
    return `/admin/clients${q.size ? `?${q}` : ""}`;
  };

  return (
    <AdminShell mode={mode} current="clients" search={sp}>
      <div className="pt-head">
        <Title>Clients</Title>
        <p className="pt-sub">
          {o.clients.length} au total.{" "}
          <a className="link" href="/admin/clients/new">
            Ajouter un client
          </a>
        </p>
        <nav className="pt-filters" aria-label="Filtrer">
          {FILTERS.map(([value, label]) => (
            <a key={value || "all"} href={href({ statut: value })} aria-current={statut === value ? "true" : undefined}>
              {label} ({count(value)})
            </a>
          ))}
        </nav>
      </div>

      <Section
        title={FILTERS.find(([v]) => v === statut)?.[1] ?? "Clients"}
        note={
          <>
            Trier par{" "}
            <a className="link" href={href({ tri: "date" })} aria-current={tri === "date" ? "true" : undefined}>
              date
            </a>{" "}
            ou{" "}
            <a className="link" href={href({ tri: "nom" })} aria-current={tri === "nom" ? "true" : undefined}>
              nom
            </a>
            .
          </>
        }
      >
        {o.clients.length === 0 ? (
          <p className="pt-empty">
            Aucun client pour l&apos;instant. Les demandes du formulaire de contact arriveront ici, ou{" "}
            <a className="link" href="/admin/clients/new">
              ajoutez-en un
            </a>
            .
          </p>
        ) : list.length === 0 ? (
          <p className="pt-empty">
            Aucun client dans ce filtre.{" "}
            <a className="link" href={href({ statut: "" })}>
              Voir les clients en cours
            </a>
            .
          </p>
        ) : (
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
              {list.map((c) => {
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
        )}
      </Section>
    </AdminShell>
  );
}
