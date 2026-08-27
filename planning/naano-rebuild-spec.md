# naano rebuild — build spec (contracts-first)

Single source of truth for the two coding agents. Drop this + `schema.sql` in the repo root and point both harnesses at it. Feed `naano.com/llms.txt` and `pricing.md` alongside as ground-truth product reference.

Stack: **Next.js (App Router) + Tailwind + Supabase** (auth, Postgres, RLS, storage). Deploy: Vercel.

---

## 1. The product in one paragraph (what we must preserve)

naano is a **B2B LinkedIn creator marketplace** with one wedge: *zero-effort personalization from a URL*. A brand pastes its website → it's scraped into a value-prop + 3 ICPs → the marketplace arrives pre-**Matched**, not as a raw directory. Pricing is **per qualified click / fixed price per post**, and every post is **attributed** back to clicks, companies, and pipeline. The brand side and creator side are the **same collaboration seen from opposite ends** — that is the core architectural call, not two parallel apps.

---

## 2. Scope freeze (24h)

| Area | IN (build) | MOCK (fake cleanly, say so) | CUT (backlog, mention in Loom) |
|---|---|---|---|
| Auth | Supabase email/OAuth, brand + creator roles | — | SSO |
| Brand onboarding | website field → scan → value-prop + 3 ICPs | the "scan" = 1 real AI call on the URL | live LinkedIn scraping |
| Marketplace | matched grid, filters, sort, creator profile modal (Overview/Audience/Content) | audience stats seeded | 672-creator scale |
| **AI brief (flagship)** | Create-with-AI → editable brief **+ suggested creators + budget** | — | concierge / "from link" modes |
| Booking | book-at-rate **and** negotiate (discount tiers, 48h window), wallet-gated, brief-attached, approve toggle | wallet top-up (no real Stripe) | real payments |
| Collaborations | pipeline (both sides) off one table, status machine | — | disputes |
| Creator | onboarding card (4 steps), Opportunities, apply/accept, Earnings | payouts, DAC7 gate | affiliate loop, community, media-kit, bundles editor, "bring-your-own-deal" |
| Attribution | qualified clicks → dashboard tiles + companies engaged | click generation seeded | real UTM redirector |
| Dashboards | brand home (to-do w/ Blocked/Suggested), creator overview | metrics seeded | — |

Cut line rationale: the brand path is the primary graded flow; the creator path is built **just deep enough to demo the money handshake** (brand invites → creator accepts → published → attributed → payout). Everything cut is a deliberate, nameable trade — that reads as judgment, not omission.

---

## 3. Data model

See `schema.sql` (runnable). The spine is **`collaborations`**: one row per brand↔creator deal, `origin` = `brand_invite` | `creator_application`, driving both pipelines via role-scoped RLS. Brand tiles (impressions / profiles engaged / posts published / creators activated) and the whole "qualified clicks → companies → pipeline" story derive from `click_events` joined through `collaborations`.

---

## 4. Type contract (shared — both agents import these)

```ts
export type Role = 'brand' | 'creator';
export type CollabStatus =
  | 'requested' | 'negotiating' | 'accepted' | 'declined'
  | 'brief_pending' | 'content_submitted' | 'approved'
  | 'published' | 'completed' | 'cancelled';

export interface Creator {
  id: string; displayName: string; headline: string; country: string;
  linkedinUrl: string; followers: number; industries: string[];
  pricePerPostCents: number; estImpressions: number;
  audienceSnapshot: { jobTitle: Record<string, number>; seniority: Record<string, number>; sampleN: number };
  matchDefault: number; marketplaceVisible: boolean;
}

export interface Icp { role: string; companyType: string; pain: string; productFit: string; tags: string[] }

export interface Brief {
  id: string; campaignId: string; title: string; source: 'ai'|'link'|'concierge'|'manual';
  objectives: string; keyMessages: string[]; guidelines: string; status: 'draft'|'ready';
}

export interface Collaboration {
  id: string; workspaceId: string; creatorId: string;
  campaignId?: string; briefId?: string;
  origin: 'brand_invite'|'creator_application';
  offerType: 'single_post'|'bundle';
  listPriceCents: number; offeredPriceCents: number; discountPct: number;
  deliverables: string; postBy: string; approvalRequired: boolean;
  status: CollabStatus; trackingUrl?: string; respondBy?: string;
}

// AI brief endpoint contract
export interface GenerateBriefRequest { workspaceId: string; objective: string; audienceHint?: string }
export interface GenerateBriefResponse {
  brief: Pick<Brief,'title'|'objectives'|'keyMessages'|'guidelines'>;
  suggestedCreatorIds: string[];
  estimatedBudgetCents: number;
}
```

