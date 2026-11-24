import { WIP } from "@/components/WIP";
import { diagram } from "@/lib/design-tokens";
import { DiagramsDemo } from "./DiagramsDemo";

const { structural, texture } = diagram.lineWeights;
const LINE_WEIGHTS = `Two line weights: ${structural}px structural · ${texture}px texture`;

const DIAGRAM_TYPES = [
  {
    id: "A",
    label: "Stack / Column",
    usage: "Ranked order, proportion, accumulation",
    rules: "Vertical or horizontal bars. Widths proportional to value. No baseline grid lines — only the bar edge reads.",
    example: "Risk weighting across three regimes; carbon budget allocation by sector.",
  },
  {
    id: "B",
    label: "2-axis scatter / matrix",
    usage: "Relationship between two independent variables",
    rules: "Dot or region placement on a plain field. Axis labels at extremes only. No tick marks, no grid lines — region defines meaning.",
    example: "Feasibility vs impact quadrant; state capacity vs ambition level.",
  },
  {
    id: "C",
    label: "3-axis isometric",
    usage: "Three-dimensional relationships shown in flat space",
    rules: "Isometric projection (30° / 120° angles). No perspective distortion. Each face reads as a 2D surface. Stack C diagrams only if each face is independent.",
    example: "Three Regimes as volumetric field; territory + trajectory + time.",
  },
  {
    id: "D",
    label: "Flow / sequence",
    usage: "Process, causation, dependency, decision",
    rules: "Left-to-right or top-to-bottom reading order. Solid lines = direct connection. Dotted lines = conditional / weak link. Merge dot (filled circle) at convergence points.",
    example: "Three Regimes diagram; policy cascade; intervention logic.",
  },
];

const DIAGRAM_RULES = [
  "Sans-serif only — no mono in diagram labels",
  "Regular weight only — no bold, no italic, annotations included",
  "Max two font sizes: label (≥ 13px) and annotation (10px minimum)",
  "Annotation minimum: 0.9375rem / 1.6 lh when rendered at web size",
  "No grey lines — ink or paper only; dotted lines are fine",
  `${LINE_WEIGHTS}, no others`,
  "No fills other than paper, ink, ocean, dusk, teal, navy, sand",
  "Label only what can be read — if the space is too small, omit or use Annotation",
];

const LABEL = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink";

export default function DiagramsPage() {
  return (
    <div className="doc-wrap py-12 space-y-16">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">Diagrams</h1>
        <WIP variant="version" />
      </header>

      <section className="max-w-2xl space-y-4">
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          The brand is the diagrams. The grammar defines the primitives.
          Every xCO diagram is assembled from these — no others.
        </p>
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          The visual language is raw and computational. Rectangles are the
          atomic unit. Hatching encodes weight. Lines are crisp and precise —
          no pretence of hand-drawing. The diagram should feel like it was
          built by people who take measurement seriously.
        </p>
        <ul className={`${LABEL} space-y-1 mt-4`}>
          <li>— {LINE_WEIGHTS}</li>
          <li>— Rectangle is the atomic unit — solid, hatched, or dashed border</li>
          <li>— Hatching density encodes character: sparse (open) → dense (constrained)</li>
          <li>— Three node types: Risk, Option, Field</li>
          <li>— One annotation style: upright Untitled Sans, marked uncertainty</li>
          <li>— One multi-solve signature: stacked ticks</li>
          <li>— One scale marker: faint rule, left-margin label</li>
        </ul>
      </section>

      <DiagramsDemo />

      {/* Diagram types */}
      <section>
        <h2 className={`${LABEL} tracking-widest uppercase mb-2`}>
          Diagram Types
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] mb-10 max-w-2xl">
          xCO uses four diagram types. Pick the one that matches the
          relationship in the data — not the one that looks most complex.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {DIAGRAM_TYPES.map((d) => (
            <div key={d.id} className="space-y-4">
              <div>
                <p className={`${LABEL} uppercase tracking-widest`}>{d.id}</p>
                <h3 className="doc-h2 text-xco-ink">{d.label}</h3>
                <p className={`${LABEL} mt-1`}>{d.usage}</p>
              </div>
              <p className="font-body text-[24px] text-xco-ink leading-[26px]">{d.rules}</p>
              <p className={LABEL}>e.g. {d.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Diagram style rules */}
      <section className="pb-12">
        <h2 className={`${LABEL} tracking-widest uppercase mb-6`}>
          Diagram Style Rules — All Types
        </h2>
        <ul className="space-y-3 max-w-2xl">
          {DIAGRAM_RULES.map((rule, i) => (
            <li key={i} className="flex items-baseline gap-4">
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk-ink shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-body text-[24px] text-xco-ink leading-[26px]">{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
