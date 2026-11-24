import type { CardSpec } from "./types";

/** The card's measures: size, unit (1 at a 1000px short side), margin and the story safe bands. */
export function metrics(spec: CardSpec) {
  const { w: W, h: H } = spec.format;
  const S = Math.min(W, H);
  const u = S / 1000;
  const tall = H > W * 1.4;
  // Stories are covered by the app's own chrome — the account row at the top,
  // the reply bar at the bottom — so text keeps out of those bands.
  const safeTop = tall ? H * 0.09 : 0;
  const safeBottom = tall ? H * 0.11 : 0;
  return { W, H, S, u, m: 64 * u, landscape: W > H * 1.2, tall, safeTop, safeBottom };
}
