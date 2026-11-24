"use client";

import { forwardRef, useMemo } from "react";
import { TimePrintMarks, TimePrintSlug } from "@/components/xco/TimePrint";
import { hungSlugSize, makeTimePrint, slugSize, type TimePrint, type TimePrintProp } from "@/lib/asemic/time-print";
import { OptionFieldEmbed, SweepGradient, TerritoryEmbed, ThreeRegimesMark } from "@/lib/regimes/embeds";
import { paletteHex, typography } from "@/lib/design-tokens";
import { wrap } from "@/lib/wrap";

const { paper: PAPER, ink: INK, dusk: DUSK, inkMuted: MUTED } = paletteHex;
// Labels are Untitled Sans. The PNG route still renders them in DM Mono until it can load Untitled Sans (F01).
const LABEL = typography.faces.body.stack;
const SERIF = typography.faces.display.stack;

export type CardFormat  = "card" | "square";
export type CardLayout  = "typographic" | "diagram" | "abstract";
export type DiagramType = "three-regimes" | "option-field" | "territory";

export interface SocialCardProps {
  headline:    string;
  tag:         string;
  byline:      string;
  layout:      CardLayout;
  format:      CardFormat;
  diagramType: DiagramType;
  /** The time print's minute and words, from the generator; null or absent when it is off. */
  timePrint?: TimePrintProp | null;
}

type InnerProps = SocialCardProps & { print: TimePrint | null };

// ── Inlined inner content ──────────────────────────────────────────────
function CardInner({ headline, tag, byline, layout, diagramType, print }: InnerProps) {
  const vw = 1200, vh = 630, PAD = 80;

  if (layout === "abstract") {
    const lines = wrap(headline, 24);
    return (
      <>
        <defs><SweepGradient id="sc-abstract" x={vw / 2} top={0} bottom={vh} /></defs>
        <rect width={vw} height={vh} fill="url(#sc-abstract)" />
        {print && <TimePrintMarks print={print} />}
        {tag && <text x={PAD} y={PAD + 20} fontFamily={LABEL} fontSize={10} fill={PAPER} fillOpacity={0.75} letterSpacing="3">[{tag.toUpperCase()}]</text>}
        {lines.map((l, i) => <text key={i} x={PAD} y={220 + i * 72} fontFamily={SERIF} fontStyle="italic" fontSize={62} fill={PAPER}>{l}</text>)}
        {byline && <text x={PAD} y={vh - PAD + 8} fontFamily={LABEL} fontSize={10} fill={PAPER} fillOpacity={0.6} letterSpacing="1">{byline}</text>}
        <text x={vw - PAD} y={vh - PAD + 8} textAnchor="end" fontFamily={LABEL} fontSize={10} fill={PAPER} fillOpacity={0.45}>xCO</text>
      </>
    );
  }

  if (layout === "diagram") {
    const colW = 500;
    const lines = wrap(headline, 20);
    return (
      <>
        <rect width={vw} height={vh} fill={PAPER} />
        {print && <TimePrintMarks print={print} />}
        <line x1={600} y1={PAD} x2={600} y2={vh - PAD} stroke={INK} strokeOpacity={0.10} strokeWidth={1} />
        {tag && <text x={PAD} y={PAD + 20} fontFamily={LABEL} fontSize={10} fill={DUSK} letterSpacing="3">[{tag.toUpperCase()}]</text>}
        {lines.map((l, i) => <text key={i} x={PAD} y={220 + i * 60} fontFamily={SERIF} fontSize={48} fill={INK}>{l}</text>)}
        <line x1={PAD} y1={558} x2={colW} y2={558} stroke={INK} strokeOpacity={0.12} strokeWidth={1} />
        {byline && <text x={PAD} y={590} fontFamily={LABEL} fontSize={10} fill={MUTED} letterSpacing="1">{byline}</text>}
        <text x={vw - PAD} y={590} textAnchor="end" fontFamily={LABEL} fontSize={10} fill={MUTED} fillOpacity={0.6}>xCO</text>
        {diagramType === "option-field" && <OptionFieldEmbed x0={625} y0={60} w={495} h={510} />}
        {diagramType === "territory"    && <TerritoryEmbed   x0={625} y0={60} w={495} h={510} gutter={4} labelMax={28} />}
        {diagramType === "three-regimes" && <ThreeRegimesMark x={635} y={175} scale={1.15} weight={1.2} />}
      </>
    );
  }

  // Typographic
  const lines = wrap(headline, 28);
  return (
    <>
      <rect width={vw} height={vh} fill={PAPER} />
      {print && <TimePrintMarks print={print} />}
      {tag && <text x={PAD} y={PAD + 20} fontFamily={LABEL} fontSize={10} fill={DUSK} letterSpacing="3">[{tag.toUpperCase()}]</text>}
      {lines.map((l, i) => <text key={i} x={PAD} y={200 + i * 70} fontFamily={SERIF} fontSize={58} fill={INK}>{l}</text>)}
      <line x1={PAD} y1={558} x2={vw - PAD} y2={558} stroke={INK} strokeOpacity={0.12} strokeWidth={1} />
      {byline && <text x={PAD} y={592} fontFamily={LABEL} fontSize={10} fill={MUTED} letterSpacing="1">{byline}</text>}
      <text x={vw - PAD} y={592} textAnchor="end" fontFamily={LABEL} fontSize={10} fill={MUTED} fillOpacity={0.6}>xCO</text>
    </>
  );
}

