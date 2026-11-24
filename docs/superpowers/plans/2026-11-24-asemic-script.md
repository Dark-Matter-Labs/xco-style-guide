# The xCO asemic script — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An `/asemic` generator that writes xCO text as an asemic script (mirrored clusters on dotted threads, built from the logotype's parts), released as the proposed change CH-10.

**Architecture:** A pure, deterministic module `lib/asemic` turns text, a seed and options into a list of marks and an SVG string, checked by an assert script. A client page in `app/(generators)/asemic` renders the SVG and exports it (SVG, PNG through `/api/export/png`). CH-10 goes into `lib/provisional.ts`; the existing `ProvisionalChange` component shows it on `/asemic` and `/logo`.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind 4, SVG. No new dependencies. Checks run with `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-24-asemic-script-design.md`. The approved rough sketch is `scratchpad/asemic/sketch2.html` (outside the repo). Its constants are copied into the spec; where the spec and the sketch differ, the spec wins.

## Global Constraints

- Branch: `claude/asemic-script`, from `origin/main`.
- Grid unit **U = rowHeight / 13**. Cluster lattice step **S = 1.4 U**. Cluster half-height in lattice steps is **h = min(A, round(env + jitter))**, with **A ∈ {2, 3, 4}**. Together these keep every mark inside its own row.
- Colours: ink `#101F24`, paper `#F6F1E5`, dusk `#F47743`. Dusk is used **only** by x marks, in both registers.
- Thread: dotted is dash 0.35 U, gap 0.55 U, stroke 0.18 U. Solid is stroke 0.2 U.
- Marks: squares are 0.82 U. Dashes are 1.6 U, stroke 0.22 U. Boxes are 2.4 × 1.4 U, stroke 0.25 U. O and C are r 0.8 U, stroke 0.3 U, and the C has a **100° opening facing right**. The x uses the logotype's proportions (56 : 62), half-width 0.7 U, stroke 0.3 U, and **opens the solid thread for 1.6 U** under it.
- Bead mix: box 30%, O 28%, C 26%, square 9%, x 7%. Mark mix in clusters: square 74%, dash 26%. Hatching appears in 50% of clusters, as a run of 3 to 8 columns, with dashes every 0.62 U, reaching ±2h.
- Seeding: each token's randomness is `rng(hash(seed + "|" + tokenIndex + "|" + token))`, using the same LCG and FNV hash as `lib/holiday-card/pattern.ts`. Never key a mark on a letter alone.
- Density presets: Sparse [0.35, 0.55], Normal [0.45, 0.8], Dense [0.65, 0.92].
- The page's description and exports state: "Generated and expressive; it encodes no data."
- Copy: the plain register. Rules and the CH-10 record use the exact text in the spec.
- Commit messages are `<type>: <description>` and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Empty or punctuation-only text** (someone clears the box, or types `...`). Expect an empty sheet with a short note saying to add text, not a crash and not a sheet of dots. *(Task 1 assert + Task 2 step.)*
2. **One very long word** (a URL, `institutional-infrastructure-transitions`). Expect the cluster to be capped at the row width and the writing to continue on the next row, with nothing outside the margins. *(Task 1 assert.)*
3. **Accented and non-Latin names in your own text** (`Søren`, `Zoë`). Expect them to become clusters like any word, not to be dropped. *(Task 1 assert.)*
4. **Ink register export.** Expect the SVG to carry its own paper-on-ink background and a dusk x that stays visible, so the PNG isn't transparent-on-dark. *(Task 1 assert.)*
5. **Changing several controls quickly.** Expect the preview to show the latest settings, with no stale sheet exported under a new name. *(Task 2 step: the export reads the same memoised sheet the preview shows.)*

---

### Task 1: The script, `lib/asemic`

**Files:**
- Create: `lib/asemic/script.ts`, `lib/asemic/sources.ts`
- Create: `scripts/asemic-check.ts`
- Modify: `package.json` (add `"asemic:check": "tsx scripts/asemic-check.ts"`)

**Interfaces:**
- Produces, from `lib/asemic/script.ts`:
  ```ts
  export type Register = "paper" | "ink";
  type Base = { row: number; token: number };
  export type Mark = Base & (
    | { kind: "thread"; x1: number; x2: number; y: number; dotted: boolean }
    | { kind: "square"; x: number; y: number; size: number }       // centre
    | { kind: "dash"; x: number; y: number; w: number }            // left end
    | { kind: "box"; x: number; y: number; w: number; h: number }  // centre
    | { kind: "ring"; x: number; y: number; r: number; open: boolean }
    | { kind: "x"; x: number; y: number; k: number });
  export interface SheetOptions { width: number; height: number; margin: number; rows: number; seed: string; density: readonly [number, number] }
  export interface Sheet { width: number; height: number; margin: number; rows: number; rowHeight: number; unit: number; marks: Mark[]; lines: string[] }
  export const INK = "#101F24", PAPER = "#F6F1E5", DUSK = "#F47743";
  export const DENSITY = { sparse: [0.35, 0.55], normal: [0.45, 0.8], dense: [0.65, 0.92] } as const;
  export function tokenize(text: string): string[];   // words, ". , : ;", and "¶" after each line
  export function writeSheet(text: string, opts: SheetOptions): Sheet;
  export function toSvg(sheet: Sheet, register: Register, label: string, physical?: { w: string; h: string }): string;
  ```
