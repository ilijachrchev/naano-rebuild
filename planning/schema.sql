-- ============================================================
-- naano rebuild — Supabase / Postgres schema  (v1, contracts-first)
-- One collaborations spine, two role-scoped views (brand + creator).
-- Marked [CORE] = build now, [STUB] = create table + seed only.
-- Run in Supabase SQL editor. Extend RLS where noted.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type user_role            as enum ('brand', 'creator');
create type brief_source         as enum ('ai', 'link', 'concierge', 'manual');
create type collab_origin        as enum ('brand_invite', 'creator_application');
create type offer_type           as enum ('single_post', 'bundle');
create type collab_status        as enum (
  'requested',        -- offer/application sent, awaiting other side (48h window)
  'negotiating',      -- counter-offer in play
  'accepted',
  'declined',
  'withdrawn',        -- sender withdrew before acceptance
  'expired',          -- response window elapsed
  'brief_pending',    -- accepted, brief being finalised
  'content_submitted',-- creator submitted post link/draft
  'revision_requested',
  'approved',         -- brand approved (only if approval_required)
  'scheduled',
  'published',
  'completed',
  'cancelled'
);
create type wallet_txn_type      as enum ('topup', 'charge', 'refund');
create type fund_hold_status     as enum ('reserved', 'captured', 'released', 'refunded');
create type payout_status        as enum ('pending', 'in_transit', 'available', 'withdrawn');
create type payout_method        as enum ('bank', 'stripe');

-- ---------- identity ----------
-- [CORE] one row per auth user
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  locale      text default 'en',
  created_at  timestamptz default now()
);

-- ---------- BRAND side ----------
-- [CORE] a brand workspace (multi-member, wallet-gated)
create table workspaces (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  website       text,
  logo_url      text,
  owner_id      uuid not null references profiles(id) on delete cascade,
  created_at    timestamptz default now()
);

-- [CORE] membership (owner + admins). Team & access screen.
create table workspace_members (
  workspace_id  uuid references workspaces(id) on delete cascade,
  user_id       uuid references profiles(id)   on delete cascade,
  role          text not null default 'admin', -- 'owner' | 'admin'
  created_at    timestamptz default now(),
  primary key (workspace_id, user_id)
);

-- [CORE] brand intelligence — AUTO-filled from website scan, user reviews
create table brand_profiles (
  workspace_id     uuid primary key references workspaces(id) on delete cascade,
  tagline          text,
  industry         text,
  company_size     text,          -- '1-10' | '11-50' | ...
  value_prop       text,
  description       text,
  product_summary  text,
  features         jsonb default '[]',   -- string[]
  differentiators  jsonb default '[]',   -- string[]
  icps             jsonb default '[]',   -- [{role, company_type, pain, product_fit, tags[]}]
  scanned_at       timestamptz
);

-- ---------- CREATOR side ----------
-- [CORE] creator = the marketplace card
create table creators (
  id                    uuid primary key references profiles(id) on delete cascade,
  display_name          text,
  headline              text,
  country               text,
  linkedin_url          text,
  followers             int  default 0,
  industries            text[] default '{}',        -- max 3 (enforce in app)
  price_per_post_cents  bigint,                       -- net, creator-set (naano-recommended default)
  est_impressions       int,
  audience_snapshot     jsonb default '{}',           -- {job_title:{...%}, seniority:{...%}, sample_n}
  match_default         int,                          -- 0..100 baseline; per-brand match computed at query time
  marketplace_visible   boolean default false,        -- unlocked after listing requirements
  created_at            timestamptz default now(),
  constraint creators_price_non_negative check (price_per_post_cents >= 0),
  constraint creators_followers_non_negative check (followers >= 0),
  constraint creators_est_impressions_non_negative check (est_impressions >= 0),
  constraint creators_match_range check (match_default between 0 and 100)
);

