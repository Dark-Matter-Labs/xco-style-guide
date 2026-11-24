// Assert-based check for the text highlight instrument. Run: npm run text-highlight:check
//
// What must never break: fills come only from the highlight tokens and carry
// Matter 900 text that passes contrast; the sample uses no banned word; terms
// are found exactly once, longest first; lines stay inside the text column;
// and sidenotes never overlap.

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { bannedWords, highlightTokens } from "@/lib/design-tokens";
import { contrastRatio } from "@/lib/a11y/contrast";
import { BODY, HL_TEXT, NOTE, fillOf, layout, runsOf, type Annotation, type Measure } from "@/app/(generators)/text-highlight/artwork";

const eq: typeof assert.equal = assert.equal;
// A fixed-pitch stand-in for the browser's measureText: 0.5 em a character.
const measure: Measure = (t, font) => t.length * Number(/(\d+)px/.exec(font)![1]) * 0.5;

// ── Colour: the five role tokens behind Matter 900, every pair readable ──
for (const h of highlightTokens) {
  eq(fillOf(h.id), h.hex);
  const r = contrastRatio(HL_TEXT, h.hex);
  assert.ok(r >= 4.5, `Matter 900 on ${h.label} is ${r.toFixed(2)}:1, at least 4.5:1`);
}

// ── The sample (read from the source: the module is a client component) ──
const src = readFileSync("app/(generators)/text-highlight/TextHighlightGenerator.tsx", "utf8");
const sample = /const SAMPLE_TEXT =\s*"([^"]+)";/.exec(src)![1];
for (const w of bannedWords) {
  const re = new RegExp(`\\b${w.trim().replace(/ /g, "\\s+")}\\b`, "i");
  assert.ok(!re.test(sample), `the sample text avoids the banned "${w.trim()}"`);
}
assert.ok(!/font-?weight\s*[:=]\s*["{]?\s*(?!400)\d{3}/i.test(src), "the artwork asks for no weight but 400");
assert.ok(!/font-(medium|semibold|bold)/.test(src.slice(src.indexOf("const Artwork"), src.indexOf("function useMeasure"))), "the artwork uses no weight utility");

// ── Terms: first occurrence, any case, longest first, no overlaps ────
const A = (id: number, term: string, role: Annotation["role"] = "premise"): Annotation => ({ id, term, role, note: `note ${id}` });
{
  const runs = runsOf("The Field and the field of fields.", [A(1, "field"), A(2, "the field of")]);
  const marked = runs.filter((r) => r.ann).map((r) => [r.ann!.id, r.text]);
  assert.deepEqual(marked, [[1, "Field"], [2, "the field of"]], "case-insensitive, first free occurrence, longest first");
  eq(runs.map((r) => r.text).join(""), "The Field and the field of fields.", "runs rebuild the text exactly");
  eq(runsOf("abc", [A(1, "")]).length, 1, "an empty term marks nothing");
}

// ── Layout: inside the column, notes in order and apart ──────────────
{
  const anns = [A(1, "alpha"), A(2, "beta gamma", "transition"), A(3, "delta", "condition")];
  const text = Array.from({ length: 40 }, (_, i) => (i === 3 ? "alpha" : i === 4 ? "beta gamma" : i === 5 ? "delta" : "word")).join(" ");
  const L = layout(text, anns, measure);
  assert.ok(L.lines.length > 1, "a long passage wraps");
  for (const line of L.lines) {
    const end = Math.max(...line.pieces.map((p) => p.x + p.w));
    assert.ok(end <= 64 + 660 + 1, `line at ${line.y} ends inside the column (${end.toFixed(0)})`);
    assert.ok(!/^\s+$/.test(line.pieces[0].text) && !/^\s+$/.test(line.pieces[line.pieces.length - 1].text), "no line starts or ends on a space");
  }
  eq(L.notes.length, 3, "every term found gets its note");
  for (let i = 1; i < L.notes.length; i++) {
    const prev = L.notes[i - 1];
    assert.ok(L.notes[i].y >= prev.y + prev.lines.length * NOTE.line, "sidenotes never overlap");
  }
  const numbers = L.lines.flatMap((l) => l.pieces).filter((p) => p.num).map((p) => p.text);
  assert.deepEqual(numbers, ["1", "2", "3"], "each term carries its number once, after its last word");
  assert.ok(L.height >= L.lines[L.lines.length - 1].y, "the artwork holds its last line");
  eq(layout("no terms here", [A(1, "absent")], measure).notes.length, 0, "a term not in the text has no note");
  const back = layout("first beta then alpha", [A(1, "alpha"), A(2, "beta")], measure);
  assert.deepEqual(back.notes.map((n) => n.ann.id), [2, 1], "notes follow their terms' reading order, not their numbers");
  eq(BODY.font.startsWith("400 "), true, "body text is set at 400");
}

console.log("text-highlight: all checks passed");
