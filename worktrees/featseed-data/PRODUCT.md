# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (React) + Tailwind CSS + Supabase (Postgres, auth, storage). Confirmed by the user for this from-scratch rebuild.

## Users

**Primary user:** a B2B SaaS marketer running creator campaigns — they discover, vet, and book LinkedIn creators for sponsored posts, and judge success by attributed pipeline.

**Secondary user (supply side):** a LinkedIn creator who lists a profile/card, gets matched to brand campaigns, publishes sponsored posts, and gets paid.

naano is a two-sided marketplace; both roles are first-class, but the demand-side marketer is the primary user the experience is optimized for.

## Product Purpose

naano is a B2B LinkedIn creator marketplace that connects brands with vetted creators for sponsored LinkedIn posts. Brands discover and book creators; creators list a card, get matched to campaigns, and get paid. It exists to make creator-led LinkedIn marketing a measurable, pipeline-attributable acquisition channel rather than an unaccountable brand spend. Success = a marketer books vetted creators, launches posts, and sees qualified clicks attributed back to pipeline.

## Positioning

Performance-priced, attribution-first creator marketplace: fixed price per sponsored post, **pay per qualified click**, with clicks **attributed back to pipeline**. The combination of vetted LinkedIn creators + per-click performance pricing + pipeline attribution is the mechanism a generic influencer marketplace or a manual agency engagement could not truthfully claim.

## Operating Context

- **Brand / demand side workflow:** discover creators → vet → book sponsored post(s) at a fixed price per post → creators publish → track qualified clicks → attribute to pipeline.
- **Creator / supply side workflow:** create a listing card → get matched to brand campaigns → publish sponsored posts → get paid.
- **Channel:** LinkedIn sponsored posts specifically (not a general multi-platform influencer tool).
- Two distinct authenticated experiences (brand and creator) likely sharing a marketplace core.

## Capabilities and Constraints

- Creator discovery and vetting for brands.
- Creator listing cards; campaign matching between creators and brand campaigns.
- Booking sponsored LinkedIn posts at a fixed price per post.
- Pay-per-qualified-click pricing model.
- Click attribution back to pipeline.
- Creator payouts.
- Two-sided auth/roles (brand vs. creator).

**Undecided / not yet established:** specific vetting criteria, payment/payout provider, attribution implementation details, pricing tiers, and campaign lifecycle states. Do not fabricate these — record them as open when they come up.

## Brand Commitments

- **Name:** naano (as used in the repo; capitalization to be confirmed by the user).
- No voice, logo, visual assets, or binding brand references have been provided yet.

## Evidence on Hand

None yet. There is no existing product content, creator data, brand logos, testimonials, benchmarks, or pricing to draw from — the repo currently contains only agent-capture tooling (`AGENTS.md`, `CAPTURE-TEST.md`, `.claude`/`.codex` hooks), not application code. Future work must not fabricate creators, brands, campaign results, click/attribution numbers, or testimonials; use clearly-labeled placeholder/sample data until real content exists.

## Product Principles

1. **Attribution is the product.** Every surface should make the path from post → qualified click → pipeline legible and trustworthy; measurement is the reason to choose naano.
2. **Serve both sides, optimize for the marketer.** Keep the creator experience first-class, but resolve conflicts in favor of the B2B marketer's ability to discover, book, and prove ROI.
3. **Vetted, not volume.** Trust in creator quality is a core promise; the experience should signal curation and vetting, not an open flood of listings.
4. **Performance pricing must feel fair and clear.** Fixed price per post and pay-per-qualified-click should be unambiguous to both sides at every decision point.
