"use client";

import { forwardRef, useMemo } from "react";
import { TimePrintMarks, TimePrintSlug } from "@/components/xco/TimePrint";
import { makeTimePrint, slugSize } from "@/lib/asemic/time-print";
import { slugMargin, type ThreeRegimesDiagramProps } from "./ThreeRegimesDiagram";
import { paletteHex } from "@/lib/design-tokens";

const DIMS = {
  hero:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
  mark:   { vw: 400,  vh: 200  },
} as const;

// Full-bleed horizon sweep: navy → ocean → teal → sand → dusk, from the palette
export const AbstractThreeRegimesDiagram = forwardRef<
  SVGSVGElement,
  ThreeRegimesDiagramProps
>(function AbstractThreeRegimesDiagram({ format, timePrint }, ref) {
  const { vw, vh } = DIMS[format];
  const tp = format === "mark" ? null : timePrint;
  // The sweep has no words of its own, so the print always grows from the identity note.
  const print = useMemo(
    () => (tp ? makeTimePrint({ minute: tp.minute, words: "", width: vw, height: vh, ink: paletteHex.paper, ground: null }) : null),
    [tp, vw, vh],
  );
  const margin = slugMargin("classic", format);

  return (
    <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abs-sweep" gradientUnits="userSpaceOnUse"
          x1={vw / 2} y1={0} x2={vw / 2} y2={vh}>
          <stop offset="0%"   stopColor={paletteHex.navy} />
          <stop offset="35%"  stopColor={paletteHex.ocean} />
          <stop offset="55%"  stopColor={paletteHex.teal} />
          <stop offset="75%"  stopColor={paletteHex.sand} />
          <stop offset="100%" stopColor={paletteHex.dusk} />
        </linearGradient>
      </defs>
      <rect width={vw} height={vh} fill="url(#abs-sweep)" />
      {print && <TimePrintMarks print={print} />}
      {/* The sweep is navy at the top and dusk at the bottom: the slug hangs from the top, where paper type reads. */}
      {print && <TimePrintSlug print={print} width={vw} height={vh} margin={margin} bottom={margin} size={slugSize(13, margin)} top={margin} />}
    </svg>
  );
});
