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

        <div className="pt-login-side">
          {mode === "off" ? (
            <p>{l.off}</p>
          ) : sent ? (
            <div className="pt-form">
              <h2 className="pt-h2">{l.sentTitle}</h2>
              <p>{l.sentText}</p>
              {safeDemo && (
                <p>
                  <a className="btn btn-primary" href={safeDemo}>
                    <span>{l.demoOpen}</span>
                  </a>
                </p>
              )}
              <a className="link pt-small" href={`${home}/login`} style={{ justifySelf: "start" }}>
                {l.again}
              </a>
            </div>
          ) : (
            <>
              <form action={requestLinkAction} className="pt-form">
                <Flash text={bad ? l.badLink : null} tone="error" />
                {hidden}
                <label className="pt-field">
                  <span>{l.email}</span>
                  <input className="pt-input" type="email" name="email" required autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} />
                </label>
                <p className="pt-small pt-muted">{l.how}</p>
                <div>
                  <Primary>{l.submit}</Primary>
                </div>
              </form>

              {mode === "demo" && (
                <div className="pt-form">
                  <div>
                    <h2 className="pt-h3">{l.demoTitle}</h2>
                    <p className="pt-small pt-muted">{l.demoText}</p>
                  </div>
                  <div className="pt-accounts">
                    {DEMO_ACCOUNTS.map((a) => (
                      <form action={requestLinkAction} key={a.email}>
                        {hidden}
                        <input type="hidden" name="email" value={a.email} />
                        <button>
                          <span>{a.name}</span>
                          <span>{a.role === "admin" ? l.studio : l.client}</span>
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
