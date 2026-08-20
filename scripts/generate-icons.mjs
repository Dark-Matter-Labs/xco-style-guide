// Generates the favicon set from lib/logo.ts — the same geometry as the
// logotype, never a redrawn copy. Run: npm run icons
//
// The mark is the lowercase x with the apertured C — the logotype's first two
// glyphs, at their own geometry. Chosen by rendering the alternatives at true
// 16px and comparing:
//
//   full xCO lockup   mush below 32px at every stroke weight — the wordmark is
//                     2.2:1, so squaring it leaves too little per glyph
//   C alone           legible, but reads as the letter C
//   x alone           legible, but reads as a dismiss control
//   O with x through  the x smudges to a blur inside the ring at 16px
//   x + C  (this)     holds at 16px, and is not mistakable for a letter
//
// It also carries the two things worth carrying: the lowercase x that encodes
// the naming rule, and the aperture that states the optionality argument.
//
// Dusk sits on the x and only on the x, which is what the logo's accent
// variant specifies — the circles stay ink.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const sharp = require("sharp");

const ROOT = process.cwd();
const TMP = path.join(ROOT, ".icon-build");

// ── Load the logo geometry by transpiling the real module ─────────────
// Parsing constants out of the file with regexes would be a second copy of
// the geometry, which is exactly the drift this repo has been fixing.
mkdirSync(TMP, { recursive: true });
const src = readFileSync(path.join(ROOT, "lib/logo.ts"), "utf8");
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const modPath = path.join(TMP, "logo.mjs");
writeFileSync(modPath, js);
const logo = await import(`file://${modPath}`);

const { logoGeometry: g, cPath } = logo;

// ── Compose a square mark ─────────────────────────────────────────────
const BOX = 120;
const PAD = 10;

const INK = "#20201e";
const PAPER = "#f4f1e9";
const DUSK = "#ff5a00";

// x-left edge to C-right edge, then scaled to the padded box.
const glyphW = g.cCx + g.cap / 2 - g.xLeft;
const scale = (BOX - PAD * 2) / glyphW;
const tx = BOX / 2 - (g.xLeft + glyphW / 2) * scale;
const ty = BOX / 2 - ((g.capTop + g.baseline) / 2) * scale;

const [xa, xb] = logo.xPaths();

const stroke = (d, fg) =>
  `<path d="${d}" fill="none" stroke="${fg}" stroke-width="${g.stroke}" stroke-linecap="butt"/>`;

// fg drives the C; the x always takes dusk, per the accent variant.
const mark = (fg) =>
  `<g transform="translate(${round(tx)} ${round(ty)}) scale(${round(scale)})">` +
  `${stroke(xa, DUSK)}${stroke(xb, DUSK)}${stroke(cPath(), fg)}</g>`;

function round(n) {
  return Math.round(n * 1000) / 1000;
}

// The SVG favicon follows the reader's register, like every other surface.
const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}" role="img" aria-label="xCO">
  <style>
    svg { --bg: ${PAPER}; --fg: ${INK}; }
    @media (prefers-color-scheme: dark) { svg { --bg: ${INK}; --fg: ${PAPER}; } }
  </style>
  <rect width="${BOX}" height="${BOX}" fill="var(--bg)"/>
  ${mark("var(--fg)")}
</svg>
`;
writeFileSync(path.join(ROOT, "app/icon.svg"), svg);

// Rasterisers do not apply prefers-color-scheme or CSS variables, so the PNG
// and ICO paths get a flattened SVG with literal colours.
const flat = (fg, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">` +
  `<rect width="${BOX}" height="${BOX}" fill="${bg}"/>${mark(fg)}</svg>`;

const png = (size, fg = INK, bg = PAPER) =>
  sharp(Buffer.from(flat(fg, bg))).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// ── ICO container ─────────────────────────────────────────────────────
// Header (6 bytes) + one 16-byte directory entry per image + PNG payloads.
// A width or height byte of 0 means 256.
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);            // reserved
  header.writeUInt16LE(1, 2);            // type: icon
  header.writeUInt16LE(images.length, 4);

  const dir = Buffer.alloc(16 * images.length);
  let offset = header.length + dir.length;

  images.forEach((img, i) => {
    const e = 16 * i;
    dir[e] = img.size >= 256 ? 0 : img.size;
    dir[e + 1] = img.size >= 256 ? 0 : img.size;
    dir[e + 2] = 0;                      // palette count
    dir[e + 3] = 0;                      // reserved
    dir.writeUInt16LE(1, e + 4);         // colour planes
    dir.writeUInt16LE(32, e + 6);        // bits per pixel
    dir.writeUInt32LE(img.data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += img.data.length;
  });

  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const icoSizes = [16, 32, 48, 256];
const icoImages = [];
for (const size of icoSizes) icoImages.push({ size, data: await png(size) });
writeFileSync(path.join(ROOT, "app/favicon.ico"), buildIco(icoImages));

// Apple touch icon: no transparency, no rounding of our own — iOS masks it.
writeFileSync(path.join(ROOT, "app/apple-icon.png"), await png(180));

rmSync(TMP, { recursive: true, force: true });

console.log("app/icon.svg          register-aware SVG favicon");
console.log(`app/favicon.ico       ${icoSizes.join(", ")} px`);
console.log("app/apple-icon.png    180 px");
console.log(`\ngeometry from lib/logo.ts — R=${g.radius} stroke=${g.stroke} aperture=${g.aperture}° scale=${round(scale)}`);
