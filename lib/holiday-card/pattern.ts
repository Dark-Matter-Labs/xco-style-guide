// The "You and xCO, 2026" card's generative code, for print.
//
// The animated card (claude.ai artifact HB4ZaJgUoeCTN3Z4BE7nn9) grows a Clifford
// attractor seeded from the recipient's name. The printed card must grow the
// same pattern for the same name, so rng, hash, cliffordParams and the attractor
// trace are ported verbatim — scripts/holiday-card-check.ts holds the originals
// and fails if this port drifts. The places and the network are the card's own
// drawings, seeded per name here so every printed card is unique.

export type Pt = [number, number];

/** The animated card reads the name from the link's #hash with this rule. */
export const CARD_NAME_RULE = /^[A-Za-z-]{1,24}$/;

export const FACTS = [
  { n: 13, line: "options for a world in cascade.", sub: "Four of them already live." },
  { n: 16, line: "places across Europe building their own bioregional finance.", sub: "" },
  { n: 33, line: "interventions in the Power Project’s portfolio,", sub: "joined by 95 links between them." },
] as const;

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

// Array.from(str) splits by code point, exactly as the card's [...str] does.
export const hash = (str: string) => Array.from(str).reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

/** A typed name as the animated card sees it: its #slug, the name it seeds from, and whether the card can show it. */
export function cardName(typed: string): { display: string; slug: string; seedName: string; linkable: boolean } {
  const display = typed.trim().replace(/\s+/g, " ");
  const slug = display.replace(/ /g, "-");
  return { display, slug, seedName: slug.replace(/-/g, " "), linkable: CARD_NAME_RULE.test(slug) };
}

export function noise2D(r: () => number, oct = 3) {
  const perm = new Uint8Array(512), val = new Float32Array(256), idx = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = idx[i & 255];
  for (let i = 0; i < 256; i++) val[i] = r() * 2 - 1;
  const lat = (x: number, y: number) => val[perm[(perm[x & 255] + y) & 511] & 255], sm = (t: number) => t * t * (3 - 2 * t);
  const one = (x: number, y: number) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = sm(x - ix), fy = sm(y - iy);
    const a = lat(ix, iy) + (lat(ix + 1, iy) - lat(ix, iy)) * fx, b = lat(ix, iy + 1) + (lat(ix + 1, iy + 1) - lat(ix, iy + 1)) * fx;
    return a + (b - a) * fy;
  };
  return (x: number, y: number) => {
    let s = 0, a = 1, f = 1, n = 0;
    for (let o = 0; o < oct; o++) { s += one(x * f + o * 17.3, y * f - o * 9.1) * a; n += a; a *= 0.5; f *= 2; }
    return s / n;
  };
}

export function cliffordParams(r: () => number): [number, number, number, number] {
  for (let k = 0; k < 80; k++) {
    const p: [number, number, number, number] = [r() * 4 - 2, r() * 4 - 2, r() * 3 - 1.5, r() * 3 - 1.5];
    const [a, b, c, d] = p, cells = new Set<number>();
    let x = 0.1, y = 0.1;
    for (let i = 0; i < 6000; i++) {
      const nx = Math.sin(a * y) + c * Math.cos(a * x); y = Math.sin(b * x) + d * Math.cos(b * y); x = nx;
      if (i > 100) cells.add(Math.floor((x + 3) * 8) * 64 + Math.floor((y + 3) * 8));
    }
    if (cells.size > 300) return p;
  }
  return [-1.4, 1.6, 1.0, 0.7];
}

export interface Attractor {
  p: [number, number, number, number];
  minX: number; maxX: number; minY: number; maxY: number;
  /** The 140-point ember trace the animated card draws over the pattern. */
  trace: Pt[];
  /** The 13 options, as points on the pattern; the first four are live. */
  marks: Pt[];
}

