"use client";

import { forwardRef } from "react";
import type { ThreeRegimesDiagramProps } from "./ThreeRegimesDiagram";

const DIMS = {
  hero:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
  mark:   { vw: 400,  vh: 200  },
} as const;

// Full-bleed horizon sweep: dark navy → ocean blue → sky blue → warm peach → orange
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
          <stop offset="0%"   stopColor="#000064" />
          <stop offset="35%"  stopColor="#005096" />
          <stop offset="55%"  stopColor="#0082aa" />
          <stop offset="75%"  stopColor="#ffa064" />
          <stop offset="100%" stopColor="#ff5a00" />
        </linearGradient>
      </defs>
      <rect width={vw} height={vh} fill="url(#abs-sweep)" />
    </svg>
  );
});
