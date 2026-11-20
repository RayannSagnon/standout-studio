import { adminMessageAction, markSeenAction, prospectAction, remindAction, setStageAction, shareVersionAction, todoAction } from "@/app/admin/actions";
import AdminShell, { adminEventText, adminPage } from "@/components/portal/AdminShell";
import { Ghost, More, Primary, Section, Title } from "@/components/portal/ui";
import { money } from "@/lib/portal/emails";
import { ago, daysSince, fmtDate, STAGE_LABEL } from "@/lib/portal/labels";
import * as svc from "@/lib/portal/service";

export const dynamic = "force-dynamic";

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;
const excerpt = (s: string, n = 180) => {
  const flat = s.replace(/\s*\n+\s*/g, " · ");
  return flat.length > n ? `${flat.slice(0, n).trimEnd()}…` : flat;
};

/** "en attente depuis 3 jours", "depuis 2 h", "depuis quelques minutes" */
function waiting(since: string, clock: Date) {
  const days = daysSince(since, clock);
  if (days > 0) return `en attente depuis ${plural(days, "jour", "jours")}`;
  const h = Math.floor((clock.getTime() - Date.parse(since)) / 3_600_000);
  return h > 0 ? `en attente depuis ${h} h` : "en attente depuis quelques minutes";
}

