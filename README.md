# xCO Living Style Guide

**Expanding Civilisational Optionality — Dark Matter Labs**

A living design system and asset-generation app. Two jobs: document the visual grammar, and let the team produce work from it. The site is the system.

Live: **https://xco-style-guide.vercel.app**

---

## What's built — Phase 1

### Design system (`/system`)

| Page | Path | Status |
|------|------|--------|
| Typography | `/typography` | ✓ live |
| Colour | `/colour` | ✓ live |
| Grid | `/grid` | [wip] stub |
| Diagrammatic Grammar | `/diagrams` | ✓ live |
| Tone of Voice | `/tone` | ✓ live |
| Components | `/components` | [wip] stub |

### Asset generators (`/generators`)

| Generator | Path | Status |
|-----------|------|--------|
| Three Regimes | `/three-regimes` | ✓ live |
| Portfolio Diagram | `/portfolio-diagram` | [phase 2] |
| Social Card | `/social-card` | [phase 2] |

### Token system

All design decisions live in two files that must be kept in sync:

- `lib/design-tokens.ts` — TypeScript source of truth. Consumed by diagram primitives, export API, and prompt templates.
- `app/globals.css` — Tailwind v4 `@theme` block. Derives all `bg-xco-*`, `text-xco-*`, `font-*` utility classes.

Six colour tokens: `xco-paper`, `xco-ink`, `xco-ink-muted`, `xco-ember`, `xco-cool`, `xco-flag`. If you think you need a seventh, you probably need an opacity stop.

Four typefaces: Crimson Pro (display + body), Inter (UI), DM Mono (mono/annotation). Two weights per face maximum. Crimson Pro is a placeholder — the system is built for a one-variable swap when the commissioned face is ready.

### Diagram primitives (`lib/diagram-primitives/`)

Seven composable SVG React components:

```
JitteredLine      — primary (1.5px) and annotation (0.5px dashed)
RiskNode          — ember fill, paper text
OptionNode        — paper fill, ink stroke (default)
FieldNode         — paper fill, cool stroke, dashed border
MultiSolveTicks   — stacked taper ticks (1–6)
ScaleRule         — faint rule + DM Mono margin label
Annotation        — DM Mono italic marginalia, word-wrapped
```

Jitter uses a seeded LCG so server and client render identically. Default amplitude: 1.8. Adjustable on `/diagrams`.

### Three Regimes generator (`/three-regimes`)

Inputs: node labels (Frontier / Fortress / Field), relationship statement, caption, annotation toggle, jitter amplitude.

Exports:
- SVG hero (1200×630) — embedded Google Fonts @import, detachable
- PNG hero (1200×630) — canvas rasterisation, system font fallback
- SVG square (1200×1200)
- PNG square (1200×1200)
- SVG mark (400×200) — geometric only, no labels

### Tone of voice (`/tone`)

Three registers: Method (A), Hunch (B), Annotation (C). Each has: rule, two example pairs (✓/✗), copyable Claude/ChatGPT prompt template.

Linter: paste draft text → banned words flagged inline in ember, register classified by heuristic scoring, confidence reported.

Banned words enforced in linter and documented in `lib/design-tokens.ts`:
`transformative`, `unprecedented`, `regenerative` [adj], `holistic`, `paradigm`, `ecosystem` [metaphor], `unlock`, `leverage`, `empower`, `journey`, `space` [idiom]

### WIP marker (`components/WIP.tsx`)

`<WIP variant="v0.1" />` / `"draft"` / `"inference"` / `"unverified"` / `"speculation"`. Mustard background, DM Mono text. Used throughout the system — first-class visual treatment, not an embarrassment.

---

## Open questions

These are unresolved. They need team input, not unilateral decisions.

**1. Jitter amplitude.** Default is 1.8. The `/diagrams` page has a live slider so the team can argue about it. Too little reads as a rendering bug; too much reads as decorative. We need to pick a canonical value and document why.

**2. Dark mode as primary or secondary.** Currently dark mode is wired (paper ↔ ink swap) but the system treats it as strictly secondary: terminal output, code blocks, embedded media only. Is that the right call? Or does xCO content ever live on a dark surface as the hero?

**3. Relationship to `dm-civ` and `eco` repos.** The style guide is a standalone app at a separate Vercel URL. The team's working repos are elsewhere. Decision needed: does this become the canonical design system that those repos import from (npm package or submodule), or do they stay disconnected and the team manually syncs tokens?

**4. Decisions log visibility.** The `/decisions` route is stubbed for Phase 2. But the question is whether it's public-facing (reading-as-method, brand-as-learning) or team-only. Affects whether it needs auth and what it can say.

**5. The WIP threshold.** At what point does a page or token graduate out of `[v0.1]`? Without a defined threshold, everything stays marked provisional forever and the marker loses meaning. Proposed: a page ships without WIP when it has been used to produce one real asset that the team has published.

**6. PNG export font fidelity.** Currently PNG export rasterises via canvas, which can't load cross-origin fonts at export time. The result uses system fonts. Options: (a) accept it and note it in the UI [current]; (b) add `sharp` or a server-side SVG-to-PNG route; (c) use `@vercel/og` with Satori for the hero format. (b) and (c) require a dependency decision.

**7. Crimson Pro swap timing.** Martin wants to commission a more distinctive display serif. When that happens, the swap is one variable in `globals.css` (`--font-display`) and one update to `next/font` in `layout.tsx`. Nothing else changes. The question is when, not how.

---

## Phase 2 — what comes next

After the team has used Phase 1 for at least one real publication (Robyn's substack), Phase 2 should address:

**Portfolio diagram generator** (`/portfolio-diagram`)
The scale-shift diagram — macro → bioregional → urban → neighbourhood. Madrid as the worked example. Requires `ScaleRule` and multi-node layouts already in the primitive library. The generator needs a way to add/remove nodes and connect them with labelled edges.

**Image treatment generator** (`/image-treatment`)
Martin's evolving-resolution primitive: an image that resolves from low-resolution dot-matrix toward a sharp icon. Used as substack hero placeholders and post covers. Implements "evolutionary style" — the asset evolves into clarity. Not started; no dependencies yet identified.

**Paper cover generator** (`/paper-cover`)
Cover images for xCO papers and briefings. Needs: paper number, title, date, optional subtitle. Output: A4 portrait PDF-ready SVG + web-optimised PNG.

**Social card generator** (`/social-card`)
Stubbed. LinkedIn and Substack thumbnail format. Likely re-uses the Three Regimes layout with a different template.

**Decisions log** (`/decisions`)
Supabase-backed. Records: what changed, when, who decided, why. Considers: singular accountability → one field for the decision-holder per entry, visible to the team. Visibility question still open (see above).

**Claude-mediated text draft generation** (`/api/generate`)
An API route that takes a brief and a register (A/B/C), sends it to Claude with the appropriate prompt template from `lib/tone-templates.ts`, and returns a draft. Requires Anthropic API key in Vercel env. No hallucinated facts — the caller must supply the factual grounding.

---

## Stack

```
Next.js 14          App Router, TypeScript
Tailwind v4         CSS-native @theme, no tailwind.config
shadcn/ui           Base UI variant
Vercel              Deployment target (gurdens-projects/xco-style-guide)
```

No Supabase yet — Phase 2 (decisions log, generated-asset table).

**Before adding any dependency**, surface it here as a question. The stack is deliberately minimal.

---

## Local development

```bash
bun install
bun dev        # http://localhost:3000
bun build      # production build check
```

Fonts load from Google Fonts. Exported SVGs reference Google Fonts CDN — they render correctly in browsers with internet access; they fall back to system fonts offline.
