import type { CardSpec, Fonts } from "./types";

type Ctx = CanvasRenderingContext2D;

export function font(size: number, family: string, weight = 400): string {
  return `${weight} ${Math.round(size * 100) / 100}px ${family}`;
}

/** letterSpacing is recent on canvas; where it is missing, text sets untracked. */
export function setTracking(ctx: Ctx, px: number): void {
  const c = ctx as Ctx & { letterSpacing?: string };
  if ("letterSpacing" in c) c.letterSpacing = `${px}px`;
}

export function titleFamily(spec: CardSpec, fonts: Fonts): string {
  return spec.titleFace === "medulla" ? fonts.instrument : fonts.serif;
}

/** Greedy word wrap. A single word wider than the line is left to overflow
 *  rather than broken mid-word; fitText shrinks the size until it fits. */
export function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

interface FitOptions {
  family: string;
  maxWidth: number;
  maxHeight: number;
  maxSize: number;
  minSize: number;
  leading: number;
  tracking?: number;   // em
}

export interface Fitted {
  size: number;
  lines: string[];
  lineHeight: number;
  height: number;
}

/** The largest size, stepping down, at which the text wraps inside the box. */
export function fitText(ctx: Ctx, text: string, o: FitOptions): Fitted {
  let size = o.maxSize;
  for (;;) {
    ctx.font = font(size, o.family);
    setTracking(ctx, (o.tracking ?? 0) * size);
    const lines = wrap(ctx, text, o.maxWidth);
    const lineHeight = size * o.leading;
    const height = lines.length * lineHeight;
    const widest = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
    if ((height <= o.maxHeight && widest <= o.maxWidth) || size <= o.minSize) {
      return { size, lines, lineHeight, height };
    }
    size = Math.max(o.minSize, size * 0.94);
  }
}

/** Draws fitted lines from a top edge. Returns the y below the last line. */
export function drawLines(
  ctx: Ctx,
  f: Fitted,
  x: number,
  top: number,
  align: CanvasTextAlign = "left",
): number {
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  // Cap-height-ish first baseline: the ascent of a serif sits near 0.78em.
  let y = top + f.size * 0.8;
  for (const line of f.lines) {
    ctx.fillText(line, x, y);
    y += f.lineHeight;
  }
  return top + f.height;
}

/** Uppercases everything except the brand name: "xCO" is never "XCO". */
export function applyCase(text: string, uppercase: boolean): string {
  if (!uppercase) return text;
  return text
    .split(/(xCO)/)
    .map((part) => (part === "xCO" ? part : part.toUpperCase()))
    .join("");
}
