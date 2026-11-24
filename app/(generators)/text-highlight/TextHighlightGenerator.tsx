"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { highlightTokens, paletteHex, typography } from "@/lib/design-tokens";
import {
  Button, ExportError, labelClass, Section, TextField, useExport,
} from "@/components/generator-controls";
import { useSettled } from "@/components/xco/TimePrint";
import { canvasPNG, download, exportSVG } from "@/lib/media/export";
import {
  ASC, BODY, boxes, DESC, fillOf, HL_TEXT, layout, LIFT, NOTE, NOTE_X, NUM, paint, PADX,
  type Annotation, type Layout, type Measure, type Role,
} from "./artwork";

// ── Sample content ──────────────────────────────────────────────────

const SAMPLE_TEXT =
  "xCO operates across three distinct regimes — Field, Frontier, and Fortress — each with its own logic of value creation and risk. The Field is the systemic foundation, the shared substrate on which all other activity depends. Without healthy Field conditions, neither Frontier exploration nor Fortress consolidation can sustain itself over generational timescales. The Fortress represents concentrated optionality — positions of structural advantage that compound over time through network effects and switching costs. The Frontier is where new possibility space opens, always in relation to what the Field affords and what the Fortress can hold. Navigating between these regimes requires a different grammar than conventional strategy.";

const SAMPLE_ANNOTATIONS: Annotation[] = [
  { id: 1, term: "Field", role: "premise", note: "The systemic ground — shared substrate, infrastructure, ecology. Neither extractable nor excludable. The precondition for all other value creation." },
  { id: 2, term: "Frontier", role: "capability", note: "Open territory where new forms can emerge. High uncertainty, first-mover optionality — inherently relational." },
  { id: 3, term: "Fortress", role: "condition", note: "Concentrated positions of structural advantage. High barriers to entry, predictable compounding returns over time." },
  { id: 4, term: "concentrated optionality", role: "provisional", note: "Maximum strategic flexibility held within a defensible position — a rare and powerful combination." },
  { id: 5, term: "generational timescales", role: "transition", note: "Planning horizons of 25–100 years, well beyond typical institutional memory or capital cycle." },
];

export { SAMPLE_TEXT, SAMPLE_ANNOTATIONS };

// ── Artwork ─────────────────────────────────────────────────────────

const describe = (text: string, anns: Annotation[]) =>
  `Highlighted passage. ${text} Notes: ${anns.map((a) => `${a.id}, ${highlightTokens.find((h) => h.id === a.role)!.label}, on “${a.term}”: ${a.note}`).join(" ")}`;

/** The layout as SVG: the preview, and what the SVG export serialises. */
const Artwork = forwardRef<SVGSVGElement, { L: Layout; label: string }>(function Artwork({ L, label }, ref) {
  return (
    <svg ref={ref} viewBox={`0 0 ${L.width} ${L.height}`} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}
      fontFamily={typography.faces.body.stack} fontWeight={400} className="block w-full h-auto">
      <rect width={L.width} height={L.height} fill={paletteHex.paper} />
      {L.lines.map((line, i) => (
        <g key={i}>
          {boxes(line).map((b, j) => (
            <rect key={j} x={b.x - PADX} y={line.y - BODY.size * ASC} width={b.w + 2 * PADX} height={BODY.size * (ASC + DESC)} fill={fillOf(b.ann.role)} />
          ))}
          {line.pieces.filter((p) => p.text.trim()).map((p, j) =>
            p.num
              ? <text key={j} x={p.x} y={line.y - BODY.size * LIFT} fontSize={NUM.size} fill={HL_TEXT}>{p.text}</text>
              : <text key={j} x={p.x} y={line.y} fontSize={BODY.size} fill={p.ann ? HL_TEXT : paletteHex.ink} xmlSpace="preserve">{p.text}</text>,
          )}
        </g>
      ))}
      {L.notes.map((n) => (
        <g key={n.ann.id}>
          <rect x={NOTE_X} y={n.y + 3} width={20} height={18} fill={fillOf(n.ann.role)} />
          <text x={NOTE_X + 10} y={n.y + 16.5} fontSize={NUM.size} textAnchor="middle" fill={HL_TEXT}>{n.ann.id}</text>
          {n.lines.map((l, i) => (
            <text key={i} x={NOTE_X + 28} y={n.y + 16 + i * NOTE.line} fontSize={NOTE.size} fill={paletteHex.ink}>{l}</text>
          ))}
        </g>
      ))}
    </svg>
  );
});

