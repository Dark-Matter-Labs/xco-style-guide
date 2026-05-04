// Seeded linear congruential generator — same seed + props = same render
// on server and client. Critical for SVG hydration stability.
export function seededLCG(seed: number): () => number {
  let s = (seed | 0) >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

// Jittered points along a straight segment.
// Start and end are exact; intermediate points carry perpendicular noise.
export function jitteredPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  amplitude: number,
  segments: number,
  rand: () => number,
): Array<[number, number]> {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const px = len > 0 ? -dy / len : 0;
  const py = len > 0 ? dx / len : 0;

  const pts: Array<[number, number]> = [[x1, y1]];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const offset = (rand() * 2 - 1) * amplitude;
    pts.push([x1 + dx * t + px * offset, y1 + dy * t + py * offset]);
  }
  pts.push([x2, y2]);
  return pts;
}

export function pointsToPath(
  pts: Array<[number, number]>,
  close = false,
): string {
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  return close ? d + " Z" : d;
}

// Segments proportional to length — short lines get fewer.
export function segmentsForLength(len: number): number {
  return Math.max(4, Math.min(14, Math.round(len / 18)));
}

// Jittered closed rectangle path, centered on (cx, cy).
// Each edge has independent jitter seeded sequentially.
export function jitteredRectPath(
  cx: number,
  cy: number,
  w: number,
  h: number,
  amplitude: number,
  seed: number,
): string {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const rand = seededLCG(seed);
  const sh = segmentsForLength(w);
  const sv = segmentsForLength(h);

  const top = jitteredPoints(x, y, x + w, y, amplitude, sh, rand);
  const right = jitteredPoints(x + w, y, x + w, y + h, amplitude, sv, rand);
  const bot = jitteredPoints(x + w, y + h, x, y + h, amplitude, sh, rand);
  const left = jitteredPoints(x, y + h, x, y, amplitude, sv, rand);

  return pointsToPath(
    [...top, ...right.slice(1), ...bot.slice(1), ...left.slice(1)],
    true,
  );
}

// Jittered open line path.
export function jitteredLinePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  amplitude: number,
  seed: number,
): string {
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const rand = seededLCG(seed);
  return pointsToPath(
    jitteredPoints(x1, y1, x2, y2, amplitude, segmentsForLength(len), rand),
  );
}
