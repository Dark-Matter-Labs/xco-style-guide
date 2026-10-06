import { identityScales } from "@/lib/design-tokens";
import { contrastRatio } from "@/lib/a11y/contrast";
import type { ChaosResult } from "@/lib/chaos/systems";

// Drawing a chaos field — to canvas for preview, PNG and video, and to SVG
// for the path systems. The look follows 8.1: a quiet ground, dense fine ink
// (0.75–1.5 px at 1080), and one selected path at 2–3 px — the ember signal,
// about 2% of the composition. Expressive only: no mark encodes a quantity.

const { field, signal, matter } = identityScales;

export type ChaosPaletteId = "chalk" | "mineral" | "deep" | "ember";
export type ChaosFrame = "framed" | "bleed";

export interface ChaosPalette {
  id: ChaosPaletteId;
  label: string;
  ground: string;
  ink: string;
  /** The followed trajectory. Clears 3:1 on the ground (WCAG 1.4.11). */
  signal: string;
}

// On pale grounds the ember is Signal 600: Signal 500 on chalk is 2.46:1,
// under the non-text bar. On the ember surface the trace is carried by weight
// in the ink colour, as 8.1 gives Field 950 as the ember's readable ink.
export const chaosPalettes: ChaosPalette[] = [
  { id: "chalk", label: "Chalk — Matter 50, ink, ember trace", ground: matter[50], ink: matter[950], signal: signal[600] },
  { id: "mineral", label: "Mineral — Matter 100, Field 700", ground: matter[100], ink: field[700], signal: signal[600] },
  { id: "deep", label: "Deep field — Field 950, chalk", ground: field[950], ink: matter[50], signal: signal[500] },
  { id: "ember", label: "Ember surface — Signal 500, Field 950", ground: signal[500], ink: field[950], signal: field[950] },
];

export const paletteOf = (id: ChaosPaletteId) => chaosPalettes.find((p) => p.id === id) ?? chaosPalettes[0];

/** Every palette's ink and trace must clear 3:1 on its ground. */
export const paletteContrast = chaosPalettes.map((p) => ({
  id: p.id,
  ink: contrastRatio(p.ink, p.ground),
  signal: contrastRatio(p.signal, p.ground),
}));

export interface ChaosLook {
  palette: ChaosPaletteId;
  frame: ChaosFrame;
  zoom: number;
  trace: boolean;
  caption: boolean;
}

interface Transform { s: number; ox: number; oy: number }

