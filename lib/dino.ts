// Dino, d.INO's guide: the logo's x at rest in d.INO products (CH-09). Built only from the x's own geometry.
// The products compute the same shape (ino-home public/dino.js, wiki-voice Dino.swift / Dino.kt) and pin it with
// shared examples; this is the hello pose, for the construction figure on /logo/x.

import { xPaths } from "@/lib/logo";

type Pt = { x: number; y: number };

export const DINO_BOX = { width: 190, height: 160 };
export const DINO_CROSSING: Pt = { x: 62, y: 104 };
/** Each arm as a multiple of the logo x's half-arm. The neck ends in a 22-unit horizontal head. */
export const DINO_ARMS = { neck: 2.3, tail: 0.95, front: 1.35, back: 1.35 } as const;
const HEAD = 22;
const HEART = 12 / 56; // the heart is the logo x at 12 units wide

export function dinoFigure() {
  const [first] = xPaths();
  const [a, b] = Array.from(first.matchAll(/[ML]\s*(-?[\d.]+)\s+(-?[\d.]+)/g), (m) => ({ x: Number(m[1]), y: Number(m[2]) }));
  const half = { x: (b.x - a.x) / 2, y: (b.y - a.y) / 2 };
  const c = DINO_CROSSING;
  const at = (sx: number, sy: number, k: number): Pt => ({ x: c.x + sx * half.x * k, y: c.y + sy * half.y * k });
  const neckEnd = at(1, -1, DINO_ARMS.neck);
  return {
    arms: {
      neck: [c, neckEnd, { x: neckEnd.x + HEAD, y: neckEnd.y }],
      tail: [c, at(-1, -1, DINO_ARMS.tail)],
      front: [c, at(1, 1, DINO_ARMS.front)],
      back: [c, at(-1, 1, DINO_ARMS.back)],
    },
    heartHalf: { x: half.x * HEART, y: half.y * HEART },
  };
}
