import { paletteHex } from "@/lib/design-tokens";

// Drawing a grown line — to canvas for preview, PNG and video, and to SVG for
// vector export. Both read the same frame and look, so the SVG is the preview.
//
// The growth lives in the unit square. It is framed by its bounds: at zoom 1
// the form fills the card with a margin, above 1 it bleeds off the edges.
// Exports and video frame by the finished form, so it grows in a fixed frame.

export type GrowthStyle = "line" | "rings" | "fill";
export type GrowthPaletteId = "paper" | "ink" | "dusk" | "blueprint";

export interface GrowthPalette {
  id: GrowthPaletteId;
  label: string;
  ground: string;
  line: string;
  /** Plate behind the caption: the ground, so caption contrast is line-on-ground. */
  plate: string;
}

const { paper, ink, dusk, navy } = paletteHex;

// Line-on-ground clears 3:1 for non-text in every pairing (WCAG 1.4.11):
// ink/paper 14:1, ink/dusk 5.2:1, paper/navy 15.7:1.
export const growthPalettes: GrowthPalette[] = [
  { id: "paper", label: "Paper", ground: paper, line: ink, plate: paper },
  { id: "ink", label: "Ink", ground: ink, line: paper, plate: ink },
  { id: "dusk", label: "Dusk", ground: dusk, line: ink, plate: dusk },
  { id: "blueprint", label: "Blueprint", ground: navy, line: paper, plate: navy },
];

export const paletteOf = (id: GrowthPaletteId) => growthPalettes.find((p) => p.id === id) ?? growthPalettes[0];

export interface GrowthLook {
  style: GrowthStyle;
  palette: GrowthPaletteId;
  /** 1 fits the form to the card with a margin; above 1 the growth bleeds. */
  zoom: number;
  caption: boolean;
}

export interface GrowthFrame {
  /** Current line, interleaved x,y in the unit square. */
  line: Float32Array;
  closed: boolean;
  /** Earlier outlines for the rings style, oldest first. */
  rings: Float32Array[];
  /** The extent to frame by, in the unit square. */
  bounds: Bounds;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function boundsOf(pts: Float32Array): Bounds {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (let i = 0; i < pts.length; i += 2) {
    if (pts[i] < minX) minX = pts[i];
    if (pts[i] > maxX) maxX = pts[i];
    if (pts[i + 1] < minY) minY = pts[i + 1];
    if (pts[i + 1] > maxY) maxY = pts[i + 1];
  }
  return { minX, minY, maxX, maxY };
}

const RING_LIMIT = 40;

/** Evenly spaced subset of the history, at most RING_LIMIT outlines. */
export function ringsFrom(history: Float32Array[]): Float32Array[] {
  if (history.length <= RING_LIMIT) return history;
  const out: Float32Array[] = [];
  for (let i = 0; i < RING_LIMIT; i++) out.push(history[Math.floor((i * (history.length - 1)) / (RING_LIMIT - 1))]);
  return out;
}

const FILL = 0.84; // share of the card the form takes at zoom 1

function layout(W: number, H: number, zoom: number, b: Bounds) {
  const bw = Math.max(1e-3, b.maxX - b.minX);
  const bh = Math.max(1e-3, b.maxY - b.minY);
  const S = Math.min((W * FILL) / bw, (H * FILL) / bh) * zoom;
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  return { S, ox: W / 2 - cx * S, oy: H / 2 - cy * S, u: Math.min(W, H) / 1000 };
}

/** Stroke in card pixels, so the line weight holds whatever the form's size. */
function strokeWidth(u: number, style: GrowthStyle) {
  return Math.max(1, u * (style === "rings" ? 1.1 : 1.8));
}

export function captionText(seed: number): string {
  return `[ GENERATED / DIFFERENTIAL GROWTH · SEED ${seed} ]`;
}

// ── Canvas ───────────────────────────────────────────────────────────

function tracePath(ctx: CanvasRenderingContext2D, pts: Float32Array, closed: boolean, S: number, ox: number, oy: number) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i += 2) {
    const x = ox + pts[i] * S, y = oy + pts[i + 1] * S;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  if (closed) ctx.closePath();
}

