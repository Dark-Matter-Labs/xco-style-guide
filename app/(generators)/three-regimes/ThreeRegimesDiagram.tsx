"use client";

import { forwardRef } from "react";
import { colors } from "@/lib/design-tokens";

export interface DiagramLabels {
  frontier: string;
  fortress: string;
  field: string;
  fieldSublabel: string;
}

export type DiagramFormat      = "hero" | "square" | "mark";
export type DiagramColorScheme = "standard" | "blueprint";
export type StructuralVariant  = "classic" | "nested" | "columns" | "orbital";

export interface ThreeRegimesDiagramProps {
  labels: DiagramLabels;
  relationshipStatement: string;
  caption: string;
  showAnnotations: boolean;
  format: DiagramFormat;
  amplitude: number;
  colorScheme?: DiagramColorScheme;
  structuralVariant?: StructuralVariant;
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

type LayoutData = (typeof LAYOUTS)[DiagramFormat];

const FONT_SANS = `"Untitled Sans", "Helvetica Neue", Arial, sans-serif`;

const INK   = colors.ink.hex;
const PAPER = colors.paper.hex;
const MUTED = colors.inkMuted.hex;

const NAVY  = "#000064";
const OCEAN = "#005096";
const TEAL  = "#0082aa";
const DUSK  = "#ff5a00";

// ── Shared primitives ───────────────────────────────────────────────────────

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

function ClearLabel({
  cx, cy, primary, sub, primarySize, subSize, primaryColor, subColor, clearW, clearH,
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
      <rect x={cx - clearW / 2} y={cy - clearH / 2} width={clearW} height={clearH} fill={PAPER} />
      <text x={cx} y={primaryY} textAnchor="middle" dominantBaseline="central"
        fontFamily={FONT_SANS} fontSize={primarySize} fill={primaryColor}>
        {primary}
      </text>
      {sub && (
        <text x={cx} y={subY} textAnchor="middle" dominantBaseline="central"
          fontFamily={FONT_SANS} fontSize={subSize}
          fill={subColor}>
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

// ── Variant props ──────────────────────────────────────────────────────────

interface VariantProps {
  L: LayoutData;
  labels: DiagramLabels;
  C: { frontier: string; fortress: string; field: string; connector: string };
  showText: boolean;
  hasSub: boolean;
  format: DiagramFormat;
}

// ── Variant: Nested ────────────────────────────────────────────────────────
// Field as outer dashed container; Frontier and Fortress nested within

function NestedContent({ L, labels, C, showText, hasSub }: VariantProps) {
  const { vw, vh } = L;
  const pad = L.relY !== null ? 50 : Math.round(vh * 0.05);
  const outerBottom = L.relY !== null ? L.relY - 30 : vh - pad;
  const outerH = outerBottom - pad;
  const outerW = vw - 2 * pad;

  const labelBandH = Math.max(Math.round(L.labelSize * 2.8), Math.round(outerH * 0.18));
  const iGap = Math.round(outerW * 0.04);
  const innerH = outerH - labelBandH - iGap;
  const innerW = Math.round((outerW - 3 * iGap) / 2);
  const frCX = pad + iGap + innerW / 2;
  const foCX = pad + outerW - iGap - innerW / 2;
  const innerCY = pad + labelBandH + innerH / 2;

  return (
    <>
      {/* Field outer: dashed container */}
      <rect x={pad} y={pad} width={outerW} height={outerH}
        fill={PAPER} stroke={C.field} strokeWidth={L.lineW} strokeDasharray="8 5" />

      {/* Separator between label band and inner content */}
      <line x1={pad} y1={pad + labelBandH} x2={pad + outerW} y2={pad + labelBandH}
        stroke={C.field} strokeWidth={0.75} strokeDasharray="4 4" />

      {/* Field label in label band */}
      {showText && (
        <ClearLabel
          cx={vw / 2} cy={pad + labelBandH / 2}
          primary={labels.field} sub={hasSub ? labels.fieldSublabel : undefined}
          primarySize={L.labelSize} subSize={L.subSize}
          primaryColor={C.field} subColor={C.field}
          clearW={Math.min(innerW * 1.8, vw * 0.4)} clearH={L.labelSize * 2.5}
        />
      )}

      {/* Frontier inner box */}
      <HatchBox cx={frCX} cy={innerCY} w={innerW} h={innerH}
        hatchId="hatch-fr" borderColor={C.frontier} borderWidth={L.lineW} />
      {showText && (
        <ClearLabel cx={frCX} cy={innerCY} primary={labels.frontier}
          primarySize={L.labelSize} subSize={L.subSize}
          primaryColor={C.frontier} subColor={C.frontier}
          clearW={innerW * 0.78} clearH={L.labelSize * 1.8} />
      )}

      {/* Fortress inner box */}
      <HatchBox cx={foCX} cy={innerCY} w={innerW} h={innerH}
        hatchId="hatch-fo" borderColor={C.fortress} borderWidth={L.lineW} />
      {showText && (
        <ClearLabel cx={foCX} cy={innerCY} primary={labels.fortress}
          primarySize={L.labelSize} subSize={L.subSize}
          primaryColor={C.fortress} subColor={C.fortress}
          clearW={innerW * 0.78} clearH={L.labelSize * 1.8} />
      )}
    </>
  );
}

// ── Variant: Columns ───────────────────────────────────────────────────────
// Three vertical strips: Frontier (sparse) | Field (widest, center) | Fortress (dense)

function ColumnsContent({ L, labels, C, showText, hasSub }: VariantProps) {
  const { vw, vh } = L;
  const padX = L.relY !== null ? 40 : Math.round(vw * 0.02);
  const padY = L.relY !== null ? 40 : Math.round(vh * 0.04);
  const colH = L.relY !== null ? L.relY - 50 - padY : vh - 2 * padY;
  const totalW = vw - 2 * padX;
  const gap = Math.round(totalW * 0.02);
  const sideW = Math.round(totalW * 0.245);
  const centerW = totalW - 2 * sideW - 2 * gap;

  const frX = padX;
  const fiX = padX + sideW + gap;
  const foX = padX + sideW + gap + centerW + gap;
  const topLabelY = padY + Math.round(colH * 0.11);

  return (
    <>
      {/* Frontier: left, sparse */}
      <HatchBox cx={frX + sideW / 2} cy={padY + colH / 2} w={sideW} h={colH}
        hatchId="hatch-fr" borderColor={C.frontier} borderWidth={L.lineW} />

      {/* Field: center, widest */}
      <HatchBox cx={fiX + centerW / 2} cy={padY + colH / 2} w={centerW} h={colH}
        hatchId="hatch-fi" borderColor={C.field} borderWidth={L.lineW} />

      {/* Fortress: right, dense */}
      <HatchBox cx={foX + sideW / 2} cy={padY + colH / 2} w={sideW} h={colH}
        hatchId="hatch-fo" borderColor={C.fortress} borderWidth={L.lineW} />

      {showText && (
        <>
          <ClearLabel cx={frX + sideW / 2} cy={topLabelY} primary={labels.frontier}
            primarySize={L.labelSize} subSize={L.subSize}
            primaryColor={C.frontier} subColor={C.frontier}
            clearW={sideW * 0.82} clearH={L.labelSize * 1.8} />
          <ClearLabel cx={fiX + centerW / 2} cy={topLabelY} primary={labels.field}
            sub={hasSub ? labels.fieldSublabel : undefined}
            primarySize={L.labelSize} subSize={L.subSize}
            primaryColor={C.field} subColor={C.field}
            clearW={centerW * 0.65} clearH={L.labelSize * 3} />
          <ClearLabel cx={foX + sideW / 2} cy={topLabelY} primary={labels.fortress}
            primarySize={L.labelSize} subSize={L.subSize}
            primaryColor={C.fortress} subColor={C.fortress}
            clearW={sideW * 0.82} clearH={L.labelSize * 1.8} />
        </>
      )}
    </>
  );
}

// ── Variant: Orbital ──────────────────────────────────────────────────────
// Frontier and Fortress as circles above; Field as ellipse below; lines converging

function OrbitalContent({ L, labels, C, showText, hasSub, format }: VariantProps) {
  const { vw, vh } = L;

  const diagramBottom = L.relY !== null ? L.relY - 30 : vh - Math.round(vh * 0.05);
  const diagramTop    = Math.round(vh * 0.04);
  const diagramH      = diagramBottom - diagramTop;

  // Circle radius scales with the smaller canvas dimension
  const r = Math.round(Math.min(vw * 0.092, diagramH * 0.21));

  // Frontier/Fortress circles: upper 35% of diagram area
  const topCY = diagramTop + Math.round(diagramH * 0.28);
  const frCX  = Math.round(vw * 0.24);
  const foCX  = Math.round(vw * 0.76);

  // Field ellipse: lower area
  const fiCX  = vw / 2;
  const fiCY  = diagramTop + Math.round(diagramH * 0.78);
  const fiRX  = Math.round(vw * 0.27);
  const fiRY  = Math.round(Math.min(diagramH * 0.11, r * 0.78));

  // Merge / junction point
  const mergeX = vw / 2;
  const mergeY = diagramTop + Math.round(diagramH * 0.535);

  // ClipPath IDs — unique per format to avoid ID collision with multiple instances
  const frClip = `clip-orbital-fr-${format}`;
  const foClip = `clip-orbital-fo-${format}`;
  const fiClip = `clip-orbital-fi-${format}`;

  return (
    <>
      <defs>
        <clipPath id={frClip}><circle cx={frCX} cy={topCY} r={r} /></clipPath>
        <clipPath id={foClip}><circle cx={foCX} cy={topCY} r={r} /></clipPath>
        <clipPath id={fiClip}><ellipse cx={fiCX} cy={fiCY} rx={fiRX} ry={fiRY} /></clipPath>
      </defs>

      {/* Connectors */}
      <line x1={frCX} y1={topCY + r} x2={mergeX} y2={mergeY}
        stroke={C.connector} strokeWidth={L.lineW} strokeLinecap="round" />
      <line x1={foCX} y1={topCY + r} x2={mergeX} y2={mergeY}
        stroke={C.connector} strokeWidth={L.lineW} strokeLinecap="round" />
      <line x1={mergeX} y1={mergeY} x2={fiCX} y2={fiCY - fiRY}
        stroke={C.connector} strokeWidth={L.lineW} strokeLinecap="round" />

      {/* Merge dot */}
      <circle cx={mergeX} cy={mergeY} r={L.dotR} fill={C.connector} />

      {/* Frontier circle */}
      <circle cx={frCX} cy={topCY} r={r} fill={PAPER} />
      <rect x={frCX - r} y={topCY - r} width={r * 2} height={r * 2}
        fill="url(#hatch-fr)" clipPath={`url(#${frClip})`} />
      <circle cx={frCX} cy={topCY} r={r} fill="none"
        stroke={C.frontier} strokeWidth={L.lineW} />

      {/* Fortress circle */}
      <circle cx={foCX} cy={topCY} r={r} fill={PAPER} />
      <rect x={foCX - r} y={topCY - r} width={r * 2} height={r * 2}
        fill="url(#hatch-fo)" clipPath={`url(#${foClip})`} />
      <circle cx={foCX} cy={topCY} r={r} fill="none"
        stroke={C.fortress} strokeWidth={L.lineW} />

      {/* Field ellipse */}
      <ellipse cx={fiCX} cy={fiCY} rx={fiRX} ry={fiRY} fill={PAPER} />
      <rect x={fiCX - fiRX} y={fiCY - fiRY} width={fiRX * 2} height={fiRY * 2}
        fill="url(#hatch-fi)" clipPath={`url(#${fiClip})`} />
      <ellipse cx={fiCX} cy={fiCY} rx={fiRX} ry={fiRY} fill="none"
        stroke={C.field} strokeWidth={L.lineW} strokeDasharray="6 4" />

      {showText && (
        <>
          <ClearLabel cx={frCX} cy={topCY} primary={labels.frontier}
            primarySize={L.labelSize} subSize={L.subSize}
            primaryColor={C.frontier} subColor={C.frontier}
            clearW={r * 1.55} clearH={L.labelSize * 1.8} />
          <ClearLabel cx={foCX} cy={topCY} primary={labels.fortress}
            primarySize={L.labelSize} subSize={L.subSize}
            primaryColor={C.fortress} subColor={C.fortress}
            clearW={r * 1.55} clearH={L.labelSize * 1.8} />
          <ClearLabel cx={fiCX} cy={fiCY} primary={labels.field}
            sub={hasSub ? labels.fieldSublabel : undefined}
            primarySize={L.labelSize} subSize={L.subSize}
            primaryColor={C.field} subColor={C.field}
            clearW={fiRX * 1.5} clearH={L.labelSize * 2.6} />
        </>
      )}
    </>
  );
}

// ── Main SVG component ─────────────────────────────────────────────────────

export const ThreeRegimesDiagram = forwardRef<SVGSVGElement, ThreeRegimesDiagramProps>(
  function ThreeRegimesDiagram(
    {
      labels, relationshipStatement, caption, showAnnotations,
      format, colorScheme = "standard", structuralVariant = "classic",
    },
    ref,
  ) {
    const L = LAYOUTS[format];
    const showText = format !== "mark";
    const hasSub = Boolean(labels.fieldSublabel);

    const bp = colorScheme === "blueprint";
    const C = {
      frontier:  bp ? TEAL  : INK,
      fortress:  bp ? NAVY  : INK,
      field:     OCEAN,
      connector: DUSK,
    };

    const annoLines = showAnnotations
      ? wrapText(
          "[inference] Field optionality as precondition — assumes capital can be directed toward systemic enablement, not only frontier push or fortress defence",
          L.annoChars,
        )
      : [];

    const variantProps: VariantProps = { L, labels, C, showText, hasSub, format };

    // Shared statement/caption (classic uses L-table positions; variants use L.relY/capY)
    const sharedTextRows = showText && L.relY !== null && (
      <>
        {relationshipStatement && (
          <text x={L.vw / 2} y={L.relY}
            textAnchor="middle"
            fontFamily={FONT_SANS} fontSize={L.relFontSize}
            fill={MUTED}>
            {relationshipStatement}
          </text>
        )}
        {caption && (
          <text x={L.vw / 2} y={L.capY!}
            textAnchor="middle"
            fontFamily={FONT_SANS} fontSize={14} fill={MUTED}>
            {caption}
          </text>
        )}
      </>
    );

    return (
      <svg ref={ref} viewBox={`0 0 ${L.vw} ${L.vh}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <HatchPatterns frColor={C.frontier} foColor={C.fortress} fiColor={C.field} />
        </defs>

        <rect width={L.vw} height={L.vh} fill={PAPER} />

        {/* ── Classic layout ── */}
        {structuralVariant === "classic" && (() => {
          const frontierBot = { x: L.frontier.cx, y: L.frontier.cy + L.frontier.h / 2 };
          const fortressBot = { x: L.fortress.cx, y: L.fortress.cy + L.fortress.h / 2 };
          const fieldTop    = { x: L.field.cx,    y: L.field.cy    - L.field.h    / 2 };
          const nodeClearW = L.frontier.w - 20;
          const nodeClearH = L.labelSize * 1.8;
          const fieldClearW = Math.min(L.field.w - 40, 400);
          const fieldClearH = hasSub ? L.labelSize * 1.6 + L.subSize * 1.6 : L.labelSize * 1.8;
          return (
            <>
              <line x1={frontierBot.x} y1={frontierBot.y} x2={L.merge.x} y2={L.merge.y}
                stroke={C.connector} strokeWidth={L.lineW} strokeLinecap="square" />
              <line x1={fortressBot.x} y1={fortressBot.y} x2={L.merge.x} y2={L.merge.y}
                stroke={C.connector} strokeWidth={L.lineW} strokeLinecap="square" />
              <line x1={L.merge.x} y1={L.merge.y} x2={fieldTop.x} y2={fieldTop.y}
                stroke={C.connector} strokeWidth={L.lineW} strokeLinecap="square" />
              <circle cx={L.merge.x} cy={L.merge.y} r={L.dotR} fill={C.connector} />
              <HatchBox cx={L.frontier.cx} cy={L.frontier.cy}
                w={L.frontier.w} h={L.frontier.h} hatchId="hatch-fr" borderColor={C.frontier} />
              <HatchBox cx={L.fortress.cx} cy={L.fortress.cy}
                w={L.fortress.w} h={L.fortress.h} hatchId="hatch-fo" borderColor={C.fortress} />
              <HatchBox cx={L.field.cx} cy={L.field.cy}
                w={L.field.w} h={L.field.h} hatchId="hatch-fi" borderColor={C.field} />
              {showText && (
                <>
                  <ClearLabel cx={L.frontier.cx} cy={L.frontier.cy} primary={labels.frontier}
                    primarySize={L.labelSize} subSize={L.subSize}
                    primaryColor={C.frontier} subColor={C.frontier}
                    clearW={nodeClearW} clearH={nodeClearH} />
                  <ClearLabel cx={L.fortress.cx} cy={L.fortress.cy} primary={labels.fortress}
                    primarySize={L.labelSize} subSize={L.subSize}
                    primaryColor={C.fortress} subColor={C.fortress}
                    clearW={nodeClearW} clearH={nodeClearH} />
                  <ClearLabel cx={L.field.cx} cy={L.field.cy}
                    primary={labels.field} sub={hasSub ? labels.fieldSublabel : undefined}
                    primarySize={L.labelSize} subSize={L.subSize}
                    primaryColor={C.field} subColor={C.field}
                    clearW={fieldClearW} clearH={fieldClearH} />
                </>
              )}
              {showText && L.relY !== null && relationshipStatement && (
                <text x={L.vw / 2} y={L.relY} textAnchor="middle"
                  fontFamily={FONT_SANS} fontSize={L.relFontSize}
                  fill={MUTED}>
                  {relationshipStatement}
                </text>
              )}
              {showText && L.capY !== null && caption && (
                <text x={L.vw / 2} y={L.capY} textAnchor="middle"
                  fontFamily={FONT_SANS} fontSize={14} fill={MUTED}>
                  {caption}
                </text>
              )}
              {showText && annoLines.length > 0 && (
                <g fontFamily={FONT_SANS} fontSize={11} fill={MUTED}>
                  {annoLines.map((line, i) => (
                    <text key={i}
                      x={format === "square" ? 100 : 80}
                      y={L.field.cy + L.field.h / 2 + 22 + i * 16}>
                      {line}
                    </text>
                  ))}
                </g>
              )}
            </>
          );
        })()}

        {structuralVariant === "nested"   && <NestedContent  {...variantProps} />}
        {structuralVariant === "columns"  && <ColumnsContent {...variantProps} />}
        {structuralVariant === "orbital"  && <OrbitalContent {...variantProps} />}

        {/* Shared text rows for non-classic variants */}
        {structuralVariant !== "classic" && sharedTextRows}
      </svg>
    );
  }
);
