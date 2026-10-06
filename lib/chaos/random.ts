// Seeded randomness for the chaos generators: a uniform source, a normal
// variate, and smooth 2D noise. The same seed always gives the same numbers,
// so a pattern can be named by its seed and regenerated exactly.

export { rng } from "@/lib/growth/differential-line";

/** Standard normal variate (Box–Muller) from a uniform source. */
export function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Seeded 2D value noise with smoothstep interpolation, summed over octaves
 * (fBm). Returns roughly [-1, 1]. A 256-entry permutation keeps it periodic
 * far outside the unit square, which the generators never reach.
 */
export function noise2D(rand: () => number, octaves = 3): (x: number, y: number) => number {
  const perm = new Uint8Array(512);
  const values = new Float32Array(256);
  const idx = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = idx[i & 255];
  for (let i = 0; i < 256; i++) values[i] = rand() * 2 - 1;

  const lattice = (ix: number, iy: number) => values[perm[(perm[ix & 255] + iy) & 511] & 255];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const single = (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = smooth(x - ix);
    const fy = smooth(y - iy);
    const a = lattice(ix, iy) + (lattice(ix + 1, iy) - lattice(ix, iy)) * fx;
    const b = lattice(ix, iy + 1) + (lattice(ix + 1, iy + 1) - lattice(ix, iy + 1)) * fx;
    return a + (b - a) * fy;
  };

  return (x, y) => {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += single(x * freq + o * 17.3, y * freq - o * 9.1) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  };
}
