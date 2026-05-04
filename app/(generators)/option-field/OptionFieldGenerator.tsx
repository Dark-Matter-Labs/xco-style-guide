"use client";

import { useRef, useState } from "react";
import { OptionFieldDiagram } from "./OptionFieldDiagram";
import type { FieldFormat, FieldColorMode } from "./OptionFieldDiagram";

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

const FORMATS: { id: FieldFormat; label: string; w: number; h: number }[] = [
  { id: "hero",   label: "1200 × 630",  w: 1200, h: 630  },
  { id: "square", label: "1200 × 1200", w: 1200, h: 1200 },
  { id: "mark",   label: "400 × 200",   w: 400,  h: 200  },
];

const COLOR_MODES: { id: FieldColorMode; label: string; hint: string }[] = [
  { id: "ink",       label: "Ink",       hint: "ink on white" },
  { id: "spectrum",  label: "Spectrum",  hint: "cool → ink → ember by register" },
  { id: "inverted",  label: "Inverted",  hint: "white on ink" },
  { id: "blueprint", label: "Blueprint", hint: "navy ground — teal to ocean scanlines" },
  { id: "warmth",    label: "Warmth",    hint: "dusk to sand on white" },
];

function Slider({
  label, hint, value, onChange, min = 0, max = 1, step = 0.01,
  display,
}: {
  label: string; hint?: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; display?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
          {label}
        </span>
        <span className="font-mono text-xs text-xco-dusk">
          {display ?? value.toFixed(2)}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-xco-dusk" />
      {hint && <p className="font-mono text-xs text-xco-ink-muted italic">{hint}</p>}
    </div>
  );
}

export function OptionFieldGenerator() {
  const [fieldStr,    setFieldStr]    = useState(0.72);
  const [frontierStr, setFrontierStr] = useState(0.60);
  const [fortressStr, setFortressStr] = useState(0.52);
  const [volatility,  setVolatility]  = useState(0.34);
  const [resolution,  setResolution]  = useState(55);
  const [colorMode,   setColorMode]   = useState<FieldColorMode>("ink");
  const [format,      setFormat]      = useState<FieldFormat>("hero");
  const [exporting,   setExporting]   = useState<string | null>(null);

  const heroRef   = useRef<SVGSVGElement>(null);
  const squareRef = useRef<SVGSVGElement>(null);
  const markRef   = useRef<SVGSVGElement>(null);

  const activeRef = format === "hero" ? heroRef : format === "square" ? squareRef : markRef;
  const activeDim = FORMATS.find(f => f.id === format)!;

  const props = { fieldStr, frontierStr, fortressStr, volatility, resolution, colorMode };

  const handle = async (type: string) => {
    setExporting(type);
    try {
      const slug = `xco-option-field-${format}`;
      if (type === "svg") exportSVG(activeRef.current, `${slug}.svg`);
      if (type === "png") await exportPNG(activeRef.current, activeDim.w, activeDim.h, `${slug}.png`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        {/* Field composition */}
        <div className="space-y-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
            Regime composition
          </h2>
          <Slider label="Field" hint="systemic foundation — lower register"
            value={fieldStr} onChange={setFieldStr} />
          <Slider label="Frontier" hint="open, emerging — upper left"
            value={frontierStr} onChange={setFrontierStr} />
          <Slider label="Fortress" hint="concentrated, constrained — upper right"
            value={fortressStr} onChange={setFortressStr} />
        </div>

        {/* Volatility */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <Slider label="Volatility" hint="spatial variation — noise in the field"
            value={volatility} onChange={setVolatility} />
        </div>

        {/* Resolution */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <Slider label="Resolution" min={0} max={100} step={1}
            value={resolution} onChange={setResolution}
            display={`${Math.round(10 - (resolution / 100) * 7)}px`}
            hint="scanline spacing — coarse to fine"
          />
        </div>

        {/* Color */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Colour</h2>
          {COLOR_MODES.map(({ id, label, hint }) => (
            <label key={id} className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="color" value={id} checked={colorMode === id}
                onChange={() => setColorMode(id)} className="accent-xco-dusk mt-0.5" />
              <span className="space-y-0.5">
                <span className="font-mono text-xs text-xco-ink block">{label}</span>
                <span className="font-mono text-xs text-xco-ink-muted block">{hint}</span>
              </span>
            </label>
          ))}
        </div>

        {/* Format */}
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

        {/* Export */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-3">Export</h2>
          {[
            { id: "svg", label: `SVG — ${activeDim.label}` },
            { id: "png", label: `PNG — ${activeDim.label}` },
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
          style={{ background: colorMode === "inverted" ? "#1C1B17" : colorMode === "blueprint" ? "#192640" : "#FFFFFF" }}>
          <OptionFieldDiagram {...props} format={format} />
        </div>
        <p className="font-mono text-xs text-xco-ink-muted">
          {activeDim.label} · {Math.round(10 - (resolution / 100) * 7)}px scanlines
          · f{fieldStr.toFixed(2)} fr{frontierStr.toFixed(2)} fo{fortressStr.toFixed(2)}
        </p>
      </div>

      {/* Hidden refs for export */}
      <div className="sr-only" aria-hidden="true">
        <OptionFieldDiagram ref={heroRef}   {...props} format="hero"   />
        <OptionFieldDiagram ref={squareRef} {...props} format="square" />
        <OptionFieldDiagram ref={markRef}   {...props} format="mark"   />
      </div>
    </div>
  );
}
