import { drawField } from "./field";
import { drawGlobe } from "./globe";
import { lockupWidth } from "./lockup";
import { drawCoLockup, drawDetails, drawHeadline, scrim, type Ink } from "./blocks";
import { palettes } from "./palettes";
import type { Assets, CardSpec, TemplateId } from "./types";

type Ctx = CanvasRenderingContext2D;
type Template = (ctx: Ctx, spec: CardSpec, phase: number, assets: Assets) => void;

// Three compositions. The first two take their structure from Medulla's own
// event posters — the offset window over a textured ground, and the heavy
// L-band that carries the details — so the series sits in their programme;
// the imagery, type and colour are xCO's. The third is xCO's alone, for the
// series announcement.

function metrics(spec: CardSpec) {
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

const clear = "rgba(0,0,0,0)";

// ── Window ───────────────────────────────────────────────────────────
// After Medulla's "The Words of Fallen Leaf": the generative field as ground,
// a dark window pushed off the bottom-right corner, the globe inside it.

const windowTemplate: Template = (ctx, spec, phase, assets) => {
  const { W, H, S, u, m, landscape, tall, safeBottom } = metrics(spec);
  const p = palettes[spec.palette];

  ctx.fillStyle = p.ground;
  ctx.fillRect(0, 0, W, H);
  drawField(ctx, { x: 0, y: 0, w: W, h: H }, {
    pitch: 11 * u, color: p.field, alpha: p.fieldAlpha, seed: spec.seed, phase,
  });

  const ox = S * 0.17 + (landscape ? (W - H) * 0.32 : 0);
  const oy = S * 0.17 + Math.max(0, H - W) * 0.4;
  const pw = W - ox;
  const ph = H - oy;
  ctx.fillStyle = p.panel;
  ctx.fillRect(ox, oy, pw, ph);

  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, pw, ph);
  ctx.clip();
  // Large enough to bleed off the bottom-right, small enough that its edge
  // still turns inside the window — it has to read as a globe.
  const D = Math.min(pw, ph) * (landscape ? 1.15 : 0.98);
  drawGlobe(ctx, {
    cx: W - D * (landscape ? 0.36 : 0.4),
    cy: H - D * (landscape ? 0.46 : 0.42),
    diameter: D,
    phase,
    color: p.onPanel,
    photo: assets.photo,
  });
  // Hold the text side of the window: fade the globe out towards the left.
  scrim(ctx, { x: ox, y: oy, w: pw * 0.72, h: ph }, p.panel, "left", 0.9);
  ctx.restore();

  const ink: Ink = { text: p.onPanel, accent: p.accentOnPanel, halo: p.panel, onLight: p.panelIsLight };
  const box = { x: ox + m, y: oy + m, w: (pw - 2 * m) * (landscape ? 0.66 : 0.9), h: ph - 2 * m };
  drawHeadline(ctx, spec, assets, box, ink, u, {
    maxSize: landscape ? 120 : tall ? 150 : 120,
    titleShare: landscape ? 0.5 : 0.48,
  });

  const cap = 44 * u;
  const lockTop = H - m - cap - safeBottom;
  drawCoLockup(ctx, ox + m, lockTop, cap, ink);
  drawDetails(ctx, spec, assets, ox + m, lockTop - 30 * u, pw - 2 * m, ink, u);
};

// ── Corner ───────────────────────────────────────────────────────────
// After Medulla's "Maintenance: Of Everything": a heavy band turning a corner,
// the corner of a square larger than the card. The globe sits behind the
// corner; the title takes the open quarter; the details ride in the band.

