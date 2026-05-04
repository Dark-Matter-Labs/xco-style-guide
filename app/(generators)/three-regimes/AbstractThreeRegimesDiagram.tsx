"use client";

import { forwardRef } from "react";
import type { ThreeRegimesDiagramProps } from "./ThreeRegimesDiagram";

const DIMS = {
  hero:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
  mark:   { vw: 400,  vh: 200  },
} as const;

// Full-bleed linear sweep: dark navy (top) → xco-cool → warm amber → ember (bottom)
// Matches the Novacene reference: fully saturated, no opacity washing, horizon feel
export const AbstractThreeRegimesDiagram = forwardRef<
  SVGSVGElement,
  ThreeRegimesDiagramProps
>(function AbstractThreeRegimesDiagram({ format }, ref) {
  const { vw, vh } = DIMS[format];

  return (
    <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abs-sweep" gradientUnits="userSpaceOnUse"
          x1={vw / 2} y1={0} x2={vw / 2} y2={vh}>
          <stop offset="0%"   stopColor="#0F1C24" />
          <stop offset="22%"  stopColor="#1A3241" />
          <stop offset="48%"  stopColor="#3B5A6B" />
          <stop offset="68%"  stopColor="#7A4132" />
          <stop offset="85%"  stopColor="#CC5038" />
          <stop offset="100%" stopColor="#E8593C" />
        </linearGradient>
      </defs>
      <rect width={vw} height={vh} fill="url(#abs-sweep)" />
    </svg>
  );
});
