// The tritone source, from the old Align instrument: an outside image (an AI
// output, a diagram, a moodboard) mapped onto three xCO palette stops by its
// luminance, with an optional highlight raster and grain, plus the style
// prompt that asks an image generator for the same look.

import { paletteHex } from "@/lib/design-tokens";
import { addGrain, clamp, getImageData, sampleLum } from "./pixels";
import type { CellShape } from "./ImageTreatmentDiagram";

const { ink: INK, paper: PAPER, navy: NAVY, ocean: OCEAN, teal: TEAL, sand: SAND, dusk: DUSK, inkMuted: MUTED } = paletteHex;

export type TritonePreset = "blueprint" | "ember" | "horizon" | "dusk" | "ink";

interface ColorStop { shadow: string; mid: string; highlight: string }

export const TRITONE_PRESETS: Record<TritonePreset, ColorStop & { label: string; hint: string }> = {
  blueprint: { label: "Blueprint", hint: "navy → ocean → paper", shadow: NAVY,  mid: OCEAN, highlight: PAPER },
  ember:     { label: "Ember",     hint: "ink → dusk → sand",   shadow: INK,   mid: DUSK,  highlight: SAND  },
  horizon:   { label: "Horizon",   hint: "navy → teal → sand",  shadow: NAVY,  mid: TEAL,  highlight: SAND  },
  dusk:      { label: "Dusk",      hint: "navy → dusk → paper", shadow: NAVY,  mid: DUSK,  highlight: PAPER },
  ink:       { label: "Ink",       hint: "ink → muted → paper", shadow: INK,   mid: MUTED, highlight: PAPER },
};

// ── Style prompt ───────────────────────────────────────────────────────────
const PRESET_MOOD: Record<TritonePreset, string> = {
  blueprint: "cold, institutional, technical — the feeling of infrastructure blueprints, deep-ocean charts, systems under pressure",
  ember:     "warm tension — industrial heat, concentrated force, ember before flame",
  horizon:   "liminal, expansive — the feeling of dusk over open terrain, transition between states",
  dusk:      "atmospheric, in-between — neither day nor night, neither resolved nor open",
  ink:       "stark, archival, definitive — print heritage, typographic authority, no colour sentimentality",
};

export function buildStylePrompt(preset: TritonePreset, midpoint: number): string {
  const { shadow, mid: midColor, highlight, label } = TRITONE_PRESETS[preset];
  const mood = PRESET_MOOD[preset];
  const toneDesc =
    midpoint < 0.3 ? "heavy shadow masses, sparse highlights — image reads very dark"
    : midpoint < 0.5 ? "balanced tonal range — dark and light in dialogue"
    : "luminous, highlight-dominant — structural elements emerge from brightness";

  return `xCO Visual Identity — image generation prompt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PALETTE — ${label} preset (tritone, three colors only)
  Shadow    ${shadow}
  Midtone   ${midColor}
  Highlight ${highlight}

Use ONLY these three hex values. Strip all photographic color.
Map luminance to palette: shadows → ${shadow}, midtones → ${midColor}, bright areas → ${highlight}.
Tonal balance: ${toneDesc}.

MOOD
${mood}

AESTHETIC
Austere, structural, serious. Civilizational in scale — the feeling of deep systems,
long time horizons, infrastructure, ecological forces. Hard geometric forms preferred.
No organic decoration, no lifestyle warmth, no visual clutter. Strong figure-ground
contrast. Deliberate negative space. Elements placed with intention, not filled in.
If the subject is photorealistic, treat it as if passed through a tritone duotone
process — all photographic hue removed, replaced with the three palette stops above.

TYPOGRAPHY (if text appears in the image)
  Display / headlines    Untitled Serif — serif, regular
  Data / labels          Untitled Sans — regular, never a monospace
  Body / longer text     Untitled Sans — sans-serif, regular
  No decorative typefaces. Text is sparse, precise, left-aligned.

COMPOSITION
Clean. Architectural. Asymmetric without being chaotic. If there is a subject,
let it breathe — wide margins, unforced placement. Diagrams and abstract structures
are as valid as photographic subjects.`;
}

