"use client";

import { forwardRef, useMemo } from "react";
import { TimePrintMarks, TimePrintSlug } from "@/components/xco/TimePrint";
import { makeTimePrint, slugSize, type TimePrintProp } from "@/lib/asemic/time-print";
import { OptionFieldEmbed, SweepGradient, TerritoryEmbed, ThreeRegimesMark } from "@/lib/regimes/embeds";
import { paletteHex, typography } from "@/lib/design-tokens";
import { logoGeometry, inkBounds, cPath, oPath, xPaths } from "@/lib/logo";
import { wrap } from "@/lib/wrap";
import { EndorsementStrip } from "@/components/xco/EndorsementStrip";

const { paper: PAPER, ink: INK, inkMuted: MUTED } = paletteHex;
// Labels are Untitled Sans.
const LABEL = typography.faces.body.stack;
const SERIF = typography.faces.display.stack;

// Header wordmark. Drawn from lib/logo.ts, never set in a font: a logotype
// must not depend on a face being present. Paths need no font at all.
const HEADER_CAP = 11;                                   // px, matches the old 16px serif cap
const HEADER_SCALE = HEADER_CAP / logoGeometry.cap;
const HEADER_BASELINE = 88;
const HEADER_MARK_W = (inkBounds.right - inkBounds.left) * HEADER_SCALE;
const HEADER_GAP = 8;                                    // mark → descriptor

function HeaderMark({ x, fill }: { x: number; fill: string }) {
  const [xa, xb] = xPaths();
  const tx = x - inkBounds.left * HEADER_SCALE;
  const ty = HEADER_BASELINE - logoGeometry.baseline * HEADER_SCALE;
  return (
    <g
      transform={`translate(${tx} ${ty}) scale(${HEADER_SCALE})`}
      fill="none"
      stroke={fill}
      strokeWidth={logoGeometry.stroke}
      strokeLinecap="butt"
      aria-label="xCO"
      role="img"
    >
      <path d={xa} />
      <path d={xb} />
      <path d={cPath()} />
      <path d={oPath()} />
    </g>
  );
}

// A4 at 96dpi — 794×1123
export const COVER_W = 794;
const STRIP_STAMP = 24;
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
  /** The time print's minute and words, from the generator; null or absent when it is off. */
  timePrint?:  TimePrintProp | null;
}

export const PaperCoverDiagram = forwardRef<SVGSVGElement, PaperCoverProps>(
  function PaperCoverDiagram(
    { paperNumber, title, subtitle, authors, date, visual, className, timePrint },
    ref,
  ) {
    const PAD = 56;
    const print = useMemo(
      () => (timePrint ? makeTimePrint({ ...timePrint, width: COVER_W, height: COVER_H, ink: INK, ground: PAPER }) : null),
      [timePrint],
    );
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
          {visual === "abstract" && (
            <SweepGradient id="cv-abstract" x={COVER_W / 2} top={visualTop} bottom={visualBottom} />
          )}
        </defs>

        {/* Background */}
        <rect width={COVER_W} height={COVER_H} fill={PAPER} />
        {print && <TimePrintMarks print={print} />}

        {/* Abstract gradient visual */}
        {visual === "abstract" && (
          <rect x={0} y={visualTop} width={COVER_W} height={visualBottom - visualTop}
            fill="url(#cv-abstract)" />
        )}

        {/* Three Regimes mark visual */}
        {visual === "mark" && (
          <ThreeRegimesMark x={COVER_W / 2 - 200 * 0.85} y={(visualTop + visualBottom) / 2 - 100 * 0.85} scale={0.85} />
        )}

        {/* Option Field visual */}
        {visual === "option-field" && (
          <OptionFieldEmbed
            x0={0} y0={visualTop}
            w={COVER_W} h={visualBottom - visualTop}
          />
        )}

        {/* Territory treemap visual */}
        {visual === "territory" && (
          <TerritoryEmbed
            x0={0} y0={visualTop}
            w={COVER_W} h={visualBottom - visualTop}
            gutter={3} labelMax={22}
          />
        )}

        {/* Header — xCO wordmark, drawn. Full ink: the logo has three
            variants and an 80% tint is not one of them. */}
        <HeaderMark x={PAD} fill={INK} />
        <text x={PAD + HEADER_MARK_W + HEADER_GAP} y={HEADER_BASELINE}
          fontFamily={LABEL} fontSize={9} fill={MUTED} fillOpacity={0.7}>
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
            fontFamily={LABEL} fontSize={11}
            fill={MUTED} letterSpacing="2">
            No. {paperNumber}
          </text>
        )}

        {/* Title */}
        {titleLines.map((line, i) => (
          <text key={i} x={PAD} y={titleStartY + i * titleLineH}
            fontFamily={SERIF}
            fontSize={44} fill={INK}>
            {line}
          </text>
        ))}

        {/* Subtitle */}
        {subtitleLines.map((line, i) => (
          <text key={i} x={PAD} y={subtitleStartY + i * subtitleLineH}
            fontFamily={SERIF} fontStyle="italic"
            fontSize={22} fill={MUTED}>
            {line}
          </text>
        ))}

        {/* Footer rule */}
        <line x1={PAD} y1={COVER_H - 150} x2={COVER_W - PAD} y2={COVER_H - 150}
          stroke={INK} strokeOpacity={0.12} strokeWidth={1} />

        {/* Authors */}
        {authors && (
          <text x={PAD} y={COVER_H - 124}
            fontFamily={LABEL} fontSize={10} fill={MUTED} letterSpacing="1">
            {authors}
          </text>
        )}

        {/* Date */}
        {date && (
          <text x={PAD} y={COVER_H - 106}
            fontFamily={LABEL} fontSize={10} fill={MUTED} fillOpacity={0.7}>
            {date}
          </text>
        )}

        {/* Footer: the endorsement strip (CH-16). Stamp 24px = 6.4mm at A4, DM's
            print minimum; one stamp of clear space above it, PAD below. */}
        <EndorsementStrip x={PAD} y={COVER_H - PAD - STRIP_STAMP} stamp={STRIP_STAMP} />

        {print && <TimePrintSlug print={print} width={COVER_W} height={COVER_H} margin={PAD} bottom={PAD} size={slugSize(9, PAD)} />}
      </svg>
    );
  },
);
