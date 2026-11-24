# The time print — a live asemic watermark for the instruments' exports

Status: draft for approval · 2026-11-24

## Intent and why

Indy saw `/asemic` and asked: "Can we use it as a dynamic background watermark? To time print all snapshots."

A **time print** is a faint asemic sheet at the back of an instrument's artwork. It grows from the artwork's own words and is seeded by the minute it was made. Every export carries a mark that belongs to its moment, the way a fingerprint belongs to a hand. The marks encode nothing, so that minute is also printed in words along one edge. The stamp is the seed: anyone with the stamp and the words can make the same print again.

This is the step the asemic spec left for later ("adding the script to Social Card, Paper Cover or Event Series. That's next, from the same module").

Gurden chose:
- **Exported files** as the first home, over a live site background or printed pages.
- **A live layer inside the artwork** (approach C below), so the preview shows exactly what the export will carry.

## Goals

- `lib/asemic/time-print.ts`, which is pure and deterministic. The artwork's words, a minute, a size and a ground colour go in. Out come the marks as an SVG group, the stamp text, and a canvas painter for the same marks.
- A shared `TimePrint` React element that sits at the back of each SVG instrument's artwork, plus a `useMinute()` hook that ticks on the minute.
- The time print in five instruments: social card, paper cover, three regimes and option field (SVG), and event series (canvas).
- A "Time print" checkbox in each of the five, **on by default**.
- **CH-11**, proposed, recorded in `lib/provisional.ts` and shown with CH-09 under the logo's Watermark section.
- `npm run time-print:check`, an assert-based check script in the repo's habit.

## Non-goals (for now)

- A live site background, or a print stylesheet for the guide's pages.
- Territory. Its treemap covers the canvas edge to edge, so a background layer would never show, and no corner is free for the stamp.
- The 400 × 200 "mark" formats of three regimes and option field. They're logo-sized, and like the logo files they never carry a print.
- Image treatment and align (photos), notion icons, chaos and growth (already generative), asemic itself, and the holiday card (people handwrite on it; it prints from the browser and has no export code).
- The logo downloads. **A logo file never carries a time print.**
- Changing a time print after the fact: no time picker, no "hold this minute".
- Proof of time. The time print isn't a security feature, and the page says so.

## Anti-goals (a failure even if it works)

- **A watermark that fights the content.** If a person notices the time print before the artwork's words, it's too strong. Text over it keeps its contrast; the a11y audit must stay clean.
- **A claim it can't keep.** The marks prove nothing: anyone can make the print for any minute. Nothing on the page or in the stamp says "verified", "certified" or "authentic".
- **Data in the marks.** The marks stay decoration, as asemic rule 01 requires. The time a reader needs lives in the stamp, in words.
- **Dusk on anything but the x.** The x keeps dusk, faint like the rest; nothing else gains colour.
- **A surprise in someone else's file.** The PNG route, the logo downloads and the generators outside the five are untouched. The logo downloads POST to the same PNG route, which is one more reason the print lives in the artwork, not the route.

## Approaches

| | Approach | Trade-off |
|---|---|---|
| A | Add the print inside each generator's export function | Simple, but the preview never shows it, and it's five copies of the same change |
| B | Add it in the shared PNG route | One place, but SVG downloads and canvas exports miss it, and logo PNGs (which use the same route) would need an opt-out |
| **C** | **A live layer inside the artwork** | **Chosen.** Preview matches export, it's dynamic, and the code lives in one place. Canvas instruments need a painter. |

## The time print

### Seed and stamp

- **The minute** is the maker's local time, to the minute, taken on the client.
- **The stamp text** is `time print · 2026-11-24 15:52 +01:00`: local date, 24-hour time and UTC offset. When the print grows from the fallback text, it names it, as asemic rule 02 asks ("Name the source when you share it"): `time print · identity note · 2026-11-24 15:52 +01:00`. When it grows from the artwork's own words, the source is the artwork itself, right there, so the stamp doesn't repeat it.
- **The stamp's face** is the label face, Untitled Sans ("never a monospace", `lib/design-tokens.ts`). Event series already loads it on the canvas. The PNG route still embeds only DM Mono, so in the four SVG instruments' PNGs the stamp comes out in DM Mono, like all their other text. That's an existing limit of the route, not changed here.
- **The seed** is the stamp's date-time part (`2026-11-24T15:52+01:00`). Same words and same minute give the same print.
- **The words** are the artwork's own: its title, subtitle and other visible text, joined in reading order. If an artwork has fewer than 12 letters of its own, the print grows from the identity note (`SOURCES` id `identity`) instead. The words are only seed material; the stamp doesn't repeat them.

### Marks

