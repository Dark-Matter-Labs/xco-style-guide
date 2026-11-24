// Pixel helpers for image treatment's photo sources (halftone and tritone).

export function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// Pixel-perfect fillRect — snaps every edge to the nearest integer pixel so
// Canvas 2D never anti-aliases the rectangle boundary.  All halftone drawing
// must go through this rather than ctx.fillRect() directly.
export function fillRectPixel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
) {
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  const x1 = Math.round(x + w);
  const y1 = Math.round(y + h);
  if (x1 > x0 && y1 > y0) ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}

/** The photo's own aspect ratio, at most 1200 px wide. */
export function getPhotoDims(img: HTMLImageElement): { vw: number; vh: number } {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (iw <= 1200) return { vw: iw, vh: ih };
  return { vw: 1200, vh: Math.round(ih * (1200 / iw)) };
}

export function sampleLum(data: Uint8ClampedArray, cx: number, cy: number, vw: number, vh: number): number {
  const px = clamp(Math.floor(cx), 0, vw - 1);
  const py = clamp(Math.floor(cy), 0, vh - 1);
  const i  = (py * vw + px) * 4;
  return (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
}

export function getImageData(img: HTMLImageElement, vw: number, vh: number): ImageData {
  const off = document.createElement("canvas");
  off.width = vw; off.height = vh;
  const ctx = off.getContext("2d")!;
  ctx.drawImage(img, 0, 0, vw, vh);
  return ctx.getImageData(0, 0, vw, vh);
}

// ── Film grain ────────────────────────────────────────────────────────────
export function addGrain(ctx: CanvasRenderingContext2D, vw: number, vh: number, intensity = 30) {
  const imgData = ctx.getImageData(0, 0, vw, vh);
  const { data } = imgData;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * intensity;
    data[i]     = clamp(data[i]     + n, 0, 255);
    data[i + 1] = clamp(data[i + 1] + n, 0, 255);
    data[i + 2] = clamp(data[i + 2] + n, 0, 255);
  }
  ctx.putImageData(imgData, 0, 0);
}
