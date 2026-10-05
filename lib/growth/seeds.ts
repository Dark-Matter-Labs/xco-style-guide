// Starting lines for differential growth, in the unit square.
//
// The aperture seed is the brand's own: the C of the logotype at its 100°
// opening, rotatable in the group marks' 45° steps — so a growth can be
// grown from the same mark a Signal group carries.

import { logoGeometry } from "@/lib/logo";
import { rng } from "./differential-line";

export type SeedShape = "circle" | "aperture" | "line" | "wave";

export interface SeedSpec {
  shape: SeedShape;
  /** Aperture rotation in degrees, for the aperture seed (0 = opening right). */
  rotation: number;
  seed: number;
}

export interface SeedLine {
  points: [number, number][];
  closed: boolean;
}

const TAU = Math.PI * 2;

export const seedShapes: { id: SeedShape; label: string; hint: string }[] = [
  { id: "circle", label: "Circle", hint: "A closed ring — grows into a field that fills its disc" },
  { id: "aperture", label: "Aperture", hint: "The logo's C, its opening kept — the brand's own seed" },
  { id: "line", label: "Line", hint: "An open stroke — grows into a band" },
  { id: "wave", label: "Wave", hint: "An open, gently curved stroke — grows into a meander" },
];

export function seedLine({ shape, rotation, seed }: SeedSpec): SeedLine {
  const rand = rng(seed ^ 0x9e3779b9);
  switch (shape) {
    case "circle": {
      // As in the original: forty nodes at sorted random angles, so the first
      // instabilities differ with the seed.
      const angles = Array.from({ length: 40 }, () => rand() * TAU).sort((a, b) => a - b);
      return { points: angles.map((t) => [0.5 + 0.03 * Math.cos(t), 0.5 + 0.03 * Math.sin(t)]), closed: true };
    }
    case "aperture": {
      const half = ((logoGeometry.aperture / 2) * Math.PI) / 180;
      const rot = (rotation * Math.PI) / 180;
      const n = 120;
      const points: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        const t = half + ((TAU - 2 * half) * i) / (n - 1) + rot;
        // A whisper of noise so two seeds of the same mark grow differently.
        const r = 0.12 + (rand() - 0.5) * 0.002;
        points.push([0.5 + r * Math.cos(t), 0.5 - r * Math.sin(t)]);
      }
      return { points, closed: false };
    }
    case "line": {
      const n = 80;
      return {
        points: Array.from({ length: n }, (_, i) => [0.3 + (0.4 * i) / (n - 1), 0.5 + (rand() - 0.5) * 0.002] as [number, number]),
        closed: false,
      };
    }
    case "wave": {
      const n = 100;
      const phase = rand() * TAU;
      return {
        points: Array.from({ length: n }, (_, i) => {
          const u = i / (n - 1);
          return [0.25 + 0.5 * u, 0.5 + 0.04 * Math.sin(phase + u * TAU * 1.5)] as [number, number];
        }),
        closed: false,
      };
    }
  }
}
