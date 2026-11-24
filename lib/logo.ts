// xCO logotype — constructed geometry, not typeset text.
//
// WHY CONSTRUCTED: a logotype must render identically everywhere, including
// where Untitled Serif is not installed and in the PNG rasteriser (which only
// loads DM Mono). Typeset <text> would silently substitute. Every glyph here
// is drawn from the same circle radius and the same stroke weight, so the mark
// is self-contained and exact at any size.
//
// THE CONCEPT: C and O are the same circle. The C is that circle with an
// aperture cut; the O is closed. Same geometry, different openness — the
// optionality argument stated in the letterforms. The lowercase x is the
// expansion operator acting on them, and its reduced height encodes the
// naming rule (lowercase x, uppercase CO) as a visual fact.

import { dmInkLeft, dmStampHeight, dmStampPath, dmWordmarkPath } from "./dm-logo";

// ── Construction grid ────────────────────────────────────────────────
// All values derive from cap height. Change CAP and the mark scales exactly.

const CAP = 100;                    // cap height — the base unit
const STROKE = 12;                  // single stroke weight, all glyphs
const X_HEIGHT = Math.round(CAP / 1.618);  // 62 — φ subdivision of cap
const PAD = 30;                     // clear space built into the viewBox
const X_WIDTH = 56;                 // lowercase x advance

// Optical gaps, not metric ones — measured, not eyeballed. Each pair is
// spaced so the mean white per row across the x-height band is equal, with
// each glyph's profile clamped a fixed depth behind its own extreme (the
// method letterspacing tools use, so open forms count as deep but finite).
//
// C → O is NEGATIVE, and has to be. The C's aperture faces the O, so the
// mouth pours a large pocket of white into that gap; the bounding boxes must
// overlap before the pair holds as much space as x → C. At the previous +4 the
// pair measured 1.61× the optical space of x → C and the O read as detached —
// the kerning feedback. At −10 the ratio is 1.01×. Re-measure before changing:
// scripts/measure-logo-spacing.mjs.
const GAP_XC = 14;                  // x → C  (flat diagonal to round)
const GAP_CO = -10;                 // C → O  (round to open round: boxes overlap)

const R = CAP / 2 - STROKE / 2;     // 44 — centreline radius of C and O
const CAP_TOP = PAD;                // 30
const BASELINE = PAD + CAP;         // 130
const MID_Y = CAP_TOP + CAP / 2;    // 80 — vertical centre of C and O

// Aperture of the C, in degrees. The opening faces right.
const C_APERTURE = 100;

// Glyph origins along the baseline
const X_LEFT = PAD;                                 // 30
const C_CX = X_LEFT + X_WIDTH + GAP_XC + CAP / 2;   // 150
const O_CX = C_CX + CAP / 2 + GAP_CO + CAP / 2;     // 240

export const logoGeometry = {
  cap: CAP,
  stroke: STROKE,
  xHeight: X_HEIGHT,
  radius: R,
  pad: PAD,
  gapXC: GAP_XC,
  gapCO: GAP_CO,
  aperture: C_APERTURE,
  baseline: BASELINE,
  capTop: CAP_TOP,
  midY: MID_Y,
  xLeft: X_LEFT,
  xWidth: X_WIDTH,
  cCx: C_CX,
  oCx: O_CX,
  width: O_CX + CAP / 2 + PAD,   // 320
  height: BASELINE + PAD,        // 160
} as const;

// ── Ink bounds ───────────────────────────────────────────────────────
// The actual extent of the ink, without the built-in clear space — for inline
// use (nav, masthead) where the surrounding layout supplies the spacing.
//
// The x's diagonals end in butt caps cut perpendicular to the stroke, so their
// corners overhang the path endpoints: 4.45 sideways and 4.02 vertically. That
// overhang is why the x's feet sit below the baseline the C and O rest on.

const X_DIAGONAL = Math.hypot(X_WIDTH, X_HEIGHT);
const X_CAP_DX = (STROKE / 2) * (X_HEIGHT / X_DIAGONAL);   // 4.45
const X_CAP_DY = (STROKE / 2) * (X_WIDTH / X_DIAGONAL);    // 4.02

export const inkBounds = {
  left: X_LEFT - X_CAP_DX,
  right: O_CX + CAP / 2,
  top: Math.min(CAP_TOP, BASELINE - X_HEIGHT - X_CAP_DY),
  bottom: BASELINE + X_CAP_DY,
} as const;

// ── Path construction ────────────────────────────────────────────────

