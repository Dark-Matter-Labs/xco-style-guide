# The x as operator — one x, four roles

Status: draft for approval · 2026-11-16 · branch `claude/x-character-sketches`

## Intent and why

The lowercase x in the xCO logotype is already defined as "the operator acting on" the C and O. It is the only glyph allowed to carry dusk (#F47743). This design lets that x leave the logo and act on the page — marking, guiding, keeping the reader's place — so the brand gains a playful, recognisable presence on the website, like Claude's orange character or the spider-crawl site animation.

It must hold the identity's tension (Indy's note): the tone is rigorous, open, tentative; the identity should not read as "a design exercise looking for a field". So the x has character through **motion only**. It never gets a face.

Website first. There is no separate xCO website repo, so the x is built and documented in this style guide, as a component the website can lift.

## Goals

- One reusable component that gives a page a single x with four roles: Keeper, Framer, Crawler, Multiply.
- A style-guide page that explains the x as operator, states its rules, and runs a live demo of all four roles.
- A proposed change record, because letting the x leave the mark changes the logo rules.

## Non-goals

- Wiring the x into every style-guide page or the generator pages. (Follow-up, once adopted.)
- Static versions for print, slides or social. (Follow-up.)
- New dependencies. The sketches prove plain React + `requestAnimationFrame` + SVG is enough.

## Anti-goals (would be a failure even if it works)

