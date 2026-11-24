"use client";

import { useMemo, useRef, useState } from "react";
import { useMinute, useSettled } from "@/components/xco/TimePrint";
import { TIME_PRINT_HINT } from "@/lib/asemic/time-print";
import {
  Button, Checkbox, ExportError, labelClass, RadioList, Section, TextField, useExport,
} from "@/components/generator-controls";
import { exportPNG, exportSVG } from "@/lib/media/export";
import { PaperCoverDiagram, COVER_W, COVER_H } from "./PaperCoverDiagram";
import type { CoverVisual } from "./PaperCoverDiagram";

const VISUALS: { id: CoverVisual; label: string; hint: string }[] = [
  { id: "none",         label: "None",         hint: "Open paper and typography only" },
  { id: "abstract",     label: "Abstract",     hint: "Muted gradient field — atmospheric" },
  { id: "mark",         label: "Mark",         hint: "Three Regimes geometric mark" },
  { id: "option-field", label: "Option Field", hint: "Variable-weight scanline field" },
  { id: "territory",    label: "Territory",    hint: "Weighted treemap — concept areas by size" },
];

export function PaperCoverGenerator() {
  const [paperNumber, setPaperNumber] = useState("01");
  const [title,       setTitle]       = useState("The Three Regimes of Optionality");
  const [subtitle,    setSubtitle]    = useState("A framework for civilizational-scale investment");
  const [authors,     setAuthors]     = useState("Indy Johar, Robyn Bennett");
  const [date,        setDate]        = useState("May 2026");
  const [visual,      setVisual]      = useState<CoverVisual>("abstract");
  const [timePrintOn, setTimePrintOn] = useState(true);
  // One minute for the preview and the hidden export copy, so the export matches what's shown.
  const minute = useMinute();
  // Settled: the print regrows once typing pauses, so keystrokes never wait on it.
  const words = useSettled([paperNumber, title, subtitle, authors].join(" "));
  const timePrint = useMemo(() => (timePrintOn && minute ? { minute, words } : null), [timePrintOn, minute, words]);

  const coverRef = useRef<SVGSVGElement>(null);

  const props = { paperNumber, title, subtitle, authors, date, visual, timePrint };

  const { busy: exporting, error, run } = useExport();
  const handle = (type: string) =>
    run(type, () => {
      const slug = `xco-paper-${paperNumber.padStart(2, "0")}`;
      // PNG at 2× for print quality
      return type === "svg"
        ? exportSVG(coverRef.current, `${slug}.svg`)
        : exportPNG(coverRef.current, COVER_W * 2, COVER_H * 2, `${slug}.png`);
    });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <Section title="Visual">
          <RadioList name="visual" value={visual} options={VISUALS} onChange={setVisual} />
        </Section>

        <Section title="Content">
          <TextField label="Paper number" value={paperNumber} onChange={setPaperNumber} hint='Shown as "No. 01"' />
          <TextField label="Title" value={title} onChange={setTitle} multiline rows={3} hint="Keep under 50 chars for clean line breaks" />
          <TextField label="Subtitle" value={subtitle} onChange={setSubtitle} multiline hint="Optional — Untitled Serif italic below title" />
          <TextField label="Authors" value={authors} onChange={setAuthors} hint="Comma-separated" />
          <TextField label="Date" value={date} onChange={setDate} hint="e.g. May 2026" />
        </Section>

        <Section title="Export">
          <p className={labelClass}>
            A4 portrait — {COVER_W}×{COVER_H} (SVG) · {COVER_W*2}×{COVER_H*2} (PNG 2×)
          </p>
          <Checkbox label="Time print" hint={TIME_PRINT_HINT} checked={timePrintOn} onChange={setTimePrintOn} />
          {[
            { id: "svg", label: `SVG — A4 ${COVER_W}×${COVER_H}` },
            { id: "png", label: `PNG — 2× print ${COVER_W*2}×${COVER_H*2}` },
          ].map(({ id, label }) => (
            <Button key={id} onClick={() => handle(id)} disabled={exporting !== null}>
              {exporting === id ? "exporting…" : `↓ ${label}`}
            </Button>
          ))}
          <ExportError error={error} />
        </Section>
      </aside>

      {/* Preview — full A4 shown at constrained width so it doesn't clip */}
      <div className="flex-1 min-w-0 space-y-4" style={{ maxWidth: `${COVER_W}px` }}>
        <div className="border border-xco-ink bg-xco-paper">
          <PaperCoverDiagram {...props} className="w-full h-auto" />
        </div>
        <p className={labelClass}>
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
