-- Client area and admin area: tables and row-level security.
-- Writes go through the server (service role) after the business rules check access.
-- Reads by a signed-in client go through these policies, so a client can only ever
-- see rows of their own client_id, never drafts, never the studio's internal thread.

create extension if not exists pgcrypto;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  company text,
  email text not null,
  phone text,
  lang text not null default 'fr' check (lang in ('fr', 'en')),
  status text not null default 'prospect' check (status in ('prospect', 'active', 'care', 'archived')),
  source_message text,
  created_at timestamptz not null default now()
);
create index clients_email_idx on public.clients (lower(email));

-- The studio's internal thread about each client (Rayann and Steven only)
create table public.team_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index team_notes_client_idx on public.team_notes (client_id, created_at);

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('client', 'admin')),
  client_id uuid references public.clients (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  seen_at timestamptz,
  check ((role = 'client') = (client_id is not null))
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  package text not null check (package in ('essential', 'growth', 'signature')),
  stage text not null default 'call' check (stage in ('call', 'brief', 'build', 'launch', 'live')),
  stage_dates jsonb not null default '{}'::jsonb,
  revisions_included int not null default 3 check (revisions_included >= 0),
  next_action_fr text,
  next_action_en text,
  waiting_on text check (waiting_on in ('client', 'studio')),
  created_at timestamptz not null default now()
);
create index projects_client_idx on public.projects (client_id);

create table public.versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  number int not null check (number > 0),
  preview_url text not null check (preview_url like 'https://%'),
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'changes_requested')),
  client_comment text,
  shared_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (project_id, number)
);
create index versions_client_idx on public.versions (client_id);
-- One version waiting for feedback per project at a time
create unique index versions_one_pending on public.versions (project_id) where status = 'pending';

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  number text not null unique,
  label text not null,
  amount_cents int not null check (amount_cents > 0),
  tax_rate numeric(5, 2) not null default 0 check (tax_rate between 0 and 30),
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'void')),
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  stripe_session_id text,
  created_at timestamptz not null default now()
);
create index invoices_client_idx on public.invoices (client_id);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients (id) on delete cascade,
  status text not null default 'none' check (status in ('none', 'active', 'past_due', 'canceled')),
  price_cents int not null default 3900,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  author_id uuid references public.users (id) on delete set null,
  author_role text not null check (author_role in ('client', 'admin')),
  author_name text not null,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index messages_client_idx on public.messages (client_id, created_at);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  type text not null,
  data jsonb not null default '{}'::jsonb,
  visible_to_client boolean not null default false,
  actor_name text,
  created_at timestamptz not null default now()
);
create index events_client_idx on public.events (client_id, created_at desc);
create index events_type_idx on public.events (type);

-- Dashboard tasks marked done, snoozed or claimed by an admin. id is the task key
-- ("inv:<invoice>", "msg:<message>"...), so a new message makes a new task.
create table public.todo_states (
  id text primary key,
  done_at timestamptz,
  snoozed_until timestamptz,
  claimed_by_id uuid references auth.users (id) on delete set null,
  claimed_by_name text,
  updated_at timestamptz not null default now()
);

-- Who is asking. security definer so the policies below can read public.users
-- without recursing into its own policy.
create function public.current_client_id() returns uuid
language sql stable security definer set search_path = public as $$
  select client_id from public.users where id = auth.uid()
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin')
$$;

revoke all on function public.current_client_id() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.current_client_id() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.clients enable row level security;
alter table public.team_notes enable row level security;
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.versions enable row level security;
alter table public.invoices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.messages enable row level security;
alter table public.events enable row level security;
alter table public.todo_states enable row level security;

-- Read policies only. No insert/update/delete policy exists for signed-in users:
-- every change goes through the server with the service role.
create policy clients_read on public.clients for select to authenticated
  using (public.is_admin() or id = public.current_client_id());

create policy team_notes_read on public.team_notes for select to authenticated
  using (public.is_admin());

create policy users_read on public.users for select to authenticated
  using (public.is_admin() or id = auth.uid() or client_id = public.current_client_id());

create policy projects_read on public.projects for select to authenticated
  using (public.is_admin() or client_id = public.current_client_id());

create policy versions_read on public.versions for select to authenticated
  using (public.is_admin() or client_id = public.current_client_id());

create policy invoices_read on public.invoices for select to authenticated
  using (public.is_admin() or (client_id = public.current_client_id() and status in ('sent', 'paid', 'overdue')));

create policy subscriptions_read on public.subscriptions for select to authenticated
  using (public.is_admin() or client_id = public.current_client_id());

create policy messages_read on public.messages for select to authenticated
  using (public.is_admin() or client_id = public.current_client_id());

create policy events_read on public.events for select to authenticated
  using (public.is_admin() or (client_id = public.current_client_id() and visible_to_client));

create policy todo_states_read on public.todo_states for select to authenticated
  using (public.is_admin());

-- The anonymous role reads nothing.
revoke all on all tables in schema public from anon;
