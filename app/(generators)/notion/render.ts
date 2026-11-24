import type { ChaosResult } from "@/lib/chaos/systems";
import { typography } from "@/lib/design-tokens";
import { fnv1aCodePoints } from "@/lib/random";
import { cPath, inkBounds, logoGeometry, oPath, xPaths } from "@/lib/logo";
import { drawChaos, paletteOf, type ChaosLook, type ChaosPaletteId } from "../chaos/render";

// Notion page assets: a cover (1500 × 600, Notion's recommended size) and an
// icon (512 × 512, crisp at the 280 px Notion asks for on retina). Both come
// from one seeded chaos field, so a page's icon and cover belong together.

export const COVER = { w: 1500, h: 600 } as const;
export const ICON = 512;

// A full-width Notion page shows about the middle half of the cover's height,
// and the reader can drag it. Words stay inside this band so no crop cuts them.
export const SAFE_BAND = { top: 0.25, bottom: 0.75 } as const;

export const SERIF = typography.faces.display.stack;
export const SANS = typography.faces.body.stack;

export type IconGlyph = "monogram" | "x" | "field";

/** FNV-1a: the same page name always gives the same seed. */
export function seedFrom(name: string): number {
  return fnv1aCodePoints(name.trim().toLowerCase()) % 100000 || 1;
}

/** Up to two initials: "Decisions Log" → "DL". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[^\s\W_]|^[À-ɏ]/.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

const look = (palette: ChaosPaletteId, zoom: number): ChaosLook => ({ palette, frame: "bleed", zoom, trace: true, caption: false });

/** The xCO logo from its geometry; `top` and `h` measure the ink. Returns the drawn width. */
function drawLogo(ctx: CanvasRenderingContext2D, x: number, top: number, h: number, ink: string): number {
  const s = h / (inkBounds.bottom - inkBounds.top);
  ctx.save();
  ctx.translate(x - inkBounds.left * s, top - inkBounds.top * s);
  ctx.scale(s, s);
  ctx.lineWidth = logoGeometry.stroke;
  ctx.lineCap = "butt";
  ctx.strokeStyle = ink;
  for (const d of [...xPaths(), cPath(), oPath()]) ctx.stroke(new Path2D(d));
  ctx.restore();
  return (inkBounds.right - inkBounds.left) * s;
}

export function drawCover(
  ctx: CanvasRenderingContext2D,
  r: ChaosResult,
  palette: ChaosPaletteId,
  seed: number,
  opts: { title: string | null; logo: boolean },
) {
  const { w, h } = COVER;
  drawChaos(ctx, w, h, r, look(palette, 1), seed, SANS);
  if (!opts.title && !opts.logo) return;

  // Words sit on a plate of the ground, inside the safe band, so the field never fights them.
  const p = paletteOf(palette);
  const x = 96;
  const pad = 32;
  const logoH = 56;
  const titleSize = 64;
  const gap = opts.title && opts.logo ? 28 : 0;
  ctx.font = `400 ${titleSize}px ${SERIF}`;
  const titleW = opts.title ? ctx.measureText(opts.title).width : 0;
  const logoW = opts.logo ? (logoH / (inkBounds.bottom - inkBounds.top)) * (inkBounds.right - inkBounds.left) : 0;
  const blockH = (opts.logo ? logoH : 0) + gap + (opts.title ? titleSize : 0);
  const top = h / 2 - blockH / 2;

  ctx.fillStyle = p.ground;
  ctx.fillRect(x - pad, top - pad, Math.max(titleW, logoW) + pad * 2, blockH + pad * 2);
  if (opts.logo) drawLogo(ctx, x, top, logoH, p.ink);
  if (opts.title) {
    ctx.fillStyle = p.ink;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(opts.title, x, top + blockH - titleSize * 0.2);
  }
}

export function drawIcon(
  ctx: CanvasRenderingContext2D,
  r: ChaosResult,
  palette: ChaosPaletteId,
  seed: number,
  glyph: IconGlyph,
  monogram: string,
) {
  const s = ICON;
  const p = paletteOf(palette);
  if (glyph === "field") {
    drawChaos(ctx, s, s, r, look(palette, 1.6), seed, SANS);
    return;
  }
  ctx.fillStyle = p.ground;
  ctx.fillRect(0, 0, s, s);

  if (glyph === "x") {
    // The logo's x, alone, in the signal colour — the operator as the mark.
    const { xLeft, xWidth, xHeight, baseline } = logoGeometry;
    const k = (s * 0.5) / xHeight;
    ctx.save();
    ctx.translate(s / 2 - (xLeft + xWidth / 2) * k, s / 2 - (baseline - xHeight / 2) * k);
    ctx.scale(k, k);
    ctx.lineWidth = logoGeometry.stroke;
    ctx.lineCap = "butt";
    ctx.strokeStyle = p.signal;
    for (const d of xPaths()) ctx.stroke(new Path2D(d));
    ctx.restore();
    return;
  }

  // Monogram: ink initials, and one ember full stop — the 2% signal.
  const text = monogram.slice(0, 3);
  const size = text.length > 1 ? s * 0.46 : s * 0.62;
  ctx.font = `400 ${size}px ${SERIF}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const m = ctx.measureText(text);
  const baseline = s / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  const dot = s * 0.05;
  const cx = s / 2 - dot;
  ctx.fillStyle = p.ink;
  ctx.fillText(text, cx, baseline);
  ctx.fillStyle = p.signal;
  ctx.fillRect(cx + m.width / 2 + dot * 0.4, baseline - dot * 1.4, dot * 1.4, dot * 1.4);
  ctx.textAlign = "start";
}
