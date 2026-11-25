import { cPath, oPath, xPaths, inkBounds, logoGeometry as g, endorsementLabel, LOCKUP_WEIGHT, stripMetrics } from "@/lib/logo";
import { dmStampPath, dmWordmarkPath } from "@/lib/dm-logo";
import { medullaMark as m } from "@/lib/event-series/medulla-mark";
import { paletteHex } from "@/lib/design-tokens";

type Ctx = CanvasRenderingContext2D;

// The co-host lockup: xCO × Medulla.
//
// The xCO logotype leads at the given cap height, drawn from lib/logo so it is
// the same geometry as every other asset. The × is a small cross in the same
// butt-capped stroke language, so it reads as part of the mark rather than as
// a typed character. Medulla follows as its short-form disc, a touch smaller
// than the xCO cap height — present, but light.

const X_GAP = 0.34;          // logotype → ×, in cap heights
const X_SIZE = 0.3;          // the cross, in cap heights
const MEDULLA_GAP = 0.34;    // × → disc
const MEDULLA_SCALE = 0.92;  // disc diameter, in cap heights

let paths: { x: Path2D[]; c: Path2D; o: Path2D; medulla: Path2D[] } | null = null;
function getPaths() {
  if (!paths) {
    paths = {
      x: xPaths().map((d) => new Path2D(d)),
      c: new Path2D(cPath()),
      o: new Path2D(oPath()),
      medulla: m.glyph.map((d) => new Path2D(d)),
    };
  }
  return paths;
}

const logoWidth = inkBounds.right - inkBounds.left;

/** Width of the whole lockup at a given cap height — for right-aligning it. */
export function lockupWidth(cap: number): number {
  const s = cap / g.cap;
  return logoWidth * s + cap * (X_GAP + X_SIZE + MEDULLA_GAP + MEDULLA_SCALE);
}

interface LockupOptions {
  /** Colour of the xCO logotype and the cross. */
  color: string;
  /** Colour of the x alone — dusk for the operator variant. Defaults to color. */
  xColor?: string;
  /** Light surface behind the disc: give it a hairline ring so it has an edge. */
  onLight?: boolean;
}

/** Width of the xCO logotype alone at a given cap height. */
export const logotypeWidth = (cap: number) => logoWidth * (cap / g.cap);

/** The xCO logotype alone, stroked geometry cropped to its ink, its cap band from `top` to `top + cap`. */
export function drawLogotype(ctx: Ctx, left: number, top: number, cap: number, color: string, xColor = color): void {
  const p = getPaths();
  const s = cap / g.cap;
  ctx.save();
  ctx.translate(left - inkBounds.left * s, top - inkBounds.top * s);
  ctx.scale(s, s);
  ctx.lineWidth = g.stroke;
  ctx.lineCap = "butt";
  ctx.strokeStyle = xColor;
  p.x.forEach((path) => ctx.stroke(path));
  ctx.strokeStyle = color;
  ctx.stroke(p.c);
  ctx.stroke(p.o);
  ctx.restore();
}

/** Draws the lockup with its cap band from `top` to `top + cap`. Returns its width. */
export function drawLockup(ctx: Ctx, left: number, top: number, cap: number, o: LockupOptions): number {
  const p = getPaths();
  const s = cap / g.cap;

  drawLogotype(ctx, left, top, cap, o.color, o.xColor ?? o.color);

  // × — centred on the x-height band, the same weight as the logotype at half.
  const midY = top + cap - (g.xHeight * s) / 2;
  const crossX = left + logoWidth * s + cap * X_GAP;
  const half = (cap * X_SIZE) / 2;
  ctx.save();
  ctx.strokeStyle = o.color;
  ctx.lineWidth = g.stroke * s * 0.5;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(crossX, midY - half);
  ctx.lineTo(crossX + half * 2, midY + half);
  ctx.moveTo(crossX + half * 2, midY - half);
  ctx.lineTo(crossX, midY + half);
  ctx.stroke();
  ctx.restore();

  // Medulla — the supplied disc and glyph, untouched in colour.
  const d = cap * MEDULLA_SCALE;
  const discLeft = crossX + half * 2 + cap * MEDULLA_GAP;
  const discTop = top + (cap - d) / 2;
  const ms = d / m.size;
  ctx.save();
  ctx.translate(discLeft, discTop);
  ctx.scale(ms, ms);
  ctx.beginPath();
  ctx.arc(m.disc.cx, m.disc.cy, m.disc.r, 0, Math.PI * 2);
  ctx.fillStyle = m.discFill;
  ctx.fill();
  if (o.onLight) {
    ctx.lineWidth = Math.max(1, cap * 0.02) / ms;
    ctx.strokeStyle = paletteHex.ink;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = m.glyphFill;
  p.medulla.forEach((path) => ctx.fill(path, "evenodd"));
  ctx.restore();

  return discLeft + d - left;
}

// ── Endorsement strip (CH-15) ────────────────────────────────────────
// "AN INITIATIVE OF" and Dark Matter Labs' own lockup, the strip from
// lib/logo.ts redrawn for canvas. It heads the card; the xCO mark closes it,
// so DML is never read as part of the logo. One stamp of clear space below
// it is the caller's to keep (STRIP_BLOCK).

let dm: { wordmark: Path2D; stamp: Path2D } | null = null;
const strip = stripMetrics;

/** DM's stamp height on a card: 30 at a 1000px short side (32px at 1080), above DM's 16px minimum at every format and below the xCO cap (44). */
export const STRIP_STAMP = 30;
/** Height the strip takes from the layout: the stamp plus one stamp of clear space. */
export const stripBlock = (stamp: number) => stamp * 2;
/** Ink width of the strip at a given stamp height. */
export const stripWidth = (stamp: number) => ((strip.width - 2 * strip.stamp) * stamp) / strip.stamp;

/** DM allows black on light grounds and white on dark ones, never another colour. */
export function dmOn(ground: string): string {
  const n = parseInt(ground.slice(1), 16);
  const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return L > 0.18 ? "#000000" : "#FFFFFF";
}

/** Draws the strip with its ink box's top-left at (left, top). */
export function drawEndorsementStrip(
  ctx: Ctx,
  left: number,
  top: number,
  stamp: number,
  o: { text: string; dm: string; font: string },
): void {
  if (!dm) dm = { wordmark: new Path2D(dmWordmarkPath), stamp: new Path2D(dmStampPath) };
  const k = stamp / strip.stamp;
  const ox = left - strip.stamp * k;
  const oy = top - strip.stamp * k;

  ctx.save();
  ctx.font = `${LOCKUP_WEIGHT} ${strip.labelSize * k}px ${o.font}`;
  const c = ctx as Ctx & { letterSpacing?: string };
  if ("letterSpacing" in c) c.letterSpacing = `${strip.labelTracking * k}px`;
  ctx.fillStyle = o.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(endorsementLabel, ox + strip.labelX * k, oy + strip.labelBaseline * k);
  if ("letterSpacing" in c) c.letterSpacing = "0px";

  ctx.translate(ox, oy);
  ctx.scale(k, k);
  ctx.translate(strip.dm.x, strip.dm.y);
  ctx.scale(strip.dm.scale, strip.dm.scale);
  ctx.fillStyle = o.dm;
  ctx.fill(dm.wordmark);
  ctx.fill(dm.stamp, "evenodd");
  ctx.restore();
}
