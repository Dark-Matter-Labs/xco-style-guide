"use client";

import { forwardRef } from "react";
import { colors } from "@/lib/design-tokens";

export interface DiagramLabels {
  frontier: string;
  fortress: string;
  field: string;
  fieldSublabel: string;
}

export type DiagramFormat = "hero" | "square" | "mark";

export interface ThreeRegimesDiagramProps {
  labels: DiagramLabels;
  relationshipStatement: string;
  caption: string;
  showAnnotations: boolean;
  format: DiagramFormat;
  amplitude: number; // retained for interface compat — unused
}

const LAYOUTS = {
  hero: {
    vw: 1200, vh: 630,
    frontier: { cx: 300,  cy: 190, w: 240, h: 80  },
    fortress:  { cx: 900,  cy: 190, w: 240, h: 80  },
    field:     { cx: 600,  cy: 450, w: 820, h: 90  },
    merge:     { x: 600, y: 318 },
    relY: 547, capY: 595,
    relFontSize: 14, annoChars: 55,
    labelSize: 11, subSize: 9, lineW: 1.5, dotR: 4,
  },
  square: {
    vw: 1200, vh: 1200,
    frontier: { cx: 300,  cy: 300, w: 240, h: 80  },
    fortress:  { cx: 900,  cy: 300, w: 240, h: 80  },
    field:     { cx: 600,  cy: 730, w: 820, h: 100 },
    merge:     { x: 600, y: 520 },
    relY: 865, capY: 925,
    relFontSize: 16, annoChars: 70,
    labelSize: 11, subSize: 9, lineW: 1.5, dotR: 4,
  },
  mark: {
    vw: 400, vh: 200,
    frontier: { cx: 100, cy: 62, w: 120, h: 45 },
    fortress:  { cx: 300, cy: 62, w: 120, h: 45 },
    field:     { cx: 200, cy: 157, w: 300, h: 46 },
    merge:     { x: 200, y: 116 },
    relY: null, capY: null,
    relFontSize: 0, annoChars: 0,
    labelSize: 7, subSize: 5.5, lineW: 0.8, dotR: 2.5,
  },
} as const;

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital@0;1&family=Inter:wght@400;500&family=DM+Mono:ital,wght@0,400;1,400&display=swap');`;

const INK   = colors.ink.hex;
const PAPER = colors.paper.hex;
const EMBER = colors.ember.hex;
const COOL  = colors.cool.hex;
const MUTED = colors.inkMuted.hex;

// Horizontal hatching patterns — density encodes regime character:
// Frontier (sparse): open, expansive, high optionality
// Fortress (dense):  closed, entrenched, low optionality
// Field (medium, cool): systemic, broad, slower-moving
function HatchPatterns() {
  return (
    <>
      <pattern id="hatch-fr" patternUnits="userSpaceOnUse" width="8" height="9">
        <line x1="0" y1="0" x2="8" y2="0" stroke={INK} strokeWidth="0.75" />
      </pattern>
      <pattern id="hatch-fo" patternUnits="userSpaceOnUse" width="8" height="4">
        <line x1="0" y1="0" x2="8" y2="0" stroke={INK} strokeWidth="0.75" />
      </pattern>
      <pattern id="hatch-fi" patternUnits="userSpaceOnUse" width="8" height="6">
        <line x1="0" y1="0" x2="8" y2="0" stroke={COOL} strokeWidth="0.75" />
      </pattern>
    </>
  );
}

