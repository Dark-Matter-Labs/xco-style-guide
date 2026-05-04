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
export type DiagramColorScheme = "standard" | "blueprint";

export interface ThreeRegimesDiagramProps {
  labels: DiagramLabels;
  relationshipStatement: string;
  caption: string;
  showAnnotations: boolean;
  format: DiagramFormat;
  amplitude: number; // retained for interface compat — unused
  colorScheme?: DiagramColorScheme;
}

const LAYOUTS = {
  hero: {
    vw: 1200, vh: 630,
    frontier: { cx: 300,  cy: 190, w: 260, h: 90  },
    fortress:  { cx: 900,  cy: 190, w: 260, h: 90  },
    field:     { cx: 600,  cy: 455, w: 860, h: 96  },
    merge:     { x: 600, y: 318 },
    relY: 550, capY: 598,
    relFontSize: 18, annoChars: 55,
    labelSize: 20, subSize: 13, lineW: 1.5, dotR: 5,
  },
  square: {
    vw: 1200, vh: 1200,
    frontier: { cx: 300,  cy: 300, w: 260, h: 90  },
    fortress:  { cx: 900,  cy: 300, w: 260, h: 90  },
    field:     { cx: 600,  cy: 740, w: 860, h: 100 },
    merge:     { x: 600, y: 524 },
    relY: 872, capY: 928,
    relFontSize: 20, annoChars: 70,
    labelSize: 20, subSize: 13, lineW: 1.5, dotR: 5,
  },
  mark: {
    vw: 400, vh: 200,
    frontier: { cx: 100, cy: 62, w: 120, h: 45 },
    fortress:  { cx: 300, cy: 62, w: 120, h: 45 },
    field:     { cx: 200, cy: 157, w: 300, h: 46 },
    merge:     { x: 200, y: 116 },
    relY: null, capY: null,
    relFontSize: 0, annoChars: 0,
    labelSize: 8, subSize: 6, lineW: 0.9, dotR: 3,
  },
} as const;

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital@0;1&family=Inter:wght@400;500&family=DM+Mono:ital,wght@0,400;1,400&display=swap');`;

const INK   = colors.ink.hex;
const PAPER = colors.paper.hex;
const EMBER = colors.ember.hex;
const COOL  = colors.cool.hex;
const MUTED = colors.inkMuted.hex;

// Extended palette — blueprint scheme
const NAVY  = "#192640";
const OCEAN = "#085A8C";
const TEAL  = "#3786A6";
const DUSK  = "#F27F3D";

// Horizontal hatching — density encodes regime character:
// Frontier (sparse): open, expansive, high optionality
// Fortress (dense):  closed, entrenched, low optionality
// Field (medium): systemic, broad, slower-moving
function HatchPatterns({ frColor, foColor, fiColor }: {
  frColor: string; foColor: string; fiColor: string;
}) {
  return (
    <>
      <pattern id="hatch-fr" patternUnits="userSpaceOnUse" width="8" height="10">
        <line x1="0" y1="0" x2="8" y2="0" stroke={frColor} strokeWidth="0.75" strokeOpacity="0.5" />
      </pattern>
      <pattern id="hatch-fo" patternUnits="userSpaceOnUse" width="8" height="4.5">
        <line x1="0" y1="0" x2="8" y2="0" stroke={foColor} strokeWidth="0.75" strokeOpacity="0.7" />
      </pattern>
      <pattern id="hatch-fi" patternUnits="userSpaceOnUse" width="8" height="7">
        <line x1="0" y1="0" x2="8" y2="0" stroke={fiColor} strokeWidth="0.75" strokeOpacity="0.55" />
      </pattern>
    </>
  );
}

// Hatched rectangle: white ground + hatch + crisp border
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

