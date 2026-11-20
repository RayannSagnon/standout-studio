// Business rules for the three parts of the site. Written once, used by both
// storage backends. Every function checks who is asking, even though Supabase
// row-level security checks again underneath.

import { ForbiddenError, InputError, NotFoundError, type Db } from "./db.ts";
import { emails, type Email } from "./emails.ts";
import { dayOf, fmtDate, STAGE_LABEL } from "./labels.ts";
import {
  CARE_PRICE_CENTS,
  invoiceTotal,
  PACKAGES,
  REVISIONS_BY_PACKAGE,
  STAGES,
  type Client,
  type EventType,
  type Invoice,
  type Lang,
  type PackageId,
  type PortalEvent,
  type Project,
  type Stage,
  type Subscription,
  type SubscriptionStatus,
  type User,
  type Version,
  type Viewer,
  type WaitingOn,
} from "./types.ts";

export type Mailer = { send(m: { to: string[] } & Email): Promise<void> };

/** How accounts and sign-in links are made. Supabase Auth in production, signed tokens in demo. */
export type AuthPort = {
  ensureAccount(email: string): Promise<string>;
  loginLink(email: string, next: string): Promise<string>;
};

export type Ctx = {
  /** Trusted store: every write and every admin read. Business rules check access before using it. */
  db: Db;
  /** Store bound to the signed-in client (row-level security). Client-area reads go through it when present. */
  readDb?: Db;
  viewer: Viewer | null;
  mailer: Mailer;
  auth: AuthPort;
  baseUrl: string;
  adminEmails: string[];
  now?: () => Date;
};

export const FEEDBACK_REMINDER_DAYS = 5;
export const INVOICE_REMINDER_DAYS = 7;

const DAY = 86_400_000;
const now = (ctx: Ctx) => (ctx.now ? ctx.now() : new Date());
const iso = (ctx: Ctx) => now(ctx).toISOString();
const today = (ctx: Ctx) => dayOf(now(ctx));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- access ----------

export function requireAdmin(ctx: Ctx): Viewer {
  if (!ctx.viewer || ctx.viewer.role !== "admin") throw new ForbiddenError();
  return ctx.viewer;
}

export function requireClient(ctx: Ctx): Viewer & { clientId: string } {
  const v = ctx.viewer;
  if (!v || v.role !== "client" || !v.clientId) throw new ForbiddenError();
  return v as Viewer & { clientId: string };
}

/** Rows that do not belong to the viewer answer "not found", so nothing leaks. */
async function ownedBy<T extends { client_id: string }>(row: T | null, clientId: string): Promise<T> {
  if (!row || row.client_id !== clientId) throw new NotFoundError();
  return row;
}

// ---------- small helpers ----------

function text(v: unknown, field: string, { min = 1, max = 5000, optional = false } = {}): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) {
    if (optional) return null;
    throw new InputError(field);
  }
  if (s.length < min || s.length > max) throw new InputError(field);
  return s;
}

function email(v: unknown, field = "email"): string {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(s) || s.length > 254) throw new InputError(field);
  return s;
}

function httpsUrl(v: unknown, field: string): string {
  const s = typeof v === "string" ? v.trim() : "";
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") throw new Error();
    return u.toString();
  } catch {
    throw new InputError(field);
  }
}

const langOf = (v: unknown): Lang => (v === "en" ? "en" : "fr");

export const clientUrl = (ctx: Ctx, lang: Lang, hash = "") => `${ctx.baseUrl}${lang === "fr" ? "/fr" : ""}/client${hash}`;
export const adminUrl = (ctx: Ctx, clientId?: string) => `${ctx.baseUrl}/admin${clientId ? `/clients/${clientId}` : ""}`;

async function record(
  ctx: Ctx,
  type: EventType,
  { client_id = null, project_id = null, data = {}, visible = false }: { client_id?: string | null; project_id?: string | null; data?: Record<string, unknown>; visible?: boolean },
) {
  return ctx.db.insert("events", { client_id, project_id, type, data, visible_to_client: visible, created_at: iso(ctx) });
}

/** Sending never breaks the action that triggered it. Failures land in the journal. */
async function deliver(ctx: Ctx, to: string[], mail: Email, clientId: string | null = null) {
  const list = [...new Set(to.filter(Boolean))];
  if (!list.length) return;
  try {
    await ctx.mailer.send({ to: list, ...mail });
  } catch (err) {
    await record(ctx, "email.failed", { client_id: clientId, data: { subject: mail.subject, error: String((err as Error)?.message || err) } });
  }
}

