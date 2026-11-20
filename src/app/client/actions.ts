"use server";

// Client area form actions. Each one checks the session again on the server,
// then answers with a redirect that carries a short status code.

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { THEME_COOKIE } from "@/lib/portal/theme";
import { ForbiddenError, InputError } from "@/lib/portal/db";
import { confirmSignIn, portal, requestSignIn, signOut, verifySignInCode } from "@/lib/portal/server";
import * as svc from "@/lib/portal/service";
import { billingPortalUrl, careCheckoutUrl, invoiceCheckoutUrl, stripe } from "@/lib/portal/stripe";
import type { Lang } from "@/lib/portal/types";

const langOf = (f: FormData): Lang => (f.get("lang") === "en" ? "en" : "fr");
const home = (lang: Lang) => (lang === "fr" ? "/fr/client" : "/client");
const loginPath = (lang: Lang) => `${home(lang)}/login`;

function codeOf(err: unknown): string {
  if (err instanceof InputError) return err.field;
  return "generic";
}

/** Runs an action for the signed-in client; sends strangers to the sign-in page. */
async function asClient<T>(lang: Lang, run: (ctx: svc.Ctx) => Promise<T>, hash: string): Promise<T> {
  const { ctx } = await portal();
  if (!ctx.viewer || ctx.viewer.role !== "client") redirect(loginPath(lang));
  try {
    return await run(ctx);
  } catch (err) {
    if (err instanceof ForbiddenError) redirect(loginPath(lang));
    if (!(err instanceof InputError)) console.error("[client action]", err);
    redirect(`${home(lang)}?error=${codeOf(err)}${hash}`);
  }
}

export async function respondAction(form: FormData) {
  const lang = langOf(form);
  const decision = form.get("decision");
  await asClient(lang, (ctx) => svc.respondToVersion(ctx, String(form.get("version_id")), decision, form.get("comment")), "#version");
  redirect(`${home(lang)}?ok=${decision === "approved" ? "approved" : "changes"}#version`);
}

export async function messageAction(form: FormData) {
  const lang = langOf(form);
  await asClient(lang, (ctx) => svc.postMessage(ctx, { body: form.get("body") }), "#messages");
  redirect(`${home(lang)}?ok=message#messages`);
}

export async function payAction(form: FormData) {
  const lang = langOf(form);
  const id = String(form.get("invoice_id"));
  const { mode } = await portal();
  const url = await asClient(
    lang,
    async (ctx) => {
      const { invoice, client } = await svc.payableInvoice(ctx, id);
      if (mode === "demo") return `/client/pay/${invoice.id}?lang=${lang}`;
      if (!stripe()) throw new InputError("payment");
      return invoiceCheckoutUrl(ctx, invoice, client, ctx.viewer!.email);
    },
    "#invoices",
  );
  redirect(url);
}

export async function careAction(form: FormData) {
  const lang = langOf(form);
  const { mode } = await portal();
  const url = await asClient(
    lang,
    async (ctx) => {
      const clientId = ctx.viewer!.clientId as string;
      const dash = await svc.clientDashboard(ctx);
      const sub = dash.subscription;
      if (sub?.status === "active" || sub?.status === "past_due") {
        if (mode === "demo" || !sub.stripe_customer_id || !stripe()) throw new InputError("payment");
        return billingPortalUrl(ctx, dash.client, sub.stripe_customer_id);
      }
      if (mode === "demo") {
        await svc.setCareStatus({ ...ctx, viewer: null }, clientId, "active");
        return `${home(lang)}?ok=care#care`;
      }
      if (!stripe()) throw new InputError("payment");
      return careCheckoutUrl(ctx, dash.client, ctx.viewer!.email);
    },
    "#care",
  );
  redirect(url);
}

/** Demo only: what a successful Stripe checkout would do. */
export async function demoPayAction(form: FormData) {
  const lang = langOf(form);
  const { mode } = await portal();
  if (mode !== "demo") redirect(home(lang));
  await asClient(
    lang,
    async (ctx) => {
      const { invoice } = await svc.payableInvoice(ctx, String(form.get("invoice_id")));
      return svc.markInvoicePaid({ ...ctx, viewer: null }, invoice.id, "demo");
    },
    "#invoices",
  );
  redirect(`${home(lang)}?ok=paid#invoices`);
}

export async function requestLinkAction(form: FormData) {
  const lang = langOf(form);
  const email = String(form.get("email") || "").trim().toLowerCase();
  const { demoLink, demoCode, throttled } = await requestSignIn(email, lang);
  const q = new URLSearchParams({ sent: "1", email });
  if (throttled) q.set("wait", "1");
  if (demoLink) q.set("demo", demoLink);
  if (demoCode) q.set("code", demoCode);
  redirect(`${loginPath(lang)}?${q}`);
}

/** The 6-digit code from the sign-in email. */
export async function verifyCodeAction(form: FormData) {
  const lang = langOf(form);
  const email = String(form.get("email") || "");
  const next = await verifySignInCode(email, String(form.get("code") || ""));
  if (next) redirect(next);
  redirect(`${loginPath(lang)}?${new URLSearchParams({ sent: "1", email, error: "code" })}`);
}

/** The click on "Ouvrir mon espace" after following the emailed link. */
export async function confirmLinkAction(form: FormData) {
  const params = new URLSearchParams();
  for (const k of ["demo", "token_hash", "type", "next"]) {
    const v = form.get(k);
    if (typeof v === "string" && v) params.set(k, v);
  }
  const next = await confirmSignIn(params);
  if (next) redirect(next);
  redirect(`${langOf(form) === "en" ? "" : "/fr"}/client/login?error=link`);
}

export async function signOutAction(form: FormData) {
  const lang = langOf(form);
  await signOut();
  redirect(loginPath(lang));
}

/** Clair, Sombre or Auto, for the client and admin areas. */
export async function themeAction(form: FormData) {
  const v = form.get("theme");
  const theme = v === "dark" || v === "auto" ? v : "light";
  (await cookies()).set(THEME_COOKIE, theme, { path: "/", maxAge: 365 * 86_400, sameSite: "lax", httpOnly: false });
  let back = "/admin";
  try {
    const ref = new URL((await headers()).get("referer") || "");
    back = ref.pathname + ref.search;
  } catch {
    /* no referer: admin home */
  }
  redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/admin");
}
