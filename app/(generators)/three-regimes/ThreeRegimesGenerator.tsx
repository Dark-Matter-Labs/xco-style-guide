"use client";

import { useMemo, useRef, useState } from "react";
import { useMinute, useSettled } from "@/components/xco/TimePrint";
import { TIME_PRINT_HINT } from "@/lib/asemic/time-print";
import {
  Button, Checkbox, ExportError, labelClass, RadioList, Section, Segmented, TextField, useExport,
} from "@/components/generator-controls";
import { exportPNG, exportSVG } from "@/lib/media/export";
import { ThreeRegimesDiagram, DiagramFormat, DiagramColorScheme, StructuralVariant } from "./ThreeRegimesDiagram";
import type { DiagramLabels } from "./ThreeRegimesDiagram";

const DEFAULT_LABELS: DiagramLabels = {
  frontier: "Frontier",
  fortress: "Fortress",
  field: "Field",
  fieldSublabel: "precondition",
};

const SCHEMES: { id: DiagramColorScheme; label: string; hint: string }[] = [
  { id: "standard", label: "Standard", hint: "ink / cool / ember" },
  { id: "blueprint", label: "Blueprint", hint: "teal · navy · ocean · dusk" },
];

const VARIANTS: { id: StructuralVariant; label: string; hint: string }[] = [
  { id: "classic", label: "Classic", hint: "hub + spoke" },
  { id: "nested", label: "Nested", hint: "field wraps" },
  { id: "columns", label: "Columns", hint: "three strips" },
  { id: "orbital", label: "Orbital", hint: "circle nodes" },
];

const FORMATS: { id: DiagramFormat; label: string; hint: string }[] = [
  { id: "hero", label: "Hero", hint: "1200 × 630" },
  { id: "square", label: "Square", hint: "1200 × 1200" },
  { id: "mark", label: "Mark", hint: "400 × 200" },
];

const EXPORTS = [
  { id: "svg-hero", label: "SVG — 1200×630 hero" },
  { id: "png-hero", label: "PNG — 1200×630 hero" },
  { id: "svg-square", label: "SVG — 1200×1200 square" },
  { id: "png-square", label: "PNG — 1200×1200 square" },
  { id: "svg-mark", label: "SVG — mark (no labels)" },
];

export function ThreeRegimesGenerator() {
  const [labels, setLabels] = useState<DiagramLabels>(DEFAULT_LABELS);
  const [statement, setStatement] = useState(
    "Field is the precondition for Frontier and Fortress",
  );
  const [caption, setCaption] = useState("");
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<DiagramFormat>("hero");
  const [colorScheme, setColorScheme] = useState<DiagramColorScheme>("standard");
  const [structuralVariant, setStructuralVariant] = useState<StructuralVariant>("classic");
  const [timePrintOn, setTimePrintOn] = useState(true);
  // One minute for the preview and the three hidden export copies, so the export matches what's shown.
  const minute = useMinute();
  // Settled: the print regrows once typing pauses, so keystrokes never wait on it.
  const words = useSettled([labels.frontier, labels.fortress, labels.field, labels.fieldSublabel, statement, caption].join(" "));
  const timePrint = useMemo(() => (timePrintOn && minute ? { minute, words } : null), [timePrintOn, minute, words]);

  const heroRef   = useRef<SVGSVGElement>(null);
  const squareRef = useRef<SVGSVGElement>(null);
  const markRef   = useRef<SVGSVGElement>(null);

  const diagramProps = {
    labels,
    relationshipStatement: statement,
    caption,
    showAnnotations,
    colorScheme,
    structuralVariant,
    timePrint,
  };

  const { busy: exporting, error, run } = useExport();
  const handleExport = (type: string) =>
    run(type, async () => {
      if (type === "svg-hero")   exportSVG(heroRef.current, "xco-three-regimes-hero.svg");
      if (type === "svg-square") exportSVG(squareRef.current, "xco-three-regimes-square.svg");
      if (type === "svg-mark")   exportSVG(markRef.current, "xco-three-regimes-mark.svg");
      if (type === "png-hero")   await exportPNG(heroRef.current, 1200, 630, "xco-three-regimes-1200x630.png");
      if (type === "png-square") await exportPNG(squareRef.current, 1200, 1200, "xco-three-regimes-1200x1200.png");
    });

  const label = (key: keyof DiagramLabels) => (v: string) => setLabels({ ...labels, [key]: v });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* ── Controls ── */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <Section title="Colour scheme">
          <RadioList name="colorScheme" value={colorScheme} options={SCHEMES} onChange={setColorScheme} />
        </Section>

        <Section title="Layout">
          <Segmented value={structuralVariant} options={VARIANTS} onChange={setStructuralVariant} columns={2} />
        </Section>

        <Section title="Node labels">
          <TextField label="Frontier" value={labels.frontier} onChange={label("frontier")} />
          <TextField label="Fortress" value={labels.fortress} onChange={label("fortress")} />
          <TextField label="Field" value={labels.field} onChange={label("field")} />
          <TextField label="Field sublabel" value={labels.fieldSublabel} onChange={label("fieldSublabel")} hint="shown smaller, below the field label" />
        </Section>

        <Section title="Text">
          <TextField label="Relationship statement" value={statement} onChange={setStatement} multiline hint="Untitled Sans, below the diagram" />
          <TextField label="Caption" value={caption} onChange={setCaption} multiline hint="optional — smaller, below statement" />
          <Checkbox label="Show annotation marginalia" checked={showAnnotations} onChange={setShowAnnotations} />
        </Section>

        <Section title="Preview format">
          <RadioList name="format" value={previewFormat} options={FORMATS} onChange={setPreviewFormat} />
        </Section>

        <Section title="Export">
          <Checkbox label="Time print" hint={TIME_PRINT_HINT} checked={timePrintOn} onChange={setTimePrintOn} />
          {EXPORTS.map(({ id, label }) => (
            <Button key={id} onClick={() => handleExport(id)} disabled={exporting !== null}>
              {exporting === id ? "exporting…" : `↓ ${label}`}
            </Button>
          ))}
          <p className={`${labelClass} text-xco-ink-muted`}>
            PNG labels render in DM Mono until the export can load Untitled Sans; the SVG keeps the real faces.
          </p>
          <ExportError error={error} />
        </Section>
      </aside>

      {/* ── Preview ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink overflow-hidden bg-xco-paper">
          <ThreeRegimesDiagram {...diagramProps} format={previewFormat} />
        </div>
        <p className={labelClass}>
          {previewFormat === "hero" && "1200 × 630 — substack hero / open graph"}
          {previewFormat === "square" && "1200 × 1200 — social square"}
          {previewFormat === "mark" && "400 × 200 — mark (geometric only, no labels)"}
        </p>
      </div>

      {/* Hidden SVGs for export */}
      <div className="sr-only" aria-hidden="true">
        <ThreeRegimesDiagram ref={heroRef}   {...diagramProps} format="hero" />
        <ThreeRegimesDiagram ref={squareRef} {...diagramProps} format="square" />
        <ThreeRegimesDiagram ref={markRef}   {...diagramProps} format="mark" />
      </div>
    </div>
  );
}