-- [CORE] creator-only compliance and payout details; never exposed by marketplace reads
create table creator_private_profiles (
  creator_id            uuid primary key references creators(id) on delete cascade,
  registration_country  text,
  has_registered_business boolean,
  tax_id                text,                          -- DAC7 / EU TIN
  payout_method         payout_method,
  bank_holder           text,
  bank_iban_last4       text,
  stripe_connected      boolean default false,
  last_scraped_at       timestamptz,                   -- LinkedIn re-sync capped once/week
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- [CORE] bundle offers (e.g. 5 posts / €280)
create table creator_bundles (
  id                uuid primary key default gen_random_uuid(),
  creator_id        uuid references creators(id) on delete cascade,
  num_posts         int not null,
  total_price_cents bigint not null,
  is_primary        boolean default false,
  constraint creator_bundles_num_posts_positive check (num_posts > 0),
  constraint creator_bundles_price_non_negative check (total_price_cents >= 0)
);

-- ---------- campaigns & briefs (brand) ----------
-- [CORE] a campaign; open_to_applications makes it a creator "Opportunity"
create table campaigns (
  id                    uuid primary key default gen_random_uuid(),
  workspace_id          uuid references workspaces(id) on delete cascade,
  name                  text not null,
  objective             text,
  region                text,
  channel               text default 'linkedin',
  open_to_applications  boolean default false,
  post_deadline_days    int default 6,
  status                text default 'draft',   -- draft | live | closed
  created_at            timestamptz default now()
);

-- [CORE] AI-generated / editable brief (the flagship feature output)
create table briefs (
  id             uuid primary key default gen_random_uuid(),
  campaign_id    uuid references campaigns(id) on delete cascade,
  workspace_id   uuid references workspaces(id) on delete cascade,
  title          text,
  source         brief_source default 'ai',
  objectives     text,
  key_messages   jsonb default '[]',   -- string[]
  guidelines     text,
  content        jsonb default '{}',   -- full editable brief blob
  status         text default 'draft', -- draft | ready
  created_at     timestamptz default now()
);

-- ---------- THE SPINE: collaborations ----------
-- [CORE] one row = one brand<->creator deal. Powers BOTH pipelines.
create table collaborations (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null references workspaces(id) on delete restrict,
  creator_id          uuid not null references creators(id)   on delete restrict,
  campaign_id         uuid references campaigns(id) on delete set null,
  brief_id            uuid references briefs(id)    on delete set null,
  origin              collab_origin not null,
  offer_type          offer_type default 'single_post',
  current_offer_id    uuid,                   -- FK added after collaboration_offers exists
  accepted_offer_id   uuid,                   -- immutable accepted terms snapshot
  deliverables        text,                   -- e.g. "1 post + 1 repost"
  post_by             date,                   -- defaults +14d in app
  approval_required   boolean default false,
  status              collab_status not null default 'requested',
  tracking_url        text,                   -- attribution link for this collab
  respond_by          timestamptz,            -- 48h accept/decline window
  responded_at        timestamptz,
  published_at        timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  deleted_at          timestamptz
);
create index on collaborations (workspace_id, status);
create index on collaborations (creator_id, status);

-- [CORE] immutable negotiation history. Fixed-price-per-post only for the 24h build.
-- Discount is derived from list_price_cents and fee_cents; it is never stored separately.
create table collaboration_offers (
  id                   uuid primary key default gen_random_uuid(),
  collaboration_id     uuid not null references collaborations(id) on delete restrict,
  proposer_id          uuid not null references profiles(id) on delete restrict,
  proposer_role        user_role not null,
  terms_snapshot       jsonb not null default '{}',
  list_price_cents     bigint not null,
  fee_cents            bigint not null,       -- accepted fixed fee per sponsored post
  currency             char(3) not null,
  expires_at           timestamptz,
  superseded_offer_id  uuid references collaboration_offers(id) on delete restrict,
  accepted_at          timestamptz,
  created_at           timestamptz not null default now(),
  constraint collaboration_offers_list_price_non_negative check (list_price_cents >= 0),
  constraint collaboration_offers_fee_non_negative check (fee_cents >= 0),
  constraint collaboration_offers_currency_uppercase check (currency = upper(currency)),
  unique (collaboration_id, id)
);
create index on collaboration_offers (collaboration_id, created_at desc);

alter table collaborations
  add constraint collaborations_current_offer_same_collab
  foreign key (id, current_offer_id)
  references collaboration_offers (collaboration_id, id)
  deferrable initially deferred;

alter table collaborations
  add constraint collaborations_accepted_offer_same_collab
  foreign key (id, accepted_offer_id)
  references collaboration_offers (collaboration_id, id)
  deferrable initially deferred;

-- [CORE] explicit deliverable identity supports bundles and per-post tracking.
create table collaboration_deliverables (
  id               uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references collaborations(id) on delete restrict,
  description      text not null,
  ordinal          int not null default 1,
  created_at       timestamptz not null default now(),
  constraint collaboration_deliverables_ordinal_positive check (ordinal > 0),
  unique (collaboration_id, ordinal),
  unique (collaboration_id, id)
);

-- [CORE] timeline / audit for a collaboration
create table collaboration_events (
  id               uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references collaborations(id) on delete restrict,
  actor_id         uuid references profiles(id),
  type             text not null,   -- offer_made | countered | accepted | declined | submitted | approved | published | ...
  payload          jsonb default '{}',
  created_at       timestamptz default now()
);

-- ---------- attribution (the whole product) ----------
-- [CORE] opaque redirect tokens; one collaboration may have several links.
create table tracking_links (
  id               uuid primary key default gen_random_uuid(),
  token            uuid not null unique default gen_random_uuid(),
  destination_url  text not null,
  collaboration_id uuid not null references collaborations(id) on delete restrict,
  deliverable_id   uuid,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  constraint tracking_links_deliverable_same_collab
    foreign key (collaboration_id, deliverable_id)
    references collaboration_deliverables (collaboration_id, id)
    on delete restrict
);
create index on tracking_links (collaboration_id, active);

-- [CORE] immutable qualified-click observations; ingestion is server-only.
create table click_events (
  id               uuid primary key default gen_random_uuid(),
  tracking_link_id uuid not null references tracking_links(id) on delete restrict,
  ip_hash          text,
  company          text,            -- mocked enrichment for the 24h build
  is_qualified     boolean not null default false,
  context          jsonb not null default '{}',
  occurred_at      timestamptz not null default now()
);
create index on click_events (tracking_link_id, is_qualified);

-- TODO(post-24h): replace free-text company enrichment with accounts and add
-- opportunities, conversions, pipeline value, and explicit attribution records.

-- [CORE] published post + performance (creator public-post import)
create table posts (
  id               uuid primary key default gen_random_uuid(),
  collaboration_id uuid not null references collaborations(id) on delete restrict,
  deliverable_id   uuid,
  linkedin_url     text,
  impressions      int default 0,
  reactions        int default 0,
  comments         int default 0,
  reposts          int default 0,
  published_at     timestamptz,
  constraint posts_impressions_non_negative check (impressions >= 0),
  constraint posts_reactions_non_negative check (reactions >= 0),
  constraint posts_comments_non_negative check (comments >= 0),
  constraint posts_reposts_non_negative check (reposts >= 0),
  constraint posts_deliverable_same_collab
    foreign key (collaboration_id, deliverable_id)
    references collaboration_deliverables (collaboration_id, id)
    on delete restrict
);

-- ---------- money ----------
-- [CORE] immutable, server-written brand wallet ledger.
create table wallet_transactions (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references workspaces(id) on delete restrict,
  type             wallet_txn_type not null,
  amount_cents     bigint not null,
  currency         char(3) not null,
  collaboration_id uuid references collaborations(id) on delete restrict,
  idempotency_key  text not null unique,
  created_at       timestamptz not null default now(),
  constraint wallet_transactions_amount_positive check (amount_cents > 0),
  constraint wallet_transactions_currency_uppercase check (currency = upper(currency))
);

-- [CORE] reservation against the immutable wallet ledger.
create table fund_holds (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references workspaces(id) on delete restrict,
  collaboration_id uuid not null references collaborations(id) on delete restrict,
  offer_id         uuid not null,
  amount_cents     bigint not null,
  currency         char(3) not null,
  status           fund_hold_status not null default 'reserved',
  captured_transaction_id uuid unique references wallet_transactions(id) on delete restrict,
  refunded_transaction_id uuid unique references wallet_transactions(id) on delete restrict,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint fund_holds_amount_positive check (amount_cents > 0),
  constraint fund_holds_currency_uppercase check (currency = upper(currency)),
  constraint fund_holds_offer_same_collab
    foreign key (collaboration_id, offer_id)
    references collaboration_offers (collaboration_id, id)
    on delete restrict
);
create unique index fund_holds_one_reserved_per_collaboration
  on fund_holds (collaboration_id) where status = 'reserved';
create index on fund_holds (workspace_id, status);

-- [CORE] creator payouts / earnings
create table payouts (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid references creators(id) on delete cascade,
  collaboration_id uuid references collaborations(id) on delete restrict,
  amount_cents     bigint not null,
  status           payout_status not null default 'pending',
  method           payout_method,
  created_at       timestamptz default now(),
  paid_at          timestamptz,
  constraint payouts_amount_non_negative check (amount_cents >= 0)
);

-- TODO(post-24h): support hybrid fixed-fee + qualified-click pricing. The current
-- contract is fixed price per post, snapshotted as collaboration_offers.fee_cents.

-- ---------- [STUB] model + seed only (cut from build, keep for realism) ----------
create table conversations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid references workspaces(id) on delete cascade,
  creator_id    uuid references creators(id)   on delete cascade,
  created_at    timestamptz default now()
);
create table messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid references conversations(id) on delete cascade,
  sender_id        uuid references profiles(id),
  body             text,
  created_at       timestamptz default now()
);
create table referrals (            -- affiliate / deal-link loop (25% for 3 months)
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid references creators(id) on delete cascade,
  code          text unique,
  invited_type  text,               -- 'brand' | 'creator'
  status        text default 'pending',
  reward_pct    int default 25,
  reward_months int default 3,
  created_at    timestamptz default now()
);

