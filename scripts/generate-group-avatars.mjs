// Signal group avatars for the four xCO groups.
// Run: npm run avatars
//
// Signal masks avatars to a circle and lists them at roughly 48px, so this
// follows the favicon's constraint: one glyph, no text, everything well inside
// the inscribed circle.
//
// The family reads as one system because every avatar is the same lockup — the
// lowercase x and the apertured C, at lib/logo.ts geometry. Groups are told
// apart by TWO channels, never colour alone, which is the rule the colour page
// sets for semantic meanings and the reason the domain marks carry shapes:
//
//   channel 1   ground colour, one documented palette tone each
//   channel 2   the angle of the C's aperture
//
// The second channel is what keeps them distinguishable in greyscale, for a
// colour-blind reader, and under forced colours. It is also the logotype's own
// argument made literal: the same circle, at a different openness.

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

// Load the real geometry rather than re-deriving it — a second copy of these
// numbers is the drift this repo keeps having to fix.
const js = ts.transpileModule(readFileSync(path.join(ROOT, "lib/logo.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
writeFileSync(path.join(TMP, "logo.mjs"), js);
const logo = await import(`file://${path.join(TMP, "logo.mjs")}`);
const g = logo.logoGeometry;

const INK = "#20201e";
const PAPER = "#f4f1e9";
const DUSK = "#ff5a00";
const OCEAN = "#005096";
const SAND = "#ffa064";

// Each avatar uses one of the three documented logo variants, set on a palette
// ground. No group is assigned a domain colour or domain shape: those channels
// mean "biophysical / institutional / technological / cultural", and these
// groups are places and tracks, not domains.
const groups = [
  {
    file: "xco",
    name: "xCO",
    ground: PAPER,
    c: INK,
    // The plain ink variant, not the dusk one. Dusk on paper measures 2.77:1,
    // under the 3:1 WCAG non-text bar, and the x is load-bearing here rather
    // than decorative. Dusk stays on the ink ground below, where it clears at
    // 5.22:1 — which also keeps the accent to one instance across the set.
    x: INK,
    aperture: 0, // canonical: opening right
    why: "Parent group — the default ink variant, unrotated.",
  },
  {
    file: "xco-berlin-medulla",
    name: "xCO-Berlin/Medulla",
    ground: INK,
    c: PAPER,
    x: DUSK, // paper-on-ink, the inverse register
    aperture: 90, // opening up
    why: "Inverse register.",
  },
  {
    file: "xco-oceans-continuity-studio",
    name: "xCO-Oceans Continuity Studio",
    ground: OCEAN,
    c: PAPER,
    x: PAPER, // paper variant — dusk on ocean is a chroma clash
    aperture: 180, // opening left
    why: "Ocean, the documented structural blue.",
  },
  {
    file: "xco-india",
    name: "xCO-India",
    ground: SAND,
    c: INK,
    x: INK, // ink variant — dusk on sand sits too close in hue
    aperture: 270, // opening down
    why: "Sand, the warm field register.",
  },
];

// ── Composition ───────────────────────────────────────────────────────

const BOX = 1024;
// The glyph occupies this fraction of the square. Signal masks to a circle, so
// the lockup sits comfortably inside the inscribed circle rather than filling
// the frame — a mark that fits the square gets its corners cut.
const SAFE = 0.58;

const glyphW = g.cCx + g.cap / 2 - g.xLeft; // x left edge to C right edge
const glyphH = g.cap;
const scale = (BOX * SAFE) / Math.max(glyphW, glyphH);
const tx = BOX / 2 - (g.xLeft + glyphW / 2) * scale;
const ty = BOX / 2 - ((g.capTop + g.baseline) / 2) * scale;

// A hairline ring at the circle's edge, in the avatar's own foreground.
// Signal's dark list background sits at roughly #1b1b1b, which is within a
// shade of ink — without this the inverse-register avatar has no visible edge
// and reads as a hole. The ring is the system's own answer: structure is
// drawn, not shadowed. Applied to all four so the set stays consistent.
// 20px on a 1024px frame lands at ~1px once Signal scales to 48px.
const RING = 20;

const r = (n) => Math.round(n * 1000) / 1000;
const [xa, xb] = logo.xPaths();

function svgFor(grp) {
  const stroke = (d, fg) =>
    `<path d="${d}" fill="none" stroke="${fg}" stroke-width="${g.stroke}" stroke-linecap="butt"/>`;

  // Rotate only the C, about its own centre, so the x stays put and the lockup
  // keeps reading left to right.
  const c =
    `<g transform="rotate(${-grp.aperture} ${g.cCx} ${g.midY})">` +
    `${stroke(logo.cPath(), grp.c)}</g>`;

  // Drawn on the circle Signal will mask to, not the square, so the ring
  // survives the crop exactly.
  const ring =
    `<circle cx="${BOX / 2}" cy="${BOX / 2}" r="${BOX / 2 - RING / 2}" ` +
    `fill="none" stroke="${grp.c}" stroke-width="${RING}" stroke-opacity="0.32"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${BOX}" height="${BOX}" viewBox="0 0 ${BOX} ${BOX}">` +
    `<rect width="${BOX}" height="${BOX}" fill="${grp.ground}"/>` +
    `${ring}` +
    `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(scale)})">` +
    `${stroke(xa, grp.x)}${stroke(xb, grp.x)}${c}` +
    `</g></svg>`
  );
}

for (const grp of groups) {
  const buf = await sharp(Buffer.from(svgFor(grp)))
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(path.join(OUT, `${grp.file}.png`), buf);
  console.log(
    `${grp.file}.png`.padEnd(34),
    `aperture ${String(grp.aperture).padStart(3)}°   ${grp.name}`,
  );
}

rmSync(TMP, { recursive: true, force: true });

console.log(`\n${BOX}×${BOX} px · glyph inside ${Math.round(SAFE * 100)}% of the frame`);
console.log("geometry from lib/logo.ts — nothing redrawn");
