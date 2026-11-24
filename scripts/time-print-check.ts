// Assert-based check for the time print. Run: npm run time-print:check
//
// What must never break: the stamp names the maker's minute exactly (any time
// zone, across DST); the same words and minute make the same print; the marks
// take the artwork's own text colour and stay inside the margin; and nothing of
// it reaches the logo downloads or the PNG route.

// Set before any Date is read, so the DST case below runs in a known zone.
process.env.TZ = "Europe/Berlin";

import { strict as assert } from "node:assert";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, readdirSync } from "node:fs";
import { DENSITY, DUSK, toSvg, writeSheet, type Mark, type Sheet } from "@/lib/asemic/script";
import { SOURCES } from "@/lib/asemic/sources";
import { TIME_PRINT_OPACITY, makeTimePrint, minuteOf, msToNextMinute, paintMarks, slugSize, type Ctx2D } from "@/lib/asemic/time-print";

const eq: typeof assert.equal = assert.equal;
const INK = "#101F24", PAPER = "#F6F1E5";
const fnv = (s: string) => Array.from(s).reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

// ── toSvg is byte-identical after the marksBody refactor (pinned before it) ──
{
  const O = { width: 1000, height: 1000, margin: 70, rows: 20, seed: "7", density: DENSITY.normal };
  const paper = toSvg(writeSheet(SOURCES[0].text, O), "paper", "x");
  const ink = toSvg(writeSheet(SOURCES[0].text, O), "ink", "x");
  eq(paper.length, 538092, "toSvg is byte-identical after the refactor (paper length)");
  eq(fnv(paper), 874135700, "toSvg is byte-identical after the refactor (paper)");
  eq(ink.length, 538092, "toSvg is byte-identical after the refactor (ink length)");
  eq(fnv(ink), 1702707296, "toSvg is byte-identical after the refactor (ink)");
}

// ── The minute: local date, 24-hour time and UTC offset ─────────────
assert.deepEqual(minuteOf(new Date("2026-11-24T14:52:30Z"), 60), { seed: "2026-11-24T15:52+01:00", stamp: "2026-11-24 15:52 +01:00" });
eq(minuteOf(new Date("2026-11-24T14:52:30Z"), 330).stamp, "2026-11-24 20:22 +05:30", "half-hour offset");
eq(minuteOf(new Date("2026-11-24T14:52:30Z"), 0).stamp, "2026-11-24 14:52 +00:00", "zero offset");
eq(minuteOf(new Date("2026-11-25T02:30:00Z"), -180).stamp, "2026-11-24 23:30 -03:00", "negative offset crosses midnight");
eq(minuteOf(new Date("2026-11-25T02:30:00Z"), -180).seed, "2026-11-24T23:30-03:00", "seed is the stamp's date-time part");
// DST in Berlin: the default offset follows the clock change.
eq(minuteOf(new Date("2026-03-29T00:59:00Z")).stamp, "2026-03-29 01:59 +01:00", "before the clocks go forward");
eq(minuteOf(new Date("2026-03-29T01:00:00Z")).stamp, "2026-03-29 03:00 +02:00", "after the clocks go forward");

eq(msToNextMinute(Date.UTC(2026, 10, 24, 15, 52, 30, 250)), 29750, "time to the next minute");
eq(msToNextMinute(Date.UTC(2026, 10, 24, 15, 52, 0, 0)), 60000, "on a boundary, a whole minute");

// ── Stamp, label and source ──────────────────────────────────────────
const M = minuteOf(new Date("2026-11-24T14:52:30Z"), 60);
const base = { words: "Optionality is a public good", minute: M, width: 1200, height: 630, ink: INK, ground: PAPER };
{
  const tp = makeTimePrint(base);
  eq(tp.source, "artwork");
  eq(tp.stamp, "time print · 2026-11-24 15:52 +01:00");
  eq(tp.label, "Time print, 2026-11-24 15:52 +01:00.");
  for (const words of ["CH-10 v0.2", ""]) {
    const f = makeTimePrint({ ...base, words });
    eq(f.source, "identity", `"${words}" has too few letters, so the identity note`);
    eq(f.stamp, "time print · identity note · 2026-11-24 15:52 +01:00");
    eq(f.label, "Time print, 2026-11-24 15:52 +01:00.", "the label never names the source");
  }
  eq(makeTimePrint({ ...base, words: "Twelve letter" }).source, "artwork", "exactly 12 letters is enough");
  eq(makeTimePrint({ ...base, words: "Eleven lettr 2026" }).source, "identity", "11 letters and digits is not");
}

