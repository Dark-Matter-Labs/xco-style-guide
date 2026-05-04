"use client";

import { forwardRef } from "react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital@0;1&family=DM+Mono:ital,wght@0,400;1,400&display=swap');`;

const PAPER = "#FFFFFF";
const INK   = "#1C1B17";
const MUTED = "#5F5C53";
const OCEAN = "#085A8C";
const DUSK  = "#F27F3D";

// A4 at 96dpi — 794×1123
export const COVER_W = 794;
export const COVER_H = 1123;

export type CoverVisual = "none" | "abstract" | "mark";

export interface PaperCoverProps {
  paperNumber: string;
  title:       string;
  subtitle:    string;
  authors:     string;
  date:        string;
  visual:      CoverVisual;
  className?:  string;
}

function wrap(text: string, maxChars: number): string[] {
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

// Simplified Three Regimes mark — clean, no jitter
function CoverMark({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const S = scale;
  const fr = { cx: 100, cy: 62, w: 120, h: 45 };
  const fo = { cx: 300, cy: 62, w: 120, h: 45 };
  const fi = { cx: 200, cy: 157, w: 300, h: 46 };
  const merge = { x: 200, y: 116 };
  const tx = cx - 200 * S;
  const ty = cy - 100 * S;

  return (
    <g transform={`translate(${tx},${ty}) scale(${S})`}>
      <line x1={fr.cx} y1={fr.cy + fr.h/2} x2={merge.x} y2={merge.y}
        stroke={DUSK} strokeWidth={1.2/S} strokeLinecap="round" />
      <line x1={fo.cx} y1={fo.cy + fo.h/2} x2={merge.x} y2={merge.y}
        stroke={DUSK} strokeWidth={1.2/S} strokeLinecap="round" />
      <line x1={merge.x} y1={merge.y} x2={fi.cx} y2={fi.cy - fi.h/2}
        stroke={DUSK} strokeWidth={1.2/S} strokeLinecap="round" />
      <circle cx={merge.x} cy={merge.y} r={2.5/S} fill={DUSK} />
      <rect x={fr.cx - fr.w/2} y={fr.cy - fr.h/2} width={fr.w} height={fr.h}
        fill={PAPER} stroke={INK} strokeWidth={1/S} />
      <rect x={fo.cx - fo.w/2} y={fo.cy - fo.h/2} width={fo.w} height={fo.h}
        fill={PAPER} stroke={INK} strokeWidth={1/S} />
      <rect x={fi.cx - fi.w/2} y={fi.cy - fi.h/2} width={fi.w} height={fi.h}
        fill={PAPER} stroke={OCEAN} strokeWidth={1/S} strokeDasharray={`${5/S} ${3.5/S}`} />
    </g>
  );
}

// Linear gradient for cover visual zone — same sweep as other abstract assets
function CoverAbstractGradient({ top, bottom }: { top: number; bottom: number }) {
  return (
    <linearGradient id="cv-abstract" gradientUnits="userSpaceOnUse"
      x1={COVER_W / 2} y1={top} x2={COVER_W / 2} y2={bottom}>
      <stop offset="0%"   stopColor="#192640" />
      <stop offset="35%"  stopColor="#085A8C" />
      <stop offset="55%"  stopColor="#4B9EBF" />
      <stop offset="75%"  stopColor="#F2B077" />
      <stop offset="100%" stopColor="#F28444" />
    </linearGradient>
  );
}

export const PaperCoverDiagram = forwardRef<SVGSVGElement, PaperCoverProps>(
  function PaperCoverDiagram(
    { paperNumber, title, subtitle, authors, date, visual, className },
    ref,
  ) {
    const PAD = 56;
    const titleLines = wrap(title, 28);
    const subtitleLines = subtitle ? wrap(subtitle, 34) : [];

    // Vertical layout — content starts below visual zone
    const visualTop    = 140;
    const visualBottom = visual !== "none" ? 480 : 180;
    const ruleY        = visualBottom + 20;
    const numberY      = ruleY + 52;
    const titleStartY  = numberY + 58;
    const titleLineH   = 56;
    const titleEndY    = titleStartY + titleLines.length * titleLineH;
    const subtitleStartY = subtitle ? titleEndY + 24 : titleEndY;
    const subtitleLineH  = 34;

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${COVER_W} ${COVER_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <style>{FONT_IMPORT}</style>
          {visual === "abstract" && <CoverAbstractGradient top={visualTop} bottom={visualBottom} />}
        </defs>

        {/* Background */}
        <rect width={COVER_W} height={COVER_H} fill={PAPER} />

        {/* Abstract gradient visual */}
        {visual === "abstract" && (
          <rect x={0} y={visualTop} width={COVER_W} height={visualBottom - visualTop}
            fill="url(#cv-abstract)" />
        )}

        {/* Three Regimes mark visual */}
        {visual === "mark" && (
          <CoverMark cx={COVER_W / 2} cy={(visualTop + visualBottom) / 2} scale={0.85} />
        )}

        {/* Header — xCO wordmark */}
        <text x={PAD} y={88}
          fontFamily="'Crimson Pro', Georgia, serif" fontStyle="italic"
          fontSize={16} fill={INK} fillOpacity={0.8}>
          xCO
        </text>
        <text x={PAD + 38} y={88}
          fontFamily="'DM Mono', monospace" fontSize={9} fill={MUTED} fillOpacity={0.7}>
          Expanding Civilisational Optionality
        </text>

        {/* Header rule */}
        <line x1={PAD} y1={100} x2={COVER_W - PAD} y2={100}
          stroke={INK} strokeOpacity={0.12} strokeWidth={1} />

        {/* Section rule above content */}
        <line x1={PAD} y1={ruleY} x2={COVER_W - PAD} y2={ruleY}
          stroke={INK} strokeOpacity={0.18} strokeWidth={1} />

        {/* Paper number */}
        {paperNumber && (
          <text x={PAD} y={numberY}
            fontFamily="'DM Mono', monospace" fontSize={11}
            fill={MUTED} letterSpacing="2">
            No. {paperNumber}
          </text>
        )}

        {/* Title */}
        {titleLines.map((line, i) => (
          <text key={i} x={PAD} y={titleStartY + i * titleLineH}
            fontFamily="'Crimson Pro', Georgia, serif"
            fontSize={44} fill={INK}>
            {line}
          </text>
        ))}

        {/* Subtitle */}
        {subtitleLines.map((line, i) => (
          <text key={i} x={PAD} y={subtitleStartY + i * subtitleLineH}
            fontFamily="'Crimson Pro', Georgia, serif" fontStyle="italic"
            fontSize={22} fill={MUTED}>
            {line}
          </text>
        ))}

        {/* Footer rule */}
        <line x1={PAD} y1={COVER_H - 130} x2={COVER_W - PAD} y2={COVER_H - 130}
          stroke={INK} strokeOpacity={0.12} strokeWidth={1} />

        {/* Authors */}
        {authors && (
          <text x={PAD} y={COVER_H - 100}
            fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} letterSpacing="1">
            {authors}
          </text>
        )}

        {/* Date */}
        {date && (
          <text x={PAD} y={COVER_H - 80}
            fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} fillOpacity={0.7}>
            {date}
          </text>
        )}

        {/* Footer — org */}
        <text x={PAD} y={COVER_H - 44}
          fontFamily="'DM Mono', monospace" fontSize={9} fill={MUTED} fillOpacity={0.5}
          letterSpacing="1">
          Dark Matter Labs
        </text>
      </svg>
    );
  },
);
