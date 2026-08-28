# naano

A rebuild of [naano](https://naano.com) — a B2B LinkedIn creator marketplace where brands book vetted creators for sponsored posts, priced per post and **traced back to the qualified clicks, companies, and pipeline each post drives**.

Attribution is the product. Everything here is built around one idea: *marketing spend you can put in the pipeline report.*

**Live demo:** https://naano-rebuild.vercel.app/

---

## What it does

Two sides of one marketplace, connected by a single collaboration lifecycle.

**Brand side**
- **AI onboarding** — paste a company website; one OpenAI call reads it and generates a value proposition and three ideal customer profiles.
- **Creator marketplace** — creators arrive pre-matched to that profile, with audience evidence, reach, and price. Filter, sort, and open a full creator dossier (audience breakdown, sample post).
- **AI brief generation** — turn a campaign objective + the saved brand profile into an editable creator brief.
- **Booking & negotiation** — book at rate or negotiate a discount, attach a brief, set a deadline. Wallet-gated and reserved atomically.
- **Wallet** — top up (simulated), see balance and transaction history.
- **Collaborations pipeline** — every booking, its status, offer history, and timeline.
- **Attribution analytics** — impressions → qualified clicks → companies engaged, with per-creator attribution showing who actually drove business.

**Creator side**
- **Separate signup + AI onboarding** — paste a public LinkedIn URL; one AI call builds the creator card (headline, industries, suggested price). The creator appears in the brand marketplace immediately.
- **Opportunities & invites** — see incoming brand invitations; accept or decline.
- **Content submission** — after posting, submit the published link.
- **Earnings** — payouts appear once a collaboration settles.
- **Referrals** — a performance-weighted referral program that rewards referrals by the qualified-click volume they actually drive, not a flat cut.

**Shared**
- **Messaging** — brand and creator can discuss a collaboration in a thread on its detail page.

### The core loop

`discover → brief → book → accept → deliver → approve → settle → paid → attributed`

Both sides, real money movement, every step backed by the database.

---

## Architecture

**Stack:** Next.js (App Router) · TypeScript · Tailwind · Supabase (Postgres, Auth, RLS) · OpenAI · deployed on Vercel.

### One collaboration, two views

The central design decision: a brand invite and a creator application are the **same `collaborations` row seen from opposite ends**, distinguished by an `origin` field and scoped by row-level security. Both pipelines, the attribution data, and the money flow all derive from this single spine rather than two parallel systems.

### The money path is transactional

Every operation that moves or reserves money runs through a **security-definer Postgres function**, not application code, so it's atomic and can't half-complete:

- `create_brand_invite` — inserts the collaboration, an immutable offer snapshot, and a reserved fund hold in one transaction; wallet-gated and **idempotent** (a double-click can't double-charge).
- `accept_or_decline_offer` — the creator's atomic status transition.
- `submit_collaboration_content` / `approve_and_settle_collaboration` — delivery, then atomic hold capture → wallet charge → creator payout → completion.

The wallet ledger is **append-only and immutable**; balances are computed from it. Financial and compliance data live in a creator-private table that the public marketplace can't read. All privileged writes go through server actions using a service-role client; the service-role key never reaches the browser. Reads run under RLS.

### Security notes

- Row-level security on every table; role-scoped policies for brand members vs. creators.
- Service-role key is server-only (verified not to appear in any client bundle).
- Auth-callback redirects are constrained to app-relative paths.
- Money-path RPCs are `service_role`-only with locked `search_path`.

---

## Project structure

```
src/
  app/
    (public)         landing page
    auth/            brand auth + callback
    brand/           onboarding, creators, campaigns, collaborations, wallet, analytics
    creator/         auth, onboarding, opportunities, collaborations, earnings, referrals
  components/        landing, brand, creator, shared UI
  lib/
    supabase/        browser (RLS) + server (service-role) clients
    ai/              server-only OpenAI integration
    collaborations/  settlement + data
    analytics/       attribution reads
supabase/
  migrations/        schema + transactional RPCs
  seed.sql           demo data (~40 creators, workspace, collaborations, clicks)
DESIGN-SYSTEM.md     the visual system
```

---

## Running locally

**Prerequisites:** Node 20+, pnpm, the Supabase CLI, an OpenAI API key.

```bash
pnpm install

# start local Supabase (applies migrations + seed)
pnpm db:start
pnpm db:reset

# env
cp .env.example .env.local
# fill in:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   OPENAI_API_KEY

pnpm dev
```

Open `http://localhost:3000`.

### Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Run the dev server |
| `pnpm build` | Production build |
| `pnpm lint` / `pnpm typecheck` | Lint / type-check |
| `pnpm db:start` / `pnpm db:reset` | Start / reset local Supabase |
| `pnpm db:types` | Regenerate DB types |

---

## Deployment

Deployed on Vercel against a hosted Supabase project. Migrations are pushed with `supabase db push` and the seed is run against the cloud database; the four environment variables above are set in Vercel. Supabase Auth redirect URLs are configured for the deployed domain.

---

## Scope & judgment

Built as a time-boxed assignment. Deliberate calls:

**Built in full:** the complete two-sided money loop (reserve → deliver → approve → capture → payout), attribution analytics, AI onboarding on both sides, AI briefs, booking + negotiation, wallet, collaborations, referrals, messaging, and a public landing page with a documented design system.

**Deliberately simulated (and labeled as such):** payments (no real Stripe — the wallet and payouts are a demo ledger), and post performance (a "simulate performance" action generates click events for a real collaboration in place of live LinkedIn tracking). These are marked in the code, not hidden.

**Deliberately cut, and what I'd build next:** real click-tracking to replace the simulation; multi-member workspaces; content revision loops; real referral payout settlement. The referral model itself is the one place I intentionally went *beyond* the incumbents — performance-weighted rewards tied to the attribution engine.

---

## How it was built

Developed with AI coding agents (Claude Code and Codex) running in parallel across git worktrees, with automated code review on every pull request and a documented design system driving a consistent UI. The agent prompt/response logs are committed in `.agent-logs/`.