function SquareInner({ headline, tag, byline, layout, diagramType, print }: InnerProps) {
  const vw = 1080, vh = 1080, PAD = 90;

  if (layout === "abstract") {
    const lines = wrap(headline, 20);
    return (
      <>
        <defs><SweepGradient id="sc-abstract" x={vw / 2} top={0} bottom={vh} /></defs>
        <rect width={vw} height={vh} fill="url(#sc-abstract)" />
        {print && <TimePrintMarks print={print} />}
        {tag && <text x={PAD} y={PAD + 22} fontFamily={LABEL} fontSize={10} fill={PAPER} fillOpacity={0.75} letterSpacing="3">[{tag.toUpperCase()}]</text>}
        {lines.map((l, i) => <text key={i} x={PAD} y={440 + i * 82} fontFamily={SERIF} fontStyle="italic" fontSize={72} fill={PAPER}>{l}</text>)}
        {byline && <text x={PAD} y={vh - PAD} fontFamily={LABEL} fontSize={10} fill={PAPER} fillOpacity={0.6} letterSpacing="1">{byline}</text>}
        <text x={vw - PAD} y={vh - PAD} textAnchor="end" fontFamily={LABEL} fontSize={10} fill={PAPER} fillOpacity={0.45}>xCO</text>
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
        {print && <TimePrintMarks print={print} />}
        {tag && <text x={PAD} y={PAD + 22} fontFamily={LABEL} fontSize={10} fill={DUSK} letterSpacing="3">[{tag.toUpperCase()}]</text>}
        {diagramType === "option-field"  && <OptionFieldEmbed x0={PAD} y0={140} w={vw - PAD * 2} h={310} />}
        {diagramType === "territory"     && <TerritoryEmbed   x0={PAD} y0={140} w={vw - PAD * 2} h={310} gutter={4} labelMax={28} />}
        {diagramType === "three-regimes" && <ThreeRegimesMark x={markTx} y={160} scale={markScale} weight={1.2} />}
        {lines.map((l, i) => <text key={i} x={vw / 2} y={headlineY + i * 65} textAnchor="middle" fontFamily={SERIF} fontSize={52} fill={INK}>{l}</text>)}
        <line x1={PAD} y1={vh - 130} x2={vw - PAD} y2={vh - 130} stroke={INK} strokeOpacity={0.12} strokeWidth={1} />
        {byline && <text x={PAD} y={vh - 96} fontFamily={LABEL} fontSize={10} fill={MUTED} letterSpacing="1">{byline}</text>}
        <text x={vw - PAD} y={vh - 96} textAnchor="end" fontFamily={LABEL} fontSize={10} fill={MUTED} fillOpacity={0.6}>xCO</text>
      </>
    );
  }

  // Typographic
  const lines = wrap(headline, 22);
  return (
    <>
      <rect width={vw} height={vh} fill={PAPER} />
      {print && <TimePrintMarks print={print} />}
      {tag && <text x={PAD} y={PAD + 22} fontFamily={LABEL} fontSize={10} fill={DUSK} letterSpacing="3">[{tag.toUpperCase()}]</text>}
      {lines.map((l, i) => <text key={i} x={PAD} y={400 + i * 82} fontFamily={SERIF} fontSize={68} fill={INK}>{l}</text>)}
      <line x1={PAD} y1={vh - 130} x2={vw - PAD} y2={vh - 130} stroke={INK} strokeOpacity={0.12} strokeWidth={1} />
      {byline && <text x={PAD} y={vh - 96} fontFamily={LABEL} fontSize={10} fill={MUTED} letterSpacing="1">{byline}</text>}
      <text x={vw - PAD} y={vh - 96} textAnchor="end" fontFamily={LABEL} fontSize={10} fill={MUTED} fillOpacity={0.6}>xCO</text>
    </>
  );
}

// ── Public component ───────────────────────────────────────────────────
export const SocialCardDiagram = forwardRef<SVGSVGElement, SocialCardProps>(
  function SocialCardDiagram(props, ref) {
    const vw = props.format === "square" ? 1080 : 1200;
    const vh = props.format === "square" ? 1080 : 630;
    const pad = props.format === "square" ? 90 : 80;
    const tp = props.timePrint;
    // The abstract layout sets paper type on a gradient; the others ink on paper.
    const abstract = props.layout === "abstract";
    const print = useMemo(
      () => (tp ? makeTimePrint({ ...tp, width: vw, height: vh, ink: abstract ? PAPER : INK, ground: abstract ? null : PAPER }) : null),
      [tp, vw, vh, abstract],
    );
    return (
      <svg ref={ref} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}>
        {props.format === "card"   && <CardInner   {...props} print={print} />}
        {props.format === "square" && <SquareInner {...props} print={print} />}
        {/* On the navy-to-dusk gradient the slug hangs from the top and ends before the teal (55% down). */}
        {print && (abstract
          ? <TimePrintSlug print={print} width={vw} height={vh} margin={pad} bottom={pad} top={pad / 2} size={hungSlugSize(slugSize(10, pad), print.stamp, pad / 2, vh * 0.55)} />
          : <TimePrintSlug print={print} width={vw} height={vh} margin={pad} bottom={pad} size={slugSize(10, pad)} />)}
      </svg>
    );
  }
);
