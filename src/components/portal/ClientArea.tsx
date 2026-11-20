// The client's dashboard. Server component: data is read on the server for the
// signed-in client only, and every button is a plain form (works without JavaScript).

import { notFound, redirect } from "next/navigation";
import { careAction, messageAction, payAction, respondAction, signOutAction } from "@/app/client/actions";
import { CLIENT_COPY, eventText } from "@/lib/portal/copy";
import { money } from "@/lib/portal/emails";
import { CARE_LABEL, fmtDate, INVOICE_LABEL, PACKAGE_LABEL, STAGE_LABEL, VERSION_LABEL } from "@/lib/portal/labels";
import { portal } from "@/lib/portal/server";
import * as svc from "@/lib/portal/service";
import { invoiceTotal, type Lang } from "@/lib/portal/types";
import { Bar, Flash, Ghost, Meter, Pill, Primary, Steps, Title } from "./ui";

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ClientArea({ lang, searchParams }: { lang: Lang; searchParams: Search }) {
  const k = CLIENT_COPY[lang];
  const home = lang === "fr" ? "/fr/client" : "/client";
  const { mode, ctx } = await portal();
  if (mode === "off") notFound();
  if (!ctx.viewer) redirect(`${home}/login`);
  if (ctx.viewer.role === "admin") redirect("/admin");

  const d = await svc.clientDashboard(ctx);
  const ok = one(searchParams.ok);
  const error = one(searchParams.error);
  const paid = one(searchParams.paid);
  const care = one(searchParams.care);
  const flash = ok ? k.flash[ok] : paid ? k.flash.paid : care ? k.flash.care : null;

  const project = d.projects[0];
  const latest = project?.versions[0];
  const earlier = project?.versions.slice(1) ?? [];
  const firstName = ctx.viewer.name.split(" ")[0];
  const otherLang = lang === "fr" ? "/client" : "/fr/client";
  const live = d.projects.some((p) => p.stage === "live" || p.stage === "launch");
  const sub = d.subscription;
  const hidden = <input type="hidden" name="lang" value={lang} />;

  return (
    <div className="pt" lang={lang}>
      {mode === "demo" && <p className="pt-demo">{k.demo}</p>}
      <Bar area={k.area} home={home}>
        <a href={otherLang} hrefLang={lang === "fr" ? "en" : "fr"} aria-label={k.switchLangLabel}>
          {k.switchLang}
        </a>
        <a className="pt-hide-sm" href={lang === "fr" ? "/fr" : "/"}>
          {k.site}
        </a>
        <form action={signOutAction} className="pt-inline">
          {hidden}
          <button className="pt-textbtn">{k.signOut}</button>
        </form>
      </Bar>

      <main className="pt-main" id="main">
        <Flash text={flash} />
        <Flash text={error ? (k.errors[error] ?? k.errors.generic) : null} tone="error" />

        <div className="pt-head">
          <Title>{k.hello(firstName).replace(/\.$/, "")}</Title>
          {project && <p className="pt-sub">{k.sinceLine(PACKAGE_LABEL[lang][project.package], fmtDate(d.client.created_at, lang))}</p>}
        </div>

        <div className="pt-grid">
          <div className="pt-col">
            {!project && (
              <section className="pt-card">
                <p className="pt-empty">{k.noProject}</p>
              </section>
            )}

            {project && (project.next_action_fr || project.next_action_en) && (
              <section className="pt-next" aria-labelledby="next-title">
                <p className="pt-label" id="next-title">
                  {k.nextAction}
                </p>
                <p className="pt-next-text">{lang === "fr" ? project.next_action_fr || project.next_action_en : project.next_action_en || project.next_action_fr}</p>
                {project.waiting_on && (
                  <span className="pt-turn" data-on={project.waiting_on}>
                    {project.waiting_on === "client" ? k.yourTurn : k.ourTurn}
                  </span>
                )}
              </section>
            )}

            {project && (
              <section className="pt-card" aria-labelledby="project-title">
                <div className="pt-card-head">
                  <h2 className="pt-h2" id="project-title">
                    {project.name}
                  </h2>
                  <Pill>{STAGE_LABEL[lang][project.stage]}</Pill>
                </div>
                <Steps project={project} lang={lang} labels={{ done: k.stepDone, now: k.stepNow, next: k.stepNext }} />
                <div className="pt-meter">
                  <p className="pt-small">{k.revisions(project.revisionsUsed, project.revisions_included)}</p>
                  <Meter used={project.revisionsUsed} total={project.revisions_included} />
                  {project.revisionsUsed >= project.revisions_included && <p className="pt-small pt-muted">{k.revisionsOver}</p>}
                </div>
              </section>
            )}

            {project && (
              <section className="pt-card" id="version" aria-labelledby="version-title">
                {!latest ? (
                  <>
                    <h2 className="pt-h2" id="version-title">
                      {k.version(1)}
                    </h2>
                    <p className="pt-empty">{k.versionNone}</p>
                  </>
                ) : (
                  <div className="pt-version">
                    <div className="pt-card-head">
                      <h2 className="pt-h2" id="version-title">
                        {k.version(latest.number)}
                      </h2>
                      <Pill tone={latest.status === "approved" ? "ok" : latest.status === "pending" ? "wait" : undefined}>{VERSION_LABEL[lang][latest.status]}</Pill>
                    </div>
                    {latest.note && <p>{latest.note}</p>}
                    <a className="pt-preview" href={latest.preview_url} target="_blank" rel="noopener noreferrer">
                      <span>
                        <b>{k.open}</b> <span aria-hidden="true">↗</span>
                      </span>
                      <span className="pt-preview-url">{new URL(latest.preview_url).host}</span>
                    </a>

                    {latest.status === "pending" ? (
                      <div className="pt-form">
                        <form action={respondAction} className="pt-form">
                          {hidden}
                          <input type="hidden" name="version_id" value={latest.id} />
                          <input type="hidden" name="decision" value="approved" />
                          <div className="pt-actions">
                            <Primary>{k.approve}</Primary>
                          </div>
                        </form>
                        <details className="pt-details" open={error === "comment" || undefined}>
                          <summary>{k.requestChanges}</summary>
                          <div>
                            <form action={respondAction} className="pt-form">
                              {hidden}
                              <input type="hidden" name="version_id" value={latest.id} />
                              <input type="hidden" name="decision" value="changes_requested" />
                              <label className="pt-field">
                                <span>{k.commentLabel}</span>
                                <textarea className="pt-input" name="comment" required maxLength={5000} placeholder={k.commentPh} />
                                <small>{k.commentHint}</small>
                              </label>
                              <div className="pt-actions">
                                <Ghost>{k.sendChanges}</Ghost>
                              </div>
                            </form>
                          </div>
                        </details>
                      </div>
                    ) : (
                      latest.client_comment && (
                        <div className="pt-field">
                          <span className="pt-label">{k.yourFeedback}</span>
                          <p className="pt-quote">{latest.client_comment}</p>
                        </div>
                      )
                    )}

                    {earlier.length > 0 && (
                      <details className="pt-details">
                        <summary>{k.history}</summary>
                        <div className="pt-rows">
                          {earlier.map((v) => (
                            <div className="pt-row" key={v.id}>
                              <div className="pt-row-main">
                                <a href={v.preview_url} target="_blank" rel="noopener noreferrer" className="link">
                                  {k.version(v.number)}
                                </a>
                                {v.client_comment && <span className="pt-small pt-muted">{v.client_comment}</span>}
                              </div>
                              <Pill tone={v.status === "approved" ? "ok" : undefined}>{VERSION_LABEL[lang][v.status]}</Pill>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </section>
            )}

            <section className="pt-card" id="messages" aria-labelledby="messages-title" data-order="5">
              <h2 className="pt-h2" id="messages-title">
                {k.messages}
              </h2>
              {d.messages.length === 0 ? (
                <p className="pt-empty">{k.messagesNone}</p>
              ) : (
                <ol className="pt-thread">
                  {d.messages.map((m) => (
                    <li key={m.id} className="pt-msg" data-mine={m.author_role === "client" ? "" : undefined}>
                      <span className="pt-msg-meta">
                        {m.author_role === "client" ? k.you : m.author_name} · {fmtDate(m.created_at, lang)}
                      </span>
                      {m.body}
                    </li>
                  ))}
                </ol>
              )}
              <form action={messageAction} className="pt-form">
                {hidden}
                <label className="pt-field">
                  <span>{k.messageLabel}</span>
                  <textarea className="pt-input" name="body" required maxLength={5000} placeholder={k.messagePh} rows={3} />
                </label>
                <div className="pt-actions">
                  <Ghost small>{k.send}</Ghost>
                </div>
              </form>
            </section>
          </div>

          <div className="pt-col">
            <section className="pt-card" id="invoices" aria-labelledby="invoices-title" data-order="4">
              <h2 className="pt-h2" id="invoices-title">
                {k.invoices}
              </h2>
              {d.invoices.length === 0 ? (
                <p className="pt-empty">{k.invoicesNone}</p>
              ) : (
                <ul className="pt-rows">
                  {d.invoices.map((i) => {
                    const payable = i.status === "sent" || i.status === "overdue";
                    return (
                      <li className="pt-row" key={i.id}>
                        <div className="pt-row-main">
                          <span>{i.label}</span>
                          <span className="pt-small pt-muted">
                            {i.number}
                            {i.status === "paid" && i.paid_at ? ` · ${k.paidOn(fmtDate(i.paid_at, lang))}` : ""}
                            {payable && i.due_date ? ` · ${k.dueOn(fmtDate(i.due_date, lang))}` : ""}
                            {i.tax_rate > 0 ? ` · ${k.taxes(i.tax_rate)}` : ""}
                          </span>
                        </div>
                        <div className="pt-row-end">
                          <span className="pt-amount">{money(invoiceTotal(i), lang)}</span>
                          {payable ? (
                            <form action={payAction} className="pt-inline">
                              {hidden}
                              <input type="hidden" name="invoice_id" value={i.id} />
                              <Primary small>{k.pay}</Primary>
                            </form>
                          ) : (
                            <Pill tone={i.status === "paid" ? "ok" : undefined}>{INVOICE_LABEL[lang][i.status]}</Pill>
                          )}
                          {i.status === "overdue" && <Pill tone="warn">{INVOICE_LABEL[lang].overdue}</Pill>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="pt-card" id="care" aria-labelledby="care-title" data-order="6">
              <div className="pt-card-head">
                <h2 className="pt-h2" id="care-title">
                  {k.care}
                </h2>
                <Pill tone={sub?.status === "active" ? "ok" : sub?.status === "past_due" ? "warn" : undefined}>{CARE_LABEL[lang][sub?.status ?? "none"]}</Pill>
              </div>
              <p>
                <b>{k.carePrice}</b>. {k.careText}
              </p>
              {sub?.status === "active" || sub?.status === "past_due" ? (
                sub.stripe_customer_id && (
                  <form action={careAction}>
                    {hidden}
                    <Ghost small>{k.careManage}</Ghost>
                  </form>
                )
              ) : live ? (
                <form action={careAction}>
                  {hidden}
                  <Primary small>{k.careStart}</Primary>
                </form>
              ) : (
                <p className="pt-small pt-muted">{k.careLater}</p>
              )}
            </section>

            {d.events.length > 0 && (
              <section className="pt-card" aria-labelledby="history-title" data-order="7">
                <h2 className="pt-h2" id="history-title">
                  {k.activity}
                </h2>
                <ol className="pt-timeline">
                  {d.events
                    .map((e) => ({ e, t: eventText(lang, e.type, e.data, (s) => STAGE_LABEL[lang][s as keyof (typeof STAGE_LABEL)["fr"]] ?? s) }))
                    .filter((x) => x.t)
                    .map(({ e, t }) => (
                      <li key={e.id}>
                        <time dateTime={e.created_at}>{fmtDate(e.created_at, lang, true)}</time>
                        <span>{t}</span>
                      </li>
                    ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
