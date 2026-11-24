"use client";

import { useMemo, useRef, useState } from "react";
import { useMinute, useSettled } from "@/components/xco/TimePrint";
import { TIME_PRINT_HINT } from "@/lib/asemic/time-print";
import {
  Button, Checkbox, ExportError, labelClass, RadioList, Section, TextField, useExport,
} from "@/components/generator-controls";
import { exportPNG, exportSVG } from "@/lib/media/export";
import { SocialCardDiagram } from "./SocialCardDiagram";
import type { CardFormat, CardLayout, DiagramType } from "./SocialCardDiagram";

const LAYOUTS: { id: CardLayout; label: string; hint: string }[] = [
  { id: "typographic", label: "Typographic", hint: "Clean text, full-width" },
  { id: "diagram",     label: "Diagram",     hint: "Text left, diagram right" },
  { id: "abstract",    label: "Abstract",    hint: "Gradient background, paper text" },
];

const DIAGRAM_TYPES: { id: DiagramType; label: string; hint: string }[] = [
  { id: "three-regimes", label: "Three Regimes", hint: "Frontier / Fortress / Field mark" },
  { id: "option-field",  label: "Option Field",  hint: "Variable-weight scanline field" },
  { id: "territory",     label: "Territory",     hint: "Weighted treemap — concept areas by size" },
];

const FORMATS: { id: CardFormat; label: string; hint: string; w: number; h: number }[] = [
  { id: "card",   label: "Card",   hint: "1200 × 630", w: 1200, h: 630 },
  { id: "square", label: "Square", hint: "1080 × 1080", w: 1080, h: 1080 },
];

export function SocialCardGenerator() {
  const [headline, setHeadline] = useState("Field is the precondition for everything else");
  const [tag, setTag]           = useState("Three Regimes");
  const [byline, setByline]     = useState("Expanding Civilizational Optionality");
  const [layout, setLayout]         = useState<CardLayout>("typographic");
  const [diagramType, setDiagramType] = useState<DiagramType>("three-regimes");
  const [format, setFormat]         = useState<CardFormat>("card");
  const [timePrintOn, setTimePrintOn] = useState(true);
  // One minute for the preview and both hidden export copies, so the export matches what's shown.
  const minute = useMinute();
  // Settled: the print regrows once typing pauses, so keystrokes never wait on it.
  const words = useSettled([tag, headline, byline].join(" "));
  const timePrint = useMemo(() => (timePrintOn && minute ? { minute, words } : null), [timePrintOn, minute, words]);

  const cardRef   = useRef<SVGSVGElement>(null);
  const squareRef = useRef<SVGSVGElement>(null);

  const activeRef = format === "card" ? cardRef : squareRef;
  const activeFormat = FORMATS.find((f) => f.id === format)!;

  const props = { headline, tag, byline, layout, diagramType, timePrint };

  const { busy: exporting, error, run } = useExport();
  const handle = (type: string) =>
    run(type, () => {
      const { w, h } = activeFormat;
      const slug = `xco-social-${format}-${layout}`;
      return type === "svg" ? exportSVG(activeRef.current, `${slug}.svg`) : exportPNG(activeRef.current, w, h, `${slug}.png`);
    });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <Section title="Layout">
          <RadioList name="layout" value={layout} options={LAYOUTS} onChange={setLayout} />
        </Section>

        {layout === "diagram" && (
          <Section title="Diagram">
            <RadioList name="diagramType" value={diagramType} options={DIAGRAM_TYPES} onChange={setDiagramType} />
          </Section>
        )}

        <Section title="Content">
          <TextField label="Headline" value={headline} onChange={setHeadline} multiline rows={3} hint="Keep under 60 chars for clean wrapping" />
          <TextField label="Tag" value={tag} onChange={setTag} hint="Short label — shown as [TAG]" />
          <TextField label="Byline" value={byline} onChange={setByline} hint="Author, org, or publication" />
        </Section>

        <Section title="Format">
          <RadioList name="format" value={format} options={FORMATS} onChange={setFormat} />
        </Section>

        <Section title="Export">
          <Checkbox label="Time print" hint={TIME_PRINT_HINT} checked={timePrintOn} onChange={setTimePrintOn} />
          {[
            { id: "svg", label: `SVG — ${activeFormat.hint}` },
            { id: "png", label: `PNG — ${activeFormat.hint}` },
          ].map(({ id, label }) => (
            <Button key={id} onClick={() => handle(id)} disabled={exporting !== null}>
              {exporting === id ? "exporting…" : `↓ ${label}`}
            </Button>
          ))}
          <ExportError error={error} />
        </Section>
      </aside>

      {/* Preview */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink overflow-hidden bg-xco-paper">
          <SocialCardDiagram {...props} format={format} />
        </div>
        <p className={labelClass}>
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
