# The x as operator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the logotype's x leave the mark as one page character with four roles (Keeper, Framer, Crawler, Multiply), with a live demo, a style-guide page of rules, and a proposed change record.

**Architecture:** Pure geometry and the role resolver live in `lib/x-operator.ts`, checked by an assert script. One client component, `XOperator`, runs a single `requestAnimationFrame` loop that resolves a role each frame and draws one x into a fixed SVG overlay. A full-screen demo route mounts it; a `(system)` page documents it with static figures drawn from the same pure functions.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind 4, SVG. No new dependencies. Checks run with `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-16-x-operator-design.md`. The working sketch this replaces is `app/x-sketches/XSketches.tsx`; lift its code where a step says so.

## Global Constraints

- x geometry only from `lib/logo.ts` (`logoGeometry`, `inkBounds`). Never redraw it by hand.
- The x is `var(--xco-dusk)`. Nothing else in the overlay takes colour.
- Travelling x stroke = `logoGeometry.stroke × k`; butt caps; mitre joins. Framer's crop marks thin to 2 px. Multiply generation *n* stroke = `logoGeometry.stroke × dock.k × √scale[n]`.
- Overlay: `aria-hidden`, `pointer-events: none`, fixed full-viewport, page coordinates translated by `(-scrollX, -scrollY)`.
- No face, no eyes. One live x per page. At rest the x is exactly the logo's x, docked.
- Nothing moves by itself for more than 5 s. The Crawler never starts unless invited.
- `prefers-reduced-motion: reduce`: no travel (positions and shapes jump to target), Crawler unavailable.
- Under 640 px viewport width the Keeper stays docked.
- Dusk on paper is 2.46:1 (on dark paper 6.02:1). The x must never carry information the page does not.
- Page copy: plain register, tentative tone. No new dependencies.
- Commit messages `<type>: <description>`, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Hero word with both `data-expand` and `data-frame`.** Expect Multiply, never the crop marks. *(Task 1 assert.)*
2. **Window resize or font swap while the x is away.** Expect the docked x and the Keeper's gutter to follow the new layout on the next frame, with no stale offset. *(Task 2 browser step.)*
3. **Pointer darting between two frame targets, or role changing mid-fold.** Expect the x to finish folding to a plain x, then travel. Never crop marks stretched between two targets. *(Task 2 browser step.)*
4. **Tab hidden then shown mid-travel.** Expect no fling: the clamped `dt` resumes the motion where it was. *(Task 2 browser step.)*
5. **Dark mode.** Expect the C and O to flip to paper ink and the x to stay dusk, readable on dark paper. *(Task 2 browser step.)*

---

### Task 1: Pure geometry and the role resolver

