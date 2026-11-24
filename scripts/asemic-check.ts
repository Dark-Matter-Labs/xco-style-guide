// Assert-based check for the xCO asemic script. Run: npm run asemic:check
//
// What must never break: the same input writes the same sheet; it is open
// writing, not a cipher; every mark stays in its margins and its own row; only
// the x carries dusk; and odd input (nothing, punctuation, one huge word,
// accented names) is handled.

import { strict as assert } from "node:assert";
import { DENSITY, DUSK, INK, toSvg, tokenize, writeSheet, type Mark, type Sheet } from "@/lib/asemic/script";
import { SOURCES } from "@/lib/asemic/sources";

const eq: typeof assert.equal = assert.equal;
const O = { width: 1000, height: 1000, margin: 70, rows: 20, seed: "7", density: DENSITY.normal };
const T = SOURCES[0].text;

// ── Tokens ───────────────────────────────────────────────────────────
assert.deepEqual(tokenize("We, the field.\nNext"), ["We", ",", "the", "field", ".", "¶", "Next", "¶"]);
assert.deepEqual(tokenize("Søren and Zoë"), ["Søren", "and", "Zoë", "¶"], "accented names are words");
// Names with combining marks stay whole (Gurmukhi, Devanagari, a decomposed Zoë).
assert.deepEqual(tokenize("ਗੁਰਦੇਨ"), ["ਗੁਰਦੇਨ", "¶"], "Gurmukhi name is one word");
assert.deepEqual(tokenize("हिन्दी"), ["हिन्दी", "¶"], "Devanagari word is one word");
assert.deepEqual(tokenize("Zoe\u0308"), ["Zoe\u0308", "¶"], "a decomposed diaeresis stays on its letter");
// Digits are part of words, and a version keeps its point.
assert.deepEqual(tokenize("CH-10, v0.2 in 2026."), ["CH-10", ",", "v0.2", "in", "2026", ".", "¶"], "numbers and versions survive");
eq(SOURCES.length, 3);
assert.ok(SOURCES.find((s) => s.id === "propositions")!.text.includes("Withdrawn in v0.2: the pilots showed its value depends on who holds the right to change course."), "the withdrawn claim matches /x-demo");

// ── The same input always writes the same sheet ─────────────────────
eq(toSvg(writeSheet(T, O), "paper", "x"), toSvg(writeSheet(T, O), "paper", "x"));
assert.notEqual(toSvg(writeSheet(T, O), "paper", "x"), toSvg(writeSheet(T, { ...O, seed: "8" }), "paper", "x"));

// ── Not a cipher: the same word in two places looks different ───────
{
  const s = writeSheet("option option", { ...O, rows: 1 });
  const shape = (tok: number) => {
    const ms = s.marks.filter((m) => m.token === tok && !(m.kind === "thread" && m.dotted));
    const x0 = Math.min(...ms.map((m) => ("x" in m ? m.x : m.x1)));
    return JSON.stringify(ms.map((m) => ({ ...m, token: 0, ...("x" in m ? { x: +(m.x - x0).toFixed(2) } : { x1: +(m.x1 - x0).toFixed(2), x2: +(m.x2 - x0).toFixed(2) }) })));
  };
  assert.notEqual(shape(0), shape(1), "the same word at two positions gives different clusters");
}

// ── Every mark inside the margins and inside its own row ────────────
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
function allInside(s: Sheet, what: string) {
  assert.ok(s.marks.length > 0, `${what}: has marks`);
  for (const m of s.marks) {
    const e = extent(m), top = s.margin + m.row * s.rowHeight, bottom = top + s.rowHeight;
    assert.ok(e.x1 >= s.margin - 0.01 && e.x2 <= s.width - s.margin + 0.01, `${what}: ${m.kind} inside the side margins (${e.x1.toFixed(1)}–${e.x2.toFixed(1)})`);
    assert.ok(e.y1 >= top - 0.01 && e.y2 <= bottom + 0.01, `${what}: ${m.kind} inside row ${m.row}`);
  }
}
allInside(writeSheet(T, O), "tone note");
allInside(writeSheet(T, { ...O, density: DENSITY.dense }), "dense");
allInside(writeSheet(T, { ...O, rows: 8 }), "8 rows");
allInside(writeSheet("Optionality".repeat(30), O), "one huge word");
for (const src of SOURCES) allInside(writeSheet(src.text, O), src.id);

