// Server entry point for the client and admin areas: picks the backend, resolves
// who is signed in, and handles sign-in links. Never imported by browser code.

import "server-only";
import { cookies, headers } from "next/headers";
import { createClient as createSupabase, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { adminEmails, demoSecret, portalMode, resendEnv, supabaseEnv, type PortalMode } from "./config.ts";
import { demoState, readToken, signToken } from "./demo.ts";
import { emails } from "./emails.ts";
import { ensureAdminUser, touchLogin, type AuthPort, type Ctx, type Mailer } from "./service.ts";
import { supabaseDb } from "./supabaseDb.ts";
import type { Lang, Viewer } from "./types.ts";

const DEMO_COOKIE = "ss_demo_session";
const SESSION_DAYS = 30;
const LINK_TTL = 60 * 60 * 1000;

export async function baseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL || "https://standoutstudio.ca";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Only same-site paths are allowed after sign-in. */
export const safeNext = (next: unknown, fallback = "/client") =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : fallback;

// ---------- Supabase clients ----------

let serviceClient: SupabaseClient | null = null;
function service(): SupabaseClient {
  const s = supabaseEnv();
  return (serviceClient ??= createSupabase(s.url, s.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }));
}

async function session(): Promise<SupabaseClient> {
  const s = supabaseEnv();
  const store = await cookies();
  return createServerClient(s.url, s.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; the proxy refreshes the session instead.
        }
      },
    },
  });
}

async function findAuthUserId(email: string): Promise<string | null> {
  for (let page = 1; page < 20; page++) {
    const { data, error } = await service().auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

// ---------- mail ----------

function mailer(mode: PortalMode): Mailer {
  const r = resendEnv();
  if (r.key) {
    return {
      async send(m) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${r.key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: r.from, to: m.to, subject: m.subject, html: m.html, text: m.text }),
        });
        if (!res.ok) throw new Error(`resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
      },
    };
  }
  if (mode === "demo") {
    return {
      async send(m) {
        demoState().outbox.unshift({ id: crypto.randomUUID(), to: m.to, subject: m.subject, text: m.text, html: m.html, created_at: new Date().toISOString() });
      },
    };
  }
  return {
    async send(m) {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[portal] email not sent (RESEND_API_KEY missing) to ${m.to.join(", ")}: ${m.subject}\n${m.text}`);
        return;
      }
      throw new Error("RESEND_API_KEY is not set");
    },
  };
}

// ---------- auth ----------

function authPort(mode: PortalMode, base: string): AuthPort {
  if (mode === "demo") {
    return {
      ensureAccount: async () => crypto.randomUUID(),
      loginLink: async (email, next) => `${base}/auth/confirm?demo=${signToken(demoSecret(), { email, next }, LINK_TTL)}`,
    };
  }
  return {
    async ensureAccount(email) {
      const { data, error } = await service().auth.admin.createUser({ email, email_confirm: true });
      if (data?.user) return data.user.id;
      const id = await findAuthUserId(email);
      if (id) return id;
      throw error ?? new Error("could not create account");
    },
    async loginLink(email, next) {
      const { data, error } = await service().auth.admin.generateLink({ type: "magiclink", email });
      if (error || !data?.properties?.hashed_token) throw error ?? new Error("could not create link");
      const q = new URLSearchParams({ token_hash: data.properties.hashed_token, type: "magiclink", next });
      return `${base}/auth/confirm?${q}`;
    },
  };
}

// ---------- context ----------

function db(mode: PortalMode) {
  return mode === "demo" ? demoState().db : supabaseDb(service());
}

async function makeCtx(mode: PortalMode, viewer: Viewer | null, readDb?: Ctx["readDb"]): Promise<Ctx> {
  const base = await baseUrl();
  return { db: db(mode), readDb, viewer, mailer: mailer(mode), auth: authPort(mode, base), baseUrl: base, adminEmails: adminEmails() };
}