**Files:**
- Create: `lib/x-operator.ts`
- Create: `scripts/x-operator-check.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Consumes: `logoGeometry`, `inkBounds`, `xPaths` from `lib/logo.ts`.
- Produces (all exported from `lib/x-operator.ts`):
  - `type Vec = { x: number; y: number }`, `type Dock = Vec & { k: number }`
  - `type Role = "home" | "keeper" | "framer" | "crawler" | "multiply"`
  - `interface RoleInputs { scrollY: number; viewportWidth: number; reduceMotion: boolean; hasKeepBlocks: boolean; hasExpandStage: boolean; overExpand: boolean; overFrame: boolean; crawlerInvited: boolean; crawlerIdle: boolean }`
  - `X_CENTRE: Vec` (the x's centre in logo units), `TIP: Vec` (half-width, half-height), `ARMS` (TL, TR, BR, BL as `[sx, sy]`), `PAIRS = [[0, 2], [1, 3]]`, `INK_W`, `INK_H`
  - Constants: `KEEPER_SCROLL = 80`, `NARROW_PX = 640`, `READING_LINE = 0.38`, `KEEPER_SETTLE_MS = 320`, `MAX_LEAN = 35`, `FRAME_PAD = { x: 8, y: 6 }`, `FRAME_OPEN_WITHIN = 24`, `FRAME_LINGER_MS = 500`, `EXPAND_LINGER_MS = 450`, `CAPTION_CLEAR = 36`, `GENS = 3`, `CRAWL_IDLE_MS = 2400`, `CRAWL_KEEP_OFF = 40`, `CRAWL_MAX_SPEED = 170`, `CRAWL_K = 0.62`, `STEP_MS = 90`, `TRAIL_MS = 2600`
  - `tip(i: number, k: number, deg?: number): Vec`
  - `xPath(c: Vec, k: number, deg?: number): string` — four arms from the centre, as in the sketch
  - `dockFromRect(rect: { left: number; top: number; height: number }, scroll: Vec): Dock`
  - `cropMarksPath(c: Vec, k: number, half: Vec, open: number): string` — `open` 0 is the plain x, 1 is four L-shaped crop marks at `c ± half`
  - `multiplyScales(growth: number): number[]` — length `GENS + 1`
  - `multiplyFillK(stage: { w: number; h: number }): number`
  - `resolveRole(i: RoleInputs): Role`

- [ ] **Step 1: Commit the sketch and the spec, so the sketch stays in history**

```bash
git add app/x-sketches docs/superpowers/specs/2026-11-16-x-operator-design.md docs/superpowers/plans/2026-11-16-x-operator.md
git commit -m "docs: x-operator sketches, design and plan"
```

- [ ] **Step 2: Write the failing check `scripts/x-operator-check.ts`**

Use `node:assert/strict`. Build a base input `B` with `scrollY: 0, viewportWidth: 1280, reduceMotion: false, hasKeepBlocks: true, hasExpandStage: true`, every boolean trigger `false`. Assertions:

```ts
eq(resolveRole(B), "home");
eq(resolveRole({ ...B, scrollY: 81 }), "keeper");
eq(resolveRole({ ...B, scrollY: 80 }), "home");                                  // threshold is "past 80"
eq(resolveRole({ ...B, scrollY: 500, viewportWidth: 639 }), "home");             // narrow: Keeper stays docked
eq(resolveRole({ ...B, scrollY: 500, hasKeepBlocks: false }), "home");
eq(resolveRole({ ...B, overFrame: true }), "framer");
eq(resolveRole({ ...B, overExpand: true, overFrame: true }), "multiply");        // Review Focus 1
eq(resolveRole({ ...B, overExpand: true, hasExpandStage: false }), "home");
eq(resolveRole({ ...B, overExpand: true, overFrame: true, hasExpandStage: false }), "framer");
eq(resolveRole({ ...B, crawlerInvited: true }), "crawler");
eq(resolveRole({ ...B, crawlerInvited: true, overFrame: true }), "framer");
eq(resolveRole({ ...B, crawlerInvited: true, reduceMotion: true }), "home");
eq(resolveRole({ ...B, crawlerInvited: true, crawlerIdle: true, scrollY: 500 }), "keeper");

// At rest the overlay x is exactly the logo's x: a 40 px-tall logo at (24, 16), scrolled by (0, 500).
const k = 40 / INK_H;
const d = dockFromRect({ left: 24, top: 16, height: 40 }, { x: 0, y: 500 });
// Every endpoint of xPath(d, k) equals the matching endpoint of lib/logo xPaths(),
// mapped by p => (24 + (p.x - inkBounds.left) * k, 16 + 500 + (p.y - inkBounds.top) * k), within 0.01.

