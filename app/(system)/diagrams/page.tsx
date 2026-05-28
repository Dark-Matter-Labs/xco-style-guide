import { WIP } from "@/components/WIP";
import { DiagramsDemo } from "./DiagramsDemo";

export default function DiagramsPage() {
  return (
    <div className="space-y-16">
      <header className="flex items-baseline justify-between pb-6">
        <h1 className="font-display text-[60px] leading-[60px]">Diagrammatic Grammar</h1>
        <WIP variant="v0.1" />
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
        <ul className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink space-y-1 mt-4">
          <li>— Two line weights: 1.5px structural · 0.75px texture</li>
          <li>— Rectangle is the atomic unit — solid, hatched, or dashed border</li>
          <li>— Hatching density encodes character: sparse (open) → dense (constrained)</li>
          <li>— Three node types: Risk, Option, Field</li>
          <li>— One annotation style: DM Mono italic, marked uncertainty</li>
          <li>— One multi-solve signature: stacked ticks</li>
          <li>— One scale marker: faint rule, left-margin label</li>
        </ul>
      </section>

      <DiagramsDemo />
    </div>
  );
}
