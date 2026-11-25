import Link from "next/link";
import { WIP } from "@/components/WIP";
import { FibGrid } from "./FibGrid";

const FIB = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

export default function GridPage() {
  return (
    <div className="doc-wrap py-12 space-y-20">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="doc-display text-xco-ink">Grid</h1>
        <WIP variant="version" />
      </header>

      {/* Principle */}
      <section className="max-w-2xl space-y-4">
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          All proportions derive from a single ratio: φ = 1.618. The golden
          ratio is not a style choice — it is a structural constraint that makes
          every proportion decision self-similar. Apply it to page grids,
          canvas dimensions, column splits, and spacing.
        </p>
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          The same ratio governs the Fibonacci sequence. Consecutive Fibonacci
          numbers converge to φ, making integer spacing values (8, 13, 21, 34…)
          naturally proportional without needing to calculate.
        </p>
      </section>

      {/* The ratio */}
      <section>
        <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          The Ratio
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-[61.8fr_38.2fr] gap-12 mb-12">
          <div className="space-y-4">
            <p className="doc-h2 text-xco-ink">φ = 1.618</p>
            <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">
              Major — 61.8%
            </p>
            <div className="h-16 bg-xco-ink w-full" style={{ maxWidth: "61.8%" }} />
          </div>
          <div className="space-y-4">
            <p className="doc-h2 text-xco-ink">1 / φ = 0.618</p>
            <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">
              Minor — 38.2%
            </p>
            <div className="h-16 bg-xco-ink w-full" style={{ maxWidth: "38.2%" }} />
          </div>
        </div>

        {/* Visual golden ratio bar */}
        <div className="space-y-3">
          <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase">
            Column split — this page
          </p>
          <div className="flex w-full h-12">
            <div className="flex-[61.8] bg-xco-ink flex items-center px-4">
              <span className="font-mono text-[0.9375rem] leading-[1.6] text-xco-paper">61.8fr — major</span>
            </div>
            <div className="flex-[38.2] flex items-center px-4">
              <span className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">38.2fr — minor</span>
            </div>
          </div>
          <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">
            Tailwind: <span className="text-xco-dusk-ink">grid-cols-[61.8fr_38.2fr]</span>
          </p>
        </div>
      </section>

      {/* Interactive subdivision */}
      <section>
        <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Recursive Subdivision
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl mb-8">
          Each step cuts the remaining golden rectangle into a square and a new golden rectangle.
          The spiral arc is the same curve at every scale — self-similar, inward forever.
        </p>
        <FibGrid />
      </section>

      {/* Fibonacci sequence */}
      <section>
        <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-8">
          Fibonacci Spacing Scale
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px] max-w-2xl mb-8">
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
              <span className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">{n}</span>
            </div>
          ))}
        </div>
        <p className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink mt-4">
          Sequence: {FIB.join(", ")} …
        </p>
      </section>

      {/* Document canvas */}
      <section className="max-w-2xl space-y-4">
        <h2 className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink tracking-widest uppercase mb-6">
          Document Canvases
        </h2>
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
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
                  <span className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink w-28 shrink-0">{label}</span>
                  <span className="font-mono text-[0.9375rem] leading-[1.6] text-xco-ink">{note}</span>
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

      {/* Diagrams live on their own page */}
      <section className="max-w-2xl pb-12">
        <p className="font-body text-[24px] text-xco-ink leading-[26px]">
          Diagram types and style rules are on{" "}
          <Link href="/diagrams" className="underline underline-offset-2 hover:text-xco-dusk-ink">
            Diagrams
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