- Produces, from `lib/asemic/sources.ts`: `export const SOURCES: { id: "tone" | "propositions" | "identity"; label: string; text: string }[]`. Its text is exactly as the spec's Page › Source lists, one sentence group per line.

- [ ] **Step 1: Create the branch**

```bash
git switch -c claude/asemic-script origin/main
```

- [ ] **Step 2: Write the failing check `scripts/asemic-check.ts`** (`node:assert/strict`; `eq: typeof assert.equal`)

```ts
const O = { width: 1000, height: 1000, margin: 70, rows: 20, seed: "7", density: DENSITY.normal };
const T = SOURCES[0].text;
// tokens
assert.deepEqual(tokenize("We, the field.\nNext"), ["We", ",", "the", "field", ".", "¶", "Next", "¶"]);
assert.deepEqual(tokenize("Søren and Zoë"), ["Søren", "and", "Zoë", "¶"]);                      // Review Focus 3
// determinism
eq(toSvg(writeSheet(T, O), "paper", "x"), toSvg(writeSheet(T, O), "paper", "x"));
assert.notEqual(toSvg(writeSheet(T, O), "paper", "x"), toSvg(writeSheet(T, { ...O, seed: "8" }), "paper", "x"));
// not a cipher: the same word at two positions gives different marks (compared relative to each cluster's start)
// writeSheet("option option", …): marks with token 0 vs token 1, each shifted by its own min x, are not deepEqual
// every mark inside the margins and inside its own row band [margin + row*rowHeight, margin + (row+1)*rowHeight]
// (check squares by centre ± size/2, rings by ± r, boxes by ± h/2, x by ± k*62/56, dashes and threads by their x extents)
// …for T, for "institutional-infrastructure-transitions ".repeat(6) (Review Focus 2), and for DENSITY.dense
// short words and punctuation make no solid thread; words over 3 letters make one
// "¶" makes a dotted thread
// the x opens the thread: no solid thread in the same row has x1 < x.x < x2
// only x uses dusk: in toSvg(..., "paper") and toSvg(..., "ink"), the count of `#F47743` equals the count of x marks
// the ink register paints its own ground: toSvg(…, "ink") contains a rect filling the sheet with INK      (Review Focus 4)
// empty text: writeSheet("", O).marks.length === 0 and writeSheet("...", O) has no clusters               (Review Focus 1)
// repetition fills the sheet: for T, the highest mark.row === O.rows - 1
// lines: sheet.lines.length === O.rows, and lines[0] starts with the first word of T
// the label is escaped: toSvg(sheet, "paper", "a <b> & c") contains "a &lt;b&gt; &amp; c" and no "<b>"
console.log("asemic: all checks passed");
```

- [ ] **Step 3: Run it to watch it fail**

Run: `npm run asemic:check`
Expected: FAIL, because `@/lib/asemic/script` can't be resolved.

- [ ] **Step 4: Implement `lib/asemic/sources.ts` and `lib/asemic/script.ts`**

Port `cluster`, `mark` and `write` from the sketch, with these changes:
- **The spec's values instead of the sketch's:** U = rowHeight / 13, the h clamp, the x weight and the thread opening.
- **Marks are data objects** (the `Mark` union) instead of SVG strings, and `toSvg` serialises them.
- **Long clusters:** cap a cluster's column count so it fits in the row width (Review Focus 2).
- **Repetition:** repeat the token stream until `rows` are filled, with the token index continuing so seeds stay fresh. If the text has no tokens, stop, so empty text can't loop forever.
- **`lines[row]`:** the source words that landed in each row.
- **The C:** draw it as an arc with the 100° opening facing right.
- **The x:** draw it as two strokes in the logotype's proportions.
- **`toSvg`:**
  - set `viewBox` to the sheet size, with `width` and `height` taken from `physical` when it's given;
  - include a `<title>` holding `label`, with `& < > "` escaped, since your own text reaches it;
  - paint a ground rect, `PAPER` for paper and `INK` for ink;
  - draw ink marks in `INK` on paper and in `PAPER` on ink;
  - draw x marks in `DUSK`.

- [ ] **Step 5: Run the check**

Run: `npm run asemic:check`
Expected: `asemic: all checks passed`

- [ ] **Step 6: Commit**

```bash
git add lib/asemic scripts/asemic-check.ts package.json docs/superpowers/specs/2026-11-24-asemic-script-design.md docs/superpowers/plans/2026-11-24-asemic-script.md
git commit -m "feat: asemic script — xCO text as mirrored clusters on dotted threads"
```

---

### Task 2: The `/asemic` generator page

**Files:**
- Create: `app/(generators)/asemic/page.tsx`, `app/(generators)/asemic/AsemicGenerator.tsx`
- Modify: `app/(generators)/layout.tsx` (nav: `{ href: "/asemic", label: "Asemic" }` after Chaos)

