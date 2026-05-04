"use client";

import { useRef, useState } from "react";
import { ThreeRegimesDiagram, DiagramFormat } from "./ThreeRegimesDiagram";
import type { DiagramLabels } from "./ThreeRegimesDiagram";
import { WIP } from "@/components/WIP";

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

async function exportPNG(
  el: SVGSVGElement | null,
  width: number,
  height: number,
  filename: string,
) {
  if (!el) return;
  const source = svgToString(el);
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, filename);
        resolve();
      }, "image/png");
    };
    img.src = url;
  });
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
  const [amplitude, setAmplitude] = useState(1.8);
  const [previewFormat, setPreviewFormat] = useState<DiagramFormat>("hero");
  const [exporting, setExporting] = useState<string | null>(null);

  // Refs for each export format
  const heroRef   = useRef<SVGSVGElement>(null);
  const squareRef = useRef<SVGSVGElement>(null);
  const markRef   = useRef<SVGSVGElement>(null);

  const diagramProps = { labels, relationshipStatement: statement, caption, showAnnotations, amplitude };

  const handleExport = async (type: string) => {
    setExporting(type);
    try {
      if (type === "svg-hero")   exportSVG(heroRef.current, "xco-three-regimes-hero.svg");
      if (type === "svg-square") exportSVG(squareRef.current, "xco-three-regimes-square.svg");
      if (type === "svg-mark")   exportSVG(markRef.current, "xco-three-regimes-mark.svg");
      if (type === "png-hero")   await exportPNG(heroRef.current, 1200, 630, "xco-three-regimes-1200x630.png");
      if (type === "png-square") await exportPNG(squareRef.current, 1200, 1200, "xco-three-regimes-1200x1200.png");
    } finally {
      setExporting(null);
    }
  };

  const formats: { id: DiagramFormat; label: string; size: string }[] = [
    { id: "hero",   label: "Hero",   size: "1200 × 630" },
    { id: "square", label: "Square", size: "1200 × 1200" },
    { id: "mark",   label: "Mark",   size: "400 × 200" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* ── Controls ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
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
            className="accent-xco-ember w-4 h-4"
          />
          <span className="font-mono text-xs text-xco-ink-muted">
            Show annotation marginalia
          </span>
        </label>

        <div className="space-y-3 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">
            Jitter
          </h2>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0} max={8} step={0.1}
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="flex-1 accent-xco-ember"
            />
            <span className="font-mono text-xs text-xco-ember w-8 text-right">
              {amplitude.toFixed(1)}
            </span>
          </div>
        </div>

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
                  className="accent-xco-ember"
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
            <WIP variant="inference" />
            {" "}PNG rasterises with system fonts. Export SVG for exact typography.
          </p>
        </div>
      </aside>

      {/* ── Preview ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink/[0.12] overflow-hidden bg-xco-paper">
          <ThreeRegimesDiagram
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

      {/* Hidden SVGs for export — rendered off-screen with exact dimensions */}
      <div className="sr-only" aria-hidden="true">
        <ThreeRegimesDiagram ref={heroRef}   {...diagramProps} format="hero" />
        <ThreeRegimesDiagram ref={squareRef} {...diagramProps} format="square" />
        <ThreeRegimesDiagram ref={markRef}   {...diagramProps} format="mark" />
      </div>
    </div>
  );
}
