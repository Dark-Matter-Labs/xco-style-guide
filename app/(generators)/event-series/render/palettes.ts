import { paletteHex } from "@/lib/design-tokens";
import type { PaletteId } from "./types";

// Three registers, all from the xCO tokens. Medulla's own colours stay out:
// its presence is the mark, not the palette.
//
//   ground    the full-bleed background the field shimmers on
//   field     the generative squares on the ground
//   panel     the window / band the event text sits in
//   onPanel   text and marks on the panel
//   onGround  text and marks on the ground
//   accent*   the bracketed kicker, per surface — it must never match what it sits on

export interface Palette {
  id: PaletteId;
  label: string;
  ground: string;
  field: string;
  fieldAlpha: number;
  panel: string;
  onPanel: string;
  onGround: string;
  accentOnPanel: string;
  accentOnGround: string;
  /** Whether the ground / panel are light — light surfaces ring the Medulla disc. */
  groundIsLight: boolean;
  panelIsLight: boolean;
}

const { paper, ink, dusk, sand } = paletteHex;

export const palettes: Record<PaletteId, Palette> = {
  dusk: {
    id: "dusk",
    label: "Dusk",
    ground: dusk,
    field: sand,
    fieldAlpha: 0.9,
    panel: ink,
    onPanel: paper,
    onGround: ink,
    accentOnPanel: sand,
    accentOnGround: ink,
    groundIsLight: false,
    panelIsLight: false,
  },
  paper: {
    id: "paper",
    label: "Paper",
    ground: paper,
    field: ink,
    fieldAlpha: 0.1,
    panel: ink,
    onPanel: paper,
    onGround: ink,
    accentOnPanel: sand,
    accentOnGround: dusk,
    groundIsLight: true,
    panelIsLight: false,
  },
  ink: {
    id: "ink",
    label: "Ink",
    ground: ink,
    field: dusk,
    fieldAlpha: 0.55,
    panel: dusk,
    onPanel: ink,
    onGround: paper,
    accentOnPanel: ink,
    accentOnGround: dusk,
    groundIsLight: false,
    panelIsLight: false,
  },
};

export const paletteList = Object.values(palettes);
