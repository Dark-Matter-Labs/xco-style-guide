import { drawAscii } from "./ascii";
import { drawGlobe } from "./globe";
import type { Assets, ImageryId, Rect } from "./types";

type Ctx = CanvasRenderingContext2D;

// What fills a template's image slot. Every template describes its slot the
// same way — a centre, a diameter, and the area it may fill — so any imagery
// works in any template: the globe sits on the slot's circle, and the ASCII
// fields fill its area with the storm's eye (or the beacons) on that centre.

export interface ImageSlot {
  cx: number;
  cy: number;
  diameter: number;
  /** The rectangle a field may fill — the window, or the whole card. */
  area: Rect;
  /** Glyphs and squares, in the colour of the surface they sit on. */
  color: string;
  /** The one accent, for the collapse's beacons. */
  accent: string;
  /** Card unit: 1 at a 1000px short side. */
  u: number;
}

export const imageryList: { id: ImageryId; label: string; hint: string }[] = [
  { id: "globe",       label: "Globe",       hint: "Photograph and halftone squares, the seam sweeping" },
  { id: "ascii-globe", label: "ASCII globe", hint: "The same globe, its halftone set in glyphs" },
  { id: "storm",       label: "Storm",       hint: "Rain-bands turning round a calm eye — from the optionality site" },
  { id: "collapse",    label: "Collapse",    hint: "Turbulent glyph noise, three dusk beacons of hope" },
  { id: "lattice",     label: "Lattice",     hint: "The arrival: an ordered, twinkling lattice" },
];

export function drawImagery(
  ctx: Ctx,
  imagery: ImageryId,
  slot: ImageSlot,
  phase: number,
  seed: number,
  assets: Assets,
): void {
  if (imagery === "globe" || imagery === "ascii-globe") {
    drawGlobe(ctx, {
      cx: slot.cx,
      cy: slot.cy,
      diameter: slot.diameter,
      phase,
      color: slot.color,
      photo: assets.photo,
      mode: imagery === "ascii-globe" ? "glyphs" : "squares",
      font: assets.fonts.sans,
    });
    return;
  }
  drawAscii(ctx, slot.area, {
    mode: imagery,
    cx: slot.cx,
    cy: slot.cy,
    radius: slot.diameter / 2,
    // The site's 20px cell, at card scale.
    cell: Math.max(12, Math.round(20 * slot.u)),
    color: slot.color,
    beacon: slot.accent,
    font: assets.fonts.sans,
    phase,
    seed,
  });
}
