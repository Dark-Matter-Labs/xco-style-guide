"use client";

import { forwardRef } from "react";
import {
  JitteredLine,
  OptionNode,
  FieldNode,
  Annotation,
} from "@/lib/diagram-primitives";
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
  amplitude: number;
}

// Layout definitions per export format.
// All coordinates are in SVG logical pixels (= final pixel dimensions).
const LAYOUTS = {
  hero: {
    vw: 1200, vh: 630,
    frontier: { cx: 300, cy: 190, w: 240, h: 80 },
    fortress:  { cx: 900, cy: 190, w: 240, h: 80 },
    field:     { cx: 600, cy: 450, w: 820, h: 90 },
    merge:     { x: 600, y: 318 },
    relY: 547, capY: 595,
    relFontSize: 14, annoChars: 55,
  },
  square: {
    vw: 1200, vh: 1200,
    frontier: { cx: 300, cy: 300, w: 240, h: 80 },
    fortress:  { cx: 900, cy: 300, w: 240, h: 80 },
    field:     { cx: 600, cy: 730, w: 820, h: 100 },
    merge:     { x: 600, y: 520 },
    relY: 865, capY: 925,
    relFontSize: 16, annoChars: 70,
  },
  mark: {
    vw: 400, vh: 200,
    frontier: { cx: 100, cy: 62, w: 120, h: 45 },
    fortress:  { cx: 300, cy: 62, w: 120, h: 45 },
    field:     { cx: 200, cy: 157, w: 300, h: 46 },
    merge:     { x: 200, y: 116 },
    relY: null, capY: null,
    relFontSize: 0, annoChars: 0,
  },
} as const;

// [inference] Exported SVGs reference Google Fonts CDN — requires internet.
// PNG export rasterises via canvas and falls back to system fonts.
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital@0;1&family=Inter:wght@400;500&family=DM+Mono:ital,wght@0,400;1,400&display=swap');`;

export const ThreeRegimesDiagram = forwardRef<
  SVGSVGElement,
  ThreeRegimesDiagramProps
>(function ThreeRegimesDiagram(
  { labels, relationshipStatement, caption, showAnnotations, format, amplitude },
  ref,
) {
  const L = LAYOUTS[format];
  const showText = format !== "mark";

  const frontierBot = { x: L.frontier.cx, y: L.frontier.cy + L.frontier.h / 2 };
  const fortressBot = { x: L.fortress.cx, y: L.fortress.cy + L.fortress.h / 2 };
  const fieldTop    = { x: L.field.cx,    y: L.field.cy    - L.field.h    / 2 };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${L.vw} ${L.vh}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{FONT_IMPORT}</style>
      </defs>

      {/* Background */}
      <rect width={L.vw} height={L.vh} fill={colors.paper.hex} />

      {/* Connecting lines — ember marks the active axis */}
      <JitteredLine
        x1={frontierBot.x} y1={frontierBot.y}
        x2={L.merge.x}     y2={L.merge.y}
        stroke={colors.ember.hex}
        amplitude={amplitude}
        seed={4}
      />
      <JitteredLine
        x1={fortressBot.x} y1={fortressBot.y}
        x2={L.merge.x}     y2={L.merge.y}
        stroke={colors.ember.hex}
        amplitude={amplitude}
        seed={5}
      />
      <JitteredLine
        x1={L.merge.x} y1={L.merge.y}
        x2={fieldTop.x} y2={fieldTop.y}
        stroke={colors.ember.hex}
        amplitude={amplitude}
        seed={6}
      />

      {/* Merge dot */}
      <circle
        cx={L.merge.x}
        cy={L.merge.y}
        r={format === "mark" ? 2.5 : 4}
        fill={colors.ember.hex}
      />

      {/* Nodes — drawn on top of lines */}
      <OptionNode
        cx={L.frontier.cx} cy={L.frontier.cy}
        width={L.frontier.w} height={L.frontier.h}
        label={showText ? labels.frontier : ""}
        amplitude={amplitude}
        seed={1}
      />
      <OptionNode
        cx={L.fortress.cx} cy={L.fortress.cy}
        width={L.fortress.w} height={L.fortress.h}
        label={showText ? labels.fortress : ""}
        amplitude={amplitude}
        seed={2}
      />
      <FieldNode
        cx={L.field.cx} cy={L.field.cy}
        width={L.field.w} height={L.field.h}
        label={showText ? labels.field : ""}
        sublabel={showText ? labels.fieldSublabel : ""}
        amplitude={amplitude}
        seed={3}
      />

      {/* Relationship statement */}
      {showText && L.relY !== null && relationshipStatement && (
        <text
          x={L.vw / 2}
          y={L.relY}
          textAnchor="middle"
          fill={colors.inkMuted.hex}
          fontSize={L.relFontSize}
          fontFamily="'DM Mono', monospace"
          fontStyle="italic"
        >
          {relationshipStatement}
        </text>
      )}

      {/* Caption */}
      {showText && L.capY !== null && caption && (
        <text
          x={L.vw / 2}
          y={L.capY}
          textAnchor="middle"
          fill={colors.inkMuted.hex}
          fontSize={11}
          fontFamily="'DM Mono', monospace"
        >
          {caption}
        </text>
      )}

      {/* Annotation marginalia */}
      {showText && showAnnotations && (
        <Annotation
          x={format === "square" ? 100 : 80}
          y={L.field.cy + L.field.h / 2 + 20}
          text="[inference] Field optionality as precondition — assumes capital can be directed toward systemic enablement, not only frontier push or fortress defence"
          charsPerLine={L.annoChars}
        />
      )}
    </svg>
  );
});
