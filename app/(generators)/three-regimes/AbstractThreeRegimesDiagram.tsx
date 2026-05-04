"use client";

import { forwardRef } from "react";
import { organicBlobPath, flowPaths } from "@/lib/diagram-primitives/organic";
import { colors } from "@/lib/design-tokens";
import type { ThreeRegimesDiagramProps } from "./ThreeRegimesDiagram";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital@0;1&family=Inter:wght@400;500&family=DM+Mono:ital,wght@0,400;1,400&display=swap');`;

// Abstract layout — shapes are blobs, not rectangles
const LAYOUTS = {
  hero: {
    vw: 1200,
    vh: 630,
    frontier: { cx: 262, cy: 158, rx: 88, ry: 118, seed: 11 },
    fortress: { cx: 938, cy: 168, rx: 80, ry: 110, seed: 12 },
    field: { cx: 600, cy: 556, rx: 468, ry: 152, seed: 13 },
    // Connection landing points on field blob (top region)
    frontierConn: { x: 362, y: 424 },
    fortressConn: { x: 838, y: 426 },
    frontierLabelY: 152,
    fortressLabelY: 162,
    fieldLabelY: 550,
    fieldSublabelY: 572,
    relY: 540,
    capY: 592,
    relFontSize: 14,
    labelSize: 20,
    fieldLabelSize: 26,
    sublabelSize: 11,
  },
  square: {
    vw: 1200,
    vh: 1200,
    frontier: { cx: 262, cy: 265, rx: 88, ry: 118, seed: 11 },
    fortress: { cx: 938, cy: 278, rx: 80, ry: 110, seed: 12 },
    field: { cx: 600, cy: 910, rx: 468, ry: 210, seed: 13 },
    frontierConn: { x: 362, y: 720 },
    fortressConn: { x: 838, y: 724 },
    frontierLabelY: 260,
    fortressLabelY: 272,
    fieldLabelY: 904,
    fieldSublabelY: 930,
    relY: 1068,
    capY: 1120,
    relFontSize: 16,
    labelSize: 22,
    fieldLabelSize: 30,
    sublabelSize: 13,
  },
  mark: {
    vw: 400,
    vh: 200,
    frontier: { cx: 88, cy: 55, rx: 30, ry: 40, seed: 11 },
    fortress: { cx: 312, cy: 58, rx: 27, ry: 36, seed: 12 },
    field: { cx: 200, cy: 160, rx: 156, ry: 52, seed: 13 },
    frontierConn: { x: 128, y: 128 },
    fortressConn: { x: 272, y: 130 },
    frontierLabelY: 0,
    fortressLabelY: 0,
    fieldLabelY: 0,
    fieldSublabelY: 0,
    relY: null,
    capY: null,
    relFontSize: 0,
    labelSize: 0,
    fieldLabelSize: 0,
    sublabelSize: 0,
  },
} as const;

export const AbstractThreeRegimesDiagram = forwardRef<
  SVGSVGElement,
  ThreeRegimesDiagramProps
