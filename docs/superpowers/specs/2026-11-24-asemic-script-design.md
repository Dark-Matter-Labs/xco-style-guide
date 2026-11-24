# The xCO asemic script — generator

Status: draft for approval · 2026-11-24

## Intent and why

Give xCO's language more personality, character and a striking effect with an **asemic script**: writing that looks and moves like writing but carries no fixed meaning.

It came out of an `/imagine` session. The seeds were drawn by chance from the Imagination Wiki:
- "Imagination is not knowledge" (Anahat Kaur);
- "Check-ins without words" (Anahat Kaur);
- "HUMAN.md" (offered by Gurden Batra).

Gurden first picked three directions: an alphabet built from the logotype, shadow text that grows from real sentences, and writing that resolves when it's adopted. Then he redirected the look towards a pen-plotted reference, a Processing piece by `@bustavo`. The approved look is the second rough sketch: rows of mirrored clusters strung on dotted threads, built only from xCO's own parts.

It must hold the grammar's integrity rule ("accidental ambiguity is a defect"), so this ambiguity has to be deliberate and visibly so. The script is expressive. It never stands in for real content, and it never claims to encode data.

## Goals

- `lib/asemic`: a pure, deterministic generator. Text, a seed and options go in; a sheet of marks and its SVG come out.
- An `/asemic` page among the generators, with source text, controls, a live preview and export (SVG for print and pen plotters, PNG through the existing exporter).
- A short rules panel on that page.
- `npm run asemic:check`, an assert-based check script, following the repo's habit (see `scripts/x-operator-check.ts`).

## Non-goals (for now)

- Adding the script to Social Card, Paper Cover or Event Series. That's next, from the same module.
- A live component on site pages (shadow lines, proposals that stay asemic until adopted). That's later.
- Plotter-specific optimisation (path ordering, pen changes) and video export.

## Anti-goals (a failure even if it works)

- **Anything a reader could take for real text or real data.** The page and every export description say it's generated and expressive, and that it encodes no data. Chaos already does this.
- **A cipher.** No letter-to-glyph table. Every mark is seeded by the source text, the token's position and the seed, so the same word in two places looks different. The writing stays open, not a code.
- **A copy of the reference.** The vocabulary is xCO's own: the dotted thread, the logotype's O and C as beads, scan-line hatching, and the x in dusk.
- **Dusk on anything but the x.** This is rule 07 of the x as operator. No faces, no mascot.

## Approaches

| | Approach | Trade-off |
|---|---|---|
| **1 — picked** | **Its own generator first:** `/asemic`, with export. | The team finds the right look before it spreads. Smallest piece of work. |
| 2 | Add it to the existing generators (Social Card, Paper Cover, Event Series). | Reaches real outputs straight away, but changes three tools before the look has settled. |
| 3 | A live component on site pages: shadow lines, and resolving on adoption. | Most character, but most work, and it touches shared parts like the change records. |

Gurden picked 1. Approaches 2 and 3 follow from the same `lib/asemic`.

## The script: a grammar of marks