// Crop marks: open 0 puts every arm's three points on the line centre→tip; open 1 puts each corner at c ± half.
// multiplyScales(0) deep-equals [1, 0, 0, 0]; multiplyScales(3) deep-equals [1, 0.5, 0.25, 0.125].
// multiplyFillK({ w: 280, h: 280 }) === (280 - 36) / (2 * 1.875 * TIP.y * 1.1).
console.log("x-operator: all checks passed");
```

Parse endpoints from the path strings with one regex over `M`/`L` pairs.

- [ ] **Step 3: Add `"x:check": "tsx scripts/x-operator-check.ts"` to `package.json` scripts and run it**

Run: `npm run x:check`
Expected: FAIL, cannot resolve `@/lib/x-operator`.

- [ ] **Step 4: Implement `lib/x-operator.ts`**

Lift `tip`, `xPath`, the dock maths and the crop-mark interpolation from `app/x-sketches/XSketches.tsx` (`readDock`, `Framer`). `resolveRole` priority, highest first: Multiply (`overExpand && hasExpandStage`) → Framer (`overFrame`) → Crawler (`crawlerInvited && !reduceMotion && !crawlerIdle`) → Keeper (`scrollY > KEEPER_SCROLL && hasKeepBlocks && viewportWidth >= NARROW_PX`) → Home. `multiplyScales`: `scale[0] = 1`, `scale[n] = scale[n-1] × 0.5 × ease(clamp(growth − (n−1), 0, 1))`, with the sketch's `ease`. `multiplyFillK` uses `min(w, h − CAPTION_CLEAR)`. Crop marks use `L = min(14, half.x, half.y)`, exactly as the sketch draws them.

- [ ] **Step 5: Run the check**

Run: `npm run x:check`
Expected: `x-operator: all checks passed`

- [ ] **Step 6: Commit**

```bash
git add lib/x-operator.ts scripts/x-operator-check.ts package.json
git commit -m "feat: x-operator geometry and role resolver"
```

---

### Task 2: `XOperator` and the live demo

**Files:**
- Create: `components/xco/XOperator.tsx`
- Modify: `components/xco/index.ts` (export `XOperator`)
- Create: `app/x-demo/page.tsx`, `app/x-demo/XDemo.tsx`
- Delete: `app/x-sketches/`

**Interfaces:**
- Consumes: everything Task 1 produces.
- Produces: `XOperator({ logoRef, crawlerInvited }: { logoRef: RefObject<SVGSVGElement>; crawlerInvited: boolean }): JSX.Element`, a client component, and `useReducedMotion(): boolean` exported from the same file (the demo needs it to disable "Let it walk"). The page must render its logo with C and O only (draw `cPath()`/`oPath()` in a viewBox cropped to `inkBounds`), and give `main#main` a left padding for the gutter.

- [ ] **Step 1: Implement `XOperator` as one loop**

Lift the overlay, `loop` (with the 1/30 s `dt` clamp), `spring`, `useReducedMotion` and each role's motion from the sketch. State held in the loop: body `{x, y, vx, vy}`, `k`, `role`, `open`, `half`, `growth`, `lean`, `feet[4]`, `trail`, and the Keeper's `pending/target block + since`. DOM listeners (`pointerover`, `focusin`, `pointermove`, `pointerleave` on `documentElement`) only record what is hovered or focused and when, applying `FRAME_LINGER_MS` / `EXPAND_LINGER_MS` on leave. Each frame:

```
dock = dockFromRect(logo rect, scroll)
want = resolveRole(inputs from DOM + listeners + crawlerInvited prop)
plain = open < 0.01 && growth < 0.01 && every foot planted within 0.3 px of its rest
if want ≠ role:
  if plain: role = want            // handover rule
  else: hold position; drive open → 0, growth → 0, feet → rest (pairs step in turn)
move toward role's target:
  home     dock, k = dock.k; lock exactly to dock once within 0.5 px and < 4 px/s
  keeper   gutter = main#main left + padding-left − 44 (min 18); y = mid first line of
           the last [data-keep] above READING_LINE; change block only after KEEPER_SETTLE_MS;
           lean = clamp(vy × 0.05, ±MAX_LEAN); lock once settled (moves rigidly with the page)
  framer   centre of the hovered/focused [data-frame]; open → 1 once within FRAME_OPEN_WITHIN,
           half → rect/2 + FRAME_PAD
  multiply centre of [data-expand-stage] shifted up by CAPTION_CLEAR/2; k → multiplyFillK;
           growth → GENS once within 6 px (rate +1.6/s, −3/s)
  crawler  walk (not spring) toward pointer at CRAWL_KEEP_OFF, or to the focused element if focus
           moved last; speed min(CRAWL_MAX_SPEED, (d − keepOff) × 4);
           k = lerp(dock.k, max(dock.k, CRAWL_K), clamp(dist to dock / 90, 0, 1)); feet step in
           diagonal pairs over STEP_MS with 0.1 s velocity lead; trail drops points older than TRAIL_MS
reduced motion: skip travel; set position and shape to their targets
draw one main path (xPath with lean | cropMarksPath | legs body→feet) + Multiply gens 1..3 + trail
```

