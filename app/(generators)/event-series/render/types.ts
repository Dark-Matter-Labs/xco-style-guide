import type { CardFormat } from "@/lib/event-series/formats";
import type { EventContent } from "@/lib/event-series/programme";

export type TemplateId = "window" | "corner" | "globe";
export type PaletteId = "dusk" | "paper" | "ink";
export type TitleFace = "xco" | "medulla";
export type ImageryId = "globe" | "ascii-globe" | "storm" | "collapse" | "lattice";

export interface CardSpec {
  template: TemplateId;
  palette: PaletteId;
  /** What fills the image slot — the globe, or one of the ASCII fields. */
  imagery: ImageryId;
  format: CardFormat;
  content: EventContent;
  titleFace: TitleFace;
  uppercase: boolean;
  /** Varies the generative field, so each evening can have its own. */
  seed: number;
}

/** Resolved CSS font-family strings, ready for ctx.font. */
export interface Fonts {
  serif: string;
  sans: string;
  mono: string;
  instrument: string;
}

export interface Assets {
  fonts: Fonts;
  /** The globe's photographic half. Null until loaded — the halftone draws alone. */
  photo: HTMLImageElement | null;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
