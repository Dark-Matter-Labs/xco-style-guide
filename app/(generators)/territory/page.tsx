import { TerritoryGenerator } from "./TerritoryGenerator";

export const metadata = {
  title: "Territory — xCO Style Guide",
};

export default function TerritoryPage() {
  return (
    <div className="space-y-10">
      <header className="border-b border-xco-ink/[0.12] pb-6 space-y-2">
        <h1 className="font-display text-4xl">Territory</h1>
        <p className="font-mono text-xs text-xco-ink-muted">
          Weighted treemap — cell area encodes relative importance
        </p>
        <p className="font-body text-[1.375rem] text-xco-ink leading-relaxed max-w-2xl">
          A squarified treemap where each concept is given a cell proportional
          to its weight. Use it to map option space, portfolio distribution,
          or concept priority across the three regimes.
        </p>
      </header>
      <TerritoryGenerator />
    </div>
  );
}
