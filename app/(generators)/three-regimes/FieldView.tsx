"use client";

import { useState } from "react";
import { RadioList, Section, Slider } from "@/components/generator-controls";
import { paletteHex } from "@/lib/design-tokens";
import { OptionFieldDiagram, resolveSpacing, type FieldColorMode, type FieldFormat } from "./OptionFieldDiagram";
import { HERO, MARK_FORMAT, SQUARE, type View } from "./view";

const { navy: NAVY, ink: INK, paper: PAPER } = paletteHex;

const COLOR_MODES: { id: FieldColorMode; label: string; hint: string }[] = [
  { id: "ink",       label: "Light",     hint: "ink on paper" },
  { id: "spectrum",  label: "Spectrum",  hint: "cool → ink → ember by register" },
  { id: "inverted",  label: "Dark",      hint: "paper on ink" },
  { id: "blueprint", label: "Blueprint", hint: "navy ground — teal to ocean scanlines" },
  { id: "warmth",    label: "Warmth",    hint: "dusk to sand on paper" },
];

const two = (v: number) => v.toFixed(2);

/** Field: the option field, scanlines whose weight follows the three regimes' strengths. */
export function useFieldView(): View {
  const [fieldStr, setFieldStr] = useState(0.72);
  const [frontierStr, setFrontierStr] = useState(0.60);
  const [fortressStr, setFortressStr] = useState(0.52);
  const [volatility, setVolatility] = useState(0.34);
  const [resolution, setResolution] = useState(35);
  const [colorMode, setColorMode] = useState<FieldColorMode>("ink");

  return {
    controls: (
      <>
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
      </>
    ),
    // The field has no words of its own, so its print grows from the identity note.
    words: "",
    formats: [HERO, SQUARE, MARK_FORMAT],
    draw: (format, timePrint, ref) => (
      <OptionFieldDiagram ref={ref} format={format as FieldFormat} fieldStr={fieldStr} frontierStr={frontierStr} fortressStr={fortressStr}
        volatility={volatility} resolution={resolution} colorMode={colorMode} timePrint={timePrint} />
    ),
    file: `xco-option-field-${colorMode}`,
    caption: (format) =>
      `${[HERO, SQUARE, MARK_FORMAT].find((f) => f.id === format)!.hint.split(",")[0]} · ${resolveSpacing(resolution)}px scanlines · f${two(fieldStr)} fr${two(frontierStr)} fo${two(fortressStr)}`,
    ground: colorMode === "inverted" ? INK : colorMode === "blueprint" ? NAVY : PAPER,
  };
}
