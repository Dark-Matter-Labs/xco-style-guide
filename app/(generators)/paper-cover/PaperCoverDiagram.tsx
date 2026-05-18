"use client";

import { forwardRef } from "react";
import { spatialWeight } from "@/app/(generators)/option-field/OptionFieldDiagram";
import { squarify } from "@/lib/squarify";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;1,400&display=swap');`;

const PAPER = "#FFFFFF";
const INK   = "#1C1B17";
const MUTED = "#5F5C53";
const OCEAN = "#005096";
const DUSK  = "#ff5a00";

// A4 at 96dpi — 794×1123
export const COVER_W = 794;
export const COVER_H = 1123;

export type CoverVisual = "none" | "abstract" | "mark" | "option-field" | "territory";

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
      <stop offset="0%"   stopColor="#000064" />
      <stop offset="35%"  stopColor="#005096" />
      <stop offset="55%"  stopColor="#0082aa" />
      <stop offset="75%"  stopColor="#ffa064" />
      <stop offset="100%" stopColor="#ff5a00" />
    </linearGradient>
  );
}

// ── Option Field embed ─────────────────────────────────────────────────────
function OptionFieldCoverEmbed({
  x0, y0, w, h,
}: {
  x0: number; y0: number; w: number; h: number;
}) {
  const spacing = 7;
  const segW    = 5;
  const maxW    = spacing * 1.5;
  const segs: { x: number; y: number; sh: number }[] = [];

  for (let y = spacing / 2; y < h; y += spacing) {
    const yRel = y / h;
    for (let x = 0; x < w; x += segW) {
      const xRel = x / w;
      const sh = spatialWeight(xRel, yRel, 0.72, 0.60, 0.52, 0.34, maxW);
      segs.push({ x: x0 + x, y: y0 + y, sh });
    }
  }

  return (
    <>
      {segs.map((s, i) => (
        <rect key={i} x={s.x} y={s.y - s.sh / 2} width={segW} height={s.sh} fill={INK} />
      ))}
    </>
  );
}

// ── Territory embed ─────────────────────────────────────────────────────────
const COVER_TERRITORY_ITEMS = [
  { label: "Field",       weight: 100 },
  { label: "Frontier",    weight: 65  },
  { label: "Fortress",    weight: 50  },
  { label: "Optionality", weight: 38  },
  { label: "Transition",  weight: 25  },
  { label: "Emergence",   weight: 15  },
];

const COVER_TERRITORY_PALETTE: [string, string][] = [
  ["#ffa064", "#1C1B17"],
  ["#ff5a00", "#1C1B17"],
  ["#0082aa", "#FFFFFF"],
  ["#005096", "#FFFFFF"],
  ["#000064", "#FFFFFF"],
];

function TerritoryEmbed({ x0, y0, w, h }: { x0: number; y0: number; w: number; h: number }) {
  const rects = squarify(COVER_TERRITORY_ITEMS, w, h);
  const gutter = 3;
  const half = gutter / 2;
  return (
    <>
      <rect x={x0} y={y0} width={w} height={h} fill={INK} />
      {rects.map((r, i) => {
        const cx = r.x + half;
        const cy = r.y + half;
        const cw = r.w - gutter;
        const ch = r.h - gutter;
        if (cw < 4 || ch < 4) return null;
        const t = rects.length <= 1 ? 0 : i / (rects.length - 1);
        const idx = Math.min(COVER_TERRITORY_PALETTE.length - 1, Math.floor(t * COVER_TERRITORY_PALETTE.length));
        const [bg, fg] = COVER_TERRITORY_PALETTE[idx];
        const showLabel = cw >= 40 && ch >= 22;
        const fs = Math.min(Math.min(cw, ch) * 0.14, 22);
        return (
          <g key={i}>
            <rect x={x0 + cx} y={y0 + cy} width={cw} height={ch} fill={bg} />
            {showLabel && (
              <text
                x={x0 + cx + cw / 2} y={y0 + cy + ch / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontFamily="'DM Mono', 'Suisse Mono', monospace" fontSize={fs} fill={fg}
              >
                {r.label}
              </text>
            )}
          </g>
        );
      })}
    </>
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
    const hasVisual    = visual !== "none";
    const visualTop    = 140;
    const visualBottom = hasVisual ? 480 : 180;
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
          {visual === "abstract" && (
            <CoverAbstractGradient top={visualTop} bottom={visualBottom} />
          )}
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

        {/* Option Field visual */}
        {visual === "option-field" && (
          <OptionFieldCoverEmbed
            x0={0} y0={visualTop}
            w={COVER_W} h={visualBottom - visualTop}
          />
        )}

        {/* Territory treemap visual */}
        {visual === "territory" && (
          <TerritoryEmbed
            x0={0} y0={visualTop}
            w={COVER_W} h={visualBottom - visualTop}
          />
        )}

        {/* Header — xCO wordmark */}
        <text x={PAD} y={88}
          fontFamily="'Suisse Works', 'Times New Roman', Georgia, serif" fontStyle="italic"
          fontSize={16} fill={INK} fillOpacity={0.8}>
          xCO
        </text>
        <text x={PAD + 38} y={88}
          fontFamily="'DM Mono', 'Suisse Mono', monospace" fontSize={9} fill={MUTED} fillOpacity={0.7}>
          Expanding Civilizational Optionality
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
            fontFamily="'DM Mono', 'Suisse Mono', monospace" fontSize={11}
            fill={MUTED} letterSpacing="2">
            No. {paperNumber}
          </text>
        )}

        {/* Title */}
        {titleLines.map((line, i) => (
          <text key={i} x={PAD} y={titleStartY + i * titleLineH}
            fontFamily="'Suisse Works', 'Times New Roman', Georgia, serif"
            fontSize={44} fill={INK}>
            {line}
          </text>
        ))}

        {/* Subtitle */}
        {subtitleLines.map((line, i) => (
          <text key={i} x={PAD} y={subtitleStartY + i * subtitleLineH}
            fontFamily="'Suisse Works', 'Times New Roman', Georgia, serif" fontStyle="italic"
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
            fontFamily="'DM Mono', 'Suisse Mono', monospace" fontSize={10} fill={MUTED} letterSpacing="1">
            {authors}
          </text>
        )}

        {/* Date */}
        {date && (
          <text x={PAD} y={COVER_H - 80}
            fontFamily="'DM Mono', 'Suisse Mono', monospace" fontSize={10} fill={MUTED} fillOpacity={0.7}>
            {date}
          </text>
        )}

        {/* Footer — org */}
        <text x={PAD} y={COVER_H - 44}
          fontFamily="'DM Mono', 'Suisse Mono', monospace" fontSize={9} fill={MUTED} fillOpacity={0.5}
          letterSpacing="1">
          Dark Matter Labs
        </text>
      </svg>
    );
  },
);
