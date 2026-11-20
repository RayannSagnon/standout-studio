// Sign-in by emailed link. Same screen for clients and for the studio.

import { redirect } from "next/navigation";
import { requestLinkAction } from "@/app/client/actions";
import { CLIENT_COPY } from "@/lib/portal/copy";
import { DEMO_ACCOUNTS } from "@/lib/portal/demo";
import { baseUrl, portal } from "@/lib/portal/server";
import type { Lang } from "@/lib/portal/types";
import { Bar, Flash, Primary, Title } from "./ui";

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function SignIn({ lang, searchParams }: { lang: Lang; searchParams: Search }) {
  const k = CLIENT_COPY[lang];
  const l = k.login;
  const home = lang === "fr" ? "/fr/client" : "/client";
  const { mode, ctx } = await portal();
  if (ctx.viewer) redirect(ctx.viewer.role === "admin" ? "/admin" : home);

  const sent = one(searchParams.sent) === "1";
  const bad = one(searchParams.error) === "link";
  const base = await baseUrl();
  const demoLink = one(searchParams.demo);
  const safeDemo = mode === "demo" && demoLink?.startsWith(`${base}/auth/confirm?`) ? demoLink : null;
  const hidden = <input type="hidden" name="lang" value={lang} />;

  return (
    <div className="pt" lang={lang}>
      {mode === "demo" && <p className="pt-demo">{k.demo}</p>}
      <Bar area={k.area} home={lang === "fr" ? "/fr" : "/"}>
        <a href={lang === "fr" ? "/client/login" : "/fr/client/login"} hrefLang={lang === "fr" ? "en" : "fr"} aria-label={k.switchLangLabel}>
          {k.switchLang}
        </a>
        <a href={lang === "fr" ? "/fr" : "/"}>{k.site}</a>
      </Bar>
      <main className="pt-login" id="main">
        <div className="pt-login-copy">
          <Title>{l.title}</Title>
          <p className="pt-sub">{l.lead}</p>
          <p className="pt-small">
            {l.notClient}{" "}
            <a className="link" href={lang === "fr" ? "/fr/contact" : "/contact"}>
              {l.start}
            </a>
          </p>
        </div>

        <div className="pt-login-panel">
          {mode === "off" ? (
            <p>{l.off}</p>
          ) : sent ? (
            <>
              <h2 className="pt-h2">{l.sentTitle}</h2>
              <p>{l.sentText}</p>
              {safeDemo && (
                <a className="btn btn-primary" href={safeDemo}>
                  <span>{l.demoOpen}</span>
                </a>
              )}
              <a className="link pt-small" href={`${home}/login`}>
                {l.again}
              </a>
            </>
          ) : (
            <>
              <Flash text={bad ? l.badLink : null} tone="error" />
              <form action={requestLinkAction} className="pt-form">
                {hidden}
                <label className="pt-field">
                  <span>{l.email}</span>
                  <input className="pt-input" type="email" name="email" required autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} />
                </label>
                <Primary>{l.submit}</Primary>
                <p className="pt-small pt-muted">{l.how}</p>
              </form>

              {mode === "demo" && (
                <div className="pt-form">
                  <p className="pt-label">{l.demoTitle}</p>
                  <p className="pt-small pt-muted">{l.demoText}</p>
                  <div className="pt-demo-list">
                    {DEMO_ACCOUNTS.map((a) => (
                      <form action={requestLinkAction} key={a.email}>
                        {hidden}
                        <input type="hidden" name="email" value={a.email} />
                        <button>
                          <span>{a.name}</span>
                          <span className="pt-muted">{a.role === "admin" ? "Admin" : lang === "fr" ? "Client" : "Client"}</span>
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
