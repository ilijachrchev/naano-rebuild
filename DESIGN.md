---
name: "naano Signal Dossier"
description: "An editorial evidence dossier for turning brand signals into attributable creator matching."
colors:
  carbon: "#17151d"
  mineral: "#f2f3ec"
  paper: "#fafaf6"
  aubergine: "#6b315d"
  aubergine-deep: "#512247"
  signal: "#c9f56a"
  mist: "#d8dccf"
  danger: "#9e354f"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(3.25rem, 4.5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 0.89
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.75rem"
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.13em"
rounded:
  control: "0.25rem"
  full: "9999px"
spacing:
  field-y: "0.75rem"
  field-x: "1rem"
  control-y: "0.95rem"
  control-x: "1.15rem"
  gutter: "1.5rem"
  page-gutter: "3.5rem"
components:
  button-primary:
    backgroundColor: "{colors.aubergine}"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-y} {spacing.control-x}"
    height: "3.65rem"
  button-primary-hover:
    backgroundColor: "{colors.aubergine-deep}"
    textColor: "{colors.white}"
  input-dark:
    backgroundColor: "rgb(255 255 255 / 0.025)"
    textColor: "{colors.mineral}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "{spacing.field-y} {spacing.field-x}"
    height: "3.2rem"
  input-light:
    backgroundColor: "rgb(255 255 255 / 0.38)"
    textColor: "{colors.carbon}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "{spacing.field-y} {spacing.field-x}"
    height: "3.2rem"
  tab-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    typography: "{typography.label}"
    padding: "0 1.25rem"
    height: "4rem"
  evidence-mark:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.full}"
    size: "2rem"
---

# Design System: naano Signal Dossier

## Overview

**Creative North Star: "Signal Dossier"**

Signal Dossier treats brand onboarding and campaign intelligence as an editorial evidence file: measured, indexed, and useful before it is decorative. Carbon framing holds a mineral-and-paper working surface, while fine rules, ordered numerals, and clipped tabs make progress and provenance legible.

The atmosphere is forensic but not cold. Aubergine carries deliberate actions, acid-lime marks verified evidence and current state, and the condensed display face gives the dossier a strong editorial voice without sacrificing Manrope's operational clarity. The system rejects generic centered SaaS wizard styling, the former naano-blue reflex, and orange accenting.

**Key Characteristics:**

- Editorial evidence surfaces with a subtle paper grain.
- Carbon framing, mineral working planes, aubergine controls, and sparse acid-lime state marks.
- Indexed progress, clipped file tabs, precise hairlines, and zero ornamental card chrome.
- Condensed, high-impact headings paired with calm, readable body copy.

## Colors

The palette pairs near-black carbon and warm mineral paper with restrained aubergine action color and rare acid-lime evidence signals.

### Primary

- **Dossier Aubergine** (`#6b315d`): Primary buttons, active numerals, structural emphasis, and the animated research line.
- **Deep Aubergine** (`#512247`): The primary-button hover state; it deepens the action without changing hue.

### Secondary

- **Evidence Danger** (`#9e354f`): Validation failures and error boundaries only.

### Tertiary

- **Acid Signal** (`#c9f56a`): Verified evidence, current progress, selection, focus outlines, and small readiness markers.

### Neutral

- **Carbon** (`#17151d`): Dark shells, primary text, hairlines through alpha, and the deepest structural plane.
- **Mineral** (`#f2f3ec`): App background, inverse text, and light-on-dark field strokes.
- **Paper** (`#fafaf6`): Evidence surfaces, active file tabs, and inset factual tiles.
- **Mist** (`#d8dccf`): Muted tab bands and quiet tonal separation.
- **White** (`#ffffff`): Primary-action text and the focused light-field surface.

### Named Rules

**The Signal Is Evidence Rule.** Acid-lime marks verified, active, selected, or keyboard-focused information; it is never a broad decorative fill.

**The No Blue, No Orange Rule.** Keep the shipped carbon, mineral, aubergine, and acid-lime identity; do not revive a naano-blue palette or introduce orange.

## Typography

**Display Font:** Barlow Condensed (with `sans-serif` fallback)

**Body Font:** Manrope (with `sans-serif` fallback)

**Character:** Barlow Condensed reads like a strong dossier headline and makes numbered indexes compact. Manrope keeps forms, descriptions, labels, and operating detail composed and legible.

### Hierarchy

- **Display** (700, `clamp(3.25rem, 4.5vw, 4.5rem)`, `0.89`): First-viewport statements and the largest onboarding claim.
- **Headline** (700, `3.75rem`, `0.95`): Page questions and workspace-specific dossier headings.
- **Title** (700, `2.25rem`, `1.02`): Evidence propositions and section-level editorial statements.
- **Body** (400, `1rem`, `1.75rem`): Explanations and product guidance, usually held to a medium reading width.
- **Label** (700, `0.72rem`, `0.13em`, uppercase): Field labels, evidence categories, state labels, and tab captions.

### Named Rules

**The Condensed Evidence Rule.** Use Barlow Condensed for declarative headings, ordered indexes, and the wordmark; keep operating copy and controls in Manrope.