// What's new since the last "seen", what's going on, and what to do now, with
// the action right on the row. Clients and the full journal have their own pages.
export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ctx, mode } = await adminPage();
  const { since, news, todo, now } = await svc.adminHome(ctx);
  const clock = ctx.now ? ctx.now() : new Date();
  const firstName = ctx.viewer!.name.split(" ")[0];

  const going = [
    now.projects ? plural(now.projects, "projet en cours", "projets en cours") : "aucun projet en cours",
    now.care ? plural(now.care, "client en entretien", "clients en entretien") : null,
    now.expected ? `${money(now.expected, "fr")} attendus` : null,
  ].filter(Boolean);

  return (
    <AdminShell mode={mode} current="home" search={await searchParams}>
      <div className="pt-head">
        <Title>{`Bonjour, ${firstName}`}</Title>
        <p className="pt-sentence">
          {news.length === 0 && todo.length === 0 ? (
            <>Rien de nouveau, rien à faire.</>
          ) : (
            <>
              <a href="#nouveau">{news.length ? plural(news.length, "nouveauté", "nouveautés") : "Aucune nouveauté"}</a>,{" "}
              <a href="#a-faire">{todo.length ? plural(todo.length, "chose à faire", "choses à faire") : "rien à faire"}</a>.
            </>
          )}
        </p>
        <p className="pt-sub">En ce moment : {going.join(", ")}.</p>
      </div>

      <Section id="nouveau" title="Nouveau" note={since ? `Depuis que vous avez tout marqué comme vu, ${ago(since, clock)}.` : "Les 7 derniers jours."}>
        {news.length === 0 ? (
          <p className="pt-empty">Rien de nouveau.</p>
        ) : (
          <>
            <ol className="pt-log">
              {news.map((e) => (
                <li key={e.id}>
                  <time dateTime={e.created_at} title={fmtDate(e.created_at, "fr")}>
                    {ago(e.created_at, clock)}
                  </time>
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
            <form action={markSeenAction}>
              <Ghost small>Tout marquer comme vu</Ghost>
            </form>
          </>
        )}
      </Section>

      <Section id="a-faire" title="À faire" note="Le plus urgent en premier. Vous voyez tous les deux la même liste.">
        {todo.length === 0 ? (
          <p className="pt-empty">Tout est à jour.</p>
        ) : (
          <ul className="pt-tasks">
            {todo.map((t) => {
              const key = <input type="hidden" name="key" value={t.key} />;
              const back = <input type="hidden" name="back" value="/admin" />;
              const cid = <input type="hidden" name="client_id" value={t.clientId} />;
              const late = t.tone === "warn" ? daysSince(t.since, clock) : 0;
              const age =
                t.tone === "warn"
                  ? late
                    ? `en retard de ${plural(late, "jour", "jours")}`
                    : "en retard depuis aujourd'hui"
                  : waiting(t.since, clock);
              const op = (value: string, label: string) => (
                <form action={todoAction} className="pt-inline">
                  {key}
                  <input type="hidden" name="op" value={value} />
                  <button className="pt-textbtn">{label}</button>
                </form>
              );
              const a = t.action;
              return (
                <li className="pt-task" key={t.key}>
                  <div className="pt-task-head">
                    <a href={t.href}>{t.clientName}</a>
                    <span className={t.tone === "warn" ? "pt-danger" : undefined}>{t.text}</span>
                    {t.amount !== undefined && <span className="pt-amount pt-task-amount">{money(t.amount, "fr")}</span>}
                  </div>
                  <p className="pt-small pt-muted">
                    {age}
                    {t.claimedBy && <span className="pt-claim"> · {t.mine ? "vous vous en occupez" : `${t.claimedBy} s'en occupe`}</span>}
                  </p>
                  {t.detail && <p className="pt-said pt-small pt-task-detail">{excerpt(t.detail)}</p>}

                  <div className="pt-task-actions">
                    {a?.kind === "reply" && (
                      <More label="Répondre">
                        <form action={adminMessageAction} className="pt-form">
                          {cid}
                          {back}
                          <label className="pt-field">
                            <span>Votre réponse (le client la reçoit par courriel)</span>
                            <textarea className="pt-input" name="body" required maxLength={5000} rows={3} />
                          </label>
                          <div className="pt-actions">
                            <Primary small>Envoyer</Primary>
                          </div>
                        </form>
                      </More>
                    )}
                    {a?.kind === "share" && (
                      <More label={`Partager la version ${a.number}`}>
                        <form action={shareVersionAction} className="pt-form">
                          {cid}
                          {back}
                          <input type="hidden" name="project_id" value={a.projectId} />
                          <label className="pt-field">
                            <span>Lien de prévisualisation</span>
                            <input className="pt-input" name="preview_url" type="url" required placeholder="https://…vercel.app" />
                          </label>
                          <label className="pt-field">
                            <span>Mot pour le client (facultatif)</span>
                            <textarea className="pt-input" name="note" maxLength={2000} rows={2} />
                          </label>
                          <div className="pt-actions">
                            <Primary small>Partager et prévenir le client</Primary>
                          </div>
                        </form>
                      </More>
                    )}
                    {a?.kind === "stage" && (
                      <form action={setStageAction} className="pt-inline">
                        {cid}
                        {back}
                        {key}
                        <input type="hidden" name="project_id" value={a.projectId} />
                        <input type="hidden" name="stage" value={a.stage} />
                        <Primary small>Passer à « {STAGE_LABEL.fr[a.stage]} »</Primary>
                      </form>
                    )}
                    {a?.kind === "remind" && (
                      <form action={remindAction} className="pt-inline">
                        {key}
                        <input type="hidden" name="invoice_id" value={a.invoiceId} />
                        <Primary small>Relancer le client</Primary>
                      </form>
                    )}
                    {a?.kind === "prospect" && (
                      <>
                        <form action={prospectAction} className="pt-inline">
                          {cid}
                          <input type="hidden" name="status" value="active" />
                          <Primary small>En faire un client</Primary>
                        </form>
                        <form action={prospectAction} className="pt-inline">
                          {cid}
                          <input type="hidden" name="status" value="archived" />
                          <button className="pt-textbtn">Archiver</button>
                        </form>
                      </>
                    )}
                    <span className="pt-task-ops">
                      {t.mine ? op("unclaim", "Je laisse") : !t.claimedBy && op("claim", "Je m'en occupe")}
                      {op("snooze", "Plus tard")}
                      {op("done", "C'est fait")}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </AdminShell>
  );
}
