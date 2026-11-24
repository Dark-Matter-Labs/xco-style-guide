"use client";

import { useMemo, useRef, useState } from "react";
import { useMinute } from "@/components/xco/TimePrint";
import { TIME_PRINT_HINT } from "@/lib/asemic/time-print";
import {
  Button, Checkbox, ExportError, labelClass, RadioList, Section, Slider, useExport,
} from "@/components/generator-controls";
import { exportPNG, exportSVG } from "@/lib/media/export";
import { OptionFieldDiagram, resolveSpacing } from "./OptionFieldDiagram";
import type { FieldFormat, FieldColorMode } from "./OptionFieldDiagram";
import { paletteHex } from "@/lib/design-tokens";

const { navy: NAVY, ink: INK, paper: PAPER } = paletteHex;

const FORMATS: { id: FieldFormat; label: string; w: number; h: number }[] = [
  { id: "hero",   label: "1200 × 630",  w: 1200, h: 630  },
  { id: "square", label: "1200 × 1200", w: 1200, h: 1200 },
  { id: "mark",   label: "400 × 200",   w: 400,  h: 200  },
];

const COLOR_MODES: { id: FieldColorMode; label: string; hint: string }[] = [
  { id: "ink",       label: "Ink",       hint: "ink on paper" },
  { id: "spectrum",  label: "Spectrum",  hint: "cool → ink → ember by register" },
  { id: "inverted",  label: "Inverted",  hint: "paper on ink" },
  { id: "blueprint", label: "Blueprint", hint: "navy ground — teal to ocean scanlines" },
  { id: "warmth",    label: "Warmth",    hint: "dusk to sand on paper" },
];

const two = (v: number) => v.toFixed(2);

export function OptionFieldGenerator() {
  const [fieldStr,    setFieldStr]    = useState(0.72);
  const [frontierStr, setFrontierStr] = useState(0.60);
  const [fortressStr, setFortressStr] = useState(0.52);
  const [volatility,  setVolatility]  = useState(0.34);
  const [resolution,  setResolution]  = useState(35);
  const [colorMode,   setColorMode]   = useState<FieldColorMode>("ink");
  const [format,      setFormat]      = useState<FieldFormat>("hero");
  const [timePrintOn, setTimePrintOn] = useState(true);
  // One minute for the preview and the hidden export copies; the field has no words, so the diagram uses the identity note.
  const minute = useMinute();
  const timePrint = useMemo(() => (timePrintOn && minute ? { minute, words: "" } : null), [timePrintOn, minute]);

  const heroRef   = useRef<SVGSVGElement>(null);
  const squareRef = useRef<SVGSVGElement>(null);
  const markRef   = useRef<SVGSVGElement>(null);

  const activeRef = format === "hero" ? heroRef : format === "square" ? squareRef : markRef;
  const activeDim = FORMATS.find(f => f.id === format)!;

  const props = { fieldStr, frontierStr, fortressStr, volatility, resolution, colorMode, timePrint };

  const { busy: exporting, error, run } = useExport();
  const handle = (type: string) =>
    run(type, () => {
      const slug = `xco-option-field-${format}`;
      return type === "svg"
        ? exportSVG(activeRef.current, `${slug}.svg`)
        : exportPNG(activeRef.current, activeDim.w, activeDim.h, `${slug}.png`);
    });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <Section title="Regime composition">
          <Slider label="Field" hint="systemic foundation — lower register" value={fieldStr} onChange={setFieldStr} display={two(fieldStr)} />
          <Slider label="Frontier" hint="open, emerging — upper left" value={frontierStr} onChange={setFrontierStr} display={two(frontierStr)} />
          <Slider label="Fortress" hint="concentrated, constrained — upper right" value={fortressStr} onChange={setFortressStr} display={two(fortressStr)} />
        </Section>

        <Section title="Texture">
          <Slider label="Volatility" hint="spatial variation — noise in the field" value={volatility} onChange={setVolatility} display={two(volatility)} />
          <Slider label="Resolution" min={0} max={100} step={1} value={resolution} onChange={setResolution}
            display={`${resolveSpacing(resolution)}px`} hint="scanline spacing — coarse to fine" />
        </Section>

        <Section title="Colour">
          <RadioList name="color" value={colorMode} options={COLOR_MODES} onChange={setColorMode} />
        </Section>

        <Section title="Format">
          <RadioList name="format" value={format} options={FORMATS} onChange={setFormat} />
        </Section>

        <Section title="Export">
          <Checkbox label="Time print" hint={TIME_PRINT_HINT} checked={timePrintOn} onChange={setTimePrintOn} />
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

      {/* Preview */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink overflow-hidden"
          style={{ background: colorMode === "inverted" ? INK : colorMode === "blueprint" ? NAVY : PAPER }}>
          <OptionFieldDiagram {...props} format={format} />
        </div>
        <p className={labelClass}>
          {activeDim.label} · {resolveSpacing(resolution)}px scanlines
          · f{fieldStr.toFixed(2)} fr{frontierStr.toFixed(2)} fo{fortressStr.toFixed(2)}
        </p>
      </div>

      {/* Hidden refs for export */}
      <div className="sr-only" aria-hidden="true">
        <OptionFieldDiagram ref={heroRef}   {...props} format="hero"   />
        <OptionFieldDiagram ref={squareRef} {...props} format="square" />
        <OptionFieldDiagram ref={markRef}   {...props} format="mark"   />
      </div>
    </div>
  );
}
