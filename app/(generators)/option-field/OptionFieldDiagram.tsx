"use client";

import { forwardRef, useMemo } from "react";
import { TimePrintMarks, TimePrintSlug } from "@/components/xco/TimePrint";
import { makeTimePrint, slugSize, type TimePrintProp } from "@/lib/asemic/time-print";
import { identityScales, paletteHex } from "@/lib/design-tokens";
import { spatialWeight } from "@/lib/regimes/weight";

const { paper: PAPER, ink: INK, navy: NAVY, ocean: OCEAN, teal: TEAL, sand: SAND, dusk: DUSK } = paletteHex;

export type FieldFormat    = "hero" | "square" | "mark";
export type FieldColorMode = "ink" | "spectrum" | "inverted" | "blueprint" | "warmth";

export interface OptionFieldProps {
  format:      FieldFormat;
  colorMode:   FieldColorMode;
  fieldStr:    number;   // 0–1  systemic foundation
  frontierStr: number;   // 0–1  open / emerging zone
  fortressStr: number;   // 0–1  concentrated / constrained zone
  volatility:  number;   // 0–1  spatial variation
  resolution:  number;   // 0–100 → scanline spacing
  /** The time print's minute, from the generator; null or absent when it is off. Never on the mark. */
  timePrint?:  TimePrintProp | null;
}

// The clear strip right of the scanlines: they stop at x ≈ 1136 of 1200.
const SLUG_MARGIN = 64;

const DIMS: Record<FieldFormat, { vw: number; vh: number }> = {
  hero:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
  mark:   { vw: 400,  vh: 200  },
};


// resolution 0–100 → spacing 20→8px (coarser range → cleaner, less linework)
export function resolveSpacing(r: number): number {
  return Math.round(20 - (r / 100) * 12);
}

function segmentColor(yRel: number, colorMode: FieldColorMode): string {
  if (colorMode === "inverted") return PAPER;
  if (colorMode === "spectrum") {
    if (yRel > 0.62) return OCEAN;
    if (yRel < 0.38) return DUSK;
    return INK;
  }
  if (colorMode === "blueprint") {
    // Navy ground — teal (open/frontier) → ocean (field/systemic) by register.
    // Teal and ocean are adjacent Field stops (500, 600), so the middle band
    // takes the next stop out, Field 400, rather than an off-scale hex.
    if (yRel < 0.38) return TEAL;
    if (yRel > 0.62) return OCEAN;
    return identityScales.field[400];
  }
  if (colorMode === "warmth") {
    // Paper ground — dusk (upper) → sand (lower); Signal 400 sits between them.
    if (yRel < 0.38) return DUSK;
    if (yRel > 0.62) return SAND;
    return identityScales.signal[400];
  }
  return INK;
}

interface Seg { x: number; y: number; h: number; color: string; w: number }

function compute(props: OptionFieldProps): Seg[] {
  const { vw, vh } = DIMS[props.format];
  const isMark = props.format === "mark";
  const PAD    = isMark ? 16 : 80;
  const segW   = isMark ? 8  : 22;
  const spacing = resolveSpacing(props.resolution);
  // Cap bar height to 80% of row pitch so rows always have visible gaps
  const maxW    = spacing * 0.8;
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
    const bg = colorMode === "inverted" ? INK : colorMode === "blueprint" ? NAVY : PAPER;
    const tp = format === "mark" ? null : props.timePrint;
    // The field has no words of its own, so the print always grows from the identity note.
    const print = useMemo(
      () => (tp ? makeTimePrint({ minute: tp.minute, words: "", width: vw, height: vh, ink: bg === PAPER ? INK : PAPER, ground: bg }) : null),
      [tp, vw, vh, bg],
    );

    const segs = useMemo(
      () => compute(props),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [format, colorMode, props.fieldStr, props.frontierStr,
       props.fortressStr, props.volatility, props.resolution],
    );

    return (
      <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg">
        <rect width={vw} height={vh} fill={bg} />
        {print && <TimePrintMarks print={print} />}
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
        {print && <TimePrintSlug print={print} width={vw} height={vh} margin={SLUG_MARGIN} bottom={SLUG_MARGIN} size={slugSize(13, SLUG_MARGIN)} />}
      </svg>
    );
  },
);
