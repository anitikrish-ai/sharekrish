-- Cloud Clipboard — initial schema
-- Single-owner app: every row in the owner-facing tables is scoped to
-- auth.uid(), so RLS alone is enough to keep the owner's data private.
-- Guests never get a Supabase session; they're served through server
-- API routes using the service-role key, which bypasses RLS deliberately
-- and enforces guest permissions in application code instead (see
-- src/app/api/guest/*). That keeps RLS simple: "owner or nobody".

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#7dd3fc',
  icon text not null default 'folder',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "owner selects own categories" on categories
  for select using (auth.uid() = user_id);
create policy "owner inserts own categories" on categories
  for insert with check (auth.uid() = user_id);
create policy "owner updates own categories" on categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes own categories" on categories
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- collections (user-defined groupings, separate from categories)
-- ---------------------------------------------------------------------
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table collections enable row level security;

create policy "owner selects own collections" on collections
  for select using (auth.uid() = user_id);
create policy "owner inserts own collections" on collections
  for insert with check (auth.uid() = user_id);
create policy "owner updates own collections" on collections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes own collections" on collections
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- items — the clipboard entries themselves
-- ---------------------------------------------------------------------
create type item_type as enum (
  'text', 'link', 'snippet', 'shortcut', 'image', 'video', 'music'
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type item_type not null default 'text',
  title text not null default '',
  content text not null default '',   -- text body / snippet code / shortcut command
  url text,                           -- link href or media URL
  language text,                      -- snippet syntax hint, e.g. 'ts', 'bash'
  category_id uuid references categories(id) on delete set null,
  collection_id uuid references collections(id) on delete set null,
  is_favorite boolean not null default false,
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_user_id_idx on items(user_id);
create index if not exists items_user_pinned_idx on items(user_id, is_pinned) where is_pinned;
create index if not exists items_user_favorite_idx on items(user_id, is_favorite) where is_favorite;
create index if not exists items_user_archived_idx on items(user_id, is_archived);
create index if not exists items_search_idx on items
  using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,'') || ' ' || coalesce(url,'')));

alter table items enable row level security;

create policy "owner selects own items" on items
  for select using (auth.uid() = user_id);
create policy "owner inserts own items" on items
  for insert with check (auth.uid() = user_id);
create policy "owner updates own items" on items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes own items" on items
  for delete using (auth.uid() = user_id);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_set_updated_at
  before update on items
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- access_codes — owner-issued temporary guest links
-- Never selectable by anon/authenticated roles; only the server
-- (service role) reads/writes this table, enforcing expiry, revocation,
-- category scope and session limits before handing the guest anything.
-- ---------------------------------------------------------------------
create table if not exists access_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,                 -- short human-entered code
  category_ids uuid[],                       -- null = all categories visible
  max_sessions int not null default 1,       -- how many guest devices may redeem it
  sessions_used int not null default 0,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists access_codes_user_id_idx on access_codes(user_id);
create unique index if not exists access_codes_code_idx on access_codes(code);

alter table access_codes enable row level security;
-- Intentionally NO policies: RLS defaults to deny-all for anon/authenticated.
-- Only the service-role key (server-side only, bypasses RLS) touches this table.

-- ---------------------------------------------------------------------
-- guest_sessions — redeemed codes, one row per guest device session
-- ---------------------------------------------------------------------
create table if not exists guest_sessions (
  id uuid primary key default gen_random_uuid(),
  access_code_id uuid not null references access_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  revoked boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists guest_sessions_code_idx on guest_sessions(access_code_id);

alter table guest_sessions enable row level security;
-- Same as access_codes: server (service role) only, no client policies.