>(function AbstractThreeRegimesDiagram(
  { labels, relationshipStatement, caption, showAnnotations, format },
  ref,
) {
  const L = LAYOUTS[format];
  const showText = format !== "mark";
  const irr = 0.28; // blob irregularity — natural, not rough

  // Bottom of frontier/fortress blobs (approximate — blob irregular, so use cy+ry as nominal)
  const frontierBottom = L.frontier.cy + L.frontier.ry - 8;
  const fortressBottom = L.fortress.cy + L.fortress.ry - 8;

  const [fLeft1, fLeft2] = flowPaths(
    L.frontier.cx,
    frontierBottom,
    L.frontierConn.x,
    L.frontierConn.y,
    7,
  );
  const [fRight1, fRight2] = flowPaths(
    L.fortress.cx,
    fortressBottom,
    L.fortressConn.x,
    L.fortressConn.y,
    7,
  );

  const frontierPath = organicBlobPath(
    L.frontier.cx, L.frontier.cy, L.frontier.rx, L.frontier.ry, irr, L.frontier.seed,
  );
  const fortressPath = organicBlobPath(
    L.fortress.cx, L.fortress.cy, L.fortress.rx, L.fortress.ry, irr, L.fortress.seed,
  );
  const fieldPath = organicBlobPath(
    L.field.cx, L.field.cy, L.field.rx, L.field.ry, irr * 0.7, L.field.seed,
  );

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${L.vw} ${L.vh}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{FONT_IMPORT}</style>
        <filter id="field-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation={format === "mark" ? 6 : 22} />
        </filter>
        <filter id="node-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={format === "mark" ? 3 : 10} />
        </filter>
      </defs>

      {/* Background */}
      <rect width={L.vw} height={L.vh} fill={colors.paper.hex} />

      {/* Field — atmospheric ground. Blurred glow then sharp shape. */}
      <path
        d={fieldPath}
        fill={colors.cool.hex}
        opacity={0.14}
        filter="url(#field-glow)"
      />
      <path
        d={fieldPath}
        fill={colors.cool.hex}
        fillOpacity={0.07}
        stroke={colors.cool.hex}
        strokeWidth={format === "mark" ? 0.8 : 1.2}
        strokeOpacity={0.35}
      />

      {/* Flow connections — drawn under the option nodes */}
      {/* Frontier → Field */}
      <path
        d={fLeft1}
        fill="none"
        stroke={colors.ember.hex}
        strokeWidth={format === "mark" ? 0.7 : 1.4}
        strokeOpacity={0.65}
      />
      <path
        d={fLeft2}
        fill="none"
        stroke={colors.ember.hex}
        strokeWidth={format === "mark" ? 0.5 : 0.9}
        strokeOpacity={0.3}
      />
      {/* Fortress → Field */}
      <path
        d={fRight1}
        fill="none"
        stroke={colors.ember.hex}
        strokeWidth={format === "mark" ? 0.7 : 1.4}
        strokeOpacity={0.65}
      />
      <path
        d={fRight2}
        fill="none"
        stroke={colors.ember.hex}
        strokeWidth={format === "mark" ? 0.5 : 0.9}
        strokeOpacity={0.3}
      />

      {/* Frontier blob — ember-tinted */}
      <path
        d={frontierPath}
        fill={colors.ember.hex}
        fillOpacity={0.06}
        filter="url(#node-glow)"
      />
      <path
        d={frontierPath}
        fill={colors.ember.hex}
        fillOpacity={0.08}
        stroke={colors.ember.hex}
        strokeWidth={format === "mark" ? 0.8 : 1.3}
        strokeOpacity={0.55}
      />

      {/* Fortress blob — ember-tinted */}
      <path
        d={fortressPath}
        fill={colors.ember.hex}
        fillOpacity={0.06}
        filter="url(#node-glow)"
      />
      <path
        d={fortressPath}
        fill={colors.ember.hex}
        fillOpacity={0.08}
        stroke={colors.ember.hex}
        strokeWidth={format === "mark" ? 0.8 : 1.3}
        strokeOpacity={0.55}
      />

      {/* Labels — Crimson Pro italic, floating inside blobs */}
      {showText && (
        <>
          <text
            x={L.frontier.cx}
            y={L.frontierLabelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.ink.hex}
            fontSize={L.labelSize}
            fontFamily="'Crimson Pro', Georgia, serif"
            fontStyle="italic"
          >
            {labels.frontier}
          </text>
          <text
            x={L.fortress.cx}
            y={L.fortressLabelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.ink.hex}
            fontSize={L.labelSize}
            fontFamily="'Crimson Pro', Georgia, serif"
            fontStyle="italic"
          >
            {labels.fortress}
          </text>
          <text
            x={L.field.cx}
            y={L.fieldLabelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.cool.hex}
            fontSize={L.fieldLabelSize}
            fontFamily="'Crimson Pro', Georgia, serif"
            fontStyle="italic"
          >
            {labels.field}
          </text>
          {labels.fieldSublabel && (
            <text
              x={L.field.cx}
              y={L.fieldSublabelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={colors.cool.hex}
              fillOpacity={0.7}
              fontSize={L.sublabelSize}
              fontFamily="'DM Mono', 'Courier New', monospace"
            >
              {labels.fieldSublabel}
            </text>
          )}
        </>
      )}

      {/* Relationship statement */}
      {showText && L.relY !== null && relationshipStatement && (
        <text
          x={L.vw / 2}
          y={L.relY}
          textAnchor="middle"
          fill={colors.inkMuted.hex}
          fontSize={L.relFontSize}
          fontFamily="'DM Mono', 'Courier New', monospace"
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
          fontFamily="'DM Mono', 'Courier New', monospace"
        >
          {caption}
        </text>
      )}

      {/* Annotation — abstract mode omits the structural annotation */}
      {showText && showAnnotations && (
        <text
          x={format === "square" ? 100 : 80}
          y={L.field.cy + L.field.ry + 22}
          fill={colors.inkMuted.hex}
          fontSize={10}
          fontFamily="'DM Mono', 'Courier New', monospace"
          fontStyle="italic"
        >
          [inference] Field as atmospheric precondition
        </text>
      )}
    </svg>
  );
});