**Interfaces:**
- Consumes: `tokenize`, `writeSheet`, `toSvg`, `DENSITY`, `Register`, `Sheet` and `SOURCES` from Task 1. Also `Section`, `RadioList`, `TextField` (with `multiline`) and `Button` from `@/components/generator-controls`, and `download` from `@/lib/media/record-video`.
- Produces: `AsemicGenerator()`, a client component.

- [ ] **Step 1: Write `page.tsx`**

Use the same shell as `app/(generators)/chaos/page.tsx`: the h1 "Asemic", one paragraph and `WIP`. The paragraph says what it is: writing with no fixed meaning, grown from xCO's own sentences and built from the logotype's parts.

- [ ] **Step 2: Write `AsemicGenerator.tsx`**

**State:**
- `source`: `"tone" | "propositions" | "identity" | "own"`, default `"tone"`.
- `own`: a string.
- `seed`: a number, default 7.
- `rows`: 8 to 30, default 20, clamped.
- `density`: `"sparse" | "normal" | "dense"`, default `"normal"`.
- `format`: `"square" | "a4" | "social"`.
- `register`: `"paper" | "ink"`.
- `showSource`: a boolean.

**Formats:**
- Square sheet: 1000 × 1000, `physical: { w: "300mm", h: "300mm" }`.
- A4 portrait: 840 × 1188, `physical: { w: "210mm", h: "297mm" }`.
- Social 4:5: 1080 × 1350, with no physical size.

**Building the sheet:**
- `margin` = 7% of the shorter side.
- Compute `sheet` once with `useMemo`. Both the preview and every export use this same value (Review Focus 5).
- Render the preview with `dangerouslySetInnerHTML` from `toSvg`. It's generated by our own code from tokens, and every text token is escaped in `<title>`.

**Show the source:** when it's on, set each `sheet.lines[row]` as a muted overlay in Untitled Sans. It's positioned per row over the preview and is never part of the exported SVG.

**Labels:**
- Description and `aria-label`: `Asemic writing grown from ${sourceLabel}, seed ${seed}, ${rows} rows. Generated and expressive; it encodes no data.`
- File names: `xco-asemic-${source}-${seed}-${format}-${register}`.

**Export:**
- SVG: `download(new Blob([svg], { type: "image/svg+xml" }), name + ".svg")`.
- PNG: POST `{ svg, width, height }` to `/api/export/png`, as `PaperCoverGenerator.tsx` does, then download the result. If the response isn't OK, show "PNG export failed. Try again." in the page.

**Empty text:** when the text has no words, show "Add some text to write." in place of the preview, with export disabled (Review Focus 1).

**The rules panel:** a `Section` titled "Rules", holding the spec's five rules word for word.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p . 2>&1 | grep -E "asemic"`
Expected: no output.

- [ ] **Step 4: Build and audit**

Run: `npm run build && npm run a11y:audit -- --only=/asemic`
Expected: the build passes and lists `/asemic`, and the audit reports "clean in both registers".

- [ ] **Step 5: Check it in headless Chromium**

Bundle `AsemicGenerator` into a scratch page with esbuild, outside the repo, as was done for the holiday cards: React from `node_modules`, the Tailwind play CDN, and the real fonts by `file://` path. Then drive it with Playwright. It checks that:
- the preview SVG has more than 200 marks;
- "↻ Write it again" changes the SVG;
- clearing your own text shows "Add some text to write.";
- the downloaded SVG is the same as the preview's.

Expected: all four pass, with no console errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(generators)/asemic" "app/(generators)/layout.tsx"
git commit -m "feat: /asemic generator — write xCO text as asemic sheets, export SVG and PNG"
```

---

### Task 3: CH-10, proposed

**Files:**
- Modify: `lib/provisional.ts` (CH-10 at the top of `changeLog`, word for word from the spec)
- Modify: `app/(generators)/asemic/page.tsx` (`<ProvisionalChange change={CH-10} />` under the header)
- Modify: `app/(system)/logo/page.tsx` (a compact CH-10 notice beside CH-08's, under Misuse)

**Interfaces:**
- Consumes: `ProvisionalChange` from `@/components/xco`, and `changeLog` from `@/lib/provisional`.

- [ ] **Step 1: Add the record and both notices.**

- [ ] **Step 2: Verify**

Run: `npm run build && npm run a11y:audit -- --only=/asemic,/logo,/changes`
Expected: all three pages are "clean in both registers". `/changes` lists CH-10 as open, which I'll confirm with a scratch Playwright text check.

- [ ] **Step 3: Commit**

```bash
git add lib/provisional.ts "app/(generators)/asemic/page.tsx" "app/(system)/logo/page.tsx"
git commit -m "feat: CH-10 proposed — the logotype's parts as marks in the asemic script"
```

---

### Task 4: Whole-branch check

- [ ] **Step 1:** Run `npm run asemic:check && npm run x:check && npm run card:check && npm run build`. Expected: all pass.
- [ ] **Step 2:** Run the full audit, `npm run a11y:audit`. Expected: no violations on any page.
- [ ] **Step 3:** Run `git status --short`. Expected: only the local `.claude/launch.json` entry is left uncommitted.