// ── Same input, same print; another minute, another print ───────────
eq(makeTimePrint(base).body, makeTimePrint(base).body);
assert.notEqual(makeTimePrint(base).body, makeTimePrint({ ...base, minute: minuteOf(new Date("2026-11-24T14:53:30Z"), 60) }).body);

// ── Rows from height ─────────────────────────────────────────────────
eq(makeTimePrint({ ...base, height: 630 }).sheet.rows, 11);
eq(makeTimePrint({ ...base, height: 300 }).sheet.rows, 8);
eq(makeTimePrint({ ...base, width: 1080, height: 1920 }).sheet.rows, 30);

// ── Colours: the artwork's text colour, its ground, dusk on the x only ──
const attrs = (body: string, name: string) => (body.match(new RegExp(`${name}="([^"]+)"`, "g")) || []).map((a) => a.slice(name.length + 2, -1));
{
  const tp = makeTimePrint(base);
  // A handful of compound paths, not one element per mark: thousands of nodes per copy made typing lag.
  const elements = (tp.body.match(/</g) || []).length;
  assert.ok(elements <= 8, `the print is a handful of elements (${elements})`);
  for (const v of attrs(tp.body, "stroke").concat(attrs(tp.body, "fill"))) assert.ok([INK, PAPER, DUSK].includes(v), `colour ${v} is ink, the ground or dusk`);
  const count = (s: { sheet: Sheet }, ...k: Mark["kind"][]) => s.sheet.marks.filter((m) => k.includes(m.kind)).length;
  const xs = count(tp, "x"), beads = count(tp, "box", "ring");
  assert.ok(xs > 0 && beads > 0, "the print has an x and beads");
  eq((tp.body.match(new RegExp(DUSK, "g")) || []).length, 1, "dusk on one path: the x's");
  // Every mark is drawn: one subpath per line and square, two per x, and each bead twice (knock-out, outline).
  const subpaths = (b: string) => (b.match(/M/g) || []).length;
  eq(subpaths(tp.body), count(tp, "thread", "dash", "square") + 2 * xs + 2 * beads, "every mark is drawn");
  eq(attrs(tp.body, "fill").filter((v) => v === PAPER).length, 1, "the knock-outs are one path in the ground colour");

  const g = makeTimePrint({ ...base, ground: null });
  eq(subpaths(g.body), count(g, "thread", "dash", "square") + 2 * count(g, "x") + count(g, "box", "ring"), "on a gradient, beads are outlined but not knocked out");
  assert.ok(!g.body.includes(PAPER), "on a gradient, no ground colour is painted");
}
eq(TIME_PRINT_OPACITY, 0.06);
eq(slugSize(13, 60), 13);
eq(slugSize(20, 40), 40 / 3);