-- ============================================================
-- Integrity guards
-- ============================================================

-- Append-only records remain immutable even when written with the service role.
create or replace function reject_immutable_mutation() returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception '% is append-only; % is not allowed', tg_table_name, tg_op;
end;
$$;

create trigger wallet_transactions_immutable
before update or delete on wallet_transactions
for each row execute function reject_immutable_mutation();

create trigger click_events_immutable
before update or delete on click_events
for each row execute function reject_immutable_mutation();

-- Offer terms never change. The sole permitted update records one-time acceptance.
create or replace function protect_collaboration_offer() returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'collaboration_offers is append-only; DELETE is not allowed';
  end if;

  if old.accepted_at is not null
     or new.accepted_at is null
     or (to_jsonb(new) - 'accepted_at') is distinct from (to_jsonb(old) - 'accepted_at') then
    raise exception 'offer terms are immutable; only accepted_at may be set once';
  end if;

  return new;
end;
$$;

create trigger collaboration_offers_immutable
before update or delete on collaboration_offers
for each row execute function protect_collaboration_offer();

-- Collaborations are retained for attribution and financial audit history.
create or replace function prevent_collaboration_hard_delete() returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception 'collaborations must be soft-deleted by setting deleted_at';
end;
$$;

create trigger collaborations_soft_delete_only
before delete on collaborations
for each row execute function prevent_collaboration_hard_delete();

