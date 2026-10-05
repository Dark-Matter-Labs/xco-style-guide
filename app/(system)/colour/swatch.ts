import type { CSSProperties } from "react";
import { colors } from "@/lib/design-tokens";
import { bestOn, contrastRatio, WCAG } from "@/lib/a11y/contrast";

export const PAPER_HEX = colors.paper.hex;
export const INK_HEX = colors.ink.hex;

// Pick whichever of ink or paper actually contrasts better against the swatch
// — measured with the system's one contrast implementation, not estimated.
export const onSwatch = (hex: string): string => bestOn(hex, PAPER_HEX, INK_HEX);

// A text label on a swatch. Mid-tones clear 4.5:1 with neither ink nor
// paper, so their label sits on a paper chip instead of being shown too
// faint to read.
export function swatchLabel(hex: string): CSSProperties {
  const best = onSwatch(hex);
  return contrastRatio(best, hex) >= WCAG.text
    ? { color: best }
    : { color: INK_HEX, background: PAPER_HEX, padding: "0 4px", alignSelf: "flex-start" };
}
