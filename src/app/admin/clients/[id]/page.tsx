import { notFound } from "next/navigation";
import {
  adminMessageAction,
  createInvoiceAction,
  createProjectAction,
  inviteAction,
  markPaidAction,
  saveNotesAction,
  sendInvoiceAction,
  setNextAction,
  setStageAction,
  shareVersionAction,
  updateClientAction,
  voidInvoiceAction,
} from "@/app/admin/actions";
import AdminShell, { adminEventText, adminPage } from "@/components/portal/AdminShell";
import { Ghost, Meter, Pill, Primary, Steps, Title } from "@/components/portal/ui";
import { NotFoundError } from "@/lib/portal/db";
import { money } from "@/lib/portal/emails";
import { CARE_LABEL, fmtDate, INVOICE_LABEL, PACKAGE_LABEL, STAGE_LABEL, VERSION_LABEL } from "@/lib/portal/labels";
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
  const cid = <input type="hidden" name="client_id" value={c.id} />;
  const stepLabels = { done: "Terminé", now: "En cours", next: "À venir" };

  return (
    <AdminShell mode={mode} current="client" search={await searchParams}>
      <div className="pt-head">
        <p className="pt-small">
          <a className="link" href="/admin">
            Tableau de bord
          </a>
        </p>
        <Title>{c.name}</Title>
        <p className="pt-sub">
          {[c.company, c.email, c.phone, c.lang === "fr" ? "Français" : "Anglais"].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="pt-grid">
        <div className="pt-col">
          {c.source_message && (
            <section className="pt-card">
              <p className="pt-label">Message reçu via le formulaire</p>
              <p className="pt-quote">{c.source_message}</p>
            </section>
          )}

          <section className="pt-card" id="projets">
            <div className="pt-card-head">
              <h2 className="pt-h2">Projets</h2>
            </div>
            {d.projects.length === 0 && <p className="pt-empty">Pas encore de projet.</p>}

            {d.projects.map((p) => {
              const pending = p.versions.find((v) => v.status === "pending");
              const pid = <input type="hidden" name="project_id" value={p.id} />;
              return (
                <article key={p.id} className="pt-form" style={{ gap: 20 }}>
                  <div className="pt-card-head">
                    <h3 className="pt-h3">
                      {p.name} · {PACKAGE_LABEL.fr[p.package]}
                    </h3>
                    <Pill tone={p.waiting_on === "client" ? "wait" : undefined}>
                      {p.waiting_on === "client" ? "En attente du client" : p.waiting_on === "studio" ? "À vous" : "Rien en attente"}
                    </Pill>
                  </div>
                  <Steps project={p} lang="fr" labels={stepLabels} />

                  <form action={setStageAction} className="pt-actions">
                    {cid}
                    {pid}
                    <label className="pt-field" style={{ flex: "1 1 180px" }}>
                      <span>Étape</span>
                      <select className="pt-input" name="stage" defaultValue={p.stage}>
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {STAGE_LABEL.fr[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Ghost small style={{ alignSelf: "end" }}>
                      Changer d&apos;étape et prévenir le client
                    </Ghost>
                  </form>

                  <div className="pt-meter">
                    <p className="pt-small">
                      Révisions : {p.revisionsUsed} sur {p.revisions_included}
                      {p.revisionsUsed > p.revisions_included ? " (dépassé : à facturer ?)" : ""}
                    </p>
                    <Meter used={p.revisionsUsed} total={p.revisions_included} />
                  </div>

                  <details className="pt-details">
                    <summary>Prochaine étape affichée au client</summary>
                    <div>
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
                        <label className="pt-field">
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
                    </div>
                  </details>

                  <details className="pt-details" open={!pending && p.stage !== "live" ? true : undefined}>
                    <summary>{pending ? `Version ${pending.number} en attente du client` : `Partager la version ${p.versions.length + 1}`}</summary>
                    <div>
                      {pending ? (
                        <p className="pt-small pt-muted">
                          Partagée le {fmtDate(pending.shared_at, "fr")}. Une seule version en attente à la fois : la suivante se partage après la réponse du client.
                        </p>
                      ) : (
                        <form action={shareVersionAction} className="pt-form">
                          {cid}
                          {pid}
                          <label className="pt-field">
                            <span>Lien de prévisualisation</span>
                            <input className="pt-input" name="preview_url" type="url" required placeholder="https://…vercel.app" />
                            <small>L&apos;aperçu Vercel de la branche, par exemple.</small>
                          </label>
                          <label className="pt-field">
                            <span>Note pour le client (facultatif)</span>
                            <textarea className="pt-input" name="note" maxLength={2000} rows={3} placeholder="Ce qui a changé, ce qu'on attend de lui." />
                          </label>
                          <div className="pt-actions">
                            <Primary small>Partager et prévenir le client</Primary>
                          </div>
                        </form>
                      )}
                    </div>
                  </details>

                  {p.versions.length > 0 && (
                    <ul className="pt-rows">
                      {p.versions.map((v) => (
                        <li className="pt-row" key={v.id}>
                          <div className="pt-row-main">
                            <a className="link" href={v.preview_url} target="_blank" rel="noopener noreferrer">
                              Version {v.number}
                            </a>
                            {v.client_comment && <span className="pt-quote pt-small">{v.client_comment}</span>}
                            <span className="pt-small pt-muted">Partagée le {fmtDate(v.shared_at, "fr")}</span>
                          </div>
                          <Pill tone={v.status === "approved" ? "ok" : v.status === "pending" ? "wait" : undefined}>
                            {v.status === "pending" ? "En attente" : VERSION_LABEL.fr[v.status]}
                          </Pill>
                        </li>
                      ))}
                    </ul>
                  )}
                  <hr style={{ border: 0, borderTop: "1px solid var(--rule)", margin: 0, width: "100%" }} />
                </article>
              );
            })}

            <details className="pt-details" open={d.projects.length === 0 || undefined}>
              <summary>Nouveau projet</summary>
              <div>
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
              </div>
            </details>
          </section>

          <section className="pt-card" id="factures">
            <h2 className="pt-h2">Factures</h2>
            {d.invoices.length === 0 && <p className="pt-empty">Aucune facture.</p>}
            <ul className="pt-rows">
              {d.invoices.map((i) => {
                const iid = <input type="hidden" name="invoice_id" value={i.id} />;
                return (
                  <li className="pt-row" key={i.id}>
                    <div className="pt-row-main">
                      <span>{i.label}</span>
                      <span className="pt-small pt-muted">
                        {i.number}
                        {i.tax_rate > 0 ? ` · taxes ${i.tax_rate} %` : ""}
                        {i.due_date ? ` · avant le ${fmtDate(i.due_date, "fr")}` : ""}
                        {i.paid_at ? ` · payée le ${fmtDate(i.paid_at, "fr")}` : ""}
                      </span>
                    </div>
                    <div className="pt-row-end">
                      <span className="pt-amount">{money(invoiceTotal(i), "fr")}</span>
                      <Pill tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "warn" : i.status === "sent" ? "wait" : undefined}>{INVOICE_LABEL.fr[i.status]}</Pill>
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
            <details className="pt-details">
              <summary>Nouvelle facture ou devis</summary>
              <div>
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
                  <p className="pt-small pt-muted">Elle reste en brouillon (invisible pour le client) jusqu&apos;à ce que vous l&apos;envoyiez. Un brouillon sert aussi de devis.</p>
                  <div className="pt-actions">
                    <Ghost small>Créer en brouillon</Ghost>
                  </div>
                </form>
              </div>
            </details>
          </section>

          <section className="pt-card" id="messages">
            <h2 className="pt-h2">Messages</h2>
            {d.messages.length === 0 ? (
              <p className="pt-empty">Aucun message.</p>
            ) : (
              <ol className="pt-thread">
                {d.messages.map((m) => (
                  <li key={m.id} className="pt-msg" data-mine={m.author_role === "admin" ? "" : undefined}>
                    <span className="pt-msg-meta">
                      {m.author_name} · {fmtDate(m.created_at, "fr")}
                    </span>
                    {m.body}
                  </li>
                ))}
              </ol>
            )}
            <form action={adminMessageAction} className="pt-form">
              {cid}
              <label className="pt-field">
                <span>Répondre (le client reçoit un email)</span>
                <textarea className="pt-input" name="body" required maxLength={5000} rows={3} />
              </label>
              <div className="pt-actions">
                <Ghost small>Envoyer</Ghost>
              </div>
            </form>
          </section>
        </div>

        <div className="pt-col">
          <section className="pt-card" id="acces">
            <h2 className="pt-h2">Accès à l&apos;espace client</h2>
            {d.users.length === 0 ? (
              <p className="pt-empty">Personne n&apos;a encore accès.</p>
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
                  <span>Email</span>
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
              <p className="pt-small pt-muted">La personne reçoit un email avec un lien de connexion. Si l&apos;accès existe déjà, l&apos;email part de nouveau.</p>
            </form>
          </section>

          <section className="pt-card" id="entretien">
            <div className="pt-card-head">
              <h2 className="pt-h2">Entretien</h2>
              <Pill tone={d.subscription?.status === "active" ? "ok" : d.subscription?.status === "past_due" ? "warn" : undefined}>{CARE_LABEL.fr[d.subscription?.status ?? "none"]}</Pill>
            </div>
            <p className="pt-small pt-muted">39 $ par mois, prélevé par Stripe. Le client l&apos;active lui-même depuis son espace quand le site est en ligne.</p>
          </section>

          <section className="pt-card" id="notes">
            <h2 className="pt-h2">Notes internes</h2>
            <form action={saveNotesAction} className="pt-form">
              {cid}
              <label className="pt-field">
                <span>Jamais visibles par le client</span>
                <textarea className="pt-input" name="notes" defaultValue={d.notes} rows={5} />
              </label>
              <div className="pt-actions">
                <Ghost small>Enregistrer</Ghost>
              </div>
            </form>
          </section>

          <section className="pt-card" id="fiche">
            <details className="pt-details">
              <summary>Modifier la fiche</summary>
              <div>
                <form action={updateClientAction} className="pt-form">
                  {cid}
                  <label className="pt-field">
                    <span>Nom</span>
                    <input className="pt-input" name="name" defaultValue={c.name} required maxLength={120} />
                  </label>
                  <label className="pt-field">
                    <span>Entreprise</span>
                    <input className="pt-input" name="company" defaultValue={c.company ?? ""} maxLength={120} />
                  </label>
                  <label className="pt-field">
                    <span>Email de contact</span>
                    <input className="pt-input" name="email" type="email" defaultValue={c.email} required />
                  </label>
                  <label className="pt-field">
                    <span>Téléphone</span>
                    <input className="pt-input" name="phone" defaultValue={c.phone ?? ""} maxLength={40} />
                  </label>
                  <div className="pt-fields">
                    <label className="pt-field">
                      <span>Langue des emails</span>
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
              </div>
            </details>
          </section>

          <section className="pt-card">
            <h2 className="pt-h2">Historique</h2>
            <ol className="pt-timeline">
              {d.events.map((e) => (
                <li key={e.id}>
                  <time dateTime={e.created_at}>{fmtDate(e.created_at, "fr", true)}</time>
                  <span className={e.type === "email.failed" ? "pt-danger" : undefined}>{adminEventText(e)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
