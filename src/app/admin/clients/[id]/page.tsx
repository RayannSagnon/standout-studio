import { notFound } from "next/navigation";
import {
  adminMessageAction,
  createInvoiceAction,
  createProjectAction,
  inviteAction,
  markPaidAction,
  sendInvoiceAction,
  setNextAction,
  setStageAction,
  shareVersionAction,
  teamNoteAction,
  updateClientAction,
  voidInvoiceAction,
} from "@/app/admin/actions";
import AdminShell, { adminPage } from "@/components/portal/AdminShell";
import EventLog, { isAuto } from "@/components/portal/EventLog";
import { Ghost, Icon, More, Primary, Section, Stages, Status, Title } from "@/components/portal/ui";
import { NotFoundError } from "@/lib/portal/db";
import { money } from "@/lib/portal/emails";
import { ago, CARE_LABEL, fmtDate, INVOICE_LABEL, PACKAGE_LABEL, STAGE_LABEL, VERSION_LABEL } from "@/lib/portal/labels";
import * as svc from "@/lib/portal/service";
import { invoiceTotal, PACKAGES, STAGES } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

export default async function AdminClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const { ctx, mode } = await adminPage();
  let d;
  try {
    d = await svc.adminClient(ctx, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const c = d.client;
  // The other admins, by first name, for "Envoyer à Steven"
  const others = (await ctx.db.list("users", { role: "admin" })).filter((u) => u.id !== ctx.viewer!.userId).map((u) => u.name.split(" ")[0]);
  const cid = <input type="hidden" name="client_id" value={c.id} />;
  const clock = ctx.now ? ctx.now() : new Date();

  // Summary at the top: where the work stands, who acts, what's owed, last contact
  const active = d.projects.find((p) => p.stage !== "live") ?? d.projects[0];
  const due = d.invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + invoiceTotal(i), 0);
  const lastMsg = d.messages.at(-1);
  const facts: [string, string][] = [
    ["Étape", active ? STAGE_LABEL.fr[active.stage] : "Aucun projet"],
    ["Qui agit", active?.waiting_on === "client" ? "Le client" : active?.waiting_on === "studio" ? "Nous" : "Personne"],
    ["À payer", due ? money(due, "fr") : "Rien"],
    ["Dernier message", lastMsg ? `${ago(lastMsg.created_at, clock)}, ${lastMsg.author_role === "client" ? "de lui" : "de nous"}` : "Aucun"],
  ];
  const mainEvents = d.events.filter((e) => !isAuto(e));
  const autoEvents = d.events.filter(isAuto);

  return (
    <AdminShell mode={mode} current="client" search={await searchParams}>
      <div className="pt-head">
        <a className="pt-back" href="/admin">
          Tableau de bord
        </a>
        <Title>{c.name}</Title>
        <p className="pt-sub">{[c.company, c.email, c.phone, c.lang === "fr" ? "en français" : "en anglais"].filter(Boolean).join(", ")}</p>
        <dl className="pt-facts">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <nav className="pt-jump" aria-label="Sections">
          <a href="#entre-nous">Entre nous</a>
          <a href="#projets">Projets</a>
          <a href="#factures">Factures</a>
          <a href="#messages">Messages</a>
          <a href="#acces">Accès</a>
          <a href="#historique">Historique</a>
        </nav>
      </div>

      {c.source_message && (
        <Section title="Sa demande" note={`Formulaire du site, ${fmtDate(c.created_at, "fr")}`}>
          <p className="pt-said" lang={c.lang}>
            {c.source_message}
          </p>
        </Section>
      )}

      <Section id="entre-nous" title="Entre nous" note={`Le client ne le voit jamais. ${others.length ? others.join(" et ") : "L'autre"} reçoit un courriel à chaque mot.`}>
        {d.team.length === 0 ? (
          <p className="pt-empty">Rien pour l&apos;instant. Notez ici ce que l&apos;autre doit savoir sur ce client.</p>
        ) : (
          <ol className="pt-thread">
            {d.team.map((n) => (
              <li key={n.id} className="pt-msg">
                <p className="pt-msg-who">
                  <b>{n.author_id === ctx.viewer!.userId ? "Vous" : n.author_name}</b>
                  <time dateTime={n.created_at}>{fmtDate(n.created_at, "fr", true)}</time>
                </p>
                <p>{n.body}</p>
              </li>
            ))}
          </ol>
        )}
        <form action={teamNoteAction} className="pt-form">
          {cid}
          <label className="pt-field">
            <span>Votre mot</span>
            <textarea className="pt-input" name="team_body" required maxLength={5000} rows={3} placeholder="Ce qu'on a promis, ce qui reste à faire, ce qu'il faut savoir avant d'appeler." />
          </label>
          <div className="pt-actions">
            <Ghost small>{others.length ? `Envoyer à ${others.join(" et ")}` : "Envoyer"}</Ghost>
          </div>
        </form>
      </Section>

      <Section id="projets" title="Projets" note={d.projects.length ? undefined : "Pas encore de projet."}>
        {d.projects.map((p) => {
          const pending = p.versions.find((v) => v.status === "pending");
          const pid = <input type="hidden" name="project_id" value={p.id} />;
          return (
            <article key={p.id} className="pt-sub-block">
              <div className="pt-row" style={{ padding: 0, border: 0 }}>
                <h3 className="pt-h3">
                  {p.name}, forfait {PACKAGE_LABEL.fr[p.package]}
                </h3>
                <Status tone={p.waiting_on === "client" ? "wait" : p.waiting_on === "studio" ? "ok" : undefined}>
                  {p.waiting_on === "client" ? "Chez le client" : p.waiting_on === "studio" ? "À vous" : "Rien en attente"}
                </Status>
              </div>
              <Stages project={p} lang="fr" labels={{ now: "En cours", next: "À venir" }} />
              <p className="pt-small">
                {p.revisionsUsed} révision{p.revisionsUsed > 1 ? "s" : ""} utilisée{p.revisionsUsed > 1 ? "s" : ""} sur {p.revisions_included}.
                {p.revisionsUsed > p.revisions_included && <span className="pt-danger"> Au-delà du forfait : à facturer.</span>}
              </p>

              <form action={setStageAction} className="pt-actions">
                {cid}
                {pid}
                <label className="pt-field" style={{ flex: "0 1 240px" }}>
                  <span>Étape</span>
                  <select className="pt-input" name="stage" defaultValue={p.stage}>
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABEL.fr[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <Ghost small style={{ alignSelf: "end", marginBottom: 4 }}>
                  Changer d&apos;étape et prévenir le client
                </Ghost>
              </form>

              {pending ? (
                <p className="pt-small pt-muted">
                  La version {pending.number} attend la réponse du client depuis le {fmtDate(pending.shared_at, "fr")}. La suivante se partage après sa réponse.
                </p>
              ) : (
                p.stage !== "live" && (
                  <More label={`Partager la version ${p.versions.length + 1}`} open>
                    <form action={shareVersionAction} className="pt-form">
                      {cid}
                      {pid}
                      <label className="pt-field">
                        <span>Lien de prévisualisation</span>
                        <input className="pt-input" name="preview_url" type="url" required placeholder="https://…vercel.app" />
                        <small>L&apos;aperçu Vercel de la branche, par exemple.</small>
                      </label>
                      <label className="pt-field">
                        <span>Mot pour le client (facultatif)</span>
                        <textarea className="pt-input" name="note" maxLength={2000} rows={3} placeholder="Ce qui a changé depuis la dernière version." />
                      </label>
                      <div className="pt-actions">
                        <Primary small>Partager et prévenir le client</Primary>
                      </div>
                    </form>
                  </More>
                )
              )}

              <More label="Prochaine étape vue par le client">
                <form action={setNextAction} className="pt-form">
                  {cid}
                  {pid}
                  <div className="pt-fields">
                    <label className="pt-field">
                      <span>En français</span>
                      <input className="pt-input" name="next_action_fr" defaultValue={p.next_action_fr ?? ""} maxLength={300} />
                    </label>
                    <label className="pt-field">
                      <span>En anglais</span>
                      <input className="pt-input" name="next_action_en" defaultValue={p.next_action_en ?? ""} maxLength={300} />
                    </label>
                  </div>
                  <label className="pt-field" style={{ maxWidth: 240 }}>
                    <span>Qui doit agir</span>
                    <select className="pt-input" name="waiting_on" defaultValue={p.waiting_on ?? ""}>
                      <option value="studio">Nous</option>
                      <option value="client">Le client</option>
                      <option value="">Personne</option>
                    </select>
                  </label>
                  <div className="pt-actions">
                    <Ghost small>Enregistrer</Ghost>
                  </div>
                </form>
              </More>

              {p.versions.length > 0 && (
                <ul className="pt-rows">
                  {p.versions.map((v) => (
                    <li className="pt-row" key={v.id}>
                      <div className="pt-row-main">
                        <a href={v.preview_url} target="_blank" rel="noopener noreferrer" className="pt-open" style={{ fontSize: 16 }}>
                          Version {v.number}
                          <Icon name="arrow" />
                        </a>
                        {v.client_comment && (
                          <span className="pt-said" lang={c.lang}>
                            {v.client_comment}
                          </span>
                        )}
                        <span className="pt-small pt-muted">Partagée le {fmtDate(v.shared_at, "fr")}</span>
                      </div>
                      <Status tone={v.status === "approved" ? "ok" : v.status === "pending" ? "wait" : undefined}>
                        {v.status === "pending" ? "En attente" : VERSION_LABEL.fr[v.status]}
                      </Status>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}

        <More label="Nouveau projet" open={d.projects.length === 0}>
          <form action={createProjectAction} className="pt-form">
            {cid}
            <div className="pt-fields">
              <label className="pt-field">
                <span>Nom (facultatif)</span>
                <input className="pt-input" name="name" maxLength={120} placeholder={`Site de ${c.name}`} />
              </label>
              <label className="pt-field">
                <span>Forfait</span>
                <select className="pt-input" name="package" defaultValue="growth">
                  {PACKAGES.map((k) => (
                    <option key={k} value={k}>
                      {PACKAGE_LABEL.fr[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="pt-actions">
              <Ghost small>Créer le projet</Ghost>
            </div>
          </form>
        </More>
      </Section>

      <Section id="factures" title="Factures" note="Un brouillon sert de devis. Le client ne le voit qu'une fois envoyé.">
        {d.invoices.length === 0 && <p className="pt-empty">Aucune facture.</p>}
        {d.invoices.length > 0 && (
          <ul className="pt-rows">
            {d.invoices.map((i) => {
              const iid = <input type="hidden" name="invoice_id" value={i.id} />;
              const meta = [
                i.number,
                i.tax_rate > 0 ? `taxes ${i.tax_rate} %` : null,
                i.due_date ? `avant le ${fmtDate(i.due_date, "fr")}` : null,
                i.paid_at ? `payée le ${fmtDate(i.paid_at, "fr")}` : null,
              ].filter(Boolean);
              return (
                <li className="pt-row" key={i.id}>
                  <div className="pt-row-main">
                    <span>{i.label}</span>
                    <span className="pt-small pt-muted">
                      {meta.join(", ")} · <a href={`/admin/invoices/${i.id}`}>{i.status === "paid" ? "Reçu (PDF)" : "Facture (PDF)"}</a>
                    </span>
                  </div>
                  <div className="pt-row-end">
                    <span className="pt-amount">{money(invoiceTotal(i), "fr")}</span>
                    <Status tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "warn" : i.status === "sent" ? "wait" : undefined}>{INVOICE_LABEL.fr[i.status]}</Status>
                    {i.status === "draft" && (
                      <form action={sendInvoiceAction} className="pt-inline">
                        {cid}
                        {iid}
                        <Primary small>Envoyer au client</Primary>
                      </form>
                    )}
                    {(i.status === "sent" || i.status === "overdue") && (
                      <form action={markPaidAction} className="pt-inline">
                        {cid}
                        {iid}
                        <Ghost small>Marquer payée</Ghost>
                      </form>
                    )}
                    {i.status !== "paid" && i.status !== "void" && (
                      <form action={voidInvoiceAction} className="pt-inline">
                        {cid}
                        {iid}
                        <button className="pt-textbtn pt-small pt-danger">Annuler</button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <More label="Nouvelle facture ou devis">
          <form action={createInvoiceAction} className="pt-form">
            {cid}
            <label className="pt-field">
              <span>Libellé</span>
              <input className="pt-input" name="label" required maxLength={200} placeholder="Forfait Croissance, 1er versement" />
            </label>
            <div className="pt-fields">
              <label className="pt-field">
                <span>Montant avant taxes ($)</span>
                <input className="pt-input" name="amount" required inputMode="decimal" placeholder="499,50" />
              </label>
              <label className="pt-field">
                <span>Taxes (%)</span>
                <input className="pt-input" name="tax_rate" inputMode="decimal" defaultValue="0" />
                <small>0 tant que vous ne facturez pas la TVH.</small>
              </label>
              <label className="pt-field">
                <span>Échéance</span>
                <input className="pt-input" name="due_date" type="date" />
              </label>
            </div>
            {d.projects.length > 0 && (
              <label className="pt-field">
                <span>Projet</span>
                <select className="pt-input" name="project_id" defaultValue={d.projects[0].id}>
                  {d.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  <option value="">Aucun</option>
                </select>
              </label>
            )}
            <div className="pt-actions">
              <Ghost small>Créer en brouillon</Ghost>
            </div>
          </form>
        </More>
      </Section>

      <Section id="messages" title="Messages" note="Le client reçoit un courriel à chaque réponse.">
        {d.messages.length === 0 ? (
          <p className="pt-empty">Aucun message.</p>
        ) : (
          <ol className="pt-thread">
            {d.messages.map((m) => (
              <li key={m.id} className="pt-msg">
                <p className="pt-msg-who">
                  <b>{m.author_role === "admin" ? `${m.author_name}, Standout` : m.author_name}</b>
                  <time dateTime={m.created_at}>{fmtDate(m.created_at, "fr", true)}</time>
                </p>
                <p lang={m.author_role === "client" ? c.lang : "fr"}>{m.body}</p>
              </li>
            ))}
          </ol>
        )}
        <form action={adminMessageAction} className="pt-form">
          {cid}
          <label className="pt-field">
            <span>Répondre</span>
            <textarea className="pt-input" name="body" required maxLength={5000} rows={3} />
          </label>
          <div className="pt-actions">
            <Ghost small>Envoyer</Ghost>
          </div>
        </form>
      </Section>

      <Section id="acces" title="Accès" note="La personne invitée reçoit un lien de connexion par courriel.">
        {d.users.length === 0 ? (
          <p className="pt-empty">Personne n&apos;a encore accès à l&apos;espace client.</p>
        ) : (
          <ul className="pt-rows">
            {d.users.map((u) => (
              <li className="pt-row" key={u.id}>
                <div className="pt-row-main">
                  <span>{u.name}</span>
                  <span className="pt-small pt-muted">{u.email}</span>
                </div>
                <span className="pt-small pt-muted">{u.last_login_at ? `Vu le ${fmtDate(u.last_login_at, "fr")}` : "Jamais connecté"}</span>
              </li>
            ))}
          </ul>
        )}
        <form action={inviteAction} className="pt-form">
          {cid}
          <div className="pt-fields">
            <label className="pt-field">
              <span>Courriel</span>
              <input className="pt-input" name="email" type="email" required defaultValue={d.users.length ? "" : c.email} />
            </label>
            <label className="pt-field">
              <span>Nom</span>
              <input className="pt-input" name="name" defaultValue={d.users.length ? "" : c.name} />
            </label>
          </div>
          <div className="pt-actions">
            <Primary small>{d.users.length ? "Inviter une autre personne" : "Inviter dans l'espace client"}</Primary>
          </div>
        </form>
      </Section>

      <Section id="entretien" title="Entretien" note={<Status tone={d.subscription?.status === "active" ? "ok" : d.subscription?.status === "past_due" ? "warn" : undefined}>{CARE_LABEL.fr[d.subscription?.status ?? "none"]}</Status>}>
        <p className="pt-prose">39 $ par mois, prélevés par Stripe. Le client l&apos;active depuis son espace une fois le site en ligne.</p>
      </Section>

      <Section id="fiche" title="Fiche">
        <More label="Modifier les coordonnées">
          <form action={updateClientAction} className="pt-form">
            {cid}
            <div className="pt-fields">
              <label className="pt-field">
                <span>Nom</span>
                <input className="pt-input" name="name" defaultValue={c.name} required maxLength={120} />
              </label>
              <label className="pt-field">
                <span>Entreprise</span>
                <input className="pt-input" name="company" defaultValue={c.company ?? ""} maxLength={120} />
              </label>
              <label className="pt-field">
                <span>Courriel de contact</span>
                <input className="pt-input" name="email" type="email" defaultValue={c.email} required />
              </label>
              <label className="pt-field">
                <span>Téléphone</span>
                <input className="pt-input" name="phone" defaultValue={c.phone ?? ""} maxLength={40} />
              </label>
              <label className="pt-field">
                <span>Langue des courriels</span>
                <select className="pt-input" name="lang" defaultValue={c.lang}>
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                </select>
              </label>
              <label className="pt-field">
                <span>Statut</span>
                <select className="pt-input" name="status" defaultValue={c.status}>
                  <option value="prospect">Prospect</option>
                  <option value="active">Actif</option>
                  <option value="care">Entretien</option>
                  <option value="archived">Archivé</option>
                </select>
              </label>
            </div>
            <div className="pt-actions">
              <Ghost small>Enregistrer</Ghost>
            </div>
          </form>
        </More>
      </Section>

      <Section id="historique" title="Historique" note="Les relances et les messages sont repliés.">
        <EventLog events={mainEvents} clock={clock} />
        {autoEvents.length > 0 && (
          <More label={`Voir aussi les événements automatiques (${autoEvents.length})`}>
            <EventLog events={autoEvents} clock={clock} />
          </More>
        )}
      </Section>
    </AdminShell>
  );
}
