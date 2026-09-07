// Signal group avatars for the eight xCO groups.
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

// Past four groups the cardinal apertures are used up and the rest take
// diagonals. Every diagonal sits between two cardinals, so the one to pick is
// the one whose angular neighbours are in a different luminance band from the
// new ground — then even where the angles are close, the tiles are not.
//
// The invariant this maintains: no two avatars may be weak on BOTH channels at
// once. Close in value is fine if the apertures are far apart, and vice versa.
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
const TEAL = "#0082aa";
const NAVY = "#000064";

// Not a system token. The documented palette has no unassigned green: the two
// it does contain are reserved channels — --meaning-continuity (#267b61) means
// "continuity" and --domain-inst (#1f9a91) means "institutional", and
// borrowing either for a group would be the same misuse as handing a group a
// domain colour. So this is a group-identity colour, declared here and only
// here, holding the flag's green in the guide's muted register rather than at
// full chroma (#138808).
//
// Value chosen by measurement, not by eye. It has to do three things at once:
// clear 3:1 against the paper glyphs, sit far enough from ocean in luminance
// that the two tiles do not merge in greyscale, and read as a tile against
// Signal's dark list ground. A darker #157f3f gave better glyph contrast
// (4.49:1) but collapsed toward ocean in greyscale at 1.60:1; this trades a
// little glyph margin for 2.07:1 there and a clearer edge on dark.
const INDIA_GREEN = "#1f9350";

// The second group-identity colour, and the point at which the documented
// palette genuinely ran out: paper, ink, ocean, teal, sand and navy are all
// taken, and dusk is the 5% accent rather than a ground. So this is declared
// here, like the India green, and is not a system token.
//
// A light violet, chosen for two reasons. It is the only unused hue region in
// the set — which by then held near-white, near-black, two blues, a green and
// an amber — and it lands in the light band, where only paper and sand sat.
//
// The constraint that fixed the value: 225° has Oceans (180°) and India (270°)
// as its 45° neighbours, so colour alone has to separate it from both. This
// clears ocean at 4.15:1 and green at 2.01:1. The mid and dark plums that read
// more "in palette" all failed against ocean — #7d3f6b at 1.08:1, #8d4a7a at
// 1.31:1 — which would have been two tiles a colour-blind reader could not
// separate, since the angle could not help either.
const LEARNING_LILAC = "#cbb0d8";

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
    ground: INDIA_GREEN,
    c: PAPER,
    x: PAPER, // paper variant — white on green, per the flag
    aperture: 270, // opening down
    // Paper mark on green rather than a green mark on paper: the parent group
    // already owns the paper ground, and at 48px two paper tiles would be told
    // apart only by glyph colour.
    why: "Green and white, after the flag.",
  },
  {
    file: "xco-madrid",
    name: "xCO-Madrid",
    ground: SAND,
    c: INK,
    x: INK, // ink variant — sand is a light ground, so ink carries at 8.13:1
    // 135° rather than another diagonal. Sand's nearest neighbours in
    // luminance are paper (1.78) and green (1.96); at 135° it sits a full
    // 135° from both of those apertures, while its angular neighbours — ink
    // at 90° and ocean at 180° — are dark grounds it separates from by
    // 8.13 and 4.04. So the two channels never weaken at the same time.
    aperture: 135, // opening upper-left
    why: "Sand, the warm field register.",
  },
  {
    file: "xco-santiago",
    name: "xCO-Santiago",
    ground: TEAL,
    c: PAPER,
    x: PAPER, // paper variant — paper carries on teal at 3.90:1, ink only 3.71:1
    // 45° is the only free diagonal that works. Teal's nearest neighbour in
    // luminance is the India green at 1.12:1 — nearly identical in greyscale —
    // so the aperture has to carry the whole separation, and 45° sits 135° from
    // India's 270°. At 225° or 315° it would land 45° from India: close in
    // value AND close in angle, which is the one thing the two-channel scheme
    // exists to prevent.
    aperture: 45, // opening upper-right
    why: "Teal — the documented open register: frontier, coastal.",
  },
  {
    file: "xco-positions-options-stewards",
    name: "xCO — Positions & Options Stewards",
    ground: NAVY,
    c: PAPER,
    x: PAPER, // paper on navy at 15.71:1, the strongest pairing in the set
    // Navy's documented role is "Blueprint dark ground. Deep structural
    // register", which fits a group stewarding the positions and options
    // themselves rather than a place or a track.
    //
    // 315°, not 225°. Navy has two near neighbours and this angle clears both:
    // ink is its value-twin at 1.09:1 (135° away here) and ocean is its
    // hue-twin, the other dark blue (also 135° away). At 225° ocean would sit
    // just 45° off, putting the two dark blues close on both channels at once.
    aperture: 315, // opening lower-right
    why: "Navy — the deep structural register.",
  },
  {
    file: "xco-learning-system",
    name: "xCO — Learning System",
    ground: LEARNING_LILAC,
    c: INK,
    x: INK, // ink on a light ground, 8.35:1
    aperture: 225, // opening lower-left — the last free cardinal-or-diagonal
    why: "Light violet — the one hue region the set had left.",
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
// drawn, not shadowed. Applied to every avatar so the set stays consistent.
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