-- Available funds are immutable ledger credits minus charges and active reservations.
create or replace function wallet_available_cents(ws uuid, iso_currency char(3)) returns bigint
language sql security definer stable
set search_path = pg_catalog, public
as $$
  select
    coalesce((
      select sum(case t.type
        when 'topup'::public.wallet_txn_type then t.amount_cents
        when 'refund'::public.wallet_txn_type then t.amount_cents
        when 'charge'::public.wallet_txn_type then -t.amount_cents
      end)
      from public.wallet_transactions t
      where t.workspace_id = ws and t.currency = iso_currency
    ), 0)
    - coalesce((
      select sum(h.amount_cents)
      from public.fund_holds h
      where h.workspace_id = ws
        and h.currency = iso_currency
        and h.status = 'reserved'::public.fund_hold_status
    ), 0);
$$;

-- Holds are server-written. Locking the workspace makes concurrent reservations safe.
create or replace function validate_fund_hold() returns trigger
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  offer_row public.collaboration_offers%rowtype;
  collab_workspace uuid;
  available bigint;
  settlement_type public.wallet_txn_type;
  settlement_workspace uuid;
  settlement_collaboration uuid;
  settlement_amount bigint;
  settlement_currency char(3);
begin
  if tg_op = 'INSERT' and new.status <> 'reserved'::public.fund_hold_status then
    raise exception 'new fund holds must start as reserved';
  end if;

  if tg_op = 'UPDATE' and not (
    (old.status = 'reserved'::public.fund_hold_status
      and new.status in ('reserved'::public.fund_hold_status,
                         'captured'::public.fund_hold_status,
                         'released'::public.fund_hold_status))
    or (old.status = 'captured'::public.fund_hold_status
      and new.status in ('captured'::public.fund_hold_status,
                         'refunded'::public.fund_hold_status))
    or (old.status = new.status)
  ) then
    raise exception 'invalid fund hold transition: % -> %', old.status, new.status;
  end if;

  select * into offer_row
  from public.collaboration_offers
  where id = new.offer_id;

  select workspace_id into collab_workspace
  from public.collaborations
  where id = new.collaboration_id;

  if offer_row.id is null
     or offer_row.collaboration_id <> new.collaboration_id
     or collab_workspace <> new.workspace_id then
    raise exception 'fund hold must match its collaboration, offer, and workspace';
  end if;

  if new.amount_cents <> offer_row.fee_cents or new.currency <> offer_row.currency then
    raise exception 'fund hold must exactly match the snapshotted offer fee and currency';
  end if;

  if new.status in ('reserved'::public.fund_hold_status, 'released'::public.fund_hold_status)
     and (new.captured_transaction_id is not null or new.refunded_transaction_id is not null) then
    raise exception 'uncaptured fund holds cannot reference settlement transactions';
  end if;

  if new.status in ('captured'::public.fund_hold_status, 'refunded'::public.fund_hold_status) then
    select type, workspace_id, collaboration_id, amount_cents, currency
      into settlement_type, settlement_workspace, settlement_collaboration,
           settlement_amount, settlement_currency
    from public.wallet_transactions
    where id = new.captured_transaction_id;

    if settlement_type is distinct from 'charge'::public.wallet_txn_type
       or settlement_workspace is distinct from new.workspace_id
       or settlement_collaboration is distinct from new.collaboration_id
       or settlement_amount is distinct from new.amount_cents
       or settlement_currency is distinct from new.currency then
      raise exception 'captured fund hold requires a matching immutable charge transaction';
    end if;
  end if;

  if new.status = 'refunded'::public.fund_hold_status then
    select type, workspace_id, collaboration_id, amount_cents, currency
      into settlement_type, settlement_workspace, settlement_collaboration,
           settlement_amount, settlement_currency
    from public.wallet_transactions
    where id = new.refunded_transaction_id;

    if new.captured_transaction_id is null
       or settlement_type is distinct from 'refund'::public.wallet_txn_type
       or settlement_workspace is distinct from new.workspace_id
       or settlement_collaboration is distinct from new.collaboration_id
       or settlement_amount is distinct from new.amount_cents
       or settlement_currency is distinct from new.currency then
      raise exception 'refunded fund hold requires prior capture and a matching refund transaction';
    end if;
  end if;

  if new.status = 'reserved'::public.fund_hold_status then
    perform 1 from public.workspaces where id = new.workspace_id for update;
    available := public.wallet_available_cents(new.workspace_id, new.currency);

    if tg_op = 'UPDATE'
       and old.status = 'reserved'::public.fund_hold_status
       and old.workspace_id = new.workspace_id
       and old.currency = new.currency then
      available := available + old.amount_cents;
    end if;

    if available < new.amount_cents then
      raise exception 'insufficient wallet balance: available %, required %', available, new.amount_cents;
    end if;
  end if;

  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;

  return new;
