import type { ReactNode, Ref } from "react";
import type { TimePrintProp } from "@/lib/asemic/time-print";

/** One view of the Three Regimes instrument: its own controls and drawing; the shell owns format, minute and export. */
export interface View {
  controls: ReactNode;
  /** The words the time print grows from, or null where the view carries none (Territory). */
  words: string | null;
  formats: { id: string; label: string; hint: string; w: number; h: number }[];
  /** The artwork at a format; the shell passes a ref for its hidden export copy. */
  draw: (format: string, timePrint: TimePrintProp | null, ref?: Ref<SVGSVGElement>) => ReactNode;
  /** File name stem for the export. */
  file: string;
  /** The line under the preview. */
  caption: (format: string) => string;
  /** The preview's ground, so the frame matches the artwork while it draws. */
  ground: string;
}

export const HERO = { id: "hero", label: "Hero", hint: "1200 × 630", w: 1200, h: 630 };
export const SQUARE = { id: "square", label: "Square", hint: "1200 × 1200", w: 1200, h: 1200 };
export const MARK_FORMAT = { id: "mark", label: "Mark", hint: "400 × 200, no labels and no time print", w: 400, h: 200 };
