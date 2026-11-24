// The Three Regimes drawings other artworks embed: the mark, a small option
// field, a small territory treemap, and the five-stop sweep behind the abstract
// layouts. SVG only, no hooks, so any diagram (and the time print check) can
// render them.

import { squarify } from "@/lib/squarify";
import { paletteHex, typography } from "@/lib/design-tokens";
import { embedWeight } from "./weight";

const { paper: PAPER, ink: INK, navy: NAVY, ocean: OCEAN, teal: TEAL, sand: SAND, dusk: DUSK } = paletteHex;

// ── The mark ─────────────────────────────────────────────────────────
/** The mark's geometry in its 400 × 200 box: two regimes above, Field below, joined at the merge. */
export const MARK = {
  frontier: { cx: 100, cy: 62, w: 120, h: 45 },
  fortress: { cx: 300, cy: 62, w: 120, h: 45 },
  field: { cx: 200, cy: 157, w: 300, h: 46 },
  merge: { x: 200, y: 116 },
} as const;

/** The mark at `scale`, its 400 × 200 box's top-left at (x, y). `weight` is the box stroke, in output px. */
export function ThreeRegimesMark({ x, y, scale: S, weight = 1 }: { x: number; y: number; scale: number; weight?: number }) {
  const { frontier: fr, fortress: fo, field: fi, merge } = MARK;
  const line = (1.2 * weight) / S;
  const box = (b: { cx: number; cy: number; w: number; h: number }, stroke: string, dash?: string) => (
    <rect x={b.cx - b.w / 2} y={b.cy - b.h / 2} width={b.w} height={b.h}
      fill={PAPER} stroke={stroke} strokeWidth={weight / S} strokeDasharray={dash} />
  );
  return (
    <g transform={`translate(${x},${y}) scale(${S})`}>
      <line x1={fr.cx} y1={fr.cy + fr.h / 2} x2={merge.x} y2={merge.y} stroke={DUSK} strokeWidth={line} strokeLinecap="round" />
      <line x1={fo.cx} y1={fo.cy + fo.h / 2} x2={merge.x} y2={merge.y} stroke={DUSK} strokeWidth={line} strokeLinecap="round" />
      <line x1={merge.x} y1={merge.y} x2={fi.cx} y2={fi.cy - fi.h / 2} stroke={DUSK} strokeWidth={line} strokeLinecap="round" />
      <circle cx={merge.x} cy={merge.y} r={(2.5 * weight) / S} fill={DUSK} />
      {box(fr, INK)}
      {box(fo, INK)}
      {box(fi, OCEAN, `${(5 * weight) / S} ${(3.5 * weight) / S}`)}
    </g>
  );
}

// ── The sweep ────────────────────────────────────────────────────────
/** Navy at the top to dusk at the bottom: the abstract layouts' ground. */
export const SWEEP_STOPS = [
  [0, NAVY],
  [35, OCEAN],
  [55, TEAL],
  [75, SAND],
  [100, DUSK],
] as const;

/** A vertical sweep from `top` to `bottom`, centred at x; goes inside <defs>. */
export function SweepGradient({ id, x, top, bottom }: { id: string; x: number; top: number; bottom: number }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x} y1={top} x2={x} y2={bottom}>
      {SWEEP_STOPS.map(([offset, colour]) => <stop key={offset} offset={`${offset}%`} stopColor={colour} />)}
    </linearGradient>
  );
}

// ── Option Field ─────────────────────────────────────────────────────
/** The small option field's bars in a w × h rect, at the field's default strengths. `scale` widens the pitch. */
export function optionFieldBars(w: number, h: number, scale = 1): { x: number; y: number; w: number; h: number }[] {
  const spacing = 7 * scale;
  const segW = 5 * scale;
  const maxW = spacing * 1.5;
  const bars: { x: number; y: number; w: number; h: number }[] = [];
  for (let y = spacing / 2; y < h; y += spacing) {
    for (let x = 0; x < w; x += segW) {
      const sh = embedWeight(x / w, y / h, maxW);
      bars.push({ x, y: y - sh / 2, w: segW, h: sh });
    }
  }
  return bars;
}

/** A small option field filling the rect at (x0, y0). */
export function OptionFieldEmbed({ x0, y0, w, h, fg = INK }: { x0: number; y0: number; w: number; h: number; fg?: string }) {
  return (
    <>
      {optionFieldBars(w, h).map((b, i) => <rect key={i} x={x0 + b.x} y={y0 + b.y} width={b.w} height={b.h} fill={fg} />)}
    </>
  );
}

// ── Territory ────────────────────────────────────────────────────────
/** Warm to cold by rank, [ground, text]: the territory's spectrum mode and every territory embed. */
export const TERRITORY_SPECTRUM: readonly (readonly [string, string])[] = [
  [SAND, INK],
  [DUSK, INK],
  [TEAL, PAPER],
  [OCEAN, PAPER],
  [NAVY, PAPER],
];

/** The spectrum stop for the cell at `rank` of `total`. */
export function spectrumCell(rank: number, total: number): readonly [string, string] {
  const t = total <= 1 ? 0 : rank / (total - 1);
  return TERRITORY_SPECTRUM[Math.min(TERRITORY_SPECTRUM.length - 1, Math.floor(t * TERRITORY_SPECTRUM.length))];
}

export const TERRITORY_ITEMS = [
  { label: "Field", weight: 100 },
  { label: "Frontier", weight: 65 },
  { label: "Fortress", weight: 50 },
  { label: "Optionality", weight: 38 },
  { label: "Transition", weight: 25 },
  { label: "Emergence", weight: 15 },
];

export interface TerritoryCell { x: number; y: number; w: number; h: number; bg: string; fg: string; label: string; size: number | null }

/** The small territory's cells in a w × h rect on ink. `size` is the label's px, or null where it would not fit `labelMax`. */
export function territoryCells(w: number, h: number, gutter: number, labelMax: number): TerritoryCell[] {
  const rects = squarify(TERRITORY_ITEMS, w, h);
  const half = gutter / 2;
  return rects.flatMap((r, i) => {
    const cw = r.w - gutter, ch = r.h - gutter;
    if (cw < 4 || ch < 4) return [];
    const [bg, fg] = spectrumCell(i, rects.length);
    const size = cw >= labelMax * 1.8 && ch >= labelMax ? Math.min(Math.min(cw, ch) * 0.14, labelMax) : null;
    return [{ x: r.x + half, y: r.y + half, w: cw, h: ch, bg, fg, label: r.label, size }];
  });
}

/** A small territory treemap on ink, filling the rect at (x0, y0). Labels show where a cell can hold `labelMax`-px type. */
export function TerritoryEmbed({ x0, y0, w, h, gutter, labelMax }: { x0: number; y0: number; w: number; h: number; gutter: number; labelMax: number }) {
  return (
    <>
      <rect x={x0} y={y0} width={w} height={h} fill={INK} />
      {territoryCells(w, h, gutter, labelMax).map((c, i) => (
        <g key={i}>
          <rect x={x0 + c.x} y={y0 + c.y} width={c.w} height={c.h} fill={c.bg} />
          {c.size !== null && (
            <text x={x0 + c.x + c.w / 2} y={y0 + c.y + c.h / 2} textAnchor="middle" dominantBaseline="middle"
              fontFamily={typography.faces.body.stack} fontSize={c.size} fill={c.fg}>
              {c.label}
            </text>
          )}
        </g>
      ))}
    </>
  );
}
