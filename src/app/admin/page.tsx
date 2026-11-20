import AdminShell, { adminEventText, adminPage } from "@/components/portal/AdminShell";
import { Section, Title } from "@/components/portal/ui";
import { money } from "@/lib/portal/emails";
import { fmtDate } from "@/lib/portal/labels";
import * as svc from "@/lib/portal/service";

export const dynamic = "force-dynamic";

const count = (n: number, one: string, many: string) => (n === 0 ? `Aucune ${one}` : `${n} ${n > 1 ? many : one}`);

// Two things only: what is new since the last visit, and what to do now.
// Clients and the full journal have their own pages.
export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ctx, mode } = await adminPage();
  const { since, news, todo } = await svc.adminHome(ctx);
  await svc.markSeen(ctx);
  const firstName = ctx.viewer!.name.split(" ")[0];

  return (
    <AdminShell mode={mode} current="home" search={await searchParams}>
      <div className="pt-head">
        <Title>{`Bonjour, ${firstName}`}</Title>
        <p className="pt-sentence">
          {news.length === 0 && todo.length === 0 ? (
            <>Rien de nouveau, rien à faire.</>
          ) : (
            <>
              <a href="#nouveau">{count(news.length, "nouveauté", "nouveautés")}</a>,{" "}
              <a href="#a-faire">{todo.length === 0 ? "rien à faire" : `${todo.length} ${todo.length > 1 ? "choses" : "chose"} à faire`}</a>.
            </>
          )}
        </p>
      </div>

      <Section id="nouveau" title="Nouveau" note={since ? `Depuis votre dernière visite, le ${fmtDate(since, "fr")}.` : "Les 7 derniers jours."}>
        {news.length === 0 ? (
          <p className="pt-empty">Rien de nouveau depuis.</p>
        ) : (
          <ol className="pt-log">
            {news.map((e) => (
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
        )}
      </Section>

      <Section id="a-faire" title="À faire" note="Le plus urgent en premier.">
        {todo.length === 0 ? (
          <p className="pt-empty">Tout est à jour.</p>
        ) : (
          <ul className="pt-rows">
            {todo.map((t) => (
              <li className="pt-row" key={t.key}>
                <div className="pt-row-main">
                  <a href={t.href}>{t.clientName}</a>
                  <span className={t.tone === "warn" ? "pt-small pt-danger" : "pt-small pt-muted"}>{t.text}</span>
                </div>
                {t.amount !== undefined && <span className="pt-amount">{money(t.amount, "fr")}</span>}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </AdminShell>
  );
}