---

## 5. Route / surface map

**Brand** (`/brand/*`): `onboarding` (website → value-prop+ICP) · `overview` (to-do, new creators, engaged ICP accounts) · `creators` (matched marketplace + filters + profile modal) · `campaigns/new` (3 modes; build **Create-with-AI**) · `collaborations` (pipeline) · `billing` (wallet) · `settings` (workspace profile, brand intelligence, team & access).

**Creator** (`/creator/*`): `onboarding` (4 steps: LinkedIn URL → country/industries → price → bundle) · `overview` (card + launch guide) · `opportunities` (open campaigns, apply) · `collaborations` · `analytics` · `earnings` (withdraw) · `settings` (professional/DAC7 gate).

**Shared**: `/c/[slug]` public creator card (the "Deal Link"), `/api/track/[collabId]` click redirector (mock enrichment).

---

## 6. Flagship: AI brief (the Loom hero, ~15s)

Brand describes product + goal → **one** Anthropic API call returns `{ brief, suggestedCreatorIds, estimatedBudgetCents }`. Prefill the editable brief editor, drop the suggested creators inline, show the budget. This is where "product judgment" + "real agent usage" land at once — and it produces honest, substantive capture logs on its own. Server-side route only (never expose the key client-side).

---

## 7. Agent split (no file collisions)

- **Codex** owns: `schema.sql` → migrations, RLS, seed script, server actions / route handlers, wallet + attribution logic, the AI-brief endpoint. Branch `be/*`.
- **Claude Code + Impeccable** owns: design tokens + component library, all `/brand` and `/creator` screens, the profile modal, the brief editor UI. Branch `fe/*`.
- Both import section 4 types. Merge at **feature boundaries**, never mid-feature. Contracts (this doc + schema) are frozen before either starts.

Install Impeccable into both harnesses (`npx impeccable install` → `/impeccable init`). Use it for **craft**, but set naano-adjacent-but-distinct tokens yourself (do **not** clone naano's blue, and do not accept Impeccable's default warm/orange aesthetic). Run `/critique` on components as you go.

---

## 8. 24h sequence

0. **Capture setup first** — verify `8x-internal.com` with Theo, read the script, run sandboxed, confirm the capture test passes *before* agents start (their requirement).
1. Contracts frozen (this doc + schema) — done.
2. Design tokens + core components (Impeccable). ~1.5h.
3. Thin vertical slice: auth + roles + brand onboarding (real AI scan) → dashboard.
4. Feature-by-feature: marketplace → profile modal → **AI brief** → booking/negotiate (wallet-gated) → collaborations → creator opportunities/accept → earnings.
5. Seed realistic data → deploy → smoke-test both flows on a demo login.
6. Loom (≤5 min, camera on) → final commits → confirm `.agent-logs/` clean.

---

## 9. Loom talking points (say the judgment out loud)

- "One `collaborations` table, two role views — not two apps." (architecture)
- "The scan is one AI call; I mocked LinkedIn scraping and here's why." (scoping judgment)
- "Wallet-gates invites, which is why Top-up is *Blocked* on the dashboard." (systemic understanding)
- "I kept the creator profile's honest 'good to know' weakness line — it's a trust feature." (product taste)
- "Here's what I deliberately cut and would build next." (prioritization)