end;
$$;

create trigger fund_holds_validate_balance
before insert or update on fund_holds
for each row execute function validate_fund_hold();

create trigger fund_holds_no_delete
before delete on fund_holds
for each row execute function reject_immutable_mutation();

-- At transaction end, outbound invites and accepted creator applications must
-- have a matching reserved/captured hold. This permits collab + offer + hold to
-- be created atomically without introducing the full command interface yet.
create or replace function enforce_collaboration_funding() returns trigger
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  collab public.collaborations%rowtype;
  required_offer_id uuid;
  target_collaboration_id uuid;
begin
  if tg_table_name = 'fund_holds' then
    target_collaboration_id := new.collaboration_id;
  else
    target_collaboration_id := new.id;
  end if;

  select * into collab
  from public.collaborations
  where id = target_collaboration_id;

  if collab.id is null or collab.deleted_at is not null then
    return null;
  end if;

  if collab.status in (
    'accepted'::public.collab_status,
    'brief_pending'::public.collab_status,
    'content_submitted'::public.collab_status,
    'revision_requested'::public.collab_status,
    'approved'::public.collab_status,
    'scheduled'::public.collab_status,
    'published'::public.collab_status,
    'completed'::public.collab_status
  ) then
    required_offer_id := collab.accepted_offer_id;
    if required_offer_id is null or not exists (
      select 1 from public.collaboration_offers o
      where o.id = required_offer_id and o.accepted_at is not null
    ) then
      raise exception 'accepted collaboration % requires an accepted offer snapshot', collab.id;
    end if;
  elsif collab.origin = 'brand_invite'::public.collab_origin
        and collab.status in (
          'requested'::public.collab_status,
          'negotiating'::public.collab_status
        ) then
    required_offer_id := collab.current_offer_id;
  else
    return null;
  end if;

  if required_offer_id is null or not exists (
    select 1
    from public.fund_holds h
    join public.collaboration_offers o on o.id = h.offer_id
    where h.collaboration_id = collab.id
      and h.offer_id = required_offer_id
      and h.workspace_id = collab.workspace_id
      and h.amount_cents = o.fee_cents
      and h.currency = o.currency
      and h.status in ('reserved'::public.fund_hold_status, 'captured'::public.fund_hold_status)
  ) then
    raise exception 'collaboration % requires a funded hold for offer %', collab.id, required_offer_id;
  end if;

  return null;