/** The recipient's attractor, exactly as the animated card's setAttractor builds it. */
export function attractor(seedName: string): Attractor {
  const p = cliffordParams(rng(hash(seedName + "xCO2026")));
  const [a, b, c, d] = p;
  let x = 0.1, y = 0.1, minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  const trace: Pt[] = [], marks: Pt[] = [];
  for (let i = 0; i < 60000; i++) {
    const nx = Math.sin(a * y) + c * Math.cos(a * x); y = Math.sin(b * x) + d * Math.cos(b * y); x = nx;
    if (i > 100) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      if (i > 20000 && i < 20140) trace.push([x, y]);
      if (i > 30000 && (i - 30000) % 2203 === 0 && marks.length < 13) marks.push([x, y]);
    }
  }
  return { p, minX, maxX, minY, maxY, trace, marks };
}

/** Maps attractor space into a w×h box, centred, filling `fill` of the shorter side. */
export function fitter(at: Attractor, w: number, h: number, fill = 0.86) {
  const span = Math.max(at.maxX - at.minX, at.maxY - at.minY), s = (Math.min(w, h) * fill) / span;
  const cx = (at.minX + at.maxX) / 2, cy = (at.minY + at.maxY) / 2;
  return (x: number, y: number): Pt => [w / 2 + (x - cx) * s, h / 2 + (y - cy) * s];
}

/** Hit counts of the attractor on a w×h grid, and the largest count. */
export function density(at: Attractor, w: number, h: number, iterations: number, fill = 0.86) {
  const [a, b, c, d] = at.p, map = fitter(at, w, h, fill), counts = new Uint32Array(w * h);
  let x = 0.1, y = 0.1, max = 1;
  for (let i = 0; i < iterations; i++) {
    const nx = Math.sin(a * y) + c * Math.cos(a * x); y = Math.sin(b * x) + d * Math.cos(b * y); x = nx;
    const [px, py] = map(x, y), ix = px | 0, iy = py | 0;
    if (ix < 0 || iy < 0 || ix >= w || iy >= h) continue;
    const v = ++counts[iy * w + ix];
    if (v > max) max = v;
  }
  return { counts, max };
}

/** Tone 0..1 for a hit count, as the animated card paints its field. */
export const tone = (count: number, max: number) => (count ? Math.min(1, Math.pow(Math.log1p(count) / Math.log1p(max), 0.7) * 1.15) : 0);

/** Sixteen places in a unit box, each with a radius and its own wobble, seeded by name. */
export function places(seedName: string) {
  const r = rng(hash(seedName + "places")), out: { x: number; y: number; r: number; n: (x: number, y: number) => number }[] = [];
  for (let k = 0; k < 16; k++) {
    let p = { x: 0, y: 0 }, tries = 0;
    do { p = { x: 0.1 + r() * 0.8, y: 0.12 + r() * 0.76 }; tries++; }
    while (tries < 200 && out.some((q) => Math.hypot(q.x - p.x, (q.y - p.y) * 1.3) < 0.16));
    out.push({ ...p, r: 0.05 + r() * 0.05, n: noise2D(rng(hash(seedName + "place" + k)), 2) });
  }
  return out;
}

/** Thirty-three interventions in a unit box and exactly 95 links between them, seeded by name. */
export function network(seedName: string) {
  const r = rng(hash(seedName + "links")), nodes: { x: number; y: number }[] = [];
  for (let k = 0; k < 33; k++) {
    let p = { x: 0, y: 0 }, tries = 0;
    do { const a = r() * 6.2832, d = Math.sqrt(r()) * 0.46; p = { x: 0.5 + Math.cos(a) * d, y: 0.5 + Math.sin(a) * d * 0.82 }; tries++; }
    while (tries < 300 && nodes.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 0.08));
    nodes.push(p);
  }
  const links: Pt[] = [], seen = new Set<string>();
  const add = (i: number, j: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (i === j || seen.has(key)) return;
    seen.add(key);
    links.push([i, j]);
  };
  nodes.forEach((p, i) => nodes.map((q, j): Pt => [Math.hypot(p.x - q.x, p.y - q.y), j]).sort((a, b) => a[0] - b[0]).slice(1, 3).forEach(([, j]) => add(i, j)));
  while (links.length < 95) add(Math.floor(r() * 33), Math.floor(r() * 33));
  links.length = 95;
  return { nodes, links };
}
