import { applyCase, drawLines, fitText, font, setTracking, titleFamily } from "./text";
import { drawLockup, lockupWidth } from "./lockup";
import type { Assets, CardSpec, Rect } from "./types";

type Ctx = CanvasRenderingContext2D;

// The text blocks every template shares. Type roles follow the xCO system:
// the title in the display serif, metadata in DM Mono, uppercase and tracked.
// Medulla's posters set everything in one condensed serif; the title face can
// switch to theirs (Instrument Serif), but the metadata stays xCO's mono.

export interface Ink {
  text: string;
  accent: string;
  /** Behind-text glow in the surface colour, as Medulla's posters use over
   *  imagery. Transparent to turn off. */
  halo: string;
  onLight: boolean;
}

/** Draws twice under a shadow — a wide glow, then a tight one — so text holds
 *  over the brightest squares without a visible box behind it. `draw` runs
 *  once per pass, so it must not advance any layout state. */
export function withHalo(ctx: Ctx, color: string, blur: number, draw: () => void): void {
  ctx.save();
  ctx.shadowColor = color;
  for (const b of [blur, blur * 0.35]) {
    ctx.shadowBlur = b;
    draw();
  }
  ctx.restore();
}

/** A soft fade of the surface colour over imagery, from `strength` at the
 *  `from` edge of the rect to nothing at the opposite edge. */
export function scrim(
  ctx: Ctx,
  r: Rect,
  color: string,
  from: "left" | "top" | "bottom" | "right",
  strength = 0.85,
): void {
  const [x0, y0, x1, y1] =
    from === "left" ? [r.x, 0, r.x + r.w, 0]
    : from === "right" ? [r.x + r.w, 0, r.x, 0]
    : from === "top" ? [0, r.y, 0, r.y + r.h]
    : [0, r.y + r.h, 0, r.y];
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, withAlpha(color, strength));
  g.addColorStop(0.45, withAlpha(color, strength * 0.6));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
}

function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Kicker, title and subtitle, from the top of a box. Returns the y below. */
export function drawHeadline(
  ctx: Ctx,
  spec: CardSpec,
  assets: Assets,
  box: Rect,
  ink: Ink,
  u: number,
  opts: { maxSize: number; titleShare: number; align?: CanvasTextAlign },
): number {
  const { content } = spec;
  const align = opts.align ?? "left";
  const ax = align === "right" ? box.x + box.w : box.x;
  let y = box.y;

  if (content.kicker.trim()) {
    const size = 22 * u;
    ctx.font = font(size, assets.fonts.mono, 500);
    setTracking(ctx, size * 0.08);
    ctx.fillStyle = ink.accent;
    ctx.textAlign = align;
    ctx.textBaseline = "top";
    withHalo(ctx, ink.halo, 24 * u, () => ctx.fillText(applyCase(`[${content.kicker.trim()}]`, true), ax, y));
    y += size + 26 * u;
  }

  const family = titleFamily(spec, assets.fonts);
  const medulla = spec.titleFace === "medulla";
  const title = fitText(ctx, applyCase(content.title, spec.uppercase), {
    family,
    maxWidth: box.w,
    maxHeight: box.h * opts.titleShare,
    maxSize: opts.maxSize * u * (medulla ? 1.12 : 1),
    minSize: 40 * u,
    leading: medulla ? 1.02 : spec.uppercase ? 1.0 : 1.04,
    tracking: medulla ? 0 : -0.012,
  });
  ctx.fillStyle = ink.text;
  const titleTop = y;
  withHalo(ctx, ink.halo, 56 * u, () => drawLines(ctx, title, ax, titleTop, align));
  y += title.height;

  if (content.subtitle.trim()) {
    y += 22 * u;
    const sub = fitText(ctx, content.subtitle, {
      family,
      maxWidth: box.w,
      maxHeight: 3 * 44 * u,
      maxSize: Math.min(38 * u, title.size * 0.5),
      minSize: 22 * u,
      leading: 1.18,
    });
    ctx.globalAlpha = 0.86;
    const subTop = y;
    withHalo(ctx, ink.halo, 32 * u, () => drawLines(ctx, sub, ax, subTop, align));
    y += sub.height;
    ctx.globalAlpha = 1;
  }
  setTracking(ctx, 0);
  return y;
}

/** Date / time on one line, place on the next — in mono. Returns the block height. */
export function detailLines(spec: CardSpec): string[] {
  const { date, time, location } = spec.content;
  const when = [date, time].map((s) => s.trim()).filter(Boolean).join("  /  ");
  return [when, location.trim()].filter(Boolean).map((l) => applyCase(l, true));
}

export function drawDetails(
  ctx: Ctx,
  spec: CardSpec,
  assets: Assets,
  x: number,
  bottom: number,
  maxWidth: number,
  ink: Ink,
  u: number,
  align: CanvasTextAlign = "left",
): number {
  const lines = detailLines(spec);
  let size = 24 * u;
  ctx.font = font(size, assets.fonts.mono, 500);
  setTracking(ctx, size * 0.06);
  const widest = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
  if (widest > maxWidth) {
    size *= maxWidth / widest;
    ctx.font = font(size, assets.fonts.mono, 500);
    setTracking(ctx, size * 0.06);
  }
  const lh = size * 1.45;
  const height = (lines.length - 1) * lh + size;
  ctx.fillStyle = ink.text;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  withHalo(ctx, ink.halo, 24 * u, () => {
    // Last baseline sits a descender above `bottom`.
    lines.forEach((line, i) => ctx.fillText(line, x, bottom - (lines.length - 1 - i) * lh - size * 0.22));
  });
  setTracking(ctx, 0);
  return height;
}

export function drawCoLockup(
  ctx: Ctx,
  x: number,
  top: number,
  cap: number,
  ink: Ink,
  align: "left" | "right" = "left",
): void {
  const left = align === "right" ? x - lockupWidth(cap) : x;
  drawLockup(ctx, left, top, cap, { color: ink.text, onLight: ink.onLight });
}