end;
$$;

create constraint trigger collaborations_require_funding
after insert or update on collaborations
deferrable initially deferred
for each row execute function enforce_collaboration_funding();

create constraint trigger fund_holds_keep_collaboration_funded
after insert or update on fund_holds
deferrable initially deferred
for each row execute function enforce_collaboration_funding();

-- TODO(post-24h): replace broad row updates with a full server-side command
-- interface that validates every collaboration transition and writes its event.

revoke all on function reject_immutable_mutation() from public;
revoke all on function protect_collaboration_offer() from public;
revoke all on function prevent_collaboration_hard_delete() from public;
revoke all on function wallet_available_cents(uuid, char(3)) from public;
revoke all on function validate_fund_hold() from public;
revoke all on function enforce_collaboration_funding() from public;

-- ============================================================
-- RLS  (enable everywhere; policies below are the starting set)
-- ============================================================
alter table profiles            enable row level security;
alter table workspaces          enable row level security;
alter table workspace_members   enable row level security;
alter table brand_profiles      enable row level security;
alter table creators            enable row level security;
alter table creator_private_profiles enable row level security;
alter table creator_bundles     enable row level security;
alter table campaigns           enable row level security;
alter table briefs              enable row level security;
alter table collaborations      enable row level security;
alter table collaboration_offers enable row level security;
alter table collaboration_deliverables enable row level security;
alter table collaboration_events enable row level security;
alter table tracking_links      enable row level security;
alter table click_events        enable row level security;
alter table posts               enable row level security;
alter table wallet_transactions enable row level security;
alter table fund_holds          enable row level security;
alter table payouts             enable row level security;
alter table conversations       enable row level security;
alter table messages            enable row level security;
alter table referrals           enable row level security;

-- helper: is the current user a member of a workspace?
create or replace function public.is_member(ws uuid) returns boolean
language sql security definer stable
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;
revoke all on function public.is_member(uuid) from public;
grant execute on function public.is_member(uuid) to authenticated;

-- profiles: self read/update
create policy "profile self" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- workspaces / members / brand_profiles: members only
create policy "ws members read"  on workspaces for select using (is_member(id));
create policy "ws owner write"    on workspaces for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "members read"      on workspace_members for select using (is_member(workspace_id));
create policy "brand profile rw"  on brand_profiles for all
  using (is_member(workspace_id)) with check (is_member(workspace_id));

-- creators: public read when marketplace_visible; self write
create policy "creator public read" on creators for select using (marketplace_visible or id = auth.uid());
create policy "creator self write"  on creators for all using (id = auth.uid()) with check (id = auth.uid());
create policy "creator private self read" on creator_private_profiles for select
  using (creator_id = auth.uid());
