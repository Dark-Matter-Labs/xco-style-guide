"use client";

import { useRef, useState } from "react";
import { PaperCoverDiagram, COVER_W, COVER_H } from "./PaperCoverDiagram";
import type { CoverVisual } from "./PaperCoverDiagram";

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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg: svgToString(el), width: w, height: h }),
  });
  if (!res.ok) return;
  downloadBlob(await res.blob(), name);
}

function Field({ label, value, onChange, hint, mono, rows }: {
  label: string; value: string; onChange: (v: string) => void;
  hint?: string; mono?: boolean; rows?: number;
}) {
  const cls = `w-full bg-transparent border-b border-xco-ink/[0.2] text-base text-xco-ink py-1 focus:outline-none focus:border-xco-ink transition-colors ${mono ? "font-mono text-sm" : "font-body"}`;
  return (
    <label className="block space-y-1">
      <span className="font-mono text-xs text-xco-ink-muted uppercase tracking-wider">{label}</span>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
          className={`${cls} border resize-none px-2 py-2`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
      {hint && <p className="font-mono text-xs text-xco-ink-muted italic">{hint}</p>}
    </label>
  );
}

const VISUALS: { id: CoverVisual; label: string; hint: string }[] = [
  { id: "none",     label: "None",     hint: "White space and typography only" },
  { id: "abstract", label: "Abstract", hint: "Muted gradient field — atmospheric" },
  { id: "mark",     label: "Mark",     hint: "Three Regimes geometric mark" },
];

export function PaperCoverGenerator() {
  const [paperNumber, setPaperNumber] = useState("01");
  const [title,       setTitle]       = useState("The Three Regimes of Optionality");
  const [subtitle,    setSubtitle]    = useState("A framework for civilisational-scale investment");
  const [authors,     setAuthors]     = useState("Martin Lukács, Robyn Gröschel");
  const [date,        setDate]        = useState("May 2026");
  const [visual,      setVisual]      = useState<CoverVisual>("abstract");
  const [exporting,   setExporting]   = useState<string | null>(null);

  const coverRef = useRef<SVGSVGElement>(null);

  const props = { paperNumber, title, subtitle, authors, date, visual };

  const handle = async (type: string) => {
    setExporting(type);
    try {
      const slug = `xco-paper-${paperNumber.padStart(2, "0")}`;
      if (type === "svg") exportSVG(coverRef.current, `${slug}.svg`);
      // PNG at 2× for print quality
      if (type === "png") await exportPNG(coverRef.current, COVER_W * 2, COVER_H * 2, `${slug}.png`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        <div className="space-y-2">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Visual</h2>
          <div className="space-y-1">
            {VISUALS.map(({ id, label, hint }) => (
              <label key={id} className="flex items-start gap-2 cursor-pointer">
                <input type="radio" name="visual" value={id} checked={visual === id}
                  onChange={() => setVisual(id)} className="accent-xco-ember mt-0.5 shrink-0" />
                <span>
                  <span className="font-mono text-xs text-xco-ink block">{label}</span>
                  <span className="font-mono text-xs text-xco-ink-muted">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Content</h2>
          <Field label="Paper number" value={paperNumber} onChange={setPaperNumber}
            hint='Shown as "No. 01"' mono />
          <Field label="Title" value={title} onChange={setTitle} rows={3}
            hint="Keep under 50 chars for clean line breaks" />
          <Field label="Subtitle" value={subtitle} onChange={setSubtitle} rows={2}
            hint="Optional — Crimson Pro italic below title" />
          <Field label="Authors" value={authors} onChange={setAuthors}
            hint="Comma-separated" />
          <Field label="Date" value={date} onChange={setDate}
            hint="e.g. May 2026" mono />
        </div>

        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-3">Export</h2>
          <p className="font-mono text-xs text-xco-ink-muted mb-2">
            A4 portrait — {COVER_W}×{COVER_H} (SVG) · {COVER_W*2}×{COVER_H*2} (PNG 2×)
          </p>
          {[
            { id: "svg", label: `SVG — A4 ${COVER_W}×${COVER_H}` },
            { id: "png", label: `PNG — 2× print ${COVER_W*2}×${COVER_H*2}` },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => handle(id)} disabled={exporting !== null}
              className="w-full text-left font-mono text-xs text-xco-ink border border-xco-ink/[0.2] px-3 py-2 hover:border-xco-ink hover:bg-xco-ink/[0.04] transition-colors disabled:opacity-40">
              {exporting === id ? "exporting…" : `↓ ${label}`}
            </button>
          ))}
        </div>
      </aside>

      {/* Preview — full A4 shown at constrained width so it doesn't clip */}
      <div className="flex-1 min-w-0 space-y-4" style={{ maxWidth: `${COVER_W}px` }}>
        <div className="border border-xco-ink/[0.12] bg-xco-paper">
          <PaperCoverDiagram {...props} className="w-full h-auto" />
        </div>
        <p className="font-mono text-xs text-xco-ink-muted">
          A4 portrait — {COVER_W}×{COVER_H}px at 96dpi · exports at 2× for print
        </p>
      </div>

      {/* Hidden ref for export — natural size, no className */}
      <div className="sr-only" aria-hidden="true">
        <PaperCoverDiagram ref={coverRef} {...props} />
      </div>
    </div>
  );
}
