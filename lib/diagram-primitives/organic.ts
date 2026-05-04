import { seededLCG } from "./jitter";

// Organic blob path using N control points around an ellipse,
// perturbed by irregularity and joined with Catmull-Rom Bézier curves.
export function organicBlobPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  irregularity: number, // 0 = perfect ellipse, 0.25 = natural, 0.45 = rough
  seed: number,
): string {
  const rand = seededLCG(seed);
  const N = 12;
  const pts: [number, number][] = [];

  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    const rr = 1 + (rand() * 2 - 1) * irregularity;
    pts.push([
      cx + Math.cos(angle) * rx * rr,
      cy + Math.sin(angle) * ry * rr,
    ]);
  }

  // Catmull-Rom → cubic Bézier
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % N];
    const p3 = pts[(i + 2) % N];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + " Z";
}

// Two parallel flowing curves from (x1,y1) to (x2,y2).
// Returns [primaryPath, secondaryPath] as SVG "d" strings.
// Goes straight down first (root-like), then curves toward target.
export function flowPaths(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  spread: number = 6, // perpendicular offset between the two strands
): [string, string] {
  const dropFrac = 0.55; // how far straight-down before curving
  const dy = y2 - y1;
  const dropY = y1 + dy * dropFrac;

  const path = (ox: number) =>
    `M ${(x1 + ox).toFixed(1)},${y1.toFixed(1)} ` +
    `C ${(x1 + ox).toFixed(1)},${dropY.toFixed(1)} ` +
    `${(x2 + ox * 0.4).toFixed(1)},${(y2 - dy * 0.12).toFixed(1)} ` +
    `${(x2 + ox * 0.3).toFixed(1)},${y2.toFixed(1)}`;

  return [path(-spread / 2), path(spread / 2)];
}
