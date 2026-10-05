// Differential growth — a line that grows by local rules and never crosses itself.
//
// A TypeScript port of the algorithm in inconvergent/differential-line by
// Anders Hoff (MIT, © 2015; see licenses/differential-line.LICENSE), itself
// after Nervous System's Floraform. The rules, as in the original:
//
//   1. Every node is pulled toward its two neighbours along the line once
//      they are further apart than NEAR.
//   2. Every node is pushed away from every other node within FAR — in
//      proportion to how far inside FAR the other node is.
//   3. Edges are split, at random or where the line bends most, so the line
//      lengthens and has to fold to fit.
//
// Units are the original's: a unit square, so the parameters carry over
// (step 0.0004, near 0.002, far ≈ 0.01–0.04). Rendering scales up.
//
// Changes from the original: deterministic, seeded randomness (a brand asset
// has to be reproducible from its seed); the line is stored in order, so a
// split is an insertion rather than a graph edit; open lines are supported as
// well as closed ones; growth stops at a margin rather than the unit edge.

export interface GrowthParams {
  /** Movement per step. */
  step: number;
  /** Linked neighbours closer than this are not pulled together; edges shorter than this are not split. */
  near: number;
  /** Radius of repulsion between unlinked nodes. Sets the spacing between folds. */
  far: number;
  /** Chance an edge splits on a step. */
  spawnRate: number;
  /** Split anywhere at random, or prefer edges where the line bends. */
  spawn: "random" | "curvature";
  /** Stop when the line has this many nodes. */
  maxNodes: number;
  /** Stop when a node comes this close to the unit square's edge. */
  margin: number;
}

export const defaultGrowth: GrowthParams = {
  step: 0.0004,
  near: 0.002,
  far: 0.02,
  spawnRate: 0.02,
  spawn: "curvature",
  maxNodes: 8000,
  margin: 0.03,
};

/** mulberry32 — small and deterministic across engines. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface LineState {
  x: Float64Array;
  y: Float64Array;
  n: number;
  closed: boolean;
  steps: number;
  /** Why growth stopped, or null while it can continue. */
  stopped: null | "boundary" | "max-nodes";
}

export function makeLine(points: [number, number][], closed: boolean): LineState {
  const n = points.length;
  const x = new Float64Array(Math.max(16, n * 2));
  const y = new Float64Array(x.length);
  points.forEach(([px, py], i) => {
    x[i] = px;
    y[i] = py;
  });
  return { x, y, n, closed, steps: 0, stopped: null };
}

// ── One step ─────────────────────────────────────────────────────────

/** Uniform grid with cell = far, so a node's repellers are in its 3×3 block. */
function buildGrid(s: LineState, cell: number) {
  const cols = Math.ceil(1 / cell) + 1;
  const head = new Int32Array(cols * cols).fill(-1);
  const nextInCell = new Int32Array(s.n);
  for (let i = 0; i < s.n; i++) {
    const cx = Math.min(cols - 1, Math.max(0, Math.floor(s.x[i] / cell)));
    const cy = Math.min(cols - 1, Math.max(0, Math.floor(s.y[i] / cell)));
    const k = cy * cols + cx;
    nextInCell[i] = head[k];
    head[k] = i;
  }
  return { cols, head, nextInCell };
}

function optimise(s: LineState, p: GrowthParams): void {
  const { n } = s;
  const grid = buildGrid(s, p.far);
  const sx = new Float64Array(n);
  const sy = new Float64Array(n);

  for (let v = 0; v < n; v++) {
    const prev = v > 0 ? v - 1 : s.closed ? n - 1 : -1;
    const next = v < n - 1 ? v + 1 : s.closed ? 0 : -1;
    const xv = s.x[v], yv = s.y[v];
    let rx = 0, ry = 0;

    // Rule 1 — linked neighbours attract beyond `near`.
    for (const nb of [prev, next]) {
      if (nb < 0) continue;
      const dx = xv - s.x[nb], dy = yv - s.y[nb];
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < p.near || d <= 0) continue;
      rx += (-dx / d) * p.step;
      ry += (-dy / d) * p.step;
    }

    // Rule 2 — unlinked nodes within `far` repel.
    const cx = Math.floor(xv / p.far), cy = Math.floor(yv / p.far);
    for (let gy = cy - 1; gy <= cy + 1; gy++) {
      if (gy < 0 || gy >= grid.cols) continue;
      for (let gx = cx - 1; gx <= cx + 1; gx++) {
        if (gx < 0 || gx >= grid.cols) continue;
        for (let j = grid.head[gy * grid.cols + gx]; j >= 0; j = grid.nextInCell[j]) {
          if (j === v || j === prev || j === next) continue;
          const dx = xv - s.x[j], dy = yv - s.y[j];
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > p.far || d <= 0) continue;
          rx += dx * (p.far / d - 1) * p.step;
          ry += dy * (p.far / d - 1) * p.step;
        }
      }
    }
    sx[v] = rx;
    sy[v] = ry;
  }

  // Applied together, so the result does not depend on iteration order.
  for (let v = 0; v < n; v++) {
    s.x[v] += sx[v];
    s.y[v] += sy[v];
  }
}

