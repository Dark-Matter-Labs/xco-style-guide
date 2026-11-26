// Every xCO lockup, laid out from one set of rules.
//
// Each lockup is a list of parts. A part is a piece of artwork (the
// logotype, a line of text, Dark Matter Labs' mark, a project mark) with its
// ink box and its own clear space. The file's frame is the union of every
// part's ink expanded by its clear space, so no part ever sits closer to the
// edge than its own rule allows. Nothing is padded by eye.
//
// THE UNIT is the x. Clear space is half the x-height (½x = 31), measured
// from the ink. Gaps inside a lockup are ½x or 1x. Dark Matter Labs keeps its
// own rule (clear space of one stamp height), and wins where it is larger.
//
// Each lockup also declares its guides: the measured gaps and alignments that
// make its logic visible. The logo page draws them; the files never carry them.

import {
  logoGeometry as g,
  inkBounds,
  cPath,
  oPath,
  xPaths,
  logoVariants,
  descriptor,
  descriptorMetrics as dm,
  endorsementLabel,
  endorsementMetrics as em,
  LOCKUP_FONT,
  LOCKUP_WEIGHT,
  type LogoVariant,
  type LogoMode,
} from "./logo";
import {
  dmInkBottom,
  dmInkLeft,
  dmInkRight,
  dmInkTop,
  dmStampHeight,
  dmStampPath,
  dmWordmarkPath,
} from "./dm-logo";
import { medullaMark } from "./event-series/medulla-mark";
import { serifXPath } from "./serif-x";

// ── Geometry helpers ─────────────────────────────────────────────────

export interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const expand = (b: Box, d: number): Box => ({ l: b.l - d, t: b.t - d, r: b.r + d, b: b.b + d });
const union = (boxes: Box[]): Box => ({
  l: Math.min(...boxes.map((b) => b.l)),
  t: Math.min(...boxes.map((b) => b.t)),
  r: Math.max(...boxes.map((b) => b.r)),
  b: Math.max(...boxes.map((b) => b.b)),
});

// ── Units ────────────────────────────────────────────────────────────

/** ½x: clear space, and the small gap inside a lockup. */
export const HALF_X = g.clear;
/** 1x: the large gap, and the height Dark Matter Labs' stamp takes beside the mark. */
export const ONE_X = g.xHeight;

/** Untitled Sans 400 cap height, in em (H, measured with canvas measureText). */
const CAP_EM = 0.72;

// ── Lockups ──────────────────────────────────────────────────────────

export type Lockup =
  | "mark"
  | "stacked"
  | "horizontal"
  | "endorsed"
  | "with-dml"
  | "with-project"
  | "with-partner"
  | "with-project-endorsed";

export const lockups: {
  id: Lockup;
  label: string;
  family: "xco" | "dml" | "project";
  note: string;
  /** Offered as a download. Project lockups carry another organisation's artwork. */
  download: boolean;
  suffix: string;
}[] = [
  { id: "mark", label: "Logotype", family: "xco", note: "xCO alone. The default.", download: true, suffix: "" },
  {
    id: "stacked",
    label: "Stack",
    family: "xco",
    note: "The full name below the logotype, tracked flush to its ink on both edges.",
    download: true,
    suffix: "-stack",
  },
  {
    id: "horizontal",
    label: "Horizontal lockup",
    family: "xco",
    note: "The full name beside the logotype, on three lines that fill the cap band.",
    download: true,
    suffix: "-horizontal",
  },
  {
    id: "endorsed",
    label: "Stack, an initiative of Dark Matter Labs",
    family: "dml",
    note: "The stack, then “An initiative of” and DM’s own logo, small. xCO leads.",
    download: true,
    suffix: "-dml-endorsed",
  },
  {
    id: "with-dml",
    label: "xCO with Dark Matter Labs",
    family: "dml",
    note: "Side by side, split by a rule. DM’s stamp stands on the x-height band.",
    download: true,
    suffix: "-with-dml",
  },
  {
    id: "with-project",
    label: "xCO × project",
    family: "project",
    note: "A co-host or project: xCO leads, a drawn ×, then the project’s mark inside the cap band.",
    download: false,
    suffix: "-x-medulla",
  },
  {
    id: "with-partner",
    label: "xCO × any partner",
    family: "project",
    note: "The zone a partner’s mark must fit: the cap band tall, at most 2.5 caps wide.",
    download: false,
    suffix: "-x-partner",
  },
  {
    id: "with-project-endorsed",
    label: "xCO × project, an initiative of Dark Matter Labs",
    family: "project",
    note: "All three: the co-host row, then DM’s endorsement below, flush left.",
    download: false,
    suffix: "-x-medulla-dml",
  },
];

