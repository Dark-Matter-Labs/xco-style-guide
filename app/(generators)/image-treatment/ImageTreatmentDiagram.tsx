"use client";

import { forwardRef, useMemo } from "react";
import { spatialWeight } from "@/app/(generators)/option-field/OptionFieldDiagram";

const PAPER = "#FFFFFF";
const INK   = "#1C1B17";
const OCEAN = "#005096";
const DUSK  = "#ff5a00";

export type ColorMode       = "ink" | "ember" | "inverted";
export type TreatmentFormat = "card" | "square";
export type TreatmentMode   = "raster" | "sharp";
export type SourceDiagram   = "three-regimes" | "option-field";
export type DiagramVariant  = "mark" | "territories" | "signal";

export interface ImageTreatmentProps {
  mode:            TreatmentMode;
  resolution:      number;
  colorMode:       ColorMode;
  format:          TreatmentFormat;
  sourceDiagram:   SourceDiagram;
  diagramVariant?: DiagramVariant;
}

export const DIMS = {
  card:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
} as const;

// Mark geometry — exported so the generator's SVG/canvas builders can share it
export const MARK_LINES: [number, number, number, number][] = [
  [100, 84.5, 200, 116],
  [300, 84.5, 200, 116],
  [200, 116,  200, 134],
];

const RECTS = [
  { x: 40,  y: 39.5, w: 120, h: 45  },
  { x: 240, y: 39.5, w: 120, h: 45  },
  { x: 50,  y: 134,  w: 300, h: 46  },
] as const;

const MERGE = { x: 200, y: 116, r: 4 };

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
      const w = spatialWeight(cx / vw, cy / vh, 0.72, 0.60, 0.52, 0.34, maxW);
      const cov = Math.min(1, w / maxW);
      if (cov > 0.05) dots.push({ cx, cy, r: maxR * cov });
    }
  }
  return dots;
}

// ── Sharp mark (SVG component — used only for export ref) ─────────────
function SharpMark({ vw, vh, fg }: { vw: number; vh: number; fg: string }) {
  const padX = vw * 0.10, padY = vh * 0.10;
  const S = Math.min((vw - 2 * padX) / 400, (vh - 2 * padY) / 200);
  const offX = (vw - 400 * S) / 2, offY = (vh - 200 * S) / 2;
  const t = (x: number, y: number): [number, number] => [offX + x * S, offY + y * S];
  const [frX, frY] = t(40, 39.5);
  const [foX, foY] = t(240, 39.5);
  const [fiX, fiY] = t(50, 134);
  const [mx, my]   = t(200, 116);
  return (
    <g>
      {MARK_LINES.map(([x1, y1, x2, y2], i) => {
        const [px1, py1] = t(x1, y1);
        const [px2, py2] = t(x2, y2);
        return <line key={i} x1={px1} y1={py1} x2={px2} y2={py2}
          stroke={DUSK} strokeWidth={1.5} strokeLinecap="round" />;
      })}
      <circle cx={mx} cy={my} r={3 * S} fill={DUSK} />
      <rect x={frX} y={frY} width={120 * S} height={45 * S} fill={PAPER} stroke={fg} strokeWidth={1.2} />
      <rect x={foX} y={foY} width={120 * S} height={45 * S} fill={PAPER} stroke={fg} strokeWidth={1.2} />
      <rect x={fiX} y={fiY} width={300 * S} height={46 * S} fill={PAPER} stroke={OCEAN} strokeWidth={1.2}
        strokeDasharray="6 4" />
    </g>
  );
}

function OptionFieldSharp({ vw, vh, fg, dotSpacing }: { vw: number; vh: number; fg: string; dotSpacing: number }) {
  const spacing = Math.max(3, dotSpacing);
  const segW = Math.max(4, Math.round(spacing * 0.85));
  const pad = Math.round(vw * 0.04);
  const maxW = spacing * 1.5;
  const usableW = vw - pad * 2;
  const segs: { x: number; y: number; sh: number }[] = [];
  for (let y = spacing / 2; y < vh; y += spacing) {
    const yRel = y / vh;
    for (let x = pad; x < vw - pad; x += segW) {
      const sh = spatialWeight((x - pad) / usableW, yRel, 0.72, 0.60, 0.52, 0.34, maxW);
      segs.push({ x, y, sh });
    }
  }
  return (
    <>
      {segs.map((s, i) => (
        <rect key={i} x={s.x} y={s.y - s.sh / 2} width={segW} height={s.sh} fill={fg} />
      ))}
    </>
  );
}

// ── Main SVG component — only used for export refs ───────────────────
export const ImageTreatmentDiagram = forwardRef<SVGSVGElement, ImageTreatmentProps>(
  function ImageTreatmentDiagram({ mode, resolution, colorMode, format, sourceDiagram }, ref) {
    const { vw, vh } = DIMS[format];
    const bg = colorMode === "inverted" ? INK : PAPER;
    const fg = colorMode === "inverted" ? PAPER : colorMode === "ember" ? DUSK : INK;
    const dotSpacing = spacingFromResolution(resolution);
    const isField = sourceDiagram === "option-field";

    const dots = useMemo(() => computeDots(vw, vh, dotSpacing), [vw, vh, dotSpacing]);
    const fieldDots = useMemo(() => computeOptionFieldDots(vw, vh, dotSpacing), [vw, vh, dotSpacing]);

    return (
      <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={vw} height={vh} fill={bg} />
        {mode === "raster" && !isField && dots.map((d, i) =>
          <rect key={i} x={d.cx - d.r} y={d.cy - d.r} width={d.r * 2} height={d.r * 2} fill={fg} />
        )}
        {mode === "raster" && isField && fieldDots.map((d, i) =>
          <rect key={i} x={d.cx - d.r} y={d.cy - d.r} width={d.r * 2} height={d.r * 2} fill={fg} />
        )}
        {mode === "sharp" && !isField && <SharpMark vw={vw} vh={vh} fg={fg} />}
        {mode === "sharp" &&  isField && <OptionFieldSharp vw={vw} vh={vh} fg={fg} dotSpacing={dotSpacing} />}
      </svg>
    );
  }
);
