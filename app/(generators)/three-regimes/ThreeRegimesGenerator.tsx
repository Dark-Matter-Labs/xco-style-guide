"use client";

import { useRef, useState } from "react";
import { ThreeRegimesDiagram, DiagramFormat, DiagramColorScheme } from "./ThreeRegimesDiagram";
import { AbstractThreeRegimesDiagram } from "./AbstractThreeRegimesDiagram";
import type { DiagramLabels } from "./ThreeRegimesDiagram";
import { WIP } from "@/components/WIP";

type DiagramMode = "structural" | "abstract";

// ── Export helpers ──────────────────────────────────────────────────

function svgToString(el: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  return '<?xml version="1.0" standalone="no"?>\n' + serializer.serializeToString(el);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportSVG(el: SVGSVGElement | null, filename: string) {
  if (!el) return;
  const blob = new Blob([svgToString(el)], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}

async function exportPNGViaServer(
  el: SVGSVGElement | null,
  width: number,
  height: number,
  filename: string,
): Promise<void> {
  if (!el) return;
  const svg = svgToString(el);
  const res = await fetch("/api/export/png", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg, width, height }),
  });
  if (!res.ok) throw new Error(`PNG export failed: ${res.status}`);
  const blob = await res.blob();
  downloadBlob(blob, filename);
}

// ── Input primitives ────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-xs text-xco-ink-muted uppercase tracking-wider">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-xco-ink/[0.2] font-body text-base text-xco-ink py-1 focus:outline-none focus:border-xco-ink transition-colors"
      />
      {hint && <p className="font-mono text-xs text-xco-ink-muted italic">{hint}</p>}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-xs text-xco-ink-muted uppercase tracking-wider">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full bg-transparent border border-xco-ink/[0.2] font-body text-sm text-xco-ink py-2 px-2 focus:outline-none focus:border-xco-ink transition-colors resize-none"
      />
      {hint && <p className="font-mono text-xs text-xco-ink-muted italic">{hint}</p>}
    </label>
  );
}

// ── Main generator ──────────────────────────────────────────────────

const DEFAULT_LABELS: DiagramLabels = {
  frontier: "Frontier",
  fortress: "Fortress",
  field: "Field",
  fieldSublabel: "precondition",
};