/** Measures with the page's own faces, once they have loaded; null until then. */
function useMeasure(): Measure | null {
  const [measure, setMeasure] = useState<Measure | null>(null);
  useEffect(() => {
    let live = true;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return;
    // A face that fails to load is not fatal: the layout measures the fallback instead.
    Promise.allSettled([BODY.font, NOTE.font, NUM.font].map((f) => document.fonts.load(f)))
      .then(() => document.fonts.ready)
      .then(() => {
        if (live) setMeasure(() => (text: string, font: string) => { ctx.font = font; return ctx.measureText(text).width; });
      });
    return () => { live = false; };
  }, []);
  return measure;
}

// ── Generator ───────────────────────────────────────────────────────

const ROLES = highlightTokens.map((h) => ({ id: h.id as Role, label: h.label }));

export function TextHighlightGenerator() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [annotations, setAnnotations] = useState<Annotation[]>(SAMPLE_ANNOTATIONS);
  const measure = useMeasure();
  const settledText = useSettled(text, 150);
  const settledAnns = useSettled(annotations, 150);
  const L = useMemo(() => (measure ? layout(settledText, settledAnns, measure) : null), [measure, settledText, settledAnns]);
  const svgRef = useRef<SVGSVGElement>(null);

  const updateAnn = (id: number, patch: Partial<Annotation>) =>
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const { busy, error, run } = useExport();
  const exportAs = (type: "svg" | "png") =>
    run(type, async () => {
      if (!L) throw new Error("The fonts are still loading. Wait a moment and try again.");
      if (type === "svg") return exportSVG(svgRef.current, "xco-text-highlight.svg");
      // The PNG draws on a canvas with the page's own Untitled faces, at 2×.
      const canvas = document.createElement("canvas");
      canvas.width = L.width * 2;
      canvas.height = L.height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D is not available in this browser.");
      paint(ctx, L, 2);
      download(await canvasPNG(canvas), "xco-text-highlight.png");
    });

  const missing = annotations.filter((a) => L && a.term.trim() && !L.notes.some((n) => n.ann.id === a.id));

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <aside className="w-full lg:w-80 shrink-0 space-y-6">
        <Section title="Highlight roles">
          <ul className="space-y-1">
            {highlightTokens.map((h) => (
              <li key={h.id} className={labelClass}>
                <mark className="px-1" style={{ backgroundColor: h.hex, color: HL_TEXT }}>{h.label}</mark>
              </li>
            ))}
          </ul>
          <p className={`${labelClass} text-xco-ink-muted`}>
            A role says what a span does in the argument, not how important it is. Name the roles you use beside the artwork.
          </p>
        </Section>

        <Section title="Annotations">
          {annotations.map((ann) => (
            <div key={ann.id} className="space-y-2 pb-3">
              <TextField label={`${ann.id} — term`} value={ann.term} onChange={(v) => updateAnn(ann.id, { term: v })} />
              <label className="block space-y-1">
                <span className={`${labelClass} uppercase tracking-wider`}>{ann.id} — role</span>
                <select
                  value={ann.role}
                  onChange={(e) => updateAnn(ann.id, { role: e.target.value as Role })}
                  className={`w-full min-h-11 bg-transparent border border-xco-ink px-2 ${labelClass}`}
                >
                  {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </label>
              <TextField label={`${ann.id} — note`} value={ann.note} onChange={(v) => updateAnn(ann.id, { note: v })} multiline rows={3} />
            </div>
          ))}
        </Section>

        <Section title="Body text">
          <TextField label="Passage" value={text} onChange={setText} multiline rows={7} hint="Each term is highlighted at its first occurrence, ignoring case." />
        </Section>

        <Section title="Export">
          <Button onClick={() => exportAs("svg")} disabled={!L || busy !== null}>
            {busy === "svg" ? "exporting…" : `↓ SVG — ${L ? `${L.width} × ${L.height}` : "…"}`}
          </Button>
          <Button onClick={() => exportAs("png")} disabled={!L || busy !== null}>
            {busy === "png" ? "exporting…" : `↓ PNG — ${L ? `${L.width * 2} × ${L.height * 2}` : "…"}`}
          </Button>
          <p className={`${labelClass} text-xco-ink-muted`}>
            The PNG is drawn in the browser, so it keeps Untitled Sans. The SVG names the faces and needs them installed to show them.
          </p>
          <ExportError error={error} />
        </Section>
      </aside>

      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink bg-xco-paper">
          {L ? <Artwork ref={svgRef} L={L} label={describe(settledText, settledAnns)} /> : <p className={`${labelClass} p-8`}>Loading fonts…</p>}
        </div>
        {missing.length > 0 && (
          <p className={`${labelClass} text-xco-dusk-ink`}>
            Not in the passage: {missing.map((a) => `“${a.term}”`).join(", ")}. Edit the term or the text.
          </p>
        )}
        <p className={labelClass}>
          Fills are the five highlight roles behind Matter 900 text; every face is Untitled at 400, the one weight that ships.
        </p>
      </div>
    </div>
  );
}