**The Tight Display Rule.** Large display text is bold and tightly tracked (`-0.035em`) with compact line-height; do not loosen it into generic marketing type.

## Layout

The core onboarding shell is an asymmetric three-part dossier: a narrow indexed progress rail (`106px`), a carbon narrative column (`520px`, then `580px` at the widest breakpoint), and a flexible paper evidence surface. Below the large breakpoint, the rail becomes a four-column horizontal index and the narrative/evidence planes stack vertically.

Page gutters begin at `1.5rem`, expand at the small breakpoint, and reach `3.5rem` on large evidence surfaces. Sections favor generous vertical blocks between `2.5rem` and `4rem`, while evidence rows use borders and repeated padding instead of disconnected cards. Content grids become multi-column only when the reading order remains obvious; narrow screens collapse them to a single column.

**The Indexed Journey Rule.** Multi-step brand setup keeps the numbered progress system visible; spatial orientation is part of the trust model.

## Elevation & Depth

The system is flat by default. Depth comes from carbon-versus-paper tonal planes, translucent mist bands, subtle paper grain, borders, and clipped silhouettes rather than stacked shadows. The only shipped shadow is the primary action's hover response.

### Shadow Vocabulary

- **Action Lift** (`0 10px 28px rgb(23 21 29 / 0.2)`): Appears only when an enabled primary button is hovered, paired with a `-1px` upward translation.

### Named Rules

**The Flat Evidence Rule.** Keep information surfaces flat at rest; use hairlines, tone, and paper texture to organize evidence.

## Shapes

Controls use a restrained, nearly square corner (`0.25rem`). Content blocks remain square and are separated by one-pixel rules. Circular geometry is reserved for compact verified-state marks and status dots. File tabs use a clipped right edge that subtracts `14px` from the top edge, and the active progress rail uses a small triangular pointer.

**The Cut-Paper Rule.** Use clipped geometry only for index and progress wayfinding; do not spread novelty silhouettes across ordinary content.

## Components

### Buttons

- **Shape:** Compact rectangular action with a restrained corner (`0.25rem`) and minimum height (`3.65rem`).
- **Primary:** Dossier Aubergine with white text, bold Manrope, and asymmetric content distribution around a `1.5rem` gap; internal padding is `0.95rem 1.15rem`.
- **Hover / Focus:** Hover shifts to Deep Aubergine, lifts `-1px`, and gains the Action Lift shadow over `180ms ease-out`. Keyboard focus uses the global `3px` Acid Signal outline with `3px` offset.
- **Disabled:** Keeps the same structure at `0.66` opacity and changes the cursor to waiting.

### Chips

- **Style:** Audience tags are square, transparent, hairline-bordered labels with compact `0.625rem 0.25rem` padding and `0.75rem` semibold text.
- **State:** Acid Signal filled labels are reserved for readiness counts and verified outcomes, not generic category decoration.

### Cards / Containers

- **Corner Style:** Square; cards do not introduce radius.
- **Background:** Paper evidence surfaces may carry the shipped `5px` radial grain; inset factual tiles use solid Paper over a hairline Carbon grid.
- **Shadow Strategy:** None at rest; rely on the Flat Evidence Rule.
- **Border:** One-pixel Carbon hairlines, typically between `16%` and `22%` opacity.
- **Internal Padding:** Compact evidence tiles use `1.25rem`; major surfaces use responsive page gutters.

### Inputs / Fields

- **Style:** Full-width fields use a restrained corner (`0.25rem`), minimum height (`3.2rem`), and `0.75rem 1rem` padding. Dark fields use a translucent white fill and Mineral text; light fields use a translucent white fill and Carbon text.
- **Focus:** Hover and focus move the border to Acid Signal over `160ms ease-out`; the dark fill brightens slightly and the light fill becomes White.
- **Error / Disabled:** Error messages use Evidence Danger borders and tonal fills. No distinct disabled-field treatment is implemented.

### Navigation

Dashboard navigation is a vertical indexed list on Carbon. The active item is a flat Acid Signal row with Carbon text; unavailable destinations remain transparent and subdued. Onboarding navigation uses a four-step indexed rail and repeats the same steps as clipped paper tabs over the evidence pane.

### Evidence Mark

A `2rem` Acid Signal circle with an inline check icon precedes a compact uppercase label. It confirms captured or resolved evidence, never an unverified promise.

### Brand Mark

The wordmark is the lowercase `naano` name in bold Barlow Condensed at `2rem`, followed by a small square Acid Signal stop. It can appear in Carbon or Mineral depending on its surface.

## Do's and Don'ts

### Do:

- **Do** build information hierarchy with indexed numerals, hairlines, tonal planes, and evidence labels.
- **Do** reserve Acid Signal for verified evidence, current state, selection, and keyboard focus.
- **Do** pair bold condensed declarations with readable Manrope explanations and controls.
- **Do** preserve the carbon frame and paper evidence relationship when extending brand workflows.

### Don't:

- **Don't** turn the product into a centered, rounded-card SaaS wizard.
- **Don't** use Acid Signal as a large decorative background or as routine body text.
- **Don't** introduce blue or orange accents into the shipped palette.
- **Don't** add ambient card shadows, pill-shaped controls, or decorative clipping to ordinary content.