function transformFor(w: number, h: number, look: ChaosLook): Transform {
  const base = look.frame === "framed" ? Math.min(w, h) * 0.78 : Math.max(w, h);
  const s = base * look.zoom;
  return { s, ox: (w - s) / 2, oy: (h - s) / 2 };
}

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** An attractor raster that can be advanced point by point — for video build-up. */
export function attractorRaster(w: number, h: number, xy: Float32Array, look: ChaosLook) {
  const counts = new Uint32Array(w * h);
  const t = transformFor(w, h, look);
  let done = 0;
  let max = 1;
  return {
    total: xy.length / 2,
    advance(to: number) {
      for (let i = done; i < Math.min(to, xy.length / 2); i++) {
        const px = Math.floor(xy[i * 2] * t.s + t.ox);
        const py = Math.floor(xy[i * 2 + 1] * t.s + t.oy);
        if (px < 0 || py < 0 || px >= w || py >= h) continue;
        const c = ++counts[py * w + px];
        if (c > max) max = c;
      }
      done = Math.max(done, Math.min(to, xy.length / 2));
    },
    paint(ctx: CanvasRenderingContext2D) {
      const p = paletteOf(look.palette);
      const [gr, gg, gb] = hexRgb(p.ground);
      const [ir, ig, ib] = hexRgb(p.ink);
      const img = ctx.createImageData(w, h);
      const logMax = Math.log1p(max);
      for (let i = 0; i < counts.length; i++) {
        const v = counts[i] ? Math.min(1, Math.pow(Math.log1p(counts[i]) / logMax, 0.7) * 1.15) : 0;
        img.data[i * 4] = gr + (ir - gr) * v;
        img.data[i * 4 + 1] = gg + (ig - gg) * v;
        img.data[i * 4 + 2] = gb + (ib - gb) * v;
        img.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    },
  };
}

function strokePath(ctx: CanvasRenderingContext2D, pts: Float32Array, t: Transform, upTo: number) {
  const n = Math.max(2, Math.floor((pts.length / 2) * upTo));
  ctx.beginPath();
  ctx.moveTo(pts[0] * t.s + t.ox, pts[1] * t.s + t.oy);
  for (let i = 1; i < n && i < pts.length / 2; i++) ctx.lineTo(pts[i * 2] * t.s + t.ox, pts[i * 2 + 1] * t.s + t.oy);
  ctx.stroke();
}

function drawTrace(ctx: CanvasRenderingContext2D, r: ChaosResult, t: Transform, p: ChaosPalette, unit: number, progress: number) {
  ctx.strokeStyle = p.signal;
  ctx.fillStyle = p.signal;
  ctx.lineWidth = 2.5 * unit;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (r.kind === "points") {
    const n = Math.floor((r.trace.length / 2) * progress);
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(r.trace[i * 2] * t.s + t.ox, r.trace[i * 2 + 1] * t.s + t.oy, 2.6 * unit, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (r.trace.length >= 4) {
    strokePath(ctx, r.trace, t, progress);
  }
}

function drawCaption(ctx: CanvasRenderingContext2D, w: number, h: number, p: ChaosPalette, seed: number, mono: string) {
  const unit = Math.min(w, h) / 1080;
  const size = Math.round(18 * unit);
  const text = `[ IMAGE / GENERATED · STOCHASTIC · SEED ${seed} ] expressive — no measured values`;
  ctx.font = `500 ${size}px ${mono}`;
  const pad = 10 * unit;
  const tw = ctx.measureText(text).width;
  const x = 32 * unit;
  const y = h - 32 * unit;
  ctx.fillStyle = p.ground;
  ctx.fillRect(x - pad, y - size - pad, tw + pad * 2, size + pad * 2);
  // Caption text is the ink on the ground — every palette clears 4.5:1.
  ctx.fillStyle = p.ink;
  ctx.textBaseline = "bottom";
  ctx.fillText(text, x, y);
}

/** Draw a chaos field. `progress` (0–1) reveals the build-up for video. */
export function drawChaos(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  r: ChaosResult,
  look: ChaosLook,
  seed: number,
  mono: string,
  progress = 1,
  raster?: ReturnType<typeof attractorRaster>,
) {
  const p = paletteOf(look.palette);
  const t = transformFor(w, h, look);
  const unit = Math.min(w, h) / 1080;
  if (r.kind === "points") {
    const ras = raster ?? attractorRaster(w, h, r.xy, look);
    ras.advance(Math.floor(ras.total * progress));
    ras.paint(ctx);
  } else {
    ctx.fillStyle = p.ground;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = p.ink;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 0.9 * unit;
    ctx.lineJoin = "round";
    for (const path of r.paths) strokePath(ctx, path, t, progress);
    ctx.globalAlpha = 1;
  }
  if (look.trace) drawTrace(ctx, r, t, p, unit, progress);
  if (look.caption) drawCaption(ctx, w, h, p, seed, mono);
}

/** SVG for the path systems. Attractors are density images — export PNG. */
export function chaosSvg(w: number, h: number, r: ChaosResult, look: ChaosLook, description: string): string | null {
  if (r.kind !== "paths") return null;
  const p = paletteOf(look.palette);
  const t = transformFor(w, h, look);
  const unit = Math.min(w, h) / 1080;
  const d = (pts: Float32Array) => {
    let s = "";
    for (let i = 0; i < pts.length; i += 2) s += `${i ? "L" : "M"}${(pts[i] * t.s + t.ox).toFixed(1)} ${(pts[i + 1] * t.s + t.oy).toFixed(1)}`;
    return s;
  };
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(description)}">`,
    `<title>${esc(description)}</title>`,
    `<rect width="${w}" height="${h}" fill="${p.ground}"/>`,
    `<g fill="none" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="${(0.9 * unit).toFixed(2)}" stroke-linejoin="round">`,
    ...r.paths.map((pts) => `<path d="${d(pts)}"/>`),
    `</g>`,
    look.trace && r.trace.length >= 4 ? `<path d="${d(r.trace)}" fill="none" stroke="${p.signal}" stroke-width="${(2.5 * unit).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>` : "",
    `</svg>`,
  ].join("\n");
}