/** Turning angle at node i, 0 (straight) to π (folded back). */
function bend(s: LineState, i: number): number {
  const prev = i > 0 ? i - 1 : s.closed ? s.n - 1 : -1;
  const next = i < s.n - 1 ? i + 1 : s.closed ? 0 : -1;
  if (prev < 0 || next < 0) return 0;
  const ax = s.x[i] - s.x[prev], ay = s.y[i] - s.y[prev];
  const bx = s.x[next] - s.x[i], by = s.y[next] - s.y[i];
  const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
  if (!la || !lb) return 0;
  return Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb))));
}

function spawn(s: LineState, p: GrowthParams, rand: () => number): void {
  const edges = s.closed ? s.n : s.n - 1;
  let maxBend = 1e-9;
  const bends = p.spawn === "curvature" ? new Float64Array(s.n) : null;
  if (bends) {
    for (let i = 0; i < s.n; i++) {
      bends[i] = bend(s, i);
      if (bends[i] > maxBend) maxBend = bends[i];
    }
  }

  // Decide the splits first, then rebuild the line once with the midpoints in.
  const split = new Uint8Array(edges);
  let added = 0;
  for (let e = 0; e < edges; e++) {
    if (s.n + added >= p.maxNodes) break;
    const a = e, b = (e + 1) % s.n;
    const len = Math.hypot(s.x[b] - s.x[a], s.y[b] - s.y[a]);
    if (len < p.near) continue;
    const weight = bends ? 0.25 + 0.75 * ((bends[a] + bends[b]) / (2 * maxBend)) : 1;
    if (rand() < p.spawnRate * weight) {
      split[e] = 1;
      added++;
    }
  }
  if (!added) return;

  const n2 = s.n + added;
  if (n2 > s.x.length) {
    const grow = (arr: Float64Array) => {
      const out = new Float64Array(Math.max(n2, arr.length * 2));
      out.set(arr.subarray(0, s.n));
      return out;
    };
    s.x = grow(s.x);
    s.y = grow(s.y);
  }
  const nx = new Float64Array(n2), ny = new Float64Array(n2);
  let k = 0;
  for (let i = 0; i < s.n; i++) {
    nx[k] = s.x[i];
    ny[k] = s.y[i];
    k++;
    if (i < edges && split[i]) {
      const j = (i + 1) % s.n;
      nx[k] = (s.x[i] + s.x[j]) / 2;
      ny[k] = (s.y[i] + s.y[j]) / 2;
      k++;
    }
  }
  s.x.set(nx);
  s.y.set(ny);
  s.n = n2;
}

/** Advance the line by one step. Returns false once growth has stopped. */
export function stepLine(s: LineState, p: GrowthParams, rand: () => number): boolean {
  if (s.stopped) return false;
  optimise(s, p);
  spawn(s, p, rand);
  s.steps++;
  for (let i = 0; i < s.n; i++) {
    if (s.x[i] < p.margin || s.x[i] > 1 - p.margin || s.y[i] < p.margin || s.y[i] > 1 - p.margin) {
      s.stopped = "boundary";
      return false;
    }
  }
  if (s.n >= p.maxNodes) {
    s.stopped = "max-nodes";
    return false;
  }
  return true;
}

/** A copy of the current line as a plain point list — for history rings. */
export function snapshot(s: LineState): Float32Array {
  const out = new Float32Array(s.n * 2);
  for (let i = 0; i < s.n; i++) {
    out[i * 2] = s.x[i];
    out[i * 2 + 1] = s.y[i];
  }
  return out;
}