const cornerTemplate: Template = (ctx, spec, phase, assets) => {
  const { W, H, S, u, m, landscape, tall, safeTop, safeBottom } = metrics(spec);
  const p = palettes[spec.palette];

  ctx.fillStyle = p.ground;
  ctx.fillRect(0, 0, W, H);
  drawField(ctx, { x: 0, y: 0, w: W, h: H }, {
    pitch: 11 * u, color: p.field, alpha: p.fieldAlpha * 0.7, seed: spec.seed, phase, intensity: 0.85,
  });

  const b = S * (landscape ? 0.2 : 0.165);                    // band thickness
  const bx = landscape ? W * 0.06 : W * 0.13;                 // vertical bar, left edge
  const by = H - b - S * (landscape ? 0.08 : 0.13) - safeBottom; // horizontal bar, top edge

  const D = S * (landscape ? 1.25 : tall ? 1.2 : 0.95);
  drawGlobe(ctx, {
    cx: bx + b * 0.5 + (landscape ? W * 0.12 : 0),
    cy: by + b * 0.5 - (tall ? H * 0.1 : 0),
    diameter: D,
    phase,
    color: p.onGround,
    photo: assets.photo,
  });

  // Quiet the globe under the title, which sits in the top of the open quarter.
  scrim(ctx, { x: bx + b, y: 0, w: W - bx - b, h: by * 0.9 }, p.ground, "top", 0.92);

  // The band: an L cut from two rounded rectangles, even-odd.
  const r = S * 0.012;
  const big = W + H;
  ctx.beginPath();
  ctx.roundRect(bx, -big, big * 2, by + b + big, r);
  ctx.roundRect(bx + b, -big, big * 2, by + big, r);
  ctx.fillStyle = p.panel;
  ctx.fill("evenodd");

  // Title in the open quarter, right-aligned as on the Medulla poster.
  const ground: Ink = { text: p.onGround, accent: p.accentOnGround, halo: p.ground, onLight: p.groundIsLight };
  const qx = bx + b + m;
  const qy = m * 1.2 + safeTop;
  drawHeadline(ctx, spec, assets, { x: qx, y: qy, w: W - qx - m, h: (by - qy - m * 1.2) * (tall ? 0.7 : 1) }, ground, u, {
    maxSize: landscape ? 112 : tall ? 140 : 112,
    titleShare: 0.62,
    align: "right",
  });

  // In the band: the lockup, then the details.
  const band: Ink = { text: p.onPanel, accent: p.accentOnPanel, halo: clear, onLight: p.panelIsLight };
  const cap = Math.min(40 * u, b * 0.3);
  const lockLeft = bx + b * 0.28;
  drawCoLockup(ctx, lockLeft, by + (b - cap) / 2, cap, band);
  const detailsRight = W - m;
  const room = detailsRight - (lockLeft + lockupWidth(cap)) - m;
  drawDetails(ctx, spec, assets, detailsRight, by + b / 2 + 26 * u, room, band, u, "right");
};

// ── Globe ────────────────────────────────────────────────────────────
// xCO's own register: the globe alone on the ground, large and bleeding, the
// seam doing the work. For the series announcement and the open studio.

const globeTemplate: Template = (ctx, spec, phase, assets) => {
  const { W, H, S, u, m, landscape, tall, safeTop, safeBottom } = metrics(spec);
  const p = palettes[spec.palette];

  ctx.fillStyle = p.ground;
  ctx.fillRect(0, 0, W, H);
  drawField(ctx, { x: 0, y: 0, w: W, h: H }, {
    pitch: 11 * u, color: p.field, alpha: p.fieldAlpha * 0.35, seed: spec.seed, phase, intensity: 0.7,
  });

  const D = landscape ? H * 1.12 : tall ? W * 1.15 : S * 0.98;
  drawGlobe(ctx, {
    cx: landscape ? W - D * 0.36 : W * (tall ? 0.6 : 0.66),
    cy: landscape ? H * 0.56 : H * (tall ? 0.58 : 0.62),
    diameter: D,
    phase,
    color: p.onGround,
    photo: assets.photo,
  });

  // Fade the globe where the headline and the details sit.
  if (landscape) {
    scrim(ctx, { x: 0, y: 0, w: W * 0.7, h: H }, p.ground, "left", 0.9);
  } else {
    scrim(ctx, { x: 0, y: 0, w: W, h: H * (tall ? 0.44 : 0.5) }, p.ground, "top", 0.92);
    scrim(ctx, { x: 0, y: H * (tall ? 0.68 : 0.7), w: W, h: H * (tall ? 0.32 : 0.3) }, p.ground, "bottom", 0.9);
  }

  const ink: Ink = { text: p.onGround, accent: p.accentOnGround, halo: p.ground, onLight: p.groundIsLight };
  drawHeadline(ctx, spec, assets, { x: m, y: m + safeTop, w: (W - 2 * m) * (landscape ? 0.6 : 0.86), h: H * (tall ? 0.3 : 0.5) }, ink, u, {
    maxSize: landscape ? 124 : tall ? 150 : 124,
    titleShare: 0.62,
  });

  const cap = 44 * u;
  const lockTop = H - m - cap - safeBottom;
  drawCoLockup(ctx, m, lockTop, cap, ink);
  drawDetails(ctx, spec, assets, m, lockTop - 30 * u, (W - 2 * m) * (landscape ? 0.6 : 1), ink, u);
};

export const templates: Record<TemplateId, Template> = {
  window: windowTemplate,
  corner: cornerTemplate,
  globe: globeTemplate,
};

export const templateList: { id: TemplateId; label: string; hint: string }[] = [
  { id: "window", label: "Window", hint: "Offset window over the field — after Medulla's posters" },
  { id: "corner", label: "Corner", hint: "Heavy L-band carrying the details — after Medulla's posters" },
  { id: "globe",  label: "Globe",  hint: "The globe alone — xCO's register, for the series itself" },
];

/** Draws one frame of a card. `phase` is the loop position in [0, 1). */
export function drawCard(ctx: Ctx, spec: CardSpec, phase: number, assets: Assets): void {
  ctx.save();
  ctx.clearRect(0, 0, spec.format.w, spec.format.h);
  templates[spec.template](ctx, spec, phase, assets);
  ctx.restore();
}
