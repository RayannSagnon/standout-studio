"use server";

// Admin form actions. Each one re-checks that the person is an admin.

import { redirect } from "next/navigation";
import { ForbiddenError, InputError, NotFoundError } from "@/lib/portal/db";
import { resetDemo } from "@/lib/portal/demo";
import { portal, systemCtx } from "@/lib/portal/server";
import * as svc from "@/lib/portal/service";

const field = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v : undefined;
};
const all = (f: FormData) => Object.fromEntries([...f.entries()].filter(([, v]) => typeof v === "string")) as Record<string, string>;

async function asAdmin<T>(back: string, run: (ctx: svc.Ctx) => Promise<T>): Promise<T> {
  const { ctx } = await portal();
  if (!ctx.viewer || ctx.viewer.role !== "admin") redirect("/fr/client/login");
  try {
    return await run(ctx);
  } catch (err) {
    if (err instanceof ForbiddenError) redirect("/fr/client/login");
    const code = err instanceof InputError ? err.field : err instanceof NotFoundError ? "not_found" : "generic";
    if (!(err instanceof InputError)) console.error("[admin action]", err);
    const [path, hash = ""] = back.split("#");
    redirect(`${path}?error=${code}${hash ? `#${hash}` : ""}`);
  }
}

const clientPage = (id: string, hash = "") => `/admin/clients/${id}${hash}`;
/** Forms on the dashboard send back=/admin so the person stays there. */
const backOr = (f: FormData, fallback: string) => (field(f, "back") === "/admin" ? "/admin#a-faire" : fallback);
const done = (path: string, ok: string) => {
  const [p, hash = ""] = path.split("#");
  redirect(`${p}?ok=${ok}${hash ? `#${hash}` : ""}`);
};

export async function createClientAction(f: FormData) {
  const c = await asAdmin("/admin/clients/new", (ctx) => svc.createClient(ctx, all(f)));
  done(clientPage(c.id), "client_created");
}

export async function updateClientAction(f: FormData) {
  const id = field(f, "client_id")!;
  await asAdmin(clientPage(id, "#fiche"), (ctx) => svc.updateClient(ctx, id, all(f)));
  done(clientPage(id, "#fiche"), "saved");
}

export async function teamNoteAction(f: FormData) {
  const id = field(f, "client_id")!;
  await asAdmin(clientPage(id, "#entre-nous"), (ctx) => svc.postTeamNote(ctx, id, field(f, "team_body")));
  done(clientPage(id, "#entre-nous"), "team_note");
}

export async function inviteAction(f: FormData) {
  const id = field(f, "client_id")!;
  await asAdmin(clientPage(id, "#acces"), (ctx) => svc.inviteUser(ctx, id, all(f)));
  done(clientPage(id, "#acces"), "invited");
}

export async function createProjectAction(f: FormData) {
  const id = field(f, "client_id")!;
  await asAdmin(clientPage(id, "#projets"), (ctx) => svc.createProject(ctx, id, all(f)));
  done(clientPage(id, "#projets"), "project_created");
}

export async function setStageAction(f: FormData) {
  const id = field(f, "client_id")!;
  const back = backOr(f, clientPage(id, "#projets"));
  await asAdmin(back, async (ctx) => {
    await svc.setStage(ctx, field(f, "project_id")!, field(f, "stage"));
    // From the dashboard, moving on also closes the task that suggested it
    if (field(f, "key")) await svc.setTodo(ctx, field(f, "key"), "done");
  });
  done(back, "stage");
}

export async function setNextAction(f: FormData) {
  const id = field(f, "client_id")!;
  await asAdmin(clientPage(id, "#projets"), (ctx) => svc.setNextAction(ctx, field(f, "project_id")!, all(f)));
  done(clientPage(id, "#projets"), "saved");
}

export async function shareVersionAction(f: FormData) {
  const id = field(f, "client_id")!;
  const back = backOr(f, clientPage(id, "#projets"));
  await asAdmin(back, (ctx) => svc.shareVersion(ctx, field(f, "project_id")!, all(f)));
  done(back, "version_shared");
}

export async function createInvoiceAction(f: FormData) {
  const id = field(f, "client_id")!;
  await asAdmin(clientPage(id, "#factures"), (ctx) => svc.createInvoice(ctx, id, all(f)));
  done(clientPage(id, "#factures"), "invoice_created");
}

export async function sendInvoiceAction(f: FormData) {
  const id = field(f, "client_id")!;
  await asAdmin(clientPage(id, "#factures"), (ctx) => svc.sendInvoice(ctx, field(f, "invoice_id")!));
  done(clientPage(id, "#factures"), "invoice_sent");
}

export async function markPaidAction(f: FormData) {
  const id = field(f, "client_id")!;
  await asAdmin(clientPage(id, "#factures"), (ctx) => svc.markInvoicePaid(ctx, field(f, "invoice_id")!, "admin"));
  done(clientPage(id, "#factures"), "invoice_paid");
}

export async function voidInvoiceAction(f: FormData) {
  const id = field(f, "client_id")!;
  await asAdmin(clientPage(id, "#factures"), (ctx) => svc.voidInvoice(ctx, field(f, "invoice_id")!));
  done(clientPage(id, "#factures"), "invoice_void");
}

export async function adminMessageAction(f: FormData) {
  const id = field(f, "client_id")!;
  const back = backOr(f, clientPage(id, "#messages"));
  await asAdmin(back, (ctx) => svc.postMessage(ctx, { clientId: id, body: field(f, "body") }));
  done(back, "message");
}

export async function runRemindersAction() {
  const r = await asAdmin("/admin/journal", async () => svc.runReminders(await systemCtx()));
  redirect(`/admin/journal?ok=reminders&n=${r.feedback + r.invoices}#relances`);
}

export async function resetDemoAction() {
  const { mode } = await portal();
  if (mode !== "demo") redirect("/admin");
  await asAdmin("/admin/journal", async () => resetDemo());
  redirect("/admin/journal?ok=demo_reset");
}

// ---------- dashboard ----------

export async function markSeenAction() {
  await asAdmin("/admin", (ctx) => svc.markSeen(ctx));
  redirect("/admin?ok=seen");
}

export async function todoAction(f: FormData) {
  const op = field(f, "op");
  await asAdmin("/admin#a-faire", (ctx) => svc.setTodo(ctx, field(f, "key"), op));
  done("/admin#a-faire", `todo_${op}`);
}

export async function remindAction(f: FormData) {
  await asAdmin("/admin#a-faire", async (ctx) => {
    await svc.remindInvoiceNow(ctx, field(f, "invoice_id")!);
    // Reminded: hide it for 3 days, it comes back if still unpaid
    if (field(f, "key")) await svc.setTodo(ctx, field(f, "key"), "snooze");
  });
  done("/admin#a-faire", "reminded");
}

export async function prospectAction(f: FormData) {
  const id = field(f, "client_id")!;
  const status = field(f, "status");
  await asAdmin("/admin#a-faire", (ctx) => svc.setClientStatus(ctx, id, status));
  if (status === "active") done(clientPage(id, "#acces"), "now_client");
  done("/admin#a-faire", "archived");
}
