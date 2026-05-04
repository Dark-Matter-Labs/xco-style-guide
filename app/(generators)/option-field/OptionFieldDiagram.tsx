"use client";

import { forwardRef, useMemo } from "react";

export type FieldFormat    = "hero" | "square" | "mark";
export type FieldColorMode = "ink" | "spectrum" | "inverted";

export interface OptionFieldProps {
  format:      FieldFormat;
  colorMode:   FieldColorMode;
  fieldStr:    number;   // 0–1  systemic foundation
  frontierStr: number;   // 0–1  open / emerging zone
  fortressStr: number;   // 0–1  concentrated / constrained zone
  volatility:  number;   // 0–1  spatial variation
  resolution:  number;   // 0–100 → scanline spacing
}

const DIMS: Record<FieldFormat, { vw: number; vh: number }> = {
  hero:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
  mark:   { vw: 400,  vh: 200  },
};

const PAPER = "#FFFFFF";
const INK   = "#1C1B17";
const EMBER = "#E8593C";
const COOL  = "#3B5A6B";

// resolution 0–100 → spacing 10→3px
function resolveSpacing(r: number): number {
  return Math.round(10 - (r / 100) * 7);
}

// Spatial weight function — encodes optionality field geometry
// xRel, yRel ∈ [0,1]; y=0 is top, y=1 is bottom
function spatialWeight(
  xRel: number,
  yRel: number,
  fieldStr: number,
  frontierStr: number,
  fortressStr: number,
  volatility: number,
  maxW: number,
): number {
  // Field foundation — broad, grows toward bottom (systemic ground)
  const fld = fieldStr * (0.2 + 0.8 * Math.pow(yRel, 0.38)) * maxW * 0.88;

  // Frontier zone — upper-left, lighter/sparse (open optionality)
  const frDist = Math.hypot((xRel - 0.22) * 1.6, yRel - 0.28);
  const fr = frontierStr * Math.max(0, 1 - frDist * 2.1) * maxW * 0.62;

  // Fortress zone — upper-right, heavier/dense (concentrated, constrained)
  const foDist = Math.hypot((xRel - 0.78) * 1.6, yRel - 0.28);
  const fo = fortressStr * Math.max(0, 1 - foDist * 1.9) * maxW * 1.12;

  // Convergence — centre-mid where the three regimes meet
  const cvDist = Math.hypot(xRel - 0.50, (yRel - 0.50) * 1.25);
  const cv = Math.min(fieldStr, fortressStr) * 0.52
    * Math.max(0, 1 - cvDist * 2.75) * maxW;

  // Spatial noise: multi-frequency sine combination
  const noise = volatility * (
    Math.sin(xRel * 11.3 + yRel *  8.7) * 0.42 +
    Math.sin(xRel *  6.1 + yRel * 14.9) * 0.33 +
    Math.sin(xRel * 18.7 + yRel *  3.4) * 0.25
  ) * maxW * 0.32;

  return Math.max(0.4, Math.min(maxW, fld + fr + fo + cv + noise));
}

function segmentColor(yRel: number, colorMode: FieldColorMode): string {
  if (colorMode === "inverted") return PAPER;
  if (colorMode === "spectrum") {
    // Field (bottom) → COOL, convergence/open (top) → EMBER, mid → INK
    if (yRel > 0.62) return COOL;
    if (yRel < 0.38) return EMBER;
    return INK;
  }
  return INK;
}

interface Seg { x: number; y: number; h: number; color: string; w: number }

function compute(props: OptionFieldProps): Seg[] {
  const { vw, vh } = DIMS[props.format];
  const isMark = props.format === "mark";
  const PAD    = isMark ? 14 : 54;
  const segW   = isMark ? 5  : 12;
  const spacing = resolveSpacing(props.resolution);
  const maxW    = spacing * 1.5;
  const segs: Seg[] = [];

  const usableW = vw - PAD * 2;

  for (let y = spacing / 2; y < vh; y += spacing) {
    const yRel = y / vh;
    for (let x = PAD; x < vw - PAD; x += segW) {
      const xRel = (x - PAD) / usableW;
      const h = spatialWeight(
        xRel, yRel,
        props.fieldStr, props.frontierStr, props.fortressStr,
        props.volatility, maxW,
      );
      segs.push({ x, y, h, color: segmentColor(yRel, props.colorMode), w: segW });
    }
  }
  return segs;
}

export const OptionFieldDiagram = forwardRef<SVGSVGElement, OptionFieldProps>(
  function OptionFieldDiagram(props, ref) {
    const { format, colorMode } = props;
    const { vw, vh } = DIMS[format];
    const bg = colorMode === "inverted" ? INK : PAPER;

    const segs = useMemo(
      () => compute(props),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [format, colorMode, props.fieldStr, props.frontierStr,
       props.fortressStr, props.volatility, props.resolution],
    );

    return (
      <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={vw} height={vh} fill={bg} />
        {segs.map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={s.y - s.h / 2}
            width={s.w}
            height={s.h}
            fill={s.color}
          />
        ))}
      </svg>
    );
  },
);
