// The x as operator — the pure parts.
//
// The logotype's lowercase x may leave the mark and act on a page, in one of
// four roles (spec: docs/superpowers/specs/2026-11-16-x-operator-design.md).
// This module holds everything that is geometry or decision, so it can be
// checked without a browser (npm run x:check). Motion lives in
// components/xco/XOperator.tsx.

import { inkBounds, logoGeometry as g } from "@/lib/logo";

export type Vec = { x: number; y: number };
/** Where the logo's x sits in page coordinates, and the scale it is drawn at. */
export type Dock = Vec & { k: number };
export type Role = "home" | "keeper" | "framer" | "crawler" | "multiply";

export interface RoleInputs {
  scrollY: number;
  viewportWidth: number;
  reduceMotion: boolean;
  hasKeepBlocks: boolean;
  hasExpandStage: boolean;
  overExpand: boolean;
  overFrame: boolean;
  crawlerInvited: boolean;
  crawlerIdle: boolean;
}

// ── The x's own geometry, in logo units ─────────────────────────────
export const X_CENTRE: Vec = { x: g.xLeft + g.xWidth / 2, y: g.baseline - g.xHeight / 2 };
export const TIP: Vec = { x: g.xWidth / 2, y: g.xHeight / 2 };
/** TL, TR, BR, BL. The diagonal pairs (0,2) and (1,3) are the x's two strokes. */
export const ARMS: ReadonlyArray<readonly [number, number]> = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
export const PAIRS: ReadonlyArray<readonly [number, number]> = [[0, 2], [1, 3]];
export const INK_W = inkBounds.right - inkBounds.left;
export const INK_H = inkBounds.bottom - inkBounds.top;

// ── Behaviour constants (tuned against a 40 px logo) ────────────────
export const KEEPER_SCROLL = 80;
export const NARROW_PX = 640;
export const READING_LINE = 0.38;
export const KEEPER_SETTLE_MS = 320;
export const MAX_LEAN = 35;
export const FRAME_PAD: Vec = { x: 8, y: 6 };
export const FRAME_OPEN_WITHIN = 24;
export const FRAME_LINGER_MS = 500;
export const EXPAND_LINGER_MS = 450;
export const CAPTION_CLEAR = 36;
export const GENS = 3;
export const CRAWL_IDLE_MS = 2400;
export const CRAWL_KEEP_OFF = 40;
export const CRAWL_MAX_SPEED = 170;
export const CRAWL_K = 0.62;
export const STEP_MS = 90;
export const TRAIL_MS = 2600;

// ── Small maths ──────────────────────────────────────────────────────
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
const f = (n: number) => n.toFixed(2);

/** Offset of arm i's tip at scale k, optionally rotated by deg. */
export function tip(i: number, k: number, deg = 0): Vec {
  const [sx, sy] = ARMS[i];
  const x = sx * TIP.x * k;
  const y = sy * TIP.y * k;
  if (!deg) return { x, y };
  const r = (deg * Math.PI) / 180;
  return { x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r) };
}

/** The x as four arms from its centre. Butt caps meeting at the centre draw the same two strokes as the logo. */
export function xPath(c: Vec, k: number, deg = 0): string {
  return ARMS.map((_, i) => {
    const t = tip(i, k, deg);
    return `M${f(c.x)} ${f(c.y)}L${f(c.x + t.x)} ${f(c.y + t.y)}`;
  }).join("");
}

/** The dock, from the logo SVG's client rect (cropped to inkBounds) and the page scroll. */
export function dockFromRect(rect: { left: number; top: number; height: number }, scroll: Vec): Dock {
  const k = rect.height / INK_H;
  return {
    x: rect.left + scroll.x + (X_CENTRE.x - inkBounds.left) * k,
    y: rect.top + scroll.y + (X_CENTRE.y - inkBounds.top) * k,
    k,
  };
}

/**
 * Framer's shape. Each arm is three points: folded (open 0) they run
 * centre → midpoint → tip, a straight arm; open (1) they make an L at the
 * corner c ± half. Interpolating the points unfolds the arm.
 */
export function cropMarksPath(c: Vec, k: number, half: Vec, open: number): string {
  const e = ease(clamp(open, 0, 1));
  const L = Math.min(14, half.x, half.y);
  const P = (a: Vec, b: Vec) => `${f(lerp(a.x, b.x, e))} ${f(lerp(a.y, b.y, e))}`;
  return ARMS.map(([sx, sy], i) => {
    const t = tip(i, k);
    const corner = { x: c.x + sx * half.x, y: c.y + sy * half.y };
    return (
      `M${P(c, { x: corner.x - sx * L, y: corner.y })}` +
      `L${P({ x: c.x + t.x / 2, y: c.y + t.y / 2 }, corner)}` +
      `L${P({ x: c.x + t.x, y: c.y + t.y }, { x: corner.x, y: corner.y - sy * L })}`
    );
  }).join("");
}

/** Scale of each Multiply generation relative to the root x, for a growth of 0..GENS. */
export function multiplyScales(growth: number): number[] {
  const scale = [1];
  for (let n = 1; n <= GENS; n++) scale.push(scale[n - 1] * 0.5 * ease(clamp(growth - (n - 1), 0, 1)));
  return scale;
}

/** k at which the full tree fills the stage. Total reach is 1 + ½ + ¼ + ⅛ of one arm; 1.1 leaves a margin. */
export function multiplyFillK(stage: { w: number; h: number }): number {
  return Math.min(stage.w, stage.h - CAPTION_CLEAR) / (2 * 1.875 * TIP.y * 1.1);
}

/** Which role the one x takes. Priority: Multiply → Framer → Crawler → Keeper → Home. */
export function resolveRole(i: RoleInputs): Role {
  if (i.overExpand && i.hasExpandStage) return "multiply";
  if (i.overFrame) return "framer";
  if (i.crawlerInvited && !i.reduceMotion && !i.crawlerIdle) return "crawler";
  if (i.scrollY > KEEPER_SCROLL && i.hasKeepBlocks && i.viewportWidth >= NARROW_PX) return "keeper";
  return "home";
}