- The print reuses `writeSheet` unchanged, over the artwork's full canvas inside a margin of 4% of the shorter side.
- **Rows** come from the height: `rows = clamp(round(height / 60), 8, 30)`. A 1200 × 630 card gets about 11 rows.
- **Density** is the script's "sparse" range, so the print stays open.
- **Opacity** is 6% for the whole group, on top of the marks' own colours. It's set once, as `TIME_PRINT_OPACITY = 0.06`, so it can be tuned in one place.
- **Colour** is the colour the artwork already uses for text on that ground, which each instrument passes in per layout or palette. Event series has it as `onGround`: ink on paper, paper on ink, and ink on dusk. The SVG instruments use ink (`#101F24`) on paper and paper (`#F6F1E5`) on ink, navy and the dark gradients. Grounds can be gradients, so this isn't computed from a colour. The marks and the stamp both take it.
- **Knock-outs.** On a single-colour ground, boxes and rings fill with that colour, not the asemic paper, so they don't leave pale patches. On a gradient ground (social card "abstract", three regimes "abstract") they're unfilled; at 6% the thread showing through a bead isn't visible.
- **The x** stays dusk (`#F47743`), at the same 6%.
- **Accessibility.** The group is `aria-hidden`, and the stamp is real text. The artwork's own `aria-label` (or title) gains "Time print, 2026-11-24 15:52 +01:00." at the end.

### The stamp's place

- **The stamp is a slug,** in the printer's sense: one line of small type reading upward along the artwork's side edge, centred in that side's margin, starting level with the bottom padding. Content keeps its side padding in every layout and variant the builder checked against, where corners don't. For example, social card's diagram embeds take its top-right, and three regimes' "columns" and "nested" variants reach toward it. The right edge is the default; event series uses whichever side is clear in each template.
- **Size and strength.** The stamp is set at the artwork's smallest existing label size, capped at a third of the margin it sits in. It's drawn in the text colour above at full strength, so it meets the same contrast as the artwork's own labels. It's the one part of the print a reader needs.
- The "time print ·" prefix stays. Paper covers and event posters already print a date (publication, event), and the prefix keeps the two apart.
- Story formats keep the stamp inside their safe bands (event series: top 9%, bottom 11%).

### Live behaviour

- `useMinute()` returns `null` during server render and before mount, so static pages hydrate without a mismatch. After mount it returns the current minute, and re-renders on each minute boundary using a timer set to the next boundary, not polling.
- The layer and stamp render only once the minute is known.
- **The generator owns the minute.** Each instrument exports from hidden copies of its artwork, not from the preview. So the generator calls `useMinute()` once and passes the same minute and words to the preview and every hidden copy, and the export always matches what's shown.
- **A video keeps the minute it started with.** Event series records video by redrawing each frame; the minute is captured when recording starts and held until it ends.
- **Canvas performance.** Event series redraws on every animation frame. Its painter draws the marks once per minute, words and size into an offscreen canvas, then draws that image each frame.
- The marks are memoised on the words, minute, size and ground. Typing in a title re-grows the print; the target is under 16 ms per regrowth for the largest format. If that's missed, the words feed through `useDeferredValue`.
- Export takes what's on screen. If the minute turns between seeing and clicking, the export carries the new minute; the stamp always matches the marks.

### The control

- Each of the five instruments gets a "Time print" checkbox in its export section, on by default. It follows that instrument's own controls: event series uses the shared `Section` and its "Uppercase" checkbox pattern; three regimes copies its "Show annotation marginalia" checkbox; the others are hand-rolled, so the box matches their markup. Its hint reads: "A faint asemic print of this minute at the back, with the time along one edge. Decorative; it proves nothing."
- Turning it off removes the layer, the stamp and the label sentence. The choice isn't remembered between visits.

## Per instrument

| Instrument | Drawn as | Ground and its text colour | Words the print grows from | Stamp slug | Already prints a date? |
|---|---|---|---|---|---|
| Social card | SVG, `SocialCardDiagram`; layer right after the ground `<rect>` in each layout | Abstract: gradient navy to dusk, paper text. Diagram and typographic: paper, ink text | `headline`, `tag`, `byline` | Right edge, in the 80 px margin (embeds end at x 1120) | No |
| Paper cover | SVG, `PaperCoverDiagram`; layer after the paper ground `<rect>` | Paper, ink text. The abstract gradient is a band, not the ground | `title`, `subtitle`, `authors`, `paperNumber` | Right edge | Yes: publication date, bottom-left |
| Three regimes | SVG. Structural: `ThreeRegimesDiagram`, layer after the paper ground. Abstract: `AbstractThreeRegimesDiagram`, layer after the gradient | Structural: paper, ink text. Abstract: gradient navy to dusk, paper text | `labels`, `statement`, `caption`. Abstract has no text, so the identity note | Right edge; the "columns" variant leaves 40 px, "nested" 50 px | No |
| Option field | SVG, `OptionFieldDiagram`; layer after the ground `<rect>`, behind the scanlines | Paper, ink text; inverted: ink, paper text; blueprint: navy, paper text | None of its own, so always the identity note | Right edge, in about 64 px clear of the scanlines | No |
| Event series | Canvas, `drawCard`; in every template the painter runs after `fillRect` of the ground and before `drawField` | Each palette's `onGround`: paper ground, ink; ink ground, paper; dusk ground, ink | `kicker`, `title`, `subtitle`, `location` | The side clear in each template, inside the safe bands: window, left (its panel is bottom-right); corner, right (its L-band is left and bottom); globe, the side the globe doesn't reach. The builder confirms each template × format × palette in the browser | Yes: event date and time, in the details block |

