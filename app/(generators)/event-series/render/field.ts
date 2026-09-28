import type { Rect } from "./types";

type Ctx = CanvasRenderingContext2D;

// The generative ground: a grid of squares on the globe's own grammar, sized
// by a sum of slow travelling waves. It plays the part the pixel-textured
// shader plays on Medulla's posters, built from xCO's square rather than
// borrowed. Every wave's time term is a whole number of turns per loop, so the
// field returns exactly to its first frame and exported video loops cleanly.
//
// The seed picks the waves' directions, frequencies and phases — one seed per
// evening gives each card its own field from the same rules.

const TAU = Math.PI * 2;

interface Wave {
  dx: number;
  dy: number;
  freq: number;    // cycles per 1000 px
  phase: number;
  turns: number;   // whole cycles per loop
  weight: number;
}

/** mulberry32 — small, fast, and deterministic across browsers. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const waveCache = new Map<number, Wave[]>();
function wavesFor(seed: number): Wave[] {
  const hit = waveCache.get(seed);
  if (hit) return hit;
  const rand = rng(seed);
  const spec: [number, number, number, number][] = [
    // [min freq, max freq, turns, weight] — one broad diagonal light, two finer.
    [0.35, 0.7, 1, 0.55],
    [1.2, 2.2, -1, 0.3],
    [3.0, 5.0, 2, 0.15],
  ];
  const waves = spec.map(([lo, hi, turns, weight]) => {
    const angle = rand() * TAU;
    return {
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      freq: lo + rand() * (hi - lo),
      phase: rand() * TAU,
      turns,
      weight,
    };
  });
  waveCache.set(seed, waves);
  return waves;
}

interface FieldOptions {
  pitch: number;
  color: string;
  alpha: number;
  seed: number;
  phase: number;
  /** Scales the whole field's size range: 1 is full, lower is quieter. */
  intensity?: number;
}

export function drawField(ctx: Ctx, area: Rect, o: FieldOptions): void {
  const waves = wavesFor(o.seed);
  const intensity = o.intensity ?? 1;
  const cols = Math.ceil(area.w / o.pitch);
  const rows = Math.ceil(area.h / o.pitch);
  // Frequencies are per 1000 px of the card's short side, so the field has the
  // same character at every output size.
  const unit = 1000 / Math.min(area.w, area.h);

  ctx.save();
  ctx.globalAlpha = o.alpha;
  ctx.fillStyle = o.color;
  for (let r = 0; r < rows; r++) {
    const y = area.y + (r + 0.5) * o.pitch;
    for (let c = 0; c < cols; c++) {
      const x = area.x + (c + 0.5) * o.pitch;
      let n = 0;
      for (const w of waves) {
        const along = ((x * w.dx + y * w.dy) * unit * w.freq) / 1000;
        n += w.weight * Math.sin(TAU * (along + w.turns * o.phase) + w.phase);
      }
      const v = Math.pow(0.5 + 0.5 * n, 1.6);
      const side = o.pitch * (0.1 + 0.8 * v) * intensity;
      if (side < 0.5) continue;
      ctx.fillRect(x - side / 2, y - side / 2, side, side);
    }
  }
  ctx.restore();
}