- A face, eyes, expressions or speech. Any mascot cues.
- More than one *live* x on screen at a time (Multiply's children are the one x expanding, and recombine). Static figures that document the x are illustrations, like the logo's construction diagram, and do not count.
- The x ever resting in a shape other than the exact logotype x.
- The x carrying information the page does not also carry. It is always an enhancement.
- Motion that starts by itself and runs longer than 5 seconds (WCAG 2.2.2).

## Constraints

- Geometry comes from `lib/logo.ts` (`logoGeometry`, `inkBounds`, `cPath`, `oPath`). Never redraw the x by hand. At rest the overlay x must sit exactly on the logo's x position and scale.
- Colour: the x is `var(--xco-dusk)`. Nothing else in the overlay takes colour.
- Stroke: in the logo and as a travelling x, stroke = `logoGeometry.stroke × scale`, butt caps, mitre joins. When it becomes a diagram (Framer's crop marks, Multiply's children) it thins (Framer to 2 px; Multiply by √scale per generation). Terminals stay flat.
- Accessibility: overlay is `aria-hidden` and `pointer-events: none`. `prefers-reduced-motion: reduce` removes travel (roles appear in place, instantly). Contrast rules in `lib/a11y` are untouched because the x is a non-text graphic on paper (dusk on paper #F6F1E5 is 2.46:1, below 3:1 for 1.4.11 — acceptable only because it carries no information; state this on the page. On dark paper it is 6.02:1).
- Next 14 App Router, client component. No test framework in the repo; checks are scripts run with `tsx` (see `scripts/a11y-check.ts`, `scripts/measure-logo-spacing.mjs`).

## Approaches

| | Approach | Trade-off |
|---|---|---|
| **A — picked** | **One x, four roles.** A single x per page changes role with what the reader does. | One coherent character, keeps the "one x" rule. Costs a small role resolver and tuning of handovers. |
| B | Four separate components, one per page. | Simplest, but the x never changes role mid-page and reads as four mascots. |
| C | Document only: a style-guide page with demos and rules, no reusable component. | Cheapest and good for review, but the website cannot use it. |

Gurden picked A. C's write-up is included in A (the style-guide page).

## Design

### The one x

`<XOperator logoRef={…} />`, mounted once per page. It draws in a fixed full-viewport SVG overlay above content, in page coordinates translated by scroll. The page's logo draws only C and O; the docked x is the overlay's x, placed with `readDock()` (from the sketch) so it is pixel-exact. When the x is away, the logo reads "CO" — the operator is out working. That is intended.

### Roles

| Role | Operator | Trigger | Behaviour |
|---|---|---|---|
| **Home** | — | Default; scroll ≤ 80 px or nothing else applies. | Docked in the logo, exact geometry, locked to the sticky header. |
| **Keeper** | index | Scrolled past 80 px and the page has `[data-keep]` blocks. | Waits in the main column's left gutter beside the last `[data-keep]` block above the reading line (38% of viewport height). Moves only after the reader has stayed on one block for 320 ms. Leans into travel (≤ 35°), upright at rest. |
| **Framer** | isolate | Pointer over, or focus inside, a `[data-frame]` element. | Flies to it as an x, then unfolds its four arms into four crop marks around the element (8 px / 6 px padding). Lingers 500 ms after leave. Folds back to an x before going anywhere else. |
| **Multiply** | scale | Pointer over, or focus inside, a `[data-expand]` element, and the page has a `[data-expand-stage]`. | Moves into the stage, scales to fill it (keeping 36 px clear for the caption), then each arm tip opens a half-size x, three generations (1, 4, 16, 64). Recombines in place, then leaves. |
| **Crawler** | connect | Only when invited (see below). | Walks on its four arm tips, diagonal pairs stepping in turn, trailing a fading dotted guide line (2.6 s). Follows the pointer at a 40 px distance, or walks to the focused element for keyboard users. After 2.4 s idle it walks home and its feet settle onto the exact geometry. |

**Priority**, highest first: Multiply → Framer → Crawler → Keeper → Home.

**Handover rule.** The x always returns to its plain x shape before taking a new role: Framer folds, Multiply recombines, Crawler's feet settle. Then it travels as a plain x. This one rule keeps every transition legible.

**After a role ends**, the x goes to whatever the next applicable role is — usually back to the Keeper's margin spot while reading, not all the way home.

### Inviting the Crawler

The Crawler never starts by itself. `XOperator` takes an `invited` flag (how it is exposed is the builder's call). On the demo, "Let it walk" is a toggle (`aria-pressed`), off by default. While on, the Crawler follows the pointer or walks to the focused element; after 2.4 s idle it walks to whatever the next role says (the Keeper's spot while reading, otherwise home) and starts walking again when the pointer moves or focus changes. Switching it off ends the role the same way. Disabled under reduced motion, with a one-line note. (A 404 page or first-visit moment is a follow-up.)

### Page contract

Pages opt in with data attributes only:

- `data-keep` — a passage the Keeper can sit beside (headings, paragraphs, list items, figures).
- `data-frame` — something worth isolating (status tags, version tags, key terms, figures).
- `data-expand` — the hero word that triggers Multiply. `data-expand-stage` — the figure space it expands into.
- `id="main"` with left padding — the Keeper's gutter is derived from it.

### Narrow screens

Under 640 px wide there is no margin: the Keeper stays docked. Framer and Multiply work on tap. The Crawler walks to tapped points.

### Where things live

- `lib/x-operator.ts` — pure functions: arm tips, `xPath`, crop-mark interpolation, the role resolver (inputs: scroll, hovered/focused element kinds, invited flag, viewport width, reduced motion → role).
- `components/xco/XOperator.tsx` — the client component and its per-role motion. Export from `components/xco/index.ts`.
- `app/(system)/logo/x/page.tsx` — "The x as operator", inside the normal style-guide layout, reached from the Logo page and from Grammar → Operators. Contents: what the x is and why it may leave the mark; the rules (the anti-goals above, written as rules in the plain register); one short section per role naming its operator, each with a static figure (e.g. the crop marks, the 1/4/16/64 tree); a prominent link to the live demo. The nav logo here is unchanged; no live x runs on this page.
- `app/x-demo/page.tsx` — the live demo, a full-screen mock website outside the route groups (as `app/x-sketches` is today). It owns its sticky header with a 40 px C+O logo, its own `main#main` with left padding for the Keeper's gutter, and one `XOperator` running all four roles. Window-scoped, like the sketch; timings and distances stay tuned to the 40 px logo. `noindex`, plus a link back to `/logo/x`.
- `scripts/x-operator-check.ts` + `npm run x:check` — assert-based check of the role resolver's priority and of "at rest = exact logo x" geometry.
- `lib/provisional.ts` — new record **CH-08 "The x may leave the mark"**, status `proposed`, proposed by Gurden, 2026-11-16, target `/logo`. Previous: the misuse rules ("Don't reflow it… never re-space, stack, or reorder the glyphs"). Proposed: the x may leave the mark as operator, under the rules on `/logo/x`. Shown as provisional on the Logo page next to the misuse rules, per the convention.
- Commit `app/x-sketches/` first so the sketch stays in history, then delete it once the demo replaces it.

## Calls made without asking (check these)

- The live x runs on its own full-screen demo route (`/x-demo`), not on the style-guide page itself, so the shared layout and nav logo stay untouched.
- The "one x" rule counts live x's only; static figures of the roles are allowed.
- The Crawler invitation is an on/off toggle, not a one-off walk.
- Under 640 px the Keeper stays docked.
- The explainer page lives at `/logo/x`, under Logo, because the x is part of the mark.
- CH-08 goes in as `proposed`, so the logo rules stay current until someone adopts it by name.
- The x is not wired into other style-guide pages yet.

## What is left to the builder

- Spring constants, timings and distances beyond those stated (they were tuned only roughly, in a hidden browser pane).
- How `XOperator` exposes the Crawler invitation.
- File split inside the component, and exact page copy (plain register, tentative tone).
- Demo content on the page (the sketch's mock-site content is a fine start).