/** A measured gap or alignment, drawn on the logo page's figures. */
export type Guide =
  | { kind: "gapX"; from: number; to: number; y: number; label: string }
  | { kind: "gapY"; from: number; to: number; x: number; label: string }
  | { kind: "lineY"; y: number; from: number; to: number; label: string }
  | { kind: "lineX"; x: number; from: number; to: number; label: string };

export interface Part {
  name: string;
  ink: Box;
  /** This part's own clear space, from its ink. */
  clear: number;
  markup: string;
}

export interface LockupLayout {
  lockup: Lockup;
  frame: Box;
  ink: Box;
  parts: Part[];
  guides: Guide[];
  label: string;
}

interface Paint {
  fg: string;
  xFg: string;
  dmFg: string;
  mode: LogoMode;
  xStyle: "mono" | "serif";
}

// ── Parts ────────────────────────────────────────────────────────────

function logotype(p: Paint): Part {
  const [x1, x2] = xPaths();
  const x =
    p.xStyle === "serif"
      ? `<path transform="translate(0 ${r2(-g.xLift)})" d="${serifXPath}" fill="${p.xFg}"/>`
      : `<path d="${x1}" stroke="${p.xFg}"/><path d="${x2}" stroke="${p.xFg}"/>`;
  const strokes = `<g fill="none" stroke-width="${g.stroke}" stroke-linecap="butt">${
    p.xStyle === "serif" ? "" : x
  }<path d="${cPath()}" stroke="${p.fg}"/><path d="${oPath()}" stroke="${p.fg}"/></g>`;
  return {
    name: "xCO",
    ink: { l: inkBounds.left, t: inkBounds.top, r: inkBounds.right, b: inkBounds.bottom },
    clear: HALF_X,
    markup: strokes + (p.xStyle === "serif" ? x : ""),
  };
}

function textLine(
  name: string,
  text: string,
  x: number,
  baseline: number,
  size: number,
  tracking: number,
  ink: Box,
  fill: string,
): Part {
  return {
    name,
    ink,
    clear: HALF_X,
    markup: `<text x="${r2(x)}" y="${r2(baseline)}" font-family="${LOCKUP_FONT}" font-size="${size}" font-weight="${LOCKUP_WEIGHT}" letter-spacing="${r2(tracking)}" fill="${fill}">${text}</text>`,
  };
}

/** Dark Matter Labs' V1 lockup, its stamp `stamp` tall with its ink top-left at (left, top). */
function dmLogo(p: Paint, left: number, top: number, stamp: number): Part {
  const s = stamp / dmStampHeight;
  const tx = left - dmInkLeft * s;
  const ty = top - dmInkTop * s;
  return {
    name: "Dark Matter Labs",
    ink: { l: left, t: top, r: tx + dmInkRight * s, b: ty + dmInkBottom * s },
    // DM's own rule: clear space of one stamp height all round.
    clear: stamp,
    markup: `<g transform="translate(${r2(tx)} ${r2(ty)}) scale(${r2(s * 10000) / 10000})" fill="${p.dmFg}"><path d="${dmWordmarkPath}"/><path fill-rule="evenodd" clip-rule="evenodd" d="${dmStampPath}"/></g>`,
  };
}

// The descriptor: one line, set to span the logotype's ink exactly.
const DESC_BASELINE = g.baseline + dm.baselineGap; // 168
const DESC_CAP_TOP = DESC_BASELINE - CAP_EM * dm.size;

