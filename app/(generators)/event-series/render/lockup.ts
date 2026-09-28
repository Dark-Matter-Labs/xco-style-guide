import { cPath, oPath, xPaths, inkBounds, logoGeometry as g } from "@/lib/logo";
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

/** Draws the lockup with its cap band from `top` to `top + cap`. Returns its width. */
export function drawLockup(ctx: Ctx, left: number, top: number, cap: number, o: LockupOptions): number {
  const p = getPaths();
  const s = cap / g.cap;

  // xCO — stroked geometry, cropped to its ink.
  ctx.save();
  ctx.translate(left - inkBounds.left * s, top - inkBounds.top * s);
  ctx.scale(s, s);
  ctx.lineWidth = g.stroke;
  ctx.lineCap = "butt";
  ctx.strokeStyle = o.xColor ?? o.color;
  p.x.forEach((path) => ctx.stroke(path));
  ctx.strokeStyle = o.color;
  ctx.stroke(p.c);
  ctx.stroke(p.o);
  ctx.restore();

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