async function adminRecipients(ctx: Ctx) {
  const admins = await ctx.db.list("users", { role: "admin" });
  return [...admins.map((a) => a.email), ...ctx.adminEmails];
}

async function clientRecipients(ctx: Ctx, clientId: string) {
  const users = await ctx.db.list("users", { client_id: clientId });
  return users.map((u) => u.email);
}

async function getClient(ctx: Ctx, id: string) {
  const c = await ctx.db.get("clients", id);
  if (!c) throw new NotFoundError();
  return c;
}

export const revisionsUsed = (versions: Pick<Version, "status">[]) => versions.filter((v) => v.status === "changes_requested").length;

// ---------- public site ----------

/** Contact form → prospect. Runs as a system task (no viewer). */
export async function createLead(ctx: Ctx, input: Record<string, unknown>) {
  const name = text(input.name, "name", { max: 120 }) as string;
  const mail = email(input.email);
  const message = text(input.message, "message", { max: 5000 }) as string;
  const phone = text(input.phone, "phone", { max: 40, optional: true });
  const lang = langOf(input.lang);

  const existing = (await ctx.db.list("clients", { email: mail }))[0];
  const client =
    existing ??
    (await ctx.db.insert("clients", { name, company: null, email: mail, phone, lang, status: "prospect", source_message: message, created_at: iso(ctx) }));

  await record(ctx, "lead.created", { client_id: client.id, data: { name, message, returning: Boolean(existing) } });
  await deliver(
    ctx,
    await adminRecipients(ctx),
    emails.admin(existing ? `Nouvelle demande de ${name} (déjà dans l'admin)` : `Nouveau prospect : ${name}`, [`${name} <${mail}>${phone ? `, ${phone}` : ""}`, message], adminUrl(ctx, client.id)),
  );
  return client;
}

// ---------- client area ----------

export async function clientDashboard(ctx: Ctx) {
  const v = requireClient(ctx);
  const db = ctx.readDb ?? ctx.db;
  const client = await db.get("clients", v.clientId);
  if (!client) throw new NotFoundError();
  const [projects, versions, invoices, subs, messages, events] = await Promise.all([
    db.list("projects", { client_id: v.clientId }, { order: ["created_at", "desc"] }),
    db.list("versions", { client_id: v.clientId }, { order: ["number", "desc"] }),
    db.list("invoices", { client_id: v.clientId, status: ["sent", "paid", "overdue"] }, { order: ["created_at", "desc"] }),
    db.list("subscriptions", { client_id: v.clientId }),
    db.list("messages", { client_id: v.clientId }, { order: ["created_at", "asc"] }),
    db.list("events", { client_id: v.clientId, visible_to_client: true }, { order: ["created_at", "desc"], limit: 30 }),
  ]);
  return {
    client,
    projects: projects.map((p) => {
      const vs = versions.filter((x) => x.project_id === p.id);
      return { ...p, versions: vs, revisionsUsed: revisionsUsed(vs) };
    }),
    invoices,
    subscription: subs[0] ?? null,
    messages,
    events,
  };
}

export async function respondToVersion(ctx: Ctx, versionId: string, decision: unknown, comment: unknown) {
  const v = requireClient(ctx);
  const version = await ownedBy(await ctx.db.get("versions", versionId), v.clientId);
  if (version.status !== "pending") throw new InputError("version_closed");
  if (decision !== "approved" && decision !== "changes_requested") throw new InputError("decision");
  const note = text(comment, "comment", { max: 5000, optional: decision === "approved" });

  const project = (await ctx.db.get("projects", version.project_id)) as Project;
  const all = await ctx.db.list("versions", { project_id: project.id });
  const usedBefore = revisionsUsed(all);
  const overLimit = decision === "changes_requested" && usedBefore >= project.revisions_included;

  const updated = await ctx.db.update("versions", version.id, { status: decision, client_comment: note, responded_at: iso(ctx) });
  const n = version.number;
  await ctx.db.update("projects", project.id, {
    waiting_on: "studio",
    next_action_fr: decision === "approved" ? `Version ${n} approuvée. Nous préparons la suite.` : `Nous préparons la version ${n + 1}.`,
    next_action_en: decision === "approved" ? `Version ${n} approved. We're preparing what's next.` : `We're preparing version ${n + 1}.`,
  });
  await record(ctx, decision === "approved" ? "version.approved" : "version.changes_requested", {
    client_id: v.clientId,
    project_id: project.id,
    data: { number: n, comment: note, over_limit: overLimit },
    visible: true,
  });
  const client = await getClient(ctx, v.clientId);
  await deliver(
    ctx,
    await adminRecipients(ctx),
    emails.admin(
      decision === "approved" ? `${client.name} approuve la version ${n}` : `${client.name} demande des modifications (version ${n})`,
      [
        ...(note ? [note] : []),
        ...(overLimit ? [`Attention : les ${project.revisions_included} révisions incluses sont déjà utilisées.`] : []),
      ],
      adminUrl(ctx, client.id),
    ),
  );
  return updated;
}