async function resolveViewer(mode: PortalMode): Promise<{ viewer: Viewer | null; readDb?: Ctx["readDb"] }> {
  if (mode === "off") return { viewer: null };
  if (mode === "demo") {
    const token = readToken<{ uid: string }>(demoSecret(), (await cookies()).get(DEMO_COOKIE)?.value);
    const user = token ? await demoState().db.get("users", token.uid) : null;
    return { viewer: user ? { userId: user.id, email: user.email, name: user.name, role: user.role, clientId: user.client_id } : null };
  }
  const sb = await session();
  const { data } = await sb.auth.getUser();
  if (!data.user) return { viewer: null };
  const user = await supabaseDb(service()).get("users", data.user.id);
  if (!user) return { viewer: null };
  return { viewer: { userId: user.id, email: user.email, name: user.name, role: user.role, clientId: user.client_id }, readDb: supabaseDb(sb) };
}

/** The context for the current request, with the signed-in person (or null). */
export async function portal(): Promise<{ mode: PortalMode; ctx: Ctx }> {
  const mode = portalMode();
  const { viewer, readDb } = await resolveViewer(mode);
  return { mode, ctx: await makeCtx(mode, viewer, readDb) };
}

/** A context with no viewer, for the contact form, webhooks and the daily reminders. */
export async function systemCtx(): Promise<Ctx> {
  return makeCtx(portalMode(), null);
}

// ---------- sign-in ----------

const recent = new Map<string, number>();

/**
 * Sends a sign-in link if the address belongs to someone. The answer is the same
 * either way, so the form never reveals who is a client. In demo mode the link is
 * also returned so the page can show it.
 */
export async function requestSignIn(rawEmail: string, lang: Lang): Promise<{ demoLink?: string }> {
  const mode = portalMode();
  if (mode === "off") return {};
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return {};
  // One email per address every 30 seconds (no real email leaves in demo mode)
  const last = recent.get(email) ?? 0;
  if (mode !== "demo" && Date.now() - last < 30_000) return {};
  recent.set(email, Date.now());

  const ctx = await makeCtx(mode, null);
  const user = (await ctx.db.list("users", { email }))[0];
  const isAdmin = user?.role === "admin" || ctx.adminEmails.includes(email);
  if (!user && !isAdmin) return {};
  if (!user && mode === "supabase") await ctx.auth.ensureAccount(email);

  let userLang: Lang = lang;
  if (user?.client_id) userLang = (await ctx.db.get("clients", user.client_id))?.lang ?? lang;
  const next = isAdmin ? "/admin" : userLang === "fr" ? "/fr/client" : "/client";
  const link = await ctx.auth.loginLink(email, next);
  try {
    await ctx.mailer.send({ to: [email], ...emails.login(isAdmin ? "fr" : userLang, link) });
  } catch (err) {
    console.error("[portal] sign-in email failed", err);
  }
  return mode === "demo" ? { demoLink: link } : {};
}

/** Handles the link from the email. Returns where to go next, or null if the link is invalid. */
export async function confirmSignIn(params: URLSearchParams): Promise<string | null> {
  const mode = portalMode();
  if (mode === "off") return null;
  const ctx = await makeCtx(mode, null);

  if (mode === "demo") {
    const data = readToken<{ email: string; next: string }>(demoSecret(), params.get("demo"));
    const state = demoState();
    if (!data || state.used.has(data.n)) return null;
    state.used.add(data.n);
    let user = (await ctx.db.list("users", { email: data.email }))[0] ?? (await ensureAdminUser(ctx, crypto.randomUUID(), data.email));
    if (!user) return null;
    user = await touchLogin(ctx, user.id);
    (await cookies()).set(DEMO_COOKIE, signToken(demoSecret(), { uid: user.id }, SESSION_DAYS * 86_400_000), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 86_400,
    });
    return safeNext(data.next);
  }

  const tokenHash = params.get("token_hash");
  if (!tokenHash) return null;
  const sb = await session();
  const { data, error } = await sb.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (error || !data.user?.email) return null;
  const user = (await ctx.db.get("users", data.user.id)) ?? (await ensureAdminUser(ctx, data.user.id, data.user.email));
  if (!user) {
    await sb.auth.signOut();
    return null;
  }
  await touchLogin(ctx, user.id);
  return safeNext(params.get("next"), user.role === "admin" ? "/admin" : "/client");
}

export async function signOut() {
  const mode = portalMode();
  if (mode === "demo") (await cookies()).delete(DEMO_COOKIE);
  if (mode === "supabase") await (await session()).auth.signOut();
}