// ── Bounds: every mark inside the 4% margin, for every format ───────
function extent(m: Mark) {
  switch (m.kind) {
    case "thread": return { x1: m.x1, x2: m.x2, y1: m.y, y2: m.y };
    case "square": return { x1: m.x - m.size / 2, x2: m.x + m.size / 2, y1: m.y - m.size / 2, y2: m.y + m.size / 2 };
    case "dash": return { x1: m.x, x2: m.x + m.w, y1: m.y, y2: m.y };
    case "box": return { x1: m.x - m.w / 2, x2: m.x + m.w / 2, y1: m.y - m.h / 2, y2: m.y + m.h / 2 };
    case "ring": return { x1: m.x - m.r, x2: m.x + m.r, y1: m.y - m.r, y2: m.y + m.r };
    case "x": return { x1: m.x - m.k, x2: m.x + m.k, y1: m.y - (m.k * 62) / 56, y2: m.y + (m.k * 62) / 56 };
  }
}
function inside(s: Sheet, what: string) {
  const margin = 0.04 * Math.min(s.width, s.height);
  eq(s.margin, margin, `${what}: margin is 4% of the shorter side`);
  assert.ok(s.marks.length > 0, `${what}: has marks`);
  for (const m of s.marks) {
    const e = extent(m);
    assert.ok(e.x1 >= margin - 0.01 && e.x2 <= s.width - margin + 0.01 && e.y1 >= margin - 0.01 && e.y2 <= s.height - margin + 0.01, `${what}: ${m.kind} inside the margin`);
  }
}
for (const [w, h] of [[1200, 630], [1080, 1080], [794, 1123], [1200, 1200], [1080, 1350], [1080, 1920]]) {
  inside(makeTimePrint({ ...base, width: w, height: h }).sheet, `${w}×${h}`);
  inside(makeTimePrint({ ...base, width: w, height: h, words: "Optionality".repeat(60) }).sheet, `${w}×${h}, one huge word`);
}

// ── Timing: regrowing the largest format while someone types ────────
{
  const runs = Array.from({ length: 5 }, () => {
    const t0 = performance.now();
    makeTimePrint({ ...base, words: SOURCES[0].text, width: 1080, height: 1920 });
    return performance.now() - t0;
  }).sort((a, b) => a - b);
  console.log(`time-print: median regrowth at 1080×1920 is ${runs[2].toFixed(1)} ms`);
  assert.ok(runs[2] < 16, `regrowth under 16 ms (was ${runs[2].toFixed(1)} ms)`);
}

// ── The canvas painter draws the same marks ─────────────────────────
{
  const tp = makeTimePrint(base);
  const log: { op: string; fill: string; stroke: string }[] = [];
  const ctx = {
    fillStyle: "", strokeStyle: "", lineWidth: 1,
    setLineDash() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, rect() {},
    fill() { log.push({ op: "fill", fill: String(ctx.fillStyle), stroke: String(ctx.strokeStyle) }); },
    stroke() { log.push({ op: "stroke", fill: String(ctx.fillStyle), stroke: String(ctx.strokeStyle) }); },
  };
  paintMarks(ctx as Ctx2D, tp.sheet, INK, PAPER);
  const count = (k: Mark["kind"]) => tp.sheet.marks.filter((m) => m.kind === k).length;
  const strokes = log.filter((l) => l.op === "stroke"), fills = log.filter((l) => l.op === "fill");
  // Threads, dashes and x are lines; boxes and rings are outlined too.
  eq(strokes.length, count("thread") + count("dash") + count("x") + count("box") + count("ring"), "one stroke per line and per bead outline");
  eq(strokes.filter((l) => l.stroke === DUSK).length, count("x"), "dusk strokes only the x");
  eq(fills.filter((l) => l.fill === PAPER).length, count("box") + count("ring"), "knock-outs fill with the ground");
  eq(fills.filter((l) => l.fill === INK).length, count("square"), "squares fill with the text colour");

  log.length = 0;
  paintMarks(ctx as Ctx2D, tp.sheet, INK, null);
  eq(log.filter((l) => l.op === "fill").length, count("square"), "on a gradient, no knock-out fills");
}

// ── No leaks into the logo downloads or the PNG route ───────────────
{
  const files = ["app/api/export/png/route.ts", "app/(system)/logo/LogoDownloads.tsx", ...readdirSync("lib").filter((f) => f.startsWith("logo") && f.endsWith(".ts")).map((f) => `lib/${f}`)];
  for (const f of files) assert.ok(!readFileSync(f, "utf8").includes("time-print"), `${f} never imports the time print`);
}

// ── The React pieces (rendered to markup; see the plan's Global Constraints) ──
// tsx compiles JSX with the classic transform (tsconfig jsx: preserve), so React must be global
// before any component module loads; the imports are dynamic for that reason.
(globalThis as unknown as { React: typeof React }).React = React;

