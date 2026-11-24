// The time print on the event cards: the same marks as the SVG instruments,
// painted once into an offscreen layer and drawn faint on every frame, plus
// the stamp as a slug along a clear side edge.
// Spec: docs/superpowers/specs/2026-11-24-time-print-design.md

import { TIME_PRINT_OPACITY, makeTimePrint, paintMarks, slugSize, type TimePrint } from "@/lib/asemic/time-print";
import { palettes } from "./palettes";
import { font, setTracking } from "./text";
import type { CardSpec, Fonts, TemplateId } from "./types";

type Ctx = CanvasRenderingContext2D;

/**
 * Where each template leaves room. Window's panel and globe's globe sit to the
 * right, so the slug rises up the left margin. Corner's band runs off the right
 * edge low down and its globe fills the left strip, so its slug hangs from the
 * top of the right margin, beside the right-aligned title.
 */
export const SLUG: Record<TemplateId, { side: "left" | "right"; from: "bottom" | "top" }> = {
  window: { side: "left", from: "bottom" },
  corner: { side: "right", from: "top" },
  globe: { side: "left", from: "bottom" },
};

/** A conservative average advance for Untitled Sans, for fit checks without a canvas. */
export const SLUG_EM = 0.55;

/** Like drawDetails with a wide line: a slug longer than its run shrinks to fit it. */
export const fitSize = (size: number, length: number, room: number) => (length > room ? size * (room / length) : size);

/** Where the slug's baseline anchor goes, and how much run it has. Pure. */
export function slugPlacement(
  template: TemplateId,
  W: number,
  H: number,
  m: number,
  safeTop: number,
  safeBottom: number,
  size: number,
  length: number,
): { x: number; y: number; side: "left" | "right"; from: "bottom" | "top"; room: number; fits: boolean } {
  const { side, from } = SLUG[template];
  const S = Math.min(W, H);
  const landscape = W > H * 1.2;
  // Rotated -90°, glyphs rise to the left of the baseline: nudge right to centre them in the margin.
  const x = (side === "left" ? m / 2 : W - m / 2) + size * 0.35;
  const ceil = m + safeTop;
  // Corner's band top, as templates.ts places it; the slug must end a margin above it.
  const floor = template === "corner"
    ? H - S * (landscape ? 0.2 : 0.165) - S * (landscape ? 0.08 : 0.13) - safeBottom - m
    : H - m - safeBottom;
  const room = floor - ceil;
  return { x, y: from === "bottom" ? floor : ceil, side, from, room, fits: length <= room };
}

// One cached layer: rebuilt when the minute, words, size or palette change, not per frame.
let cache: { key: string; canvas: HTMLCanvasElement; print: TimePrint } | null = null;

function layer(spec: CardSpec): { canvas: HTMLCanvasElement; print: TimePrint } | null {
  const tp = spec.timePrint;
  if (!tp) return null;
  const { w: W, h: H } = spec.format;
  const key = `${tp.minute.seed}|${tp.words}|${W}x${H}|${spec.palette}`;
  if (cache?.key !== key) {
    const p = palettes[spec.palette];
    const print = makeTimePrint({ ...tp, width: W, height: H, ink: p.onGround, ground: p.ground });
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext("2d");
    if (!c) return null;
    paintMarks(c, print.sheet, print.ink, print.ground);
    cache = { key, canvas, print };
  }
  return cache;
}

/** The marks, faint, right after the ground. */
export function drawTimePrint(ctx: Ctx, spec: CardSpec): void {
  const l = layer(spec);
  if (!l) return;
  ctx.save();
  ctx.globalAlpha = TIME_PRINT_OPACITY;
  ctx.drawImage(l.canvas, 0, 0);
  ctx.restore();
}

/** The stamp, last, in the label face at full strength. */
export function drawTimePrintSlug(
  ctx: Ctx,
  spec: CardSpec,
  fonts: Fonts,
  k: { W: number; H: number; m: number; u: number; safeTop: number; safeBottom: number },
): void {
  const l = layer(spec);
  if (!l) return;
  let size = slugSize(22 * k.u, k.m);
  ctx.save();
  ctx.font = font(size, fonts.label, 400);
  setTracking(ctx, 0);
  const pl = slugPlacement(spec.template, k.W, k.H, k.m, k.safeTop, k.safeBottom, size, ctx.measureText(l.print.stamp).width);
  if (!pl.fits) {
    size = fitSize(size, ctx.measureText(l.print.stamp).width, pl.room);
    ctx.font = font(size, fonts.label, 400);
  }
  ctx.translate(pl.x, pl.y);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = pl.from === "top" ? "right" : "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = l.print.ink;
  ctx.fillText(l.print.stamp, 0, 0);
  ctx.restore();
}
