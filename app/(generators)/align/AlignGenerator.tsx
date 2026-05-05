"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Palette ────────────────────────────────────────────────────────────────
const INK   = "#1C1B17";
const PAPER = "#FFFFFF";
const NAVY  = "#192640";
const OCEAN = "#085A8C";
const TEAL  = "#3786A6";
const SAND  = "#F2B077";
const DUSK  = "#F27F3D";
const MUTED = "#5F5C53";

// ── Types ──────────────────────────────────────────────────────────────────
type AlignPreset = "blueprint" | "ember" | "horizon" | "dusk" | "ink";
type CellShape   = "square" | "hbars" | "vbars";
type AlignFormat = "card" | "square";

interface ColorStop { shadow: string; mid: string; highlight: string }

// ── Presets ────────────────────────────────────────────────────────────────
const PRESETS: Record<AlignPreset, ColorStop & { label: string; hint: string }> = {
  blueprint: { label: "Blueprint", hint: "navy → ocean → paper", shadow: NAVY,  mid: OCEAN, highlight: PAPER },
  ember:     { label: "Ember",     hint: "ink → dusk → sand",   shadow: INK,   mid: DUSK,  highlight: SAND  },
  horizon:   { label: "Horizon",   hint: "navy → teal → sand",  shadow: NAVY,  mid: TEAL,  highlight: SAND  },
  dusk:      { label: "Dusk",      hint: "navy → dusk → paper", shadow: NAVY,  mid: DUSK,  highlight: PAPER },
  ink:       { label: "Ink",       hint: "ink → muted → paper", shadow: INK,   mid: MUTED, highlight: PAPER },
};

const DIMS = {
  card:   { vw: 1200, vh: 630  },
  square: { vw: 1200, vh: 1200 },
} as const;

// ── Debounce ───────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

// ── Color utils ────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ── Tritone mapping ────────────────────────────────────────────────────────
// Maps each pixel's luminance through three colour stops:
//   [0 → midpoint] → lerp(shadow, mid)
//   [midpoint → 1] → lerp(mid, highlight)
function applyTritone(
  imgData: ImageData,
  shadow: string, mid: string, highlight: string,
  midpoint: number,
): ImageData {
  const [sr, sg, sb] = hexToRgb(shadow);
  const [mr, mg, mb] = hexToRgb(mid);
  const [hr, hg, hb] = hexToRgb(highlight);
  const out = new ImageData(imgData.width, imgData.height);
  const src = imgData.data, dst = out.data;
  const mp = clamp(midpoint, 0.01, 0.99);

  for (let i = 0; i < src.length; i += 4) {
    const lum = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
    let r, g, b;
    if (lum < mp) {
      const t = lum / mp;
      r = Math.round(sr + (mr - sr) * t);
      g = Math.round(sg + (mg - sg) * t);
      b = Math.round(sb + (mb - sb) * t);
    } else {
      const t = (lum - mp) / (1 - mp);
      r = Math.round(mr + (hr - mr) * t);
      g = Math.round(mg + (hg - mg) * t);
      b = Math.round(mb + (hb - mb) * t);
    }
    dst[i] = r; dst[i + 1] = g; dst[i + 2] = b; dst[i + 3] = 255;
  }
  return out;
}

// ── Canvas helpers ─────────────────────────────────────────────────────────
// Cover-fit: scale image to fill canvas, crop to centre. No stretching.
function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, vw: number, vh: number) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(vw / iw, vh / ih);
  const sw = iw * scale, sh = ih * scale;
  ctx.drawImage(img, (vw - sw) / 2, (vh - sh) / 2, sw, sh);
}

function getImgData(img: HTMLImageElement, vw: number, vh: number): ImageData {
  const c = document.createElement("canvas");
  c.width = vw; c.height = vh;
  const ctx = c.getContext("2d")!;
  drawImageCover(ctx, img, vw, vh);
  return ctx.getImageData(0, 0, vw, vh);
}