// ── Tritone mapping ────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Maps each pixel's luminance through three colour stops:
//   [0 → midpoint] → lerp(shadow, mid)
//   [midpoint → 1] → lerp(mid, highlight)
function applyTritone(imgData: ImageData, { shadow, mid, highlight }: ColorStop, midpoint: number): ImageData {
  const [sr, sg, sb] = hexToRgb(shadow);
  const [mr, mg, mb] = hexToRgb(mid);
  const [hr, hg, hb] = hexToRgb(highlight);
  const out = new ImageData(imgData.width, imgData.height);
  const src = imgData.data, dst = out.data;
  const mp = clamp(midpoint, 0.01, 0.99);

  for (let i = 0; i < src.length; i += 4) {
    const lum = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
    let r, g, b;
    if (lum < mp) {
      const t = lum / mp;
      r = Math.round(sr + (mr - sr) * t);
      g = Math.round(sg + (mg - sg) * t);
      b = Math.round(sb + (mb - sb) * t);
    } else {
      const t = (lum - mp) / (1 - mp);
      r = Math.round(mr + (hr - mr) * t);
      g = Math.round(mg + (hg - mg) * t);
      b = Math.round(mb + (hb - mb) * t);
    }
    dst[i] = r; dst[i + 1] = g; dst[i + 2] = b; dst[i + 3] = 255;
  }
  return out;
}

/** The highlight raster's cells: sized by brightness, so the bright, structural parts carry the texture. */
function highlightCells(data: Uint8ClampedArray, vw: number, vh: number, spacing: number, cellShape: CellShape) {
  const maxSz = spacing * 0.9;
  const cells: { x: number; y: number; w: number; h: number }[] = [];
  for (let cy = spacing / 2; cy < vh; cy += spacing) {
    for (let cx = spacing / 2; cx < vw; cx += spacing) {
      const lum = sampleLum(data, cx, cy, vw, vh);
      if (lum < 0.06) continue;
      const w = cellShape === "hbars" ? spacing : maxSz * lum;
      const h = cellShape === "vbars" ? spacing : maxSz * lum;
      cells.push({ x: cx - w / 2, y: cy - h / 2, w, h });
    }
  }
  return cells;
}

export interface TritoneOptions {
  preset: TritonePreset;
  midpoint: number;
  /** The highlight raster's grid in px, or null for none. */
  raster: number | null;
  cellShape: CellShape;
  grain: boolean;
}

export function drawTritone(ctx: CanvasRenderingContext2D, img: HTMLImageElement, vw: number, vh: number, o: TritoneOptions) {
  const stops = TRITONE_PRESETS[o.preset];
  const raw = getImageData(img, vw, vh);
  ctx.putImageData(applyTritone(raw, stops, o.midpoint), 0, 0);
  if (o.raster) {
    ctx.fillStyle = stops.highlight;
    for (const c of highlightCells(raw.data, vw, vh, o.raster, o.cellShape)) ctx.fillRect(c.x, c.y, c.w, c.h);
  }
  if (o.grain) addGrain(ctx, vw, vh, 25);
}

/** The tritone as SVG: the mapped image embedded as JPEG, the highlight raster as vector cells over it. */
export function tritoneSVG(img: HTMLImageElement, vw: number, vh: number, o: TritoneOptions): string {
  const stops = TRITONE_PRESETS[o.preset];
  const raw = getImageData(img, vw, vh);
  const c = document.createElement("canvas");
  c.width = vw; c.height = vh;
  c.getContext("2d")!.putImageData(applyTritone(raw, stops, o.midpoint), 0, 0);
  const cells = o.raster
    ? highlightCells(raw.data, vw, vh, o.raster, o.cellShape)
        .map((r) => `<rect x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w.toFixed(1)}" height="${r.h.toFixed(1)}" fill="${stops.highlight}"/>`)
        .join("")
    : "";
  return `<?xml version="1.0" standalone="no"?><svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg"><rect width="${vw}" height="${vh}" fill="${stops.shadow}"/><image href="${c.toDataURL("image/jpeg", 0.88)}" x="0" y="0" width="${vw}" height="${vh}"/>${cells}</svg>`;
}
