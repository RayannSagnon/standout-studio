// The link from the sign-in email lands here. Nothing happens until the person
// clicks: mail scanners (Outlook Safe Links and others) open links on their own,
// and a one-time link must not be spent by them.

import Root from "@/components/portal/Root";
import type { Metadata } from "next";
import { confirmLinkAction } from "@/app/client/actions";
import { Bar, Primary, Title } from "@/components/portal/ui";
import "../../portal.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Connexion", robots: { index: false, follow: false } };

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ConfirmSignIn({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const next = one(sp.next);
  const en = next.startsWith("/client");
  return (
    <Root lang={en ? "en" : "fr"}>
      <Bar area={en ? "Client area" : "Espace client"} home={en ? "/" : "/fr"} />
      <main className="pt-login" id="main">
        <div className="pt-login-copy">
          <Title>{en ? "Almost there" : "Presque"}</Title>
          <p className="pt-sub">{en ? "One click and you're in." : "Un clic et vous y êtes."}</p>
        </div>
        <div className="pt-login-side">
          <form action={confirmLinkAction} className="pt-form">
            {["demo", "token_hash", "type", "next"].map((k) => (one(sp[k]) ? <input key={k} type="hidden" name={k} value={one(sp[k])} /> : null))}
            <input type="hidden" name="lang" value={en ? "en" : "fr"} />
            <div>
              <Primary>{en ? "Open my client area" : "Ouvrir mon espace"}</Primary>
            </div>
          </form>
        </div>
      </main>
    </Root>
  );
}
