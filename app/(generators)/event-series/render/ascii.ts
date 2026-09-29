import type { Rect } from "./types";

type Ctx = CanvasRenderingContext2D;

// ASCII fields, after the optionality site (github.com/Dark-Matter-Labs/eco,
// components/narrative/AsciiField.tsx): a grid of Untitled Sans glyphs chosen
// from a density ramp by a scalar field. The site walks one field through its
// narrative on scroll — turbulent collapse, a hurricane with a calm eye, an
// ordered lattice at the end. The cards take each state on its own:
//
//   collapse   turbulent noise, with dusk hope-beacons pulsing through it
//   storm      logarithmic rain-bands turning around a calm eye
//   lattice    the arrival — an ordered, twinkling lattice over a residual swirl
//
// The site's field runs on wall-clock time; a card has to loop. So time only
// enters as whole turns of the loop phase: noise is sampled while its domain
// travels round a closed circle, the spiral turns a whole number of times,
// and every pulse has an integer frequency. The last frame meets the first.

export type AsciiMode = "collapse" | "storm" | "lattice";

/** Light → dense. No solid block: the densest glyph is @, so bands read as texture. */
export const RAMP = " .·,:;irsxnvuoχ#%@";
const RAMP_N = RAMP.length - 1;
const TAU = Math.PI * 2;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ── Value noise + fBm, as on the site (no dependencies) ──────────────

const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const fade = (t: number) => t * t * (3 - 2 * t);

function vnoise(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = fade(x - xi), v = fade(y - yi), w = fade(z - zi);
  const c = (a: number, b: number, d: number) => hash(xi + a, yi + b, zi + d);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), u);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), u);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), u);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
}

function fbm(x: number, y: number, z: number): number {
  let a = 0, amp = 0.5, f = 1;
  for (let i = 0; i < 4; i++) {
    a += amp * vnoise(x * f, y * f, z * f);
    f *= 2;
    amp *= 0.5;
  }
  return a;
}

/** Glyph for a 0–1 intensity. */
export const glyphFor = (v: number): string => RAMP[Math.min(RAMP_N, Math.max(0, (v * RAMP_N) | 0))];

// ── The fields ───────────────────────────────────────────────────────

interface FieldContext {
  /** Cell position relative to the eye, in radii. */
  dx: number;
  dy: number;
  /** Cell position across the area, 0–1. */
  x: number;
  y: number;
  phase: number;
  /** Seeded noise offset, so each evening has its own weather. */
  z: number;
}

/** Noise whose domain travels once round a circle per loop — seamless. */
function loopNoise(c: FieldContext, scale: number, travel: number): number {
  const a = TAU * c.phase;
  return fbm(c.x * scale + Math.cos(a) * travel, c.y * scale + Math.sin(a) * travel, c.z);
}

function collapse(c: FieldContext): number {
  const n = loopNoise(c, 5, 0.9);
  // Stretch the fBm's narrow middle so the ramp's dense end is reached.
  return clamp01((n - 0.28) * 1.9);
}

function storm(c: FieldContext): number {
  const r = Math.hypot(c.dx, c.dy);
  const ang = Math.atan2(c.dy, c.dx);
  const n = loopNoise(c, 4, 0.5);
  // Two arms: a turn of 2π·phase brings the pattern back to itself.
  const spiral = 0.5 + 0.5 * Math.sin(ang * 2 + 5.2 * Math.log(r * 1.6 + 0.12) - TAU * c.phase);
  const bands = spiral * (0.55 + 0.45 * n);
  const eyeR = 0.16;
  const eyeMask = smoothstep(eyeR * 0.55, eyeR, r);      // the calm eye
  const eyewall = Math.exp(-Math.pow((r - eyeR) / 0.09, 2)) * 0.8;
  const rim = 1 - smoothstep(0.95, 1.7, r);              // ease off away from the storm
  return clamp01((bands * eyeMask + eyewall) * rim + n * 0.12 * (1 - rim));
}

