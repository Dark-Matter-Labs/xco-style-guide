"use client";

import { useState } from "react";
import { Checkbox, RadioList, Section, Segmented, TextField } from "@/components/generator-controls";
import { paletteHex } from "@/lib/design-tokens";
import { ThreeRegimesDiagram, type DiagramColorScheme, type DiagramFormat, type DiagramLabels, type StructuralVariant } from "./ThreeRegimesDiagram";
import { HERO, MARK_FORMAT, SQUARE, type View } from "./view";

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

const CAPTIONS: Record<string, string> = {
  hero: "1200 × 630 — substack hero / open graph",
  square: "1200 × 1200 — social square",
  mark: "400 × 200 — mark (geometric only, no labels)",
};

/** Structure: the diagram of Frontier and Fortress meeting over Field. */
export function useStructureView(): View {
  const [labels, setLabels] = useState<DiagramLabels>(DEFAULT_LABELS);
  const [statement, setStatement] = useState("Field is the precondition for Frontier and Fortress");
  const [caption, setCaption] = useState("");
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [colorScheme, setColorScheme] = useState<DiagramColorScheme>("standard");
  const [structuralVariant, setStructuralVariant] = useState<StructuralVariant>("classic");
  const label = (key: keyof DiagramLabels) => (v: string) => setLabels({ ...labels, [key]: v });

  return {
    controls: (
      <>
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
      </>
    ),
    words: [labels.frontier, labels.fortress, labels.field, labels.fieldSublabel, statement, caption].join(" "),
    formats: [HERO, SQUARE, MARK_FORMAT],
    draw: (format, timePrint, ref) => (
      <ThreeRegimesDiagram ref={ref} format={format as DiagramFormat} labels={labels} relationshipStatement={statement} caption={caption}
        showAnnotations={showAnnotations} colorScheme={colorScheme} structuralVariant={structuralVariant} timePrint={timePrint} />
    ),
    file: `xco-three-regimes-${structuralVariant}`,
    caption: (format) => CAPTIONS[format],
    ground: paletteHex.paper,
  };
}