Everything sits on a grid of unit **U**. Marks in a cluster sit on a looser lattice with step **S = 1.4 U**, so the squares stand apart instead of merging into blocks. All values below are taken from the approved sketch (`scratchpad/asemic/sketch2.html`, which isn't in the repo). The builder recreates them in `lib/asemic`.

**The page:**
- **Rows.** A sheet has a number of rows, evenly spaced between margins. Each row has a **thread** through its centre.
- **The thread.** Between clusters it's dotted: dash 0.35 U, gap 0.55 U, stroke 0.18 U. Inside a cluster it's solid, with stroke 0.2 U.

**Tokens.** The source text is split into words, punctuation (`. , : ;`) and line breaks.

| Token | What it becomes |
|---|---|
| A word longer than 3 letters | A **cluster** (below), on the solid thread. Consecutive words in a phrase are joined by the dotted thread. |
| A word of 1 to 3 letters | A sparse mark, off the thread. One of three, picked by chance: a vertical stack of *n* squares (*n* = the word's length), a tall open box, or a small stack of dashes. |
| `.` | A stack of 4 squares. Half the time it's followed by a **rest**: the dotted thread running alone for 8 to 48 U. |
| `,` | A stack of 2 squares. |
| `:` `;` | A stack of 3 dashes. |
| A line break (paragraph end) | A long **rest**: the dotted thread runs on alone for 30% to 100% of what's left of the row. |

**When the text runs out before the sheet is full,** the source repeats. Each repeat gets fresh seeds, so it doesn't look the same.

**Clusters.** A cluster is built like this:
- **Width:** *n* = max(4, round(length × 1.25 + rand × 3)) columns, spaced S apart.
- **Height:** an amplitude *A* of 2 to 4 lattice steps, which keeps each cluster inside its own row.
- **Shape:** an envelope chosen at random from diamond, spindle, hourglass, fan left, fan right, wave or bead (mid-third only). This sets how far each column reaches.
- **Marks:** in each column, every lattice point inside the envelope gets a mark with probability *density* (0.45 to 0.8). The mark is **mirrored exactly** above and below the thread. It's a filled square 0.82 U wide 74% of the time, otherwise a dash 1.6 U long.
- **Hatching:** half the time, one run of 3 to 8 columns is drawn as hatching instead. That's dashes 0.62 U apart, reaching up to twice the envelope: the identity's scan lines, read as tone.
- **Beads on the thread:** 1 to 3, placed at random. Each is one of:
  - an open box, 2.4 × 1.4 U (30%);
  - the logotype's **O**, a closed circle of radius 0.8 U (28%);
  - the logotype's **C**, the same circle with a 100° opening facing right, the logotype's own aperture (26%);
  - a filled square (9%);
  - the **x in dusk**, sitting on the thread and acting on it (7%). *(My call.)* "Acting on it" means the x **opens the thread**: the solid thread breaks for 1.6 U under it, the way the C's aperture opens the circle. The x is drawn in the logotype's proportions (56 : 62) with a stroke of 0.3 U, the same as the O and C beads. That's lighter than the sketch's 0.42 U, following the x rule "As a diagram it thins".

**Seeding:** each token's randomness comes from `hash(seed | token index | token)`. The same text, seed and options always give the same sheet.

**Colour:**
- **Paper** register: ink `#101F24` on paper.
- **Ink** register: paper on the ink ground.
- **The x** is always `#F47743` (dusk), in both registers.
- **Weights** scale with U, so the sheet scales cleanly.

## The page

- **Where:** `/asemic`, in `app/(generators)/`, added to the generators nav after Chaos.
- **Header:** the same pattern as Chaos (`page.tsx`), with one short paragraph saying what it is: writing with no fixed meaning, grown from xCO's own sentences.
- **Controls**, using `components/generator-controls` (`Section`, `RadioList`, `TextField`, `Button`):
  - **Source:** presets, or your own text. *(My call.)* The sketch's text splits into three presets, kept in `lib/asemic/sources.ts`:
    - **Tone note:** "Be precise about what we know, explicit about what we are testing, and open about what remains unresolved." and "Learning in public. Show what is being learned, not what has been done."
    - **Propositions:** "We publish what we are testing alongside what we know. Each claim carries its status and its version.", then P1, P2 and P3, then the withdrawn claim, exactly as on `/x-demo`. The text is copied, not imported, because `XDemo.tsx` doesn't export it.
    - **Identity note:** the field line ("A field of work on how societies keep more futures open…"), "Identity is syntax, not icon…", and "The x is the operator acting on the C and the O. Same geometry, different openness."
  - **Seed:** a number field, plus "↻ Write it again" for a new seed.
  - **Rows:** 8 to 30, default 20.
  - **Density:** Sparse, Normal or Dense, mapped onto the density range.
  - **Format:**
    - Square sheet, 300 × 300 mm;
    - A4 portrait;
    - Social, 4:5.
  - **Register:** Paper or Ink.
  - **Show the source:** a preview-only toggle that sets each row's source words faintly beneath it. Exports never include this.
- **Preview:** the SVG at the format's proportions. It's `role="img"`, with an `aria-label` that says it's asemic writing grown from the chosen source and has no readable text.
- **Description line** (as on Chaos): "Asemic writing grown from {source}, seed {n}, {rows} rows. Generated and expressive; it encodes no data."
- **Export:**
  - **SVG:** plain vector, with lines as strokes and squares as filled rects, ready for print or a plotter.
  - **PNG:** through `/api/export/png`, the same way Paper Cover does it.
  - **File names** follow Chaos: `xco-asemic-{source}-{seed}-{format}-{register}`.
- **Rules panel,** in the plain register, exact copy:
  - 01 It is writing with no fixed meaning. Never use it where a reader needs words or data.
  - 02 It grows from real xCO text. Name the source when you share it.
  - 03 It is not a code. The same word never looks the same twice.
  - 04 Only the x carries dusk.
  - 05 Generated and expressive. It encodes no data.

## Released as a proposed change: CH-10

Gurden decided this. Using the logotype's O, C and x as marks goes beyond the current logo rules: CH-08, the x leaving the mark, is only proposed. So the page goes out as a **proposed change**, following the repo's convention (`lib/provisional.ts`, CH-06).

- **The record:** a new entry at the top of `changeLog`:
  ```ts
  {
    id: "CH-10",
    title: "The logotype's parts may be used as marks in the asemic script",
    target: "Logo / Misuse",
    href: "/asemic",
    status: "proposed",
    proposedBy: "Gurden",
    date: "2026-11-24",
    why: "The asemic script gives xCO's language personality and character. Its beads are the logotype's O and C, and the x in dusk opens the thread.",
    previous: "Don't reflow it. Never re-space, stack, or reorder the glyphs.",
    proposed: "The O, the C with its 100° aperture, and the x may appear as marks in the asemic script on /asemic. The logotype itself does not change.",
    decision: "Waiting for a named adopter.",
  }
  ```
- **`/asemic`:** the full `<ProvisionalChange>` for CH-10 goes right under the page header, the way `/logo/x` shows CH-08.
- **`/logo`:** a compact `<ProvisionalChange>` for CH-10 goes under the Misuse grid, next to CH-08's. The convention says to mark a change where it lives.
- **`/changes`:** lists it automatically.

## Where things live

- `lib/asemic/script.ts`: the pure generator.
  - `tokenize(text)`;
  - `writeSheet(text, opts)`, which returns `{ width, height, marks }`, where each mark is a thread, square, dash, box, ring (O or C) or x;
  - `toSvg(sheet, register)`.
  - It's deterministic and has no DOM access.
- `app/(generators)/asemic/page.tsx` and `AsemicGenerator.tsx`: the page and its controls.
- `scripts/asemic-check.ts`, plus `"asemic:check"` in `package.json`.
- `app/(generators)/layout.tsx`: the nav entry.
- `lib/provisional.ts`: the CH-10 record. `app/(system)/logo/page.tsx` gets its compact notice.

## The check (`npm run asemic:check`)

It asserts that:
- the same text, seed and options give a byte-identical SVG, and a different seed gives a different one;
- the same word at two positions gives different clusters, so there's no cipher;
- every mark lies inside the sheet margins and inside its own row band, so no cluster crosses into another row;
- only x marks use dusk, in both registers;
- punctuation and short words become marks, and longer words become clusters;
- a line break becomes a rest (a bare dotted thread).

## What's left to the builder

- How the controls are laid out, and the exact pixel sizes of the formats.
- How U scales with format and row count. *(My call, from the review:)* set U from the row height, so the tallest possible cluster (amplitude 4, plus the jitter and the hatching that reaches twice the envelope) stays inside half a row. The sketch's ratio breaks this slightly, so the sheet comes out a little airier than the sketch.
- How the density presets map onto 0.45 to 0.8.
- How files are split within `lib/asemic`.
- Whether the PNG export rasterises at 2× or matches the format size.
