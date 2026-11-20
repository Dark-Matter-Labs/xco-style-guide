// Assert-based check for the printed holiday card. Run: npm run card:check
//
// The printed card must grow the same pattern as the animated card for the same
// name. ORIGINAL holds the animated card's code verbatim (claude.ai artifact
// HB4ZaJgUoeCTN3Z4BE7nn9); if either side changes, this fails.

import { strict as assert } from "node:assert";
import { attractor, cardName, network, places } from "@/lib/holiday-card/pattern";

// ── The animated card's code, verbatim ───────────────────────────────
/* eslint-disable */
const ORIGINAL = (() => {
  function rng(seed: number){ let s = seed >>> 0 || 1; return () => (s = (s*1664525 + 1013904223) >>> 0) / 4294967296; }
  // @ts-ignore TS2802 under this repo's target; kept verbatim from the card, and tsx runs it fine.
  const hash = (str: string) => [...str].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  function cliffordParams(r: () => number){ for (let k = 0; k < 80; k++){ const p = [r()*4-2, r()*4-2, r()*3-1.5, r()*3-1.5], [a, b, c, d] = p, cells = new Set(); let x = .1, y = .1;
      for (let i = 0; i < 6000; i++){ const nx = Math.sin(a*y) + c*Math.cos(a*x); y = Math.sin(b*x) + d*Math.cos(b*y); x = nx; if (i > 100) cells.add(Math.floor((x+3)*8)*64 + Math.floor((y+3)*8)); }
      if (cells.size > 300) return p; } return [-1.4, 1.6, 1.0, 0.7]; }
  function setAttractor(seed: number){ const ATT = cliffordParams(rng(seed)); const [a, b, c, d] = ATT;
    let x = .1, y = .1, mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9; const trace: number[][] = [], marks: number[][] = [];
    for (let i = 0; i < 60000; i++){ const nx = Math.sin(a*y) + c*Math.cos(a*x); y = Math.sin(b*x) + d*Math.cos(b*y); x = nx;
      if (i > 100){ mnx = Math.min(mnx, x); mxx = Math.max(mxx, x); mny = Math.min(mny, y); mxy = Math.max(mxy, y);
        if (i > 20000 && i < 20140) trace.push([x, y]); if (i > 30000 && (i - 30000) % 2203 === 0 && marks.length < 13) marks.push([x, y]); } }
    return { ATT, minX:mnx, maxX:mxx, minY:mny, maxY:mxy, trace, marks }; }
  const nameFromHash = (h: string) => (h.slice(1).match(/^[A-Za-z-]{1,24}$/) || ["Ana"])[0].replace(/-/g, " ");
  return { hash, setAttractor, nameFromHash };
})();
/* eslint-enable */

// ── The port grows the same pattern as the animated card ─────────────
for (const typed of ["Ana", "Indy Johar", "Robyn", "Malik", "Martin", "Gurden", "Mary-Jane Watson"]) {
  const n = cardName(typed);
  assert.ok(n.linkable, `${typed} can be linked`);
  // The name the animated card reads from #slug is the one the print seeds from.
  assert.equal(ORIGINAL.nameFromHash("#" + n.slug), n.seedName, `${typed}: same name both sides`);
  const want = ORIGINAL.setAttractor(ORIGINAL.hash(n.seedName + "xCO2026"));
  const got = attractor(n.seedName);
  assert.deepEqual(got.p, want.ATT, `${typed}: same attractor`);
  assert.deepEqual([got.minX, got.maxX, got.minY, got.maxY], [want.minX, want.maxX, want.minY, want.maxY], `${typed}: same bounds`);
  assert.deepEqual(got.trace, want.trace, `${typed}: same ember trace`);
  assert.deepEqual(got.marks, want.marks, `${typed}: same 13 marks`);
}

// ── Names the animated card cannot show are flagged, not silently swapped ──
assert.equal(cardName("Søren").linkable, false, "non-ASCII names are flagged");
assert.equal(cardName("  Ana   Lopez ").slug, "Ana-Lopez", "spaces collapse to one hyphen");

// ── Every card is unique, and the figures stay true ──────────────────
const a = network("Ana"), b = network("Indy Johar");
assert.equal(a.nodes.length, 33);
assert.equal(a.links.length, 95);
assert.equal(new Set(a.links.map(([i, j]) => `${i}-${j}`)).size, 95, "95 distinct links");
assert.notDeepEqual(a.nodes, b.nodes, "two names give two networks");
assert.equal(places("Ana").length, 16);
assert.notDeepEqual(places("Ana").map((p) => [p.x, p.y]), places("Robyn").map((p) => [p.x, p.y]), "two names give two maps");
assert.notDeepEqual(attractor("Ana").p, attractor("Robyn").p, "two names give two patterns");

console.log("holiday-card: all checks passed");
