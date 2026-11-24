import { MARK } from "@/lib/regimes/embeds";
import { embedWeight } from "@/lib/regimes/weight";

export type ColorMode       = "ink" | "ember" | "inverted";
export type TreatmentFormat = "card" | "square";
export type TreatmentMode   = "raster" | "sharp";
export type SourceDiagram   = "three-regimes" | "option-field";
export type DiagramVariant  = "mark" | "territories" | "signal";

export const DIMS = {
  card:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
} as const;

// Mark geometry, from the shared mark — exported so the generator's SVG/canvas builders can share it
const { frontier: FR, fortress: FO, field: FI, merge: M } = MARK;
export const MARK_LINES: [number, number, number, number][] = [
  [FR.cx, FR.cy + FR.h / 2, M.x, M.y],
  [FO.cx, FO.cy + FO.h / 2, M.x, M.y],
  [M.x, M.y, FI.cx, FI.cy - FI.h / 2],
];

const RECTS = [FR, FO, FI].map((b) => ({ x: b.cx - b.w / 2, y: b.cy - b.h / 2, w: b.w, h: b.h }));

const MERGE = { ...M, r: 4 };

function distSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function markCoverage(mx: number, my: number, lineHalfW: number): number {
  for (const r of RECTS) {
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return 1;
  }
  if (Math.hypot(mx - MERGE.x, my - MERGE.y) <= MERGE.r + lineHalfW) return 1;
  for (const seg of MARK_LINES) {
    const d = distSeg(mx, my, ...seg);
    if (d < lineHalfW) return 1 - (d / lineHalfW) * 0.55;
  }
  return 0;
}

export interface Dot { cx: number; cy: number; r: number }

// Map resolution 0–100 → dotSpacing px (canvas space)
export function spacingFromResolution(r: number): number {
  return Math.round(36 - (r / 100) * 33);
}

// Exported: used by the generator's canvas preview and SVG string builder
export function computeDots(vw: number, vh: number, dotSpacing: number): Dot[] {
  const padX = vw * 0.10, padY = vh * 0.10;
  const availW = vw - 2 * padX, availH = vh - 2 * padY;
  const scale = Math.min(availW / 400, availH / 200);
  const markW = 400 * scale, markH = 200 * scale;
  const offX = (vw - markW) / 2, offY = (vh - markH) / 2;
  const lineHalfW = Math.max(3, dotSpacing * 0.85) / scale;
  const maxR = dotSpacing * 0.46;
  const dots: Dot[] = [];
  for (let cy = dotSpacing / 2; cy < vh; cy += dotSpacing) {
    for (let cx = dotSpacing / 2; cx < vw; cx += dotSpacing) {
      const mx = (cx - offX) / scale;
      const my = (cy - offY) / scale;
      const cov = markCoverage(mx, my, lineHalfW);
      if (cov > 0.05) dots.push({ cx, cy, r: maxR * cov });
    }
  }
  return dots;
}

export function computeOptionFieldDots(vw: number, vh: number, dotSpacing: number): Dot[] {
  const maxW = dotSpacing * 1.0;
  const maxR = dotSpacing * 0.46;
  const dots: Dot[] = [];
  for (let cy = dotSpacing / 2; cy < vh; cy += dotSpacing) {
    for (let cx = dotSpacing / 2; cx < vw; cx += dotSpacing) {
      const w = embedWeight(cx / vw, cy / vh, maxW);
      const cov = Math.min(1, w / maxW);
      if (cov > 0.05) dots.push({ cx, cy, r: maxR * cov });
    }
  }
  return dots;
}
