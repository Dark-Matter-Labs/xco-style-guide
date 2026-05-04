"use client";

import { useState, useEffect, useRef } from "react";
import {
  spacingFromResolution, computeDots, computeOptionFieldDots,
  DIMS, MARK_LINES,
} from "./ImageTreatmentDiagram";
import type { DotShape, ColorMode, TreatmentFormat, TreatmentMode, SourceDiagram } from "./ImageTreatmentDiagram";
import { spatialWeight } from "@/app/(generators)/option-field/OptionFieldDiagram";

const INK   = "#1C1B17";
const PAPER = "#FFFFFF";
const DUSK  = "#F27F3D";
const OCEAN = "#085A8C";

// ── Debounce ──────────────────────────────────────────────────────────
function useDebounce<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

// ── Canvas drawing helpers ────────────────────────────────────────────

function drawDots(
  ctx: CanvasRenderingContext2D,
  vw: number, vh: number,
  dotSpacing: number, fg: string,
  dotShape: DotShape, sourceDiagram: SourceDiagram,
) {
  const dots = sourceDiagram === "option-field"
    ? computeOptionFieldDots(vw, vh, dotSpacing)
    : computeDots(vw, vh, dotSpacing);
  ctx.fillStyle = fg;
  if (dotShape === "circle") {
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.cx, d.cy, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    for (const d of dots) {
      ctx.fillRect(d.cx - d.r, d.cy - d.r, d.r * 2, d.r * 2);
    }
  }
}

function drawSharpMark(ctx: CanvasRenderingContext2D, vw: number, vh: number, fg: string) {
  const padX = vw * 0.10, padY = vh * 0.10;
  const S = Math.min((vw - 2 * padX) / 400, (vh - 2 * padY) / 200);
  const offX = (vw - 400 * S) / 2, offY = (vh - 200 * S) / 2;
  const tx = (x: number, y: number): [number, number] => [offX + x * S, offY + y * S];

  ctx.strokeStyle = DUSK;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  for (const [x1, y1, x2, y2] of MARK_LINES) {
    ctx.beginPath();
    ctx.moveTo(...tx(x1, y1));
    ctx.lineTo(...tx(x2, y2));
    ctx.stroke();
  }
  const [mx, my] = tx(200, 116);
  ctx.fillStyle = DUSK;
  ctx.beginPath();
  ctx.arc(mx, my, 3 * S, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 1.2;
  ctx.setLineDash([]);
  const [frX, frY] = tx(40, 39.5);
  ctx.fillStyle = PAPER; ctx.fillRect(frX, frY, 120 * S, 45 * S);
  ctx.strokeStyle = fg;  ctx.strokeRect(frX, frY, 120 * S, 45 * S);

  const [foX, foY] = tx(240, 39.5);
  ctx.fillStyle = PAPER; ctx.fillRect(foX, foY, 120 * S, 45 * S);
  ctx.strokeStyle = fg;  ctx.strokeRect(foX, foY, 120 * S, 45 * S);

  const [fiX, fiY] = tx(50, 134);
  ctx.fillStyle = PAPER;   ctx.fillRect(fiX, fiY, 300 * S, 46 * S);
  ctx.strokeStyle = OCEAN; ctx.setLineDash([6, 4]);
  ctx.strokeRect(fiX, fiY, 300 * S, 46 * S);
  ctx.setLineDash([]);
}

function drawOptionFieldScanlines(
  ctx: CanvasRenderingContext2D,
  vw: number, vh: number,
  fg: string, dotSpacing: number,
) {
  const spacing = Math.max(3, dotSpacing);
  const segW = Math.max(4, Math.round(spacing * 0.85));
  const pad = Math.round(vw * 0.04);
  const maxW = spacing * 1.5;
  const usableW = vw - pad * 2;
  ctx.fillStyle = fg;
  for (let y = spacing / 2; y < vh; y += spacing) {
    const yRel = y / vh;
    for (let x = pad; x < vw - pad; x += segW) {
      const sh = spatialWeight((x - pad) / usableW, yRel, 0.72, 0.60, 0.52, 0.34, maxW);
      ctx.fillRect(x, y - sh / 2, segW, sh);
    }
  }
}

// ── Canvas preview (replaces SVG for live interaction) ────────────────
interface PreviewProps {
  mode: TreatmentMode; resolution: number; dotShape: DotShape;
  colorMode: ColorMode; format: TreatmentFormat; sourceDiagram: SourceDiagram;
}

function PreviewCanvas({ mode, resolution, dotShape, colorMode, format, sourceDiagram }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { vw, vh } = DIMS[format];

  const bg = colorMode === "inverted" ? INK : PAPER;
  const fg = colorMode === "inverted" ? PAPER : colorMode === "ember" ? DUSK : INK;
  const dotSpacing = spacingFromResolution(resolution);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, vw, vh);

    if (mode === "dots") {
      drawDots(ctx, vw, vh, dotSpacing, fg, dotShape, sourceDiagram);
    } else {
      if (sourceDiagram === "three-regimes") {
        drawSharpMark(ctx, vw, vh, fg);
      } else {
        drawOptionFieldScanlines(ctx, vw, vh, fg, dotSpacing);
      }
    }
  }, [mode, dotSpacing, dotShape, bg, fg, vw, vh, sourceDiagram]);

  return <canvas ref={canvasRef} width={vw} height={vh} className="w-full h-auto block" />;
}

