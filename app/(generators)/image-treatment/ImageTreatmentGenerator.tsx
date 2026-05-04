"use client";

import { useRef, useState } from "react";
import { ImageTreatmentDiagram, spacingFromResolution } from "./ImageTreatmentDiagram";
import type { DotShape, ColorMode, TreatmentFormat, TreatmentMode } from "./ImageTreatmentDiagram";

function svgToString(el: SVGSVGElement): string {
  return '<?xml version="1.0" standalone="no"?>\n' +
    new XMLSerializer().serializeToString(el);
}
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
function exportSVG(el: SVGSVGElement | null, name: string) {
  if (!el) return;
  downloadBlob(new Blob([svgToString(el)], { type: "image/svg+xml;charset=utf-8" }), name);
}
async function exportPNG(el: SVGSVGElement | null, w: number, h: number, name: string) {
  if (!el) return;
  const res = await fetch("/api/export/png", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg: svgToString(el), width: w, height: h }),
  });
  if (res.ok) downloadBlob(await res.blob(), name);
}

const FORMATS: { id: TreatmentFormat; label: string; w: number; h: number }[] = [
  { id: "card",   label: "1200 × 630",  w: 1200, h: 630  },
  { id: "square", label: "1200 × 1200", w: 1200, h: 1200 },
];

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "ink",      label: "Ink on paper" },
  { id: "ember",    label: "Ember on paper" },
  { id: "inverted", label: "Paper on ink" },
];

export function ImageTreatmentGenerator() {
  const [mode,       setMode]       = useState<TreatmentMode>("dots");
  const [resolution, setResolution] = useState(30);
  const [dotShape,   setDotShape]   = useState<DotShape>("circle");
  const [colorMode,  setColorMode]  = useState<ColorMode>("ink");
  const [format,     setFormat]     = useState<TreatmentFormat>("card");
  const [exporting,  setExporting]  = useState<string | null>(null);

  const cardRef   = useRef<SVGSVGElement>(null);
  const squareRef = useRef<SVGSVGElement>(null);
  const activeRef = format === "card" ? cardRef : squareRef;
  const activeFormat = FORMATS.find((f) => f.id === format)!;

  const props = { mode, resolution, dotShape, colorMode };
  const dotSpacing = spacingFromResolution(resolution);

  const handle = async (type: string) => {
    setExporting(type);
    try {
      const { w, h } = activeFormat;
      const slug = `xco-treatment-${format}-${mode === "dots" ? `r${resolution}` : "sharp"}`;
      if (type === "svg") exportSVG(activeRef.current, `${slug}.svg`);
      if (type === "png") await exportPNG(activeRef.current, w, h, `${slug}.png`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        {/* Mode */}
        <div className="space-y-2">
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

        {/* Resolution — only for dots mode */}
        {mode === "dots" && (
          <div className="space-y-3 border-t border-xco-ink/[0.12] pt-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
                Resolution
              </h2>
              <span className="font-mono text-xs text-xco-ember">{dotSpacing}px grid</span>
            </div>
            <input type="range" min={0} max={100} step={1}
              value={resolution} onChange={(e) => setResolution(Number(e.target.value))}
              className="w-full accent-xco-ember" />
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

        {/* Dot shape */}
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

        {/* Colour */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Colour</h2>
          {COLOR_MODES.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="color" value={id} checked={colorMode === id}
                onChange={() => setColorMode(id)} className="accent-xco-ember" />
              <span className="font-mono text-xs text-xco-ink">{label}</span>
            </label>
          ))}
        </div>

        {/* Format */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Format</h2>
          {FORMATS.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="format" value={id} checked={format === id}
                onChange={() => setFormat(id)} className="accent-xco-ember" />
              <span className="font-mono text-xs text-xco-ink">{label}</span>
            </label>
          ))}
        </div>

        {/* Export */}
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

      {/* Preview */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink/[0.12] overflow-hidden"
          style={{ background: colorMode === "inverted" ? "#1C1B17" : "#FFFFFF" }}>
          <ImageTreatmentDiagram {...props} format={format} />
        </div>
        <p className="font-mono text-xs text-xco-ink-muted">
          {mode === "dots"
            ? `${dotSpacing}px dot grid · ${format === "card" ? "1200×630" : "1200×1200"}`
            : `Crisp geometric mark · ${format === "card" ? "1200×630" : "1200×1200"}`}
        </p>
      </div>

      {/* Hidden refs for export */}
      <div className="sr-only" aria-hidden="true">
        <ImageTreatmentDiagram ref={cardRef}   {...props} format="card"   />
        <ImageTreatmentDiagram ref={squareRef} {...props} format="square" />
      </div>
    </div>
  );
}
