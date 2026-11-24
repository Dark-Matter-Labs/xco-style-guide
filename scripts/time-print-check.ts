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
  for (const v of attrs(tp.body, "stroke").concat(attrs(tp.body, "fill"))) assert.ok([INK, PAPER, DUSK].includes(v), `colour ${v} is ink, the ground or dusk`);
  const xs = tp.sheet.marks.filter((m) => m.kind === "x").length;
  assert.ok(xs > 0, "the print has an x");
  eq((tp.body.match(new RegExp(DUSK, "g")) || []).length, xs, "dusk only on the x");

  const g = makeTimePrint({ ...base, ground: null });
  const beads = g.sheet.marks.filter((m) => m.kind === "box" || m.kind === "ring").length;
  assert.ok(beads > 0, "the print has beads");
  eq(attrs(g.body, "fill").filter((v) => v === "none").length, beads, "on a gradient, knock-outs are unfilled");
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

  const Probe = () => (useMinute() === null ? "none" : "some");
  eq(renderToStaticMarkup(h(Probe)), "none", "no minute on the server, so static pages hydrate cleanly");

  console.log("time-print: all checks passed");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
