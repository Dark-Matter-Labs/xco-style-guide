import { WIP } from "@/components/WIP";
import { FibGrid } from "./FibGrid";

const FIB = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

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
  "Regular weight only — no bold, no italic",
  "Max two font sizes: label (≥ 13px) and annotation (10px minimum)",
  "Annotation minimum: 0.9375rem / 1.6 lh when rendered at web size",
  "No grey lines — ink or paper only; dotted lines are fine",
  "Max three line weights: hairline (0.5px), structural (1.5px), emphasis (2.5px)",
  "No fills other than paper, ink, ocean, dusk, teal, navy, sand",
  "Label only what can be read — if the space is too small, omit or use Annotation",
];

export default function GridPage() {
  return (
    <div className="space-y-20">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="font-display text-[3rem] leading-[1.1]">Grid</h1>
        <WIP variant="v0.1" />
      </header>

      {/* Principle */}
      <section className="max-w-2xl space-y-4">
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
          All proportions derive from a single ratio: φ = 1.618. The golden
          ratio is not a style choice — it is a structural constraint that makes
          every proportion decision self-similar. Apply it to page grids,
          canvas dimensions, column splits, and spacing.
        </p>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
          The same ratio governs the Fibonacci sequence. Consecutive Fibonacci
          numbers converge to φ, making integer spacing values (8, 13, 21, 34…)
          naturally proportional without needing to calculate.
        </p>
      </section>

      {/* The ratio */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          The Ratio
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-[61.8fr_38.2fr] gap-12 mb-12">
          <div className="space-y-4">
            <p className="font-display text-[3rem] leading-[1.1]">φ = 1.618</p>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
              Major — 61.8%
            </p>
            <div className="h-16 bg-xco-ink w-full" style={{ maxWidth: "61.8%" }} />
          </div>
          <div className="space-y-4">
            <p className="font-display text-[3rem] leading-[1.1]">1 / φ = 0.618</p>
            <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
              Minor — 38.2%
            </p>
            <div className="h-16 bg-xco-ink w-full" style={{ maxWidth: "38.2%" }} />
          </div>
        </div>

        {/* Visual golden ratio bar */}
        <div className="space-y-3">
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Column split — this page
          </p>
          <div className="flex w-full h-12">
            <div className="flex-[61.8] bg-xco-ink flex items-center px-4">
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-paper">61.8fr — major</span>
            </div>
            <div className="flex-[38.2] flex items-center px-4">
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">38.2fr — minor</span>
            </div>
          </div>
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
            Tailwind: <span className="text-xco-dusk">grid-cols-[61.8fr_38.2fr]</span>
          </p>
        </div>
      </section>

      {/* Interactive subdivision */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Recursive Subdivision
        </h2>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7] max-w-2xl mb-8">
          Each step cuts the remaining golden rectangle into a square and a new golden rectangle.
          The spiral arc is the same curve at every scale — self-similar, inward forever.
        </p>
        <FibGrid />
      </section>

      {/* Fibonacci sequence */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Fibonacci Spacing Scale
        </h2>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7] max-w-2xl mb-8">
          Use Fibonacci numbers as px/rem spacing steps. Each value is the sum
          of the previous two — consecutive ratios converge to φ. Skip 1 and 2
          for practical use; start at 3px for hairlines.
        </p>
        <div className="flex items-end gap-0 flex-wrap">
          {FIB.filter((n) => n >= 3).map((n) => (
            <div key={n} className="flex flex-col items-center gap-2 mr-6 mb-6">
              <div
                className="bg-xco-ink w-4"
                style={{ height: Math.min(n * 2, 120) }}
              />
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">{n}</span>
            </div>
          ))}
        </div>
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-4">
          Sequence: {FIB.join(", ")} …
        </p>
      </section>

      {/* Document canvas */}
      <section className="max-w-2xl space-y-4">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-6">
          Document Canvases
        </h2>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
          Social card 1200 × 630: ratio is 1200/630 = 1.905 — close to φ².
          Slide 16:9 (1920 × 1080): ratio 1.778. A4 paper 297 × 210mm: ratio 1.414 (√2 — ISO standard).
          Apply the golden column split within each canvas: left margin at 38.2%, right at 61.8%.
        </p>
        <div className="space-y-6 mt-6">
          {[
            { label: "Social card", w: 1200, h: 630, note: "1200 × 630 — near φ²" },
            { label: "Square",      w: 1200, h: 1200, note: "1200 × 1200 — 1:1" },
            { label: "Paper Cover", w: 794,  h: 1123, note: "A4 — √2 ratio" },
          ].map(({ label, w, h, note }) => {
            const ratio = w / h;
            const pct = Math.min(ratio / 2, 1) * 100;
            return (
              <div key={label} className="space-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink w-28 shrink-0">{label}</span>
                  <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">{note}</span>
                </div>
                <div className="h-3 flex w-full max-w-xs">
                  <div className="flex-[61.8] bg-xco-ink" />
                  <div className="flex-[38.2] bg-xco-ink/20" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Diagram types */}
      <section>
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-2">
          Diagram Types
        </h2>
        <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7] mb-10 max-w-2xl">
          xCO uses four diagram types. Pick the one that matches the
          relationship in the data — not the one that looks most complex.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {DIAGRAM_TYPES.map((d) => (
            <div key={d.id} className="space-y-4">
              <div>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink uppercase tracking-widest">
                  {d.id}
                </p>
                <h3 className="font-display text-[3rem] leading-[1.1]">{d.label}</h3>
                <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink mt-1">
                  {d.usage}
                </p>
              </div>
              <p className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
                {d.rules}
              </p>
              <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                e.g. {d.example}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Diagram style rules */}
      <section className="pb-12">
        <h2 className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-6">
          Diagram Style Rules — All Types
        </h2>
        <ul className="space-y-3 max-w-2xl">
          {DIAGRAM_RULES.map((rule, i) => (
            <li key={i} className="flex items-baseline gap-4">
              <span className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-body text-[1.375rem] text-xco-ink leading-[1.7]">
                {rule}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