function descriptorLine(p: Paint): Part {
  return textLine(
    "Descriptor",
    descriptor,
    dm.x,
    DESC_BASELINE,
    dm.size,
    dm.tracking,
    { l: inkBounds.left, t: DESC_CAP_TOP, r: inkBounds.right, b: DESC_BASELINE },
    p.fg,
  );
}

/** "AN INITIATIVE OF" at `labelBaseline`, then DM's logo one stamp below it, flush to the mark's ink. */
function endorsement(p: Paint, labelBaseline: number): Part[] {
  const stamp = 25;
  const label = textLine(
    "Endorsement",
    endorsementLabel,
    em.labelX,
    labelBaseline,
    em.labelSize,
    em.labelTracking,
    {
      l: inkBounds.left,
      t: labelBaseline - CAP_EM * em.labelSize,
      // 16 characters of Untitled Sans at 10 units, plus the tracking between them.
      r: em.labelX + (8.519 - 0.064) * em.labelSize + em.labelTracking * 15,
      b: labelBaseline,
    },
    p.fg,
  );
  return [label, dmLogo(p, inkBounds.left, labelBaseline + stamp, stamp)];
}

// The horizontal lockup: three lines in the cap band, ½x right of the O.
const H_SIZE = 28;
const H_TRACKING = 0.6;
const H_GAP = HALF_X;
// Untracked advance width, left and right side bearings, in em (canvas measureText).
const H_LINES = [
  { text: "EXPANDING", w: 5.942, first: 0.09, last: 0.076 },
  { text: "CIVILIZATIONAL", w: 7.965, first: 0.05, last: 0.051 },
  { text: "OPTIONALITY", w: 6.849, first: 0.05, last: 0.014 },
];

function horizontalLines(p: Paint): { parts: Part[]; left: number; step: number } {
  const left = inkBounds.right + H_GAP;
  const firstBaseline = g.capTop + CAP_EM * H_SIZE;
  const step = (g.baseline - firstBaseline) / (H_LINES.length - 1);
  const parts = H_LINES.map((line, i) => {
    const baseline = firstBaseline + step * i;
    const x = left - line.first * H_SIZE;
    const right = x + (line.w - line.last) * H_SIZE + H_TRACKING * (line.text.length - 1);
    return textLine(
      `Name, line ${i + 1}`,
      line.text,
      x,
      baseline,
      H_SIZE,
      H_TRACKING,
      { l: left, t: baseline - CAP_EM * H_SIZE, r: right, b: baseline },
      p.fg,
    );
  });
  return { parts, left, step };
}

// The co-host row: xCO, a drawn ×, then the project's mark.
export const coHost = {
  /** Logotype ink → ×, and × → project mark. */
  gap: HALF_X,
  /** The × is ½x square, centred on the x's band, at half the logotype's stroke. */
  cross: HALF_X,
  crossStroke: g.stroke / 2,
  /** A disc-shaped mark is drawn slightly under the cap height, which round forms overshoot optically. */
  discScale: 0.92,
  /** A partner mark fits the cap band, and is at most this many caps wide. */
  partnerMaxWidth: 2.5,
} as const;

function cross(p: Paint): Part {
  const left = inkBounds.right + coHost.gap;
  const mid = g.xBase - g.xHeight / 2;
  const h = coHost.cross / 2;
  const r = left + coHost.cross;
  return {
    name: "×",
    ink: { l: left, t: mid - h, r, b: mid + h },
    clear: 0,
    markup: `<g fill="none" stroke="${p.fg}" stroke-width="${coHost.crossStroke}" stroke-linecap="butt"><path d="M ${r2(left)} ${r2(mid - h)} L ${r2(r)} ${r2(mid + h)}"/><path d="M ${r2(r)} ${r2(mid - h)} L ${r2(left)} ${r2(mid + h)}"/></g>`,
  };
}

const PROJECT_LEFT = inkBounds.right + coHost.gap + coHost.cross + coHost.gap;

