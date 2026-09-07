// Group marks — the aperture system.
//
// One identity device, used wherever xCO needs a family of related marks that
// must stay distinguishable: Signal group avatars today, and anything else
// needing a set rather than a single mark.
//
// THE DEVICE. Every mark is the same lockup — the lowercase x and the
// apertured C, at lib/logo.ts geometry — with the C's aperture rotated. That
// is the logotype's own argument made literal: the same circle, at a different
// openness. Nothing is redrawn per mark.
//
// TWO CHANNELS. A mark is identified by ground colour AND aperture angle,
// never by colour alone. This is the same rule the colour page sets for the
// semantic meanings, and the reason the domain marks carry shapes: colour is
// not reliable on its own. The aperture is what survives greyscale, print,
// forced colours, and a colour-blind reader.
//
// THE INVARIANT. No two marks may be weak on both channels at once. Close in
// value is fine when the apertures are far apart, and vice versa. auditPairs()
// below checks this, and the logo page renders the result — so a bad
// combination shows up in the documentation rather than in someone's chat list.
//
// This module is the single source of truth. scripts/generate-group-avatars.mjs
// renders from it; the logo page documents from it. Ground colours are stored
// as design-token NAMES rather than hex, so the two consumers both resolve
// through lib/design-tokens.ts and no hex is duplicated — except the two
// group-identity colours, which have no token and are defined here.

// ── Aperture positions ───────────────────────────────────────────────
// 45° steps. Half-steps are deliberately not used: at the ~48px an avatar is
// listed at, a 22.5° difference is not readable.

export const APERTURE_STEP = 45;
export const aperturePositions = [0, 45, 90, 135, 180, 225, 270, 315] as const;
export type Aperture = (typeof aperturePositions)[number];

// ── Thresholds ───────────────────────────────────────────────────────

/** WCAG 1.4.11 non-text contrast. The mark is a graphic, not text. */
export const MARK_CONTRAST_MIN = 3;

/**
 * Below this ratio two grounds read as the same tone once colour is removed,
 * so the aperture has to carry the whole separation.
 */
export const VALUE_TWIN_MAX = 1.5;

/**
 * Two marks this close in aperture are hard to tell apart by shape alone at
 * listing size, so the grounds have to carry the separation.
 */
export const ANGLE_TWIN_MAX = 45;

// ── Group-identity colours ───────────────────────────────────────────
// Not system tokens, and deliberately not added to design-tokens.ts. The
// documented palette is allocated; these exist only to keep this family
// separable. Both were chosen by measurement — see the notes on each mark.

export const groupColors = {
  green: {
    hex: "#1f9350",
    label: "group green",
    note: "After the Indian flag. A darker #157f3f held better glyph contrast but collapsed toward ocean in greyscale at 1.60:1.",
  },
  lilac: {
    hex: "#cbb0d8",
    label: "group lilac",
    note: "The one unused hue region, in the light band. Every mid or dark plum failed against ocean — #7d3f6b at 1.08:1, claret at 1.00:1.",
  },
} as const;

export type GroupColor = keyof typeof groupColors;

// ── Ground and glyph references ──────────────────────────────────────
// Ground is either a documented palette token or one of the two group
// colours. Glyphs are always palette tokens.

export type Ground =
  | { kind: "token"; token: "paper" | "ink" | "ocean" | "teal" | "sand" | "navy" }
  | { kind: "group"; color: GroupColor };

export type GlyphToken = "ink" | "paper" | "dusk";

export interface GroupMark {
  id: string;
  /** Exact group name, for the registry table. */
  name: string;
  /** Filename under public/signal-groups/, without extension. */
  file: string;
  ground: Ground;
  /** The apertured C. */
  c: GlyphToken;
  /** The lowercase x. Differs from c only where the accent is earned. */
  x: GlyphToken;
  aperture: Aperture;
  /** Why this ground and this angle, in one line. */
  note: string;
}

export const groupMarks: GroupMark[] = [
  {
    id: "xco",
    name: "xCO",
    file: "xco",
    ground: { kind: "token", token: "paper" },
    c: "ink",
    x: "ink",
    aperture: 0,
    note: "Parent group. The default ink variant, unrotated. Dusk on paper measures 2.77:1, under the non-text bar, so the accent sits on Berlin instead.",
  },
  {
    id: "berlin-medulla",
    name: "xCO-Berlin/Medulla",
    file: "xco-berlin-medulla",
    ground: { kind: "token", token: "ink" },
    c: "paper",
    x: "dusk",
    aperture: 90,
    note: "The inverse register, and the one mark carrying dusk — 5.22:1 here, which the accent variant permits at one instance per set.",
  },
  {
    id: "oceans-continuity-studio",
    name: "xCO-Oceans Continuity Studio",
    file: "xco-oceans-continuity-studio",
    ground: { kind: "token", token: "ocean" },
    c: "paper",
    x: "paper",
    aperture: 180,
    note: "Ocean, the documented structural blue. Dusk on it is a chroma clash, so both glyphs take paper.",
  },
  {
    id: "india",
    name: "xCO-India",
    file: "xco-india",
    ground: { kind: "group", color: "green" },
    c: "paper",
    x: "paper",
    aperture: 270,
    note: "Green and white, after the flag. Paper mark on green rather than the reverse — the parent already owns the paper ground.",
  },
  {
    id: "madrid",
    name: "xCO-Madrid",
    file: "xco-madrid",
    ground: { kind: "token", token: "sand" },
    c: "ink",
    x: "ink",
    aperture: 135,
    note: "Sand. Teal and navy were the alternatives and both collapse in greyscale — against green at 1.12:1 and ink at 1.09:1.",
  },
  {
    id: "santiago",
    name: "xCO-Santiago",
    file: "xco-santiago",
    ground: { kind: "token", token: "teal" },
    c: "paper",
    x: "paper",
    aperture: 45,
    note: "Teal, the open register: frontier, coastal. 45° puts it 135° from green, its value twin at 1.12:1.",
  },
  {
    id: "positions-options-stewards",
    name: "xCO — Positions & Options Stewards",
    file: "xco-positions-options-stewards",
    ground: { kind: "token", token: "navy" },
    c: "paper",
    x: "paper",
    aperture: 315,
    note: "Navy, the deep structural register — a group stewarding the positions themselves rather than a place. 315° clears both its value twin (ink) and its hue twin (ocean) by 135°.",
  },
  {
    id: "learning-system",
    name: "xCO — Learning System",
    file: "xco-learning-system",
    ground: { kind: "group", color: "lilac" },
    c: "ink",
    x: "ink",
    aperture: 225,
    note: "Light violet. 225° sits between ocean and green, so colour alone had to separate it from both: 4.15:1 and 2.01:1.",
  },
];

