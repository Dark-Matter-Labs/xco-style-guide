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

// Every image still has a status (Polyphonic Communication Style Guide v6.1,
// §08): the globe starts from a photograph of the Earth and is transformed —
// halftoned, its seam animated; the ASCII fields are generated outright. Cards
// no longer draw it on the poster; it stays in the alt text.
export type ImageStatus = "transformed" | "generated";

/** The same status in words, for accessible names and alt text. */
export const imageStatusText: Record<ImageStatus, string> = {
  transformed: "Image: a photograph of the Earth, transformed into halftone.",
  generated: "Image: a generated pattern, not a record.",
};

export const imageryList: { id: ImageryId; label: string; hint: string; status: ImageStatus }[] = [
  { id: "globe",       label: "Globe",       hint: "Photograph and halftone squares, the seam sweeping", status: "transformed" },
  { id: "ascii-globe", label: "ASCII globe", hint: "The same globe, its halftone set in glyphs", status: "transformed" },
  { id: "storm",       label: "Storm",       hint: "Rain-bands turning round a calm eye — from the optionality site", status: "generated" },
  { id: "collapse",    label: "Collapse",    hint: "Turbulent glyph noise, three dusk beacons of hope", status: "generated" },
  { id: "lattice",     label: "Lattice",     hint: "The arrival: an ordered, twinkling lattice", status: "generated" },
  { id: "line",        label: "Line",        hint: "Listening: one trace — jagged, then a ridge, then a slow swell", status: "generated" },
  { id: "ripples",     label: "Ripples",     hint: "Listening: rings of sound leaving the centre", status: "generated" },
  { id: "ridges",      label: "Ridges",      hint: "Listening: receding mountain ridgelines, drifting", status: "generated" },
];

export function statusOf(imagery: ImageryId): ImageStatus {
  return imageryList.find((i) => i.id === imagery)?.status ?? "generated";
}

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
