"use client";

import { forwardRef, useMemo } from "react";

const PAPER = "#F2EFE8";
const INK   = "#1C1B17";
const EMBER = "#E8593C";
const COOL  = "#3B5A6B";

export type DotShape  = "circle" | "square";
export type ColorMode = "ink" | "ember" | "inverted";
export type TreatmentFormat = "card" | "square";
export type TreatmentMode   = "dots" | "sharp";

export interface ImageTreatmentProps {
  mode:       TreatmentMode;
  resolution: number;        // 0 (coarse) → 100 (fine)
  dotShape:   DotShape;
  colorMode:  ColorMode;
  format:     TreatmentFormat;
}

// ── Mark geometry in original 400×200 space ──────────────────────────
const RECTS = [
  { x: 40,  y: 39.5, w: 120, h: 45  }, // Frontier
  { x: 240, y: 39.5, w: 120, h: 45  }, // Fortress
  { x: 50,  y: 134,  w: 300, h: 46  }, // Field
] as const;

// Line segments: [x1, y1, x2, y2]
const LINES: [number, number, number, number][] = [
  [100, 84.5, 200, 116],  // Frontier → merge
  [300, 84.5, 200, 116],  // Fortress → merge
  [200, 116,  200, 134],  // merge → Field
];

const MERGE = { x: 200, y: 116, r: 4 };

// Point-to-segment distance
function distSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Returns coverage 0–1 for a point in mark-space
// lineHalfW: effective half-width of lines in mark-space units
function coverage(mx: number, my: number, lineHalfW: number): number {
  // Inside any rectangle?
  for (const r of RECTS) {
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return 1;
  }
  // Near merge dot?
  if (Math.hypot(mx - MERGE.x, my - MERGE.y) <= MERGE.r + lineHalfW) return 1;
  // Near a line segment?
  for (const seg of LINES) {
    const d = distSeg(mx, my, ...seg);
    if (d < lineHalfW) return 1 - (d / lineHalfW) * 0.55;
  }
  return 0;
}

// ── Canvas dimensions ─────────────────────────────────────────────────
const DIMS = {
  card:   { vw: 1200, vh: 630 },
  square: { vw: 1200, vh: 1200 },
} as const;

// Map resolution 0–100 → dotSpacing px (canvas space)
// 0 = 36px (very coarse), 100 = 3px (very fine)
export function spacingFromResolution(r: number): number {
  return Math.round(36 - (r / 100) * 33);
}

// ── Dot computation (memo-friendly pure function) ─────────────────────
interface Dot { cx: number; cy: number; r: number }

function computeDots(
  vw: number, vh: number,
  dotSpacing: number,
  bg: string, fg: string,
): { dots: Dot[]; bg: string; fg: string } {
  // Scale mark to fit canvas with 10% padding
  const padX = vw * 0.10, padY = vh * 0.10;
  const availW = vw - 2 * padX, availH = vh - 2 * padY;
  const scale = Math.min(availW / 400, availH / 200);
  const markW = 400 * scale, markH = 200 * scale;
  const offX = (vw - markW) / 2, offY = (vh - markH) / 2;

  // Effective line half-width in mark-space
  // Grows with dot spacing so lines stay visible at low resolution
  const lineHalfW = Math.max(3, dotSpacing * 0.85) / scale;

  const maxR = dotSpacing * 0.46;
  const dots: Dot[] = [];

  for (let cy = dotSpacing / 2; cy < vh; cy += dotSpacing) {
    for (let cx = dotSpacing / 2; cx < vw; cx += dotSpacing) {
      const mx = (cx - offX) / scale;
      const my = (cy - offY) / scale;
      const cov = coverage(mx, my, lineHalfW);
      if (cov > 0.05) {
        dots.push({ cx, cy, r: maxR * cov });
      }
    }
  }

  return { dots, bg, fg };
}

// ── Sharp mark renderer (crisp geometric version) ─────────────────────
function SharpMark({ vw, vh, fg }: { vw: number; vh: number; fg: string }) {
  const padX = vw * 0.10, padY = vh * 0.10;
  const availW = vw - 2 * padX, availH = vh - 2 * padY;
  const S = Math.min(availW / 400, availH / 200);
  const offX = (vw - 400 * S) / 2, offY = (vh - 200 * S) / 2;

  const t = (x: number, y: number): [number, number] => [offX + x * S, offY + y * S];
  const [frX, frY]   = t(40, 39.5);
  const [foX, foY]   = t(240, 39.5);
  const [fiX, fiY]   = t(50, 134);
  const [mx, my]     = t(200, 116);

  return (
    <g>
      {/* Lines */}
      {LINES.map(([x1, y1, x2, y2], i) => {
        const [px1, py1] = t(x1, y1);
        const [px2, py2] = t(x2, y2);
        return <line key={i} x1={px1} y1={py1} x2={px2} y2={py2}
          stroke={EMBER} strokeWidth={1.5} strokeLinecap="round" />;
      })}
      {/* Merge dot */}
      <circle cx={mx} cy={my} r={3 * S} fill={EMBER} />
      {/* Frontier */}
      <rect x={frX} y={frY} width={120 * S} height={45 * S}
        fill={PAPER} stroke={fg} strokeWidth={1.2} />
      {/* Fortress */}
      <rect x={foX} y={foY} width={120 * S} height={45 * S}
        fill={PAPER} stroke={fg} strokeWidth={1.2} />
      {/* Field — dashed cool */}
      <rect x={fiX} y={fiY} width={300 * S} height={46 * S}
        fill={PAPER} stroke={COOL} strokeWidth={1.2}
        strokeDasharray={`${6} ${4}`} />
    </g>
  );
}

// ── Main component ────────────────────────────────────────────────────
export const ImageTreatmentDiagram = forwardRef<SVGSVGElement, ImageTreatmentProps>(
  function ImageTreatmentDiagram({ mode, resolution, dotShape, colorMode, format }, ref) {
    const { vw, vh } = DIMS[format];

    const bg = colorMode === "inverted" ? INK : PAPER;
    const fg = colorMode === "inverted" ? PAPER
             : colorMode === "ember"    ? EMBER
             : INK;

    const dotSpacing = spacingFromResolution(resolution);

    const { dots } = useMemo(
      () => computeDots(vw, vh, dotSpacing, bg, fg),
      [vw, vh, dotSpacing, bg, fg],
    );

    return (
      <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={vw} height={vh} fill={bg} />

        {mode === "dots" && dots.map((d, i) =>
          dotShape === "circle" ? (
            <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={fg} />
          ) : (
            <rect key={i}
              x={d.cx - d.r} y={d.cy - d.r}
              width={d.r * 2} height={d.r * 2}
              fill={fg} />
          )
        )}

        {mode === "sharp" && <SharpMark vw={vw} vh={vh} fg={fg} />}
      </svg>
    );
  }
);
