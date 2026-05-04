"use client";

import { forwardRef } from "react";
import { spatialWeight } from "@/app/(generators)/option-field/OptionFieldDiagram";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital@0;1&family=DM+Mono:ital,wght@0,400;1,400&display=swap');`;

const PAPER = "#FFFFFF";
const INK   = "#1C1B17";
const MUTED = "#5F5C53";
const OCEAN = "#085A8C";
const DUSK  = "#F27F3D";

export type CardFormat  = "card" | "square";
export type CardLayout  = "typographic" | "diagram" | "abstract";
export type DiagramType = "three-regimes" | "option-field";

export interface SocialCardProps {
  headline:    string;
  tag:         string;
  byline:      string;
  layout:      CardLayout;
  format:      CardFormat;
  diagramType: DiagramType;
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

// ── Three Regimes mark ─────────────────────────────────────────────────
function ThreeRegimesMark({ tx, ty, scale }: { tx: number; ty: number; scale: number }) {
  const S = scale;
  const fr = { cx: 100, cy: 62, w: 120, h: 45 };
  const fo = { cx: 300, cy: 62, w: 120, h: 45 };
  const fi = { cx: 200, cy: 157, w: 300, h: 46 };
  const merge = { x: 200, y: 116 };
  return (
    <g transform={`translate(${tx},${ty}) scale(${S})`}>
      <line x1={fr.cx} y1={fr.cy + fr.h / 2} x2={merge.x} y2={merge.y}
        stroke={DUSK} strokeWidth={1.4 / S} strokeLinecap="round" />
      <line x1={fo.cx} y1={fo.cy + fo.h / 2} x2={merge.x} y2={merge.y}
        stroke={DUSK} strokeWidth={1.4 / S} strokeLinecap="round" />
      <line x1={merge.x} y1={merge.y} x2={fi.cx} y2={fi.cy - fi.h / 2}
        stroke={DUSK} strokeWidth={1.4 / S} strokeLinecap="round" />
      <circle cx={merge.x} cy={merge.y} r={3 / S} fill={DUSK} />
      <rect x={fr.cx - fr.w / 2} y={fr.cy - fr.h / 2} width={fr.w} height={fr.h}
        fill={PAPER} stroke={INK} strokeWidth={1.2 / S} />
      <rect x={fo.cx - fo.w / 2} y={fo.cy - fo.h / 2} width={fo.w} height={fo.h}
        fill={PAPER} stroke={INK} strokeWidth={1.2 / S} />
      <rect x={fi.cx - fi.w / 2} y={fi.cy - fi.h / 2} width={fi.w} height={fi.h}
        fill={PAPER} stroke={OCEAN} strokeWidth={1.2 / S}
        strokeDasharray={`${6 / S} ${4 / S}`} />
    </g>
  );
}

// ── Option Field embed — renders a mini field into an arbitrary SVG rect ──
// Fixed field params; spacing/segW tuned for embedded size.
function OptionFieldEmbed({
  x0, y0, w, h, fg = INK,
}: {
  x0: number; y0: number; w: number; h: number; fg?: string;
}) {
  const spacing = 7;
  const segW = 5;
  const pad = 0;
  const maxW = spacing * 1.5;
  const usableW = w - pad * 2;
  const segs: { x: number; y: number; sh: number }[] = [];

  for (let y = spacing / 2; y < h; y += spacing) {
    const yRel = y / h;
    for (let x = pad; x < w - pad; x += segW) {
      const xRel = (x - pad) / usableW;
      const sh = spatialWeight(xRel, yRel, 0.72, 0.60, 0.52, 0.34, maxW);
      segs.push({ x: x0 + x, y: y0 + y, sh });
    }
  }

  return (
    <>
      {segs.map((s, i) => (
        <rect key={i} x={s.x} y={s.y - s.sh / 2} width={segW} height={s.sh} fill={fg} />
      ))}
    </>
  );
}

// ── Abstract gradient ──────────────────────────────────────────────────
function AbstractGradient({ vw, vh }: { vw: number; vh: number }) {
  return (
    <linearGradient id="sc-abstract" gradientUnits="userSpaceOnUse"
      x1={vw / 2} y1={0} x2={vw / 2} y2={vh}>
      <stop offset="0%"   stopColor="#0F1C24" />
      <stop offset="22%"  stopColor="#1A3241" />
      <stop offset="48%"  stopColor="#085A8C" />
      <stop offset="68%"  stopColor="#7A4132" />
      <stop offset="85%"  stopColor="#CC5038" />
      <stop offset="100%" stopColor="#F27F3D" />
    </linearGradient>
  );
}

// ── Inlined inner content ──────────────────────────────────────────────
function CardInner({ headline, tag, byline, layout, diagramType }: SocialCardProps) {
  const vw = 1200, vh = 630, PAD = 80;

  if (layout === "abstract") {
    const lines = wrap(headline, 24);
    return (
      <>
        <defs><AbstractGradient vw={vw} vh={vh} /></defs>
        <rect width={vw} height={vh} fill="url(#sc-abstract)" />
        {tag && <text x={PAD} y={PAD + 20} fontFamily="'DM Mono', monospace" fontSize={10} fill={PAPER} fillOpacity={0.75} letterSpacing="3">[{tag.toUpperCase()}]</text>}
        {lines.map((l, i) => <text key={i} x={PAD} y={220 + i * 72} fontFamily="'Crimson Pro', Georgia, serif" fontStyle="italic" fontSize={62} fill={PAPER}>{l}</text>)}
        {byline && <text x={PAD} y={vh - PAD + 8} fontFamily="'DM Mono', monospace" fontSize={10} fill={PAPER} fillOpacity={0.6} letterSpacing="1">{byline}</text>}
        <text x={vw - PAD} y={vh - PAD + 8} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={10} fill={PAPER} fillOpacity={0.45}>xCO</text>
      </>
    );
  }

  if (layout === "diagram") {
    const colW = 500;
    const lines = wrap(headline, 20);
    return (
      <>
        <rect width={vw} height={vh} fill={PAPER} />
        <line x1={600} y1={PAD} x2={600} y2={vh - PAD} stroke={INK} strokeOpacity={0.10} strokeWidth={1} />
        {tag && <text x={PAD} y={PAD + 20} fontFamily="'DM Mono', monospace" fontSize={10} fill={DUSK} letterSpacing="3">[{tag.toUpperCase()}]</text>}
        {lines.map((l, i) => <text key={i} x={PAD} y={220 + i * 60} fontFamily="'Crimson Pro', Georgia, serif" fontSize={48} fill={INK}>{l}</text>)}
        <line x1={PAD} y1={558} x2={colW} y2={558} stroke={INK} strokeOpacity={0.12} strokeWidth={1} />
        {byline && <text x={PAD} y={590} fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} letterSpacing="1">{byline}</text>}
        <text x={vw - PAD} y={590} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} fillOpacity={0.6}>xCO</text>
        {diagramType === "option-field"
          ? <OptionFieldEmbed x0={625} y0={60} w={495} h={510} />
          : <ThreeRegimesMark tx={635} ty={175} scale={1.15} />
        }
      </>
    );
  }

  // Typographic
  const lines = wrap(headline, 28);
  return (
    <>
      <rect width={vw} height={vh} fill={PAPER} />
      {tag && <text x={PAD} y={PAD + 20} fontFamily="'DM Mono', monospace" fontSize={10} fill={DUSK} letterSpacing="3">[{tag.toUpperCase()}]</text>}
      {lines.map((l, i) => <text key={i} x={PAD} y={200 + i * 70} fontFamily="'Crimson Pro', Georgia, serif" fontSize={58} fill={INK}>{l}</text>)}
      <line x1={PAD} y1={558} x2={vw - PAD} y2={558} stroke={INK} strokeOpacity={0.12} strokeWidth={1} />
      {byline && <text x={PAD} y={592} fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} letterSpacing="1">{byline}</text>}
      <text x={vw - PAD} y={592} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} fillOpacity={0.6}>xCO</text>
    </>
  );
}

