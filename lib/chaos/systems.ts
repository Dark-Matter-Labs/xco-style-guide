// Stochastic chaos — three seeded systems that make xCO pattern fields.
//
// Each keeps the identity grammar: dense fine ink inside a quiet ground, and
// one followed trajectory (the "trace") that the renderer can mark in ember —
// the 2% signal. `chaos` runs from order (0) to chaos (1): it adds noise to a
// deterministic system, or loosens a random one. Every output lives in the
// unit square and is expressive only: no mark encodes a quantity.

import { gaussian, noise2D, rng } from "./random";

export type ChaosSystem = "attractor" | "flow" | "drift";

export interface ChaosParams {
  system: ChaosSystem;
  seed: number;
  /** 0 = ordered, 1 = most stochastic. */
  chaos: number;
  /** 0.5–2: how much material the system lays down. */
  density: number;
}

export type ChaosResult =
  | { kind: "points"; xy: Float32Array; trace: Float32Array; detail: string }
  | { kind: "paths"; paths: Float32Array[]; trace: Float32Array; detail: string };

export const chaosSystems: { id: ChaosSystem; label: string; hint: string }[] = [
  { id: "attractor", label: "Attractor", hint: "A strange attractor, shaken — order that never repeats" },
  { id: "flow", label: "Flow", hint: "Particles carried through a turbulent field" },
  { id: "drift", label: "Drift", hint: "Walkers with heavy-tailed steps — clusters and long flights" },
];

/** Fit interleaved x,y into the unit square, keeping aspect, centred. */
function fitUnit(arrays: Float32Array[]): void {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const a of arrays) {
    for (let i = 0; i < a.length; i += 2) {
      if (a[i] < minX) minX = a[i];
      if (a[i] > maxX) maxX = a[i];
      if (a[i + 1] < minY) minY = a[i + 1];
      if (a[i + 1] > maxY) maxY = a[i + 1];
    }
  }
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const ox = (span - (maxX - minX)) / 2 - minX;
  const oy = (span - (maxY - minY)) / 2 - minY;
  for (const a of arrays) {
    for (let i = 0; i < a.length; i += 2) {
      a[i] = (a[i] + ox) / span;
      a[i + 1] = (a[i + 1] + oy) / span;
    }
  }
}

// ── Attractor ─────────────────────────────────────────────────────────
// Clifford: x' = sin(a·y) + c·cos(a·x), y' = sin(b·x) + d·cos(b·y).
// Parameters are drawn from the seed and kept only when a trial run spreads
// over the plane (some draws collapse to a few points). Chaos adds Gaussian
// jitter to every step — stochastic chaos on top of deterministic chaos.

function cliffordParams(rand: () => number): [number, number, number, number] {
  for (let attempt = 0; attempt < 60; attempt++) {
    const p: [number, number, number, number] = [rand() * 4 - 2, rand() * 4 - 2, rand() * 3 - 1.5, rand() * 3 - 1.5];
    const [a, b, c, d] = p;
    const cells = new Set<number>();
    let x = 0.1, y = 0.1;
    for (let i = 0; i < 6000; i++) {
      const nx = Math.sin(a * y) + c * Math.cos(a * x);
      y = Math.sin(b * x) + d * Math.cos(b * y);
      x = nx;
      if (i > 100) cells.add(Math.floor((x + 3) * 8) * 64 + Math.floor((y + 3) * 8));
    }
    if (cells.size > 260) return p;
  }
  return [-1.4, 1.6, 1.0, 0.7]; // a known chaotic set
}

