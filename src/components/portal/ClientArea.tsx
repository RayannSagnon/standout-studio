// The client's dashboard. Server component: data is read on the server for the
// signed-in client only, and every button is a plain form (works without JavaScript).

import Root, { ThemeSwitch } from "@/components/portal/Root";
import { notFound, redirect } from "next/navigation";
import { careAction, messageAction, payAction, respondAction, signOutAction } from "@/app/client/actions";
import { CLIENT_COPY, eventText } from "@/lib/portal/copy";
import { money } from "@/lib/portal/emails";
import { CARE_LABEL, fmtDate, INVOICE_LABEL, PACKAGE_LABEL, STAGE_LABEL, VERSION_LABEL } from "@/lib/portal/labels";
import { portal } from "@/lib/portal/server";
import * as svc from "@/lib/portal/service";
import { invoiceTotal, type Lang, type Stage } from "@/lib/portal/types";
import { Bar, Flash, Ghost, Icon, More, Primary, Section, Stages, Status, Title } from "./ui";

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
  const flash = ok ? k.flash[ok] : one(searchParams.paid) ? k.flash.paid : one(searchParams.care) ? k.flash.care : null;

  const project = d.projects[0];
  const latest = project?.versions[0];
  const earlier = project?.versions.slice(1) ?? [];
  const firstName = ctx.viewer.name.split(" ")[0];
  const live = d.projects.some((p) => p.stage === "live" || p.stage === "launch");
  const sub = d.subscription;
  const nextText = project ? (lang === "fr" ? project.next_action_fr || project.next_action_en : project.next_action_en || project.next_action_fr) : null;
  const hidden = <input type="hidden" name="lang" value={lang} />;

  return (
    <Root lang={lang}>
      {mode === "demo" && <p className="pt-demo">{k.demo}</p>}
      <Bar area={k.area} home={home}>
        <a href={lang === "fr" ? "/client" : "/fr/client"} hrefLang={lang === "fr" ? "en" : "fr"} aria-label={k.switchLangLabel}>
          {k.switchLang}
        </a>
        <a className="pt-hide-sm" href={lang === "fr" ? "/fr" : "/"}>
          {k.site}
        </a>
        <ThemeSwitch lang={lang} />
        <form action={signOutAction} className="pt-inline">
          {hidden}
          <button className="pt-textbtn">{k.signOut}</button>
        </form>
      </Bar>

      <main className="pt-main" id="main">
        <Flash text={flash} />
        <Flash text={error ? (k.errors[error] ?? k.errors.generic) : null} tone="error" />

        <div className="pt-head">
          <Title>{k.hello(firstName)}</Title>
          {project && <p className="pt-sub">{k.sinceLine(PACKAGE_LABEL[lang][project.package], fmtDate(d.client.created_at, lang))}</p>}
        </div>

        {!project && <p className="pt-sub">{k.noProject}</p>}

        {nextText && (
          <div className="pt-next">
            <p className="pt-next-text">{nextText}</p>
            {project?.waiting_on && (
              <p className="pt-next-who" data-on={project.waiting_on}>
                {project.waiting_on === "client" ? k.yourTurn : k.ourTurn}
              </p>
            )}
          </div>
        )}

        {project && (
          <Section
            id="version"
            title={latest ? k.version(latest.number) : k.version(1)}
            note={latest ? <Status tone={latest.status === "approved" ? "ok" : latest.status === "pending" ? "wait" : undefined}>{VERSION_LABEL[lang][latest.status]}</Status> : null}
          >
            {!latest ? (
              <p className="pt-empty">{k.versionNone}</p>
            ) : (
              <>
                {latest.note && <p className="pt-prose">{latest.note}</p>}
                <a className="pt-open" href={latest.preview_url} target="_blank" rel="noopener noreferrer">
                  {k.open(latest.number)}
                  <Icon name="arrow" />
                </a>

                {latest.status === "pending" ? (
                  <>
                    {/* Approving can't be undone: one more click, so a slip of the thumb doesn't count */}
                    <details className="pt-confirm">
                      <summary className="btn btn-primary">
                        <span>{k.approve}</span>
                      </summary>
                      <form action={respondAction} className="pt-confirm-box">
                        {hidden}
                        <input type="hidden" name="version_id" value={latest.id} />
                        <input type="hidden" name="decision" value="approved" />
                        <p>{k.approveConfirm(latest.number)}</p>
                        <div>
                          <Primary small>{k.approveYes(latest.number)}</Primary>
                        </div>
                      </form>
                    </details>
                    <More label={k.requestChanges} open={error === "comment"}>
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
                    </More>
                  </>
                ) : (
                  latest.client_comment && (
                    <p>
                      <span className="pt-muted">{k.yourFeedback} : </span>
                      <span className="pt-said">{latest.client_comment}</span>
                    </p>
                  )
                )}

                {earlier.length > 0 && (
                  <More label={k.history}>
                    <ul className="pt-rows">
                      {earlier.map((v) => (
                        <li className="pt-row" key={v.id}>
                          <div className="pt-row-main">
                            <a href={v.preview_url} target="_blank" rel="noopener noreferrer">
                              {k.version(v.number)}
                            </a>
                            {v.client_comment && <span className="pt-said pt-small pt-muted">{v.client_comment}</span>}
                          </div>
                          <Status tone={v.status === "approved" ? "ok" : undefined}>{VERSION_LABEL[lang][v.status]}</Status>
                        </li>
                      ))}
                    </ul>
                  </More>
                )}
              </>
            )}
          </Section>
        )}

        <Section id="invoices" title={k.invoices}>
          {d.invoices.length === 0 ? (
            <p className="pt-empty">{k.invoicesNone}</p>
          ) : (
            <ul className="pt-rows">
              {d.invoices.map((i) => {
                const payable = i.status === "sent" || i.status === "overdue";
                const meta = [
                  i.number,
                  i.status === "paid" && i.paid_at ? k.paidOn(fmtDate(i.paid_at, lang)) : null,
                  payable && i.due_date ? k.dueOn(fmtDate(i.due_date, lang)) : null,
                  i.tax_rate > 0 ? k.taxes(i.tax_rate) : null,
                ].filter(Boolean);
                return (
                  <li className="pt-row" key={i.id}>
                    <div className="pt-row-main">
                      <span>{i.label}</span>
                      <span className="pt-small pt-muted">{meta.join(", ")}</span>
                    </div>
                    <div className="pt-row-end">
                      <span className="pt-amount">{money(invoiceTotal(i), lang)}</span>
                      {i.status === "overdue" && <Status tone="warn">{INVOICE_LABEL[lang].overdue}</Status>}
                      {payable ? (
                        <form action={payAction} className="pt-inline">
                          {hidden}
                          <input type="hidden" name="invoice_id" value={i.id} />
                          <Primary small>{k.pay(money(invoiceTotal(i), lang))}</Primary>
                        </form>
                      ) : (
                        <Status tone={i.status === "paid" ? "ok" : undefined}>{INVOICE_LABEL[lang][i.status]}</Status>
                      )}
                    </div>
                    <p className="pt-small pt-inv-links">
                      <a href={`/client/invoices/${i.id}?lang=${lang}`}>{i.status === "paid" ? k.receipt : k.invoicePdf}</a>
                      {payable && <span className="pt-muted"> · {k.paySecure}</span>}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {project && (
          <Section id="project" title={project.name} note={PACKAGE_LABEL[lang][project.package]}>
            <Stages project={project} lang={lang} labels={{ now: k.stepNow, next: k.stepNext }} />
            <p className="pt-small">
              {k.revisions(project.revisionsUsed, project.revisions_included)}
              {project.revisionsUsed >= project.revisions_included && <span className="pt-muted"> {k.revisionsOver(project.revisions_included)}</span>}
            </p>
          </Section>
        )}

        <Section id="messages" title={k.messages}>
          {d.messages.length === 0 ? (
            <p className="pt-empty">{k.messagesNone}</p>
          ) : (
            <ol className="pt-thread">
              {d.messages.map((m) => (
                <li key={m.id} className="pt-msg">
                  <p className="pt-msg-who">
                    <b>{m.author_role === "client" ? k.you : `${m.author_name}, Standout`}</b>
                    <time dateTime={m.created_at}>{fmtDate(m.created_at, lang, true)}</time>
                  </p>
                  <p>{m.body}</p>
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
        </Section>

        <Section id="care" title={k.care} note={<Status tone={sub?.status === "active" ? "ok" : sub?.status === "past_due" ? "warn" : undefined}>{CARE_LABEL[lang][sub?.status ?? "none"]}</Status>}>
          <p className="pt-prose">
            {k.carePrice} {k.careText}
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
        </Section>

        {d.events.length > 0 && (
          <Section id="history" title={k.activity}>
            <ol className="pt-log">
              {d.events
                .map((e) => ({ e, t: eventText(lang, e.type, e.data, (s) => STAGE_LABEL[lang][s as Stage] ?? s) }))
                .filter((x) => x.t)
                .map(({ e, t }) => (
                  <li key={e.id}>
                    <time dateTime={e.created_at}>{fmtDate(e.created_at, lang, true)}</time>
                    <span>{t}</span>
                  </li>
                ))}
            </ol>
          </Section>
        )}
      </main>
    </Root>
  );
}
