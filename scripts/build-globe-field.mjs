// Builds the event-series globe from its source SVG. Run: npm run globe
//
// The source (assets/event-series/globe.svg) is half photograph, half halftone:
// the left half is an embedded raster of the Earth, the right half is 1,792
// white squares on a fixed grid whose size carries the brightness. The event
// cards animate the seam between the two, which needs the halftone for the
// WHOLE disc — so this script reads the right half's squares as they are and
// derives the left half's from the photograph, on the same grid.
//
// To keep the two halves reading as one image, the photo's cell brightness is
// histogram-matched to the square sizes on the right: the left half ends up
// with the same distribution of sizes the designer's halftone already has,
// rather than a transfer curve chosen by eye.
//
// Outputs:
//   public/event-series/globe-photo.webp   the photograph, disc-clipped
//   lib/event-series/globe-field.ts        the grid, one byte per cell

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const SRC = path.join(ROOT, "assets/event-series/globe.svg");
const PHOTO_OUT = path.join(ROOT, "public/event-series/globe-photo.webp");
const FIELD_OUT = path.join(ROOT, "lib/event-series/globe-field.ts");

const svg = readFileSync(SRC, "utf8");

// ── Canvas and photo placement, read from the SVG ────────────────────
const [, vbW, vbH] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
const rect = svg.match(/<rect y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="url\(#pattern/);
if (!rect) throw new Error("globe.svg: photo <rect> not found");
const photo = { x: 0, y: Number(rect[1]), w: Number(rect[2]), h: Number(rect[3]) };
const b64 = svg.match(/xlink:href="data:image\/png;base64,([^"]+)"/)?.[1];
if (!b64) throw new Error("globe.svg: embedded photo not found");
const photoPng = Buffer.from(b64, "base64");

// ── The squares ──────────────────────────────────────────────────────
const squareRe = /<path d="M([\d.]+) ([\d.]+)H([\d.]+)V([\d.]+)H[\d.]+V[\d.]+Z" fill="white"\/>/g;
const squares = [...svg.matchAll(squareRe)].map((m) => {
  const [x1, y0, x0, y1] = m.slice(1, 5).map(Number);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, side: x1 - x0 };
});
if (squares.length === 0) throw new Error("globe.svg: no halftone squares found");

// The grid pitch is ~13.0222 (20× the smallest square). It is measured over
// the full span of rows rather than read off one square, whose coordinates
// are rounded in the file — at 70 rows, a 0.002 error drifts a whole unit.
// The origin is the first square.
const originX = Math.min(...squares.map((s) => s.cx));
const originY = Math.min(...squares.map((s) => s.cy));
const spanY = Math.max(...squares.map((s) => s.cy)) - originY;
const PITCH = spanY / Math.round(spanY / 13);
const seam = photo.x + photo.w;                 // where the photograph stops

// Disc geometry from the photo's alpha (the photograph is the full-height disc).
const { data: px, info } = await sharp(photoPng).raw().toBuffer({ resolveWithObject: true });
const sx = info.width / photo.w;
const sy = info.height / photo.h;
let left = info.width;
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (px[(y * info.width + x) * 4 + 3] > 127) { left = Math.min(left, x); break; }
  }
}
const disc = { cx: seam, cy: photo.y + photo.h / 2, r: seam - left / sx };

// Grid extent: every column whose centre can fall inside the disc.
const colMin = Math.floor((disc.cx - disc.r - originX) / PITCH);
const colMax = Math.ceil((disc.cx + disc.r - originX) / PITCH);
const rowMin = Math.floor((disc.cy - disc.r - originY) / PITCH);
const rowMax = Math.ceil((disc.cy + disc.r - originY) / PITCH);
const cols = colMax - colMin + 1;
const rows = rowMax - rowMin + 1;

const cellX = (c) => originX + (c + colMin) * PITCH;
const cellY = (r) => originY + (r + rowMin) * PITCH;
const inDisc = (x, y) => Math.hypot(x - disc.cx, y - disc.cy) <= disc.r;

