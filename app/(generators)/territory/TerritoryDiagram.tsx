"use client";

import { forwardRef, useMemo } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

export type TerritoryFormat    = "hero" | "square";
export type TerritoryColorMode = "ink" | "blueprint" | "warmth" | "spectrum";

export interface TerritoryItem {
  label:     string;
  sublabel?: string;
  weight:    number;
}

export interface TerritoryProps {
  items:        TerritoryItem[];
  format:       TerritoryFormat;
  colorMode:    TerritoryColorMode;
  cornerRadius: number;   // px
  gutter:       number;   // px gap between cells
}

// ── Constants ───────────────────────────────────────────────────────────────

const DIMS: Record<TerritoryFormat, { vw: number; vh: number }> = {
  hero:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
};

const PAPER = "#FFFFFF";
const INK   = "#1C1B17";
const NAVY  = "#192640";
const OCEAN = "#085A8C";
const TEAL  = "#3786A6";
const SAND  = "#F2B077";
const DUSK  = "#F27F3D";

// ── Squarify algorithm ──────────────────────────────────────────────────────
// Bruls, Huizing, van Wijk (1999) — fills a rect with sub-rects whose areas
// are proportional to weights, minimising aspect ratios.

interface ComputedRect extends TerritoryItem {
  x: number; y: number; w: number; h: number;
  rank: number;  // 0 = largest
}

function worstRatio(areas: number[], shortEdge: number): number {
  if (areas.length === 0) return Infinity;
  const s = areas.reduce((a, b) => a + b, 0);
  const hi = Math.max(...areas);
  const lo = Math.min(...areas);
  return Math.max(
    (shortEdge * shortEdge * hi) / (s * s),
    (s * s) / (shortEdge * shortEdge * lo),
  );
}

function computeSquarify(items: TerritoryItem[], vw: number, vh: number): ComputedRect[] {
  const valid = items
    .filter(i => i.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  if (valid.length === 0) return [];

  const totalW = valid.reduce((s, i) => s + i.weight, 0);
  const totalA = vw * vh;
  const nodes  = valid.map((item, rank) => ({
    ...item,
    rank,
    area: (item.weight / totalW) * totalA,
  }));

  const rects: ComputedRect[] = [];

  function fixRow(
    row: typeof nodes,
    rx: number, ry: number, rw: number, rh: number,
  ): [number, number, number, number] {
    const rowSum = row.reduce((s, n) => s + n.area, 0);
    if (rw >= rh) {
      const stripW = rowSum / rh;
      let cy = ry;
      for (const n of row) {
        const cellH = n.area / stripW;
        rects.push({ ...n, x: rx, y: cy, w: stripW, h: cellH });
        cy += cellH;
      }
      return [rx + stripW, ry, rw - stripW, rh];
    } else {
      const stripH = rowSum / rw;
      let cx = rx;
      for (const n of row) {
        const cellW = n.area / stripH;
        rects.push({ ...n, x: cx, y: ry, w: cellW, h: stripH });
        cx += cellW;
      }
      return [rx, ry + stripH, rw, rh - stripH];
    }
  }

  function layout(
    remaining: typeof nodes,
    row:       typeof nodes,
    rx: number, ry: number, rw: number, rh: number,
  ) {
    if (rw < 1 || rh < 1) return;
    if (remaining.length === 0) {
      if (row.length > 0) fixRow(row, rx, ry, rw, rh);
      return;
    }
    const c       = remaining[0];
    const edge    = Math.min(rw, rh);
    const nextRow = [...row, c];

    if (
      row.length === 0 ||
      worstRatio(nextRow.map(n => n.area), edge) <=
      worstRatio(row.map(n => n.area), edge)
    ) {
      layout(remaining.slice(1), nextRow, rx, ry, rw, rh);
    } else {
      const [nx, ny, nw, nh] = fixRow(row, rx, ry, rw, rh);
      layout(remaining, [], nx, ny, nw, nh);
    }
  }

  layout(nodes, [], 0, 0, vw, vh);
  return rects;
}

// ── Colour map ───────────────────────────────────────────────────────────────

function cellColors(
  rank: number,
  total: number,
  mode: TerritoryColorMode,
): { bg: string; fg: string } {
  if (mode === "ink") return { bg: PAPER, fg: INK };
  const t = total <= 1 ? 0 : rank / (total - 1);

  if (mode === "blueprint") {
    // Largest = teal (open frontier), smallest = navy (foundational)
    if (t < 0.33) return { bg: TEAL,  fg: PAPER };
    if (t < 0.66) return { bg: OCEAN, fg: PAPER };
    return               { bg: NAVY,  fg: PAPER };
  }
  if (mode === "warmth") {
    return t < 0.5 ? { bg: SAND, fg: INK } : { bg: DUSK, fg: INK };
  }
  if (mode === "spectrum") {
    const stops: [string, string][] = [
      [SAND, INK], [DUSK, INK], [TEAL, PAPER], [OCEAN, PAPER], [NAVY, PAPER],
    ];
    const idx = Math.min(stops.length - 1, Math.floor(t * stops.length));
    return { bg: stops[idx][0], fg: stops[idx][1] };
  }
  return { bg: PAPER, fg: INK };
}

// ── Diagram component ────────────────────────────────────────────────────────

export const TerritoryDiagram = forwardRef<SVGSVGElement, TerritoryProps>(
  function TerritoryDiagram({ items, format, colorMode, cornerRadius, gutter }, ref) {
    const { vw, vh } = DIMS[format];

    const bg = colorMode === "blueprint" ? NAVY : INK;

    // Stringify items so useMemo doesn't re-run on every object reference change
    const rects = useMemo(
      () => computeSquarify(items, vw, vh),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(items), vw, vh],
    );

    const half = gutter / 2;

    return (
      <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=DM+Mono&display=swap');`}
          </style>
        </defs>
        <rect width={vw} height={vh} fill={bg} />

        {rects.map((r, i) => {
          const cx = r.x + half;
          const cy = r.y + half;
          const cw = r.w - gutter;
          const ch = r.h - gutter;
          if (cw < 4 || ch < 4) return null;

          const { bg: cellBg, fg } = cellColors(i, rects.length, colorMode);
          const showLabel = cw >= 64 && ch >= 42;
          const showSub   = showLabel && !!r.sublabel && cw >= 100 && ch >= 72;

          // Scale font to cell — 14% of shorter edge, capped at 42px
          const fs  = Math.min(Math.min(cw, ch) * 0.14, 42);
          const sub = fs * 0.52;

          // Vertical grouping when both label + sublabel present
          const gap    = fs * 0.18;
          const labelY = showSub
            ? cy + ch / 2 - gap / 2 - sub / 2
            : cy + ch / 2;
          const subY   = cy + ch / 2 + gap / 2 + fs / 2 + sub * 0.3;

          return (
            <g key={i}>
              <rect
                x={cx} y={cy} width={cw} height={ch}
                rx={cornerRadius} ry={cornerRadius}
                fill={cellBg}
              />
              {showLabel && (
                <text
                  x={cx + cw / 2} y={labelY}
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily="Inter, sans-serif" fontWeight="500"
                  fontSize={fs} fill={fg}
                >
                  {r.label}
                </text>
              )}
              {showSub && (
                <text
                  x={cx + cw / 2} y={subY}
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily="'DM Mono', monospace" fontWeight="400"
                  fontSize={sub} fill={fg} opacity={0.5}
                >
                  {r.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  },
);
