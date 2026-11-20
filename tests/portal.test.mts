// Business rules of the client and admin areas, on the in-memory store.
// Run with: npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { memoryDb, ForbiddenError, InputError, NotFoundError } from "../src/lib/portal/db.ts";
import * as svc from "../src/lib/portal/service.ts";
import type { Ctx } from "../src/lib/portal/service.ts";
import type { Viewer } from "../src/lib/portal/types.ts";

type Sent = { to: string[]; subject: string };

function setup(start = "2026-11-20T15:00:00Z") {
  const db = memoryDb();
  const sent: Sent[] = [];
  let clock = new Date(start);
  const base: Omit<Ctx, "viewer"> = {
    db,
    mailer: { send: async (m) => void sent.push({ to: m.to, subject: m.subject }) },
    auth: { ensureAccount: async () => crypto.randomUUID(), loginLink: async (e, next) => `https://x.test/auth?e=${e}&next=${next}` },
    baseUrl: "https://x.test",
    adminEmails: ["rayann@studio.test"],
    now: () => clock,
  };
  const admin: Viewer = { userId: "admin-1", email: "rayann@studio.test", name: "Rayann", role: "admin", clientId: null };
  const as = (viewer: Viewer | null): Ctx => ({ ...base, viewer });
  const advance = (days: number) => (clock = new Date(clock.getTime() + days * 86_400_000));
  return { db, sent, as, admin, advance };
}

async function clientWithProject(t: ReturnType<typeof setup>) {
  const A = t.as(t.admin);
  const client = await svc.createClient(A, { name: "Camille Roy", email: "camille@client.test", lang: "fr" });
  const user = await svc.inviteUser(A, client.id, { email: "camille@client.test", name: "Camille Roy" });
  const project = await svc.createProject(A, client.id, { package: "growth" });
  const viewer: Viewer = { userId: user.id, email: user.email, name: user.name, role: "client", clientId: client.id };
  return { A, client, user, project, C: t.as(viewer) };
}

test("contact form creates a prospect and tells the admins", async () => {
  const t = setup();
  const lead = await svc.createLead(t.as(null), { name: "Marc", email: "Marc@Example.com ", message: "Un site pour mon resto", lang: "fr" });
  assert.equal(lead.status, "prospect");
  assert.equal(lead.email, "marc@example.com");
  assert.equal(t.sent.length, 1);
  assert.deepEqual(t.sent[0].to, ["rayann@studio.test"]);
  // Same person writing again does not create a duplicate
  await svc.createLead(t.as(null), { name: "Marc", email: "marc@example.com", message: "Re-bonjour" });
  assert.equal((await t.db.list("clients", {})).length, 1);
});

test("contact form rejects bad input", async () => {
  const t = setup();
  await assert.rejects(svc.createLead(t.as(null), { name: "", email: "a@b.co", message: "x" }), InputError);
  await assert.rejects(svc.createLead(t.as(null), { name: "A", email: "nope", message: "x" }), InputError);
});

test("only admins reach admin functions", async () => {
  const t = setup();
  const { C, client } = await clientWithProject(t);
  await assert.rejects(svc.adminOverview(C), ForbiddenError);
  await assert.rejects(svc.adminClient(t.as(null), client.id), ForbiddenError);
  await assert.rejects(svc.createInvoice(C, client.id, { label: "x", amount: "10" }), ForbiddenError);
});

test("a client never sees another client's data", async () => {
  const t = setup();
  const one = await clientWithProject(t);
  const A = t.as(t.admin);
  const other = await svc.createClient(A, { name: "Other", email: "other@client.test" });
  const otherProject = await svc.createProject(A, other.id, {});
  const v = await svc.shareVersion(A, otherProject.id, { preview_url: "https://preview.test/other" });
  const inv = await svc.createInvoice(A, other.id, { label: "Dépôt", amount: "100" });
  await svc.sendInvoice(A, inv.id);

  const dash = await svc.clientDashboard(one.C);
  assert.equal(dash.client.id, one.client.id);
  assert.equal(dash.projects.length, 1);
  assert.equal(dash.invoices.length, 0);
  await assert.rejects(svc.respondToVersion(one.C, v.id, "approved", ""), NotFoundError);
  await assert.rejects(svc.payableInvoice(one.C, inv.id), NotFoundError);
});

test("internal notes never reach the client dashboard", async () => {
  const t = setup();
  const { A, C, client } = await clientWithProject(t);
  await svc.saveNotes(A, client.id, "Paie toujours en retard");
  const dash = await svc.clientDashboard(C);
  assert.ok(!JSON.stringify(dash).includes("Paie toujours en retard"));
  assert.equal((await svc.adminClient(A, client.id)).notes, "Paie toujours en retard");
});