export async function payableInvoice(ctx: Ctx, invoiceId: string) {
  const v = requireClient(ctx);
  const inv = await ownedBy(await ctx.db.get("invoices", invoiceId), v.clientId);
  if (inv.status !== "sent" && inv.status !== "overdue") throw new InputError("invoice_not_payable");
  return { invoice: inv, client: await getClient(ctx, v.clientId) };
}

// ---------- messages (both sides) ----------

export async function postMessage(ctx: Ctx, input: { clientId?: string; body: unknown }) {
  const v = ctx.viewer;
  if (!v) throw new ForbiddenError();
  const clientId = v.role === "admin" ? String(input.clientId || "") : requireClient(ctx).clientId;
  const client = await getClient(ctx, clientId);
  const body = text(input.body, "body", { max: 5000 }) as string;
  const msg = await ctx.db.insert("messages", { client_id: clientId, author_id: v.userId, author_role: v.role, author_name: v.name, body, created_at: iso(ctx) });
  await record(ctx, "message.posted", { client_id: clientId, data: { by: v.role } });
  if (v.role === "admin") {
    await deliver(ctx, await clientRecipients(ctx, clientId), emails.messageToClient(client.lang, `${v.name}, Standout Studio`, body, clientUrl(ctx, client.lang, "#messages")), clientId);
  } else {
    await deliver(ctx, await adminRecipients(ctx), emails.admin(`Message de ${client.name}`, [body], `${adminUrl(ctx, clientId)}#messages`), clientId);
  }
  return msg;
}

// ---------- admin ----------

export async function adminOverview(ctx: Ctx) {
  requireAdmin(ctx);
  const [clients, projects, invoices, events] = await Promise.all([
    ctx.db.list("clients", {}, { order: ["created_at", "desc"] }),
    ctx.db.list("projects", {}, { order: ["created_at", "desc"] }),
    ctx.db.list("invoices", { status: ["sent", "overdue"] }, { order: ["due_date", "asc"] }),
    ctx.db.list("events", {}, { order: ["created_at", "desc"], limit: 25 }),
  ]);
  const name = new Map(clients.map((c) => [c.id, c.name]));
  const active = projects.filter((p) => p.stage !== "live");
  return {
    clients,
    prospects: clients.filter((c) => c.status === "prospect"),
    waitingOnStudio: active.filter((p) => p.waiting_on === "studio").map((p) => ({ ...p, clientName: name.get(p.client_id) ?? "" })),
    waitingOnClient: active.filter((p) => p.waiting_on === "client").map((p) => ({ ...p, clientName: name.get(p.client_id) ?? "" })),
    unpaid: invoices.map((i) => ({ ...i, clientName: name.get(i.client_id) ?? "" })),
    events: events.map((e) => ({ ...e, clientName: e.client_id ? (name.get(e.client_id) ?? "") : "" })),
  };
}

export async function adminClient(ctx: Ctx, clientId: string) {
  requireAdmin(ctx);
  const client = await getClient(ctx, clientId);
  const [notes, users, projects, versions, invoices, subs, messages, events] = await Promise.all([
    ctx.db.list("client_notes", { client_id: clientId }),
    ctx.db.list("users", { client_id: clientId }),
    ctx.db.list("projects", { client_id: clientId }, { order: ["created_at", "desc"] }),
    ctx.db.list("versions", { client_id: clientId }, { order: ["number", "desc"] }),
    ctx.db.list("invoices", { client_id: clientId }, { order: ["created_at", "desc"] }),
    ctx.db.list("subscriptions", { client_id: clientId }),
    ctx.db.list("messages", { client_id: clientId }, { order: ["created_at", "asc"] }),
    ctx.db.list("events", { client_id: clientId }, { order: ["created_at", "desc"], limit: 50 }),
  ]);
  return {
    client,
    notes: notes[0]?.body ?? "",
    users,
    projects: projects.map((p) => {
      const vs = versions.filter((x) => x.project_id === p.id);
      return { ...p, versions: vs, revisionsUsed: revisionsUsed(vs) };
    }),
    invoices,
    subscription: subs[0] ?? null,
    messages,
    events,
  };
}

