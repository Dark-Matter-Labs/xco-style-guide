import { globeField as g } from "@/lib/event-series/globe-field";
import { glyphFor } from "./ascii";

type Ctx = CanvasRenderingContext2D;

// The globe: the Earth, half photograph and half halftone, with the seam
// between them in motion. At phase 0 the seam sits where the source file has
// it — the original image, exactly. Over one loop it sweeps left until the
// whole disc has resolved into squares, then returns: the world as seen,
// becoming a field of options, and back.

let cells: Uint8Array | null = null;
function getCells(): Uint8Array {
  if (!cells) {
    const bin = atob(g.cells);
    cells = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  }
  return cells;
}

const TAU = Math.PI * 2;
const REVEAL_BAND = 1.5;     // pitches over which a newly revealed square grows in
const SHIMMER = 0.07;        // ± size breathing, as a fraction of each square

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Seam position in globe units for a loop phase in [0, 1). */
export function seamAt(phase: number): number {
  return g.seam * (0.5 + 0.5 * Math.cos(TAU * phase));
}

interface GlobeOptions {
  cx: number;
  cy: number;
  diameter: number;
  phase: number;
  color: string;
  photo: HTMLImageElement | null;
  /** Whether the seam moves. Off, the globe holds the source's composition. */
  animateSeam?: boolean;
  /** Squares, as the source draws them, or glyphs from the ASCII ramp. */
  mode?: "squares" | "glyphs";
  /** Font family for glyph mode. */
  font?: string;
}

export function drawGlobe(ctx: Ctx, o: GlobeOptions): void {
  const k = o.diameter / (2 * g.disc.r);
  const X = (gx: number) => o.cx + (gx - g.disc.cx) * k;
  const Y = (gy: number) => o.cy + (gy - g.disc.cy) * k;
  const seam = o.animateSeam === false ? g.seam : seamAt(o.phase);

  // Photograph, left of the seam.
  if (o.photo && seam > g.photo.x) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(X(g.photo.x), Y(g.photo.y), (seam - g.photo.x) * k, g.photo.h * k);
    ctx.clip();
    ctx.drawImage(o.photo, X(g.photo.x), Y(g.photo.y), g.photo.w * k, g.photo.h * k);
    ctx.restore();
  }

  // Halftone, right of it.
  const data = getCells();
  const band = REVEAL_BAND * g.pitch;
  const wave = TAU * o.phase * 2;
  ctx.fillStyle = o.color;
  const glyphs = o.mode === "glyphs";
  if (glyphs) {
    ctx.save();
    // A glyph fills less of its cell than a square does; set it a size up.
    ctx.font = `${g.pitch * k * 1.3}px ${o.font ?? "monospace"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  }
  for (let r = 0; r < g.rows; r++) {
    const gy = g.originY + r * g.pitch;
    for (let c = 0; c < g.cols; c++) {
      const v = data[r * g.cols + c];
      if (!v) continue;
      const gx = g.originX + c * g.pitch;
      if (gx < seam) continue;
      const reveal = smoothstep(seam, seam + band, gx);
      // Glyphs breathe harder: the change reads as characters flickering between
      // neighbours on the ramp, the site's ASCII motion.
      const breathe = 1 + (glyphs ? SHIMMER * 3 : SHIMMER) * Math.sin(wave - (gx + gy) * 0.012);
      if (glyphs) {
        // Breathing changes the glyph, not just its size — the ASCII flicker.
        const level = Math.min(1, (v / 255) * breathe * 1.15);
        const ch = glyphFor(level);
        if (ch === " " || reveal < 0.05) continue;
        ctx.globalAlpha = (0.35 + 0.65 * level) * reveal;
        ctx.fillText(ch, X(gx), Y(gy));
        continue;
      }
      const side = (v / 255) * g.pitch * reveal * breathe * k;
      if (side < 0.4) continue;
      ctx.fillRect(X(gx) - side / 2, Y(gy) - side / 2, side, side);
    }
  }
  if (glyphs) ctx.restore();
}
