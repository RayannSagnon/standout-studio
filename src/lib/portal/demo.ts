// Demo mode: an in-memory store with fictional sample data, an outbox instead of
// real emails, and signed sign-in tokens. Everything resets when the server restarts.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { memoryDb, type Db } from "./db.ts";
import type { OutboxEmail, Tables } from "./types.ts";

export const DEMO_ACCOUNTS = [
  { email: "rayann@demo.standout", name: "Rayann", role: "admin" as const },
  { email: "steven@demo.standout", name: "Steven", role: "admin" as const },
  { email: "camille@demo.standout", name: "Camille Roy", role: "client" as const },
  { email: "julien@demo.standout", name: "Julien Dubois", role: "client" as const },
];

const daysAgo = (n: number, h = 14) => {
  const d = new Date(Date.now() - n * 86_400_000);
  d.setUTCHours(h, 0, 0, 0);
  return d.toISOString();
};
const day = (n: number) => daysAgo(n).slice(0, 10);

function seed(): Partial<{ [N in keyof Tables]: Tables[N][] }> {
  const camille = "c-camille";
  const julien = "c-julien";
  const nadia = "c-nadia";
  const pCamille = "p-camille";
  const pJulien = "p-julien";
  return {
    clients: [
      { id: camille, name: "Camille Roy", company: "Camille Roy Coaching", email: "camille@demo.standout", phone: null, lang: "fr", status: "active", source_message: null, created_at: daysAgo(48) },
      { id: julien, name: "Julien Dubois", company: "Boulangerie Lune", email: "julien@demo.standout", phone: "613-555-0142", lang: "en", status: "care", source_message: null, created_at: daysAgo(120) },
      { id: nadia, name: "Nadia Haddad", company: null, email: "nadia@demo.standout", phone: null, lang: "fr", status: "prospect", source_message: "Bonjour, je suis photographe à Gatineau et j'aimerais un site simple pour montrer mon travail et recevoir des demandes. Budget autour de 1000 $.", created_at: daysAgo(1, 13) },
    ],
    team_notes: [
      { id: "t1", client_id: camille, author_id: "u-steven", author_name: "Steven", body: "Elle préfère les appels le matin. Elle veut un formulaire de réservation relié à Calendly.", created_at: daysAgo(20, 15) },
      { id: "t2", client_id: camille, author_id: "u-rayann", author_name: "Rayann", body: "Ok. Je lui fais un prix pour le blogue après le lancement.", created_at: daysAgo(9, 19) },
    ],
    users: [
      { id: "u-rayann", email: "rayann@demo.standout", name: "Rayann", role: "admin", client_id: null, created_at: daysAgo(200), last_login_at: daysAgo(0), seen_at: daysAgo(4, 18) },
      { id: "u-steven", email: "steven@demo.standout", name: "Steven", role: "admin", client_id: null, created_at: daysAgo(200), last_login_at: daysAgo(1), seen_at: daysAgo(1, 20) },
      { id: "u-camille", email: "camille@demo.standout", name: "Camille Roy", role: "client", client_id: camille, created_at: daysAgo(47), last_login_at: daysAgo(3) },
      { id: "u-julien", email: "julien@demo.standout", name: "Julien Dubois", role: "client", client_id: julien, created_at: daysAgo(119), last_login_at: daysAgo(30) },
    ],
    projects: [
      {
        id: pCamille, client_id: camille, name: "Site de Camille Roy", package: "growth", stage: "build",
        stage_dates: { call: day(48), brief: day(41), build: day(30) }, revisions_included: 3,
        next_action_fr: "Vos commentaires sur la version 2.", next_action_en: "Your feedback on version 2.", waiting_on: "client", created_at: daysAgo(48),
      },
      {
        id: pJulien, client_id: julien, name: "Boulangerie Lune website", package: "essential", stage: "live",
        stage_dates: { call: day(120), brief: day(112), build: day(100), launch: day(80), live: day(78) }, revisions_included: 2,
        next_action_fr: null, next_action_en: null, waiting_on: null, created_at: daysAgo(120),
      },
    ],
    versions: [
      { id: "v-c1", project_id: pCamille, client_id: camille, number: 1, preview_url: "https://standoutstudio.ca/work/caramello-cafe", note: "Première version : accueil, services et contact.", status: "changes_requested", client_comment: "J'adore la typo. Peut-on remonter le bouton de réservation et ajouter mes témoignages ?", shared_at: daysAgo(16), responded_at: daysAgo(14) },
      { id: "v-c2", project_id: pCamille, client_id: camille, number: 2, preview_url: "https://standoutstudio.ca/work/relentless-ritchie", note: "Bouton de réservation remonté, section témoignages ajoutée (avec des textes provisoires à remplacer).", status: "pending", client_comment: null, shared_at: daysAgo(6), responded_at: null },
      { id: "v-j1", project_id: pJulien, client_id: julien, number: 1, preview_url: "https://standoutstudio.ca/work/caramello-cafe", note: "First version.", status: "approved", client_comment: "Perfect, ship it.", shared_at: daysAgo(85), responded_at: daysAgo(83) },
    ],
    invoices: [
      { id: "i1", client_id: camille, project_id: pCamille, number: "F-2026-001", label: "Forfait Croissance, 1er versement", amount_cents: 49950, tax_rate: 0, status: "paid", due_date: day(40), sent_at: daysAgo(41), paid_at: daysAgo(40), stripe_session_id: null, created_at: daysAgo(41) },
      { id: "i2", client_id: camille, project_id: pCamille, number: "F-2026-002", label: "Forfait Croissance, solde", amount_cents: 49950, tax_rate: 0, status: "draft", due_date: null, sent_at: null, paid_at: null, stripe_session_id: null, created_at: daysAgo(2) },
      { id: "i3", client_id: julien, project_id: pJulien, number: "F-2026-003", label: "Essential package", amount_cents: 39900, tax_rate: 0, status: "sent", due_date: day(3), sent_at: daysAgo(17), paid_at: null, stripe_session_id: null, created_at: daysAgo(17) },
    ],
    subscriptions: [
      { id: "s1", client_id: julien, status: "active", price_cents: 3900, stripe_customer_id: null, stripe_subscription_id: null, updated_at: daysAgo(78) },
    ],
    messages: [
      { id: "m1", client_id: camille, author_id: "u-camille", author_role: "client", author_name: "Camille Roy", body: "Bonjour ! Est-ce qu'on pourra ajouter une page blogue plus tard ?", created_at: daysAgo(9, 15) },
      { id: "m2", client_id: camille, author_id: "u-steven", author_role: "admin", author_name: "Steven", body: "Oui, sans problème. On le prévoit après le lancement, je vous envoie un prix séparé.", created_at: daysAgo(9, 18) },
    ],
    events: [
      { id: "e1", client_id: nadia, project_id: null, type: "lead.created", data: { name: "Nadia Haddad" }, visible_to_client: false, actor_name: null, created_at: daysAgo(1, 13) },
      { id: "e2", client_id: camille, project_id: pCamille, type: "version.shared", data: { number: 2 }, visible_to_client: true, actor_name: "Steven", created_at: daysAgo(6) },
      { id: "e3", client_id: camille, project_id: pCamille, type: "version.changes_requested", data: { number: 1 }, visible_to_client: true, actor_name: null, created_at: daysAgo(14) },
      { id: "e4", client_id: camille, project_id: pCamille, type: "version.shared", data: { number: 1 }, visible_to_client: true, actor_name: "Steven", created_at: daysAgo(16) },
      { id: "e5", client_id: camille, project_id: pCamille, type: "project.stage", data: { stage: "build" }, visible_to_client: true, actor_name: "Rayann", created_at: daysAgo(30) },
      { id: "e6", client_id: camille, project_id: null, type: "invoice.paid", data: { number: "F-2026-001" }, visible_to_client: true, actor_name: null, created_at: daysAgo(40) },
      { id: "e7", client_id: camille, project_id: pCamille, type: "project.stage", data: { stage: "brief" }, visible_to_client: true, actor_name: null, created_at: daysAgo(41) },
      { id: "e8", client_id: camille, project_id: pCamille, type: "project.created", data: { package: "growth" }, visible_to_client: true, actor_name: null, created_at: daysAgo(48) },
      { id: "e9", client_id: julien, project_id: null, type: "invoice.sent", data: { number: "F-2026-003" }, visible_to_client: true, actor_name: "Rayann", created_at: daysAgo(17) },
      { id: "e10", client_id: julien, project_id: null, type: "care.active", data: {}, visible_to_client: true, actor_name: null, created_at: daysAgo(78) },
    ],
  };
}

type DemoState = { db: Db; outbox: OutboxEmail[]; used: Set<string>; codes: Map<string, { code: string; next: string; exp: number; tries: number }> };
const g = globalThis as unknown as { __standoutDemo?: DemoState };

export function demoState(): DemoState {
  return (g.__standoutDemo ??= { db: memoryDb(seed()), outbox: [], used: new Set(), codes: new Map() });
}

export function resetDemo() {
  g.__standoutDemo = undefined;
  return demoState();
}

// ---------- signed tokens (sign-in links and session cookie) ----------

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString();
const sig = (secret: string, payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

export function signToken(secret: string, data: Record<string, unknown>, ttlMs: number) {
  const payload = b64(JSON.stringify({ ...data, exp: Date.now() + ttlMs, n: randomBytes(8).toString("hex") }));
  return `${payload}.${sig(secret, payload)}`;
}

export function readToken<T extends Record<string, unknown>>(secret: string, token: string | undefined | null): (T & { exp: number; n: string }) | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sig(secret, payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(unb64(payload));
    return typeof data.exp === "number" && data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}
