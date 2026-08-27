---
score: 29
p0: 0
p1: 0
verdict: ship
timestamp: 2026-08-27T19-10-05Z
slug: brand-creator-booking
---
# Brand creator booking critique

Method: dual-agent (A: impeccable_design · B: impeccable_detector)

## Verdict

Ship after the recorded corrections. The offer flow extends Signal Dossier consistently and gives the wallet reservation an appropriately explicit, evidence-led review state. Each booking attempt now carries a stable idempotency key through the atomic RPC.

## Design health

| # | Heuristic | Initial | After corrections |
|---|---|---:|---:|
| 1 | Visibility of system status | 3 | 3 |
| 2 | Match system / real world | 2 | 3 |
| 3 | User control and freedom | 2 | 2 |
| 4 | Consistency and standards | 3 | 4 |
| 5 | Error prevention | 2 | 3 |
| 6 | Recognition rather than recall | 3 | 4 |
| 7 | Flexibility and efficiency | 2 | 2 |
| 8 | Aesthetic and minimalist design | 3 | 3 |
| 9 | Error recovery | 2 | 3 |
| 10 | Help and documentation | 2 | 2 |
| **Total** | | **24/40** | **29/40** |

## What works

- The carbon, paper, aubergine, and signal hierarchy follows the existing dossier rather than introducing checkout-style card chrome.
- Negotiation is progressively disclosed, with fixed tiers and a custom path supporting both quick and precise offers.
- Pending, insufficient-wallet, empty-brief, and success states explain the consequence of the money action in direct language.

## Findings and resolution

1. **Resolved — P1:** Marketplace copy contradicted the new booking capability. It now explains the dossier-to-reservation path.
2. **Resolved — P1:** The submission lacked a consolidated financial review. A reservation evidence grid now repeats the fee, brief, post-by date, and approval requirement immediately above submission.
3. **Resolved — P2:** Invalid custom prices silently disabled submission. The field now exposes an inline error and `aria-invalid` state.
4. **Resolved — P2:** ARIA tabs lacked arrow, Home, and End key behavior; filter results were not announced. Roving focus and a polite result status were added.
5. **Resolved — P2:** Copy no longer implies that the hold is automatically released after 48 hours. It truthfully states that the fee remains reserved while the offer is pending and that the creator is asked to respond within 48 hours.
6. **Resolved — P1 money-path contract:** The offer form creates one UUID when a booking attempt is opened and reuses it for retries and double submits. The server validates and passes it to the database-enforced idempotent RPC, which returns the existing collaboration instead of reserving twice.

## Detector and browser evidence

- Impeccable CLI 3.6.0 returned `[]` for both changed creator components before and after corrections.
- No deterministic anti-pattern finding or false positive remained.
- Browser automation and overlay injection were unavailable in this environment, so rendered contrast, zoom/reflow, and viewport clipping were not independently verified.

Questions skipped: the feature task directs correction of actionable findings before review and PR; the remaining lifecycle question belongs to the explicitly mocked downstream wallet/collaboration surfaces.