function residualSwirl(c: FieldContext): number {
  const r = Math.hypot(c.dx, c.dy);
  const ang = Math.atan2(c.dy, c.dx);
  const spiral = 0.5 + 0.5 * Math.sin(ang * 2 + 2.6 * Math.log(r * 1.6 + 0.12) - TAU * c.phase);
  return spiral * (1 - smoothstep(0.6, 1.8, r)) * 0.35;
}

// ── Drawing ──────────────────────────────────────────────────────────

interface AsciiOptions {
  mode: AsciiMode;
  /** The eye of the storm, and the centre the beacons gather round. */
  cx: number;
  cy: number;
  radius: number;
  cell: number;
  color: string;
  beacon: string;
  font: string;
  phase: number;
  seed: number;
  /** Overall presence, 0–1. */
  strength?: number;
}

const BEACONS: [number, number][] = [
  [0.44, -0.3],
  [-0.52, 0.2],
  [0.12, 0.58],
];

export function drawAscii(ctx: Ctx, area: Rect, o: AsciiOptions): void {
  const cols = Math.ceil(area.w / o.cell);
  const rows = Math.ceil(area.h / o.cell);
  const strength = o.strength ?? 1;
  const z = (o.seed % 997) * 0.37;
  const f = o.mode === "collapse" ? collapse : o.mode === "storm" ? storm : residualSwirl;

  ctx.save();
  ctx.font = `${o.cell}px ${o.font}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillStyle = o.color;
  for (let j = 0; j < rows; j++) {
    const py = area.y + j * o.cell;
    for (let i = 0; i < cols; i++) {
      const px = area.x + i * o.cell;
      const v = f({
        dx: (px + o.cell / 2 - o.cx) / o.radius,
        dy: (py + o.cell / 2 - o.cy) / o.radius,
        x: i / cols,
        y: (j / rows) * (area.h / area.w),
        phase: o.phase,
        z,
      });
      if (v < 0.04) continue;
      const ch = glyphFor(v);
      if (ch === " ") continue;
      ctx.globalAlpha = (0.22 + v * 0.75) * strength;
      ctx.fillText(ch, px, py);
    }
  }

  if (o.mode === "lattice") drawLattice(ctx, area, o, cols, rows);
  if (o.mode === "collapse") drawBeacons(ctx, o);
  ctx.restore();
}

/** The site's arrival state: every fourth cell, twinkling on a whole-turn clock. */
function drawLattice(ctx: Ctx, area: Rect, o: AsciiOptions, cols: number, rows: number): void {
  for (let j = 2; j < rows; j += 4) {
    for (let i = 2; i < cols; i += 4) {
      const tw = 0.5 + 0.5 * Math.sin(TAU * o.phase * 2 + i * 0.3 + j * 0.2);
      ctx.globalAlpha = (0.25 + tw * 0.6) * (o.strength ?? 1);
      ctx.fillText(tw > 0.72 ? "+" : "·", area.x + i * o.cell, area.y + j * o.cell);
    }
  }
}

/** Three points of hope that pulse through the collapse — dusk, the one accent. */
function drawBeacons(ctx: Ctx, o: AsciiOptions): void {
  ctx.fillStyle = o.beacon;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // A beacon is drawn a size up from the field, so it holds as a point of
  // light at listing size rather than dissolving into the noise around it.
  const big = o.cell * 1.6;
  BEACONS.forEach(([bx, by], b) => {
    const x = o.cx + bx * o.radius;
    const y = o.cy + by * o.radius;
    const pulse = 0.7 + 0.3 * Math.sin(TAU * o.phase * 2 + b * 2.1);
    ctx.font = ctx.font.replace(/^[\d.]+px/, `${big}px`);
    ctx.globalAlpha = pulse;
    ctx.fillText("@", x, y);
    ctx.font = ctx.font.replace(/^[\d.]+px/, `${o.cell}px`);
    ctx.globalAlpha = pulse * 0.55;
    for (const [ddx, ddy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.fillText("#", x + ddx * big, y + ddy * big);
  });
}
