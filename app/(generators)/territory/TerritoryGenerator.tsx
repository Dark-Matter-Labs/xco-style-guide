"use client";

import { useRef, useState } from "react";
import {
  TerritoryDiagram,
  type TerritoryFormat,
  type TerritoryColorMode,
  type TerritoryItem,
} from "./TerritoryDiagram";

// ── Default data ─────────────────────────────────────────────────────────────

let nextId = 9;

interface ItemState extends TerritoryItem {
  id: number;   // stable React key
}

const DEFAULT_ITEMS: ItemState[] = [
  { id: 1, label: "Field",         sublabel: "systemic ground",      weight: 100 },
  { id: 2, label: "Frontier",      sublabel: "open optionality",     weight: 65  },
  { id: 3, label: "Fortress",      sublabel: "structural advantage", weight: 50  },
  { id: 4, label: "Optionality",   sublabel: "",                     weight: 38  },
  { id: 5, label: "Systemic Risk", sublabel: "",                     weight: 28  },
  { id: 6, label: "Transition",    sublabel: "",                     weight: 20  },
  { id: 7, label: "Emergence",     sublabel: "",                     weight: 15  },
  { id: 8, label: "Leverage",      sublabel: "",                     weight: 10  },
];

// ── Export helpers ───────────────────────────────────────────────────────────

function svgToString(el: SVGSVGElement): string {
  return (
    '<?xml version="1.0" standalone="no"?>\n' +
    new XMLSerializer().serializeToString(el)
  );
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function exportSVG(el: SVGSVGElement | null, name: string) {
  if (!el) return;
  downloadBlob(new Blob([svgToString(el)], { type: "image/svg+xml;charset=utf-8" }), name);
}

async function exportPNG(
  el: SVGSVGElement | null,
  w: number, h: number,
  name: string,
): Promise<void> {
  if (!el) return;
  const res = await fetch("/api/export/png", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg: svgToString(el), width: w, height: h }),
  });
  if (!res.ok) throw new Error(`PNG export failed: ${res.status}`);
  downloadBlob(await res.blob(), name);
}

// ── Slider ───────────────────────────────────────────────────────────────────

function Slider({
  label, value, onChange, min, max, step = 1, display,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; display?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">{label}</span>
        <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk">{display ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-xco-dusk" />
    </div>
  );
}

// ── Generator ────────────────────────────────────────────────────────────────

const FORMATS: { id: TerritoryFormat; label: string; w: number; h: number }[] = [
  { id: "hero",   label: "1200 × 630",  w: 1200, h: 630  },
  { id: "square", label: "1200 × 1200", w: 1200, h: 1200 },
];

const COLOR_MODES: { id: TerritoryColorMode; label: string; hint: string }[] = [
  { id: "ink",      label: "Ink",      hint: "paper cells on ink" },
  { id: "blueprint", label: "Blueprint", hint: "teal → ocean → navy" },
  { id: "warmth",   label: "Warmth",   hint: "sand → dusk" },
  { id: "spectrum", label: "Spectrum",  hint: "warm → cold by rank" },
];

