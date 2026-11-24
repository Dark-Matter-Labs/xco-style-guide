// Seeded randomness and string hashes, in one place. The same seed always
// gives the same numbers, so a pattern can be named by its seed and made again.
//
// The LCG, the FNV-1a hash, noise2D and cliffordParams live in the holiday
// card's port (lib/holiday-card/pattern.ts) and are re-exported from there:
// card:check holds the animated card's originals and fails if they drift.

export {
  rng as lcg,
  hash as fnv1a,
  noise2D,
  cliffordParams,
} from "@/lib/holiday-card/pattern";

/** mulberry32: small, fast and deterministic across engines. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * FNV-1a over whole code points. fnv1a (the card's) hashes the first UTF-16
 * unit of each code point, so the two differ only past U+FFFF (emoji, say);
 * Notion seeds use this one so a page named with an emoji keeps its seed.
 */
export function fnv1aCodePoints(text: string): number {
  let h = 0x811c9dc5;
  for (const ch of text) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Standard normal variate (Box–Muller) from a uniform source. */
export function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

