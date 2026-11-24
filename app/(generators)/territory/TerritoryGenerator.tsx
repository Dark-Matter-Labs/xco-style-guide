"use client";

import { useRef, useState } from "react";
import {
  TerritoryDiagram,
  type TerritoryFormat,
  type TerritoryColorMode,
  type TerritoryItem,
} from "./TerritoryDiagram";
import {
  Button, ExportError, labelClass, RadioList, Section, Slider, useExport,
} from "@/components/generator-controls";
import { exportPNG, exportSVG } from "@/lib/media/export";

// The system's largest corner radius is 0.125rem: 2 px at the 16 px root.
const MAX_RADIUS = 2;

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
  { id: 8, label: "Reversibility", sublabel: "",                     weight: 10  },
];

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

const input = `w-full bg-transparent ${labelClass} py-0.5 placeholder:text-xco-ink-weak`;

export function TerritoryGenerator() {
  const [items,        setItems]        = useState<ItemState[]>(DEFAULT_ITEMS);
  const [colorMode,    setColorMode]    = useState<TerritoryColorMode>("ink");
  const [cornerRadius, setCornerRadius] = useState(MAX_RADIUS);
  const [gutter,       setGutter]       = useState(8);
  const [format,       setFormat]       = useState<TerritoryFormat>("hero");

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

  const { busy: exporting, error, run } = useExport();
  const handle = (type: string) =>
    run(type, () => {
      const slug = `xco-territory-${format}-${colorMode}`;
      return type === "svg"
        ? exportSVG(activeRef.current, `${slug}.svg`)
        : exportPNG(activeRef.current, activeDim.w, activeDim.h, `${slug}.png`);
    });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* ── Controls ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <Section title="Concepts">
          <p className={`${labelClass} text-xco-ink-muted`}>Label, sublabel and weight; cell area follows weight.</p>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-0.5 min-w-0">
                  <input
                    type="text"
                    value={item.label}
                    onChange={e => updateItem(item.id, { label: e.target.value })}
                    placeholder="Concept"
                    aria-label="Concept"
                    className={`${input} border-b border-xco-ink`}
                  />
                  <input
                    type="text"
                    value={item.sublabel ?? ""}
                    onChange={e => updateItem(item.id, { sublabel: e.target.value })}
                    placeholder="sublabel"
                    aria-label={`Sublabel for ${item.label || "concept"}`}
                    className={input}
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <input
                    type="number"
                    value={item.weight}
                    min={1} max={999}
                    aria-label={`Weight of ${item.label || "concept"}`}
                    onChange={e => updateItem(item.id, { weight: Math.max(1, Number(e.target.value)) })}
                    className={`w-12 bg-transparent border-b border-xco-ink ${labelClass} text-xco-dusk-ink text-right py-0.5`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 2}
                    aria-label={`Remove ${item.label || "concept"}`}
                    className={`${labelClass} leading-none disabled:opacity-20 min-w-6 min-h-6 inline-flex items-center justify-center`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={addItem}>+ Add concept</Button>
          <Button onClick={() => setItems(DEFAULT_ITEMS)}>↺ Reset to default</Button>
        </Section>

        <Section title="Colour">
          <RadioList name="color" value={colorMode} options={COLOR_MODES} onChange={setColorMode} />
        </Section>

        <Section title="Cells">
          <Slider label="Corner radius" value={cornerRadius} onChange={setCornerRadius} min={0} max={MAX_RADIUS} step={0.5} display={`${cornerRadius}px`} />
          <Slider label="Gutter" value={gutter} onChange={setGutter} min={2} max={20} step={1} display={`${gutter}px`} />
        </Section>

        <Section title="Format">
          <RadioList name="format" value={format} options={FORMATS} onChange={setFormat} />
        </Section>

        <Section title="Export">
          {[
            { id: "svg", label: `SVG — ${activeDim.label}` },
            { id: "png", label: `PNG — ${activeDim.label}` },
          ].map(({ id, label }) => (
            <Button key={id} onClick={() => handle(id)} disabled={exporting !== null}>
              {exporting === id ? "exporting…" : `↓ ${label}`}
            </Button>
          ))}
          <ExportError error={error} />
        </Section>
      </aside>

      {/* ── Preview ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink overflow-hidden">
          <TerritoryDiagram {...diagramProps} format={format} />
        </div>
        <p className={labelClass}>
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