// ── Programmatic SVG string builder — no DOM, no React ───────────────
// Called only at export time; keeps the main thread free during interaction.
function buildSVGString(
  mode: TreatmentMode, resolution: number, dotShape: DotShape,
  colorMode: ColorMode, sourceDiagram: SourceDiagram,
  vw: number, vh: number,
): string {
  const bg = colorMode === "inverted" ? INK : PAPER;
  const fg = colorMode === "inverted" ? PAPER : colorMode === "ember" ? DUSK : INK;
  const dotSpacing = spacingFromResolution(resolution);
  let body = "";

  if (mode === "dots") {
    const dots = sourceDiagram === "option-field"
      ? computeOptionFieldDots(vw, vh, dotSpacing)
      : computeDots(vw, vh, dotSpacing);
    body = dots.map((d) =>
      dotShape === "circle"
        ? `<circle cx="${d.cx.toFixed(1)}" cy="${d.cy.toFixed(1)}" r="${d.r.toFixed(2)}" fill="${fg}"/>`
        : `<rect x="${(d.cx - d.r).toFixed(1)}" y="${(d.cy - d.r).toFixed(1)}" width="${(d.r * 2).toFixed(2)}" height="${(d.r * 2).toFixed(2)}" fill="${fg}"/>`,
    ).join("");
  } else if (sourceDiagram === "three-regimes") {
    const padX = vw * 0.10, padY = vh * 0.10;
    const S = Math.min((vw - 2 * padX) / 400, (vh - 2 * padY) / 200);
    const offX = (vw - 400 * S) / 2, offY = (vh - 200 * S) / 2;
    const tx = (x: number, y: number) => `${offX + x * S},${offY + y * S}`;
    const [mx, my] = [offX + 200 * S, offY + 116 * S];
    const [frX, frY] = [offX + 40 * S, offY + 39.5 * S];
    const [foX, foY] = [offX + 240 * S, offY + 39.5 * S];
    const [fiX, fiY] = [offX + 50 * S, offY + 134 * S];
    body = MARK_LINES.map(([x1, y1, x2, y2]) =>
      `<line x1="${tx(x1, y1).split(",")[0]}" y1="${tx(x1, y1).split(",")[1]}" x2="${tx(x2, y2).split(",")[0]}" y2="${tx(x2, y2).split(",")[1]}" stroke="${DUSK}" stroke-width="1.5" stroke-linecap="round"/>`
    ).join("") +
    `<circle cx="${mx}" cy="${my}" r="${3 * S}" fill="${DUSK}"/>` +
    `<rect x="${frX}" y="${frY}" width="${120 * S}" height="${45 * S}" fill="${PAPER}" stroke="${fg}" stroke-width="1.2"/>` +
    `<rect x="${foX}" y="${foY}" width="${120 * S}" height="${45 * S}" fill="${PAPER}" stroke="${fg}" stroke-width="1.2"/>` +
    `<rect x="${fiX}" y="${fiY}" width="${300 * S}" height="${46 * S}" fill="${PAPER}" stroke="${OCEAN}" stroke-width="1.2" stroke-dasharray="6 4"/>`;
  } else {
    const spacing = Math.max(3, dotSpacing);
    const segW = Math.max(4, Math.round(spacing * 0.85));
    const pad = Math.round(vw * 0.04);
    const maxW = spacing * 1.5;
    const usableW = vw - pad * 2;
    const parts: string[] = [];
    for (let y = spacing / 2; y < vh; y += spacing) {
      const yRel = y / vh;
      for (let x = pad; x < vw - pad; x += segW) {
        const sh = spatialWeight((x - pad) / usableW, yRel, 0.72, 0.60, 0.52, 0.34, maxW);
        parts.push(`<rect x="${x}" y="${(y - sh / 2).toFixed(1)}" width="${segW}" height="${sh.toFixed(1)}" fill="${fg}"/>`);
      }
    }
    body = parts.join("");
  }

  return `<?xml version="1.0" standalone="no"?><svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg"><rect width="${vw}" height="${vh}" fill="${bg}"/>${body}</svg>`;
}