test("version flow: share, request changes, count revisions, approve", async () => {
  const t = setup();
  const { A, C, project } = await clientWithProject(t);
  const v1 = await svc.shareVersion(A, project.id, { preview_url: "https://preview.test/v1", note: "Première version" });
  assert.equal(v1.number, 1);
  assert.equal((await t.db.get("projects", project.id))?.waiting_on, "client");
  await assert.rejects(svc.shareVersion(A, project.id, { preview_url: "https://preview.test/v2" }), InputError, "one pending version at a time");

  await assert.rejects(svc.respondToVersion(C, v1.id, "changes_requested", "  "), InputError, "changes need a comment");
  await svc.respondToVersion(C, v1.id, "changes_requested", "Plus de vert");
  await assert.rejects(svc.respondToVersion(C, v1.id, "approved", ""), InputError, "answered once");
  assert.equal((await t.db.get("projects", project.id))?.waiting_on, "studio");

  const v2 = await svc.shareVersion(A, project.id, { preview_url: "https://preview.test/v2" });
  assert.equal(v2.number, 2);
  await svc.respondToVersion(C, v2.id, "approved", "");
  const dash = await svc.clientDashboard(C);
  assert.equal(dash.projects[0].revisionsUsed, 1);
  assert.equal(dash.projects[0].revisions_included, 3);
});

test("going past the included revisions warns the admins", async () => {
  const t = setup();
  const { A, C, client } = await clientWithProject(t);
  const p = await svc.createProject(A, client.id, { package: "essential" }); // 2 revisions
  for (let i = 0; i < 3; i++) {
    const v = await svc.shareVersion(A, p.id, { preview_url: `https://preview.test/${i}` });
    await svc.respondToVersion(C, v.id, "changes_requested", "encore");
  }
  const last = (await t.db.list("events", { type: "version.changes_requested" })).at(-1);
  assert.equal(last?.data.over_limit, true);
});

test("preview links must be https", async () => {
  const t = setup();
  const { A, project } = await clientWithProject(t);
  await assert.rejects(svc.shareVersion(A, project.id, { preview_url: "javascript:alert(1)" }), InputError);
  await assert.rejects(svc.shareVersion(A, project.id, { preview_url: "http://insecure.test" }), InputError);
});

test("invoices: numbering, drafts hidden, paid once", async () => {
  const t = setup();
  const { A, C, client } = await clientWithProject(t);
  const a = await svc.createInvoice(A, client.id, { label: "Dépôt", amount: "649,50", tax_rate: "13" });
  const b = await svc.createInvoice(A, client.id, { label: "Solde", amount: "649.50" });
  assert.equal(a.number, "F-2026-001");
  assert.equal(b.number, "F-2026-002");
  assert.equal(a.amount_cents, 64950);
  assert.equal((await svc.clientDashboard(C)).invoices.length, 0, "drafts are not shown");
  await assert.rejects(svc.payableInvoice(C, a.id), InputError);

  await svc.sendInvoice(A, a.id);
  const { invoice } = await svc.payableInvoice(C, a.id);
  assert.equal(invoice.status, "sent");
  const before = t.sent.length;
  await svc.markInvoicePaid(t.as(null), a.id, "stripe", "cs_test_1");
  await svc.markInvoicePaid(t.as(null), a.id, "stripe", "cs_test_1");
  assert.equal(t.sent.length - before, 2, "one receipt and one admin email, not four");
  assert.equal((await t.db.get("invoices", a.id))?.status, "paid");
  await assert.rejects(svc.voidInvoice(A, a.id), InputError);
});

test("reminders: feedback after 5 days, overdue invoices, no repeats", async () => {
  const t = setup();
  const { A, project, client } = await clientWithProject(t);
  await svc.shareVersion(A, project.id, { preview_url: "https://preview.test/v1" });
  const inv = await svc.createInvoice(A, client.id, { label: "Dépôt", amount: "100", due_date: "2026-11-25" });
  await svc.sendInvoice(A, inv.id);

  assert.deepEqual(await svc.runReminders(t.as(null)), { feedback: 0, invoices: 0, overdue: 0 });
  t.advance(6);
  assert.deepEqual(await svc.runReminders(t.as(null)), { feedback: 1, invoices: 1, overdue: 1 });
  assert.equal((await t.db.get("invoices", inv.id))?.status, "overdue");
  t.advance(1);
  assert.deepEqual(await svc.runReminders(t.as(null)), { feedback: 0, invoices: 0, overdue: 0 });
  t.advance(5);
  assert.deepEqual(await svc.runReminders(t.as(null)), { feedback: 1, invoices: 0, overdue: 0 });
  t.advance(2);
  assert.deepEqual(await svc.runReminders(t.as(null)), { feedback: 0, invoices: 1, overdue: 0 });
});