export async function createClient(ctx: Ctx, input: Record<string, unknown>) {
  requireAdmin(ctx);
  const client = await ctx.db.insert("clients", {
    name: text(input.name, "name", { max: 120 }) as string,
    company: text(input.company, "company", { max: 120, optional: true }),
    email: email(input.email),
    phone: text(input.phone, "phone", { max: 40, optional: true }),
    lang: langOf(input.lang),
    status: "active",
    source_message: null,
    created_at: iso(ctx),
  });
  await record(ctx, "client.created", { client_id: client.id });
  return client;
}

export async function updateClient(ctx: Ctx, clientId: string, input: Record<string, unknown>) {
  requireAdmin(ctx);
  await getClient(ctx, clientId);
  const status = ["prospect", "active", "care", "archived"].includes(String(input.status)) ? (input.status as Client["status"]) : undefined;
  return ctx.db.update("clients", clientId, {
    name: text(input.name, "name", { max: 120 }) as string,
    company: text(input.company, "company", { max: 120, optional: true }),
    email: email(input.email),
    phone: text(input.phone, "phone", { max: 40, optional: true }),
    lang: langOf(input.lang),
    ...(status ? { status } : {}),
  });
}

export async function saveNotes(ctx: Ctx, clientId: string, body: unknown) {
  requireAdmin(ctx);
  await getClient(ctx, clientId);
  const value = typeof body === "string" ? body.slice(0, 20000) : "";
  const existing = (await ctx.db.list("client_notes", { client_id: clientId }))[0];
  return existing
    ? ctx.db.update("client_notes", existing.id, { body: value, updated_at: iso(ctx) })
    : ctx.db.insert("client_notes", { client_id: clientId, body: value, updated_at: iso(ctx) });
}

export async function inviteUser(ctx: Ctx, clientId: string, input: Record<string, unknown>) {
  requireAdmin(ctx);
  const client = await getClient(ctx, clientId);
  const mail = email(input.email);
  const name = (text(input.name, "name", { max: 120, optional: true }) ?? client.name) as string;

  let user: User | undefined = (await ctx.db.list("users", { email: mail }))[0];
  if (user && user.client_id !== clientId) throw new InputError("email_taken");
  if (!user) {
    const id = await ctx.auth.ensureAccount(mail);
    user = await ctx.db.insert("users", { id, email: mail, name, role: "client", client_id: clientId, created_at: iso(ctx), last_login_at: null });
  }
  if (client.status === "prospect") await ctx.db.update("clients", clientId, { status: "active" });
  const link = await ctx.auth.loginLink(mail, client.lang === "fr" ? "/fr/client" : "/client");
  await deliver(ctx, [mail], emails.invite(client.lang, name.split(" ")[0], link), clientId);
  await record(ctx, "client.invited", { client_id: clientId, data: { email: mail } });
  return user;
}

export async function createProject(ctx: Ctx, clientId: string, input: Record<string, unknown>) {
  requireAdmin(ctx);
  const client = await getClient(ctx, clientId);
  const pkg = (PACKAGES as string[]).includes(String(input.package)) ? (input.package as PackageId) : "growth";
  const project = await ctx.db.insert("projects", {
    client_id: clientId,
    name: (text(input.name, "name", { max: 120, optional: true }) ?? (client.lang === "fr" ? `Site de ${client.name}` : `${client.name} website`)) as string,
    package: pkg,
    stage: "call",
    stage_dates: { call: today(ctx) },
    revisions_included: REVISIONS_BY_PACKAGE[pkg],
    next_action_fr: "Appel de démarrage.",
    next_action_en: "Kickoff call.",
    waiting_on: "studio",
    created_at: iso(ctx),
  });
  await record(ctx, "project.created", { client_id: clientId, project_id: project.id, data: { package: pkg }, visible: true });
  return project;
}