`crawlerIdle` = no pointer move or focus change for `CRAWL_IDLE_MS`, or pointer outside the window.

- [ ] **Step 2: Build the demo route**

`app/x-demo/page.tsx`: metadata `title: "The x, live — xCO"`, `robots: { index: false, follow: false }`; renders `<XDemo />`. `app/x-demo/XDemo.tsx`: move the sketch's `Site` (header, hero with `data-expand` + `data-frame` on "Optionality", `data-expand-stage` figure, propositions, figure, notes) unchanged, mount one `<XOperator>`, and replace the four-way switcher with a bottom bar holding:
- a toggle button "Let it walk", `aria-pressed`, off by default; disabled under reduced motion, with the note "Reduced motion is on: the x appears in place and does not walk."
- one line per role: "Scroll — Keeper (index) · Point at a tag or figure — Framer (isolate) · Point at Optionality — Multiply (scale) · Let it walk — Crawler (connect)"
- a link "← The x as operator" to `/logo/x`.

Then delete `app/x-sketches/`.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p . 2>&1 | grep -E "x-operator|XOperator|x-demo"`
Expected: no output.

- [ ] **Step 4: Verify each role in the browser** (`preview_start` "next-dev", open `/x-demo`; show the pane so rAF runs at full rate)

Expected, each confirmed by a screenshot:
- Load: the x sits in the logo; zoom shows "xCO" with the x exactly placed.
- Scroll past the hero: x in the gutter beside the passage under the reading line; back at the top it docks.
- Hover `[TESTING]`: crop marks around it. Hover the figure, then a tag, quickly: the x folds to a plain x between them (Review Focus 3).
- Hover "Optionality": Multiply in the stage, caption clear; no crop marks (Review Focus 1).
- Toggle "Let it walk", move the pointer: the x walks with a dotted trail; idle 2.4 s: it returns to the Keeper spot or the logo with exact geometry. Toggle off mid-walk: feet settle, then it leaves.
- Resize the window from 1280 to 900 px wide while the x is in the gutter: it follows the new gutter on the next frame (Review Focus 2).
- Switch to another tab mid-travel and back: no jump across the page (Review Focus 4).
- Dark mode (`resize_window colorScheme: "dark"`): C and O in paper ink, x in dusk (Review Focus 5).
- 375 px wide: the Keeper stays docked; no sideways scroll (`scrollWidth === innerWidth`).
- `read_console_messages onlyErrors`: none.

- [ ] **Step 5: Commit**

```bash
git add components/xco/XOperator.tsx components/xco/index.ts app/x-demo
git rm -r app/x-sketches
git commit -m "feat: XOperator — one x, four roles — with live demo"
```

---

### Task 3: "The x as operator" page, links and CH-08

**Files:**
- Create: `app/(system)/logo/x/page.tsx`, `app/(system)/logo/x/RoleFigure.tsx`
- Modify: `lib/provisional.ts` (new record at the top of `changeLog`)
- Modify: `app/(system)/logo/page.tsx` (link from the x paragraph; compact CH-08 under Misuse)
- Modify: `app/(system)/grammar/operators/page.tsx` (link from the intro section)

**Interfaces:**
- Consumes: `xPath`, `cropMarksPath`, `multiplyScales`, `tip`, `ARMS`, `TIP` from Task 1; `ProvisionalChange` from `components/xco`.
- Produces: `RoleFigure({ role }: { role: "keeper" | "framer" | "crawler" | "multiply" })`, a server component: a 240 × 160 static SVG on `var(--xco-paper-quiet)`, `role="img"` with an `aria-label` describing the pose.

- [ ] **Step 1: Add CH-08 to the top of `changeLog`**

```ts
{
  id: "CH-08",
  title: "The x may leave the mark",
  target: "Logo / Misuse",
  href: "/logo/x",
  status: "proposed",
  proposedBy: "Gurden",
  date: "2026-11-16",
  why: "The x is the operator in the logotype. On the website it can act on the page — keep the reader's place, frame, walk and expand — under fixed rules.",
  previous: "Don't reflow it. Never re-space, stack, or reorder the glyphs.",
  proposed: "The x may leave the mark as operator, under the rules on /logo/x. At rest it is always the logo's x, in place.",
  decision: "Waiting for a named adopter.",
},
```

- [ ] **Step 2: Write `RoleFigure`**

Poses: **keeper** — five grey text bars (`var(--xco-paper-structural)`) with the x in the left gutter beside the second; **framer** — a short bar with `cropMarksPath(…, open 1)` around it; **crawler** — legs from a body to four offset feet plus a dotted trail (`1.5px`, `"2 5"`, opacity 0.55); **multiply** — `multiplyScales(3)` tree centred. Strokes follow Global Constraints.

- [ ] **Step 3: Write `/logo/x`**

Same shell and type classes as `app/(system)/logo/page.tsx` (`doc-wrap`, the mono section labels, 24 px body). Sections, in order:
1. Back link "← Logo", title "The x as operator", and `<ProvisionalChange change={CH-08} />` (full form, since this page is the proposal).
2. Intro, three short paragraphs: the x is already the operator acting on C and O; on the website it can leave the mark and act on the page; it has no face, and shows character only through how it moves.
3. **Rules**, numbered, exact copy:
   - 01 The x has no face. It shows character only through how it moves.
   - 02 One live x on a page. Multiply's children are that x expanding, and they recombine.
   - 03 At rest the x is the logo's x: same geometry, same place, same scale.
   - 04 The x adds nothing the page does not already say. Never use it to carry meaning alone.
   - 05 The x moves only in response to the reader. Nothing starts by itself or runs longer than five seconds.
   - 06 Before it takes a new role, the x returns to a plain x.
   - 07 Only the x carries dusk. As a diagram it thins; its terminals stay flat.
   - 08 With reduced motion the x appears in place and does not travel. The Crawler is off.
4. **Four roles**: one block each with name, operator, trigger, one sentence of behaviour (from the spec's role table), and its `RoleFigure`.
5. A prominent link "Open the live demo →" to `/x-demo`.
6. Note, mono `[rule]` style: "Dusk on paper is 2.46:1, below the 3:1 a meaningful graphic needs. That is why rule 04 exists."

- [ ] **Step 4: Link it in**

Logo page: append to the paragraph that begins "The lowercase x is the operator…" a link "See the x as operator →" to `/logo/x`; below the Misuse grid render `<ProvisionalChange change={changeLog.find((c) => c.id === "CH-08")!} compact />`. Operators page: in the intro section add a mono line "[see] The logo's x performs four of these on a page — index, isolate, connect, scale. → The x as operator" linking `/logo/x`.

- [ ] **Step 5: Verify**

Run: `npm run a11y && npm run x:check && npx tsc --noEmit -p . 2>&1 | grep -E "logo/x|provisional|operators"`
Expected: a11y gate passes, `x-operator: all checks passed`, no type output.
Browser: `/logo/x` shows the provisional CH-08 block, eight rules, four figures, and the demo link works; `/logo` shows the new link and the compact CH-08 under Misuse; `/changes` lists CH-08 as open; `/grammar/operators` link works; no console errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(system)/logo" "app/(system)/grammar/operators/page.tsx" lib/provisional.ts
git commit -m "feat: The x as operator page, CH-08 proposed"
```

---

### Task 4: Whole-branch check

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build succeeds (prebuild runs the a11y gate); `/x-demo` and `/logo/x` appear in the route list.

- [ ] **Step 2: Reduced motion pass**

The browser pane cannot emulate reduced motion, so temporarily make `useReducedMotion` return `true`, reload `/x-demo`, and check: roles appear in place with no travel; "Let it walk" is disabled with its note. Then revert the change and confirm `git diff components/xco/XOperator.tsx` is empty.

- [ ] **Step 3: Confirm nothing stray is left**

Run: `git status --short` and `grep -rn "x-sketches" app components lib docs`
Expected: clean tree; the only mentions are in the spec and this plan.