test("messages go to the other side", async () => {
  const t = setup();
  const { A, C, client } = await clientWithProject(t);
  t.sent.length = 0;
  await svc.postMessage(C, { body: "Bonjour !" });
  assert.deepEqual(t.sent[0].to, ["rayann@studio.test"]);
  await svc.postMessage(A, { clientId: client.id, body: "Salut Camille" });
  assert.deepEqual(t.sent[1].to, ["camille@client.test"]);
  assert.equal((await svc.clientDashboard(C)).messages.length, 2);
});

test("care subscription moves the client to care and back", async () => {
  const t = setup();
  const { client } = await clientWithProject(t);
  await svc.setCareStatus(t.as(null), client.id, "active", { customer: "cus_1", subscription: "sub_1" });
  assert.equal((await t.db.get("clients", client.id))?.status, "care");
  assert.equal(await svc.findClientBySubscription(t.as(null), "sub_1"), client.id);
  await svc.setCareStatus(t.as(null), client.id, "canceled");
  assert.equal((await t.db.get("clients", client.id))?.status, "active");
});

test("a failing mailer never breaks the action", async () => {
  const t = setup();
  const { A, project } = await clientWithProject(t);
  const ctx = { ...A, mailer: { send: async () => { throw new Error("smtp down"); } } };
  const v = await svc.shareVersion(ctx, project.id, { preview_url: "https://preview.test/v1" });
  assert.equal(v.status, "pending");
  assert.equal((await t.db.list("events", { type: "email.failed" })).length, 1);
});

test("only listed addresses become admins", async () => {
  const t = setup();
  assert.equal(await svc.ensureAdminUser(t.as(null), "id-1", "intrus@evil.test"), null);
  const u = await svc.ensureAdminUser(t.as(null), "id-2", "Rayann@Studio.test");
  assert.equal(u?.role, "admin");
});

test("stripe events: invoice paid, care active, past due, canceled", async () => {
  const { handleStripeEvent } = await import("../src/lib/portal/payments.ts");
  const t = setup();
  const { A, client } = await clientWithProject(t);
  const inv = await svc.createInvoice(A, client.id, { label: "Dépôt", amount: "100" });
  await svc.sendInvoice(A, inv.id);
  const S = t.as(null);

  const unpaid = { type: "checkout.session.completed", data: { object: { id: "cs_1", payment_status: "unpaid", metadata: { kind: "invoice", invoice_id: inv.id } } } };
  await handleStripeEvent(S, unpaid);
  assert.equal((await t.db.get("invoices", inv.id))?.status, "sent", "unsettled payment does not mark paid");

  await handleStripeEvent(S, { type: "checkout.session.completed", data: { object: { id: "cs_1", payment_status: "paid", metadata: { kind: "invoice", invoice_id: inv.id } } } });
  assert.equal((await t.db.get("invoices", inv.id))?.status, "paid");

  await handleStripeEvent(S, { type: "checkout.session.completed", data: { object: { id: "cs_2", customer: "cus_9", subscription: "sub_9", metadata: { kind: "care", client_id: client.id } } } });
  assert.equal((await svc.careFor(S, client.id))?.status, "active");

  await handleStripeEvent(S, { type: "invoice.payment_failed", data: { object: { subscription: "sub_9" } } });
  assert.equal((await svc.careFor(S, client.id))?.status, "past_due");

  await handleStripeEvent(S, { type: "customer.subscription.deleted", data: { object: { id: "sub_9", status: "canceled", metadata: {} } } });
  assert.equal((await svc.careFor(S, client.id))?.status, "canceled");

  assert.match(await handleStripeEvent(S, { type: "charge.refunded", data: { object: {} } }), /ignored/);
});

test("demo tokens: valid, tampered, expired", async () => {
  const { signToken, readToken } = await import("../src/lib/portal/demo.ts");
  const tok = signToken("s3cret", { uid: "u1" }, 60_000);
  assert.equal(readToken("s3cret", tok)?.uid, "u1");
  assert.equal(readToken("other", tok), null);
  assert.equal(readToken("s3cret", tok.slice(0, -2) + "xx"), null);
  assert.equal(readToken("s3cret", signToken("s3cret", { uid: "u1" }, -1)), null);
});
