import { resetDemoAction, runRemindersAction } from "@/app/admin/actions";
import AdminShell, { adminEventText, adminPage } from "@/components/portal/AdminShell";
import { Ghost, Section, Title } from "@/components/portal/ui";
import { fmtDate } from "@/lib/portal/labels";
import * as svc from "@/lib/portal/service";

export const dynamic = "force-dynamic";

export default async function AdminJournal({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ctx, mode } = await adminPage();
  const o = await svc.adminOverview(ctx);

  return (
    <AdminShell mode={mode} current="journal" search={await searchParams}>
      <div className="pt-head">
        <Title>Journal</Title>
        <p className="pt-sub">Tout ce qui s&apos;est passé, du plus récent au plus ancien.</p>
      </div>

      <Section title="Événements">
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
