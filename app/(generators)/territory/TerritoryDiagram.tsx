"use client";

import { forwardRef, useMemo } from "react";
import { squarify } from "@/lib/squarify";

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
  cornerRadius: number;
  gutter:       number;
}

// ── Constants ───────────────────────────────────────────────────────────────

const DIMS: Record<TerritoryFormat, { vw: number; vh: number }> = {
  hero:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
};

const PAPER = "#FFFFFF";
const INK   = "#1C1B17";
const NAVY  = "#000064";
const OCEAN = "#005096";
const TEAL  = "#0082aa";
const SAND  = "#ffa064";
const DUSK  = "#ff5a00";

// ── Colour map ───────────────────────────────────────────────────────────────

function cellColors(
  rank: number,
  total: number,
  mode: TerritoryColorMode,
): { bg: string; fg: string } {
  if (mode === "ink") return { bg: PAPER, fg: INK };
  const t = total <= 1 ? 0 : rank / (total - 1);

  if (mode === "blueprint") {
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
      () => squarify(items, vw, vh),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(items), vw, vh],
    );

    const half = gutter / 2;

    return (
      <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg">
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

          const fs  = Math.min(Math.min(cw, ch) * 0.14, 42);
          const sub = fs * 0.52;

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
                  fontFamily={`"Suisse Int'l", "Helvetica Neue", Arial, sans-serif`} fontWeight="500"
                  fontSize={fs} fill={fg}
                >
                  {r.label}
                </text>
              )}
              {showSub && (
                <text
                  x={cx + cw / 2} y={subY}
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily={`"Suisse Int'l", "Helvetica Neue", Arial, sans-serif`} fontWeight="400"
                  fontSize={sub} fill={fg}
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
