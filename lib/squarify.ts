// Bruls, Huizing, van Wijk (1999) squarify algorithm.
// Pure utility — no React, safe to call at render time from any SVG component.

export interface SquarifyInput {
  label:     string;
  sublabel?: string;
  weight:    number;
}

export interface SquarifyRect extends SquarifyInput {
  x: number; y: number; w: number; h: number;
  rank: number;
}

function worstRatio(areas: number[], shortEdge: number): number {
  if (areas.length === 0) return Infinity;
  const s  = areas.reduce((a, b) => a + b, 0);
  const hi = Math.max(...areas);
  const lo = Math.min(...areas);
  return Math.max(
    (shortEdge * shortEdge * hi) / (s * s),
    (s * s) / (shortEdge * shortEdge * lo),
  );
}

export function squarify(items: SquarifyInput[], vw: number, vh: number): SquarifyRect[] {
  const valid = items
    .filter(i => i.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  if (valid.length === 0) return [];

  const totalW = valid.reduce((s, i) => s + i.weight, 0);
  const totalA = vw * vh;
  const nodes  = valid.map((item, rank) => ({
    ...item,
    rank,
    area: (item.weight / totalW) * totalA,
  }));

  const rects: SquarifyRect[] = [];

  function fixRow(
    row: typeof nodes,
    rx: number, ry: number, rw: number, rh: number,
  ): [number, number, number, number] {
    const rowSum = row.reduce((s, n) => s + n.area, 0);
    if (rw >= rh) {
      const stripW = rowSum / rh;
      let cy = ry;
      for (const n of row) {
        const cellH = n.area / stripW;
        rects.push({ ...n, x: rx, y: cy, w: stripW, h: cellH });
        cy += cellH;
      }
      return [rx + stripW, ry, rw - stripW, rh];
    } else {
      const stripH = rowSum / rw;
      let cx = rx;
      for (const n of row) {
        const cellW = n.area / stripH;
        rects.push({ ...n, x: cx, y: ry, w: cellW, h: stripH });
        cx += cellW;
      }
      return [rx, ry + stripH, rw, rh - stripH];
    }
  }

  function layout(
    remaining: typeof nodes,
    row:       typeof nodes,
    rx: number, ry: number, rw: number, rh: number,
  ) {
    if (rw < 1 || rh < 1) return;
    if (remaining.length === 0) {
      if (row.length > 0) fixRow(row, rx, ry, rw, rh);
      return;
    }
    const c       = remaining[0];
    const edge    = Math.min(rw, rh);
    const nextRow = [...row, c];

    if (
      row.length === 0 ||
      worstRatio(nextRow.map(n => n.area), edge) <=
      worstRatio(row.map(n => n.area), edge)
    ) {
      layout(remaining.slice(1), nextRow, rx, ry, rw, rh);
    } else {
      const [nx, ny, nw, nh] = fixRow(row, rx, ry, rw, rh);
      layout(remaining, [], nx, ny, nw, nh);
    }
  }

  layout(nodes, [], 0, 0, vw, vh);
  return rects;
}
