// Renders the group marks to PNG. Run: npm run avatars
//
// This script only rasterises. The registry, the rules and the thresholds live
// in lib/group-marks.ts, which the logo page also reads — so the documentation
// and the generated files cannot drift. Geometry comes from lib/logo.ts.
//
// Signal masks avatars to a circle and lists them near 48px, so the mark sits
// well inside the inscribed circle and carries no text.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const sharp = require("sharp");

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/signal-groups");
const TMP = path.join(ROOT, ".avatar-build");

mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

// Transpile the TypeScript sources we need and import them. Parsing values out
// with regexes would be a second copy of them, which is the drift this repo
// keeps having to fix. Each module is transpiled alone, so none of them may
// import another — which is why group-marks.ts stores token NAMES and this
// script resolves them against design-tokens.ts.
function loadTs(rel, outName) {
  const js = ts.transpileModule(readFileSync(path.join(ROOT, rel), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const p = path.join(TMP, outName);
  writeFileSync(p, js);
  return import(`file://${p}`);
}

const logo = await loadTs("lib/logo.ts", "logo.mjs");
const tokens = await loadTs("lib/design-tokens.ts", "tokens.mjs");
const marks = await loadTs("lib/group-marks.ts", "marks.mjs");

const g = logo.logoGeometry;
const { paletteHex } = tokens;
const { groupMarks, groupColors } = marks;

/** Ground hex for a mark: a palette token, or one of the group colours. */
const groundHex = (m) =>
  m.ground.kind === "token" ? paletteHex[m.ground.token] : groupColors[m.ground.color].hex;

// ── Composition ───────────────────────────────────────────────────────

const BOX = 1024;
// Fraction of the square the lockup occupies. Signal masks to a circle, so a
// mark sized to the square would have its corners cut.
const SAFE = 0.58;
// Hairline ring at the circle's edge. 20px on a 1024px frame lands near 1px
// once scaled to a 48px listing.
const RING = 20;

const glyphW = g.cCx + g.cap / 2 - g.xLeft;
const scale = (BOX * SAFE) / Math.max(glyphW, g.cap);
const tx = BOX / 2 - (g.xLeft + glyphW / 2) * scale;
const ty = BOX / 2 - ((g.capTop + g.baseline) / 2) * scale;

const r = (n) => Math.round(n * 1000) / 1000;
const [xa, xb] = logo.xPaths();

function svgFor(m) {
  const bg = groundHex(m);
  const cCol = paletteHex[m.c];
  const xCol = paletteHex[m.x];
  const stroke = (d, fg) =>
    `<path d="${d}" fill="none" stroke="${fg}" stroke-width="${g.stroke}" stroke-linecap="butt"/>`;

  // Only the C rotates, about its own centre, so the lockup keeps reading
  // left to right.
  const c =
    `<g transform="rotate(${-m.aperture} ${g.cCx} ${g.midY})">${stroke(logo.cPath(), cCol)}</g>`;

  // Drawn on the circle Signal masks to, so it survives the crop exactly.
  const ring =
    `<circle cx="${BOX / 2}" cy="${BOX / 2}" r="${BOX / 2 - RING / 2}" ` +
    `fill="none" stroke="${cCol}" stroke-width="${RING}" stroke-opacity="0.32"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${BOX}" height="${BOX}" viewBox="0 0 ${BOX} ${BOX}">` +
    `<rect width="${BOX}" height="${BOX}" fill="${bg}"/>${ring}` +
    `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(scale)})">` +
    `${stroke(xa, xCol)}${stroke(xb, xCol)}${c}</g></svg>`
  );
}

for (const m of groupMarks) {
  const buf = await sharp(Buffer.from(svgFor(m))).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(path.join(OUT, `${m.file}.png`), buf);
  console.log(
    `${m.file}.png`.padEnd(36),
    `aperture ${String(m.aperture).padStart(3)}°   ${m.name}`,
  );
}

// The invariant, checked on every run rather than trusted.
const failing = marks.auditPairs(groundHex).filter((p) => p.failing);
console.log(`\n${BOX}×${BOX} px · glyph inside ${Math.round(SAFE * 100)}% of the frame`);
console.log("geometry from lib/logo.ts · registry from lib/group-marks.ts");

if (failing.length) {
  console.error(`\n${failing.length} pair(s) weak on BOTH channels:`);
  for (const p of failing) {
    console.error(`  ${p.a} vs ${p.b} — value ${p.value.toFixed(2)}:1, angle ${p.angle}°`);
  }
  process.exitCode = 1;
} else {
  console.log("pair audit: no pair weak on both channels");
}

rmSync(TMP, { recursive: true, force: true });
