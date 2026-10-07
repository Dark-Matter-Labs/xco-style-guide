// Measures the logotype's letter spacing optically. Run: npm run logo:spacing
//
// Spacing a wordmark by eye drifts; this makes it a number. The method is the
// one letterspacing tools (HT Letterspacer) use:
//
//   1. Render each glyph on its own, at the geometry in lib/logo.ts.
//   2. For every row in the measurement zone, take the white between the left
//      glyph's right profile and the right glyph's left profile.
//   3. Clamp each profile to a fixed DEPTH behind that glyph's own extreme, so
//      an open form — the C's mouth, the notch between the x's arms — counts
//      as deep but finite rather than as infinite white.
//   4. The mean white per row is the pair's optical gap.
//
// Two pairs are well spaced when their optical gaps match. The zone is the
// x's band — centred on the C's centre line — the only band all three glyphs
// share and the line the eye reads the word along. The result is checked at three depths so a conclusion
// cannot hinge on one choice of clamp.
//
// Exits non-zero if the pairs drift more than TOLERANCE apart at any depth.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const sharp = require("sharp");

const ROOT = process.cwd();
const TMP = path.join(ROOT, ".logo-spacing");

const DEPTHS = [8, 12, 16];       // logo units; cap height is 100
const TOLERANCE = 0.1;            // pairs may differ by at most 10%
const SCALE = 20;                 // raster pixels per logo unit

mkdirSync(TMP, { recursive: true });
const js = ts.transpileModule(readFileSync(path.join(ROOT, "lib/logo.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
writeFileSync(path.join(TMP, "logo.mjs"), js);
const logo = await import(`file://${path.join(TMP, "logo.mjs")}`);
rmSync(TMP, { recursive: true, force: true });

const g = logo.logoGeometry;
const W = Math.ceil(g.width * SCALE);
const H = Math.ceil(g.height * SCALE);

const stroke = (d) =>
  `<path d="${d}" fill="none" stroke="#000" stroke-width="${g.stroke}" stroke-linecap="butt"/>`;

/** Rasterise one glyph and return an ink test for pixel (x, y). */
async function inkOf(inner) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" ` +
    `viewBox="0 0 ${g.width} ${g.height}">${inner}</svg>`;
  const { data } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return (x, y) => data[(y * W + x) * 4 + 3] > 127;
}

/** Per row, the outermost ink column on one side, in logo units (or null). */
function profile(ink, side) {
  const rows = new Array(H).fill(null);
  for (let y = 0; y < H; y++) {
    if (side === "right") {
      for (let x = W - 1; x >= 0; x--) if (ink(x, y)) { rows[y] = x / SCALE; break; }
    } else {
      for (let x = 0; x < W; x++) if (ink(x, y)) { rows[y] = x / SCALE; break; }
    }
  }
  return rows;
}

const glyphs = {
  x: await inkOf(`<path d="${logo.xPath()}" fill="#000"/>`),
  C: await inkOf(stroke(logo.cPath())),
  O: await inkOf(stroke(logo.oPath())),
};
const prof = Object.fromEntries(
  Object.entries(glyphs).map(([k, ink]) => [k, { left: profile(ink, "left"), right: profile(ink, "right") }]),
);

function opticalGap(left, right, zone, depth) {
  const y0 = Math.round(zone[0] * SCALE);
  const y1 = Math.round(zone[1] * SCALE);
  const r = prof[left].right.slice(y0, y1);
  const l = prof[right].left.slice(y0, y1);
  const extremeL = Math.max(...r.filter((v) => v !== null));
  const extremeR = Math.min(...l.filter((v) => v !== null));
  let sum = 0;
  for (let i = 0; i < r.length; i++) {
    const edgeL = Math.max(r[i] ?? -Infinity, extremeL - depth);
    const edgeR = Math.min(l[i] ?? Infinity, extremeR + depth);
    sum += edgeR - edgeL;
  }
  return sum / r.length;
}

const zone = [g.xTop, g.xBottom];

console.log(`gaps (metric):  x→C ${g.gapXC}   C→O ${g.gapCO}`);
console.log(`zone: the x's band ${zone[0]}–${zone[1]} · depths ${DEPTHS.join(", ")}\n`);
console.log("  depth    x→C     C→O    ratio");

let worst = 0;
for (const depth of DEPTHS) {
  const xC = opticalGap("x", "C", zone, depth);
  const CO = opticalGap("C", "O", zone, depth);
  const ratio = CO / xC;
  worst = Math.max(worst, Math.abs(ratio - 1));
  console.log(
    `  ${String(depth).padStart(4)}   ${xC.toFixed(2).padStart(6)}  ${CO.toFixed(2).padStart(6)}   ${ratio.toFixed(2)}×`,
  );
}

if (worst > TOLERANCE) {
  console.error(
    `\nSpacing is uneven: pairs differ by up to ${(worst * 100).toFixed(0)}% ` +
      `(tolerance ${TOLERANCE * 100}%). Adjust GAP_XC / GAP_CO in lib/logo.ts.`,
  );
  process.exitCode = 1;
} else {
  console.log(`\nbalanced — pairs within ${(worst * 100).toFixed(1)}% of each other`);
}
