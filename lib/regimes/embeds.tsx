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
/** A small option field filling the rect at (x0, y0), at the field's default strengths. */
export function OptionFieldEmbed({ x0, y0, w, h, fg = INK }: { x0: number; y0: number; w: number; h: number; fg?: string }) {
  const spacing = 7;
  const segW = 5;
  const maxW = spacing * 1.5;
  const segs: { x: number; y: number; sh: number }[] = [];
  for (let y = spacing / 2; y < h; y += spacing) {
    for (let x = 0; x < w; x += segW) segs.push({ x: x0 + x, y: y0 + y, sh: embedWeight(x / w, y / h, maxW) });
  }
  return (
    <>
      {segs.map((s, i) => <rect key={i} x={s.x} y={s.y - s.sh / 2} width={segW} height={s.sh} fill={fg} />)}
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

/** A small territory treemap on ink, filling the rect at (x0, y0). Labels show where a cell can hold `labelMax`-px type. */
export function TerritoryEmbed({ x0, y0, w, h, gutter, labelMax }: { x0: number; y0: number; w: number; h: number; gutter: number; labelMax: number }) {
  const rects = squarify(TERRITORY_ITEMS, w, h);
  const half = gutter / 2;
  return (
    <>
      <rect x={x0} y={y0} width={w} height={h} fill={INK} />
      {rects.map((r, i) => {
        const cx = r.x + half, cy = r.y + half, cw = r.w - gutter, ch = r.h - gutter;
        if (cw < 4 || ch < 4) return null;
        const [bg, fg] = spectrumCell(i, rects.length);
        const showLabel = cw >= labelMax * 1.8 && ch >= labelMax;
        return (
          <g key={i}>
            <rect x={x0 + cx} y={y0 + cy} width={cw} height={ch} fill={bg} />
            {showLabel && (
              <text x={x0 + cx + cw / 2} y={y0 + cy + ch / 2} textAnchor="middle" dominantBaseline="middle"
                fontFamily={typography.faces.body.stack} fontSize={Math.min(Math.min(cw, ch) * 0.14, labelMax)} fill={fg}>
                {r.label}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}
