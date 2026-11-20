// Sign-in by emailed link. Same screen for clients and for the studio.

import Root from "@/components/portal/Root";
import { redirect } from "next/navigation";
import { requestLinkAction, verifyCodeAction } from "@/app/client/actions";
import { CLIENT_COPY } from "@/lib/portal/copy";
import { DEMO_ACCOUNTS } from "@/lib/portal/demo";
import { baseUrl, portal } from "@/lib/portal/server";
import type { Lang } from "@/lib/portal/types";
import { Bar, Flash, Ghost, Primary, Title } from "./ui";

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
  const email = one(searchParams.email) ?? "";
  const demoCode = mode === "demo" ? one(searchParams.code) : undefined;
  const demoLink = one(searchParams.demo);
  const safeDemo = mode === "demo" && demoLink?.startsWith(`${base}/auth/confirm?`) ? demoLink : null;
  const hidden = <input type="hidden" name="lang" value={lang} />;

  return (
    <Root lang={lang}>
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
            <>
              <div className="pt-form">
                <h2 className="pt-h2">{l.sentTitle}</h2>
                <p>{l.sentText}</p>
                {one(searchParams.wait) && <p className="pt-small pt-muted">{l.wait}</p>}
                {safeDemo && (
                  <p>
                    <a className="btn btn-primary" href={safeDemo}>
                      <span>{l.demoOpen}</span>
                    </a>
                  </p>
                )}
              </div>
              {email && (
                <form action={verifyCodeAction} className="pt-form">
                  <Flash text={one(searchParams.error) === "code" ? l.codeError : null} tone="error" />
                  {hidden}
                  <input type="hidden" name="email" value={email} />
                  <label className="pt-field">
                    <span>{l.codeLabel}</span>
                    <input className="pt-input pt-code" name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} placeholder="123 456" />
                    <small>{demoCode ? l.demoCodeHint(demoCode) : l.codeHint}</small>
                  </label>
                  <div>
                    <Ghost>{l.codeSubmit}</Ghost>
                  </div>
                </form>
              )}
              <div className="pt-actions">
                {email && (
                  <form action={requestLinkAction}>
                    {hidden}
                    <input type="hidden" name="email" value={email} />
                    <button className="pt-textbtn pt-small">{l.resend}</button>
                  </form>
                )}
                <a className="pt-small" href={`${home}/login`}>
                  {l.again}
                </a>
              </div>
            </>
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
    </Root>
  );
}