create policy "creator private self insert" on creator_private_profiles for insert
  with check (creator_id = auth.uid());
create policy "creator private self update" on creator_private_profiles for update
  using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "bundles read"        on creator_bundles for select
  using (exists (select 1 from creators c where c.id = creator_id
                 and (c.marketplace_visible or c.id = auth.uid())));
create policy "bundles self write"  on creator_bundles for all
  using (creator_id = auth.uid()) with check (creator_id = auth.uid());

-- campaigns/briefs: workspace members; open campaigns readable by creators (Opportunities)
create policy "campaign members"  on campaigns for all
  using (is_member(workspace_id)) with check (is_member(workspace_id));
create policy "campaign open read" on campaigns for select using (open_to_applications = true);
create policy "brief members"     on briefs for all
  using (is_member(workspace_id)) with check (is_member(workspace_id));

-- collaborations: visible to workspace members AND the creator on the row
create policy "collab visibility" on collaborations for select
  using (deleted_at is null and (is_member(workspace_id) or creator_id = auth.uid()));
create policy "collab brand insert" on collaborations for insert
  with check (is_member(workspace_id));
create policy "collab brand update" on collaborations for update
  using (is_member(workspace_id)) with check (is_member(workspace_id));
create policy "collab creator update" on collaborations for update
  using (creator_id = auth.uid()) with check (creator_id = auth.uid());

create policy "offers visibility" on collaboration_offers for select
  using (exists (select 1 from collaborations c where c.id = collaboration_id
                 and c.deleted_at is null
                 and (is_member(c.workspace_id) or c.creator_id = auth.uid())));
create policy "deliverables visibility" on collaboration_deliverables for select
  using (exists (select 1 from collaborations c where c.id = collaboration_id
                 and c.deleted_at is null
                 and (is_member(c.workspace_id) or c.creator_id = auth.uid())));

create policy "events visibility" on collaboration_events for select
  using (exists (select 1 from collaborations c where c.id = collaboration_id
                 and c.deleted_at is null
                 and (is_member(c.workspace_id) or c.creator_id = auth.uid())));

-- Tracking records are client-readable but server-written. Raw clicks are brand-only.
create policy "tracking visibility" on tracking_links for select
  using (exists (select 1 from collaborations c where c.id = collaboration_id
                 and c.deleted_at is null
                 and (is_member(c.workspace_id) or c.creator_id = auth.uid())));
create policy "clicks visibility" on click_events for select
  using (exists (
    select 1 from tracking_links t
    join collaborations c on c.id = t.collaboration_id
    where t.id = tracking_link_id
      and c.deleted_at is null
      and is_member(c.workspace_id)
  ));
create policy "posts visibility"  on posts for select
  using (exists (select 1 from collaborations c where c.id = collaboration_id
                 and c.deleted_at is null
                 and (is_member(c.workspace_id) or c.creator_id = auth.uid())));

-- Money rows are readable by the relevant user and writable only by server role.
create policy "wallet members read" on wallet_transactions for select
  using (is_member(workspace_id));
create policy "fund holds members read" on fund_holds for select
  using (is_member(workspace_id));
create policy "payouts creator"   on payouts for select using (creator_id = auth.uid());

-- Stub tables are seed/server-written only, but still protected by RLS.
create policy "conversations visibility" on conversations for select
  using (is_member(workspace_id) or creator_id = auth.uid());
create policy "messages visibility" on messages for select
  using (exists (select 1 from conversations c where c.id = conversation_id
                 and (is_member(c.workspace_id) or c.creator_id = auth.uid())));
create policy "referrals creator read" on referrals for select
  using (referrer_id = auth.uid());

-- ============================================================
-- SEED HINTS (so the Loom is never empty):
--  * ~40 creators, varied industries/countries/prices, marketplace_visible = true
--  * per-creator audience_snapshot + 1 sample post w/ engagement
--  * 1 demo brand workspace w/ brand_profile filled, wallet funded
--  * 8-12 open campaigns (Opportunities) w/ briefs
--  * 3-4 collaborations across statuses (requested/accepted/published/completed)
--  * click_events seeded so qualified-clicks + companies-engaged render
-- ============================================================