export function ThreeRegimesGenerator() {
  const [labels, setLabels] = useState<DiagramLabels>(DEFAULT_LABELS);
  const [statement, setStatement] = useState(
    "Field is the precondition for Frontier and Fortress",
  );
  const [caption, setCaption] = useState("");
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<DiagramFormat>("hero");
  const [mode, setMode] = useState<DiagramMode>("structural");
  const [colorScheme, setColorScheme] = useState<DiagramColorScheme>("standard");
  const [exporting, setExporting] = useState<string | null>(null);

  // Structural mode refs
  const heroRef   = useRef<SVGSVGElement>(null);
  const squareRef = useRef<SVGSVGElement>(null);
  const markRef   = useRef<SVGSVGElement>(null);

  // Abstract mode refs
  const absHeroRef   = useRef<SVGSVGElement>(null);
  const absSquareRef = useRef<SVGSVGElement>(null);
  const absMarkRef   = useRef<SVGSVGElement>(null);

  const activeRefs = mode === "structural"
    ? { hero: heroRef, square: squareRef, mark: markRef }
    : { hero: absHeroRef, square: absSquareRef, mark: absMarkRef };

  const diagramProps = {
    labels,
    relationshipStatement: statement,
    caption,
    showAnnotations,
    amplitude: 0,
    colorScheme,
  };

  const handleExport = async (type: string) => {
    setExporting(type);
    try {
      if (type === "svg-hero")   exportSVG(activeRefs.hero.current, "xco-three-regimes-hero.svg");
      if (type === "svg-square") exportSVG(activeRefs.square.current, "xco-three-regimes-square.svg");
      if (type === "svg-mark")   exportSVG(activeRefs.mark.current, "xco-three-regimes-mark.svg");
      if (type === "png-hero")   await exportPNGViaServer(activeRefs.hero.current, 1200, 630, "xco-three-regimes-1200x630.png");
      if (type === "png-square") await exportPNGViaServer(activeRefs.square.current, 1200, 1200, "xco-three-regimes-1200x1200.png");
    } finally {
      setExporting(null);
    }
  };

  const formats: { id: DiagramFormat; label: string; size: string }[] = [
    { id: "hero",   label: "Hero",   size: "1200 × 630" },
    { id: "square", label: "Square", size: "1200 × 1200" },
    { id: "mark",   label: "Mark",   size: "400 × 200" },
  ];

  const DiagramComponent =
    mode === "structural" ? ThreeRegimesDiagram : AbstractThreeRegimesDiagram;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* ── Controls ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        {/* Mode toggle */}
        <div className="space-y-2">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
            Diagram Mode
          </h2>
          <div className="flex gap-0">
            {(["structural", "abstract"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 font-mono text-xs px-3 py-2 border transition-colors ${
                  mode === m
                    ? "bg-xco-ink text-xco-paper border-xco-ink"
                    : "text-xco-ink-muted border-xco-ink/[0.2] hover:border-xco-ink hover:text-xco-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {mode === "abstract" && (
            <p className="font-mono text-xs text-xco-ink-muted italic">
              Gradient mood — Field, Frontier, Fortress as colour atmosphere.
              No text, no structure.
            </p>
          )}
        </div>

        {mode === "structural" && (
          <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
              Colour Scheme
            </h2>
            {([
              { id: "standard", label: "Standard", hint: "ink / cool / ember" },
              { id: "blueprint", label: "Blueprint", hint: "teal · navy · ocean · dusk" },
            ] as { id: DiagramColorScheme; label: string; hint: string }[]).map(({ id, label, hint }) => (
              <label key={id} className="flex items-start gap-2 cursor-pointer">
                <input type="radio" name="colorScheme" value={id} checked={colorScheme === id}
                  onChange={() => setColorScheme(id)} className="accent-xco-dusk mt-0.5" />
                <span className="space-y-0.5">
                  <span className="font-mono text-xs text-xco-ink block">{label}</span>
                  <span className="font-mono text-xs text-xco-ink-muted block">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        {mode === "structural" && (
          <>
            <div className="space-y-1 border-b border-xco-ink/[0.12] pb-4">
              <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
                Node Labels
              </h2>
            </div>

            <Field
              label="Frontier"
              value={labels.frontier}
              onChange={(v) => setLabels({ ...labels, frontier: v })}
            />
            <Field
              label="Fortress"
              value={labels.fortress}
              onChange={(v) => setLabels({ ...labels, fortress: v })}
            />
            <Field
              label="Field"
              value={labels.field}
              onChange={(v) => setLabels({ ...labels, field: v })}
            />
            <Field
              label="Field sublabel"
              value={labels.fieldSublabel}
              onChange={(v) => setLabels({ ...labels, fieldSublabel: v })}
              hint="shown below field label in mono"
            />

            <div className="space-y-1 border-b border-xco-ink/[0.12] pb-4 pt-2">
              <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
                Text
              </h2>
            </div>

            <TextArea
              label="Relationship statement"
              value={statement}
              onChange={setStatement}
              hint="DM Mono italic, below the diagram"
            />
            <TextArea
              label="Caption"
              value={caption}
              onChange={setCaption}
              hint="optional — smaller, below statement"
            />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showAnnotations}
                onChange={(e) => setShowAnnotations(e.target.checked)}
                className="accent-xco-dusk w-4 h-4"
              />
              <span className="font-mono text-xs text-xco-ink-muted">
                Show annotation marginalia
              </span>
            </label>
          </>
        )}


        <div className="space-y-3 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
            Preview Format
          </h2>
          <div className="space-y-1">
            {formats.map((f) => (
              <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value={f.id}
                  checked={previewFormat === f.id}
                  onChange={() => setPreviewFormat(f.id)}
                  className="accent-xco-dusk"
                />
                <span className="font-mono text-xs text-xco-ink">
                  {f.label}
                </span>
                <span className="font-mono text-xs text-xco-ink-muted">
                  {f.size}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-3">
            Export
          </h2>
          {[
            { id: "svg-hero",   label: "SVG  — 1200×630 hero" },
            { id: "png-hero",   label: "PNG  — 1200×630 hero" },
            { id: "svg-square", label: "SVG  — 1200×1200 square" },
            { id: "png-square", label: "PNG  — 1200×1200 square" },
            { id: "svg-mark",   label: "SVG  — mark (no labels)" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleExport(id)}
              disabled={exporting !== null}
              className="w-full text-left font-mono text-xs text-xco-ink border border-xco-ink/[0.2] px-3 py-2 hover:border-xco-ink hover:bg-xco-ink/[0.04] transition-colors disabled:opacity-40"
            >
              {exporting === id ? "exporting…" : `↓ ${label}`}
            </button>
          ))}
          <p className="font-mono text-xs text-xco-ink-muted leading-relaxed pt-1">
            PNG exports use server-side font embedding for accurate typography.
          </p>
        </div>
      </aside>

      {/* ── Preview ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink/[0.12] overflow-hidden bg-xco-paper">
          <DiagramComponent
            {...diagramProps}
            format={previewFormat}
          />
        </div>
        <p className="font-mono text-xs text-xco-ink-muted">
          {previewFormat === "hero" && "1200 × 630 — substack hero / open graph"}
          {previewFormat === "square" && "1200 × 1200 — social square"}
          {previewFormat === "mark" && "400 × 200 — mark (geometric only, no labels)"}
        </p>
      </div>

      {/* Hidden SVGs for export */}
      <div className="sr-only" aria-hidden="true">
        {/* Structural */}
        <ThreeRegimesDiagram ref={heroRef}   {...diagramProps} format="hero" />
        <ThreeRegimesDiagram ref={squareRef} {...diagramProps} format="square" />
        <ThreeRegimesDiagram ref={markRef}   {...diagramProps} format="mark" />
        {/* Abstract */}
        <AbstractThreeRegimesDiagram ref={absHeroRef}   {...diagramProps} format="hero" />
        <AbstractThreeRegimesDiagram ref={absSquareRef} {...diagramProps} format="square" />
        <AbstractThreeRegimesDiagram ref={absMarkRef}   {...diagramProps} format="mark" />
      </div>
    </div>
  );
}