function sampleLum(data: Uint8ClampedArray, cx: number, cy: number, vw: number, vh: number): number {
  const px = clamp(Math.floor(cx), 0, vw - 1);
  const py = clamp(Math.floor(cy), 0, vh - 1);
  const i  = (py * vw + px) * 4;
  return (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
}

// Highlight raster: rects sized by BRIGHTNESS so bright/structural areas get
// the most texture — the opposite of a standard halftone.
function drawHighlightRaster(
  ctx: CanvasRenderingContext2D,
  originalData: ImageData,
  vw: number, vh: number,
  spacing: number,
  highlightHex: string,
  cellShape: CellShape,
) {
  const { data } = originalData;
  const maxSz = spacing * 0.9;
  ctx.fillStyle = highlightHex;
  for (let cy = spacing / 2; cy < vh; cy += spacing) {
    for (let cx = spacing / 2; cx < vw; cx += spacing) {
      const lum = sampleLum(data, cx, cy, vw, vh);
      if (lum < 0.06) continue;
      const w = cellShape === "hbars" ? spacing : maxSz * lum;
      const h = cellShape === "vbars" ? spacing : maxSz * lum;
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    }
  }
}

function addGrain(ctx: CanvasRenderingContext2D, vw: number, vh: number, intensity = 25) {
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

function spacingFromRes(r: number): number {
  return Math.round(36 - (r / 100) * 33);
}

// ── Canvas render ──────────────────────────────────────────────────────────
function renderToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  preset: AlignPreset,
  midpoint: number,
  raster: boolean,
  spacing: number,
  cellShape: CellShape,
  grain: boolean,
  vw: number, vh: number,
) {
  const ctx = canvas.getContext("2d")!;
  const { shadow, mid: midColor, highlight } = PRESETS[preset];
  const rawData = getImgData(img, vw, vh);
  ctx.putImageData(applyTritone(rawData, shadow, midColor, highlight, midpoint), 0, 0);
  if (raster) drawHighlightRaster(ctx, rawData, vw, vh, spacing, highlight, cellShape);
  if (grain)  addGrain(ctx, vw, vh);
}

// ── SVG builder ────────────────────────────────────────────────────────────
function buildAlignSVG(
  img: HTMLImageElement,
  preset: AlignPreset,
  midpoint: number,
  raster: boolean,
  spacing: number,
  cellShape: CellShape,
  vw: number, vh: number,
): string {
  const { shadow, mid: midColor, highlight } = PRESETS[preset];
  const rawData = getImgData(img, vw, vh);
  const triData = applyTritone(rawData, shadow, midColor, highlight, midpoint);

  // Write tritone to offscreen canvas → JPEG base64
  const c = document.createElement("canvas");
  c.width = vw; c.height = vh;
  c.getContext("2d")!.putImageData(triData, 0, 0);
  const dataURL = c.toDataURL("image/jpeg", 0.88);

  let rasterParts = "";
  if (raster) {
    const { data } = rawData;
    const maxSz = spacing * 0.9;
    const parts: string[] = [];
    for (let cy = spacing / 2; cy < vh; cy += spacing) {
      for (let cx = spacing / 2; cx < vw; cx += spacing) {
        const lum = sampleLum(data, cx, cy, vw, vh);
        if (lum < 0.06) continue;
        const w = cellShape === "hbars" ? spacing : maxSz * lum;
        const h = cellShape === "vbars" ? spacing : maxSz * lum;
        rasterParts += `<rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${highlight}"/>`;
      }
    }
  }

  return `<?xml version="1.0" standalone="no"?><svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg"><rect width="${vw}" height="${vh}" fill="${shadow}"/><image href="${dataURL}" x="0" y="0" width="${vw}" height="${vh}"/>${rasterParts}</svg>`;
}

// ── Download helpers ───────────────────────────────────────────────────────
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function downloadDataURL(dataURL: string, name: string) {
  const a = document.createElement("a"); a.href = dataURL; a.download = name; a.click();
}

// ── Generator ──────────────────────────────────────────────────────────────
export function AlignGenerator() {
  const [uploadedImg,  setUploadedImg]  = useState<HTMLImageElement | null>(null);
  const [preset,       setPreset]       = useState<AlignPreset>("blueprint");
  const [midpoint,     setMidpoint]     = useState(0.35);
  const [raster,       setRaster]       = useState(false);
  const [resolution,   setResolution]   = useState(40);
  const [cellShape,    setCellShape]    = useState<CellShape>("square");
  const [grain,        setGrain]        = useState(false);
  const [format,       setFormat]       = useState<AlignFormat>("card");
  const [exporting,    setExporting]    = useState<string | null>(null);

  const canvasRef           = useRef<HTMLCanvasElement>(null);
  const debouncedResolution = useDebounce(resolution, 120);
  const debouncedMidpoint   = useDebounce(midpoint, 80);

  const { vw, vh } = DIMS[format];
  const spacing    = spacingFromRes(debouncedResolution);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setUploadedImg(img); URL.revokeObjectURL(url); };
    img.src = url;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedImg) return;
    renderToCanvas(canvas, uploadedImg, preset, debouncedMidpoint, raster, spacing, cellShape, grain, vw, vh);
  }, [uploadedImg, preset, debouncedMidpoint, raster, spacing, cellShape, grain, vw, vh]);

  const slug = `xco-align-${format}-${preset}`;

  const handleExport = (type: "png" | "svg") => {
    if (!uploadedImg) return;
    setExporting(type);
    try {
      if (type === "png") {
        const canvas = canvasRef.current;
        if (canvas) downloadDataURL(canvas.toDataURL("image/png"), `${slug}.png`);
      } else {
        const svgStr = buildAlignSVG(uploadedImg, preset, debouncedMidpoint, raster, spacing, cellShape, vw, vh);
        downloadBlob(new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" }), `${slug}.svg`);
      }
    } finally {
      setExporting(null);
    }
  };

  const btnClass = (active: boolean) =>
    `flex-1 font-mono text-xs px-3 py-2 border transition-colors ${
      active
        ? "bg-xco-ink text-xco-paper border-xco-ink"
        : "text-xco-ink-muted border-xco-ink/[0.2] hover:border-xco-ink hover:text-xco-ink"
    }`;

  const midLabel = debouncedMidpoint < 0.3 ? "dark images" : debouncedMidpoint < 0.5 ? "balanced" : "bright images";

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* ── Controls ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        {/* Upload */}
        <div className="space-y-2">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Image</h2>
          <label className={`block border-2 border-dashed p-5 text-center cursor-pointer transition-colors ${uploadedImg ? "border-xco-ink/[0.4]" : "border-xco-ink/[0.2] hover:border-xco-ink/[0.5]"}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <span className="font-mono text-xs text-xco-ink-muted">
              {uploadedImg ? "Image loaded — click to replace" : "Upload image to align"}
            </span>
          </label>
          <p className="font-mono text-xs text-xco-ink-muted italic">
            ChatGPT / DALL-E outputs, external diagrams, moodboards
          </p>
        </div>

        {/* Palette preset */}
        <div className="space-y-3 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Palette</h2>
          {(Object.entries(PRESETS) as [AlignPreset, typeof PRESETS[AlignPreset]][]).map(([id, p]) => (
            <label key={id} className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="preset" value={id} checked={preset === id}
                onChange={() => setPreset(id)} className="accent-xco-dusk mt-0.5" />
              <span className="space-y-0.5">
                <span className="font-mono text-xs text-xco-ink block">{p.label}</span>
                <span className="font-mono text-xs text-xco-ink-muted block">{p.hint}</span>
              </span>
            </label>
          ))}
        </div>

        {/* Midpoint / contrast */}
        <div className="space-y-3 border-t border-xco-ink/[0.12] pt-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Contrast</h2>
            <span className="font-mono text-xs text-xco-dusk">{midLabel}</span>
          </div>
          <input type="range" min={10} max={70} step={1}
            value={Math.round(midpoint * 100)}
            onChange={(e) => setMidpoint(Number(e.target.value) / 100)}
            className="w-full accent-xco-dusk" />
          <div className="flex justify-between font-mono text-xs text-xco-ink-muted">
            <span>dark</span><span>bright</span>
          </div>
          <p className="font-mono text-xs text-xco-ink-muted italic">
            Sets where shadow → mid transition occurs. Lower = more shadow preserved.
          </p>
        </div>

        {/* Highlight raster overlay */}
        <div className="border-t border-xco-ink/[0.12] pt-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={raster} onChange={(e) => setRaster(e.target.checked)}
              className="accent-xco-dusk w-4 h-4" />
            <span className="font-mono text-xs text-xco-ink">Highlight raster overlay</span>
          </label>
          <p className="font-mono text-xs text-xco-ink-muted italic">
            Raster in highlight colour, sized by brightness — textures structural elements.
          </p>

          {raster && (
            <div className="space-y-3 pt-1">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs text-xco-ink-muted">Resolution</span>
                  <span className="font-mono text-xs text-xco-dusk">{spacing}px</span>
                </div>
                <input type="range" min={0} max={100} step={1}
                  value={resolution} onChange={(e) => setResolution(Number(e.target.value))}
                  className="w-full accent-xco-dusk" />
                <div className="flex justify-between font-mono text-xs text-xco-ink-muted">
                  <span>coarse</span><span>fine</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-xs text-xco-ink-muted block">Shape</span>
                <div className="flex gap-0">
                  {([["square", "Square"], ["hbars", "H bars"], ["vbars", "V bars"]] as [CellShape, string][]).map(([id, label]) => (
                    <button key={id} onClick={() => setCellShape(id as CellShape)} className={btnClass(cellShape === id)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grain */}
        <div className="border-t border-xco-ink/[0.12] pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={grain} onChange={(e) => setGrain(e.target.checked)}
              className="accent-xco-dusk w-4 h-4" />
            <span className="font-mono text-xs text-xco-ink">Film grain</span>
          </label>
          <p className="font-mono text-xs text-xco-ink-muted italic mt-1">
            Organic noise layer — softens digital harshness
          </p>
        </div>

        {/* Format */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Format</h2>
          {(["card", "square"] as AlignFormat[]).map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="format" value={f} checked={format === f}
                onChange={() => setFormat(f)} className="accent-xco-dusk" />
              <span className="font-mono text-xs text-xco-ink">
                {f === "card" ? "1200 × 630 — hero / OG" : "1200 × 1200 — square"}
              </span>
            </label>
          ))}
        </div>

        {/* Export */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-3">Export</h2>
          <button onClick={() => handleExport("svg")} disabled={exporting !== null || !uploadedImg}
            className="w-full text-left font-mono text-xs text-xco-ink border border-xco-ink/[0.2] px-3 py-2 hover:border-xco-ink hover:bg-xco-ink/[0.04] transition-colors disabled:opacity-40">
            {exporting === "svg" ? "exporting…" : `↓ SVG — ${format === "card" ? "1200×630" : "1200×1200"}`}
          </button>
          <button onClick={() => handleExport("png")} disabled={exporting !== null || !uploadedImg}
            className="w-full text-left font-mono text-xs text-xco-ink border border-xco-ink/[0.2] px-3 py-2 hover:border-xco-ink hover:bg-xco-ink/[0.04] transition-colors disabled:opacity-40">
            {exporting === "png" ? "exporting…" : `↓ PNG — ${format === "card" ? "1200×630" : "1200×1200"}`}
          </button>
          {!uploadedImg && (
            <p className="font-mono text-xs text-xco-ink-muted italic">Upload an image to enable export</p>
          )}
        </div>

      </aside>

      {/* ── Preview ── */}
      <div className="flex-1 min-w-0 space-y-4">
        {!uploadedImg ? (
          <div className="border border-xco-ink/[0.12] flex items-center justify-center bg-xco-paper"
            style={{ aspectRatio: format === "card" ? "1200/630" : "1" }}>
            <div className="text-center space-y-2 p-8">
              <p className="font-mono text-xs text-xco-ink-muted">Upload an image to preview</p>
              <p className="font-mono text-xs text-xco-ink-muted opacity-60">
                Tritone maps shadow / mid / highlight luminance bands<br />
                to xCO palette stops — stripping photographic colour
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-xco-ink/[0.12] overflow-hidden">
            <canvas ref={canvasRef} width={vw} height={vh} className="w-full h-auto block" />
          </div>
        )}
        <p className="font-mono text-xs text-xco-ink-muted">
          {uploadedImg
            ? `${PRESETS[preset].label} · midpoint ${Math.round(midpoint * 100)}% · ${format === "card" ? "1200×630" : "1200×1200"}`
            : "Tritone palette mapping · optional highlight raster · grain"}
        </p>
      </div>

    </div>
  );
}
