# naano Design System — "Attribution Thread"

The visual language for naano's public marketing surface, starting with the
landing page (`/`). This file is the **contract** for future polish: point any
later session at it to extend the look consistently.

The tokens live in code at [`src/app/globals.css`](src/app/globals.css) under
the `naano LANDING DESIGN SYSTEM` banner. They are **additive and self-scoped
under `.nn-root`** — they do not touch the older "Signal Dossier" tokens
([`DESIGN.md`](DESIGN.md)) that the authenticated brand/creator/auth screens
still depend on. As those screens are redesigned, they adopt the tokens below.

> Everything is prefixed `nn-` (naano) so it never collides with the incumbent
> system. Tailwind v4 utilities are generated from the `@theme inline` block,
> e.g. `bg-nn-blue`, `text-nn-ink`, `text-nn-muted`, `bg-nn-paper`.

---

## 1. Design language in one paragraph

**Attribution is the product, so the design makes it visible.** A single
confident blue thread runs through the page — in the hero it is drawn top-to-
bottom through the four stages of one attributed click (post → click → company
→ pipeline); in "how it works" it connects the four steps horizontally. Warm
near-white surfaces and selective soft blue "cloud" gradients keep it
welcoming, not clinical. Near-black display type (condensed) carries hierarchy;
Manrope carries calm reading copy; tabular numerals carry every measured
number. One saturated blue field (the stats band) gives the airy page a loud
moment. Blue, white, black only.

**Principles**

- **One point per section.** Short, punchy copy; generous whitespace; strong
  hierarchy. Never a wall of text.
- **Colour commits, warmth stays.** Blue is carried at page scale in a few
  places (CTAs, the stats band, the thread), never scattered as confetti.
  Warmth comes from warm near-whites and soft gradients, never from grey.
- **Prove, don't claim.** Numbers are labelled **Illustrative**; wordmarks are
  labelled placeholders. No fabricated customer results or testimonials.
- **Vary the containers.** No row of four identical boxes; each figure/card
  earns its own shape.

---

## 2. Colour tokens

Blue / white / black only. Defined as CSS variables on `:root` and exposed to
Tailwind as `--color-nn-*`.

| Token | Value | Role |
| --- | --- | --- |
| `--nn-blue` | `#2f5bff` | Primary. CTAs, thread, the stats field, accents. |
| `--nn-blue-strong` | `#1c3fd6` | Primary hover / press; deepens without shifting hue. |
| `--nn-blue-bright` | `#6b8cff` | Gradient partner; thread glow. |
| `--nn-blue-100` | `#e4ebff` | Soft tint fills, chips, selection. |
| `--nn-blue-50` | `#f1f5ff` | Faint section / row wash. |
| `--nn-ink` | `#0b1020` | Headlines and primary text (near-black, faint navy warmth). |
| `--nn-muted` | `#4a5169` | Secondary text. Tinted from the ink hue — **never a cold grey**. AA on white and on `--nn-blue-50`. |
| `--nn-white` | `#ffffff` | Pure white surfaces, primary-button text. |
| `--nn-paper` | `#fafaf7` | Default warm near-white page surface. |
| `--nn-line` | `rgb(11 16 32 / 0.10)` | Hairline borders. |
| `--nn-line-strong` | `rgb(11 16 32 / 0.16)` | Secondary-button border, stronger dividers. |

**Contrast rules**

- Body & secondary text uses `--nn-muted` (≥ 4.5:1 on white/paper) — tint
  secondary text from the ink hue, never grey.
- On the blue stats field, labels are **full white** (`≈ 5.2:1`), not
  translucent white, which would fail at small sizes.

**Gradient "clouds"** (selective, for warmth):

- `.nn-cloud` — soft blue radial washes over `--nn-paper` (hero, final CTA).
- `.nn-cloud-deep` — stronger top wash over white (attribution section).

---

## 3. Typography

Fonts are already loaded in the root layout via `next/font` and reused here.

- **Display:** Barlow Condensed (700). Class `.nn-display` — condensed,
  `letter-spacing: -0.03em`, `line-height: 0.96`, `text-wrap: balance`. Used
  for headlines, step titles, stat numbers, the wordmark.
- **Body:** Manrope (400–700). Default `.nn-root` font.
- **Numerals:** class `.nn-num` sets `tabular-nums` for aligned, measured
  numbers (stats, attribution metadata, step indices).

### Scale (fluid where it leads)

| Step | Size | Usage |
| --- | --- | --- |
| Hero display | `clamp(2.6rem, 6.2vw, 4.7rem)` | Hero H1 only. |
| Section display | `clamp(2rem, 4.2vw, 3.25rem)` | Section H2. |
| Stat number | `clamp(2.8rem, 6vw, 4rem)` | Count-up figures. |
| Title | `1.5rem` (`text-2xl`) | Card / step titles. |
| Body-large | `1.125rem` (`text-lg`) | Section intros, hero subcopy. |
| Body | `1rem` | Default copy. |
| Body-small | `0.95rem` | Dense card/list copy, secondary lines. |
| Label / meta | `0.75–0.875rem`, `tracking-[0.14em]` uppercase for eyebrow-free captions | "ILLUSTRATIVE", footer column heads. |