async function adminProject(ctx: Ctx, projectId: string) {
  requireAdmin(ctx);
  const p = await ctx.db.get("projects", projectId);
  if (!p) throw new NotFoundError();
  return p;
}

export async function setStage(ctx: Ctx, projectId: string, stage: unknown) {
  const project = await adminProject(ctx, projectId);
  if (!(STAGES as unknown[]).includes(stage)) throw new InputError("stage");
  const s = stage as Stage;
  if (s === project.stage) return project;
  const updated = await ctx.db.update("projects", projectId, { stage: s, stage_dates: { ...project.stage_dates, [s]: project.stage_dates[s] ?? today(ctx) } });
  await record(ctx, "project.stage", { client_id: project.client_id, project_id: projectId, data: { stage: s }, visible: true });
  const client = await getClient(ctx, project.client_id);
  await deliver(ctx, await clientRecipients(ctx, client.id), emails.stageChanged(client.lang, STAGE_LABEL[client.lang][s], clientUrl(ctx, client.lang)), client.id);
  return updated;
}

export async function setNextAction(ctx: Ctx, projectId: string, input: Record<string, unknown>) {
  const project = await adminProject(ctx, projectId);
  const waiting: WaitingOn = input.waiting_on === "client" ? "client" : input.waiting_on === "studio" ? "studio" : null;
  const updated = await ctx.db.update("projects", projectId, {
    next_action_fr: text(input.next_action_fr, "next_action_fr", { max: 300, optional: true }),
    next_action_en: text(input.next_action_en, "next_action_en", { max: 300, optional: true }),
    waiting_on: waiting,
  });
  await record(ctx, "project.next_action", { client_id: project.client_id, project_id: projectId, data: { waiting_on: waiting } });
  return updated;
}

export async function shareVersion(ctx: Ctx, projectId: string, input: Record<string, unknown>) {
  const project = await adminProject(ctx, projectId);
  const url = httpsUrl(input.preview_url, "preview_url");
  const note = text(input.note, "note", { max: 2000, optional: true });
  const existing = await ctx.db.list("versions", { project_id: projectId });
  if (existing.some((v) => v.status === "pending")) throw new InputError("version_pending");
  const n = existing.reduce((m, v) => Math.max(m, v.number), 0) + 1;
  const version = await ctx.db.insert("versions", {
    project_id: projectId,
    client_id: project.client_id,
    number: n,
    preview_url: url,
    note,
    status: "pending",
    client_comment: null,
    shared_at: iso(ctx),
    responded_at: null,
  });
  await ctx.db.update("projects", projectId, {
    waiting_on: "client",
    next_action_fr: `Vos commentaires sur la version ${n}.`,
    next_action_en: `Your feedback on version ${n}.`,
  });
  await record(ctx, "version.shared", { client_id: project.client_id, project_id: projectId, data: { number: n }, visible: true });
  const client = await getClient(ctx, project.client_id);
  await deliver(ctx, await clientRecipients(ctx, client.id), emails.versionShared(client.lang, n, note, clientUrl(ctx, client.lang, "#version")), client.id);
  return version;
}

async function nextInvoiceNumber(ctx: Ctx) {
  const year = today(ctx).slice(0, 4);
  const all = await ctx.db.list("invoices", {});
  const max = all
    .map((i) => i.number.match(new RegExp(`^F-${year}-(\\d+)$`)))
    .reduce((m, x) => (x ? Math.max(m, Number(x[1])) : m), 0);
  return `F-${year}-${String(max + 1).padStart(3, "0")}`;
}

export async function createInvoice(ctx: Ctx, clientId: string, input: Record<string, unknown>) {
  requireAdmin(ctx);
  await getClient(ctx, clientId);
  const amount = Math.round(Number(String(input.amount ?? "").replace(",", ".")) * 100);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) throw new InputError("amount");
  const tax = Number(String(input.tax_rate ?? "0").replace(",", "."));
  if (!Number.isFinite(tax) || tax < 0 || tax > 30) throw new InputError("tax_rate");
  const due = typeof input.due_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.due_date) ? input.due_date : null;
  const projectId = typeof input.project_id === "string" && input.project_id ? input.project_id : null;
  if (projectId) {
    const p = await ctx.db.get("projects", projectId);
    if (!p || p.client_id !== clientId) throw new InputError("project_id");
  }
  return ctx.db.insert("invoices", {
    client_id: clientId,
    project_id: projectId,
    number: await nextInvoiceNumber(ctx),
    label: text(input.label, "label", { max: 200 }) as string,
    amount_cents: amount,
    tax_rate: tax,
    status: "draft",
    due_date: due,
    sent_at: null,
    paid_at: null,
    stripe_session_id: null,
    created_at: iso(ctx),
  });
}