/** Polar → cartesian, converting math angles (CCW, y-up) to SVG (y-down). */
function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Arc sweeping from startDeg to endDeg in increasing math angle. Because SVG
 * flips y, increasing math angle runs counter-clockwise on screen, which is
 * sweep-flag 0.
 */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${round(x1)} ${round(y1)} A ${r} ${r} 0 ${largeArc} 0 ${round(x2)} ${round(y2)}`;
}

/** The C: circle with an aperture cut, opening to the right. */
export function cPath(): string {
  const half = C_APERTURE / 2;
  return arcPath(C_CX, MID_Y, R, half, 360 - half);
}

/** The O: the same circle, closed. */
export function oPath(): string {
  // Two half-arcs — a single 360° arc is degenerate in SVG.
  const top = arcPath(O_CX, MID_Y, R, 0, 180);
  const bottom = arcPath(O_CX, MID_Y, R, 180, 360);
  return `${top} ${bottom}`;
}

/** The lowercase x: two crossing strokes, x-height tall. */
export function xPaths(): [string, string] {
  const top = BASELINE - X_HEIGHT;
  const right = X_LEFT + X_WIDTH;
  return [
    `M ${X_LEFT} ${top} L ${right} ${BASELINE}`,
    `M ${right} ${top} L ${X_LEFT} ${BASELINE}`,
  ];
}

// ── Variants ─────────────────────────────────────────────────────────

export type LogoVariant = "ink" | "paper" | "accent";

export const logoVariants: {
  id: LogoVariant;
  label: string;
  fg: string;
  xFg: string;
  bg: string | null;
  /** Dark Matter Labs' mark: DM allows only black on light, white on dark. */
  dmFg: string;
  usage: string;
}[] = [
  {
    id: "ink",
    label: "Ink on paper",
    fg: "#101F24",
    xFg: "#101F24",
    bg: "#F6F1E5",
    dmFg: "#000000",
    usage: "Default. Use everywhere unless there is a reason not to.",
  },
  {
    id: "paper",
    label: "Paper on ink",
    fg: "#F6F1E5",
    xFg: "#F6F1E5",
    bg: "#101F24",
    dmFg: "#FFFFFF",
    usage: "Inverse register — dark grounds, covers, closing slides.",
  },
  {
    id: "accent",
    label: "Dusk operator",
    fg: "#101F24",
    xFg: "#F47743",
    bg: "#F6F1E5",
    dmFg: "#000000",
    usage: "The x carries dusk. Sparing use — one instance per surface.",
  },
];

export const descriptor = "EXPANDING CIVILIZATIONAL OPTIONALITY";

// ── Descriptor lockup metrics ────────────────────────────────────────
// The descriptor is tracked out to span exactly the wordmark's width, so the
// two elements align flush on both edges. Tracking is derived, not guessed:
// hardcoding it would clip the line the moment the descriptor text changed
// (an earlier fixed value overflowed the canvas and truncated "OPTIONALITY").
//
// Flush means INK to INK. Aligning the text's advance boxes to PAD left the
// letters visibly inset: every glyph sits inside its advance with a side
// bearing, and the x's cut feet reach 4.45 past PAD. So each line is placed
// and tracked so its first glyph's ink starts at inkBounds.left and its last
// glyph's ink ends at inkBounds.right.
//
// Set in Untitled Sans 400 since 24 November 2026, like every label (it was
// DM Mono). The PNG exporter loads only DM Mono, so PNG lockups set these
// lines in DM Mono at this tracking until it can load Untitled Sans; DM Mono
// runs 0.41 em wider over the descriptor, about 4 units at this size.

/** The lockup lines' face, for SVG attributes. Only the 400 weight ships. */
export const LOCKUP_FONT = "'Untitled Sans', system-ui, Arial, sans-serif";
export const LOCKUP_WEIGHT = 400;

const DESC_SIZE = 10;
const DESC_BASELINE_GAP = 38;      // below the logotype baseline
const DESC_SPACE = 44;             // extra viewBox height when present

/**
 * A line's measured metrics, in em, from Untitled Sans 400 with canvas
 * measureText: the advance width of the whole line, kerning included, and
 * the side bearings of its end glyphs (actualBoundingBox). Re-measure if the
 * text, face or weight changes.
 */
interface LineMetrics {
  width: number;   // advance width of the untracked line
  first: number;   // left side bearing of the first glyph
  last: number;    // right side bearing of the last glyph
}

/**
 * Start x and letter-spacing that put `text`'s ink exactly across the mark's
 * ink. SVG letter-spacing follows every glyph, the last included, but that
 * trailing space carries no ink, so only the n−1 gaps count.
 */
function flushLine(text: string, size: number, m: LineMetrics) {
  const x = inkBounds.left - m.first * size;
  const inkWidth = (m.width - m.first - m.last) * size;
  const tracking = (inkBounds.right - inkBounds.left - inkWidth) / (text.length - 1);
  return { x: round(x), tracking: round(tracking) };
}

// E opens it, Y closes it.
const DESC_LINE = flushLine(descriptor, DESC_SIZE, { width: 21.19, first: 0.093, last: 0.016 });

export const descriptorMetrics = {
  size: DESC_SIZE,
  x: DESC_LINE.x,
  tracking: DESC_LINE.tracking,
  baselineGap: DESC_BASELINE_GAP,
  space: DESC_SPACE,
} as const;

// ── Endorsement lockup ───────────────────────────────────────────────
// The descriptor lockup plus "AN INITIATIVE OF" and Dark Matter Labs' own V1
// lockup, small. The words state the relationship, so xCO reads as the logo
// and DM as its parent. DM's mark is DM's master artwork (lib/dm-logo.ts),
// never retyped: DM sets its wordmark only in Saans.
//
// DM requires clear space of one stamp height around its mark. The stamp is
// 25 units tall, so it sits 25 below the label's baseline, the left edge of
// the file is 25.55 from it, and the bottom PAD (30) clears it.

export const endorsementLabel = "AN INITIATIVE OF";

const LABEL_SIZE = 10;              // the descriptor's size: one caption register
const LABEL_TRACKING = DESC_LINE.tracking; // the descriptor's derived tracking
const LABEL_BASELINE_GAP = 26;     // below the descriptor baseline
const LABEL_A_BEARING = 0.017;     // Untitled Sans "A" at 400, measured like the others
const DM_STAMP = 25;               // stamp height: a quarter of cap height
const DM_SCALE = DM_STAMP / dmStampHeight;
const DM_TOP = BASELINE + DESC_BASELINE_GAP + LABEL_BASELINE_GAP + DM_STAMP;

export const endorsementMetrics = {
  labelSize: LABEL_SIZE,
  labelTracking: LABEL_TRACKING,
  labelX: round(inkBounds.left - LABEL_A_BEARING * LABEL_SIZE),
  labelBaselineGap: LABEL_BASELINE_GAP,
  /** Transform placing DM's lockup with its stamp ink flush to the mark's ink. */
  dmTransform: `translate(${round(inkBounds.left - dmInkLeft * DM_SCALE)} ${round(DM_TOP - 0.26 * DM_SCALE)}) scale(${round(DM_SCALE * 10000) / 10000})`,
  // extra viewBox height on top of the descriptor lockup
  space: DM_TOP + DM_STAMP + PAD - (BASELINE + PAD + DESC_SPACE),
} as const;

/** ViewBox height of the mark with whichever lockup lines are present. */
export function lockupHeight(withDescriptor: boolean, withEndorsement = false): number {
  const desc = withDescriptor || withEndorsement;
  return (
    logoGeometry.height +
    (desc ? descriptorMetrics.space : 0) +
    (withEndorsement ? endorsementMetrics.space : 0)
  );
}

// ── Standalone SVG builder ───────────────────────────────────────────

interface BuildOptions {
  variant?: LogoVariant;
  /** Include the descriptor line, set in Untitled Sans. Text stays live, not outlined. */
  withDescriptor?: boolean;
  /** Add "AN INITIATIVE OF" + Dark Matter Labs' lockup. Implies the descriptor. */
  withEndorsement?: boolean;
  /** Paint the background rectangle. Off by default — logos ship transparent. */
  withBackground?: boolean;
}

/**
 * Returns a complete, standalone SVG document. Letterforms are geometry, so
 * this renders identically with no fonts installed. The optional descriptor
 * is the one exception and is documented as such.
 */
export function buildLogoSvg({
  variant = "ink",
  withDescriptor = false,
  withEndorsement = false,
  withBackground = false,
}: BuildOptions = {}): string {
  const v = logoVariants.find((x) => x.id === variant) ?? logoVariants[0];
  const { width, stroke, baseline } = logoGeometry;

  const d = descriptorMetrics;
  const e = endorsementMetrics;
  const showDesc = withDescriptor || withEndorsement;
  const totalHeight = lockupHeight(showDesc, withEndorsement);
  const label = withEndorsement
    ? "xCO — Expanding Civilizational Optionality, an initiative of Dark Matter Labs"
    : "xCO — Expanding Civilizational Optionality";

  const [x1, x2] = xPaths();

  const bg =
    withBackground && v.bg
      ? `\n  <rect width="${width}" height="${totalHeight}" fill="${v.bg}"/>`
      : "";

  const descriptorEl = showDesc
    ? `\n  <text x="${d.x}" y="${baseline + d.baselineGap}" font-family="${LOCKUP_FONT}" font-size="${d.size}" font-weight="${LOCKUP_WEIGHT}" letter-spacing="${d.tracking}" fill="${v.fg}">${descriptor}</text>`
    : "";

  const endorsementEl = withEndorsement
    ? `\n  <text x="${e.labelX}" y="${baseline + d.baselineGap + e.labelBaselineGap}" font-family="${LOCKUP_FONT}" font-size="${e.labelSize}" font-weight="${LOCKUP_WEIGHT}" letter-spacing="${e.labelTracking}" fill="${v.fg}">${endorsementLabel}</text>
  <g transform="${e.dmTransform}" fill="${v.dmFg}">
    <path d="${dmWordmarkPath}"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="${dmStampPath}"/>
  </g>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="${width}" height="${totalHeight}" role="img" aria-label="${label}">
  <title>xCO</title>${bg}
  <g fill="none" stroke-width="${stroke}" stroke-linecap="butt">
    <path d="${x1}" stroke="${v.xFg}"/>
    <path d="${x2}" stroke="${v.xFg}"/>
    <path d="${cPath()}" stroke="${v.fg}"/>
    <path d="${oPath()}" stroke="${v.fg}"/>
  </g>${descriptorEl}${endorsementEl}
</svg>
`;
}