function SquareInner({ headline, tag, byline, layout, diagramType }: SocialCardProps) {
  const vw = 1080, vh = 1080, PAD = 90;

  if (layout === "abstract") {
    const lines = wrap(headline, 20);
    return (
      <>
        <defs><AbstractGradient vw={vw} vh={vh} /></defs>
        <rect width={vw} height={vh} fill="url(#sc-abstract)" />
        {tag && <text x={PAD} y={PAD + 22} fontFamily="'DM Mono', monospace" fontSize={10} fill={PAPER} fillOpacity={0.75} letterSpacing="3">[{tag.toUpperCase()}]</text>}
        {lines.map((l, i) => <text key={i} x={PAD} y={440 + i * 82} fontFamily="'Crimson Pro', Georgia, serif" fontStyle="italic" fontSize={72} fill={PAPER}>{l}</text>)}
        {byline && <text x={PAD} y={vh - PAD} fontFamily="'DM Mono', monospace" fontSize={10} fill={PAPER} fillOpacity={0.6} letterSpacing="1">{byline}</text>}
        <text x={vw - PAD} y={vh - PAD} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={10} fill={PAPER} fillOpacity={0.45}>xCO</text>
      </>
    );
  }

  if (layout === "diagram") {
    const lines = wrap(headline, 22);
    const markScale = 1.4;
    const markTx = (vw - 400 * markScale) / 2;
    const headlineY = 160 + 200 * markScale + 70;
    return (
      <>
        <rect width={vw} height={vh} fill={PAPER} />
        {tag && <text x={PAD} y={PAD + 22} fontFamily="'DM Mono', monospace" fontSize={10} fill={DUSK} letterSpacing="3">[{tag.toUpperCase()}]</text>}
        {diagramType === "option-field"
          ? <OptionFieldEmbed x0={PAD} y0={140} w={vw - PAD * 2} h={310} />
          : <ThreeRegimesMark tx={markTx} ty={160} scale={markScale} />
        }
        {lines.map((l, i) => <text key={i} x={vw / 2} y={headlineY + i * 65} textAnchor="middle" fontFamily="'Crimson Pro', Georgia, serif" fontSize={52} fill={INK}>{l}</text>)}
        <line x1={PAD} y1={vh - 130} x2={vw - PAD} y2={vh - 130} stroke={INK} strokeOpacity={0.12} strokeWidth={1} />
        {byline && <text x={PAD} y={vh - 96} fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} letterSpacing="1">{byline}</text>}
        <text x={vw - PAD} y={vh - 96} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} fillOpacity={0.6}>xCO</text>
      </>
    );
  }

  // Typographic
  const lines = wrap(headline, 22);
  return (
    <>
      <rect width={vw} height={vh} fill={PAPER} />
      {tag && <text x={PAD} y={PAD + 22} fontFamily="'DM Mono', monospace" fontSize={10} fill={DUSK} letterSpacing="3">[{tag.toUpperCase()}]</text>}
      {lines.map((l, i) => <text key={i} x={PAD} y={400 + i * 82} fontFamily="'Crimson Pro', Georgia, serif" fontSize={68} fill={INK}>{l}</text>)}
      <line x1={PAD} y1={vh - 130} x2={vw - PAD} y2={vh - 130} stroke={INK} strokeOpacity={0.12} strokeWidth={1} />
      {byline && <text x={PAD} y={vh - 96} fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} letterSpacing="1">{byline}</text>}
      <text x={vw - PAD} y={vh - 96} textAnchor="end" fontFamily="'DM Mono', monospace" fontSize={10} fill={MUTED} fillOpacity={0.6}>xCO</text>
    </>
  );
}

// ── Public component ───────────────────────────────────────────────────
export const SocialCardDiagram = forwardRef<SVGSVGElement, SocialCardProps>(
  function SocialCardDiagram(props, ref) {
    const vw = props.format === "square" ? 1080 : 1200;
    const vh = props.format === "square" ? 1080 : 630;
    return (
      <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}>
        <defs><style>{FONT_IMPORT}</style></defs>
        {props.format === "card"   && <CardInner   {...props} />}
        {props.format === "square" && <SquareInner {...props} />}
      </svg>
    );
  }
);