function medulla(p: Paint): Part {
  const m = medullaMark;
  const d = g.cap * coHost.discScale;
  const top = g.capTop + (g.cap - d) / 2;
  const s = d / m.size;
  // On a light ground the white disc gets a hairline ring for an edge, as in the event series.
  const ring =
    p.mode === "light"
      ? ` stroke="${p.fg}" stroke-opacity="0.35" stroke-width="${r2(2 / s)}"`
      : "";
  return {
    name: "Medulla",
    ink: { l: PROJECT_LEFT, t: top, r: PROJECT_LEFT + d, b: top + d },
    clear: HALF_X,
    markup: `<g transform="translate(${r2(PROJECT_LEFT)} ${r2(top)}) scale(${r2(s * 10000) / 10000})"><circle cx="${m.disc.cx}" cy="${m.disc.cy}" r="${m.disc.r}" fill="${m.discFill}"${ring}/>${m.glyph
      .map((d) => `<path fill-rule="evenodd" d="${d}" fill="${m.glyphFill}"/>`)
      .join("")}</g>`,
  };
}

function partnerZone(p: Paint): Part {
  const w = g.cap * coHost.partnerMaxWidth;
  const ink = { l: PROJECT_LEFT, t: g.capTop, r: PROJECT_LEFT + w, b: g.baseline };
  return {
    name: "Partner mark",
    ink,
    clear: HALF_X,
    markup: `<rect x="${r2(ink.l)}" y="${r2(ink.t)}" width="${r2(w)}" height="${g.cap}" fill="none" stroke="${p.fg}" stroke-width="1.5" stroke-dasharray="6 5"/><text x="${r2(ink.l + w / 2)}" y="${r2(g.capTop + g.cap / 2 + 4)}" text-anchor="middle" font-family="${LOCKUP_FONT}" font-size="12" letter-spacing="1.5" fill="${p.fg}">PARTNER MARK</text>`,
  };
}

// ── Layout ───────────────────────────────────────────────────────────

const LABELS: Record<Lockup, string> = {
  mark: "xCO",
  stacked: "xCO — Expanding Civilizational Optionality",
  horizontal: "xCO — Expanding Civilizational Optionality",
  endorsed: "xCO — Expanding Civilizational Optionality, an initiative of Dark Matter Labs",
  "with-dml": "xCO with Dark Matter Labs",
  "with-project": "xCO × Medulla",
  "with-partner": "xCO × partner",
  "with-project-endorsed": "xCO × Medulla, an initiative of Dark Matter Labs",
};