export function drawGrowth(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  frame: GrowthFrame,
  look: GrowthLook,
  seed: number,
  monoFamily: string,
): void {
  const p = paletteOf(look.palette);
  const { S, ox, oy, u } = layout(W, H, look.zoom, frame.bounds);
  ctx.save();
  ctx.fillStyle = p.ground;
  ctx.fillRect(0, 0, W, H);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = p.line;

  if (look.style === "rings") {
    ctx.lineWidth = strokeWidth(u, "rings");
    frame.rings.forEach((r, i) => {
      ctx.globalAlpha = 0.18 + 0.5 * (i / Math.max(1, frame.rings.length - 1));
      tracePath(ctx, r, frame.closed, S, ox, oy);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  tracePath(ctx, frame.line, frame.closed, S, ox, oy);
  if (look.style === "fill" && frame.closed) {
    ctx.fillStyle = p.line;
    ctx.fill();
  } else {
    ctx.lineWidth = strokeWidth(u, "line");
    ctx.stroke();
  }

  if (look.caption) {
    const size = 16 * u;
    ctx.font = `500 ${size}px ${monoFamily}`;
    const text = captionText(seed);
    const w = ctx.measureText(text).width;
    const m = 48 * u, pad = 8 * u;
    ctx.fillStyle = p.plate;
    ctx.fillRect(m - pad, H - m - size - pad, w + pad * 2, size + pad * 2);
    ctx.fillStyle = p.line;
    ctx.textBaseline = "bottom";
    ctx.fillText(text, m, H - m);
  }
  ctx.restore();
}

// ── SVG ──────────────────────────────────────────────────────────────

function pathData(pts: Float32Array, closed: boolean, S: number, ox: number, oy: number): string {
  let d = "";
  for (let i = 0; i < pts.length; i += 2) {
    // A tenth of a pixel is below what any export size can show.
    d += `${i ? "L" : "M"}${(ox + pts[i] * S).toFixed(1)} ${(oy + pts[i + 1] * S).toFixed(1)}`;
  }
  return closed ? `${d}Z` : d;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function growthSvg(
  W: number,
  H: number,
  frame: GrowthFrame,
  look: GrowthLook,
  seed: number,
  description: string,
): string {
  const p = paletteOf(look.palette);
  const { S, ox, oy, u } = layout(W, H, look.zoom, frame.bounds);
  const rings =
    look.style === "rings"
      ? frame.rings
          .map((r, i) => {
            const a = (0.18 + 0.5 * (i / Math.max(1, frame.rings.length - 1))).toFixed(3);
            return `<path d="${pathData(r, frame.closed, S, ox, oy)}" stroke-opacity="${a}" stroke-width="${strokeWidth(u, "rings").toFixed(2)}"/>`;
          })
          .join("\n    ")
      : "";
  const fill = look.style === "fill" && frame.closed;
  const main = fill
    ? `<path d="${pathData(frame.line, frame.closed, S, ox, oy)}" fill="${p.line}" stroke="none"/>`
    : `<path d="${pathData(frame.line, frame.closed, S, ox, oy)}" stroke-width="${strokeWidth(u, "line").toFixed(2)}"/>`;
  const size = 16 * u, m = 48 * u, pad = 8 * u;
  // DM Mono advances 0.6em per glyph, so the plate can be sized without
  // measuring — the same plate the canvas draws.
  const text = captionText(seed);
  const textW = text.length * 0.6 * size;
  const caption = look.caption
    ? `\n  <rect x="${(m - pad).toFixed(2)}" y="${(H - m - size - pad).toFixed(2)}" width="${(textW + pad * 2).toFixed(2)}" height="${(size + pad * 2).toFixed(2)}" fill="${p.plate}"/>` +
      `\n  <text x="${m.toFixed(2)}" y="${(H - m - size * 0.18).toFixed(2)}" font-family="DM Mono, monospace" font-weight="500" font-size="${size.toFixed(2)}" fill="${p.line}">${esc(text)}</text>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(description)}">
  <title>xCO differential growth — seed ${seed}</title>
  <desc>${esc(description)} Generated, expressive pattern: it encodes no data. Algorithm after inconvergent/differential-line (Anders Hoff, MIT).</desc>
  <rect width="${W}" height="${H}" fill="${p.ground}"/>
  <g fill="none" stroke="${p.line}" stroke-linejoin="round" stroke-linecap="round">
    ${rings}
    ${main}
  </g>${caption}
</svg>
`;
}
