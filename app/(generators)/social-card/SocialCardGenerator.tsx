"use client";

import { useRef, useState } from "react";
import { SocialCardDiagram } from "./SocialCardDiagram";
import type { CardFormat, CardLayout, DiagramType } from "./SocialCardDiagram";

function svgToString(el: SVGSVGElement): string {
  return '<?xml version="1.0" standalone="no"?>\n' +
    new XMLSerializer().serializeToString(el);
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function exportSVG(el: SVGSVGElement | null, name: string) {
  if (!el) return;
  downloadBlob(new Blob([svgToString(el)], { type: "image/svg+xml;charset=utf-8" }), name);
}

async function exportPNG(el: SVGSVGElement | null, w: number, h: number, name: string) {
  if (!el) return;
  const res = await fetch("/api/export/png", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg: svgToString(el), width: w, height: h }),
  });
  if (!res.ok) return;
  downloadBlob(await res.blob(), name);
}

function FieldInput({ label, value, onChange, hint, mono }: {
  label: string; value: string; onChange: (v: string) => void;
  hint?: string; mono?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-xs text-xco-ink-muted uppercase tracking-wider">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent border-b border-xco-ink/[0.2] text-base text-xco-ink py-1 focus:outline-none focus:border-xco-ink transition-colors ${mono ? "font-mono text-sm" : "font-body"}`} />
      {hint && <p className="font-mono text-xs text-xco-ink-muted italic">{hint}</p>}
    </label>
  );
}

const LAYOUTS: { id: CardLayout; label: string; hint: string }[] = [
  { id: "typographic", label: "Typographic", hint: "Clean text, full-width" },
  { id: "diagram",     label: "Diagram",     hint: "Text left, diagram right" },
  { id: "abstract",    label: "Abstract",    hint: "Gradient background, paper text" },
];

const DIAGRAM_TYPES: { id: DiagramType; label: string; hint: string }[] = [
  { id: "three-regimes", label: "Three Regimes", hint: "Frontier / Fortress / Field mark" },
  { id: "option-field",  label: "Option Field",  hint: "Variable-weight scanline field" },
];

const FORMATS: { id: CardFormat; label: string; size: string; w: number; h: number }[] = [
  { id: "card",   label: "Card",   size: "1200 × 630", w: 1200, h: 630 },
  { id: "square", label: "Square", size: "1080 × 1080", w: 1080, h: 1080 },
];

export function SocialCardGenerator() {
  const [headline, setHeadline] = useState("Field is the precondition for everything else");
  const [tag, setTag]           = useState("Three Regimes");
  const [byline, setByline]     = useState("Expanding Civilisational Optionality");
  const [layout, setLayout]         = useState<CardLayout>("typographic");
  const [diagramType, setDiagramType] = useState<DiagramType>("three-regimes");
  const [format, setFormat]         = useState<CardFormat>("card");
  const [exporting, setExporting]   = useState<string | null>(null);

  const cardRef   = useRef<SVGSVGElement>(null);
  const squareRef = useRef<SVGSVGElement>(null);

  const activeRef = format === "card" ? cardRef : squareRef;
  const activeFormat = FORMATS.find((f) => f.id === format)!;

  const props = { headline, tag, byline, layout, diagramType };

  const handle = async (type: string) => {
    setExporting(type);
    try {
      const { w, h } = activeFormat;
      const slug = `xco-social-${format}-${layout}`;
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

        <div className="space-y-2">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Layout</h2>
          <div className="space-y-1">
            {LAYOUTS.map(({ id, label, hint }) => (
              <label key={id} className="flex items-start gap-2 cursor-pointer">
                <input type="radio" name="layout" value={id} checked={layout === id}
                  onChange={() => setLayout(id)} className="accent-xco-ember mt-0.5 shrink-0" />
                <span>
                  <span className="font-mono text-xs text-xco-ink block">{label}</span>
                  <span className="font-mono text-xs text-xco-ink-muted">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {layout === "diagram" && (
          <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Diagram</h2>
            <div className="space-y-1">
              {DIAGRAM_TYPES.map(({ id, label, hint }) => (
                <label key={id} className="flex items-start gap-2 cursor-pointer">
                  <input type="radio" name="diagramType" value={id} checked={diagramType === id}
                    onChange={() => setDiagramType(id)} className="accent-xco-ember mt-0.5 shrink-0" />
                  <span>
                    <span className="font-mono text-xs text-xco-ink block">{label}</span>
                    <span className="font-mono text-xs text-xco-ink-muted">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Content</h2>
          <label className="block space-y-1">
            <span className="font-mono text-xs text-xco-ink-muted uppercase tracking-wider">Headline</span>
            <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={3}
              className="w-full bg-transparent border border-xco-ink/[0.2] font-body text-base text-xco-ink py-2 px-2 focus:outline-none focus:border-xco-ink transition-colors resize-none" />
            <p className="font-mono text-xs text-xco-ink-muted italic">Keep under 60 chars for clean wrapping</p>
          </label>
          <FieldInput label="Tag" value={tag} onChange={setTag}
            hint='Short label — shown as [TAG]' mono />
          <FieldInput label="Byline" value={byline} onChange={setByline}
            hint="Author, org, or publication" />
        </div>

        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Format</h2>
          {FORMATS.map(({ id, label, size }) => (
            <label key={id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="format" value={id} checked={format === id}
                onChange={() => setFormat(id)} className="accent-xco-ember" />
              <span className="font-mono text-xs text-xco-ink">{label}</span>
              <span className="font-mono text-xs text-xco-ink-muted">{size}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-3">Export</h2>
          {[
            { id: "svg", label: `SVG — ${activeFormat.size}` },
            { id: "png", label: `PNG — ${activeFormat.size}` },
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
        <div className="border border-xco-ink/[0.12] overflow-hidden bg-xco-paper">
          <SocialCardDiagram {...props} format={format} />
        </div>
        <p className="font-mono text-xs text-xco-ink-muted">
          {format === "card" ? "1200 × 630 — LinkedIn / Substack OG" : "1080 × 1080 — Instagram / social square"}
        </p>
      </div>

      {/* Hidden refs for export */}
      <div className="sr-only" aria-hidden="true">
        <SocialCardDiagram ref={cardRef}   {...props} format="card"   />
        <SocialCardDiagram ref={squareRef} {...props} format="square" />
      </div>
    </div>
  );
}