// Text with a white clearance rect so hatching doesn't cut through labels
function ClearLabel({
  cx, cy, primary, sub, primarySize, subSize, primaryColor, subColor,
  clearW, clearH,
}: {
  cx: number; cy: number;
  primary: string; sub?: string;
  primarySize: number; subSize: number;
  primaryColor: string; subColor: string;
  clearW: number; clearH: number;
}) {
  const gap = primarySize * 0.85;
  const primaryY = sub ? cy - gap / 2 : cy;
  const subY     = cy + gap;
  return (
    <g>
      <rect x={cx - clearW / 2} y={cy - clearH / 2}
        width={clearW} height={clearH} fill={PAPER} />
      <text x={cx} y={primaryY}
        textAnchor="middle" dominantBaseline="central"
        fontFamily="'DM Mono', monospace" fontSize={primarySize}
        fill={primaryColor}>
        {primary}
      </text>
      {sub && (
        <text x={cx} y={subY}
          textAnchor="middle" dominantBaseline="central"
          fontFamily="'DM Mono', monospace" fontSize={subSize}
          fontStyle="italic" fill={subColor} fillOpacity={0.7}>
          {sub}
        </text>
      )}
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
  { labels, relationshipStatement, caption, showAnnotations, format, colorScheme = "standard" },
  ref,
) {
  const L = LAYOUTS[format];
  const showText = format !== "mark";
  const hasSub = Boolean(labels.fieldSublabel);

  const bp = colorScheme === "blueprint";
  const C = {
    frontier:  bp ? TEAL  : INK,
    fortress:  bp ? NAVY  : INK,
    field:     bp ? OCEAN : COOL,
    connector: bp ? DUSK  : EMBER,
  };

  const frontierBot = { x: L.frontier.cx, y: L.frontier.cy + L.frontier.h / 2 };
  const fortressBot = { x: L.fortress.cx, y: L.fortress.cy + L.fortress.h / 2 };
  const fieldTop    = { x: L.field.cx,    y: L.field.cy    - L.field.h    / 2 };

  const annoLines = showAnnotations
    ? wrapText(
        "[inference] Field optionality as precondition — assumes capital can be directed toward systemic enablement, not only frontier push or fortress defence",
        L.annoChars,
      )
    : [];

  // Clearance rect sizing — comfortable padding around the text block
  const nodeClearW = L.frontier.w - 20;
  const nodeClearH = L.labelSize * 1.8;
  const fieldClearW = Math.min(L.field.w - 40, 400);
  const fieldClearH = hasSub ? L.labelSize * 1.6 + L.subSize * 1.6 : L.labelSize * 1.8;

  return (
    <svg ref={ref} viewBox={`0 0 ${L.vw} ${L.vh}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{FONT_IMPORT}</style>
        <HatchPatterns frColor={C.frontier} foColor={C.fortress} fiColor={C.field} />
      </defs>

      {/* Background */}
      <rect width={L.vw} height={L.vh} fill={PAPER} />

      {/* Connectors */}
      <line
        x1={frontierBot.x} y1={frontierBot.y} x2={L.merge.x} y2={L.merge.y}
        stroke={C.connector} strokeWidth={L.lineW} strokeLinecap="square"
      />
      <line
        x1={fortressBot.x} y1={fortressBot.y} x2={L.merge.x} y2={L.merge.y}
        stroke={C.connector} strokeWidth={L.lineW} strokeLinecap="square"
      />
      <line
        x1={L.merge.x} y1={L.merge.y} x2={fieldTop.x} y2={fieldTop.y}
        stroke={C.connector} strokeWidth={L.lineW} strokeLinecap="square"
      />

      {/* Merge dot */}
      <circle cx={L.merge.x} cy={L.merge.y} r={L.dotR} fill={C.connector} />

      {/* Nodes */}
      <HatchBox
        cx={L.frontier.cx} cy={L.frontier.cy}
        w={L.frontier.w} h={L.frontier.h}
        hatchId="hatch-fr" borderColor={C.frontier}
      />
      <HatchBox
        cx={L.fortress.cx} cy={L.fortress.cy}
        w={L.fortress.w} h={L.fortress.h}
        hatchId="hatch-fo" borderColor={C.fortress}
      />
      <HatchBox
        cx={L.field.cx} cy={L.field.cy}
        w={L.field.w} h={L.field.h}
        hatchId="hatch-fi" borderColor={C.field}
      />

      {/* Labels — rendered with white clearance so hatch doesn't cut through */}
      {showText && (
        <>
          <ClearLabel
            cx={L.frontier.cx} cy={L.frontier.cy}
            primary={labels.frontier}
            primarySize={L.labelSize} subSize={L.subSize}
            primaryColor={C.frontier} subColor={C.frontier}
            clearW={nodeClearW} clearH={nodeClearH}
          />
          <ClearLabel
            cx={L.fortress.cx} cy={L.fortress.cy}
            primary={labels.fortress}
            primarySize={L.labelSize} subSize={L.subSize}
            primaryColor={C.fortress} subColor={C.fortress}
            clearW={nodeClearW} clearH={nodeClearH}
          />
          <ClearLabel
            cx={L.field.cx} cy={L.field.cy}
            primary={labels.field}
            sub={labels.fieldSublabel || undefined}
            primarySize={L.labelSize} subSize={L.subSize}
            primaryColor={C.field} subColor={C.field}
            clearW={fieldClearW} clearH={fieldClearH}
          />
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
          fontFamily="'DM Mono', monospace" fontSize={14}
          fill={MUTED}
        >
          {caption}
        </text>
      )}

      {/* Annotation marginalia */}
      {showText && annoLines.length > 0 && (
        <g fontFamily="'DM Mono', monospace" fontSize={11} fill={MUTED} fillOpacity={0.65}>
          {annoLines.map((line, i) => (
            <text
              key={i}
              x={format === "square" ? 100 : 80}
              y={L.field.cy + L.field.h / 2 + 22 + i * 16}
            >
              {line}
            </text>
          ))}
        </g>
      )}
    </svg>
  );
});