// Right half: the designer's squares, indexed onto the grid.
const sides = new Float64Array(cols * rows);
for (const s of squares) {
  const c = Math.round((s.cx - originX) / PITCH) - colMin;
  const r = Math.round((s.cy - originY) / PITCH) - rowMin;
  sides[r * cols + c] = s.side;
}
const rightSides = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const x = cellX(c), y = cellY(r);
    if (x >= seam && inDisc(x, y)) rightSides.push(sides[r * cols + c]);
  }
}
rightSides.sort((a, b) => a - b);

// Left half: mean luminance of the photo under each cell (alpha-weighted).
function cellLuma(x, y) {
  const x0 = Math.max(0, Math.floor((x - PITCH / 2) * sx));
  const x1 = Math.min(info.width, Math.ceil((x + PITCH / 2) * sx));
  const y0 = Math.max(0, Math.floor((y - PITCH / 2 - photo.y) * sy));
  const y1 = Math.min(info.height, Math.ceil((y + PITCH / 2 - photo.y) * sy));
  let sum = 0, n = 0;
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = (yy * info.width + xx) * 4;
      const a = px[i + 3] / 255;
      sum += a * (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
      n += 1;
    }
  }
  return n ? sum / n : 0;
}
const leftCells = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const x = cellX(c), y = cellY(r);
    if (x < seam && inDisc(x, y)) leftCells.push({ i: r * cols + c, luma: cellLuma(x, y) });
  }
}

// Histogram match: the k-th brightest left cell takes the k-th largest right side.
leftCells.sort((a, b) => a.luma - b.luma);
leftCells.forEach((cell, k) => {
  const q = leftCells.length > 1 ? k / (leftCells.length - 1) : 0;
  sides[cell.i] = rightSides[Math.round(q * (rightSides.length - 1))];
});

// One byte per cell: side as a fraction of the pitch.
const bytes = Buffer.alloc(cols * rows);
for (let i = 0; i < bytes.length; i++) bytes[i] = Math.round(Math.min(1, sides[i] / PITCH) * 255);

const round = (n) => Math.round(n * 10000) / 10000;
mkdirSync(path.dirname(FIELD_OUT), { recursive: true });
writeFileSync(
  FIELD_OUT,
  `// GENERATED by scripts/build-globe-field.mjs from assets/event-series/globe.svg.
// Do not edit by hand — change the source and run: npm run globe
//
// The globe's halftone for the whole disc, one byte per grid cell: the square's
// side as a fraction of the pitch (0 = no square). The right half is the source
// file's own squares; the left half is derived from the photograph and
// histogram-matched to them.

export const globeField = {
  width: ${vbW},
  height: ${vbH},
  pitch: ${round(PITCH)},
  originX: ${round(cellX(0))},
  originY: ${round(cellY(0))},
  cols: ${cols},
  rows: ${rows},
  seam: ${round(seam)},
  disc: { cx: ${round(disc.cx)}, cy: ${round(disc.cy)}, r: ${round(disc.r)} },
  photo: { src: "/event-series/globe-photo.webp", x: ${photo.x}, y: ${photo.y}, w: ${photo.w}, h: ${photo.h} },
  cells: "${bytes.toString("base64")}",
} as const;
`,
);

mkdirSync(path.dirname(PHOTO_OUT), { recursive: true });
// 1.6 px per unit covers the largest card (a 1920px story) at full sharpness.
await sharp(photoPng)
  .resize({ width: Math.round(photo.w * 1.6) })
  .webp({ quality: 80, alphaQuality: 90 })
  .toFile(PHOTO_OUT);

const filled = [...bytes].filter(Boolean).length;
console.log(`grid ${cols} × ${rows} · pitch ${round(PITCH)} · ${filled} squares (${squares.length} from source)`);
console.log(`disc centre ${round(disc.cx)}, ${round(disc.cy)} · r ${round(disc.r)}`);
console.log(`wrote ${path.relative(ROOT, FIELD_OUT)} and ${path.relative(ROOT, PHOTO_OUT)}`);