(async () => {
  const { TimePrintMarks, TimePrintSlug, useMinute } = await import("@/components/xco/TimePrint");
  const tp = makeTimePrint(base);
  const h = React.createElement;

  const marks = renderToStaticMarkup(h("svg", null, h(TimePrintMarks, { print: tp })));
  assert.ok(marks.includes('<g opacity="0.06" aria-hidden="true"'), "the marks group is faint and hidden from assistive tech");
  assert.ok(marks.includes(tp.body.slice(0, 60)), "the marks group holds the print's marks");

  const slugX = (html: string) => Number(/translate\(([\d.]+) /.exec(html)![1]);
  const slug = renderToStaticMarkup(h("svg", null, h(TimePrintSlug, { print: tp, width: 1200, height: 630, margin: 80, bottom: 80, size: 13 })));
  for (const part of ["rotate(-90)", tp.stamp, "Untitled Sans", INK]) assert.ok(slug.includes(part), `the slug carries ${part}`);
  assert.ok(slugX(slug) > 1200 - 80 && slugX(slug) < 1200, "a right slug sits in the right margin");
  const left = renderToStaticMarkup(h("svg", null, h(TimePrintSlug, { print: tp, width: 1080, height: 1080, margin: 60, bottom: 60, size: 12, side: "left" })));
  assert.ok(slugX(left) < 60, "a left slug sits in the left margin");
  const hung = renderToStaticMarkup(h("svg", null, h(TimePrintSlug, { print: tp, width: 1200, height: 630, margin: 80, bottom: 80, size: 13, top: 80 })));
  assert.ok(hung.includes("translate(") && / 80\) rotate\(-90\)/.test(hung) && hung.includes('text-anchor="end"'), "a slug can hang from the top padding instead");

  const Probe = () => (useMinute() === null ? "none" : "some");
  eq(renderToStaticMarkup(h(Probe)), "none", "no minute on the server, so static pages hydrate cleanly");

  // ── Task 3: social card and paper cover ─────────────────────────────
  const prop = { minute: M, words: "Optionality is a public good" };
  const groundAt = (html: string, w: number, hgt: number) => {
    const g = new RegExp(`<rect width="${w}" height="${hgt}" fill="[^"]*"(?:/>|></rect>)`).exec(html);
    assert.ok(g, `ground rect ${w}×${hgt} found`);
    return g!.index + g![0].length;
  };
  const lastText = (html: string) => html.slice(html.lastIndexOf("<text"));
  function checkArtwork(what: string, html: string, w: number, hgt: number, margin: number, ink: string, gradient: boolean) {
    eq(html.indexOf('<g opacity="0.06"'), groundAt(html, w, hgt), `${what}: the print sits right after the ground`);
    const slug = lastText(html);
    assert.ok(slug.includes("time print ·") && html.endsWith("</text></svg>"), `${what}: the slug is the last thing drawn`);
    assert.ok(slugX(slug) > w - margin && slugX(slug) < w, `${what}: the slug sits in the right margin (${slugX(slug).toFixed(1)})`);
    assert.ok(slug.includes(`fill="${ink}"`), `${what}: the slug takes the artwork's text colour`);
    // The filled paths inside the group: squares, plus the knock-outs on a single-colour ground.
    const open = html.indexOf(">", html.indexOf('<g opacity="0.06"')) + 1;
    const layer = html.slice(open, html.indexOf("</g>", open));
    eq((layer.match(/<path fill=/g) || []).length, gradient ? 1 : 2, `${what}: knock-outs ${gradient ? "skipped on a gradient" : "filled with the ground"}`);
    return slugX(slug);
  }
  // On the navy-to-dusk gradients the slug hangs from the top and must end before the teal stop
  // (55% down), measured in DM Mono, the wider face the PNG route renders it in (0.6 em a character).
  const endsInTheDark = (what: string, html: string, hgt: number) => {
    const slug = lastText(html);
    const top = Number(/translate\([\d.]+ ([\d.]+)\)/.exec(slug)![1]);
    const size = Number(/font-size="([\d.]+)"/.exec(slug)![1]);
    const text = />([^<]*)<\/text>/.exec(slug)![1].replace(/&#x27;/g, "'");
    const end = top + 0.6 * size * Array.from(text).length;
    assert.ok(end <= 0.55 * hgt + 0.01, `${what}: the slug ends in the dark part of the gradient (${end.toFixed(0)} of ${(0.55 * hgt).toFixed(0)})`);
  };
  const absent = (what: string, html: string) =>
    assert.ok(!html.includes('opacity="0.06"') && !html.includes("time print ·"), `${what}: no print when it is off`);

  const { PaperCoverDiagram } = await import("@/app/(generators)/paper-cover/PaperCoverDiagram");
  for (const visual of ["none", "abstract", "mark", "option-field", "territory"] as const) {
    const props = { paperNumber: "Paper 01", title: "Optionality", subtitle: "A field guide", authors: "Gurden", date: "May 2026", visual };
    checkArtwork(`paper cover ${visual}`, renderToStaticMarkup(h(PaperCoverDiagram, { ...props, timePrint: prop })), 794, 1123, 56, INK, false);
    absent(`paper cover ${visual}`, renderToStaticMarkup(h(PaperCoverDiagram, props)));
  }

  // ── Task 4: three regimes and option field ──────────────────────────
  const slugFont = (html: string) => Number(/font-size="([\d.]+)"/.exec(lastText(html))![1]);
  const { ThreeRegimesDiagram } = await import("@/app/(generators)/three-regimes/ThreeRegimesDiagram");
  const trProps = {
    labels: { frontier: "Frontier", fortress: "Fortress", field: "Field", fieldSublabel: "the commons" },
    relationshipStatement: "Field is the precondition for everything else", caption: "Three regimes", showAnnotations: true,
  };
  const MARGIN: Record<string, [number, number]> = { classic: [80, 100], orbital: [80, 100], nested: [50, 50], columns: [40, 40] };
  for (const format of ["hero", "square"] as const) {
    const hgt = format === "hero" ? 630 : 1200;
    for (const variant of ["classic", "nested", "columns", "orbital"] as const) {
      for (const colorScheme of ["standard", "blueprint"] as const) {
        const margin = MARGIN[variant][format === "hero" ? 0 : 1];
        const what = `three regimes ${format} ${variant} ${colorScheme}`;
        const html = renderToStaticMarkup(h(ThreeRegimesDiagram, { ...trProps, format, structuralVariant: variant, colorScheme, timePrint: prop }));
        checkArtwork(what, html, 1200, hgt, margin, INK, false);
        assert.ok(slugFont(html) <= margin / 3, `${what}: the slug is at most a third of its margin`);
      }
    }
  }
  absent("three regimes mark", renderToStaticMarkup(h(ThreeRegimesDiagram, { ...trProps, format: "mark", timePrint: prop })));
  absent("three regimes off", renderToStaticMarkup(h(ThreeRegimesDiagram, { ...trProps, format: "hero" })));

  const { OptionFieldDiagram } = await import("@/app/(generators)/three-regimes/OptionFieldDiagram");
  const ofProps = { fieldStr: 0.6, frontierStr: 0.5, fortressStr: 0.4, volatility: 0.5, resolution: 50 };
  for (const format of ["hero", "square"] as const) {
    for (const colorMode of ["ink", "spectrum", "inverted", "blueprint", "warmth"] as const) {
      const what = `option field ${format} ${colorMode}`;
      const html = renderToStaticMarkup(h(OptionFieldDiagram, { ...ofProps, format, colorMode, timePrint: prop }));
      checkArtwork(what, html, 1200, format === "hero" ? 630 : 1200, 64, colorMode === "inverted" || colorMode === "blueprint" ? PAPER : INK, false);
      assert.ok(lastText(html).includes("identity note"), `${what}: no words of its own, so the identity note`);
      absent(`${what} off`, renderToStaticMarkup(h(OptionFieldDiagram, { ...ofProps, format, colorMode })));
    }
  }
  absent("option field mark", renderToStaticMarkup(h(OptionFieldDiagram, { ...ofProps, format: "mark", colorMode: "ink", timePrint: prop })));

  // ── Task 5: event series (canvas) ───────────────────────────────────
  {
    const { SLUG, SLUG_EM, fitSize, slugPlacement } = await import("@/app/(generators)/event-series/render/time-print");
    // Like drawDetails, the slug shrinks to fit its run rather than overrun it.
    eq(fitSize(20, 500, 600), 20, "a slug that fits keeps its size");
    eq(fitSize(20, 600, 500), 20 * (500 / 600), "a slug that doesn't fit shrinks to its run");
    const { palettes } = await import("@/app/(generators)/event-series/render/palettes");
    const { cardFormats } = await import("@/lib/event-series/formats");
    const longest = "time print · identity note · 2026-11-24 15:52 +05:30";
    for (const f of cardFormats) {
      const { w: W, h: H } = f;
      const S = Math.min(W, H), u = S / 1000, m = 64 * u, tall = H > W * 1.4;
      const safeTop = tall ? H * 0.09 : 0, safeBottom = tall ? H * 0.11 : 0;
      const size = slugSize(22 * u, m);
      for (const template of ["window", "corner", "globe", "note-typographic", "note-diagram", "note-abstract"] as const) {
        const what = `event series ${template} ${f.id}`;
        const nominal = longest.length * size * SLUG_EM;
        const pl = slugPlacement(template, W, H, m, safeTop, safeBottom, size, nominal);
        const fitted = fitSize(size, nominal, pl.room);
        // On the abstract note's sweep the slug must end where paper type still reads, so it may shrink further.
        if (template === "note-abstract") assert.ok(pl.y + nominal * (fitted / size) <= H * 0.55 + 0.01, `${what}: the slug ends in the dark part of the sweep`);
        else assert.ok(fitted >= size * 0.85, `${what}: the longest stamp needs at most a 15% shrink (${nominal.toFixed(0)} into ${pl.room.toFixed(0)} px)`);
        const length = nominal * (fitted / size);
        eq(pl.side, SLUG[template].side, `${what}: on the side the template leaves clear`);
        if (pl.side === "left") assert.ok(pl.x < m, `${what}: in the left margin`);
        else assert.ok(pl.x > W - m && pl.x < W, `${what}: in the right margin`);
        // The run, wherever it is anchored, stays inside the story safe bands.
        const [a, b] = pl.from === "bottom" ? [pl.y - length, pl.y] : [pl.y, pl.y + length];
        assert.ok(a >= safeTop && b <= H - safeBottom, `${what}: inside the safe bands (${a.toFixed(0)}–${b.toFixed(0)})`);
        if (pl.from === "bottom" && !tall) eq(pl.y, H - m, `${what}: starts at the bottom padding`);
      }
    }
    eq(SLUG.corner.from, "top", "the corner's band crosses the right edge low down, so its slug hangs from the top");
    eq(SLUG["note-abstract"].from, "top", "on the navy-to-dusk sweep the slug hangs from the top, where paper type reads");
    // The notes (the old social card) print in their own text colour: ink on paper, paper on the sweep with no ground.
    {
      const { printColours } = await import("@/app/(generators)/event-series/render/time-print");
      const { programme: presets } = await import("@/lib/event-series/programme");
      const note = (template: "note-typographic" | "note-diagram" | "note-abstract") => ({ template, palette: "dusk" as const, imagery: "globe" as const, format: cardFormats[0], content: presets[0].content, titleFace: "xco" as const, uppercase: false, seed: 1 });
      assert.deepEqual(printColours(note("note-typographic")), { ink: INK, ground: PAPER }, "a paper note prints ink, knocked out in paper");
      assert.deepEqual(printColours(note("note-diagram")), { ink: INK, ground: PAPER });
      assert.deepEqual(printColours(note("note-abstract")), { ink: PAPER, ground: null }, "the sweep note prints paper with no knock-outs");
    }
    eq(palettes.dusk.onGround, INK, "on dusk the print is ink, as the palette's own text");
    eq(palettes.paper.onGround, INK);
    eq(palettes.ink.onGround, PAPER);

    // One minute, from the generator; the exporters only read the spec (Review Focus 1).
    const gen = readFileSync("app/(generators)/event-series/EventSeriesGenerator.tsx", "utf8");
    eq((gen.match(/useMinute\(\)/g) || []).length, 1, "the generator reads the minute once");
    assert.ok(/timePrint/.test(gen), "the generator puts the time print in the spec");
    const exp = readFileSync("app/(generators)/event-series/render/export.ts", "utf8");
    assert.ok(!exp.includes("useMinute") && !exp.includes("minuteOf"), "PNG and video take the minute the spec holds");

    // The canvas label says so.
    const { CardPreview } = await import("@/app/(generators)/event-series/CardPreview");
    const { programme } = await import("@/lib/event-series/programme");
    const spec = { template: "window" as const, palette: "dusk" as const, imagery: "globe" as const, format: cardFormats[0], content: programme[0].content, titleFace: "xco" as const, uppercase: false, seed: 1 };
    const assets = { fonts: { serif: "serif", sans: "sans", label: "sans", instrument: "serif" }, photo: null };
    const on = renderToStaticMarkup(h(CardPreview, { spec: { ...spec, timePrint: prop }, assets, playing: false, stillPhase: 0 }));
    assert.ok(on.includes("Time print, 2026-11-24 15:52 +01:00."), "the canvas label ends with the time print");
    const off = renderToStaticMarkup(h(CardPreview, { spec: { ...spec, timePrint: null }, assets, playing: false, stillPhase: 0 }));
    assert.ok(!off.includes("Time print"), "no time print, no sentence");
  }

  // ── Task 6: CH-11 ───────────────────────────────────────────────────
  {
    const { changeLog } = await import("@/lib/provisional");
    const ch = changeLog.find((c) => c.id === "CH-11");
    assert.ok(ch, "CH-11 is recorded");
    eq(ch!.status, "proposed");
    eq(ch!.href, "/logo#watermark");
    eq(ch!.proposedBy, "Indy");
    assert.ok((ch!.proposed ?? "").includes("proves nothing"), "CH-11 says the time print proves nothing");
    const logo = readFileSync("app/(system)/logo/page.tsx", "utf8");
    assert.ok(logo.includes('id="watermark"'), "the logo page's Watermark section has its anchor");
    assert.ok(/c\.id === "CH-11"\)!\} compact/.test(logo), "CH-11 shows compact on the logo page");
  }

  // The generator owns the minute; a diagram never reads the clock itself (Review Focus 1).
  for (const f of [
    "app/(generators)/paper-cover/PaperCoverDiagram.tsx",
    "app/(generators)/three-regimes/ThreeRegimesDiagram.tsx",
    "app/(generators)/three-regimes/OptionFieldDiagram.tsx", "app/(generators)/three-regimes/StructureView.tsx",
    "app/(generators)/three-regimes/FieldView.tsx", "app/(generators)/three-regimes/TerritoryView.tsx",
  ])
    assert.ok(!readFileSync(f, "utf8").includes("useMinute"), `${f} takes its minute from the generator`);

  // One Three Regimes instrument: one minute for every view, and none on the Territory view.
  {
    const shell = readFileSync("app/(generators)/three-regimes/ThreeRegimesGenerator.tsx", "utf8");
    eq((shell.match(/useMinute\(\)/g) || []).length, 1, "the Three Regimes instrument reads the minute once, for every view");
    assert.ok(/words !== null \? \{ minute, words \}/.test(shell), "a view without words gets no time print");
    const territory = readFileSync("app/(generators)/three-regimes/TerritoryView.tsx", "utf8");
    assert.ok(territory.includes("words: null") && !territory.includes("timePrint={"), "the Territory view carries no time print");
  }

  console.log("time-print: all checks passed");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