export function TerritoryGenerator() {
  const [items,        setItems]        = useState<ItemState[]>(DEFAULT_ITEMS);
  const [colorMode,    setColorMode]    = useState<TerritoryColorMode>("ink");
  const [cornerRadius, setCornerRadius] = useState(10);
  const [gutter,       setGutter]       = useState(8);
  const [format,       setFormat]       = useState<TerritoryFormat>("hero");
  const [exporting,    setExporting]    = useState<string | null>(null);

  // Refs for each format — hidden SVGs for export
  const heroRef   = useRef<SVGSVGElement>(null);
  const squareRef = useRef<SVGSVGElement>(null);

  const activeRef = format === "hero" ? heroRef : squareRef;
  const activeDim = FORMATS.find(f => f.id === format)!;

  const diagramProps = {
    items: items
      .filter(i => i.label.trim() && i.weight > 0)
      .map(({ label, sublabel, weight }) => ({
        label,
        sublabel: sublabel || undefined,
        weight,
      })),
    colorMode,
    cornerRadius,
    gutter,
  };

  // ── Item editing ──────────────────────────────────────────────────────────

  const updateItem = (id: number, patch: Partial<ItemState>) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));

  const removeItem = (id: number) =>
    setItems(prev => prev.filter(it => it.id !== id));

  const addItem = () => {
    const id = nextId++;
    setItems(prev => [...prev, { id, label: "", sublabel: "", weight: 20 }]);
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const handle = async (type: string) => {
    setExporting(type);
    try {
      const slug = `xco-territory-${format}-${colorMode}`;
      if (type === "svg") exportSVG(activeRef.current, `${slug}.svg`);
      if (type === "png") await exportPNG(activeRef.current, activeDim.w, activeDim.h, `${slug}.png`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* ── Controls ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        {/* Items editor */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
              Concepts
            </h2>
            <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">weight</span>
          </div>

          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-0.5 min-w-0">
                  <input
                    type="text"
                    value={item.label}
                    onChange={e => updateItem(item.id, { label: e.target.value })}
                    placeholder="Concept"
                    className="w-full bg-transparent border-b border-xco-ink font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink py-0.5 focus:outline-none focus:border-xco-ink placeholder:text-xco-ink/50"
                  />
                  <input
                    type="text"
                    value={item.sublabel ?? ""}
                    onChange={e => updateItem(item.id, { sublabel: e.target.value })}
                    placeholder="sublabel"
                    className="w-full bg-transparent font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink py-0.5 focus:outline-none placeholder:opacity-40"
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <input
                    type="number"
                    value={item.weight}
                    min={1} max={999}
                    onChange={e => updateItem(item.id, { weight: Math.max(1, Number(e.target.value)) })}
                    className="w-12 bg-transparent border-b border-xco-ink font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk text-right py-0.5 focus:outline-none"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 2}
                    className="font-mono font-medium text-[0.9375rem] leading-[1.6] leading-none text-xco-ink hover:text-xco-ink transition-colors disabled:opacity-20 px-0.5"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="w-full text-left font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink border border-dashed border-xco-ink px-2 py-1.5 hover:border-xco-ink hover:text-xco-ink transition-colors"
          >
            + Add concept
          </button>

          <button
            onClick={() => setItems(DEFAULT_ITEMS)}
            className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink hover:text-xco-ink transition-colors"
          >
            ↺ Reset to default
          </button>
        </div>

        {/* Colour mode */}
        <div className="space-y-2 pt-4">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">Colour</h2>
          {COLOR_MODES.map(({ id, label, hint }) => (
            <label key={id} className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="color" value={id}
                checked={colorMode === id} onChange={() => setColorMode(id)}
                className="accent-xco-dusk mt-0.5" />
              <span className="space-y-0.5">
                <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink block">{label}</span>
                <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink block">{hint}</span>
              </span>
            </label>
          ))}
        </div>

        {/* Corner radius */}
        <div className="space-y-3 pt-4">
          <Slider
            label="Corner radius"
            value={cornerRadius}
            onChange={setCornerRadius}
            min={0} max={48}
            display={`${cornerRadius}px`}
          />
          <Slider
            label="Gutter"
            value={gutter}
            onChange={setGutter}
            min={2} max={20}
            display={`${gutter}px`}
          />
        </div>

        {/* Format */}
        <div className="space-y-2 pt-4">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">Format</h2>
          {FORMATS.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="format" value={id}
                checked={format === id} onChange={() => setFormat(id)}
                className="accent-xco-dusk" />
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">{label}</span>
            </label>
          ))}
        </div>

        {/* Export */}
        <div className="space-y-2 pt-4">
          <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-3">Export</h2>
          {[
            { id: "svg", label: `SVG — ${activeDim.label}` },
            { id: "png", label: `PNG — ${activeDim.label}` },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => handle(id)} disabled={exporting !== null}
              className="w-full text-left font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink border border-xco-ink px-3 py-2 hover:border-xco-ink hover:bg-xco-ink/[0.04] transition-colors disabled:opacity-40">
              {exporting === id ? "exporting…" : `↓ ${label}`}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Preview ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink overflow-hidden">
          <TerritoryDiagram {...diagramProps} format={format} />
        </div>
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
          {activeDim.label} · {diagramProps.items.length} cells · cell area ∝ weight
        </p>
      </div>

      {/* Hidden SVGs for export (render all formats) */}
      <div className="sr-only" aria-hidden="true">
        <TerritoryDiagram ref={heroRef}   {...diagramProps} format="hero"   />
        <TerritoryDiagram ref={squareRef} {...diagramProps} format="square" />
      </div>
    </div>
  );
}