// ── Contrast maths ───────────────────────────────────────────────────
// WCAG relative luminance, not a weighted-RGB estimate. The estimate picks
// light text on mid-tones where dark actually scores higher.

export function relLuminance(hex: string): number {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrastRatio(a: string, b: string): number {
  const l1 = relLuminance(a);
  const l2 = relLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Shortest angle between two apertures, 0–180. */
export function apertureDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// ── Pair audit ───────────────────────────────────────────────────────

export interface PairAudit {
  a: string;
  b: string;
  value: number;
  angle: number;
  /** Weak on both channels — the one state the system forbids. */
  failing: boolean;
  /** Weak on one channel, carried by the other. */
  singleChannel: boolean;
}

/**
 * Every pair of marks, with the channel that separates it. Takes a resolver so
 * both consumers can supply hex from wherever they get their tokens.
 */
export function auditPairs(groundHex: (m: GroupMark) => string): PairAudit[] {
  const out: PairAudit[] = [];
  for (let i = 0; i < groupMarks.length; i++) {
    for (let j = i + 1; j < groupMarks.length; j++) {
      const m = groupMarks[i];
      const n = groupMarks[j];
      const value = contrastRatio(groundHex(m), groundHex(n));
      const angle = apertureDistance(m.aperture, n.aperture);
      const valueWeak = value < VALUE_TWIN_MAX;
      const angleWeak = angle <= ANGLE_TWIN_MAX;
      out.push({
        a: m.name,
        b: n.name,
        value,
        angle,
        failing: valueWeak && angleWeak,
        singleChannel: (valueWeak || angleWeak) && !(valueWeak && angleWeak),
      });
    }
  }
  return out;
}

// ── Rules, for the documentation ─────────────────────────────────────

export const markRules = [
  {
    rule: "Two channels, never colour alone.",
    detail:
      "A mark is ground plus aperture. Colour is not reliable on its own — under deuteranopia the domain hues collapse, and in print or forced colours hue is gone entirely.",
  },
  {
    rule: "Never weak on both channels at once.",
    detail:
      `Grounds under ${VALUE_TWIN_MAX}:1 apart read as one tone in greyscale, and apertures within ${ANGLE_TWIN_MAX}° read as one shape at listing size. A pair may be close on one, never on both.`,
  },
  {
    rule: `The mark clears ${MARK_CONTRAST_MIN}:1 on its ground.`,
    detail:
      "WCAG 1.4.11 for non-text. Domain and accent colours mostly fail this as a mark on paper, which is why the glyphs are ink or paper in almost every case.",
  },
  {
    rule: "A hairline ring, in the mark's own colour.",
    detail:
      "Signal's dark list ground sits near ink, so an ink-ground mark has no edge without one and reads as a hole. Structure is drawn, not shadowed — so the answer is a hairline, applied to every mark for consistency.",
  },
  {
    rule: "45° steps only.",
    detail:
      "Eight positions. Half-steps are not used: at 48px a 22.5° difference is not readable, so it would be a channel that does not actually carry.",
  },
  {
    rule: "Documented tones first.",
    detail:
      "Go outside the palette only when it is exhausted or a specific reference is asked for. Group colours are declared in lib/group-marks.ts and never promoted to tokens — they identify a group, they do not mean anything.",
  },
  {
    rule: "No group takes a domain colour or a domain shape.",
    detail:
      "Those channels mean biophysical, institutional, technological, cultural. A group is a place, a track or a function — tagging it with a domain would be a false claim.",
  },
] as const;

/**
 * Both channels are now fully allocated: eight apertures used, and every
 * documented tone. A ninth mark needs a third channel — ring weight or a
 * doubled ring is the cheapest addition that fits, since the hairline is
 * already a system device.
 */
export const allocationStatus = {
  aperturesUsed: groupMarks.length,
  aperturesTotal: aperturePositions.length,
  documentedTonesUsed: groupMarks.filter((m) => m.ground.kind === "token").length,
  groupColorsUsed: Object.keys(groupColors).length,
  nextNeeds:
    "A third channel. Ring weight or a doubled ring fits best — the hairline is already a system device. A 22.5° aperture step is the alternative and is not recommended: half-steps do not read at listing size.",
} as const;
