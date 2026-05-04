import { WIP } from "@/components/WIP";
import { DiagramsDemo } from "./DiagramsDemo";

export default function DiagramsPage() {
  return (
    <div className="space-y-16">
      <header className="flex items-baseline justify-between border-b border-xco-ink/[0.12] pb-6">
        <h1 className="font-display text-4xl">Diagrammatic Grammar</h1>
        <WIP variant="v0.1" />
      </header>

      <section className="max-w-2xl space-y-4">
        <p className="font-body text-[1.375rem] text-xco-ink leading-relaxed">
          The brand is the diagrams. The grammar defines seven primitives. Every
          xCO diagram is assembled from these — no others.
        </p>
        <p className="font-body text-xco-ink-muted leading-relaxed">
          The line must not be smooth. The jitter reads as{" "}
          <em>measurement noise</em>, not hand-drawing. Clean enough to read
          as data, rough enough to read as honest.
        </p>
        <ul className="font-mono text-sm text-xco-ink-muted space-y-1 mt-4">
          <li>— Two line weights: 1.5px structural, 0.5px annotation (dashed)</li>
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
