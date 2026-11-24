// The Option Field's weight: how much line a point of the field carries, from
// the strengths of the three regimes. Pure; the option field draws it as
// scanlines, image treatment as halftone dots, and the embeds at their size.

/**
 * xRel and yRel run 0–1 across and down (y = 0 is the top). Field grows toward
 * the bottom, Frontier sits upper left, Fortress upper right, and the three
 * meet in the middle. Returns 0.4…maxW.
 */
export function spatialWeight(
  xRel: number,
  yRel: number,
  fieldStr: number,
  frontierStr: number,
  fortressStr: number,
  volatility: number,
  maxW: number,
): number {
  // Field foundation — broad, grows toward bottom (systemic ground)
  const fld = fieldStr * (0.2 + 0.8 * Math.pow(yRel, 0.38)) * maxW * 0.88;

  // Frontier zone — upper-left, lighter/sparse (open optionality)
  const frDist = Math.hypot((xRel - 0.22) * 1.6, yRel - 0.28);
  const fr = frontierStr * Math.max(0, 1 - frDist * 2.1) * maxW * 0.62;

  // Fortress zone — upper-right, heavier/dense (concentrated, constrained)
  const foDist = Math.hypot((xRel - 0.78) * 1.6, yRel - 0.28);
  const fo = fortressStr * Math.max(0, 1 - foDist * 1.9) * maxW * 1.12;

  // Convergence — centre-mid where the three regimes meet
  const cvDist = Math.hypot(xRel - 0.50, (yRel - 0.50) * 1.25);
  const cv = Math.min(fieldStr, fortressStr) * 0.52
    * Math.max(0, 1 - cvDist * 2.75) * maxW;

  // Spatial noise: multi-frequency sine combination
  const noise = volatility * (
    Math.sin(xRel * 11.3 + yRel *  8.7) * 0.42 +
    Math.sin(xRel *  6.1 + yRel * 14.9) * 0.33 +
    Math.sin(xRel * 18.7 + yRel *  3.4) * 0.25
  ) * maxW * 0.32;

  return Math.max(0.4, Math.min(maxW, fld + fr + fo + cv + noise));
}

/** The field every embed and halftone draws: the option field's own defaults. */
export const embedWeight = (xRel: number, yRel: number, maxW: number) =>
  spatialWeight(xRel, yRel, 0.72, 0.60, 0.52, 0.34, maxW);