// Hatched rectangle: white ground + hatch fill + crisp border
function HatchBox({
  cx, cy, w, h, hatchId, borderColor = INK, borderWidth = 1.5,
}: {
  cx: number; cy: number; w: number; h: number;
  hatchId: string; borderColor?: string; borderWidth?: number;
}) {
  const x = cx - w / 2, y = cy - h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={PAPER} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${hatchId})`} />
      <rect x={x} y={y} width={w} height={h} fill="none"
        stroke={borderColor} strokeWidth={borderWidth} />
    </g>
  );
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (test.length > maxChars && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export const ThreeRegimesDiagram = forwardRef<
  SVGSVGElement,
  ThreeRegimesDiagramProps
>(function ThreeRegimesDiagram(
  { labels, relationshipStatement, caption, showAnnotations, format },
  ref,
) {
  const L = LAYOUTS[format];
  const showText = format !== "mark";

  const frontierBot = { x: L.frontier.cx, y: L.frontier.cy + L.frontier.h / 2 };
  const fortressBot = { x: L.fortress.cx, y: L.fortress.cy + L.fortress.h / 2 };
  const fieldTop    = { x: L.field.cx,    y: L.field.cy    - L.field.h    / 2 };

  const annoLines = showAnnotations
    ? wrapText(
        "[inference] Field optionality as precondition — assumes capital can be directed toward systemic enablement, not only frontier push or fortress defence",
        L.annoChars,
      )
    : [];

  return (
    <svg ref={ref} viewBox={`0 0 ${L.vw} ${L.vh}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{FONT_IMPORT}</style>
        <HatchPatterns />
      </defs>

      {/* Background */}
      <rect width={L.vw} height={L.vh} fill={PAPER} />

      {/* Connectors — ember, crisp */}
      <line
        x1={frontierBot.x} y1={frontierBot.y} x2={L.merge.x} y2={L.merge.y}
        stroke={EMBER} strokeWidth={L.lineW} strokeLinecap="square"
      />
      <line
        x1={fortressBot.x} y1={fortressBot.y} x2={L.merge.x} y2={L.merge.y}
        stroke={EMBER} strokeWidth={L.lineW} strokeLinecap="square"
      />
      <line
        x1={L.merge.x} y1={L.merge.y} x2={fieldTop.x} y2={fieldTop.y}
        stroke={EMBER} strokeWidth={L.lineW} strokeLinecap="square"
      />

      {/* Merge dot */}
      <circle cx={L.merge.x} cy={L.merge.y} r={L.dotR} fill={EMBER} />

      {/* Nodes — drawn on top of connectors */}
      <HatchBox
        cx={L.frontier.cx} cy={L.frontier.cy}
        w={L.frontier.w} h={L.frontier.h}
        hatchId="hatch-fr"
      />
      <HatchBox
        cx={L.fortress.cx} cy={L.fortress.cy}
        w={L.fortress.w} h={L.fortress.h}
        hatchId="hatch-fo"
      />
      <HatchBox
        cx={L.field.cx} cy={L.field.cy}
        w={L.field.w} h={L.field.h}
        hatchId="hatch-fi"
        borderColor={COOL}
      />

      {/* Node labels */}
      {showText && (
        <>
          {/* Frontier */}
          <text
            x={L.frontier.cx} y={labels.fieldSublabel ? L.frontier.cy - L.labelSize * 0.4 : L.frontier.cy}
            textAnchor="middle" dominantBaseline="central"
            fontFamily="'DM Mono', monospace" fontSize={L.labelSize}
            fill={INK} letterSpacing="1"
          >
            {labels.frontier}
          </text>

          {/* Fortress */}
          <text
            x={L.fortress.cx} y={L.fortress.cy}
            textAnchor="middle" dominantBaseline="central"
            fontFamily="'DM Mono', monospace" fontSize={L.labelSize}
            fill={INK} letterSpacing="1"
          >
            {labels.fortress}
          </text>

          {/* Field — label + sublabel */}
          <text
            x={L.field.cx}
            y={labels.fieldSublabel ? L.field.cy - L.subSize * 0.8 : L.field.cy}
            textAnchor="middle" dominantBaseline="central"
            fontFamily="'DM Mono', monospace" fontSize={L.labelSize}
            fill={COOL} letterSpacing="1"
          >
            {labels.field}
          </text>
          {labels.fieldSublabel && (
            <text
              x={L.field.cx} y={L.field.cy + L.labelSize * 0.9}
              textAnchor="middle" dominantBaseline="central"
              fontFamily="'DM Mono', monospace" fontSize={L.subSize}
              fontStyle="italic" fill={COOL} fillOpacity={0.65}
            >
              {labels.fieldSublabel}
            </text>
          )}
        </>
      )}

      {/* Relationship statement */}
      {showText && L.relY !== null && relationshipStatement && (
        <text
          x={L.vw / 2} y={L.relY}
          textAnchor="middle"
          fontFamily="'DM Mono', monospace" fontSize={L.relFontSize}
          fontStyle="italic" fill={MUTED}
        >
          {relationshipStatement}
        </text>
      )}

      {/* Caption */}
      {showText && L.capY !== null && caption && (
        <text
          x={L.vw / 2} y={L.capY}
          textAnchor="middle"
          fontFamily="'DM Mono', monospace" fontSize={11}
          fill={MUTED}
        >
          {caption}
        </text>
      )}

      {/* Annotation marginalia */}
      {showText && annoLines.length > 0 && (
        <g fontFamily="'DM Mono', monospace" fontSize={9} fill={MUTED} fillOpacity={0.65}>
          {annoLines.map((line, i) => (
            <text
              key={i}
              x={format === "square" ? 100 : 80}
              y={L.field.cy + L.field.h / 2 + 18 + i * 13}
            >
              {line}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
});
