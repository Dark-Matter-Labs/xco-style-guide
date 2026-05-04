"use client";

import { forwardRef } from "react";
import type { ThreeRegimesDiagramProps } from "./ThreeRegimesDiagram";

// Colour constants — no design-tokens import needed (no CSS vars in SVG export)
const PAPER    = "#F2EFE8";
const EMBER    = "#E8593C";
const COOL     = "#3B5A6B";
const INK      = "#1C1B17";

// Per-format gradient anchor coordinates (userSpaceOnUse)
const LAYOUTS = {
  hero: {
    vw: 1200, vh: 630,
    field:    { cx: 600,  cy: 630,  r: 680  },
    frontier: { cx: 240,  cy: 80,   r: 480  },
    fortress: { cx: 960,  cy: 95,   r: 440  },
    merge:    { cx: 600,  cy: 290,  r: 240  },
  },
  square: {
    vw: 1200, vh: 1200,
    field:    { cx: 600,  cy: 1200, r: 1050 },
    frontier: { cx: 240,  cy: 170,  r: 720  },
    fortress: { cx: 960,  cy: 190,  r: 680  },
    merge:    { cx: 600,  cy: 560,  r: 380  },
  },
  mark: {
    vw: 400,  vh: 200,
    field:    { cx: 200,  cy: 200,  r: 230  },
    frontier: { cx: 80,   cy: 28,   r: 160  },
    fortress: { cx: 320,  cy: 32,   r: 145  },
    merge:    { cx: 200,  cy: 90,   r: 80   },
  },
} as const;

// Pure mood / gradient composition.
// No text, no structure, no labels — visual register only.
// Composition reads: Field as vast cool ground; Frontier as warm
// expanding energy upper-left; Fortress as dense gravity upper-right;
// the three converge in an amber bloom at centre.
export const AbstractThreeRegimesDiagram = forwardRef<
  SVGSVGElement,
  ThreeRegimesDiagramProps
>(function AbstractThreeRegimesDiagram({ format }, ref) {
  const L = LAYOUTS[format];

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${L.vw} ${L.vh}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Field — cool, rises from bottom, dominates lower two-thirds */}
        <radialGradient
          id="abs-field"
          gradientUnits="userSpaceOnUse"
          cx={L.field.cx} cy={L.field.cy} r={L.field.r}
        >
          <stop offset="0%"   stopColor={COOL} stopOpacity="0.50" />
          <stop offset="40%"  stopColor={COOL} stopOpacity="0.18" />
          <stop offset="100%" stopColor={COOL} stopOpacity="0"    />
        </radialGradient>

        {/* Frontier — ember bloom, upper-left, expansive */}
        <radialGradient
          id="abs-frontier"
          gradientUnits="userSpaceOnUse"
          cx={L.frontier.cx} cy={L.frontier.cy} r={L.frontier.r}
        >
          <stop offset="0%"   stopColor={EMBER} stopOpacity="0.55" />
          <stop offset="35%"  stopColor={EMBER} stopOpacity="0.18" />
          <stop offset="100%" stopColor={EMBER} stopOpacity="0"    />
        </radialGradient>

        {/* Fortress — ink weight, upper-right, concentrated */}
        <radialGradient
          id="abs-fortress"
          gradientUnits="userSpaceOnUse"
          cx={L.fortress.cx} cy={L.fortress.cy} r={L.fortress.r}
        >
          <stop offset="0%"   stopColor={INK} stopOpacity="0.38" />
          <stop offset="40%"  stopColor={INK} stopOpacity="0.10" />
          <stop offset="100%" stopColor={INK} stopOpacity="0"    />
        </radialGradient>

        {/* Convergence — faint ember where the three meet */}
        <radialGradient
          id="abs-merge"
          gradientUnits="userSpaceOnUse"
          cx={L.merge.cx} cy={L.merge.cy} r={L.merge.r}
        >
          <stop offset="0%"   stopColor={EMBER} stopOpacity="0.20" />
          <stop offset="100%" stopColor={EMBER} stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Paper ground */}
      <rect width={L.vw} height={L.vh} fill={PAPER} />

      {/* Gradient washes — order matters for layering */}
      <rect width={L.vw} height={L.vh} fill="url(#abs-field)" />
      <rect width={L.vw} height={L.vh} fill="url(#abs-frontier)" />
      <rect width={L.vw} height={L.vh} fill="url(#abs-fortress)" />
      <rect width={L.vw} height={L.vh} fill="url(#abs-merge)" />
    </svg>
  );
});