async function adminInvoice(ctx: Ctx, invoiceId: string) {
  requireAdmin(ctx);
  const i = await ctx.db.get("invoices", invoiceId);
  if (!i) throw new NotFoundError();
  return i;
}

export async function sendInvoice(ctx: Ctx, invoiceId: string) {
  const inv = await adminInvoice(ctx, invoiceId);
  if (inv.status !== "draft") throw new InputError("invoice_not_draft");
  const updated = await ctx.db.update("invoices", invoiceId, { status: "sent", sent_at: iso(ctx) });
  await record(ctx, "invoice.sent", { client_id: inv.client_id, data: { number: inv.number }, visible: true });
  const client = await getClient(ctx, inv.client_id);
  await deliver(
    ctx,
    await clientRecipients(ctx, client.id),
    emails.invoiceSent(client.lang, inv.number, inv.label, invoiceTotal(inv), inv.due_date ? fmtDate(inv.due_date, client.lang) : null, clientUrl(ctx, client.lang, "#invoices")),
    client.id,
  );
  return updated;
}

export async function voidInvoice(ctx: Ctx, invoiceId: string) {
  const inv = await adminInvoice(ctx, invoiceId);
  if (inv.status === "paid") throw new InputError("invoice_paid");
  const updated = await ctx.db.update("invoices", invoiceId, { status: "void" });
  await record(ctx, "invoice.void", { client_id: inv.client_id, data: { number: inv.number }, visible: inv.status !== "draft" });
  return updated;
}

/** Marks an invoice paid. Called by an admin (cash, Interac) or by the Stripe webhook (no viewer). Idempotent. */
export async function markInvoicePaid(ctx: Ctx, invoiceId: string, via: "admin" | "stripe" | "demo", stripeSessionId: string | null = null) {
  if (via === "admin") requireAdmin(ctx);
  const inv = await ctx.db.get("invoices", invoiceId);
  if (!inv) throw new NotFoundError();
  if (inv.status === "paid") return inv;
  if (inv.status === "void" || inv.status === "draft") throw new InputError("invoice_not_payable");
  const updated = await ctx.db.update("invoices", invoiceId, { status: "paid", paid_at: iso(ctx), ...(stripeSessionId ? { stripe_session_id: stripeSessionId } : {}) });
  await record(ctx, "invoice.paid", { client_id: inv.client_id, data: { number: inv.number, via }, visible: true });
  const client = await getClient(ctx, inv.client_id);
  const total = invoiceTotal(inv);
  await deliver(ctx, await clientRecipients(ctx, client.id), emails.invoicePaidClient(client.lang, inv.number, total, clientUrl(ctx, client.lang, "#invoices")), client.id);
  await deliver(ctx, await adminRecipients(ctx), emails.admin(`Facture ${inv.number} payée par ${client.name}`, [`${(total / 100).toFixed(2)} $ (${via}).`], adminUrl(ctx, client.id)));
  return updated;
}

export async function attachCheckout(ctx: Ctx, invoiceId: string, sessionId: string) {
  return ctx.db.update("invoices", invoiceId, { stripe_session_id: sessionId });
}

// ---------- care subscription ----------

export async function careFor(ctx: Ctx, clientId: string): Promise<Subscription | null> {
  return (await ctx.db.list("subscriptions", { client_id: clientId }))[0] ?? null;
}