> Note: `0.95rem` (body-small) and `1.7rem` (wordmark) are intentional steps in
> this system. The mechanical detector compares against the older `DESIGN.md`
> ramp and will flag them as "off-ramp" — that is expected and correct.

**No kicker/eyebrow labels above headings** — headings carry their own weight.

---

## 4. Spacing & layout

| Token | Value | Role |
| --- | --- | --- |
| `--nn-section-y` | `clamp(5rem, 9vw, 8.5rem)` | Vertical padding per content section. |
| `--nn-gutter` | `clamp(1.25rem, 5vw, 4rem)` | Horizontal page gutter. |
| `--nn-maxw` | `78rem` | Content max width. |
| `--nn-radius` | `1.25rem` | Cards / large surfaces. |
| `--nn-radius-sm` | `0.85rem` | Buttons, chips, small tiles. |

- `.nn-container` — centered, `max-width: var(--nn-maxw)`, gutter padding.
- Base rhythm is an 8pt-ish scale via Tailwind spacing. More space **above** a
  heading than below it.
- Grids collapse to one column on mobile; multi-column only when reading order
  stays obvious.

---

## 5. Components

### Buttons (`.nn-btn`)

- `.nn-btn-primary` — solid `--nn-blue`, white text, blue drop shadow
  (`0 8px 20px -8px`), hover deepens to `--nn-blue-strong` and lifts `-2px`.
- `.nn-btn-secondary` — white fill, ink text, `--nn-line-strong` border; hover
  border + text go blue and it lifts.
- Min height `3.25rem`, radius `--nn-radius-sm`, weight 700. Active resets lift.
- Focus: global `.nn-root :focus-visible` = 3px `--nn-blue` outline, 3px offset.

### Cards (`.nn-card`)

- White fill, `--nn-line` hairline, radius `--nn-radius`, soft **offset** shadow
  (`0 20px 44px -30px`) — depth always carries offset + blur, never a flat halo.
- Cards are varied by role, not stamped four-up: the hero figure, the
  attribution figure, and the two pricing tiers each have distinct structure.
  The featured pricing tier swaps to a `--nn-blue-50` fill with a blue ring.

### Chips (`.nn-chip`)

- Pill, `--nn-blue-50` fill, `--nn-blue-strong` text, faint blue border. For
  small in-figure labels ("One click, traced", "Incoming clicks").

### Icons

- Authored inline SVG, single **1.75** stroke, `currentColor`, 24×24 grid.
  No emoji or unicode glyphs stand in for icons.

---

## 6. Motion

All motion is opt-in and **degrades to a settled, fully-visible state** with no
JS and under `prefers-reduced-motion`.

- **Enablement:** `MotionRoot` stamps `data-nn-anim="on"` on `<html>` only when
  JS mounts and motion is allowed. Every animated rule is nested under that
  attribute, so no-JS / crawlers / reduced-motion see the final state.
- **Signature — the thread draws itself.** `.nn-thread-path` animates
  `stroke-dashoffset` from its measured length to 0 over `1.6s`
  `var(--nn-ease)` the first time it scrolls into view (IntersectionObserver).
  Default (no anim) is fully drawn.
- **Count-up stats.** Numbers ease from 0 to target over `1.7s` on first
  in-view; SSR and reduced-motion render the final value (no flash of zero).
- **Reveal.** `.nn-reveal` fades up `16px` on first in-view; one restrained
  entrance, staggered by index — not a different animation per section.
- **Marquee.** `.nn-marquee-track` scrolls linearly (`40s`), pauses on hover /
  focus-within, edge-masked. Reduced-motion freezes it (logos stay legible).
- **Easing:** `--nn-ease: cubic-bezier(0.22, 1, 0.36, 1)` (exponential-ish
  ease-out) is the house curve.

---

## 7. Browser surfaces (themed, not default)

Inside `.nn-root`:

- **Selection** — `--nn-blue-100` background, ink text.
- **Focus ring** — 3px `--nn-blue`, 3px offset.
- **Scrollbar** — blue thumb on `--nn-blue-50` track.
- **Numerals** — `tabular-nums` wherever numbers are measured.

---

## 8. Do / Don't

**Do**

- Keep blue, white, black only; let warmth come from warm near-whites and soft
  gradients.
- Carry the thread motif when showing a path or sequence.
- Label illustrative numbers and placeholder wordmarks as such.
- Vary containers; give each figure a reason to exist.

**Don't**

- Add an eyebrow/kicker label above a heading.
- Use grey for secondary text (tint from ink instead).
- Use gradient text, glass-as-decoration, or a coloured `border-left` on cards.
- Ship a row of four identical icon+title+text cards as the page structure.
- Animate without a reduced-motion / no-JS fallback.
