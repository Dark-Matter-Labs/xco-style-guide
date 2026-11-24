# Time Print Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every export from five instruments carries a faint asemic "time print", grown from the artwork's own words and seeded by the minute it was made, with that minute printed as a slug along one edge.

**Architecture:** A pure module `lib/asemic/time-print.ts` turns words, a minute and a size into marks, a stamp and a label, reusing `writeSheet` and a marks renderer extracted from `toSvg`. A shared React piece (`components/xco/TimePrint.tsx`) draws the marks at the back of each SVG instrument and the slug at the front. Each generator owns one `useMinute()` and passes it to its preview and its hidden export copies. Event series paints the same marks on its canvas from a cached offscreen layer.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, SVG and canvas 2D, assert-based check scripts run with `tsx`.

**Spec:** `docs/superpowers/specs/2026-11-24-time-print-design.md` (approved 2026-11-24)

## Global Constraints

- `TIME_PRINT_OPACITY = 0.06`, set once and applied to the whole marks group (SVG `<g opacity="0.06">`, canvas `globalAlpha = 0.06` on the cached layer).
- Sheet margin is 4% of the artwork's shorter side. `rows = clamp(round(height / 60), 8, 30)`. Density is `DENSITY.sparse`. `writeSheet` itself is unchanged.
- Words: the artwork's visible text in reading order, joined with spaces. If they hold fewer than 12 letters (`\p{L}` only), the print grows from `SOURCES` id `identity` instead.
- Stamp: `time print · 2026-11-24 15:52 +01:00`; with the fallback, `time print · identity note · 2026-11-24 15:52 +01:00`. Local date, 24-hour time, UTC offset as `±HH:MM`.
- Seed: `2026-11-24T15:52+01:00` (the stamp's date-time part).
- Label sentence: `Time print, 2026-11-24 15:52 +01:00.` (no source name).
- Checkbox label "Time print", on by default, not remembered. Hint, exactly: "A faint asemic print of this minute at the back, with the time along one edge. Decorative; it proves nothing."
- Colours: marks and slug take the artwork's own text colour for that ground. Knock-outs (boxes, rings) fill with the ground colour, or `fill="none"` on a gradient ground. The x stays `DUSK` (`#F47743`); nothing else gains colour.
- Slug: Untitled Sans (`'Untitled Sans', system-ui, sans-serif`), full strength. Its size is the smallest font size already in that artwork, capped at a third of the margin it sits in. It reads upward (rotate −90°), centred in the side margin, starting level with the bottom padding.
- Out of scope, untouched: territory, the 400 × 200 `mark` formats, `app/api/export/png/route.ts`, `app/(system)/logo/LogoDownloads.tsx`, `lib/logo*`, and every other generator.
- Repo habits: no new npm packages. The TS target rejects `[...str]` and `u`-flag regex literals, so use `Array.from` and `new RegExp(..., "u")`. Check scripts are assert-based `tsx` files. Commits are `<type>: <description>` ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never commit `.claude/launch.json`.
- **Rendering diagrams in a check script.** Use `renderToStaticMarkup` from `react-dom/server`. `tsx` compiles JSX with the classic transform (tsconfig `jsx: preserve`), so set `globalThis.React = React` first. Then `await import(...)` the diagrams inside an async IIFE; the repo's CJS output has no top-level await. All four SVG diagrams were verified to render this way.

## Review Focus

1. **The minute turns mid-session or mid-export.** The preview and every hidden export copy must show the same minute, and a video must hold the minute it started with. Tests: Task 3 (no diagram calls `useMinute`; the browser export's stamp equals the preview's); Task 5 (`renderVideo` takes `spec.timePrint` once).
2. **Empty or very long words, and typing speed.** A cleared title falls back to the identity note, a 600-letter word stays in bounds, and regrowth stays fast. Tests: Task 1 (fallback, huge word, timing).
3. **Time zones.** `+05:30`, negative offsets that cross midnight, `+00:00`, and a DST change. Tests: Task 1.
4. **Dark, gradient and dusk grounds.** The slug stays readable and knock-outs leave no patches. Tests: Task 1 (colours, `fill="none"`), Task 3 (social card "abstract"), Task 4 (three regimes "abstract", option field inverted and blueprint), Task 5 (dusk palette takes ink).
5. **Layouts where the slug could collide.** Social card diagram embeds (end at x 1120), three regimes "columns" (40 px) and "nested" (50 px), event series story safe bands. Tests: Task 3, Task 4, Task 5 (placement).

---

### Task 1: The time print module

**Files:**
- Modify: `lib/asemic/script.ts` (extract `marksBody` from `toSvg`)
- Create: `lib/asemic/time-print.ts`
- Create: `scripts/time-print-check.ts`
- Modify: `package.json` (add `"time-print:check": "tsx scripts/time-print-check.ts"`)

**Interfaces:**
- Consumes: `writeSheet`, `toSvg`, `DENSITY`, `DUSK`, `type Sheet` from `lib/asemic/script.ts`; `SOURCES` from `lib/asemic/sources.ts`.
- Produces:
  - `marksBody(sheet: Sheet, fg: string, bg: string | null): string` in `script.ts`: the marks only, no `<svg>` or `<g>`. With `bg === null`, boxes and rings get `fill="none"`. `toSvg` calls it with its own `fg`/`bg`.
  - In `time-print.ts`:
    - `TIME_PRINT_OPACITY = 0.06`
    - `interface Minute { seed: string; stamp: string }`
    - `minuteOf(d: Date, offsetMinutes: number = -d.getTimezoneOffset()): Minute`
    - `msToNextMinute(nowMs: number): number`
    - `interface TimePrintProp { minute: Minute; words: string }`
    - `interface TimePrintInput { words: string; minute: Minute; width: number; height: number; ink: string; ground: string | null }`
    - `interface TimePrint { sheet: Sheet; body: string; stamp: string; label: string; source: "artwork" | "identity"; ink: string; ground: string | null }`
    - `makeTimePrint(i: TimePrintInput): TimePrint` (named so it doesn't clash with the diagrams' `timePrint` prop)
    - `slugSize(smallestLabel: number, margin: number): number`, which is `Math.min(smallestLabel, margin / 3)`
    - `interface Ctx2D`: the minimal canvas subset `paintMarks` uses (`fillStyle`, `strokeStyle`, `lineWidth`, `setLineDash`, `beginPath`, `moveTo`, `lineTo`, `arc`, `rect`, `fill`, `stroke`)
    - `paintMarks(ctx: Ctx2D, sheet: Sheet, fg: string, bg: string | null): void`, the same geometry as `marksBody` (dotted threads use `setLineDash`)

- [ ] **Step 1: Pin `toSvg`'s current output.** On the unchanged code, print `toSvg(writeSheet(SOURCES[0].text, O), "paper", "x")` for `O = { width: 1000, height: 1000, margin: 70, rows: 20, seed: "7", density: DENSITY.normal }`, plus the same in `"ink"`. Record each string's length and FNV hash as constants in the new check, with the assert `toSvg is byte-identical after the refactor`.
- [ ] **Step 2: Write the failing checks** in `scripts/time-print-check.ts`:
  - `minuteOf(new Date("2026-11-24T14:52:30Z"), 60)` → `{ seed: "2026-11-24T15:52+01:00", stamp: "2026-11-24 15:52 +01:00" }`.
  - Offset 330 → `20:22 +05:30`. Offset 0 → `+00:00`. `new Date("2026-11-25T02:30:00Z")` with −180 → `2026-11-24 23:30 -03:00`.
  - DST: set `process.env.TZ = "Europe/Berlin"` at the top of the script. Then `minuteOf(new Date("2026-03-29T00:59:00Z"))` → `01:59 +01:00` and `minuteOf(new Date("2026-03-29T01:00:00Z"))` → `03:00 +02:00`.
  - `msToNextMinute(Date.UTC(2026, 10, 24, 15, 52, 30, 250)) === 29750`; exactly on a boundary → `60000`.
  - `makeTimePrint` with 12+ letters → `source "artwork"`, stamp `time print · 2026-11-24 15:52 +01:00`, label `Time print, 2026-11-24 15:52 +01:00.`
  - Words `"CH-10 v0.2"` and `""` → `source "identity"`, stamp `time print · identity note · …`.
  - Same input → same `body`; a different minute → a different `body`.
  - `sheet.rows`: 11 for height 630, 8 for 300, 30 for 1920.
  - Colours: with `ink: "#101F24", ground: "#F6F1E5"`, every `stroke`/`fill` in `body` is ink, the ground or `DUSK`. The `DUSK` count equals the x-mark count. With `ground: null`, there is no knock-out fill and `fill="none"` appears.
  - Bounds: every mark inside the 4% margin for 1200×630, 1080×1080, 794×1123, 1200×1200, 1080×1350 and 1080×1920. Repeat with `"Optionality".repeat(60)` as the words.
  - Timing: the median of 5 `makeTimePrint` runs at 1080×1920 with `SOURCES[0].text` is logged; assert < 16 ms.
  - `paintMarks` on a recording fake `Ctx2D` makes one `stroke()` per thread, dash and x. `strokeStyle` is `DUSK` only for x marks. Knock-out `fill()` uses the ground, and there is none when the ground is `null`.
  - No leaks: the text of `app/api/export/png/route.ts`, `app/(system)/logo/LogoDownloads.tsx` and every `lib/logo*.ts` doesn't contain `time-print`.
- [ ] **Step 3: Run `npm run time-print:check`.** Expected: FAIL (module missing).
- [ ] **Step 4: Extract `marksBody`; write `time-print.ts` and `paintMarks`** to the interfaces above. The seed passed to `writeSheet` is `minute.seed`. Count letters with `new RegExp("\\p{L}", "u")`.
- [ ] **Step 5: Run `npm run time-print:check && npm run asemic:check`.** Expected: both pass. If the timing assert fails, record the number and add `useDeferredValue` on the words in every generator in Tasks 3–5 (a ledger ruling), then relax the assert to log only.
- [ ] **Step 6: Commit** `feat: time print module — marks, stamp and canvas painter from the asemic script`.

### Task 2: The shared React pieces

**Files:**
- Create: `components/xco/TimePrint.tsx`
- Modify: `components/xco/index.ts` (export it)
- Modify: `scripts/time-print-check.ts`

**Interfaces:**
- Consumes: `Minute`, `TimePrint`, `TIME_PRINT_OPACITY`, `minuteOf`, `msToNextMinute` from Task 1.
- Produces:
  - `useMinute(): Minute | null`. It's `null` on the server and before mount. After mount it's `minuteOf(new Date())`, updated by a `setTimeout(msToNextMinute(Date.now()))` that re-arms itself and is cleared on unmount.
  - `TimePrintMarks({ print }: { print: TimePrint })` renders `<g opacity={TIME_PRINT_OPACITY} aria-hidden="true" fill="none" strokeLinecap="butt" dangerouslySetInnerHTML={{ __html: print.body }} />`.
  - `TimePrintSlug({ print, width, height, margin, bottom, size, side = "right" }: { print: TimePrint; width: number; height: number; margin: number; bottom: number; size: number; side?: "left" | "right" })` renders one `<text>` with `transform="translate(x y) rotate(-90)"`. Here `x = (side === "right" ? width - margin / 2 : margin / 2) + size * 0.35` and `y = height - bottom`. It uses the Untitled Sans stack, `fontSize={size}` and `fill={print.ink}`, and its content is `print.stamp`.

- [ ] **Step 1: Write the failing checks**, using the render recipe from Global Constraints:
  - `<svg><TimePrintMarks/></svg>` contains `<g opacity="0.06" aria-hidden="true"`.
  - The slug markup contains `rotate(-90)`, the stamp text, `Untitled Sans` and the ink. With `side: "left"`, x is less than the margin.
  - A probe component rendering `useMinute() === null ? "none" : "some"` renders `none` on the server.
- [ ] **Step 2: Run `npm run time-print:check`.** Expected: FAIL.
- [ ] **Step 3: Implement** `components/xco/TimePrint.tsx` and export it.
- [ ] **Step 4: Run `npm run time-print:check && npx tsc --noEmit -p .`.** Expected: both pass.
- [ ] **Step 5: Commit** `feat: TimePrint marks, slug and useMinute`.

### Task 3: Social card and paper cover

**Files:**
- Modify: `app/(generators)/social-card/SocialCardDiagram.tsx`, `app/(generators)/social-card/SocialCardGenerator.tsx`
- Modify: `app/(generators)/paper-cover/PaperCoverDiagram.tsx`, `app/(generators)/paper-cover/PaperCoverGenerator.tsx`
- Modify: `scripts/time-print-check.ts`

**Interfaces:**
- Consumes: `TimePrintProp`, `makeTimePrint`, `slugSize` (Task 1); `TimePrintMarks`, `TimePrintSlug`, `useMinute` (Task 2).
- Produces: each diagram's props gain `timePrint?: TimePrintProp | null`. The diagram memoises `makeTimePrint({ ...prop, width, height, ink, ground })`. It renders `TimePrintMarks` right after its ground `<rect>` and `TimePrintSlug` as the root's last child. Each generator holds `const minute = useMinute()` and `const [timePrintOn, setTimePrintOn] = useState(true)`, then passes `timePrintOn && minute ? { minute, words } : null` to the preview and to every hidden copy.

Facts to build to:
- **Social card.** Ground per layout: abstract is the `#sc-abstract` gradient with paper text and `ground: null`; diagram and typographic are paper with ink text. Words are `[tag, headline, byline]`. The slug sits on the right with a margin of 80. Its size is the card's smallest existing font size.
- **Paper cover.** Paper ground, ink text. Words are `[paperNumber, title, subtitle, authors]`. The slug sits on the right edge, with the cover's own side padding as its margin.
- The hidden copies' containers already carry `aria-hidden="true"`, so they need no change.
- None of the SVG roots has an `aria-label` or `<title>` today, so the slug's text is what assistive tech reads. No label is added (the spec leaves label wording to the builder).

- [ ] **Step 1: Write the failing checks.** For both diagrams, in every layout and format, render with a fixed `timePrint` prop and check that:
  - The element right after the ground `<rect …>` is `<g opacity="0.06"`.
  - The markup ends with the slug `<text>`, whose x lies in `[W − margin, W]`.
  - Social card "abstract" has `fill="none"` knock-outs and a paper slug; the others have an ink slug.
  - In the social card diagram layout with the option field and territory embeds, the slug's x is > 1120.
  - Without the prop, the markup has neither `opacity="0.06"` nor `time print ·`.
  - Neither diagram file contains `useMinute` (Review Focus 1).
- [ ] **Step 2: Run `npm run time-print:check`.** Expected: FAIL.
- [ ] **Step 3: Implement** the diagram props and layers, then the generators' `useMinute`, state, words and a "Time print" checkbox with the hint, in each Export section. The checkbox matches each file's hand-rolled markup and uses `accent-xco-dusk`.
- [ ] **Step 4: Run `npm run time-print:check && npx tsc --noEmit -p .`.** Expected: both pass.
- [ ] **Step 5: Browser check.** Start the app with `preview_start`, using the local `x-dev` launch entry if it serves this worktree. If it doesn't, rebuild the esbuild + Playwright harness from the `/asemic` work. For each generator, layout and format:
  - The print is visible and faint, and the slug is readable and collides with nothing.
  - The exported SVG's stamp and first mark equal the preview's.
  - The PNG through `/api/export/png` shows the print.
  - Unticking removes the layer and the slug.
- [ ] **Step 6: Commit** `feat: time print on social card and paper cover`.

### Task 4: Three regimes and option field

**Files:**
- Modify: `app/(generators)/three-regimes/ThreeRegimesDiagram.tsx`, `AbstractThreeRegimesDiagram.tsx`, `ThreeRegimesGenerator.tsx`
- Modify: `app/(generators)/option-field/OptionFieldDiagram.tsx`, `OptionFieldGenerator.tsx`
- Modify: `scripts/time-print-check.ts`

**Interfaces:**
- Consumes: as in Task 3.
- Produces: the same `timePrint?: TimePrintProp | null` prop on `ThreeRegimesDiagram`, `AbstractThreeRegimesDiagram` and `OptionFieldDiagram`. Both diagrams ignore the prop when `format === "mark"`.

Facts to build to:
- **Three regimes structural.** Paper ground, ink text. Words are `labels.frontier`, `fortress`, `field`, `fieldSublabel`, then `relationshipStatement` and `caption`. The slug's margin per variant: classic uses the layout's own side padding, "columns" 40, "nested" 50. Size is `slugSize(layout.subSize, margin)`.
- **Three regimes abstract.** A gradient ground with paper text and `ground: null`. It has no words, so it always shows "identity note".
- **Option field.** Grounds: paper with ink text, inverted ink with paper text, blueprint navy with paper text. It has no words of its own, so it always shows "identity note". The slug's margin is 64, the clear strip right of the scanlines. The layer goes after the ground `<rect>`, behind the scanlines.

- [ ] **Step 1: Write the failing checks.**
  - Three regimes, in each variant and each of hero and square: the layer comes right after the ground. The slug's x is inside the variant's right margin, and its size is ≤ margin / 3.
  - Abstract: `fill="none"`, a paper slug containing `identity note`.
  - Option field, in each colour mode: the slug colour matches the table above, and the layer precedes the first scanline `<rect>`.
  - The `mark` format of both renders no `opacity="0.06"` and no `time print ·`.
- [ ] **Step 2: Run `npm run time-print:check`.** Expected: FAIL.
- [ ] **Step 3: Implement** the diagrams, then the generators: `useMinute`, state, words, and the checkbox. In three regimes, copy the "Show annotation marginalia" checkbox, but show it in both modes. In option field, the box is hand-rolled in Export.
- [ ] **Step 4: Run `npm run time-print:check && npx tsc --noEmit -p .`.** Expected: both pass.
- [ ] **Step 5: Browser check,** as in Task 3 Step 5, for every variant, mode and colour mode.
- [ ] **Step 6: Commit** `feat: time print on three regimes and option field`.

### Task 5: Event series (canvas)

**Files:**
- Create: `app/(generators)/event-series/render/time-print.ts`
- Modify: `app/(generators)/event-series/render/types.ts` (`CardSpec.timePrint`)
- Modify: `app/(generators)/event-series/render/templates.ts` (three ground sites, plus the end of `drawCard`)
- Modify: `app/(generators)/event-series/CardPreview.tsx` (aria-label), `EventSeriesGenerator.tsx`
- Modify: `scripts/time-print-check.ts`

**Interfaces:**
- Consumes: `makeTimePrint`, `paintMarks`, `TIME_PRINT_OPACITY`, `slugSize`, `TimePrintProp` (Task 1); `useMinute` (Task 2); `Palette.onGround` and `Palette.ground`; the template layout fields `m`, `tall`, `safeTop`, `safeBottom`.
- Produces:
  - `CardSpec.timePrint: TimePrintProp | null`
  - `SLUG_SIDE: Record<TemplateId, "left" | "right">`, which is `{ window: "left", corner: "right", globe: "left" }` until the browser check says otherwise
  - `slugPlacement(template: TemplateId, W: number, H: number, m: number, safeTop: number, safeBottom: number, size: number, length: number): { x: number; y: number; side: "left" | "right" }`, which is pure
  - `drawTimePrint(ctx, spec, W, H)`. It builds the layer once per `seed|words|W×H|palette`: `paintMarks` at full alpha into an offscreen canvas, kept in a module-level `Map` with a single entry. It then draws that layer with `globalAlpha = TIME_PRINT_OPACITY`.
  - `drawTimePrintSlug(ctx, spec, layout)`

Facts to build to:
- In each template, `drawTimePrint` runs right after the ground `fillRect(0, 0, W, H)` and before `drawField` (`templates.ts` around :46, :101, :162). `drawTimePrintSlug` runs last in `drawCard`.
- Colours are `palette.onGround` and `palette.ground`: dusk takes ink, paper takes ink, ink takes paper.
- The slug is set in the canvas's loaded Untitled Sans, with `slugSize(<smallest detail size>, m)`.
- `renderPNG` and `renderVideo` already take a `spec`, so a video holds the minute it started with, with no extra code.
- The canvas `aria-label` gains the label sentence when `spec.timePrint` is set.

- [ ] **Step 1: Write the failing checks.**
  - `slugPlacement` for the story format (1080×1920): the slug runs between `safeTop` and `H − safeBottom`, and x sits in the left or right margin as `SLUG_SIDE` says.
  - For square and 1200×630: the slug starts at `H − m`.
  - The longest stamp (with "identity note") fits the available run in every format, so a format that can't fit it is caught here, not at draw time.
  - The dusk palette's print colour is ink.
  - `EventSeriesGenerator.tsx` builds `spec.timePrint` from one `useMinute()`, and `render/export.ts` reads `spec.timePrint` and never calls `useMinute` or `minuteOf` (Review Focus 1).
- [ ] **Step 2: Run `npm run time-print:check`.** Expected: FAIL.
- [ ] **Step 3: Implement** the render module, the `CardSpec` field, the template calls, the aria-label, and the generator. The generator gets `useMinute`, state, and words from `content.kicker`, `title`, `subtitle` and `location`. The "Time print" checkbox and hint go in its Export `Section`, after the "Uppercase" pattern.
- [ ] **Step 4: Run `npm run time-print:check && npx tsc --noEmit -p .`.** Expected: both pass.
- [ ] **Step 5: Browser check** of every template × format × palette (3 × 4 × 3):
  - The slug collides with nothing and stays inside the story safe bands. Fix `SLUG_SIDE` if a side is taken, and ledger it.
  - The animation stays smooth.
  - The PNG shows the print.
  - A short video keeps one stamp throughout.
- [ ] **Step 6: Commit** `feat: time print on event series`.

### Task 6: CH-11, full verification, PR

**Files:**
- Modify: `lib/provisional.ts` (CH-11 at the top of `changeLog`, with the spec's exact fields)
- Modify: `app/(system)/logo/page.tsx` (add `id="watermark"` on the Watermark section; compact `ProvisionalChange` for CH-11 after the CH-09 text)
- Modify: `scripts/time-print-check.ts`

**Interfaces:**
- Consumes: `ChangeRecord`, `ProvisionalChange`, `PR(n)`.
- Produces: the CH-11 record (`href: "/logo#watermark"`, `status: "proposed"`, `proposedBy: "Indy"`).

- [ ] **Step 1: Write the failing check.** `changeLog` has `CH-11`, with status `proposed`, href `/logo#watermark`, and `proposed` text containing "proves nothing". The logo page source contains `id="watermark"`.
- [ ] **Step 2: Run `npm run time-print:check`.** Expected: FAIL.
- [ ] **Step 3: Implement** the record and the logo page notice.
- [ ] **Step 4: Run the whole suite:**
  - `npm run time-print:check`, `npm run asemic:check`, `npm run x:check`, `npm run card:check`
  - `npx tsc --noEmit -p .`
  - `npm run build`
  - `npm run a11y:audit -- --only=/social-card,/paper-cover,/three-regimes,/option-field,/event-series,/logo,/changes`

  Expected: all pass, with no a11y violations in either register.
- [ ] **Step 5: Commit** `feat: CH-11 proposed — the time print`. Then push with `git push -u origin claude/time-print` and open the PR with a summary, CH-11 and the test plan. Add `respond: PR(<n>)` to CH-11, then commit and push again.

## Self-review notes

- **Spec coverage.** Every spec section maps to a task:
  - Seed, stamp, marks and colours: Task 1.
  - Live behaviour: Tasks 2, 3 and 5.
  - The control: Tasks 3–5.
  - The per-instrument table: Tasks 3–5.
  - CH-11 and the checks list: Tasks 1–6.
  - Exclusions: Task 1 (no leaks) and Task 4 (mark formats).
- **Already true, so no step:** the hidden export copies are already `aria-hidden`.