/** Subscription state from Stripe webhooks (or the demo). No viewer: system task. */
export async function setCareStatus(
  ctx: Ctx,
  clientId: string,
  status: SubscriptionStatus,
  refs: { customer?: string | null; subscription?: string | null } = {},
) {
  const client = await getClient(ctx, clientId);
  const existing = await careFor(ctx, clientId);
  if (existing?.status === status) return existing;
  const patch = {
    status,
    updated_at: iso(ctx),
    ...(refs.customer ? { stripe_customer_id: refs.customer } : {}),
    ...(refs.subscription ? { stripe_subscription_id: refs.subscription } : {}),
  };
  const sub = existing
    ? await ctx.db.update("subscriptions", existing.id, patch)
    : await ctx.db.insert("subscriptions", { client_id: clientId, price_cents: CARE_PRICE_CENTS, stripe_customer_id: null, stripe_subscription_id: null, ...patch });
  if (status === "active" && client.status !== "care") await ctx.db.update("clients", clientId, { status: "care" });
  if (status === "canceled" && client.status === "care") await ctx.db.update("clients", clientId, { status: "active" });
  const type: EventType = status === "active" ? "care.active" : status === "past_due" ? "care.past_due" : "care.canceled";
  if (status !== "none") {
    await record(ctx, type, { client_id: clientId, visible: true });
    const what = status === "active" ? "activé" : status === "past_due" ? "en échec de paiement" : "arrêté";
    await deliver(ctx, await adminRecipients(ctx), emails.admin(`Entretien ${what} : ${client.name}`, [], adminUrl(ctx, clientId)));
  }
  return sub;
}

export async function findClientBySubscription(ctx: Ctx, stripeSubscriptionId: string) {
  return (await ctx.db.list("subscriptions", { stripe_subscription_id: stripeSubscriptionId }))[0]?.client_id ?? null;
}

// ---------- reminders (daily cron, system task) ----------

const lastEvent = (events: PortalEvent[], type: EventType, key: string, id: string) =>
  events.filter((e) => e.type === type && e.data[key] === id).reduce((m, e) => Math.max(m, Date.parse(e.created_at)), 0);

export async function runReminders(ctx: Ctx) {
  const t = now(ctx).getTime();
  const [pending, unpaid, past] = await Promise.all([
    ctx.db.list("versions", { status: "pending" }),
    ctx.db.list("invoices", { status: ["sent", "overdue"] }),
    ctx.db.list("events", { type: ["reminder.feedback", "reminder.invoice"] }),
  ]);
  const done = { feedback: 0, invoices: 0, overdue: 0 };

  for (const v of pending) {
    const waited = t - Date.parse(v.shared_at);
    const last = lastEvent(past, "reminder.feedback", "version_id", v.id);
    if (waited < FEEDBACK_REMINDER_DAYS * DAY || (last && t - last < FEEDBACK_REMINDER_DAYS * DAY)) continue;
    const client = await getClient(ctx, v.client_id);
    await deliver(ctx, await clientRecipients(ctx, client.id), emails.reminderFeedback(client.lang, v.number, Math.floor(waited / DAY), clientUrl(ctx, client.lang, "#version")), client.id);
    await record(ctx, "reminder.feedback", { client_id: client.id, project_id: v.project_id, data: { version_id: v.id } });
    done.feedback++;
  }

  const day = today(ctx);
  for (const inv of unpaid as Invoice[]) {
    if (!inv.due_date || inv.due_date >= day) continue;
    if (inv.status === "sent") {
      await ctx.db.update("invoices", inv.id, { status: "overdue" });
      await record(ctx, "invoice.overdue", { client_id: inv.client_id, data: { number: inv.number } });
      done.overdue++;
    }
    const last = lastEvent(past, "reminder.invoice", "invoice_id", inv.id);
    if (last && t - last < INVOICE_REMINDER_DAYS * DAY) continue;
    const client = await getClient(ctx, inv.client_id);
    await deliver(ctx, await clientRecipients(ctx, client.id), emails.reminderInvoice(client.lang, inv.number, invoiceTotal(inv), clientUrl(ctx, client.lang, "#invoices")), client.id);
    await record(ctx, "reminder.invoice", { client_id: client.id, data: { invoice_id: inv.id } });
    done.invoices++;
  }
  return done;
}

// ---------- sign-in bookkeeping ----------

/** Admin addresses become admin users on first sign-in. Nobody else can. */
export async function ensureAdminUser(ctx: Ctx, authId: string, mail: string) {
  const addr = mail.toLowerCase();
  if (!ctx.adminEmails.includes(addr)) return null;
  const existing = await ctx.db.get("users", authId);
  if (existing) return existing;
  return ctx.db.insert("users", { id: authId, email: addr, name: addr.split("@")[0].replace(/^./, (c) => c.toUpperCase()), role: "admin", client_id: null, created_at: iso(ctx), last_login_at: null });
}

export async function touchLogin(ctx: Ctx, userId: string) {
  return ctx.db.update("users", userId, { last_login_at: iso(ctx) });
}
