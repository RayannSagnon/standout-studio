// Shared data model for the public site, the client area and the admin area.
// Mirrors supabase/migrations/*.sql. Amounts are integer cents (CAD).

export type Lang = "fr" | "en";
export type Role = "client" | "admin";
export type ClientStatus = "prospect" | "active" | "care" | "archived";
export type Stage = "call" | "brief" | "build" | "launch" | "live";
export type PackageId = "essential" | "growth" | "signature";
export type WaitingOn = "client" | "studio" | null;
export type VersionStatus = "pending" | "approved" | "changes_requested";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";
export type SubscriptionStatus = "none" | "active" | "past_due" | "canceled";

export const STAGES: Stage[] = ["call", "brief", "build", "launch", "live"];
export const PACKAGES: PackageId[] = ["essential", "growth", "signature"];
export const REVISIONS_BY_PACKAGE: Record<PackageId, number> = { essential: 2, growth: 3, signature: 5 };
export const CARE_PRICE_CENTS = 3900;

export type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  lang: Lang;
  status: ClientStatus;
  source_message: string | null;
  created_at: string;
};

/** The studio's internal thread about a client. Admin-only table: a client can never read it. */
export type TeamNote = { id: string; client_id: string; author_id: string | null; author_name: string; body: string; created_at: string };

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  client_id: string | null;
  created_at: string;
  last_login_at: string | null;
  /** Admins: last time they opened the dashboard. What happened after it shows as new. */
  seen_at?: string | null;
};

export type Project = {
  id: string;
  client_id: string;
  name: string;
  package: PackageId;
  stage: Stage;
  stage_dates: Partial<Record<Stage, string>>;
  revisions_included: number;
  next_action_fr: string | null;
  next_action_en: string | null;
  waiting_on: WaitingOn;
  created_at: string;
};

export type Version = {
  id: string;
  project_id: string;
  client_id: string;
  number: number;
  preview_url: string;
  note: string | null;
  status: VersionStatus;
  client_comment: string | null;
  shared_at: string;
  responded_at: string | null;
};

export type Invoice = {
  id: string;
  client_id: string;
  project_id: string | null;
  number: string;
  label: string;
  amount_cents: number;
  tax_rate: number;
  status: InvoiceStatus;
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  stripe_session_id: string | null;
  created_at: string;
};

export type Subscription = {
  id: string;
  client_id: string;
  status: SubscriptionStatus;
  price_cents: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  updated_at: string;
};

export type Message = {
  id: string;
  client_id: string;
  author_id: string | null;
  author_role: Role;
  author_name: string;
  body: string;
  created_at: string;
};

export type EventType =
  | "lead.created"
  | "client.created"
  | "client.invited"
  | "project.created"
  | "project.stage"
  | "project.next_action"
  | "version.shared"
  | "version.approved"
  | "version.changes_requested"
  | "invoice.sent"
  | "invoice.paid"
  | "invoice.void"
  | "invoice.overdue"
  | "care.active"
  | "care.past_due"
  | "care.canceled"
  | "message.posted"
  | "reminder.feedback"
  | "reminder.invoice"
  | "team.note"
  | "email.failed";

export type PortalEvent = {
  id: string;
  client_id: string | null;
  project_id: string | null;
  type: EventType;
  data: Record<string, unknown>;
  visible_to_client: boolean;
  /** The admin who did it (null for clients, webhooks and the daily cron). */
  actor_name: string | null;
  created_at: string;
};

export type OutboxEmail = {
  id: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  created_at: string;
};

/** Shared state of a dashboard task (id = the task key). */
export type TodoState = {
  id: string;
  done_at: string | null;
  snoozed_until: string | null;
  claimed_by_id: string | null;
  claimed_by_name: string | null;
  updated_at: string;
};

export type Tables = {
  clients: Client;
  team_notes: TeamNote;
  todo_states: TodoState;
  users: User;
  projects: Project;
  versions: Version;
  invoices: Invoice;
  subscriptions: Subscription;
  messages: Message;
  events: PortalEvent;
};
export type TableName = keyof Tables;

/** Who is making the request. Null means a system task (webhook, cron, contact form). */
export type Viewer = {
  userId: string;
  email: string;
  name: string;
  role: Role;
  clientId: string | null;
};

export const invoiceTotal = (i: Pick<Invoice, "amount_cents" | "tax_rate">) =>
  Math.round(i.amount_cents * (1 + i.tax_rate / 100));
