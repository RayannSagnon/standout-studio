import { resetDemoAction, runRemindersAction } from "@/app/admin/actions";
import AdminShell, { adminPage } from "@/components/portal/AdminShell";
import EventLog, { isAuto } from "@/components/portal/EventLog";
import { Ghost, Section, Title } from "@/components/portal/ui";
import * as svc from "@/lib/portal/service";

export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminJournal({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { ctx, mode } = await adminPage();
  const o = await svc.adminOverview(ctx);
  const clock = ctx.now ? ctx.now() : new Date();
  const clientId = one(sp.client) || "";
  const all = one(sp.tout) === "1";
  const events = o.events.filter((e) => (!clientId || e.client_id === clientId) && (all || !isAuto(e)));
  const hidden = o.events.filter((e) => (!clientId || e.client_id === clientId) && isAuto(e)).length;
  const qs = (p: Record<string, string>) => {
    const q = new URLSearchParams({ ...(clientId ? { client: clientId } : {}), ...(all ? { tout: "1" } : {}), ...p });
    for (const [k, v] of [...q.entries()]) if (!v) q.delete(k);
    return `/admin/journal${q.size ? `?${q}` : ""}`;
  };

  return (
    <AdminShell mode={mode} current="journal" search={sp}>
      <div className="pt-head">
        <Title>Journal</Title>
        <p className="pt-sub">Tout ce qui s&apos;est passé, jour par jour.</p>
        <form className="pt-filters" action="/admin/journal">
          <label>
            <span className="sr-only">Client</span>
            <select className="pt-input" name="client" defaultValue={clientId}>
              <option value="">Tous les clients</option>
              {o.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {all && <input type="hidden" name="tout" value="1" />}
          <Ghost small>Filtrer</Ghost>
          <a href={qs({ tout: all ? "" : "1" })} aria-current={all ? "true" : undefined}>
            {all ? "Cacher les événements automatiques" : `Afficher les événements automatiques (${hidden})`}
          </a>
        </form>
      </div>

      <Section title="Événements" note={clientId ? "Filtré sur un client." : undefined}>
        {events.length === 0 ? (
          <p className="pt-empty">{clientId ? "Rien pour ce client. Essayez « Tous les clients »." : "Rien pour l'instant."}</p>
        ) : (
          <EventLog events={events} clock={clock} withClient={!clientId} />
        )}
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
