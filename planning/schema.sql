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
  'brief_pending',    -- accepted, brief being finalised
  'content_submitted',-- creator submitted post link/draft
  'approved',         -- brand approved (only if approval_required)
  'published',
  'completed',
  'cancelled'
);
create type wallet_txn_type      as enum ('topup', 'hold', 'charge', 'refund');
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
  wallet_cents  bigint not null default 0,     -- available budget
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
  -- professional / payout (compliance gate)
  registration_country  text,
  has_registered_business boolean,
  tax_id                text,                          -- DAC7 / EU TIN
  payout_method         payout_method,
  bank_holder           text,
  bank_iban_last4       text,
  stripe_connected      boolean default false,
  last_scraped_at       timestamptz,                   -- LinkedIn re-sync capped once/week
  created_at            timestamptz default now()
);

-- [CORE] bundle offers (e.g. 5 posts / €280)
create table creator_bundles (
  id                uuid primary key default gen_random_uuid(),
  creator_id        uuid references creators(id) on delete cascade,
  num_posts         int not null,
  total_price_cents bigint not null,
  is_primary        boolean default false
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
  workspace_id        uuid not null references workspaces(id) on delete cascade,
  creator_id          uuid not null references creators(id)   on delete cascade,
  campaign_id         uuid references campaigns(id) on delete set null,
  brief_id            uuid references briefs(id)    on delete set null,
  origin              collab_origin not null,
  offer_type          offer_type default 'single_post',
  list_price_cents    bigint,                 -- creator's standard rate at time of offer
  offered_price_cents bigint,                 -- after negotiation/discount
  discount_pct        int default 0,
  deliverables        text,                   -- e.g. "1 post + 1 repost"
  post_by             date,                   -- defaults +14d in app
  approval_required   boolean default false,
  status              collab_status not null default 'requested',
  tracking_url        text,                   -- attribution link for this collab
  respond_by          timestamptz,            -- 48h accept/decline window
  responded_at        timestamptz,
  published_at        timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index on collaborations (workspace_id, status);
create index on collaborations (creator_id, status);

-- [CORE] timeline / audit for a collaboration
create table collaboration_events (
  id               uuid primary key default gen_random_uuid(),
  collaboration_id uuid references collaborations(id) on delete cascade,
  actor_id         uuid references profiles(id),
  type             text not null,   -- offer_made | countered | accepted | declined | submitted | approved | published | ...
  payload          jsonb default '{}',
  created_at       timestamptz default now()
);

-- ---------- attribution (the whole product) ----------
-- [CORE] qualified-click tracking → brand dashboard + case-study metrics
create table click_events (
  id               uuid primary key default gen_random_uuid(),
  collaboration_id uuid references collaborations(id) on delete cascade,
  ip_hash          text,
  company          text,            -- enriched (mock enrichment ok)
  is_qualified     boolean default false,
  context          jsonb default '{}',
  occurred_at      timestamptz default now()
);
create index on click_events (collaboration_id, is_qualified);

-- [CORE] published post + performance (creator public-post import)
create table posts (
  id               uuid primary key default gen_random_uuid(),
  collaboration_id uuid references collaborations(id) on delete cascade,
  creator_id       uuid references creators(id) on delete cascade,
  linkedin_url     text,
  impressions      int default 0,
  reactions        int default 0,
  comments         int default 0,
  reposts          int default 0,
  published_at     timestamptz
);

-- ---------- money ----------
-- [CORE] brand wallet ledger (gates invites)
create table wallet_transactions (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid references workspaces(id) on delete cascade,
  type             wallet_txn_type not null,
  amount_cents     bigint not null,
  collaboration_id uuid references collaborations(id) on delete set null,
  created_at       timestamptz default now()
);

-- [CORE] creator payouts / earnings
create table payouts (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid references creators(id) on delete cascade,
  collaboration_id uuid references collaborations(id) on delete set null,
  amount_cents     bigint not null,
  status           payout_status not null default 'pending',
  method           payout_method,
  created_at       timestamptz default now(),
  paid_at          timestamptz
);

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
-- RLS  (enable everywhere; policies below are the starting set)
-- ============================================================
alter table profiles            enable row level security;
alter table workspaces          enable row level security;
alter table workspace_members   enable row level security;
alter table brand_profiles      enable row level security;
alter table creators            enable row level security;
alter table creator_bundles     enable row level security;
alter table campaigns           enable row level security;
alter table briefs              enable row level security;
alter table collaborations      enable row level security;
alter table collaboration_events enable row level security;
alter table click_events        enable row level security;
alter table posts               enable row level security;
alter table wallet_transactions enable row level security;
alter table payouts             enable row level security;

-- helper: is the current user a member of a workspace?
create or replace function is_member(ws uuid) returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;

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
create policy "bundles read"        on creator_bundles for select using (true);
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
  using (is_member(workspace_id) or creator_id = auth.uid());
create policy "collab brand write" on collaborations for all
  using (is_member(workspace_id)) with check (is_member(workspace_id));
create policy "collab creator update" on collaborations for update
  using (creator_id = auth.uid());   -- creator can accept/decline/submit (constrain columns in app)

create policy "events visibility" on collaboration_events for select
  using (exists (select 1 from collaborations c where c.id = collaboration_id
                 and (is_member(c.workspace_id) or c.creator_id = auth.uid())));

-- attribution / posts: same visibility as the parent collaboration
create policy "clicks visibility" on click_events for select
  using (exists (select 1 from collaborations c where c.id = collaboration_id and is_member(c.workspace_id)));
create policy "posts visibility"  on posts for select
  using (exists (select 1 from collaborations c where c.id = collaboration_id
                 and (is_member(c.workspace_id) or c.creator_id = auth.uid())));

-- money
create policy "wallet members"    on wallet_transactions for all
  using (is_member(workspace_id)) with check (is_member(workspace_id));
create policy "payouts creator"   on payouts for select using (creator_id = auth.uid());

-- ============================================================
-- SEED HINTS (so the Loom is never empty):
--  * ~40 creators, varied industries/countries/prices, marketplace_visible = true
--  * per-creator audience_snapshot + 1 sample post w/ engagement
--  * 1 demo brand workspace w/ brand_profile filled, wallet funded
--  * 8-12 open campaigns (Opportunities) w/ briefs
--  * 3-4 collaborations across statuses (requested/accepted/published/completed)
--  * click_events seeded so qualified-clicks + companies-engaged render
-- ============================================================