export function lockupLayout(
  lockup: Lockup,
  variant: LogoVariant = "light",
  opts: { color?: string; xStyle?: "mono" | "serif" } = {},
): LockupLayout {
  const v = logoVariants.find((x) => x.id === variant) ?? logoVariants[0];
  const p: Paint = {
    fg: opts.color ?? v.fg,
    xFg: opts.color ?? v.xFg,
    // DM's mark is never recoloured, so it ignores the color override.
    dmFg: v.dmFg,
    mode: v.mode,
    xStyle: opts.xStyle ?? "mono",
  };
  const mark = logotype(p);
  const parts: Part[] = [mark];
  const guides: Guide[] = [];
  const ink = inkBounds;

  switch (lockup) {
    case "mark":
      break;

    case "stacked":
    case "endorsed": {
      parts.push(descriptorLine(p));
      guides.push(
        { kind: "gapY", from: g.baseline, to: DESC_CAP_TOP, x: ink.right + 8, label: "½x" },
        { kind: "lineX", x: ink.left, from: g.capTop - 8, to: DESC_BASELINE + 6, label: "flush" },
        { kind: "lineX", x: ink.right, from: g.capTop - 8, to: DESC_BASELINE + 6, label: "flush" },
      );
      if (lockup === "endorsed") {
        const labelBaseline = DESC_BASELINE + em.labelBaselineGap;
        const [label, dml] = endorsement(p, labelBaseline);
        parts.push(label, dml);
        guides.push({ kind: "gapY", from: label.ink.b, to: dml.ink.t, x: dml.ink.r + 8, label: "1 stamp" });
      }
      break;
    }

    case "horizontal": {
      const { parts: lines, left } = horizontalLines(p);
      parts.push(...lines);
      const right = Math.max(...lines.map((l) => l.ink.r));
      guides.push(
        { kind: "gapX", from: ink.right, to: left, y: g.capTop - 10, label: "½x" },
        { kind: "lineY", y: g.capTop, from: ink.left - 8, to: right + 8, label: "cap" },
        { kind: "lineY", y: g.baseline, from: ink.left - 8, to: right + 8, label: "baseline" },
      );
      break;
    }

    case "with-dml": {
      const ruleX = ink.right + ONE_X;
      const stamp = ONE_X;
      const dmLeft = ruleX + ONE_X;
      const dml = dmLogo(p, dmLeft, g.baseline - stamp, stamp);
      parts.push(
        {
          name: "Rule",
          ink: { l: ruleX - 1, t: g.capTop, r: ruleX + 1, b: g.baseline },
          clear: 0,
          markup: `<path d="M ${r2(ruleX)} ${g.capTop} V ${g.baseline}" stroke="${p.fg}" stroke-width="2"/>`,
        },
        dml,
      );
      guides.push(
        { kind: "gapX", from: ink.right, to: ruleX, y: g.capTop - 10, label: "1x" },
        { kind: "gapX", from: ruleX, to: dmLeft, y: g.capTop - 10, label: "1x" },
        { kind: "lineY", y: g.baseline - g.xHeight, from: ink.left - 8, to: dml.ink.r + 8, label: "x-height" },
        { kind: "lineY", y: g.baseline, from: ink.left - 8, to: dml.ink.r + 8, label: "baseline" },
      );
      break;
    }

    case "with-project":
    case "with-partner":
    case "with-project-endorsed": {
      const x = cross(p);
      const project = lockup === "with-partner" ? partnerZone(p) : medulla(p);
      parts.push(x, project);
      guides.push(
        { kind: "gapX", from: ink.right, to: x.ink.l, y: g.capTop - 10, label: "½x" },
        { kind: "gapX", from: x.ink.r, to: project.ink.l, y: g.capTop - 10, label: "½x" },
        { kind: "lineY", y: g.capTop, from: ink.left - 8, to: project.ink.r + 8, label: "cap" },
        { kind: "lineY", y: g.baseline, from: ink.left - 8, to: project.ink.r + 8, label: "baseline" },
      );
      if (lockup === "with-project-endorsed") {
        parts.push(...endorsement(p, DESC_BASELINE));
      }
      break;
    }
  }

  const inkBox = union(parts.map((part) => part.ink));
  const frame = union(parts.map((part) => expand(part.ink, part.clear)));
  return { lockup, frame, ink: inkBox, parts, guides, label: LABELS[lockup] };
}

/** Width over height of a lockup's frame. */
export function lockupRatio(lockup: Lockup): number {
  const f = lockupLayout(lockup).frame;
  return (f.r - f.l) / (f.b - f.t);
}

/** The lockup's artwork, without the <svg> wrapper. */
export function lockupMarkup(layout: LockupLayout): string {
  return layout.parts.map((part) => part.markup).join("");
}

/**
 * A complete, standalone SVG document. The letterforms and both partner
 * marks are paths, so they render with no fonts installed. The text lines
 * are live Untitled Sans, the documented exception.
 */
export function buildLockupSvg({
  lockup = "mark",
  variant = "light",
  withBackground = false,
}: {
  lockup?: Lockup;
  variant?: LogoVariant;
  withBackground?: boolean;
} = {}): string {
  const v = logoVariants.find((x) => x.id === variant) ?? logoVariants[0];
  const layout = lockupLayout(lockup, variant);
  const f = layout.frame;
  const w = r2(f.r - f.l);
  const h = r2(f.b - f.t);
  const bg = withBackground ? `\n  <rect x="${r2(f.l)}" y="${r2(f.t)}" width="${w}" height="${h}" fill="${v.bg}"/>` : "";
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(f.l)} ${r2(f.t)} ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${layout.label}">
  <title>${layout.label}</title>${bg}
  ${lockupMarkup(layout)}
</svg>
`;
}