Exports today: the four SVG instruments each keep private copies of `exportSVG`/`exportPNG`, which serialise hidden copies of the artwork and POST to `/api/export/png` (it renders all text in DM Mono). Event series renders PNG on a fresh canvas with `toBlob` and records video by redrawing `drawCard`. None of these change: the print rides in the artwork they already export.

## CH-11

Added to `changeLog` in `lib/provisional.ts`:

- **id:** `CH-11`
- **title:** "Exports may carry a time print: a faint asemic watermark of the minute they were made"
- **target:** "Logo / Watermark"
- **href:** `/logo#watermark`
- **status:** `proposed`
- **proposedBy:** "Indy"
- **date:** `2026-11-24`
- **why:** "Every snapshot that leaves the instruments carries a mark of its moment. The marks are grown from its own words, and the minute is printed in words beside them."
- **previous:** "The full logo may appear at about 7% as a decorative footer watermark, cropped by a corner, never at a size where it must be read." (CH-09)
- **proposed:** "Exports from the instruments may also carry a time print: an asemic sheet at about 6%, grown from the artwork's own words and seeded by the minute it was made, with that minute printed along one edge. It is decorative and proves nothing."
- **decision:** "Waiting for a named adopter."
- **respond:** `PR(n)` once the pull request exists.

It shows compact under the logo page's Watermark section, after the CH-09 text, and in full on `/changes`. The Watermark section gains an `id="watermark"` anchor if it lacks one.

## Checks

`scripts/time-print-check.ts` (`npm run time-print:check`):

- **Determinism.** The same words, minute, size and ground give the same group; a different minute gives a different group.
- **The stamp.** Its format is exact, with and without "identity note", including a negative and a zero UTC offset and a minute past midnight, and the seed is its date-time part.
- **Fallback.** Fewer than 12 letters of the artwork's own grows the print from the identity note.
- **Colour.** Marks and stamp take the text colour passed in; knock-outs are filled with the given ground, or unfilled on a gradient; dusk only on the x.
- **Bounds.** Every mark sits inside the margin for each instrument's formats.
- **Opacity.** The group carries `opacity="0.06"`.
- **Off means gone.** With the print off, nothing of it appears in the artwork's markup.
- **No leaks.** The logo-download path and the PNG route source don't import `time-print`.
- **Mark formats.** The 400 × 200 formats never get a layer or a stamp.

Also: `npm run asemic:check`, `npx tsc --noEmit -p .`, `npm run build`, `npm run a11y:audit` on the five instruments, `/logo` and `/changes`, and a browser pass on each instrument, every format, layout and palette. In that pass, the preview and the exported SVG carry the same stamp and marks, the PNG shows the print, the stamp collides with nothing, and toggling it off removes it. The hidden export copies must not add duplicate text for screen readers.

## Left to the builder

- Where the shared `TimePrint` element and `useMinute` hook live (`components/xco/` or next to the generators).
- How each instrument passes its words and ground colour in.
- Whether the canvas painter shares code with `toSvg` or walks the marks itself, as long as both draw the same geometry.
- The exact label wording on each artwork, provided it ends with the time print sentence.

## My calls (for Gurden to check)

- **The seed is the stamp.** It makes every print re-makeable from what's printed on it.
- **6% opacity.** This is a little under CH-09's 7%, because the asemic sheet covers the whole artwork, not one corner.
- **Rows from height (about 60 px a row) and sparse density.** This keeps the print open behind text.
- **The identity note as the fallback text** for artworks with almost no words.
- **On by default.** Indy asked for "all snapshots".
- **Territory and the mark formats are out.** There's nowhere for a background to show on territory, and the mark formats are logo-sized.
- **The stamp is a slug along a side edge, not a corner stamp.** Corners turned out to be taken in some layouts (social card's diagram embeds, three regimes' variants); side margins weren't.
- **Stamp and marks use the artwork's own text colour, and the stamp is at full strength.** This came from the builder check: paper at 60% on dusk would be about 1.7:1.
- **The stamp is in Untitled Sans,** the label face. The PNG route's DM Mono-only limit stays as it is.
- **The stamp names the identity note when it's the source** (asemic rule 02).
- **CH-11 credits Indy** as proposer.