function attractor({ seed, chaos, density }: ChaosParams): ChaosResult {
  const rand = rng(seed);
  const [a, b, c, d] = cliffordParams(rand);
  const n = Math.round(900_000 * density);
  const jitter = chaos * chaos * 0.06;
  const xy = new Float32Array(n * 2);
  let x = 0.1, y = 0.1;
  for (let i = 0; i < n + 100; i++) {
    const nx = Math.sin(a * y) + c * Math.cos(a * x) + (jitter ? gaussian(rand) * jitter : 0);
    y = Math.sin(b * x) + d * Math.cos(b * y) + (jitter ? gaussian(rand) * jitter : 0);
    x = nx;
    if (i >= 100) {
      xy[(i - 100) * 2] = x;
      xy[(i - 100) * 2 + 1] = y;
    }
  }
  const start = Math.floor(rand() * (n - 120));
  const trace = xy.slice(start * 2, (start + 120) * 2);
  fitUnit([xy, trace]);
  return { kind: "points", xy, trace, detail: `Clifford a=${a.toFixed(2)} b=${b.toFixed(2)} c=${c.toFixed(2)} d=${d.toFixed(2)}` };
}

// ── Flow ──────────────────────────────────────────────────────────────
// Particles follow the angle of a seeded noise field. Chaos raises the
// field's frequency and adds a random turn at every step.

function flow({ seed, chaos, density }: ChaosParams): ChaosResult {
  const rand = rng(seed);
  const field = noise2D(rand, 3);
  const freq = 1.6 + chaos * 4.5;
  const turn = chaos * 0.9;
  const count = Math.round(900 * density);
  const steps = 220;
  const step = 0.0035;
  const paths: Float32Array[] = [];
  for (let p = 0; p < count; p++) {
    let x = rand(), y = rand();
    const pts: number[] = [x, y];
    for (let s = 0; s < steps; s++) {
      const angle = field(x * freq, y * freq) * Math.PI * 2 + gaussian(rand) * turn;
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      if (x < 0 || x > 1 || y < 0 || y > 1) break;
      pts.push(x, y);
    }
    if (pts.length >= 8) paths.push(Float32Array.from(pts));
  }
  const trace = paths.reduce((best, p) => (p.length > best.length ? p : best), paths[0] ?? new Float32Array());
  return { kind: "paths", paths, trace, detail: `${paths.length} particles, field frequency ${freq.toFixed(1)}` };
}

// ── Drift ─────────────────────────────────────────────────────────────
// Persistent random walkers with Pareto-distributed step lengths (a Lévy
// flight). Chaos lowers the tail exponent: more long flights, looser turns.

function drift({ seed, chaos, density }: ChaosParams): ChaosResult {
  const rand = rng(seed);
  const walkers = Math.round(36 * density);
  const steps = 520;
  const alpha = 2.4 - chaos * 1.3;
  const base = 0.0028;
  const paths: Float32Array[] = [];
  for (let w = 0; w < walkers; w++) {
    let x = 0.5 + gaussian(rand) * 0.12, y = 0.5 + gaussian(rand) * 0.12;
    let heading = rand() * Math.PI * 2;
    const pts = new Float32Array((steps + 1) * 2);
    pts[0] = x; pts[1] = y;
    for (let s = 1; s <= steps; s++) {
      heading += gaussian(rand) * (0.25 + chaos * 0.9);
      const len = Math.min(base * Math.pow(Math.max(rand(), 1e-6), -1 / alpha), 0.18);
      x += Math.cos(heading) * len;
      y += Math.sin(heading) * len;
      // Reflect at the edges so the field stays inhabited.
      if (x < 0 || x > 1) { x = Math.min(1, Math.max(0, x)); heading = Math.PI - heading; }
      if (y < 0 || y > 1) { y = Math.min(1, Math.max(0, y)); heading = -heading; }
      pts[s * 2] = x; pts[s * 2 + 1] = y;
    }
    paths.push(pts);
  }
  return { kind: "paths", paths, trace: paths[Math.floor(rand() * paths.length)], detail: `${walkers} walkers, tail exponent ${alpha.toFixed(2)}` };
}

export function generateChaos(p: ChaosParams): ChaosResult {
  if (p.system === "attractor") return attractor(p);
  if (p.system === "flow") return flow(p);
  return drift(p);
}