// ── Words, short words, punctuation and line breaks ─────────────────
{
  const text = "We, the field.\nNext";
  const toks = tokenize(text), s = writeSheet(text, O);
  const tokOf = (m: Mark) => toks[m.token % toks.length];
  const L = new RegExp("\\p{L}|\\p{N}", "u"); // constructor: the repo's TS target rejects the u flag in literals
  const letters = (t: string) => Array.from(t).filter((c) => L.test(c)).length;
  for (const m of s.marks) if (m.kind === "thread" && !m.dotted) assert.ok(letters(tokOf(m)) > 3, `a solid thread belongs to a long word, not "${tokOf(m)}"`);
  assert.ok(s.marks.some((m) => m.kind === "thread" && !m.dotted && tokOf(m) === "field"), "a word over 3 letters becomes a cluster");
  assert.ok(s.marks.some((m) => m.kind === "thread" && m.dotted && tokOf(m) === "¶"), "a line break becomes a rest");
}

// ── The x opens the thread ───────────────────────────────────────────
{
  const s = writeSheet(T, O);
  const xs = s.marks.filter((m): m is Extract<Mark, { kind: "x" }> => m.kind === "x");
  assert.ok(xs.length > 0, "the sheet has at least one x");
  for (const x of xs) {
    const through = s.marks.some((m) => m.kind === "thread" && !m.dotted && m.row === x.row && m.x1 < x.x && x.x < m.x2);
    assert.ok(!through, "no solid thread runs under an x");
  }
}

// ── Beads sit on top: drawn after their cluster's thread and dashes, so the O, C and box stay clean ──
{
  const s = writeSheet(T, O);
  const byToken = new Map<number, number[]>();
  s.marks.forEach((m, i) => byToken.set(m.token, [...(byToken.get(m.token) ?? []), i]));
  let beadsSeen = 0;
  for (const idx of Array.from(byToken.values())) {
    const lines = idx.filter((i) => s.marks[i].kind === "thread" || s.marks[i].kind === "dash");
    const beads = idx.filter((i) => ["box", "ring", "x"].includes(s.marks[i].kind));
    if (!lines.length || !beads.length) continue;
    beadsSeen += beads.length;
    assert.ok(Math.min(...beads) > Math.max(...lines), "every bead is drawn after its cluster's thread and dashes");
  }
  assert.ok(beadsSeen > 20, "the sheet has beads to check");
}

// ── Only the x carries dusk; the ink register paints its own ground ──
for (const reg of ["paper", "ink"] as const) {
  const s = writeSheet(T, O), svg = toSvg(s, reg, "label");
  eq((svg.match(new RegExp(DUSK, "g")) || []).length, s.marks.filter((m) => m.kind === "x").length, `${reg}: dusk only on the x`);
}
assert.ok(toSvg(writeSheet(T, O), "ink", "label").includes(`<rect width="1000" height="1000" fill="${INK}"/>`), "ink register has its own ground");

// ── Nothing to write ─────────────────────────────────────────────────
eq(writeSheet("", O).marks.length, 0, "empty text writes nothing");
assert.ok(writeSheet("...", O).marks.every((m) => !(m.kind === "thread" && !m.dotted)), "punctuation alone makes no clusters");

// ── The sheet fills, and knows which words landed in each row ───────
{
  const s = writeSheet(T, O);
  eq(Math.max(...s.marks.map((m) => m.row)), O.rows - 1, "repetition fills every row");
  eq(s.lines.length, O.rows);
  assert.ok(s.lines[0].startsWith(tokenize(T)[0]), "row 0 starts with the first word");
}

// ── The title is escaped ─────────────────────────────────────────────
{
  const svg = toSvg(writeSheet(T, O), "paper", 'a <b> & "c"');
  assert.ok(svg.includes("a &lt;b&gt; &amp; &quot;c&quot;") && !svg.includes("<b>"), "label escaped");
}

console.log("asemic: all checks passed");
