// The same embeds as lib/regimes/embeds.tsx, painted on a canvas: event
// series' xCO note cards draw them. Geometry comes from embeds.tsx, so the SVG
// and canvas versions cannot drift.

import { paletteHex } from "@/lib/design-tokens";
import { MARK, SWEEP_STOPS, optionFieldBars, territoryCells } from "./embeds";

const { paper: PAPER, ink: INK, ocean: OCEAN, dusk: DUSK } = paletteHex;

type Ctx = CanvasRenderingContext2D;

/** The mark at `scale`, its 400 × 200 box's top-left at (x, y); `weight` is the box stroke in output px. */
export function paintMark(ctx: Ctx, x: number, y: number, scale: number, weight = 1): void {
  const { frontier: fr, fortress: fo, field: fi, merge } = MARK;
  const at = (px: number, py: number): [number, number] => [x + px * scale, y + py * scale];
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = DUSK;
  ctx.lineWidth = 1.2 * weight;
  ctx.beginPath();
  for (const [a, b] of [[at(fr.cx, fr.cy + fr.h / 2), at(merge.x, merge.y)], [at(fo.cx, fo.cy + fo.h / 2), at(merge.x, merge.y)], [at(merge.x, merge.y), at(fi.cx, fi.cy - fi.h / 2)]]) {
    ctx.moveTo(...a);
    ctx.lineTo(...b);
  }
  ctx.stroke();
  ctx.fillStyle = DUSK;
  ctx.beginPath();
  ctx.arc(...at(merge.x, merge.y), 2.5 * weight, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = "butt";
  ctx.lineWidth = weight;
  const boxes: [{ cx: number; cy: number; w: number; h: number }, string, number[]][] = [[fr, INK, []], [fo, INK, []], [fi, OCEAN, [5 * weight, 3.5 * weight]]];
  for (const [b, stroke, dash] of boxes) {
    const [bx, by] = at(b.cx - b.w / 2, b.cy - b.h / 2);
    ctx.fillStyle = PAPER;
    ctx.fillRect(bx, by, b.w * scale, b.h * scale);
    ctx.setLineDash(dash);
    ctx.strokeStyle = stroke;
    ctx.strokeRect(bx, by, b.w * scale, b.h * scale);
  }
  ctx.restore();
}

/** A small option field filling the rect; `scale` widens the pitch for large cards. */
export function paintOptionField(ctx: Ctx, x0: number, y0: number, w: number, h: number, fg: string, scale = 1): void {
  ctx.fillStyle = fg;
  for (const b of optionFieldBars(w, h, scale)) ctx.fillRect(x0 + b.x, y0 + b.y, b.w, b.h);
}

/** A small territory treemap on ink filling the rect, labels in `family`. */
export function paintTerritory(ctx: Ctx, x0: number, y0: number, w: number, h: number, gutter: number, labelMax: number, family: string): void {
  ctx.fillStyle = INK;
  ctx.fillRect(x0, y0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const c of territoryCells(w, h, gutter, labelMax)) {
    ctx.fillStyle = c.bg;
    ctx.fillRect(x0 + c.x, y0 + c.y, c.w, c.h);
    if (c.size === null) continue;
    ctx.fillStyle = c.fg;
    ctx.font = `400 ${c.size}px ${family}`;
    ctx.fillText(c.label, x0 + c.x + c.w / 2, y0 + c.y + c.h / 2);
  }
}

/** The navy-to-dusk sweep over the rect, top to bottom. */
export function sweep(ctx: Ctx, x: number, y: number, w: number, h: number): void {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  for (const [offset, colour] of SWEEP_STOPS) g.addColorStop(offset / 100, colour);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}