// ── Utilities ─────────────────────────────────────────────────────────
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

// ── Statics ───────────────────────────────────────────────────────────
const FORMATS: { id: TreatmentFormat; label: string; w: number; h: number }[] = [
  { id: "card",   label: "1200 × 630",  w: 1200, h: 630  },
  { id: "square", label: "1200 × 1200", w: 1200, h: 1200 },
];

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "ink",      label: "Ink on paper" },
  { id: "ember",    label: "Dusk on paper" },
  { id: "inverted", label: "Paper on ink" },
];

// ── Generator ─────────────────────────────────────────────────────────
export function ImageTreatmentGenerator() {
  const [sourceDiagram, setSourceDiagram] = useState<SourceDiagram>("three-regimes");
  const [mode,          setMode]          = useState<TreatmentMode>("dots");
  const [resolution,    setResolution]    = useState(30);
  const [dotShape,      setDotShape]      = useState<DotShape>("circle");
  const [colorMode,     setColorMode]     = useState<ColorMode>("ink");
  const [format,        setFormat]        = useState<TreatmentFormat>("card");
  const [exporting,     setExporting]     = useState<string | null>(null);

  // Debounce resolution so the canvas only redraws after the slider stops
  const debouncedResolution = useDebounce(resolution, 120);

  const activeFormat = FORMATS.find((f) => f.id === format)!;
  const dotSpacing = spacingFromResolution(debouncedResolution);

  const handle = async (type: string) => {
    setExporting(type);
    try {
      const { w, h } = activeFormat;
      const slug = `xco-treatment-${format}-${mode === "dots" ? `r${debouncedResolution}` : "sharp"}`;
      const svgStr = buildSVGString(mode, debouncedResolution, dotShape, colorMode, sourceDiagram, w, h);

      if (type === "svg") {
        downloadBlob(new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" }), `${slug}.svg`);
      }
      if (type === "png") {
        const res = await fetch("/api/export/png", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ svg: svgStr, width: w, height: h }),
        });
        if (res.ok) downloadBlob(await res.blob(), `${slug}.png`);
      }
    } finally {
      setExporting(null);
    }
  };

  const previewProps = {
    mode, resolution: debouncedResolution, dotShape, colorMode, format, sourceDiagram,
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        <div className="space-y-2">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Source</h2>
          <div className="flex gap-0">
            {(["three-regimes", "option-field"] as const).map((s) => (
              <button key={s} onClick={() => setSourceDiagram(s)}
                className={`flex-1 font-mono text-xs px-3 py-2 border transition-colors ${
                  sourceDiagram === s
                    ? "bg-xco-ink text-xco-paper border-xco-ink"
                    : "text-xco-ink-muted border-xco-ink/[0.2] hover:border-xco-ink hover:text-xco-ink"
                }`}>
                {s === "three-regimes" ? "Three Regimes" : "Option Field"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Mode</h2>
          <div className="flex gap-0">
            {(["dots", "sharp"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 font-mono text-xs px-3 py-2 border transition-colors ${
                  mode === m
                    ? "bg-xco-ink text-xco-paper border-xco-ink"
                    : "text-xco-ink-muted border-xco-ink/[0.2] hover:border-xco-ink hover:text-xco-ink"
                }`}>
                {m === "dots" ? "dot-matrix" : "sharp"}
              </button>
            ))}
          </div>
          <p className="font-mono text-xs text-xco-ink-muted italic">
            {mode === "dots"
              ? "Dot grid — coarse reads as texture, fine reads as form"
              : "Crisp geometric mark — no treatment"}
          </p>
        </div>

        {mode === "dots" && (
          <div className="space-y-3 border-t border-xco-ink/[0.12] pt-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
                Resolution
              </h2>
              <span className="font-mono text-xs text-xco-dusk">{dotSpacing}px grid</span>
            </div>
            <input type="range" min={0} max={100} step={1}
              value={resolution} onChange={(e) => setResolution(Number(e.target.value))}
              className="w-full accent-xco-dusk" />
            <div className="flex justify-between font-mono text-xs text-xco-ink-muted">
              <span>coarse</span>
              <span>fine</span>
            </div>
            <p className="font-mono text-xs text-xco-ink-muted italic">
              {resolution <= 20 && "Abstract texture — mark unreadable"}
              {resolution > 20 && resolution <= 45 && "Suggested: placeholder / teaser"}
              {resolution > 45 && resolution <= 70 && "Suggested: evolving state"}
              {resolution > 70 && "Mark readable — approaching sharp"}
            </p>
          </div>
        )}

        {mode === "dots" && (
          <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Dot shape</h2>
            <div className="flex gap-0">
              {(["circle", "square"] as const).map((s) => (
                <button key={s} onClick={() => setDotShape(s)}
                  className={`flex-1 font-mono text-xs px-3 py-2 border transition-colors ${
                    dotShape === s
                      ? "bg-xco-ink text-xco-paper border-xco-ink"
                      : "text-xco-ink-muted border-xco-ink/[0.2] hover:border-xco-ink hover:text-xco-ink"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Colour</h2>
          {COLOR_MODES.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="color" value={id} checked={colorMode === id}
                onChange={() => setColorMode(id)} className="accent-xco-dusk" />
              <span className="font-mono text-xs text-xco-ink">{label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Format</h2>
          {FORMATS.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="format" value={id} checked={format === id}
                onChange={() => setFormat(id)} className="accent-xco-dusk" />
              <span className="font-mono text-xs text-xco-ink">{label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-3">Export</h2>
          {[
            { id: "svg", label: `SVG — ${activeFormat.label}` },
            { id: "png", label: `PNG — ${activeFormat.label}` },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => handle(id)} disabled={exporting !== null}
              className="w-full text-left font-mono text-xs text-xco-ink border border-xco-ink/[0.2] px-3 py-2 hover:border-xco-ink hover:bg-xco-ink/[0.04] transition-colors disabled:opacity-40">
              {exporting === id ? "exporting…" : `↓ ${label}`}
            </button>
          ))}
        </div>
      </aside>

      {/* Canvas preview — renders instantly at any resolution */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink/[0.12] overflow-hidden"
          style={{ background: colorMode === "inverted" ? INK : PAPER }}>
          <PreviewCanvas {...previewProps} />
        </div>
        <p className="font-mono text-xs text-xco-ink-muted">
          {mode === "dots"
            ? `${dotSpacing}px dot grid · ${format === "card" ? "1200×630" : "1200×1200"}`
            : `Crisp geometric mark · ${format === "card" ? "1200×630" : "1200×1200"}`}
        </p>
      </div>
    </div>
  );
}
